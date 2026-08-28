import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

/**
 * Requests the CAMERA runtime permission on Android.
 *
 * react-native-image-picker's launchCamera() requires this when
 * `android.permission.CAMERA` is declared in AndroidManifest.xml.
 * Without requesting it at runtime first, the library shows
 * "Camera unavailable — This library does not require
 * Manifest.permission.CAMERA …".
 *
 * On iOS this is a no-op (returns true) because iOS handles permissions
 * via Info.plist + system prompts automatically.
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
