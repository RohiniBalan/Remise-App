import { legacyProductClient } from './client';

// Ported from client/app/admin/{order-history,product,users,dynamic-content}/page.tsx
// — all four hit LEGACY_PRODUCT_URL (wow-lifebackend.onrender.com), same as
// Category/Product/Cart on the customer side.
export const adminOrderApi = {
  getAll: () => legacyProductClient.get('/admin/orders'),
  updateStatus: (orderId: string, orderStatus: string) => legacyProductClient.put(`/admin/orders/${orderId}/status`, { status: orderStatus, orderStatus }),
};

export const adminUserApi = {
  getAll: () => legacyProductClient.get(`/admin/users?t=${Date.now()}`),
};

export const adminCategoryApi = {
  getAll: () => legacyProductClient.get('/admin/categories'),
  create: (name: string) => legacyProductClient.post('/admin/categories', { name }),
  delete: (id: string) => legacyProductClient.delete(`/admin/categories/${id}`),
};

export const adminProductApi = {
  getAll: () => legacyProductClient.get(`/admin/products?t=${Date.now()}`),
  create: (formData: FormData) => legacyProductClient.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => legacyProductClient.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => legacyProductClient.delete(`/admin/products/${id}`),
};

export const adminStatsApi = {
  getDashboardStats: () => legacyProductClient.get(`/admin/stats?t=${Date.now()}`),
};

export const adminStoreApi = {
  getAll: () => legacyProductClient.get(`/stores?t=${Date.now()}`),
  getById: (id: string) => legacyProductClient.get(`/stores/${id}`),
  getAnalytics: (id: string) => legacyProductClient.get(`/stores/${id}/analytics?range=all`),
  getProductsByStore: (storeId: string) => legacyProductClient.get(`/products/store/${storeId}`),
  updateStatus: (id: string, status: string, isActive: boolean) => legacyProductClient.patch(`/stores/${id}/status`, { status, isActive }),
  toggleVerify: (id: string, isVerified: boolean) => legacyProductClient.patch(`/stores/${id}/verify`, { isVerified }),
  updateStore: (id: string, data: any) => legacyProductClient.put(`/stores/${id}`, data),
};

