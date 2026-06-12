import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settings.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public: frontend reads to determine feature visibility
router.get('/', getSettings);

// Admin only: update a setting
router.put('/:key', verifyToken, requireAdmin, updateSetting);

export default router;
