import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateSlug } from '../utils/slug.util';
import { logAction } from '../services/log.service';
import { autoTranslateBlog } from '../services/translation.service';

export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug, search, limit, page, project_id } = req.query;

    let query = supabase
      .from('blogs')
      .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (slug)       query = query.eq('slug', slug as string);
    if (project_id) query = query.eq('project_id', project_id as string);
    if (search)     query = query.ilike('title', `%${(search as string).trim()}%`);

    // Phân trang nhẹ cho blog list
    const pageNum  = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 20);
    query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    res.status(200).json({ status: 'success', data, meta: { total: count, page: pageNum, limit: limitNum } });
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
    const { title, property_id, project_id, content_blocks } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!title) { res.status(400).json({ error: 'Tiêu đề là bắt buộc', code: 400 }); return; }

    const slug = `${generateSlug(title)}-${Date.now().toString().slice(-5)}`;
    const status = role === 'admin' ? 'published' : 'pending';

    const { data, error } = await supabase.from('blogs').insert([{
      title, slug, property_id: property_id || null, project_id: project_id || null,
      author_id: userId, content_blocks, status
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

    // Background: dịch tự động khi admin tạo bài (published ngay)
    if (status === 'published') {
      setTimeout(() => {
        autoTranslateBlog(data.id, title, content_blocks || [], supabase);
      }, 0);
    }

    res.status(201).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, property_id, project_id, content_blocks } = req.body;
    const user = req.user;

    if (user?.role === 'agent') {
      const { data: check } = await supabase.from('blogs').select('author_id').eq('id', id).single();
      if (check?.author_id !== user.id) {
        res.status(403).json({ error: 'Bạn không có quyền sửa bài viết này', code: 403 });
        return;
      }
    }

    const updates: any = { updated_at: new Date() };
    if (title) { updates.title = title; updates.slug = `${generateSlug(title)}-${Date.now().toString().slice(-5)}`; }
    if (property_id !== undefined) updates.property_id = property_id || null;
    if (project_id !== undefined)  updates.project_id = project_id || null;
    if (content_blocks) updates.content_blocks = content_blocks;

    const { data, error } = await supabase.from('blogs').update(updates).eq('id', id).select().single();
    if (error) throw error;

    // Re-translate nếu nội dung thay đổi
    if ((title || content_blocks) && data.status === 'published') {
      const finalTitle = title ?? data.title;
      const finalBlocks = content_blocks ?? data.content_blocks ?? [];
      setTimeout(() => {
        autoTranslateBlog(id, finalTitle, finalBlocks, supabase);
      }, 0);
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

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

export const getRelatedBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 3;

    // Lấy property_id của blog hiện tại để tìm bài cùng property
    const { data: current } = await supabase.from('blogs').select('property_id').eq('id', id).single();

    let query = supabase
      .from('blogs')
      .select('id, title, slug, created_at, profiles(full_name)')
      .eq('status', 'published')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Ưu tiên bài cùng property
    if (current?.property_id) {
      const { data: sameProperty } = await query.eq('property_id', current.property_id);
      if (sameProperty && sameProperty.length >= limit) {
        res.status(200).json({ status: 'success', data: sameProperty });
        return;
      }
    }

    // Fallback: lấy bài mới nhất
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ status: 'success', data: data || [] });
  } catch (error) { next(error); }
};

export const approveBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' hoặc 'rejected'

    const { data, error } = await supabase.from('blogs').update({ status }).eq('id', id).select().single();
    if (error) throw error;

    // Dịch tự động khi admin duyệt bài (published)
    if (status === 'published' && data) {
      setTimeout(() => {
        autoTranslateBlog(id, data.title, data.content_blocks || [], supabase);
      }, 0);
    }

    res.status(200).json({ status: 'success', message: `Blog đã chuyển sang ${status}`, data });
  } catch (error) { next(error); }
};
