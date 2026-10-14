import { gatewayClient } from './client';

export interface RepaymentPolicy {
  policyType: 'weekly' | 'monthly' | 'custom_days' | 'specific_date';
  weeklyDay?: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  monthlyDayOfMonth?: number;
  customDaysCount?: number;
  specificDueDate?: string;
}

export interface CreditAccount {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  storeId: string;
  storeName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REVOKED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  creditLimit: number;
  outstandingBalance: number;
  reservedCreditAmount: number;
  repaymentPolicy: RepaymentPolicy;
  nextDueDate?: string;
  isOverdue?: boolean;
  availableCredit?: number;
  customerAgreed?: boolean;
  identityVerification?: {
    idType: 'aadhaar' | 'voter_id' | 'pan' | 'driving_license';
    idNumberMasked: string;
    nameOnId: string;
    verifiedInPerson: boolean;
    consentGiven: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreditLedgerEntry {
  _id: string;
  accountId: string;
  customerId: string;
  storeId: string;
  orderId?: string;
  repaymentId?: string;
  receiptNumber?: string;
  amount: number;
  transactionType: 'RESERVATION' | 'RELEASE' | 'PURCHASE_DEBT' | 'REPAYMENT' | 'ADJUSTMENT' | 'REFUND_CREDIT';
  balanceAfter: number;
  status: 'COMPLETED' | 'PENDING' | 'REVERSED' | 'FAILED';
  actorId?: string;
  actorRole?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export const creditApi = {
  checkEligibility: (storeId: string, amount: number = 0, paymentMethod: string = 'credit') =>
    gatewayClient.get('/api/orders/credit/check-eligibility', {
      params: { storeId, amount, paymentMethod },
    }),

  getMyCreditAccounts: () =>
    gatewayClient.get('/api/orders/credit/my-accounts'),

  getMyStoreCreditAccount: (storeId: string) =>
    gatewayClient.get(`/api/orders/credit/store/${storeId}/my-account`),

  getStoreCreditAccounts: (storeId: string, params?: { status?: string; search?: string }) =>
    gatewayClient.get(`/api/orders/credit/store/${storeId}/accounts`, { params }),

  createInPersonApplication: (data: {
    storeId: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    creditLimit: number;
    repaymentPolicy: RepaymentPolicy;
    idType: string;
    idNumber: string;
    nameOnId: string;
    customerAgreed: boolean;
    consentGiven: boolean;
  }) => gatewayClient.post('/api/orders/credit/applications/in-person', data),

  approveOrRejectApplication: (
    accountId: string,
    action: 'approve' | 'reject',
    data?: { creditLimit?: number; repaymentPolicy?: RepaymentPolicy; rejectionReason?: string }
  ) =>
    gatewayClient.patch(`/api/orders/credit/applications/${accountId}/decision`, { action, ...data }),

  updateCreditTerms: (
    accountId: string,
    data: { creditLimit: number; repaymentPolicy: RepaymentPolicy; reason: string }
  ) => gatewayClient.patch(`/api/orders/credit/accounts/${accountId}/terms`, data),

  suspendOrRevokeAccount: (
    accountId: string,
    status: 'SUSPENDED' | 'REVOKED' | 'APPROVED',
    reason: string
  ) => gatewayClient.patch(`/api/orders/credit/accounts/${accountId}/status`, { status, reason }),

  recordCashRepayment: (accountId: string, amount: number, notes: string = '', paymentMethod: string = 'cash') =>
    gatewayClient.post(`/api/orders/credit/accounts/${accountId}/repay-cash`, { amount, notes, paymentMethod }),

  getAccountLedger: (accountId: string) =>
    gatewayClient.get(`/api/orders/credit/accounts/${accountId}/ledger`),

  searchCustomers: (query: string) =>
    gatewayClient.get('/api/user/search-customers', { params: { q: query, query } }),

  confirmCodCollection: (orderId: string, amount?: number, notes?: string) =>
    gatewayClient.post(`/api/orders/${orderId}/confirm-cod-collection`, { amount, notes }),

  sendOrderConfirmedWhatsApp: (orderId: string) =>
    gatewayClient.post(`/api/orders/${orderId}/send-order-confirmed-whatsapp`),
};
