import api from './client';
import type { Cart } from '../types';

export const getCart = () => api.get<Cart>('/cart');

export const addToCart = (productId: string, quantity: number) =>
  api.post<Cart>('/cart', { productId, quantity });

export const updateCartItem = (productId: string, quantity: number) =>
  api.put<Cart>(`/cart/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  api.delete<Cart>(`/cart/${productId}`);
