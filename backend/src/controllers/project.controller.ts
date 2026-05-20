import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../services/log.service';

/**
 * Lấy danh sách toàn bộ dự án
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Có thể áp dụng thêm Cache Redis ở đây sau này đối với dữ liệu public để giảm tải cho DB
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết 1 dự án theo ID
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
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

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, theme_id: theme_id || 'minimalist', description, status }])
      .select()
      .single();

    if (error) throw error;

    // Lưu vết log
    if (userId) await logAction(userId, 'CREATE_PROJECT', `Created project: ${name}`);

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

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (userId) await logAction(userId, 'UPDATE_PROJECT', `Updated project ID: ${id}`);

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