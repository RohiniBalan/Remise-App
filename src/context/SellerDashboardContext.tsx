import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { storeApi } from '../api/storeApi';
import { storeProductApi } from '../api/storeProductApi';
import { sellerOrderApi, sellerStoreApi, SellerOrder } from '../api/sellerApi';

// Ported from client/app/store/seller/page.tsx's loadData(). Same two known
// gaps as web (see seller-analytics.ts comments there): no buyer store
// name/id on the order itself (resolved here via storeNameByOwnerId), and
// no paidAt timestamp (payment aging is createdAt-based only).

const SEEN_ORDERS_KEY = 'seller_seen_order_ids';

async function getSeenOrderIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_ORDERS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

async function persistSeenOrderIds(ids: Set<string>) {
  try {
    await AsyncStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify([...ids]));
  } catch {
    // non-fatal
  }
}

interface SellerDashboardValue {
  store: any;
  products: any[];
  categories: any[];
  orders: SellerOrder[];
  storeNameByOwnerId: Record<string, string>;
  loading: boolean;
  loadError: string;
  noStore: boolean;
  refresh: () => Promise<void>;
  /** Count of Processing orders not yet seen by the seller */
  newOrderCount: number;
  /** Call this when the seller opens the Incoming Orders screen */
  markOrdersAsSeen: () => Promise<void>;
}

const SellerDashboardContext = createContext<SellerDashboardValue | undefined>(undefined);

export function SellerDashboardProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [storeNameByOwnerId, setStoreNameByOwnerId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [noStore, setNoStore] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Load seen IDs from storage on mount
  useEffect(() => {
    getSeenOrderIds().then(setSeenIds);
  }, []);

  // Count only NEW (unseen) Processing orders
  const newOrderCount = orders.filter(
    (o) => o.orderStatus === 'Processing' && !seenIds.has((o as any)._id || (o as any).id)
  ).length;

  // Mark all current orders as seen
  const markOrdersAsSeen = useCallback(async () => {
    const existing = await getSeenOrderIds();
    orders.forEach((o) => {
      const id = (o as any)._id || (o as any).id;
      if (id) existing.add(id);
    });
    await persistSeenOrderIds(existing);
    setSeenIds(new Set(existing));
  }, [orders]);

  const loadData = useCallback(async () => {
    setLoadError('');
    setNoStore(false);

    let s: any;
    try {
      const storeRes = await storeApi.getMyStore();
      s = storeRes.data.data;
      if (!s) throw Object.assign(new Error('no store'), { status: 404 });
      setStore(s);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status === 404) {
        setNoStore(true);
        setLoading(false);
        return;
      }
      setLoadError(
        `Could not load business data: ${err?.response?.data?.message || err?.message || 'Unknown error'}.`,
      );
      setLoading(false);
      return;
    }

    const [prodRes, catRes, ordRes] = await Promise.allSettled([
      storeProductApi.getByStore(s._id),
      storeProductApi.getCategories(),
      sellerOrderApi.getStoreOrders(s._id),
    ]);

    if (prodRes.status === 'fulfilled') {
  const loadedProducts = prodRes.value.data.data || [];

  console.log(
    'SELLER PRODUCTS:',
    JSON.stringify(
      loadedProducts.map((p: any) => ({
        id: p._id,
        title: p.title,
        imageUrl: p.imageUrl,
        image: p.image,
        images: p.images,
      })),
      null,
      2,
    ),
  );

  setProducts(loadedProducts);
}
    if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);

    let loadedOrders: SellerOrder[] = [];
    if (ordRes.status === 'fulfilled') {
      loadedOrders = (ordRes.value.data as any).data || [];
      setOrders(loadedOrders);
    }

    // Resolve buyerId -> store name using only the owners this seller
    // actually sold to (mirrors web's comment: a general "list all stores"
    // route is admin-only, so this targeted lookup is used instead).
    const ownerIds = Array.from(new Set(loadedOrders.map(o => o.buyerId).filter(Boolean)));
    if (ownerIds.length) {
      try {
        const storesRes = await sellerStoreApi.getStoresByOwnerIds(ownerIds);
        const map: Record<string, string> = {};
        (storesRes.data.data || []).forEach((st: any) => {
          map[st.ownerId] = st.name;
        });
        setStoreNameByOwnerId(map);
      } catch {
        /* non-fatal — buyers just show as "Unknown Store" */
      }
    }

    const failed = [prodRes, catRes, ordRes].filter(r => r.status === 'rejected');
    if (failed.length) setLoadError('Some data could not be loaded. Try refreshing.');

    setLoading(false);
  }, [token]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  return (
    <SellerDashboardContext.Provider
      value={{ store, products, categories, orders, storeNameByOwnerId, loading, loadError, noStore, refresh: loadData, newOrderCount, markOrdersAsSeen }}
    >
      {children}
    </SellerDashboardContext.Provider>
  );
}

export function useSellerDashboard(): SellerDashboardValue {
  const ctx = useContext(SellerDashboardContext);
  if (!ctx) throw new Error('useSellerDashboard must be used within a SellerDashboardProvider');
  return ctx;
}
