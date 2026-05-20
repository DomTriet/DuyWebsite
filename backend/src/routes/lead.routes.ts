import { Router } from 'express';
import { submitLead, getLeads, updateLead, submitAgentRequest, getAgentRequests, updateAgentRequestStatus, getMyAgentRequestStatus } from '../controllers/lead.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAgentOrAdmin, requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public access: Khách hàng vãng lai gửi thông tin liên hệ / đăng ký nhận báo giá
router.post('/', submitLead);

// Protected: Admin và Agent xem danh sách khách hàng
router.get('/', verifyToken, requireAgentOrAdmin, getLeads);

// Protected: Cập nhật trạng thái và ghi chú (ví dụ: từ 'new' sang 'contacted')
router.put('/:id', verifyToken, requireAgentOrAdmin, updateLead);

// Agent Requests (Member xin làm Môi giới)
router.post('/agent-requests', verifyToken, submitAgentRequest);
router.get('/agent-requests', verifyToken, requireAdmin, getAgentRequests);
router.get('/agent-requests/status', verifyToken, getMyAgentRequestStatus);
router.put('/agent-requests/:id/status', verifyToken, requireAdmin, updateAgentRequestStatus);

export default router;