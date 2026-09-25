import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeApi } from '../api/storeApi';
import { offersApi } from '../api/offersApi';
import { smartOrderApi } from '../api/smartOrderApi';
import { storeProductApi } from '../api/storeProductApi';
import { useAuth } from './AuthContext';
import { isValidPlacedOrder } from '../utils/orderValidation';

// Ported from client/app/store/dashboard/page.tsx's loadData() — same
// sequence (load own store scoped by ownerId -> self-heal role if still
// 'user' -> Promise.allSettled the rest so one failed service never blocks
// the others) and the same OfferOrder + smart-order merge
// (normalizeSmartOrder). Lifted into a Context (rather than one big screen
// component) because each of the 6 dashboard tabs is a separate React
// Navigation screen on mobile, not a conditionally-rendered panel inside
// one page — they all need the same store/offers/orders/products/
// categories state and the same refresh() function web's single page gets
// "for free" from shared component state.

const SEEN_STORE_ORDERS_KEY = 'store_seen_order_ids';

async function getSeenStoreOrderIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORE_ORDERS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

async function persistSeenStoreOrderIds(ids: Set<string>) {
  try {
    await AsyncStorage.setItem(SEEN_STORE_ORDERS_KEY, JSON.stringify([...ids]));
  } catch {
    // non-fatal
  }
}

function normalizeSmartOrder(o: any) {
  const addr = o.shippingAddress || {};
  const items = o.items || [];
  return {
    _id: o._id,
    orderId: o.orderId || o._id,
    orderNumber: o.orderNumber,
    deliveryToken: o.deliveryToken,
    deliveryPerson: o.deliveryPerson,
    deliveryStatus: o.deliveryStatus,
    deliveryMode: o.deliveryMode,
    deliveryTimeline: o.deliveryTimeline,
    shippingAddress: o.shippingAddress,
    status: o.orderStatus,
    offerTitle: items.length ? items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ') : `Order ${o.orderId || o._id}`,
    customerName: [addr.firstName, addr.lastName].filter(Boolean).join(' ') || o.contactEmail,
    customerPhone: addr.phone,
    customerEmail: o.contactEmail,
    customerId: o.userId || null,
    deliveryAddress: [addr.address, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', '),
    notes: null,
    totalAmount: o.totalAmount,
    quantity: items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 1,
    createdAt: o.createdAt,
    deliveryMethod: o.deliveryMethod,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    vendorTransfers: o.vendorTransfers || [],
    rawItems: items,
    refundStatus: o.refundStatus || (o.paymentStatus === 'REFUNDED' ? 'refunded' : 'none'),
    totalRefundedAmount: o.totalRefundedAmount || (o.paymentStatus === 'REFUNDED' ? o.totalAmount : 0),
    refunds: o.refunds || [],
    _source: 'smartOrder' as const,
  };
}

interface StoreDashboardValue {
  store: any;
  offers: any[];
  orders: any[];
  products: any[];
  categories: any[];
  loading: boolean;
  noStore: boolean;
  loadError: string;
  refresh: () => void;
  newOrderCount: number;
  markOrdersAsSeen: () => Promise<void>;
}

export const StoreDashboardContext = createContext<StoreDashboardValue | undefined>(undefined);

export function StoreDashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, token, login } = useAuth();
  const roleFixed = useRef(false);

  const [store, setStore] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noStore, setNoStore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Load seen IDs from storage on mount
  useEffect(() => {
    getSeenStoreOrderIds().then(setSeenIds);
  }, []);

  // Count unseen orders
  const newOrderCount = orders.filter(
    (o) => !seenIds.has((o as any)._id || (o as any).id)
  ).length;

  // Mark all current orders as seen
  const markOrdersAsSeen = useCallback(async () => {
    const existing = await getSeenStoreOrderIds();
    orders.forEach((o) => {
      const id = (o as any)._id || (o as any).id;
      if (id) existing.add(id);
    });
    await persistSeenStoreOrderIds(existing);
    setSeenIds(new Set(existing));
  }, [orders]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoadError('');
    setNoStore(false);
    setStore(null);
    setOffers([]);
    setOrders([]);
    setProducts([]);
    setCategories([]);
    try {
      let s: any;
      try {
        const storeRes = await storeApi.getMyStore();
        s = storeRes.data.data;
        if (!s) throw Object.assign(new Error('no store'), { status: 404 });
        setStore(s);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          setNoStore(true);
          setLoading(false);
          return;
        }
        setLoadError(`Could not load store data: ${err?.response?.data?.message || err.message}. Make sure all services are running.`);
        setLoading(false);
        return;
      }

      if (!roleFixed.current && user?.role === 'user') {
        roleFixed.current = true;
        try {
          const fixRes = await storeApi.syncRole();
          if (fixRes.data.success && fixRes.data.data?.token) {
            await login({ ...user, role: 'store_owner' }, fixRes.data.data.token);
          }
        } catch {
          // non-fatal
        }
      }

      const [offRes, ordRes, smartOrdRes, prodRes, catRes] = await Promise.allSettled([
        offersApi.getByStore(s._id),
        offersApi.getStoreOrders(s._id),
        smartOrderApi.getStoreOrders(s._id),
        storeProductApi.getByStore(s._id),
        storeProductApi.getCategories(),
      ]);

      if (offRes.status === 'fulfilled') setOffers(offRes.value.data.data || []);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.data || []);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);

      const offerOrders = ordRes.status === 'fulfilled' ? (ordRes.value.data.data || []).filter(isValidPlacedOrder).map((o: any) => ({
        ...o,
        orderId: o.orderId || o._id,
        shippingAddress: o.shippingAddress || {
          firstName: o.customerName?.split(' ')[0] || '',
          lastName: o.customerName?.split(' ').slice(1).join(' ') || '',
          phone: o.customerPhone,
          address: o.deliveryAddress,
          city: o.city,
          state: o.state,
          pinCode: o.pinCode,
        },
        _source: 'offerOrder' as const,
        refundStatus: o.refundStatus || (o.paymentStatus === 'Refunded' || o.paymentStatus === 'REFUNDED' ? 'refunded' : 'none'),
        totalRefundedAmount: o.refundAmount || (o.paymentStatus === 'Refunded' || o.paymentStatus === 'REFUNDED' ? o.totalAmount : 0),
        refunds: o.refunds || [],
      })) : [];
      const smartOrders = smartOrdRes.status === 'fulfilled' ? (smartOrdRes.value.data.data || []).filter(isValidPlacedOrder).map(normalizeSmartOrder) : [];
      setOrders([...offerOrders, ...smartOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const failed = [offRes, ordRes, smartOrdRes, prodRes, catRes].filter(r => r.status === 'rejected');
      if (failed.length) {
        failed.forEach(r => console.warn('[StoreDashboard] load failed:', (r as PromiseRejectedResult).reason?.response?.status, (r as PromiseRejectedResult).reason?.message));
        setLoadError(`Some data could not be loaded (${failed.length} source${failed.length > 1 ? 's' : ''}). Pull to refresh to retry.`);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, login]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <StoreDashboardContext.Provider value={{ store, offers, orders, products, categories, loading, noStore, loadError, refresh: loadData, newOrderCount, markOrdersAsSeen }}>
      {children}
    </StoreDashboardContext.Provider>
  );
}

export function useStoreDashboard(): StoreDashboardValue {
  const ctx = useContext(StoreDashboardContext);
  return (ctx || {}) as StoreDashboardValue;
}

export function useOptionalStoreDashboard(): StoreDashboardValue | undefined {
  return useContext(StoreDashboardContext);
}
