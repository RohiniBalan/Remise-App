import { legacyMonolithClient } from './client';

// Ported from client/app/checkout/page.tsx and client/app/payment-status/page.tsx
// — both hardcode LEGACY_MONOLITH_URL (http://localhost:5000) rather than
// using NEXT_PUBLIC_API_URL, mirrored here rather than "fixed" per the
// plan's backend-mapping rule.
//
// Web's `redirectUrl` is `${window.location.origin}/payment-status` — the
// PhonePe-hosted checkout page redirects the *browser* back there after
// payment. Mobile has no "origin" of its own for PhonePe to redirect a
// WebView to, so it sends a sentinel URL instead
// (PAYMENT_RETURN_SENTINEL) and PhonePeWebViewScreen watches WebView
// navigation for that sentinel — same zero-backend-change interception
// pattern as GoogleAuthWebViewScreen. For 'cod' the backend never actually
// redirects anywhere (it returns `${redirectUrl}?orderId=...` directly,
// already carrying the order id), so no WebView is needed for that path.
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
}

export interface InitiatePaymentPayload {
  amount: number;
  userId?: string | null;
  redirectUrl: string;
  cartItems: CheckoutCartItem[];
  contactEmail: string;
  shippingAddress: AddressData;
  billingAddress: AddressData;
  paymentMethod: 'phonepe' | 'cod';
}

export const paymentApi = {
  initiate: (payload: InitiatePaymentPayload) => legacyMonolithClient.post('/api/payment/initiate', payload),
  getStatus: (orderId: string) => legacyMonolithClient.get(`/api/payment/status/${orderId}`),
};

export function extractOrderId(url: string): string {
  const match = url.match(/orderId=([^&]+)/);
  return match ? match[1] : '';
}
