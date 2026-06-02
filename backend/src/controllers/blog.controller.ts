import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateSlug } from '../utils/slug.util';
import { logAction } from '../services/log.service';

export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('blogs').select('*, profiles(full_name, avatar_url)').eq('status', 'published').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('blogs').select('*, profiles(full_name, avatar_url)').eq('id', id).single();
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getManageBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let query = supabase.from('blogs').select('*, profiles(full_name)').order('created_at', { ascending: false });
    
    if (user?.role === 'agent') query = query.eq('author_id', user.id);
    
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, property_id, content_blocks } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!title) { res.status(400).json({ error: 'Tiêu đề là bắt buộc', code: 400 }); return; }

    const slug = `${generateSlug(title)}-${Date.now().toString().slice(-5)}`;
    const status = role === 'admin' ? 'published' : 'pending';

    const { data, error } = await supabase.from('blogs').insert([{
      title, slug, property_id, author_id: userId, content_blocks, status
    }]).select().single();

    if (error) throw error;
    if (userId) await logAction(userId, 'CREATE_BLOG', `Created blog: ${title}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('app_notification', {
        type: 'new_blog',
        targetRoles: ['admin'],
        title: status === 'pending' ? 'Bài báo mới chờ duyệt' : 'Bài báo mới',
        message: status === 'pending' ? `Agent vừa đăng bài viết "${title}" cần duyệt.` : `Bài viết "${title}" vừa được xuất bản.`,
        link: '/admin/blogs-manage'
      });
    }

    res.status(201).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, property_id, content_blocks } = req.body;
    const user = req.user;

    // Phân quyền: Agent chỉ được sửa bài của mình
    if (user?.role === 'agent') {
      const { data: check } = await supabase.from('blogs').select('author_id').eq('id', id).single();
      if (check?.author_id !== user.id) {
        res.status(403).json({ error: 'Bạn không có quyền sửa bài viết này', code: 403 });
        return;
      }
    }

    const updates: any = { updated_at: new Date() };
    
    if (title) { updates.title = title; updates.slug = `${generateSlug(title)}-${Date.now().toString().slice(-5)}`; }
    if (property_id !== undefined) updates.property_id = property_id;
    if (content_blocks) updates.content_blocks = content_blocks;

    const { data, error } = await supabase.from('blogs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Phân quyền: Agent chỉ được xóa bài của mình
    if (user?.role === 'agent') {
      const { data: check } = await supabase.from('blogs').select('author_id').eq('id', id).single();
      if (check?.author_id !== user.id) {
        res.status(403).json({ error: 'Bạn không có quyền xóa bài viết này', code: 403 });
        return;
      }
    }

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ status: 'success', message: 'Xóa blog thành công' });
  } catch (error) { next(error); }
};

export const approveBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' hoặc 'rejected'
    const { data, error } = await supabase.from('blogs').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ status: 'success', message: `Blog đã chuyển sang ${status}`, data });
  } catch (error) { next(error); }
};