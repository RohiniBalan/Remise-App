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
};
