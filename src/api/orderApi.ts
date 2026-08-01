import { legacyMonolithClient } from './client';

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
  getMyOrders: (userId: string, email: string) =>
    legacyMonolithClient.get(`/api/orders/my-orders?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`),

  // Store-owner's own wholesale/supplier orders — orders THIS store placed
  // as a buyer from other suppliers, not orders customers placed with this
  // store (that's offersApi/smartOrderApi, handled elsewhere).
  getMyWholesaleOrders: (ownerId: string) =>
    legacyMonolithClient.get(`/api/orders/wholesale/mine/${encodeURIComponent(ownerId)}`),

  // Places one order per supplier group in a single call — backend should
  // create len(orderGroups) separate Order documents server-side.
  placeWholesaleOrders: (orderGroups: WholesaleOrderGroup[], contact: WholesaleContactInfo) =>
    legacyMonolithClient.post('/api/orders/wholesale', { orderGroups, contact }),
};