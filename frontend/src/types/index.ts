export type Category = 'PC' | 'Tablette' | 'Fourniture';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: Category;
  stock: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
