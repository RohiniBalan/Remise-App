/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Headless background message handler for FCM v26.4.0
// Does NOT spawn local notifications to prevent duplicate alerts with native Android drawer
setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  console.log('[FCM Background] Message received in background/quit state:', remoteMessage?.data);
});

AppRegistry.registerComponent(appName, () => App);


