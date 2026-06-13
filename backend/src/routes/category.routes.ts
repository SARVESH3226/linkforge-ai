import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();
const controller = new CategoryController();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validateRequest(createCategorySchema), controller.create);
router.put('/:id', validateRequest(updateCategorySchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
