import { Router } from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/checkout', checkout);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
