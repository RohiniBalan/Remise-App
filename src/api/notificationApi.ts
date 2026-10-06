import { gatewayClient } from './client';

// Ported from client/app/api-services/notificationApi.ts (GATEWAY_URL).
// Web Push (VAPID + service worker) subscribe/getVapidKey/updateLocation
// endpoints exist on the backend but have no equivalent delivery mechanism
// in a native app without an FCM/APNs integration — out of scope per the
// plan (a backend-side gap, not fixable from the mobile app alone). Only
// the in-app notification list (poll-based) is implemented here.
export const notificationApi = {
  getAll: () => gatewayClient.get('/api/notifications'),
  markRead: (id: string) => gatewayClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => gatewayClient.patch('/api/notifications/read-all'),

  // Mobile FCM Device Token endpoints
  registerDeviceToken: (payload: {
    token: string;
    platform?: 'android' | 'ios';
    latitude?: number;
    longitude?: number;
  }) => gatewayClient.post('/api/notifications/device-token', payload),

  removeDeviceToken: (token: string) =>
    gatewayClient.delete('/api/notifications/device-token', { data: { token } }),

  updateDeviceLocation: (payload: {
    token?: string;
    latitude: number;
    longitude: number;
  }) => gatewayClient.put('/api/notifications/device-token/location', payload),
};

