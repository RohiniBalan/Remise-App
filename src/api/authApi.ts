import { gatewayClient } from './client';
import { GATEWAY_URL } from './endpoints';

// Ported 1:1 from client/app/login/page.tsx (API_URL = NEXT_PUBLIC_API_URL/api
// — the gateway) and client/app/settings/page.tsx SecurityTab (change-password).

export interface RegisterPayload {
  fullname: string;
  email: string;
  mobilenumber: string;
  password: string;
  role: 'user' | 'store_owner';
}

export const authApi = {
  login: (email: string, password: string) =>
    gatewayClient.post('/api/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    gatewayClient.post('/api/auth/register', payload),

  resendVerification: (email: string) =>
    gatewayClient.post('/api/auth/resend-verification', { email }),

  verifyEmail: (token: string) => gatewayClient.get(`/api/auth/verify-email/${token}`),

  forgotPassword: (email: string) =>
    gatewayClient.post('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    gatewayClient.post('/api/auth/reset-password', { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    gatewayClient.post('/api/auth/change-password', { currentPassword, newPassword }),

  updateProfile: (payload: Record<string, unknown>) =>
    gatewayClient.put('/api/auth/profile', payload),

  logoutAll: () => gatewayClient.post('/api/auth/logout-all'),

  // Full-page redirect target on web; on mobile this is the URL loaded
  // inside the GoogleAuthWebViewScreen (see plan's Google OAuth section).
  googleAuthUrl: `https://auth-service-f6m1.onrender.com/api/auth/google`,
};

// Same role -> destination mapping as web's redirectDestination() in
// login/page.tsx and the inline mapping in verify-email/[token]/page.tsx.
export function redirectDestination(role?: string): 'Admin' | 'StoreOwner' | 'Customer' {
  if (role === 'admin') return 'Admin';
  if (role === 'store_owner') return 'StoreOwner';
  return 'Customer';
}
