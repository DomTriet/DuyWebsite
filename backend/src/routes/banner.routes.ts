import { Router } from 'express';
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/banner.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public: active banners for homepage slider
router.get('/', getBanners);

// Admin: full list (includes inactive)
router.get('/all', verifyToken, requireAdmin, getAllBanners);

// Admin: CRUD
router.post('/', verifyToken, requireAdmin, createBanner);
router.put('/:id', verifyToken, requireAdmin, updateBanner);
router.delete('/:id', verifyToken, requireAdmin, deleteBanner);

export default router;
