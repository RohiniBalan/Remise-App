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

export const orderApi = {
  getMyOrders: (userId: string, email: string) =>
    legacyMonolithClient.get(`/api/orders/my-orders?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`),
};
