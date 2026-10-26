import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Configure Geolocation to use 'auto' provider (Play Services or Android native)
 */
try {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
  });
} catch {}

/**
 * Requests the CAMERA runtime permission on Android.
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Camera Permission Required',
        'Camera access was permanently denied. Please enable it in your device Settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if location permission (fine or coarse) is currently granted on Android.
 */
export async function checkLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const [hasFine, hasCoarse] = await Promise.all([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION),
    ]);
    return hasFine || hasCoarse;
  } catch {
    return false;
  }
}

/**
 * Requests location permissions on Android (both FINE and COARSE as mandated on Android 12+).
 * Returns 'granted' | 'denied' | 'blocked'
 */
export async function requestLocationPermission(): Promise<'granted' | 'denied' | 'blocked'> {
  if (Platform.OS !== 'android') return 'granted';
  try {
    const statuses = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const fine = statuses[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    const coarse = statuses[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

    if (
      fine === PermissionsAndroid.RESULTS.GRANTED ||
      coarse === PermissionsAndroid.RESULTS.GRANTED
    ) {
      return 'granted';
    }

    if (
      fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
      coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) {
      return 'blocked';
    }

    return 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Gets current coordinates with high accuracy (GPS) first, with automatic
 * low accuracy (Network / Cell / Wi-Fi) fallback so location resolves
 * reliably indoors, outdoors, and across all Android power modes.
 */
export function getCurrentCoordinates(
  onSuccess: (coords: { latitude: number; longitude: number; accuracy?: number }) => void,
  onError: (error: any) => void,
) {
  Geolocation.getCurrentPosition(
    pos => {
      onSuccess({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    },
    err => {
      // If GPS fails or times out (common indoors or with GPS off), fallback to Network location
      Geolocation.getCurrentPosition(
        pos => {
          onSuccess({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        err2 => {
          onError(err2 || err);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
      );
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
  );
}

