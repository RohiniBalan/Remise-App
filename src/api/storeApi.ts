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
};

