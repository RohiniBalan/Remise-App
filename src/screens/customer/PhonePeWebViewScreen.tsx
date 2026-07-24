import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { extractOrderId, PAYMENT_RETURN_HOST } from '../../api/paymentApi';
import { GoldColors } from '../../styles/theme';

// Displays PhonePe's real hosted checkout page (a phonepe.com URL returned
// by POST /api/payment/initiate) and watches for the sentinel redirect URL
// we sent as `redirectUrl` — same zero-backend-change WebView-interception
// pattern as GoogleAuthWebViewScreen. The sentinel domain never actually
// resolves; we only need PhonePe's *attempt* to navigate there, which is
// enough to read the orderId query param off it.
export default function PhonePeWebViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { payUrl } = route.params;
  const handledRef = useRef(false);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (handledRef.current) return;
    if (!navState.url.includes(PAYMENT_RETURN_HOST)) return;
    handledRef.current = true;
    const orderId = extractOrderId(navState.url);
    navigation.replace('PaymentStatus', { orderId });
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: payUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={request => !request.url.includes(PAYMENT_RETURN_HOST)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={GoldColors.gold} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
