import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../services/log.service';
import { autoTranslateAllLangs } from '../services/translation.service';

/**
 * Lấy danh sách section nội dung của 1 dự án (Public)
 * GET /projects/:id/sections
 */
export const getProjectSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới 1 section cho dự án (Admin)
 * POST /projects/:id/sections
 */
export const createProjectSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // project_id
    const { section_type, title, content, image_url, metadata, sort_order } = req.body;
    const userId = req.user?.id;

    if (!section_type || !title) {
      res.status(400).json({ error: 'section_type và title là bắt buộc', code: 400 });
      return;
    }

    const { data, error } = await supabase
      .from('project_sections')
      .insert([{
        project_id: id,
        section_type,
        title,
        content: content || null,
        image_url: image_url || null,
        metadata: metadata || {},
        sort_order: sort_order ?? 0
      }])
      .select()
      .single();

    if (error) throw error;
    if (userId) await logAction(userId, 'CREATE_PROJECT_SECTION', `Created section "${title}" for project ${id}`);

    // Background: dịch tự động tiêu đề + nội dung sang EN/KO/ZH
    setTimeout(() => {
      autoTranslateAllLangs('project_section', data.id, { title, description: content || '' }, supabase);
    }, 0);

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật 1 section (Admin)
 * PUT /projects/sections/:sectionId
 */
export const updateProjectSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const { section_type, title, content, image_url, metadata, sort_order } = req.body;
    const userId = req.user?.id;

    const updates: any = {};
    if (section_type !== undefined) updates.section_type = section_type;
    if (title !== undefined)        updates.title = title;
    if (content !== undefined)      updates.content = content;
    if (image_url !== undefined)    updates.image_url = image_url;
    if (metadata !== undefined)     updates.metadata = metadata;
    if (sort_order !== undefined)   updates.sort_order = sort_order;

    const { data, error } = await supabase
      .from('project_sections')
      .update(updates)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    if (userId) await logAction(userId, 'UPDATE_PROJECT_SECTION', `Updated section ID: ${sectionId}`);

    // Re-translate nếu tiêu đề hoặc nội dung thay đổi
    if (updates.title !== undefined || updates.content !== undefined) {
      const titleToTranslate = updates.title ?? data?.title ?? '';
      const contentToTranslate = updates.content ?? data?.content ?? '';
      setTimeout(() => {
        autoTranslateAllLangs('project_section', sectionId, { title: titleToTranslate, description: contentToTranslate }, supabase);
      }, 0);
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa 1 section (Admin)
 * DELETE /projects/sections/:sectionId
 */
export const deleteProjectSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const userId = req.user?.id;

    const { error } = await supabase.from('project_sections').delete().eq('id', sectionId);
    if (error) throw error;
    if (userId) await logAction(userId, 'DELETE_PROJECT_SECTION', `Deleted section ID: ${sectionId}`);

    res.status(200).json({ status: 'success', message: 'Xóa section thành công' });
  } catch (error) {
    next(error);
  }
};
