import { legacyProductClient, gatewayClient } from './client';

// Ported from client/app/admin/{order-history,product,users,dynamic-content}/page.tsx
// — all four hit LEGACY_PRODUCT_URL (wow-lifebackend.onrender.com), same as
// Category/Product/Cart on the customer side.
export const adminOrderApi = {
  getAll: () => gatewayClient.get('/api/admin/orders'),
  updateStatus: (orderId: string, orderStatus: string) => gatewayClient.put(`/api/admin/orders/${orderId}/status`, { status: orderStatus, orderStatus }),
};

export const adminUserApi = {
  getAll: () => gatewayClient.get(`/api/admin/users?t=${Date.now()}`),
  delete: (id: string) => gatewayClient.delete(`/api/admin/users/${id}`),
  updateRole: (id: string, role: string) => gatewayClient.put(`/api/admin/users/${id}/role`, { role }),
  createAdmin: (data: { fullname: string; email: string; password: string; mobilenumber?: string; role?: string }) => gatewayClient.post('/api/admin/users', data),
};

export const adminCategoryApi = {
  getAll: () => gatewayClient.get('/api/categories'),
  create: (name: string) => gatewayClient.post('/api/admin/categories', { name }),
  delete: (id: string) => gatewayClient.delete(`/api/admin/categories/${id}`),
};

export const adminProductApi = {
  getAll: () => gatewayClient.get(`/api/products?t=${Date.now()}`),
  create: (formData: FormData) => gatewayClient.post('/api/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => gatewayClient.put(`/api/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => gatewayClient.delete(`/api/admin/products/${id}`),
};

export const adminStatsApi = {
  getDashboardStats: () => gatewayClient.get(`/api/admin/stats?t=${Date.now()}`),
};

export const adminStoreApi = {
  getAll: () => gatewayClient.get(`/api/stores?t=${Date.now()}`),
  getById: (id: string) => gatewayClient.get(`/api/stores/${id}`),
  getAnalytics: (id: string) => gatewayClient.get(`/api/stores/${id}/analytics?range=all`),
  getProductsByStore: (storeId: string) => gatewayClient.get(`/api/products/store/${storeId}`),
  updateStatus: (id: string, status: string, isActive: boolean) => gatewayClient.patch(`/api/stores/${id}/status`, { status, isActive }),
  toggleVerify: (id: string, isVerified: boolean) => gatewayClient.patch(`/api/stores/${id}/verify`, { isVerified }),
  updateStore: (id: string, data: any) => gatewayClient.put(`/api/stores/${id}`, data),

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

export const adminNewsletterApi = {
  getSubscribers: (params: any = {}) =>
    gatewayClient.get('/api/newsletter/admin/subscribers', { params }),
  getStats: () =>
    gatewayClient.get('/api/newsletter/admin/stats'),
  deleteSubscriber: (id: string) =>
    gatewayClient.delete(`/api/newsletter/admin/subscribers/${id}`),
  sendCampaign: (payload: any) =>
    gatewayClient.post('/api/newsletter/admin/send', payload),
};



