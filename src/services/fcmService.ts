import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  deleteToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  getInitialNotification,
  AuthorizationStatus,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import Geolocation from '@react-native-community/geolocation';
import { notificationApi } from '../api/notificationApi';

type NotificationBannerCallback = (payload: {
  title: string;
  body: string;
  url?: string;
  type?: string;
  orderId?: string;
  storeId?: string;
}) => void;

let bannerListener: NotificationBannerCallback | null = null;
let navigationRef: any = null;
let initialNotificationHandled = false;

export function setNotificationNavigationRef(ref: any) {
  navigationRef = ref;
  // If there is an unprocessed cold-start notification, process it once navigation is ready
  checkInitialNotification();
}

export function setForegroundBannerListener(listener: NotificationBannerCallback | null) {
  bannerListener = listener;
}

/**
 * Requests notification permissions on Android (API 33+) and iOS
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] Android POST_NOTIFICATIONS permission not granted');
        return false;
      }
    }

    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log('[FCM] Permission status:', authStatus, 'enabled:', enabled);
    return enabled;
  } catch (error: any) {
    console.warn('[FCM] Permission request error:', error.message);
    return false;
  }
}

/**
 * Attempts to get current location coordinates (best effort)
 */
function getCurrentCoordinates(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Fallback: non-fatal, return undefined coordinates
        resolve({});
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  });
}

/**
 * Registers device FCM token with the Remise backend (authenticated user)
 */
export async function syncDeviceToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('[FCM] Skipping token sync: permission not granted');
      return null;
    }

    const messaging = getMessaging();
    const token = await getToken(messaging);
    if (!token) {
      console.log('[FCM] No token returned by Firebase');
      return null;
    }

    const coords = await getCurrentCoordinates();

    await notificationApi.registerDeviceToken({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    console.log('[FCM] Device token registered successfully');
    return token;
  } catch (error: any) {
    console.warn('[FCM] Device token sync error:', error.message);
    return null;
  }
}

/**
 * Deactivates device token on backend when user logs out
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    if (token) {
      await notificationApi.removeDeviceToken(token);
      await deleteToken(messaging);
      console.log('[FCM] Device token deactivated and deleted on logout');
    }
  } catch (error: any) {
    console.warn('[FCM] Unregister device token error:', error.message);
  }
}

/**
 * Maps notification payload data to appropriate app navigation screen
 */
export function navigateFromNotificationData(data?: Record<string, any>) {
  if (!data || !navigationRef) return;

  const url = (data.url || '').toLowerCase();
  const type = (data.type || '').toLowerCase();

  console.log('[FCM] Navigating from notification data:', { url, type, data });

  try {
    if (url.includes('store/credit') || url.includes('store-credit') || (url.includes('store') && (url.includes('credit') || type === 'credit'))) {
      navigationRef.navigate('StoreCredit');
    } else if (url.includes('credit') || type === 'credit') {
      navigationRef.navigate('MyCredit');
    } else if (url.includes('order') || type === 'order') {
      navigationRef.navigate('Orders');
    } else if (url.includes('delivery') || type === 'delivery_request') {
      navigationRef.navigate('DeliveryPartnerDashboard', {
        requestId: data.requestId || data.orderId,
      });
    } else if (url.includes('nearby') || url.includes('offer') || type === 'offer') {
      navigationRef.navigate('Nearby');
    } else if (url.includes('cart') || type === 'cart') {
      navigationRef.navigate('Cart');
    } else if (url.includes('store') || type === 'store_created') {
      navigationRef.navigate('StoreOwnerTabs');
    } else {
      // Default to notifications inbox screen
      navigationRef.navigate('Notifications');
    }
  } catch (navErr: any) {
    console.warn('[FCM] Navigation error:', navErr.message);
  }
}

/**
 * Checks for cold-start launch notification (when app was opened from quit state)
 */
async function checkInitialNotification() {
  if (initialNotificationHandled) return;

  try {
    const messaging = getMessaging();
    const initialMessage = await getInitialNotification(messaging);
    if (initialMessage && initialMessage.data) {
      initialNotificationHandled = true;
      console.log('[FCM] App launched from quit state via notification:', initialMessage.data);
      setTimeout(() => {
        navigateFromNotificationData(initialMessage.data);
      }, 500);
    }
  } catch (err: any) {
    console.warn('[FCM] checkInitialNotification error:', err.message);
  }
}

/**
 * Sets up all FCM listeners (foreground, background tap, token refresh)
 * Returns a cleanup function.
 */
export function setupFCMListeners(onNotificationReceived?: () => void): () => void {
  const messaging = getMessaging();

  // 1. Foreground notification listener
  const unsubscribeOnMessage = onMessage(
    messaging,
    async (remoteMessage: RemoteMessage) => {
      console.log('[FCM] Foreground notification received:', remoteMessage);

      // Trigger inbox / unread counter refresh in app
      if (onNotificationReceived) {
        onNotificationReceived();
      }

      // Display animated in-app toast banner
      if (bannerListener) {
        const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'Remise Alert';
        const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
        bannerListener({
          title: String(title),
          body: String(body),
          url: remoteMessage.data?.url ? String(remoteMessage.data.url) : undefined,
          type: remoteMessage.data?.type ? String(remoteMessage.data.type) : undefined,
          orderId: remoteMessage.data?.orderId ? String(remoteMessage.data.orderId) : undefined,
          storeId: remoteMessage.data?.storeId ? String(remoteMessage.data.storeId) : undefined,
        });
      }
    }
  );

  // 2. Notification opened app while in background
  const unsubscribeOnOpened = onNotificationOpenedApp(
    messaging,
    (remoteMessage: RemoteMessage) => {
      console.log('[FCM] Notification opened app from background:', remoteMessage);
      if (remoteMessage?.data) {
        navigateFromNotificationData(remoteMessage.data);
      }
    }
  );

  // 3. Token refresh listener
  const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken: string) => {
    console.log('[FCM] Token refreshed:', newToken);
    try {
      const coords = await getCurrentCoordinates();
      await notificationApi.registerDeviceToken({
        token: newToken,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (err: any) {
      console.warn('[FCM] Error updating refreshed token:', err.message);
    }
  });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpened();
    unsubscribeTokenRefresh();
  };
}
