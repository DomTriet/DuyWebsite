import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../services/log.service';

/**
 * Lấy bản dịch của một Entity (Property/Project). Có tích hợp Fallback.
 */
export const getTranslation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entity_type, entity_id, lang_code } = req.query;

    if (!entity_type || !entity_id || !lang_code) {
      res.status(400).json({ error: 'Missing required parameters (entity_type, entity_id, lang_code)', code: 400 });
      return;
    }

    // 1. Tìm bản dịch trong DB
    const { data: translation, error } = await supabase
      .from('translations')
      .select('*')
      .eq('entity_type', entity_type as string)
      .eq('entity_id', entity_id as string)
      .eq('lang_code', lang_code as string)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 là lỗi không tìm thấy dòng nào
      throw error;
    }

    // 2. CƠ CHẾ FALLBACK: Nếu không có bản dịch hoặc bản dịch CƯA ĐƯỢC DUYỆT
    if (!translation || !translation.is_approved) {
      let originalData = null;
      
      // Tự động lấy bản gốc tiếng Việt từ bảng tương ứng làm fallback
      if (entity_type === 'property') {
        const { data } = await supabase.from('properties').select('title, description').eq('id', entity_id as string).single();
        originalData = data;
      } else if (entity_type === 'project') {
        const { data } = await supabase.from('projects').select('name, description').eq('id', entity_id as string).single();
        if (data) originalData = { title: data.name, description: data.description };
      } else if (entity_type === 'blog') {
        const { data } = await supabase.from('blogs').select('title, content_blocks').eq('id', entity_id as string).single();
        if (data) originalData = { title: data.title, content_blocks: data.content_blocks };
      } else if (entity_type === 'project_section') {
        const { data } = await supabase.from('project_sections').select('title, content').eq('id', entity_id as string).single();
        if (data) originalData = { title: data.title, description: data.content };
      }

      res.status(200).json({
        status: 'success', 
        message: 'Bản dịch chưa sẵn sàng. Fallback về ngôn ngữ gốc.',
        fallback: true,
        data: originalData 
      });
      return;
    }

    res.status(200).json({ status: 'success', fallback: false, data: translation.translation_data });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách bản dịch dành cho Admin — GOM NHÓM theo từng entity.
 * Mỗi nhóm gồm: bản gốc tiếng Việt (source) + các bản dịch (en, zh, ko theo thứ tự).
 * Chỉ trả về nhóm có ít nhất 1 bản dịch chưa được duyệt.
 */
export const getPendingTranslations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Lấy toàn bộ bản dịch (bảng này quy mô nhỏ trong phạm vi ứng dụng)
    const { data: allRows, error } = await supabase
      .from('translations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // 2. Gom nhóm theo entity_type + entity_id
    const groupsMap = new Map<string, { entity_type: string; entity_id: string; langs: any[] }>();
    for (const row of allRows || []) {
      const key = `${row.entity_type}::${row.entity_id}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { entity_type: row.entity_type, entity_id: row.entity_id, langs: [] });
      }
      groupsMap.get(key)!.langs.push(row);
    }

    // 3. Chỉ giữ nhóm có ≥1 bản dịch chờ duyệt
    let groups = [...groupsMap.values()].filter(g => g.langs.some(l => !l.is_approved));

    // 4. Lấy bản gốc tiếng Việt cho từng nhóm (batch theo loại entity)
    const idsByType: Record<string, string[]> = {};
    for (const g of groups) (idsByType[g.entity_type] ||= []).push(g.entity_id);

    const sourceMap: Record<string, any> = {};
    const fetchSource = async (type: string, table: string, select: string, mapFn: (d: any) => any) => {
      const ids = idsByType[type];
      if (!ids?.length) return;
      const { data } = await supabase.from(table).select(select).in('id', ids);
      for (const d of (data as any[]) || []) sourceMap[`${type}::${d.id}`] = mapFn(d);
    };
    await fetchSource('property',        'properties',       'id, title, description',     d => ({ title: d.title, description: d.description }));
    await fetchSource('project',         'projects',         'id, name, description',      d => ({ title: d.name, description: d.description }));
    await fetchSource('blog',            'blogs',            'id, title, content_blocks',  d => ({ title: d.title, content_blocks: d.content_blocks }));
    await fetchSource('project_section', 'project_sections', 'id, title, content',         d => ({ title: d.title, description: d.content }));

    // 5. Đính kèm source + sắp xếp ngôn ngữ theo en → zh → ko
    const order: Record<string, number> = { en: 0, zh: 1, ko: 2 };
    const data = groups.map(g => ({
      entity_type: g.entity_type,
      entity_id: g.entity_id,
      source: sourceMap[`${g.entity_type}::${g.entity_id}`] || null,
      langs: g.langs.sort((a, b) => (order[a.lang_code] ?? 9) - (order[b.lang_code] ?? 9))
    }));

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin duyệt bản dịch máy (Approve)
 */
export const approveTranslation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const { data, error } = await supabase
      .from('translations')
      .update({ is_approved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (adminId) await logAction(adminId, 'APPROVE_TRANSLATION', `Approved translation ID: ${id}`);

    res.status(200).json({ status: 'success', message: 'Duyệt bản dịch thành công!', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật nội dung bản dịch (Admin tự sửa lại nếu máy dịch sai và tự động duyệt)
 */
export const updateTranslation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { translation_data } = req.body;
    const adminId = req.user?.id;

    const { data, error } = await supabase.from('translations').update({ translation_data, is_approved: true }).eq('id', id).select().single();

    if (error) throw error;
    if (adminId) await logAction(adminId, 'UPDATE_TRANSLATION', `Updated and approved translation ID: ${id}`);

    res.status(200).json({ status: 'success', message: 'Cập nhật và duyệt bản dịch thành công!', data });
  } catch (error) {
    next(error);
  }
};