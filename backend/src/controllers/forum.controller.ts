import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { censorContent, hasSpamLinks } from '../services/censor.service';
import { logAction } from '../services/log.service';
import { sendEmail } from '../services/notification.service';

/**
 * Lấy danh sách bài viết trên Diễn đàn (Chỉ lấy bài đã được duyệt)
 */
export const getApprovedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, avatar_url, role)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết 1 bài viết Diễn đàn
 */
export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, avatar_url, role)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin lấy danh sách bài viết đang chờ duyệt (Pending Posts)
 */
export const getPendingPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, avatar_url, role)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin duyệt bài viết (Approve) và tự động gửi thông báo cho tác giả
 */
export const approvePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    // 1. Cập nhật trạng thái thành 'approved'
    const { data: post, error } = await supabase
      .from('forum_posts')
      .update({ status: 'approved' })
      .eq('id', id)
      .select('*, profiles(id)')
      .single();

    if (error) throw error;
    if (adminId) await logAction(adminId, 'APPROVE_FORUM_POST', `Approved post ID: ${id}`);

    // 2. Lấy email tác giả từ auth.users để gửi thông báo
    if (post.author_id) {
      const { data: authorData } = await supabase.auth.admin.getUserById(post.author_id);
      if (authorData?.user?.email) {
        sendEmail(
          authorData.user.email,
          '[Pro-RealEstate] Bài viết của bạn đã được duyệt',
          `Chúc mừng! Bài đăng "<b>${post.title}</b>" của bạn đã được duyệt và hiển thị trên diễn đàn.`
        ).catch(err => console.error(err));
      }
    }

    res.status(200).json({ status: 'success', message: 'Duyệt bài thành công!', data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin xóa bài viết (Hoặc từ chối bài viết Pending)
 */
export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const { error } = await supabase.from('forum_posts').delete().eq('id', id);
    
    if (error) throw error;
    if (adminId) await logAction(adminId, 'DELETE_FORUM_POST', `Deleted post ID: ${id}`);

    res.status(200).json({ status: 'success', message: 'Đã xóa bài viết thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng bài viết mới (Sẽ đi qua bộ lọc và đặt status = pending)
 */
export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id;

    // 1. Kiểm tra xem bài đăng có cố tình chèn link spam/đối thủ không
    if (hasSpamLinks(content) || hasSpamLinks(title)) {
      res.status(400).json({ error: 'Nội dung chứa liên kết không hợp lệ hoặc có dấu hiệu spam.', code: 400 });
      return;
    }

    // 2. Làm mờ các từ khóa cấm/tiêu cực
    const censoredTitle = censorContent(title);
    const censoredContent = censorContent(content);

    // 3. Đẩy xuống Database với trạng thái Pending
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert([{ 
        title: censoredTitle, 
        content: censoredContent, 
        author_id: userId,
        status: 'pending' // Yêu cầu Admin phê duyệt
      }])
      .select()
      .single();

    if (error) throw error;

    if (userId) await logAction(userId, 'CREATE_FORUM_POST', `Created post (Pending): ${censoredTitle}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('app_notification', {
        type: 'new_post',
        targetRoles: ['admin'],
        title: 'Bài viết cộng đồng mới',
        message: `Có một bài viết mới đang chờ được duyệt.`,
        link: '/admin/forum-approval'
      });
    }

    res.status(201).json({ 
      status: 'success', 
      message: 'Bài viết đã được gửi và đang chờ Ban Quản Trị kiểm duyệt.',
      data: post 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách bình luận của một bài viết
 */
export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*, profiles(username, avatar_url, role)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng bình luận mới
 */
export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (hasSpamLinks(content)) {
      res.status(400).json({ error: 'Nội dung chứa liên kết không hợp lệ.', code: 400 });
      return;
    }

    const { data: comment, error } = await supabase.from('forum_comments').insert([{ post_id: postId, content: censorContent(content), author_id: userId, status: 'approved' }]).select().single();
    if (error) throw error;

    // Báo cho tác giả bài viết
    const { data: post } = await supabase.from('forum_posts').select('author_id, title').eq('id', postId).single();
    const io = req.app.get('io');
    if (io && post?.author_id && post.author_id !== userId) {
      io.emit('app_notification', {
        type: 'new_comment',
        targetUserId: post.author_id,
        title: 'Bình luận mới',
        message: `Có người vừa bình luận vào bài viết "${post.title}" của bạn.`,
        link: `/forum/${postId}`
      });
    }

    res.status(201).json({ status: 'success', data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin xóa bình luận rác
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { commentId } = req.params;
    const adminId = req.user?.id;

    const { error } = await supabase.from('forum_comments').delete().eq('id', commentId);
    if (error) throw error;
    
    if (adminId) await logAction(adminId, 'DELETE_FORUM_COMMENT', `Deleted comment ID: ${commentId}`);
    res.status(200).json({ status: 'success', message: 'Đã xóa bình luận' });
  } catch (error) {
    next(error);
  }
};

/**
 * User Thích / Bỏ thích bài viết
 */
export const toggleReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    // Kiểm tra xem đã like chưa
    const { data: existing } = await supabase.from('forum_reactions').select('id').eq('post_id', postId).eq('user_id', userId).single();

    if (existing) {
      await supabase.from('forum_reactions').delete().eq('id', existing.id);
      res.status(200).json({ status: 'success', message: 'Đã bỏ thích bài viết' });
    } else {
      await supabase.from('forum_reactions').insert([{ post_id: postId, user_id: userId }]);

      // Báo cho tác giả bài viết
      const { data: post } = await supabase.from('forum_posts').select('author_id, title').eq('id', postId).single();
      const io = req.app.get('io');
      if (io && post?.author_id && post.author_id !== userId) {
        io.emit('app_notification', {
          type: 'new_reaction',
          targetUserId: post.author_id,
          title: 'Lượt thích mới',
          message: `Có người vừa thích bài viết "${post.title}" của bạn.`,
          link: `/forum/${postId}`
        });
      }

      res.status(201).json({ status: 'success', message: 'Đã thích bài viết' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * User Báo cáo bài viết vi phạm
 */
export const reportPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    // Chống Spam: Kiểm tra xem user này đã report bài này chưa
    const { data: existing } = await supabase.from('forum_reports').select('id').eq('post_id', postId).eq('reporter_id', userId).single();
    if (existing) {
      res.status(400).json({ error: 'Bạn đã báo cáo bài viết này rồi. Xin vui lòng chờ xử lý.', code: 400 });
      return;
    }

    await supabase.from('forum_reports').insert([{ post_id: postId, reporter_id: userId, reason }]);

    const io = req.app.get('io');
    if (io) {
      io.emit('app_notification', {
        type: 'new_report',
        targetRoles: ['admin'],
        title: 'Báo cáo vi phạm mới',
        message: `Một bài viết vừa bị báo cáo với lý do: ${reason}`,
        link: '/admin/forum-approval'
      });
    }

    res.status(201).json({ status: 'success', message: 'Đã gửi báo cáo vi phạm. Admin sẽ xem xét.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin lấy danh sách bài viết bị báo cáo
 */
export const getPendingReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('forum_reports').select('*, forum_posts(title), profiles(username)').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin xử lý báo cáo (Bỏ qua hoặc Xóa bài)
 */
export const resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // 'dismiss' hoặc 'delete_post'
    
    if (action === 'delete_post') {
      const { data: report } = await supabase.from('forum_reports').select('post_id').eq('id', reportId).single();
      if (report && report.post_id) {
        await supabase.from('forum_posts').delete().eq('id', report.post_id);
        if (req.user?.id) await logAction(req.user?.id, 'DELETE_FORUM_POST', `Deleted post ID: ${report.post_id} due to report resolution`);
      }
      // Lưu ý: Ràng buộc ON DELETE CASCADE trong Database sẽ tự động xóa luôn Report này, nên không cần update status nữa.
      res.status(200).json({ status: 'success', message: 'Đã xóa bài viết và đóng báo cáo' });
      return;
    }

    // Nếu chỉ bỏ qua (dismiss) thì cập nhật trạng thái report
    await supabase.from('forum_reports').update({ status: 'resolved' }).eq('id', reportId);
    res.status(200).json({ status: 'success', message: 'Đã xử lý báo cáo' });
  } catch (error) {
    next(error);
  }
};