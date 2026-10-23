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
  rating?: number;
  reviewCount?: number;
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

  // Fetch full details of a single order (Customer / Store)
  getOrderDetails: (orderId: string) =>
    gatewayClient.get(`/api/orders/${orderId}`),

  // Live order tracking data for Customer & Store Owner
  getOrderTracking: (orderId: string) =>
    gatewayClient.get(`/api/orders/${orderId}/track`),

  createRefund: (payload: RefundRequest) =>
    gatewayClient.post('/api/payment/refund', payload),

  cancelOrder: (orderId: string, reason?: string) =>
    gatewayClient.post(`/api/orders/${orderId}/cancel`, { reason }),

  // Customer: Request / Resend return package verification OTP via WhatsApp
  requestReturnOtp: (orderId: string) =>
    gatewayClient.post(`/api/orders/${orderId}/return-otp`),

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
    platformFee?: number;
    deliveryFee?: number;
    cartItems: Array<{ id: string; title: string; price: number; quantity: number; image?: string | null }>;
    contactEmail: string;
    shippingAddress: Record<string, any>;
    userId?: string | null;
    storeId: string;
    storeName: string;
    deliveryMethod: 'pickup' | 'delivery';
    paymentMethod: 'cod' | 'qr' | 'razorpay' | 'credit';
  }) =>
    gatewayClient.post('/api/payment/initiate', {
      ...payload,
      billingAddress: payload.shippingAddress,
      // Web uses `${origin}/my-orders`; mobile has no origin, and since
      // cod/qr never actually redirect anywhere (see note above) this
      // value only ever gets echoed back as the `?orderId=` prefix, never
      // navigated to.
      redirectUrl: 'https://payment-return.remise-app.internal/orders',
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

  // Store Owner: Request Shadowfax / Remise Delivery Network partner for an order
  requestRemiseDelivery: (orderId: string, payload: { distanceKm?: number; deliveryFee?: number; pickupAddress?: string; dropAddress?: string; instructions?: string; pickupLatitude?: number; pickupLongitude?: number; dropLatitude?: number; dropLongitude?: number }) =>
    gatewayClient.post(`/api/orders/${orderId}/request-remise-delivery`, payload),

  // Store Owner: Check Shadowfax serviceability
  checkShadowfaxServiceability: (orderId: string, payload: { pickupLatitude?: number; pickupLongitude?: number; dropLatitude?: number; dropLongitude?: number }) =>
    gatewayClient.post(`/api/orders/${orderId}/shadowfax/serviceability`, payload),

  // Store Owner: Cancel Shadowfax delivery
  cancelShadowfaxDelivery: (orderId: string, reason: string) =>
    gatewayClient.post(`/api/orders/${orderId}/shadowfax/cancel`, { reason }),

  // Store Owner: Retry Shadowfax delivery
  retryShadowfaxDelivery: (orderId: string) =>
    gatewayClient.post(`/api/orders/${orderId}/shadowfax/retry`, {}),

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

  updateDeliveryPartnerStatus: (orderId: string, status: string, note?: string, otp?: string) => gatewayClient.post(`/api/orders/delivery/partner/${orderId}/status`, { status, note, otp }),

  // Store Owner: Confirm Self Pickup delivery via customer OTP
  confirmSelfPickupOtp: (orderId: string, otp: string) =>
    gatewayClient.post(`/api/orders/${orderId}/confirm-self-pickup`, { otp }),

  // Store Owner: Generate or reuse Razorpay Payment Link / QR for COD + Self Pickup
  createStorePickupPaymentLink: async (orderId: string) => {
    try {
      return await gatewayClient.post(`/api/orders/${orderId}/store-payment-link`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.includes('ECONNREFUSED') || msg.includes('3005') || err?.response?.status === 500) {
        try {
          return await gatewayClient.post('/api/payment/internal/create-pickup-payment-link', { orderId });
        } catch (directErr) {}
      }
      throw err;
    }
  },

  // Store Owner: Check in-store online payment status with Razorpay
  getStorePaymentStatus: async (orderId: string) => {
    try {
      return await gatewayClient.get(`/api/orders/${orderId}/store-payment-status`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.includes('ECONNREFUSED') || msg.includes('3005') || err?.response?.status === 500) {
        try {
          return await gatewayClient.post('/api/payment/internal/verify-payment-link', { orderId });
        } catch (directErr) {}
      }
      throw err;
    }
  },

  // Store Owner / Driver: Verify Order OTP (Self Pickup or Authenticated Delivery)
  verifyOrderOtp: (orderId: string, otp: string) =>
    gatewayClient.post(`/api/orders/${orderId}/verify-otp`, { otp }),

  // Delivery Person / Driver: Verify Order OTP via public delivery token
  verifyDeliveryPortalOtp: (token: string, otp: string) =>
    gatewayClient.post(`/api/orders/delivery-portal/${token}/verify-otp`, { otp }),

  // Delivery Payment Preference & Razorpay Payment Link
  setDeliveryPartnerPaymentPreference: async (orderId: string, preference: 'CASH' | 'ONLINE') => {
    try {
      return await gatewayClient.post(`/api/orders/delivery/partner/${orderId}/payment-preference`, { preference });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (preference === 'ONLINE' && (msg.includes('ECONNREFUSED') || msg.includes('3005') || err?.response?.status === 500)) {
        try {
          return await gatewayClient.post('/api/payment/internal/create-delivery-payment-link', { orderId });
        } catch (directErr) {}
      }
      throw err;
    }
  },

  createDeliveryPaymentLink: (orderId: string) =>
    gatewayClient.post('/api/payment/internal/create-delivery-payment-link', { orderId }),

  setDeliveryPortalPaymentPreference: (token: string, preference: 'CASH' | 'ONLINE') =>
    gatewayClient.post(`/api/orders/delivery-portal/${token}/payment-preference`, { preference }),

  // Common Payment Preference for Customer, Delivery Partner, and Store Owner
  setPaymentPreference: (orderId: string, preference: 'CASH' | 'ONLINE') =>
    gatewayClient.post(`/api/orders/${orderId}/payment-preference`, { preference }),

  initiateCodOnline: (orderId: string, deliveryToken?: string) =>
    gatewayClient.post('/api/payment/initiate-cod-online', { orderId, token: deliveryToken }),

  confirmCodCollection: (orderId: string, amount?: number, notes?: string) =>
    gatewayClient.post(`/api/orders/${orderId}/confirm-cod-collection`, { amount, notes }),

  resendPaymentPreferencePrompt: (orderId: string) =>
    gatewayClient.post('/api/orders/resend-payment-preference', { orderId }),

  resendPaymentLinkWhatsApp: (orderId: string) =>
    gatewayClient.post('/api/orders/resend-payment-link', { orderId }),
};


