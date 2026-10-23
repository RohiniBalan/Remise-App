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
  storeId?: string;
  storeName?: string;
  ownerRole?: string;
  storeType?: string;
  supplierRole?: string;
  isOffer?: boolean;
  moq?: number;
  unit?: string;
}

interface CartContextValue {
  cart: CartItem[];
  cartMap: Map<string, CartItem>;
  getItemQuantity: (id: string) => number;
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
  const { token, user } = useAuth();
  const userId = user?._id || user?.email || null;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // Hydrate: immediately load local cart for current user, then sync with backend if logged in
  useEffect(() => {
    let isCurrent = true;
    (async () => {
      if (!token || !userId) {
        // User is logged out or guest: reset cart
        setCart([]);
        return;
      }

      // Load user-specific cached cart from storage
      const local = await storage.getCart<CartItem[]>(userId);
      if (isCurrent && local && Array.isArray(local) && local.length > 0) {
        setCart(local);
      } else if (isCurrent) {
        setCart([]);
      }

      try {
        let res;
        try {
          res = await gatewayClient.get('/api/user/cart');
        } catch {
          res = await legacyProductClient.get('/user/cart');
        }
        if (!isCurrent) return;
        const items = res.data?.cart ?? res.data?.data?.items ?? res.data?.items ?? [];
        if (Array.isArray(items)) {
          setCart(items);
          await storage.setCart(items, userId);
        }
      } catch {
        // keep local user-specific cart on network failure
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [token, userId]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setCart(next);
      storage.setCart(next, userId);
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
    [token, userId],
  );

  const addToCart = useCallback(
    (product: CartItem) => {
      const isWholesaleOrHome =
        (product as any).ownerRole === 'whole_saler' ||
        (product as any).ownerRole === 'wholesaler' ||
        (product as any).ownerRole === 'home_business' ||
        (product as any).storeType === 'whole_saler' ||
        (product as any).storeType === 'home_business';
      const itemMoq = isWholesaleOrHome ? Math.max(1, Number((product as any).moq) || 1) : 1;
      const productUnit = (product as any).unit || (product as any).stockUnit || 'Units';

      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        let next: CartItem[];
        if (existing) {
          const cap = product.totalStock ?? existing.totalStock;
          const qtyToAdd = product.quantity || 1;
          const nextQty = cap ? Math.min(existing.quantity + qtyToAdd, cap) : existing.quantity + qtyToAdd;
          next = prev.map(i => (i.id === product.id ? { ...i, quantity: nextQty } : i));
        } else {
          const initialQuantity = isWholesaleOrHome
            ? Math.max(itemMoq, product.quantity || 1)
            : (product.quantity || 1);

          next = [...prev, {
            ...product,
            quantity: initialQuantity,
            moq: isWholesaleOrHome ? itemMoq : 1,
            unit: productUnit,
            storeId: product.storeId || (product as any).store?._id || (product as any).vendorId,
            storeName: product.storeName || (product as any).store?.name,
            ownerRole: (product as any).ownerRole || (product as any).sellerRole || (product as any).store?.storeType || (product as any).store?.role,
            storeType: (product as any).storeType || (product as any).store?.storeType,
            supplierRole: (product as any).supplierRole,
            isOffer: Boolean((product as any).isOffer),
          }];
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
          .map(i => {
            if (i.id === id) {
              const isWholesaleOrHome =
                (i as any).ownerRole === 'whole_saler' ||
                (i as any).ownerRole === 'wholesaler' ||
                (i as any).ownerRole === 'home_business' ||
                (i as any).storeType === 'whole_saler' ||
                (i as any).storeType === 'home_business';
              const itemMoq = isWholesaleOrHome ? Math.max(1, Number((i as any).moq) || 1) : 1;
              if (isWholesaleOrHome && i.quantity <= itemMoq) {
                return i;
              }
              return { ...i, quantity: i.quantity - 1 };
            }
            return i;
          })
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

  const cartMap = useMemo(() => {
    const map = new Map<string, CartItem>();
    for (const item of cart) {
      if (item.id) map.set(item.id, item);
    }
    return map;
  }, [cart]);

  const getItemQuantity = useCallback(
    (id: string): number => {
      return cartMap.get(id)?.quantity || 0;
    },
    [cartMap],
  );

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartMap,
        getItemQuantity,
        cartCount,
        buyNowItem,
        setBuyNowItem,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
