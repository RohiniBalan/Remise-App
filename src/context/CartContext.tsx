import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { storage } from '../utils/storage';
import { gatewayClient, legacyProductClient } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
  totalStock?: number;
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // Hydrate: immediately load local cart, then sync with backend if logged in
  useEffect(() => {
    (async () => {
      const local = await storage.getCart<CartItem[]>();
      if (local && Array.isArray(local) && local.length > 0) {
        setCart(local);
      }

      if (token) {
        try {
          let res;
          try {
            res = await gatewayClient.get('/api/user/cart');
          } catch {
            res = await legacyProductClient.get('/user/cart');
          }
          const items = res.data?.cart ?? res.data?.data?.items ?? res.data?.items ?? [];
          if (Array.isArray(items) && items.length > 0) {
            setCart(items);
            storage.setCart(items);
          } else if (local && local.length > 0) {
            gatewayClient
              .post('/api/user/cart/sync', { cartItems: local.map(i => ({ id: i.id, quantity: i.quantity })) })
              .catch(() => {});
          }
        } catch {
          // keep local cart on failure
        }
      }
    })();
  }, [token]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setCart(next);
      storage.setCart(next);
      if (token) {
        gatewayClient
          .post('/api/user/cart/sync', { cartItems: next.map(i => ({ id: i.id, quantity: i.quantity })) })
          .catch(() => {
            legacyProductClient
              .post('/user/cart/sync', { cartItems: next.map(i => ({ id: i.id, quantity: i.quantity })) })
              .catch(() => {});
          });
      }
    },
    [token],
  );

  const addToCart = useCallback(
    (product: CartItem) => {
      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        let next: CartItem[];
        if (existing) {
          const cap = product.totalStock ?? existing.totalStock;
          const nextQty = cap ? Math.min(existing.quantity + product.quantity, cap) : existing.quantity + product.quantity;
          next = prev.map(i => (i.id === product.id ? { ...i, quantity: nextQty } : i));
        } else {
          next = [...prev, product];
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCart(prev => {
        const next = prev.filter(i => i.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const decreaseQuantity = useCallback(
    (id: string) => {
      setCart(prev => {
        const next = prev
          .map(i => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter(i => i.quantity > 0);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, buyNowItem, setBuyNowItem, addToCart, removeFromCart, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
