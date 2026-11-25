import api from './client';
import type { Order } from '../types';

export interface CheckoutItem {
  product: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface CheckoutResponse {
  clientSecret: string;
  orderId: string;
}

export const checkout = (items: CheckoutItem[], totalAmount: number) =>
  api.post<CheckoutResponse>('/orders/checkout', { items, totalAmount });

export const getMyOrders = () => api.get<Order[]>('/orders');

export const getOrderById = (orderId: string) => api.get<Order>(`/orders/${orderId}`);
