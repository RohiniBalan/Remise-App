import { gatewayClient } from './client';

// Ported from client/app/api-services/offersApi.ts (GATEWAY_URL).
export interface OrderAgainstOfferPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  quantity: number;
  notes?: string;
}

export const offersApi = {
  getNearby: (lat: number, lng: number, radius = 10) =>
    gatewayClient.get('/api/offers/nearby', { params: { lat, lng, radius } }),

  getById: (id: string) => gatewayClient.get(`/api/offers/${id}`),

  placeOrder: (offerId: string, payload: OrderAgainstOfferPayload) =>
    gatewayClient.post(`/api/offers/${offerId}/order`, payload),

  create: (formData: FormData) => gatewayClient.post('/api/offers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByStore: (storeId: string) => gatewayClient.get(`/api/offers/store/${storeId}`),
  update: (id: string, formData: FormData) => gatewayClient.put(`/api/offers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => gatewayClient.delete(`/api/offers/${id}`),
  getStoreOrders: (storeId: string) => gatewayClient.get(`/api/offers/orders/store/${storeId}`),
  updateOrderStatus: (orderId: string, status: string) => gatewayClient.patch(`/api/offers/orders/${orderId}/status`, { status }),
};
