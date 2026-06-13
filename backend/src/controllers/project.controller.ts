import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../services/log.service';
import { autoTranslateAllLangs } from '../services/translation.service';
import { generateSlug, makeUniqueSlug } from '../utils/slug.util';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Lấy danh sách toàn bộ dự án
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, theme_id, status } = req.query;

    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (search)   query = query.ilike('name', `%${(search as string).trim()}%`);
    if (theme_id) query = query.eq('theme_id', theme_id as string);
    if (status)   query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết 1 dự án theo ID (UUID) hoặc Slug
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Nhận diện UUID hay Slug để query đúng cột
    const field = UUID_REGEX.test(id) ? 'id' : 'slug';

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq(field, id)
      .single();

    if (error) {
      res.status(404).json({ status: 'error', message: 'Project not found' });
      return;
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới dự án
 */
export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, theme_id, description, status } = req.body;
    const userId = req.user?.id;

    const baseSlug = generateSlug(name);
    const uniqueSlug = await makeUniqueSlug('projects', baseSlug);

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, slug: uniqueSlug, theme_id: theme_id || 'minimalist', description, status }])
      .select()
      .single();

    if (error) throw error;

    // Lưu vết log
    if (userId) await logAction(userId, 'CREATE_PROJECT', `Created project: ${name}`);

    // Background: dịch tự động tên + mô tả dự án sang EN/KO/ZH
    setTimeout(() => {
      autoTranslateAllLangs('project', data.id, { title: name, description: description || '' }, supabase);
    }, 0);

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin dự án
 */
export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    // Tái tạo slug khi đổi tên dự án
    if (updates.name && !updates.slug) {
      updates.slug = await makeUniqueSlug('projects', generateSlug(updates.name), id);
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (userId) await logAction(userId, 'UPDATE_PROJECT', `Updated project ID: ${id}`);

    // Re-translate nếu name hoặc description thay đổi
    if (updates.name || updates.description) {
      const titleToTranslate = updates.name ?? data?.name ?? '';
      const descToTranslate = updates.description ?? data?.description ?? '';
      setTimeout(() => {
        autoTranslateAllLangs('project', id, { title: titleToTranslate, description: descToTranslate }, supabase);
      }, 0);
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa dự án (Chỉ dành cho Admin)
 */
export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Ràng buộc Database (ON DELETE SET NULL) sẽ tự động gỡ project_id khỏi các properties liên quan
    const { error } = await supabase.from('projects').delete().eq('id', id);
    
    if (error) throw error;
    if (userId) await logAction(userId, 'DELETE_PROJECT', `Deleted project ID: ${id}`);

    res.status(200).json({ status: 'success', message: 'Xóa dự án thành công' });
  } catch (error) {
    next(error);
  }
};