import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { storage } from '../utils/storage';
import { legacyProductClient } from '../api/client';
import { useAuth } from './AuthContext';

// Ported from client/app/components-main/CartContext.tsx. Same backend
// (LEGACY_PRODUCT_URL / wow-lifebackend.onrender.com — `/user/cart`,
// `/user/cart/sync`) and same guest-cart-via-local-storage fallback.

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

  // Hydrate: backend cart if logged in, else the locally-persisted guest cart —
  // matches web's exact fallback order.
  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const res = await legacyProductClient.get('/user/cart');
          const items = res.data?.data?.items ?? res.data?.items ?? [];
          setCart(items);
          return;
        } catch {
          // fall through to local cart on failure, same as web
        }
      }
      const local = await storage.getCart<CartItem[]>();
      if (local) setCart(local);
    })();
  }, [token]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setCart(next);
      storage.setCart(next);
      if (token) {
        legacyProductClient
          .post('/user/cart/sync', { cartItems: next.map(i => ({ id: i.id, quantity: i.quantity })) })
          .catch(() => {});
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
