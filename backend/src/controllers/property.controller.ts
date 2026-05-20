import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateSlug } from '../utils/slug.util';
import { logAction } from '../services/log.service';
import { translateText } from '../services/translation.service';

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
 * Lấy danh sách Bất động sản
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let currentUser = user;
    const { manage, trash, category_id, project_id, min_price, max_price, search, page, limit } = req.query;

    // Giải mã Token thủ công nếu API GET /properties là public (không chạy qua Middleware verifyToken)
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
      .select('*, projects(name, theme_id), categories(name), property_media(media_url, is_thumbnail), agent:profiles!properties_agent_id_fkey(id, full_name, phone, email, avatar_url)', { count: 'exact' });

    // Phân luồng: Nếu gọi từ trang Quản trị (Frontend truyền manage=true)
    if (manage === 'true') {
      if (currentUser?.role === 'agent') {
        // Fix lỗi data cũ: Tìm cả bài do Agent đăng (created_by) hoặc được phân công (agent_id)
        query = query.or(`agent_id.eq.${currentUser.id},created_by.eq.${currentUser.id}`);
      }
      
      // Cho phép lọc theo trạng thái Thùng rác (Trash)
      if (trash === 'true') {
        query = query.eq('is_deleted', true);
      } else {
        query = query.eq('is_deleted', false);
      }
    } else {
      // Dành cho Public Website: Chỉ hiển thị bài đang active
      query = query.eq('is_deleted', false);
    }

    // Bộ lọc tìm kiếm cho khách hàng
    if (category_id) query = query.eq('category_id', category_id);
    if (project_id) query = query.eq('project_id', project_id);
    if (min_price) query = query.gte('price', min_price);
    if (max_price) query = query.lte('price', max_price);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    // Logic Phân trang (Pagination)
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    res.status(200).json({ 
      status: 'success', 
      data, 
      meta: { total: count, page: pageNum, limit: limitNum } 
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
      .select('*, projects(name, theme_id), categories(name), property_media(media_url, is_thumbnail), agent:profiles!properties_agent_id_fkey(id, full_name, phone, email, avatar_url)')
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
    const { project_id, category_id, title, description, price, attributes, media } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    // 1. Tạo slug từ Tiêu đề + ID ngẫu nhiên để tránh trùng lặp
    const baseSlug = generateSlug(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    // 2. Xác định Agent phụ trách: Nếu người tạo là Agent thì tự gán vào bài. Nếu là Admin thì có thể gán cho Agent khác.
    const agent_id = role === 'agent' ? userId : req.body.agent_id;

    // 3. Insert dữ liệu vào Supabase, parse attributes dưới dạng JSONB
    const { data: property, error } = await supabase
      .from('properties')
      .insert([{
        project_id, category_id, title, slug: uniqueSlug, description, price,
        attributes: typeof attributes === 'string' ? JSON.parse(attributes) : (attributes || {}),
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
        is_thumbnail: index === 0 // Ảnh đầu tiên được chọn làm thumbnail mặc định
      }));
      await supabase.from('property_media').insert(mediaData);
    }

    // 5. [Background Task] Gọi API dịch thuật ngầm ngay sau khi lưu bản gốc (Không dùng await để response trả về nhanh)
    setTimeout(async () => {
      try {
        const titleEn = await translateText(title, 'en');
        const descEn = await translateText(description || '', 'en');
        
        // Lưu bản dịch vào bảng translations
        await supabase.from('translations').insert([{ 
          entity_type: 'property', entity_id: property.id, lang_code: 'en', 
          translation_data: { title: titleEn, description: descEn } 
        }]);
      } catch (e) {
        console.error('[Background] Translation error:', e);
      }
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
      updates.slug = `${generateSlug(updates.title)}-${Date.now().toString().slice(-5)}`;
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
        .map((url: string) => ({ property_id: id, media_url: url, is_thumbnail: false }));
        
      if (mediaData.length > 0) await supabase.from('property_media').insert(mediaData);
    }

    // Lấy lại data mới nhất sau khi update để trả về cho Client
    const { data } = await supabase.from('properties').select('*, property_media(*)').eq('id', id).single();

    if (userId) await logAction(userId, 'UPDATE_PROPERTY', `Updated property ID: ${id}`);

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