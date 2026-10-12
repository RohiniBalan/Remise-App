import { gatewayClient } from './client';

// Ported from client/app/api-services/storeApi.ts (GATEWAY_URL).
export const storeApi = {
  register: (formData: FormData) =>
    gatewayClient.post('/api/stores', formData, {
      transformRequest: (data) => data,
    }),

  getMyStore: () => gatewayClient.get('/api/stores/me/my-store'),

  getById: (id: string) => gatewayClient.get(`/api/stores/${id}`),

  update: (id: string, formData: FormData) =>
    gatewayClient.put(`/api/stores/${id}`, formData, {
      transformRequest: (data) => data,
    }),

  getAll: () => gatewayClient.get('/api/stores'),

  getByIds: (ids: string[]) => gatewayClient.post('/api/stores/batch', { ids }),

  syncRole: () => gatewayClient.post('/api/stores/me/sync-role'),

  onboardRazorpay: (data: any) =>
    gatewayClient.post('/api/stores/me/razorpay-onboard', data),

  getRazorpayStatus: () =>
    gatewayClient.get('/api/stores/me/razorpay-status'),

  // Cashfree SecureID / KYC Stack Identity Verifications
  verifyPan: (pan: string, name?: string) =>
    gatewayClient.post('/api/stores/verify/pan', { pan, name }),

  verifyGstin: (gstin: string, name?: string, pan?: string) =>
    gatewayClient.post('/api/stores/verify/gstin', { gstin, name, pan }),

  generateAadhaarOtp: (aadhaarNumber: string) =>
    gatewayClient.post('/api/stores/verify/aadhaar/otp', { aadhaarNumber }),

  verifyAadhaarOtp: (refId: string, otp: string, name?: string) =>
    gatewayClient.post('/api/stores/verify/aadhaar/verify', { refId, otp, name }),

  verifyAadhaarDirect: (aadhaarNumber: string, name?: string) =>
    gatewayClient.post('/api/stores/verify/aadhaar/direct', { aadhaarNumber, name }),

  verifyIFSC: (ifsc: string) =>
    gatewayClient.post('/api/stores/verify/ifsc', { ifsc }),

  verifyBankAccount: (accountNumber: string, ifsc: string, name?: string, phone?: string) =>
    gatewayClient.post('/api/stores/verify/bank-account', { accountNumber, ifsc, name, phone }),

  crossVerifyAll: (data: {
    pan?: string;
    aadhaar?: string;
    gstin?: string;
    bankAccount?: { accountNumber: string; ifsc: string };
    name?: string;
    storeName?: string;
  }) => gatewayClient.post('/api/stores/verify/all', data),

  // Store Review & Rating APIs
  checkReviewEligibility: (orderId: string, storeId?: string) =>
    gatewayClient.get('/api/stores/reviews/eligibility', {
      params: { orderId, ...(storeId ? { storeId } : {}) },
    }),

  submitReview: (payload: any) =>
    gatewayClient.post('/api/stores/reviews', payload),

  getCustomerReviewByOrder: (orderId: string) =>
    gatewayClient.get(`/api/stores/reviews/order/${orderId}`),

  getMyReviews: () =>
    gatewayClient.get('/api/stores/reviews/my'),

  getMyStoreReviews: (params?: any) =>
    gatewayClient.get('/api/stores/me/reviews', { params }),

  getStoreReviews: (storeId: string, params?: any) =>
    gatewayClient.get(`/api/stores/${storeId}/reviews`, { params }),

  getStoreRatingSummary: (storeId: string) =>
    gatewayClient.get(`/api/stores/${storeId}/reviews/summary`),
};

