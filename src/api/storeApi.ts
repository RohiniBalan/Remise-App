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

  syncRole: () => gatewayClient.post('/api/stores/me/sync-role'),
};
