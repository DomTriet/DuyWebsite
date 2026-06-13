import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateSlug, makeUniqueSlug } from '../utils/slug.util';
import { logAction } from '../services/log.service';
import { autoTranslateAllLangs } from '../services/translation.service';

/**
 * Lấy danh sách loại hình Bất động sản (Categories)
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo danh mục mới (Chỉ dành cho Admin)
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Tên danh mục là bắt buộc', code: 400 });
      return;
    }
    
    const slug = generateSlug(name);
    const { data, error } = await supabase.from('categories').insert([{ name, slug }]).select().single();
    
    if (error) throw error;
    if (req.user?.id) await logAction(req.user.id, 'CREATE_CATEGORY', `Created category: ${name}`);
    
    res.status(201).json({ status: 'success', message: 'Tạo danh mục thành công', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật tên danh mục (Chỉ dành cho Admin)
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updates: any = {};
    
    if (name) {
      updates.name = name;
      updates.slug = generateSlug(name);
    }
    
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (req.user?.id) await logAction(req.user.id, 'UPDATE_CATEGORY', `Updated category ID: ${id}`);
    
    res.status(200).json({ status: 'success', message: 'Cập nhật danh mục thành công', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa danh mục (Chỉ dành cho Admin)
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Lưu ý: Trong DB có ràng buộc khóa ngoại (Foreign Key) "ON DELETE SET NULL"
    // Nghĩa là nếu xóa danh mục, các BĐS đang thuộc danh mục này sẽ có category_id = null
    const { error } = await supabase.from('categories').delete().eq('id', id);
    
    if (error) throw error;
    if (req.user?.id) await logAction(req.user.id, 'DELETE_CATEGORY', `Deleted category ID: ${id}`);
    
    res.status(200).json({ status: 'success', message: 'Xóa danh mục thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách Bất động sản — hỗ trợ full search + filter JSONB + sort
 *
 * Query params:
 *   search, min_price, max_price, category_id, project_id
 *   bedrooms, min_area, max_area, property_type   ← JSONB attributes
 *   sort: newest(default) | oldest | price_asc | price_desc
 *   page, limit
 *   manage, trash (admin/agent only)
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let currentUser = user;
    const {
      manage, trash,
      category_id, project_id,
      min_price, max_price,
      search,
      bedrooms, min_area, max_area, property_type,
      sort,
      page, limit
    } = req.query;

    // Giải mã Token thủ công nếu API public (không qua verifyToken middleware)
    if (!currentUser && req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const { data: authData } = await supabase.auth.getUser(token);
        if (authData?.user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
          currentUser = { id: authData.user.id, role: profile?.role } as any;
        }
      }
    }

    let query = supabase
      .from('properties')
      .select(
        '*, projects(id, name, theme_id, slug), categories(name), property_media(media_url, is_thumbnail), agent:profiles!properties_agent_id_fkey(id, full_name, phone, email, avatar_url)',
        { count: 'exact' }
      );

    // ── Phân luồng manage / public ──
    if (manage === 'true') {
      if (currentUser?.role === 'agent') {
        query = query.or(`agent_id.eq.${currentUser.id},created_by.eq.${currentUser.id}`);
      }
      query = query.eq('is_deleted', trash === 'true');
    } else {
      query = query.eq('is_deleted', false).eq('status', 'available');
    }

    // ── Bộ lọc cơ bản ──
    if (category_id) query = query.eq('category_id', category_id);
    if (project_id)  query = query.eq('project_id', project_id);
    if (min_price)   query = query.gte('price', Number(min_price));
    if (max_price)   query = query.lte('price', Number(max_price));

    // ── Full-text search: title + description ──
    if (search) {
      const term = (search as string).trim();
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // ── JSONB attributes filter ──
    // Supabase hỗ trợ filter trực tiếp trên JSONB bằng toán tử ->>
    if (bedrooms) {
      const bed = Number(bedrooms);
      if (bed >= 4) {
        // 4+ phòng ngủ
        query = (query as any).gte('attributes->>bedrooms', '4');
      } else {
        query = (query as any).eq('attributes->>bedrooms', String(bed));
      }
    }
    if (min_area) {
      query = (query as any).gte('attributes->>area', String(Number(min_area)));
    }
    if (max_area) {
      query = (query as any).lte('attributes->>area', String(Number(max_area)));
    }
    if (property_type) {
      query = (query as any).eq('attributes->>property_type', property_type as string);
    }

    // ── Sắp xếp ──
    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'oldest':     query = query.order('created_at', { ascending: true }); break;
      default:           query = query.order('created_at', { ascending: false }); // newest
    }

    // ── Phân trang ──
    const pageNum  = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, parseInt(limit as string) || 12);
    const from = (pageNum - 1) * limitNum;
    const to   = from + limitNum - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    res.status(200).json({
      status: 'success',
      data,
      meta: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil((count || 0) / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gợi ý tìm kiếm (Autocomplete) — trả về title + slug nhanh
 * GET /properties/suggestions?q=keyword&limit=6
 */
export const getPropertySuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, limit } = req.query;
    if (!q || (q as string).trim().length < 2) {
      res.status(200).json({ status: 'success', data: [] });
      return;
    }

    const term = (q as string).trim();
    const limitNum = Math.min(10, parseInt(limit as string) || 6);

    const { data, error } = await supabase
      .from('properties')
      .select('id, title, slug, price, property_media(media_url, is_thumbnail)')
      .eq('is_deleted', false)
      .ilike('title', `%${term}%`)
      .order('created_at', { ascending: false })
      .limit(limitNum);

    if (error) throw error;
    res.status(200).json({ status: 'success', data: data || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Facets — trả về các nhóm filter kèm số lượng để hiển thị trên UI
 * GET /properties/facets?project_id=...
 */
export const getPropertyFacets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { project_id } = req.query;

    let query = supabase
      .from('properties')
      .select('price, attributes')
      .eq('is_deleted', false)
      .eq('status', 'available');

    if (project_id) query = query.eq('project_id', project_id);

    const { data, error } = await query;
    if (error) throw error;

    const props = data || [];

    // Tính toán facets từ data
    const prices = props.map(p => p.price).filter(Boolean);
    const bedroomCounts: Record<string, number> = {};
    const areaBuckets = { '0-50': 0, '50-100': 0, '100-200': 0, '200+': 0 };

    for (const p of props) {
      const bed = p.attributes?.bedrooms;
      if (bed) bedroomCounts[String(bed)] = (bedroomCounts[String(bed)] || 0) + 1;

      const area = Number(p.attributes?.area);
      if (area > 0) {
        if      (area < 50)  areaBuckets['0-50']++;
        else if (area < 100) areaBuckets['50-100']++;
        else if (area < 200) areaBuckets['100-200']++;
        else                 areaBuckets['200+']++;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        total: props.length,
        price: {
          min: prices.length ? Math.min(...prices) : 0,
          max: prices.length ? Math.max(...prices) : 0,
        },
        bedrooms: bedroomCounts,
        area: areaBuckets,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết 1 Bất động sản theo Slug
 */
export const getPropertyBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('properties')
      .select('*, projects(name, theme_id), categories(name), property_media(media_url, is_thumbnail), agent:profiles!properties_agent_id_fkey(id, full_name, phone, email, avatar_url), property_sections(id, section_type, title, content, image_url, metadata, sort_order)')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng mới Bất động sản (Agent / Admin)
 */
export const createProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { project_id, category_id, title, description, price, attributes, media, detail_theme, address, map_embed_url } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    // 1. Tạo slug từ Tiêu đề, tự động thêm -2/-3 nếu trùng
    const baseSlug = generateSlug(title);
    const uniqueSlug = await makeUniqueSlug('properties', baseSlug);

    // 2. Xác định Agent phụ trách: Nếu người tạo là Agent thì tự gán vào bài. Nếu là Admin thì có thể gán cho Agent khác.
    const agent_id = role === 'agent' ? userId : req.body.agent_id;

    // 3. Insert dữ liệu vào Supabase, parse attributes dưới dạng JSONB
    const { data: property, error } = await supabase
      .from('properties')
      .insert([{
        project_id, category_id, title, slug: uniqueSlug, description, price,
        attributes: typeof attributes === 'string' ? JSON.parse(attributes) : (attributes || {}),
        detail_theme: detail_theme || null,
        address: address || null,
        map_embed_url: map_embed_url || null,
        created_by: userId,
        agent_id: agent_id
      }])
      .select()
      .single();

    if (error) throw error;

    // 4. Ghi log hệ thống
    if (userId) await logAction(userId, 'CREATE_PROPERTY', `Created property: ${title}`);

    // 4.5. Lưu danh sách link ảnh/video vào bảng property_media
    if (media && Array.isArray(media) && media.length > 0) {
      const mediaData = media.map((url: string, index: number) => ({
        property_id: property.id,
        media_url: url,
        media_type: /\.(mp4|webm|mov|avi|mkv)$/i.test(url) ? 'video' : 'image',
        is_thumbnail: index === 0
      }));
      await supabase.from('property_media').insert(mediaData);
    }

    // 5. [Background Task] Dịch tự động sang EN/KO/ZH sau khi lưu bản gốc
    setTimeout(() => {
      autoTranslateAllLangs('property', property.id, { title, description: description || '' }, supabase);
    }, 0);

    res.status(201).json({ status: 'success', data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật Bất động sản
 */
export const updateProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // Tách media ra khỏi updates để tránh lỗi khi update bảng properties
    const { media, ...updates } = req.body;
    const userId = req.user?.id;

    // Cập nhật Slug nếu đổi tiêu đề
    if (updates.title && !updates.slug) {
      updates.slug = await makeUniqueSlug('properties', generateSlug(updates.title), id);
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('properties').update(updates).eq('id', id);
      if (error) throw error;
    }

    // Nếu có truyền thêm hình ảnh mới khi update
    if (media && Array.isArray(media) && media.length > 0) {
      // Lấy danh sách ảnh đã có trong DB để không bị insert trùng
      const { data: existingMedia } = await supabase.from('property_media').select('media_url').eq('property_id', id);
      const existingUrls = existingMedia?.map(m => m.media_url) || [];
      
      const mediaData = media
        .filter((url: string) => !existingUrls.includes(url))
        .map((url: string) => ({
          property_id: id,
          media_url: url,
          media_type: /\.(mp4|webm|mov|avi|mkv)$/i.test(url) ? 'video' : 'image',
          is_thumbnail: false
        }));
        
      if (mediaData.length > 0) await supabase.from('property_media').insert(mediaData);
    }

    // Lấy lại data mới nhất sau khi update để trả về cho Client
    const { data } = await supabase.from('properties').select('*, property_media(*)').eq('id', id).single();

    if (userId) await logAction(userId, 'UPDATE_PROPERTY', `Updated property ID: ${id}`);

    // Re-translate nếu title hoặc description thay đổi
    if (updates.title || updates.description) {
      const titleToTranslate = updates.title ?? data?.title ?? '';
      const descToTranslate = updates.description ?? data?.description ?? '';
      setTimeout(() => {
        autoTranslateAllLangs('property', id, { title: titleToTranslate, description: descToTranslate }, supabase);
      }, 0);
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa Bất động sản (Soft Delete)
 */
export const deleteProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Áp dụng Soft Delete: cập nhật is_deleted = true thay vì xóa dòng
    const { error } = await supabase.from('properties').update({ is_deleted: true }).eq('id', id);
    if (error) throw error;

    if (userId) await logAction(userId, 'DELETE_PROPERTY', `Soft deleted property ID: ${id}`);

    res.status(200).json({ status: 'success', message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa 1 hình ảnh của Bất động sản
 */
export const deletePropertyMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { mediaId } = req.params;
    const userId = req.user?.id;

    const { error } = await supabase.from('property_media').delete().eq('id', mediaId);
    if (error) throw error;

    if (userId) await logAction(userId, 'DELETE_PROPERTY_MEDIA', `Deleted media ID: ${mediaId}`);

    res.status(200).json({ status: 'success', message: 'Đã xóa hình ảnh thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt một hình ảnh làm ảnh đại diện (Thumbnail) cho Bất động sản
 */
export const setPropertyThumbnail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { mediaId } = req.params;
    const userId = req.user?.id;

    // 1. Lấy thông tin media hiện tại để biết property_id
    const { data: media, error: fetchError } = await supabase.from('property_media').select('property_id').eq('id', mediaId).single();
    if (fetchError || !media) throw fetchError;

    const propertyId = media.property_id;

    // 2. Reset toàn bộ ảnh của BĐS này về is_thumbnail = false
    await supabase.from('property_media').update({ is_thumbnail: false }).eq('property_id', propertyId);
    
    // 3. Set ảnh được chọn làm thumbnail
    const { error: updateError } = await supabase.from('property_media').update({ is_thumbnail: true }).eq('id', mediaId);
    if (updateError) throw updateError;

    if (userId) await logAction(userId, 'SET_THUMBNAIL', `Set media ID: ${mediaId} as thumbnail for property ID: ${propertyId}`);

    res.status(200).json({ status: 'success', message: 'Đã đặt làm ảnh đại diện thành công' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// Property Sections CRUD
// ─────────────────────────────────────────────────────────────

export const getPropertySections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { data, error } = await supabase
      .from('property_sections')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const createPropertySection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { section_type, title, content, image_url, metadata, sort_order } = req.body;
    if (!title?.trim()) { res.status(400).json({ error: 'Tiêu đề là bắt buộc' }); return; }
    const { data, error } = await supabase
      .from('property_sections')
      .insert([{ property_id: propertyId, section_type, title, content, image_url, metadata: metadata || {}, sort_order: sort_order ?? 0 }])
      .select().single();
    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const updatePropertySection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const { section_type, title, content, image_url, metadata, sort_order } = req.body;
    const { data, error } = await supabase
      .from('property_sections')
      .update({ section_type, title, content, image_url, metadata, sort_order })
      .eq('id', sectionId)
      .select().single();
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const deletePropertySection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const { error } = await supabase.from('property_sections').delete().eq('id', sectionId);
    if (error) throw error;
    res.status(200).json({ status: 'success', message: 'Đã xóa section' });
  } catch (error) { next(error); }
};