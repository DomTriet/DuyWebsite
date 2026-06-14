import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../services/log.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, full_name, role } = req.body;

    // Gọi Supabase Auth. Nếu Supabase Dashboard đang bật "Enable Email Confirmations", nó sẽ tự động gửi email.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || '',
          role: role || 'member' // Dữ liệu này sẽ được Trigger ở Giai đoạn 1 bắt lấy và chèn vào bảng profiles
        }
      }
    });

    if (error) throw error;

    // Kiểm tra trường hợp user đã tồn tại (Supabase trả về identities: [])
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      res.status(400).json({ error: 'Email này đã được đăng ký. Vui lòng sử dụng email khác.', code: 400 });
      return;
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('app_notification', {
        type: 'new_user',
        targetRoles: ['admin'],
        title: 'Thành viên mới',
        message: `${full_name || email} vừa đăng ký tài khoản hệ thống.`,
        link: '/admin/users'
      });
    }

    res.status(201).json({ 
      status: 'success', 
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
      data: data.user 
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.status(200).json({ 
      status: 'success', 
      message: 'Đăng nhập thành công!',
      data: {
        user: data.user,
        session: data.session // Chứa access_token để Client sử dụng cho các request sau
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Với kiến trúc JWT Stateless (không lưu session trên backend), 
    // việc đăng xuất chủ yếu là Client xóa token ở LocalStorage.
    // Ta trả về success để Frontend thực hiện clear dữ liệu.
    res.status(200).json({ status: 'success', message: 'Đăng xuất thành công. Vui lòng xóa token ở Client.' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Supabase tự động gửi email chứa link reset mật khẩu
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'https://bdsdiemtam.com'}/auth/reset-password`,
    });

    if (error) throw error;

    res.status(200).json({ status: 'success', message: 'Yêu cầu khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt lại mật khẩu mới (Sau khi click link từ email quên mật khẩu)
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { new_password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Không tìm thấy thông tin người dùng', code: 401 });
      return;
    }
    
    // Sử dụng Admin API của Supabase để cưỡng chế đổi mật khẩu dựa vào ID được giải mã từ Token
    const { error } = await supabase.auth.admin.updateUserById(userId, { password: new_password });

    if (error) throw error;
    if (userId) await logAction(userId, 'RESET_PASSWORD', `User has reset their password`);

    res.status(200).json({ status: 'success', message: 'Cập nhật mật khẩu mới thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    next(error);
  }
};