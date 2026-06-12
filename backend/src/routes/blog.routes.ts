import { Router } from 'express';
import { getBlogs, createBlog, updateBlog, deleteBlog, approveBlog, getManageBlogs, getBlogById, getRelatedBlogs } from '../controllers/blog.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAgentOrAdmin, requireAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/', getBlogs); // Public xem danh sách Blog
router.get('/manage', verifyToken, requireAgentOrAdmin, getManageBlogs); // Agent/Admin quản lý blog
router.get('/:id/related', getRelatedBlogs); // Bài viết liên quan
router.get('/:id', getBlogById); // Public API lấy chi tiết Blog
router.post('/', verifyToken, requireAgentOrAdmin, createBlog);
router.put('/:id', verifyToken, requireAgentOrAdmin, updateBlog);
router.delete('/:id', verifyToken, requireAgentOrAdmin, deleteBlog);
router.put('/:id/approve', verifyToken, requireAdmin, approveBlog); // Duyệt bài
export default router;