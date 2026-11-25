import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as cartApi from '../api/cart';
import { getErrorMessage } from '../utils/format';
import { useAuth } from './AuthContext';
import type { Cart } from '../types';

const EMPTY_CART: Cart = { items: [] };

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cart: EMPTY_CART,
  loading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
  addToCart: async () => undefined,
  updateQuantity: async () => undefined,
  removeItem: async () => undefined,
  refresh: async () => undefined
});

const normalizeCart = (cart: Cart): Cart => ({
  ...cart,
  items: (cart.items || []).filter((item) => item.product && typeof item.product !== 'string')
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(EMPTY_CART);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await cartApi.getCart();
      setCart(normalizeCart(data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger le panier'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    if (!token) throw new Error('Connectez-vous pour ajouter un article au panier');

    setError(null);
    try {
      const { data } = await cartApi.addToCart(productId, quantity);
      setCart(normalizeCart(data));
    } catch (err) {
      const message = getErrorMessage(err, 'Impossible d’ajouter au panier');
      setError(message);
      throw new Error(message);
    }
  }, [token]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    setError(null);
    try {
      const { data } = await cartApi.updateCartItem(productId, quantity);
      setCart(normalizeCart(data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de modifier la quantité'));
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    setError(null);
    try {
      const { data } = await cartApi.removeCartItem(productId);
      setCart(normalizeCart(data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de supprimer l’article'));
    }
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const totalPrice = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      totalItems,
      totalPrice,
      addToCart,
      updateQuantity,
      removeItem,
      refresh
    }),
    [cart, loading, error, totalItems, totalPrice, addToCart, updateQuantity, removeItem, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
