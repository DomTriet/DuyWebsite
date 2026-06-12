import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import {
  getProjectSections, createProjectSection, updateProjectSection, deleteProjectSection
} from '../controllers/projectSection.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// ── Section nội dung dự án (đặt /sections/:sectionId trước /:id để không match nhầm) ──
router.put('/sections/:sectionId',    verifyToken, requireAdmin, updateProjectSection);
router.delete('/sections/:sectionId', verifyToken, requireAdmin, deleteProjectSection);
router.get('/:id/sections',           getProjectSections);                       // Public
router.post('/:id/sections',          verifyToken, requireAdmin, createProjectSection);

// Public access: Mọi người đều có thể xem danh sách dự án
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin access: Chỉ Admin mới có quyền thêm mới hoặc chỉnh sửa dự án
router.post('/', verifyToken, requireAdmin, createProject);
router.put('/:id', verifyToken, requireAdmin, updateProject);
router.delete('/:id', verifyToken, requireAdmin, deleteProject);

export default router;