import { gatewayClient } from './client';

// Ported from client/app/api-services/storeApi.ts (GATEWAY_URL).
export const storeApi = {
  register: (formData: FormData) =>
  gatewayClient.post('/api/stores', formData),

  getMyStore: () => gatewayClient.get('/api/stores/me/my-store'),

  getById: (id: string) => gatewayClient.get(`/api/stores/${id}`),

  update: (id: string, formData: FormData) =>
  gatewayClient.put(`/api/stores/${id}`, formData),

  getAll: () => gatewayClient.get('/api/stores'),

  getByIds: (ids: string[]) => gatewayClient.get('/api/stores/by-ids', { params: { ids: ids.join(',') } }),

  syncRole: () => gatewayClient.post('/api/stores/me/sync-role'),

  onboardCashfree: (data: any) =>
    gatewayClient.post('/api/stores/me/cashfree-onboard', data),

  getCashfreeStatus: () =>
    gatewayClient.get('/api/stores/me/cashfree-status'),

  // Backwards-compatible aliases
  onboardRazorpay: (data: any) =>
    gatewayClient.post('/api/stores/me/cashfree-onboard', data),

  getRazorpayStatus: () =>
    gatewayClient.get('/api/stores/me/cashfree-status'),
};
