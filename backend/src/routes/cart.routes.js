import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

export default router;
