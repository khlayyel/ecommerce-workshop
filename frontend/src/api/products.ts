import api from './client';
import type { Product } from '../types';

export const getProducts = () => api.get<Product[]>('/products');

export const getProduct = (productId: string) => api.get<Product>(`/products/${productId}`);

// Surface API demandée par l'atelier : panier et commandes accessibles depuis ce module.
export { getCart, addToCart, updateCartItem, removeCartItem } from './cart';
export { checkout } from './orders';
