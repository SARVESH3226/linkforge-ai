import { Router } from 'express';
import { LinkController } from '../controllers/link.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createLinkSchema, updateLinkSchema, queryLinkSchema } from '../validators/link.validator';

const router = Router();
const controller = new LinkController();

router.use(requireAuth);

router.post('/', validateRequest(createLinkSchema), controller.create);
router.get('/', validateRequest(queryLinkSchema), controller.list);

// CSV actions - defined before parameterized routes to prevent route hijacking
router.get('/export', controller.exportCSV);
router.post('/import', controller.importCSV);

router.get('/:id', controller.getById);
router.put('/:id', validateRequest(updateLinkSchema), controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/favorite', controller.toggleFavorite);

export default router;
