import { Router } from 'express';
import authRoutes from './auth.routes';
import linkRoutes from './link.routes';
import analyticsRoutes from './analytics.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/links', linkRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/categories', categoryRoutes);

export default router;
