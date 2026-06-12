import { Router } from 'express';
import {
  getProperties, getPropertyBySlug, createProperty, updateProperty, deleteProperty,
  getCategories, createCategory, updateCategory, deleteCategory,
  deletePropertyMedia, setPropertyThumbnail,
  getPropertySuggestions, getPropertyFacets,
  getPropertySections, createPropertySection, updatePropertySection, deletePropertySection
} from '../controllers/property.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAgentOrAdmin, requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// ── Danh mục ──
router.get('/categories',          getCategories);
router.post('/categories',         verifyToken, requireAdmin, createCategory);
router.put('/categories/:id',      verifyToken, requireAdmin, updateCategory);
router.delete('/categories/:id',   verifyToken, requireAdmin, deleteCategory);

// ── Search helpers (đặt trước /:slug để không bị match nhầm) ──
router.get('/suggestions', getPropertySuggestions); // autocomplete
router.get('/facets',      getPropertyFacets);       // filter counts

// ── Danh sách & chi tiết ──
router.get('/',       getProperties);
router.get('/:slug',  getPropertyBySlug);

// ── Agent/Admin CRUD ──
router.post('/',    verifyToken, requireAgentOrAdmin, createProperty);
router.put('/:id',  verifyToken, requireAgentOrAdmin, updateProperty);
router.delete('/:id', verifyToken, requireAgentOrAdmin, deleteProperty);
router.delete('/media/:mediaId',           verifyToken, requireAgentOrAdmin, deletePropertyMedia);
router.put('/media/:mediaId/thumbnail',    verifyToken, requireAgentOrAdmin, setPropertyThumbnail);

// ── Property Sections ──
router.get('/:propertyId/sections',              verifyToken, requireAgentOrAdmin, getPropertySections);
router.post('/:propertyId/sections',             verifyToken, requireAgentOrAdmin, createPropertySection);
router.put('/:propertyId/sections/:sectionId',   verifyToken, requireAgentOrAdmin, updatePropertySection);
router.delete('/:propertyId/sections/:sectionId', verifyToken, requireAgentOrAdmin, deletePropertySection);

export default router;
