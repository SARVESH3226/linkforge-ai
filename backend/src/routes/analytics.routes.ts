import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

// Public route - does not require authentication
router.get('/public/:shortCode', controller.getPublicStats);

// Protect all other routes
router.use(requireAuth);

router.get('/', controller.getGlobalStats);
router.get('/link/:linkId', controller.getLinkStats);

export default router;
