import { Router } from 'express';

import projectRoutes from './project.routes';
import propertyRoutes from './property.routes';
import leadRoutes from './lead.routes';
import forumRoutes from './forum.routes';
import translationRoutes from './translation.routes';
import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';
import profileRoutes from './profile.routes';
import logRoutes from './log.routes';
import statsRoutes from './stats.routes';
import seoRoutes from './seo.routes';
import blogRoutes from './blog.routes';
import favoriteRoutes from './favorite.routes';
import settingsRoutes from './settings.routes';
import bannerRoutes from './banner.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/properties', propertyRoutes);
router.use('/leads', leadRoutes);
router.use('/forum', forumRoutes);
router.use('/translations', translationRoutes);
router.use('/upload', uploadRoutes);
router.use('/profiles', profileRoutes);
router.use('/logs', logRoutes);
router.use('/stats', statsRoutes);
router.use('/seo', seoRoutes);
router.use('/blogs', blogRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/settings', settingsRoutes);
router.use('/banners', bannerRoutes);

export default router;