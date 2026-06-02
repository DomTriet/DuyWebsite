import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendEmail } from '../services/notification.service';
import { logAction } from '../services/log.service';

/**
 * Admin / Agent lấy danh sách Khách hàng
 */
export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let query = supabase.from('leads').select('*, properties(title)');
    
    // Nếu là agent thì chỉ lấy lead của mình. Admin thì lấy hết.
    if (user?.role === 'agent') {
      query = query.eq('agent_id', user.id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy trạng thái yêu cầu đăng ký Agent của User hiện tại
 */
export const getMyAgentRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Lấy yêu cầu mới nhất của user này, không văng lỗi nếu không có dữ liệu nhờ maybeSingle()
    const { data, error } = await supabase
      .from('agent_requests')
      .select('status')
      .eq('agent_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin duyệt / từ chối yêu cầu làm Môi giới
 */
export const updateAgentRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' hoặc 'rejected'
    const adminId = req.user?.id;

    // 1. Lấy thông tin request
    const { data: request, error: fetchError } = await supabase.from('agent_requests').select('*').eq('id', id).single();
    if (fetchError || !request) throw fetchError;

    // 2. Cập nhật trạng thái của yêu cầu
    const { error: updateError } = await supabase.from('agent_requests').update({ status }).eq('id', id);
    if (updateError) throw updateError;

    // 3. Nếu duyệt (approved), tiến hành thăng cấp người dùng
    if (status === 'approved') {
      // Đổi role thành agent trong bảng profiles
      await supabase.from('profiles').update({ role: 'agent' }).eq('id', request.agent_id);
      // Khởi tạo thông tin agent rỗng (nếu chưa có) để Agent cập nhật sau
      await supabase.from('agent_profiles').upsert([{ profile_id: request.agent_id }], { onConflict: 'profile_id' });
    }

    if (adminId) await logAction(adminId, 'UPDATE_AGENT_REQUEST', `Updated agent request ID: ${id} to ${status}`);

    res.status(200).json({ status: 'success', message: `Đã cập nhật yêu cầu thành: ${status}` });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật trạng thái và ghi chú nội bộ của khách hàng
 */
export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; 
    const updates: any = {};
    
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    
    const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
    if (error) throw error;

    res.status(200).json({ status: 'success', message: 'Cập nhật thông tin khách hàng thành công', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Khách hàng gửi Form liên hệ/nhận báo giá
 */
export const submitLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customer_name, customer_email, customer_phone, message, property_id, agent_id } = req.body;

    // 1. Insert thông tin Lead vào Database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([{
        customer_name,
        customer_email,
        customer_phone,
        message,
        property_id,
        // Đảm bảo agent_id là NULL nếu không được cung cấp, tránh lỗi với RLS Policy quá chặt chẽ
        agent_id: agent_id || null
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Lấy email của Agent phụ trách (nếu có gán agent_id) để gửi thông báo
    if (agent_id) {
      // Sử dụng Service Role Key để truy xuất thông tin auth.users của Supabase
      const { data: agentData } = await supabase.auth.admin.getUserById(agent_id);
      const agentEmail = agentData?.user?.email;

      if (agentEmail) {
        const emailSubject = `[Pro-RealEstate] Khách hàng mới quan tâm dự án`;
        const emailHtml = `
          <h2>Bạn có một khách hàng mới!</h2>
          <p><strong>Tên khách hàng:</strong> ${customer_name}</p>
          <p><strong>Email:</strong> ${customer_email || 'Không cung cấp'}</p>
          <p><strong>Số điện thoại:</strong> ${customer_phone || 'Không cung cấp'}</p>
          <p><strong>Lời nhắn:</strong> ${message || 'Không có'}</p>
          <br/>
          <p>Hãy truy cập trang Quản trị Agent Dashboard để xem chi tiết và liên hệ với khách hàng nhé.</p>
        `;
        
        // 3. Gọi Background Service bắn email
        // Chạy bất đồng bộ (không await) để phản hồi API ngay lập tức cho khách hàng
        sendEmail(agentEmail, emailSubject, emailHtml).catch(err => console.error(err));
      }
    }

    // 4. Bắn thông báo Real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('app_notification', {
        type: 'new_lead',
        targetRoles: agent_id ? ['admin', 'agent'] : ['admin'],
        targetUserId: agent_id || null,
        title: 'Khách hàng mới!',
        message: `Khách hàng ${customer_name} vừa gửi yêu cầu tư vấn.`,
        link: '/admin/leads'
      });
    }

    res.status(201).json({ 
      status: 'success', 
      message: 'Cảm ơn bạn đã để lại thông tin, chúng tôi sẽ liên hệ trong thời gian sớm nhất!' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng ký làm Agent (Người dùng gửi form yêu cầu)
 */
export const submitAgentRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { request_data } = req.body;
    const userId = req.user?.id; // ID của tài khoản member đang đăng nhập

    // Chống Spam: Kiểm tra xem đã có yêu cầu nào đang chờ duyệt chưa
    const { data: existing } = await supabase.from('agent_requests').select('id').eq('agent_id', userId).eq('status', 'pending').single();
    if (existing) {
      res.status(400).json({ error: 'Bạn đã có một yêu cầu đang chờ duyệt. Vui lòng kiên nhẫn đợi Admin phản hồi.', code: 400 });
      return;
    }

    const { data, error } = await supabase.from('agent_requests').insert([{ agent_id: userId, request_data }]).select().single();
    if (error) throw error;

    res.status(201).json({ status: 'success', message: 'Yêu cầu nâng cấp tài khoản Agent đã được gửi.', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin lấy danh sách yêu cầu đăng ký Agent
 */
export const getAgentRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('agent_requests').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false });
    if (error) throw error;
    
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};