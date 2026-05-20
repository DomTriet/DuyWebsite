import { Router } from 'express';
import { toggleFavorite, getMyFavorites, getMyFavoriteIds } from '../controllers/favorite.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/toggle', verifyToken, toggleFavorite);
router.get('/', verifyToken, getMyFavorites);
router.get('/ids', verifyToken, getMyFavoriteIds);

export default router;