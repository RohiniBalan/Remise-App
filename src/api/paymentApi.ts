import { gatewayClient } from './client';

export const PAYMENT_RETURN_HOST = 'payment-return.remise-app.internal';
export const PAYMENT_RETURN_SENTINEL = `https://${PAYMENT_RETURN_HOST}/return`;

export interface AddressData {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
}

export interface CheckoutCartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
  totalStock?: number;
  storeId?: string | null;
}

export interface InitiatePaymentPayload {
  amount: number;
  userId?: string | null;
  redirectUrl: string;
  cartItems: CheckoutCartItem[];
  contactEmail: string;
  shippingAddress: AddressData;
  billingAddress: AddressData;
  paymentMethod: 'razorpay' | 'cod' | 'phonepe' | 'qr';
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export const paymentApi = {
  createOrder: (payload: InitiatePaymentPayload) =>
    gatewayClient.post('/api/payment/create-order', payload),

  initiate: (payload: InitiatePaymentPayload) =>
    gatewayClient.post('/api/payment/create-order', payload),

  verify: (payload: VerifyPaymentPayload) =>
    gatewayClient.post('/api/payment/verify', payload),

  getStatus: (orderId: string) =>
    gatewayClient.get(`/api/payment/status/${orderId}`),

  cancel: (orderId: string, reason?: string) =>
    gatewayClient.post('/api/payment/cancel', { orderId, reason }),
};


export function extractOrderId(url: string): string {
  const match = url.match(/orderId=([^&]+)/);
  return match ? match[1] : '';
}

