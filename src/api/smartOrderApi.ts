import { gatewayClient } from './client';

// Ported 1:1 from client/app/api-services/smartOrderApi.ts (GATEWAY_URL).
// Note: placeOrder posts to the SAME /api/payment/initiate route used by
// the main Checkout flow (just reached via the gateway instead of the
// legacy monolith) — for 'cod' AND 'qr' the backend never actually
// redirects anywhere, it returns `${redirectUrl}?orderId=...` directly, so
// this flow never needs a WebView (unlike Checkout's 'phonepe' path).
export interface SmartOrderCartItem { name: string; quantity: string }

export interface MatchedLine {
  requestedName: string;
  requestedQuantity: string;
  product: { id: string; title: string; price: number; image: string | null };
  matchScore: number;
  lineTotal: number;
}

export interface InsufficientLine {
  requestedName: string;
  requestedQuantity: string;
  product: { id: string; title: string; price: number; availableStock: number };
}

export interface StoreResult {
  storeId: string;
  storeName: string;
  distanceKm: number;
  matched: MatchedLine[];
  insufficientStock: InsufficientLine[];
  unmatched: string[];
  matchedCount: number;
  totalRequested: number;
  totalAmount: number;
}

export const smartOrderApi = {
  getNearbyStores: (lat: number, lng: number, radius = 10) =>
    gatewayClient.get('/api/stores/nearby', { params: { lat, lng, radius } }),

  // Orders placed against a store via Smart Order Comparison (order-service),
  // for StoreDashboardContext to merge alongside OfferOrder-based orders.
  getStoreOrders: (storeId: string) => gatewayClient.get(`/api/orders/store/${storeId}`),

  // Customer's own orders placed via Smart Order Comparison (order-service) —
  // for OrdersScreen to merge alongside legacy-monolith cart-checkout orders.
  getMyOrders: (userId: string, email: string) =>
    gatewayClient.get('/api/orders/my-orders', { params: { userId, email } }),

  matchCart: (items: SmartOrderCartItem[], storeIds: string[]) =>
    gatewayClient.post('/api/products/match-cart', { items, storeIds }),

  placeOrder: (payload: {
    amount: number;
    cartItems: Array<{ id: string; title: string; price: number; quantity: number; image?: string | null }>;
    contactEmail: string;
    shippingAddress: Record<string, any>;
    userId?: string | null;
    storeId: string;
    storeName: string;
    deliveryMethod: 'pickup' | 'delivery';
    paymentMethod: 'cod' | 'qr';
  }) =>
    gatewayClient.post('/api/payment/initiate', {
      ...payload,
      billingAddress: payload.shippingAddress,
      // Web uses `${origin}/my-orders`; mobile has no origin, and since
      // cod/qr never actually redirect anywhere (see note above) this
      // value only ever gets echoed back as the `?orderId=` prefix, never
      // navigated to.
      redirectUrl: 'https://payment-return.remise-app.internal/my-orders',
    }),

  confirmQrPayment: (orderId: string, screenshotUri?: string | null) => {
  const fd = new FormData();
  if (screenshotUri) {
    fd.append('screenshot', { uri: screenshotUri, name: 'payment-screenshot.jpg', type: 'image/jpeg' } as any);
  }
  return gatewayClient.patch(`/api/orders/${orderId}/confirm-payment`, fd);
},
};
