import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public access: Mọi người đều có thể xem danh sách dự án
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin access: Chỉ Admin mới có quyền thêm mới hoặc chỉnh sửa dự án
router.post('/', verifyToken, requireAdmin, createProject);
router.put('/:id', verifyToken, requireAdmin, updateProject);
router.delete('/:id', verifyToken, requireAdmin, deleteProject);

export default router;