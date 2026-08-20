import { legacyMonolithClient, gatewayClient } from './client';

// Ported from client/app/orders/page.tsx — same LEGACY_MONOLITH_URL
// endpoint and query-param shape (userId + email, both pulled from the
// stored user object, same as web reading localStorage.user).
export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderData {
  _id: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus?: string;
  deliveryMode?: string;
  createdAt: string;
  items: OrderItem[];
}


// Shape sent when placing a wholesale (supplier) order — one entry per
// supplier store in the cart, mirroring StoreSupplierCartScreen's
// `orderGroups` construction.
export interface WholesaleOrderGroup {
  storeId: string;
  storeName: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string | null;
    moq: number;
    tierLabel: string | null;
  }[];
  totalAmount: number;
}

export interface WholesaleContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export const orderApi = {
  // Legacy monolith's simple orders route (routes/orders.js) — only exposes
  // /my-orders, so this one stays on legacyMonolithClient.
  getMyOrders: (userId: string, email: string) =>
    legacyMonolithClient.get(`/api/orders/my-orders?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`),

  // FIX: /wholesale and /buyer/:buyerId live on the order MICROSERVICE
  // behind the gateway (GATEWAY_URL) — a separate router (with
  // controllers/authMiddleware, protect+authorize) from the legacy
  // monolith's routes/orders.js above, which has no wholesale route at
  // all. Was pointed at legacyMonolithClient + a `/wholesale/mine/:id`
  // path that doesn't exist anywhere on the backend — the real route is
  // GET /api/orders/buyer/:buyerId. `ownerId` here should be the signed-in
  // user's own id (matches the route's `authorize('user','store_owner')`
  // check on the buyer's own account), same value store.ownerId already
  // holds.
  getMyWholesaleOrders: (ownerId: string) =>
    gatewayClient.get(`/api/orders/buyer/${encodeURIComponent(ownerId)}`),

  placeWholesaleOrders: (orderGroups: WholesaleOrderGroup[], contact: WholesaleContactInfo) =>
    gatewayClient.post('/api/orders/wholesale', { orderGroups, contact }),

  getInvoice: (orderId: string) =>
    gatewayClient.get(`/api/orders/${orderId}/invoice`),

  getInvoicePdfUrl: (orderId: string) => {
    const base = gatewayClient.defaults.baseURL || 'https://ecom.porulontech.com';
    return `${base}/api/orders/${orderId}/invoice/pdf`;
  },
};