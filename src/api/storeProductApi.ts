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
  create: (formData: FormData) => gatewayClient.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => gatewayClient.put(`/api/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => gatewayClient.delete(`/api/products/${id}`),
  createCategory: (name: string) => gatewayClient.post('/api/categories', { name }),
  deleteCategory: (id: string) => gatewayClient.delete(`/api/categories/${id}`),
};
