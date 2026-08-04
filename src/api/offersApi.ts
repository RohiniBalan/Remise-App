import { gatewayClient, gatewayClientPublic } from './client';

// Ported from client/app/api-services/offersApi.ts (GATEWAY_URL). Web only
// attaches an Authorization header to the mutation/private calls (create,
// update, delete, getStoreOrders, updateOrderStatus, getMyOffers) — getNearby,
// getById, getByStore, getActive and placeOrder are all called with zero
// headers on web, i.e. anonymously, even when the user is logged in. Mirrored
// exactly below via gatewayClientPublic for those five.
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
    gatewayClientPublic.get('/api/offers/nearby', { params: { lat, lng, radius } }),

  getById: (id: string) => gatewayClientPublic.get(`/api/offers/${id}`),

  placeOrder: (offerId: string, payload: OrderAgainstOfferPayload) =>
    gatewayClientPublic.post(`/api/offers/${offerId}/order`, payload),

  getByStore: (storeId: string) => gatewayClientPublic.get(`/api/offers/store/${storeId}`),

  getActive: (limit = 4) =>
    gatewayClientPublic.get('/api/offers/active', { params: { limit } }),

  create: (formData: FormData) => gatewayClient.post('/api/offers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => gatewayClient.put(`/api/offers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => gatewayClient.delete(`/api/offers/${id}`),
  getStoreOrders: (storeId: string) => gatewayClient.get(`/api/offers/orders/store/${storeId}`),
  updateOrderStatus: (orderId: string, status: string) => gatewayClient.patch(`/api/offers/orders/${orderId}/status`, { status }),

  // Was '/api/offers/mine' — web hits '/api/offers/my'. The wrong path is
  // why My Offers showed nothing rather than an error: a 404/empty response
  // on a slightly-off path fails the same silent way a "no offers" response
  // would in the try/catch in MyOffersScreen.tsx.
  getMyOffers: (token: string) =>
    gatewayClient.get('/api/offers/my', { headers: { Authorization: `Bearer ${token}` } }),
};

