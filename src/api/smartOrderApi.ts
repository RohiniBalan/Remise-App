import { gatewayClient } from './client';

// Ported 1:1 from client/app/api-services/smartOrderApi.ts (GATEWAY_URL).
// Note: placeOrder posts to the SAME /api/payment/initiate route used by
// the main Checkout flow (just reached via the gateway instead of the
// legacy monolith) — for 'cod' AND 'qr' the backend never actually
// redirects anywhere, it returns `${redirectUrl}?orderId=...` directly, so
// this flow never needs a WebView (unlike Checkout's 'phonepe' path).
export interface SmartOrderCartItem { name: string; quantity: string }

export interface RefundRequest {
  orderId: string;
  refundAmount: number;
  refundNote?: string;
}

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
  getNearbyStores: (lat: number, lng: number, radius = 10, storeType?: string) =>
    gatewayClient.get('/api/stores/nearby', { params: { lat, lng, radius, storeType } }),

  // Orders placed against a store via Smart Order Comparison (order-service),
  // for StoreDashboardContext to merge alongside OfferOrder-based orders.
  getStoreOrders: (storeId: string) => gatewayClient.get(`/api/orders/store/${storeId}`),

  // Customer's own orders placed via Smart Order Comparison (order-service) —
  // for OrdersScreen to merge alongside legacy-monolith cart-checkout orders.
  getMyOrders: (userId: string, email: string) =>
    gatewayClient.get('/api/orders/my-orders', { params: { userId, email } }),

  // Live order tracking data for Customer & Store Owner
  getOrderTracking: (orderId: string) =>
    gatewayClient.get(`/api/orders/${orderId}/track`),

  createRefund: (payload: RefundRequest) =>
    gatewayClient.post('/api/payment/refund', payload),

  matchCart: (
    items: SmartOrderCartItem[],
    storeIds: string[],
    ownerRole?: string,
    requireAll: boolean = true,
  ) =>
    gatewayClient.post('/api/products/match-cart', {
      items,
      storeIds,
      ownerRole,
      requireAll,
    }),

  placeOrder: (payload: {
    amount: number;
    cartItems: Array<{ id: string; title: string; price: number; quantity: number; image?: string | null }>;
    contactEmail: string;
    shippingAddress: Record<string, any>;
    userId?: string | null;
    storeId: string;
    storeName: string;
    deliveryMethod: 'pickup' | 'delivery';
    paymentMethod: 'cod' | 'qr' | 'razorpay';
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

  confirmQrPayment: (orderId: string, screenshotUri?: string | null, utr?: string | null) => {
    const fd = new FormData();
    if (screenshotUri) {
      fd.append('screenshot', { uri: screenshotUri, name: 'payment-screenshot.jpg', type: 'image/jpeg' } as any);
    }
    if (utr) {
      fd.append('utr', utr);
    }
    return gatewayClient.patch(`/api/orders/${orderId}/confirm-payment`, fd);
  },

  getInvoice: (orderId: string) =>
    gatewayClient.get(`/api/orders/${orderId}/invoice`),

  getInvoicePdfUrl: (orderId: string) => {
    const base = gatewayClient.defaults.baseURL || 'https://remise.digital';
    return `${base}/api/orders/${orderId}/invoice/pdf`;
  },

  // Store Owner: Generate unique delivery link for an order (Store / Own delivery person)
  generateDeliveryLink: (orderId: string, payload: { deliveryPersonName?: string; deliveryPersonPhone?: string; vehicleType?: string; vehicleNumber?: string; notes?: string }) =>
    gatewayClient.post(`/api/orders/${orderId}/delivery-link`, payload),

  // Store Owner: Request Remise Delivery Network partner for an order
  requestRemiseDelivery: (orderId: string, payload: { distanceKm?: number; deliveryFee?: number; pickupAddress?: string; dropAddress?: string; instructions?: string }) =>
    gatewayClient.post(`/api/orders/${orderId}/request-remise-delivery`, payload),

  // Store Owner: Set delivery mode (own_delivery, portal_delivery, self_arrange)
  setDeliveryMode: (orderId: string, payload: { mode: 'own_delivery' | 'portal_delivery' | 'self_arrange'; notes?: string }) =>
    gatewayClient.patch(`/api/orders/${orderId}/delivery-mode`, payload),

  // Store Owner: Direct delivery status update
  updateDeliveryStatusDirect: (orderId: string, payload: { status: string; notes?: string }) =>
    gatewayClient.patch(`/api/orders/${orderId}/delivery-status`, payload),

  // Store Owner: Enroll / Update Remise Delivery Portal Network
  enrollDeliveryPortal: (payload: { enabled?: boolean; hasOwnDelivery?: boolean }) =>
    gatewayClient.patch('/api/stores/delivery-portal/enroll', payload),

  // Store Owner: Delivery Persons Management
  getStoreDeliveryPersons: () =>
    gatewayClient.get('/api/stores/delivery-persons'),

  addStoreDeliveryPerson: (payload: { name: string; phone: string; vehicleType?: string }) =>
    gatewayClient.post('/api/stores/delivery-persons', payload),

  updateStoreDeliveryPerson: (personId: string, payload: { name?: string; phone?: string; vehicleType?: string; status?: string; isActive?: boolean }) =>
    gatewayClient.patch(`/api/stores/delivery-persons/${personId}`, payload),

  deleteStoreDeliveryPerson: (personId: string) =>
    gatewayClient.delete(`/api/stores/delivery-persons/${personId}`),

  applyAsDeliveryPartner: (payload: { vehicleType: string; vehicleNumber: string; address?: string; verificationDetails?: Record<string, unknown> }) =>
    gatewayClient.post('/api/user/delivery-partner/apply', payload),

  getDeliveryPartnerProfile: () => gatewayClient.get('/api/user/delivery-partner/profile'),

  updateDeliveryPartnerProfile: (payload: { fullname?: string; mobilenumber?: string; vehicleType?: string; vehicleNumber?: string; address?: string }) =>
    gatewayClient.put('/api/user/delivery-partner/profile', payload),

  updateDeliveryPartnerAvailability: (availability: 'AVAILABLE' | 'OFFLINE', coordinates?: [number, number]) =>
    gatewayClient.patch('/api/user/delivery-partner/availability', { availability, coordinates }),

  getDeliveryPartnerDashboard: () => gatewayClient.get('/api/orders/delivery/partner/dashboard'),

  acceptDeliveryPartnerRequest: (orderId: string) => gatewayClient.post(`/api/orders/delivery/partner/requests/${orderId}/accept`),

  declineDeliveryPartnerRequest: (orderId: string, reason?: string) => gatewayClient.post(`/api/orders/delivery/partner/requests/${orderId}/decline`, { reason }),

  updateDeliveryPartnerStatus: (orderId: string, status: string, note?: string) => gatewayClient.post(`/api/orders/delivery/partner/${orderId}/status`, { status, note }),
};


