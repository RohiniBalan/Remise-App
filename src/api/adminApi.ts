import { legacyProductClient, gatewayClient } from './client';

// Ported from client/app/admin/{order-history,product,users,dynamic-content}/page.tsx
// — all four hit LEGACY_PRODUCT_URL (wow-lifebackend.onrender.com), same as
// Category/Product/Cart on the customer side.
export const adminOrderApi = {
  getAll: () => legacyProductClient.get('/admin/orders'),
  updateStatus: (orderId: string, orderStatus: string) => legacyProductClient.put(`/admin/orders/${orderId}/status`, { status: orderStatus, orderStatus }),
};

export const adminUserApi = {
  getAll: () => legacyProductClient.get(`/admin/users?t=${Date.now()}`),
  delete: (id: string) => legacyProductClient.delete(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => legacyProductClient.patch(`/admin/users/${id}/role`, { role }),
  createAdmin: (data: { fullname: string; email: string; password: string; mobilenumber?: string; role?: string }) => legacyProductClient.post('/admin/users', data),
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

  // Store Registrations Management APIs (Gateway -> store-service)
  getRegistrations: (params: any = {}) => gatewayClient.get('/api/stores/admin/registrations', { params }),
  getRegistrationById: (id: string) => gatewayClient.get(`/api/stores/admin/registrations/${id}`),
  resendRegistrationEmail: (id: string) => gatewayClient.post(`/api/stores/admin/registrations/${id}/resend-email`),
};

export const adminDeliveryPartnerApi = {
  getAll: (status?: string) =>
    gatewayClient.get(status ? `/api/admin/delivery-partners?status=${status}` : '/api/admin/delivery-partners'),
  performAction: (id: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND') =>
    gatewayClient.patch(`/api/admin/delivery-partners/${id}/action`, { action }),
};


