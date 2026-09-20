import { gatewayClient } from './client';

// Ported from client/app/api-services/productApi.ts (GATEWAY_URL) — the
// Store Owner's product/category CRUD API. Named storeProductApi (not
// productApi) to avoid colliding with src/api/productApi.ts, which is the
// unrelated Customer-facing catalog browse API (LEGACY_PRODUCT_URL,
// read-only, different backend entirely — see endpoints.ts).
export const storeProductApi = {
  getAll: () => gatewayClient.get('/api/products'),
  getById: (id: string) => gatewayClient.get(`/api/products/${id}`),
  getByStore: (storeId: string) => gatewayClient.get(`/api/products/store/${storeId}`),
  getCategories: () => gatewayClient.get('/api/categories'),
  create: (data: FormData | any) => {
    if (data instanceof FormData || (data && typeof data.append === 'function')) {
      return gatewayClient.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    const fd = new FormData();
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (typeof v === 'object') {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, String(v));
      }
    });
    return gatewayClient.post('/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id: string, data: FormData | any) => {
    if (data instanceof FormData || (data && typeof data.append === 'function')) {
      return gatewayClient.put(`/api/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    const fd = new FormData();
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (typeof v === 'object') {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, String(v));
      }
    });
    return gatewayClient.put(`/api/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id: string) => gatewayClient.delete(`/api/products/${id}`),
  createCategory: (name: string) => gatewayClient.post('/api/categories', { name }),
  deleteCategory: (id: string) => gatewayClient.delete(`/api/categories/${id}`),
};
