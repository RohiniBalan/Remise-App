import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { paymentApi } from '../../api/paymentApi';
import { GoldColors } from '../../styles/theme';

export default function RazorpayWebViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { options, orderId } = route.params;
  const [verifying, setVerifying] = useState(false);
  const handledRef = useRef(false);

  // Razorpay Options
  const razorpayKey = options?.key || options?.keyId || '';
  const razorpayOrderId = options?.razorpayOrderId || options?.order_id || '';
  const razorpayAmount = options?.amountPaise || Math.round((options?.amount || 0) * 100);
  const customerName = options?.customer?.name || 'Customer';
  const customerEmail = options?.customer?.email || '';
  const customerContact = options?.customer?.contact || '';

  // Razorpay Checkout HTML
  const razorpayHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #0c2340;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
          }
          .loader-box { padding: 24px; }
          .spinner {
            border: 3px solid rgba(45, 212, 191, 0.2);
            border-top: 3px solid #2dd4bf;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #fff; }
          p { font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="loader-box">
          <div class="spinner"></div>
          <h2>Launching Razorpay Checkout</h2>
          <p>Connecting securely to Razorpay Gateway...</p>
        </div>

        <script>
          document.addEventListener("DOMContentLoaded", function() {
            var options = {
              key: "${razorpayKey}",
              amount: ${razorpayAmount},
              currency: "${options?.currency || 'INR'}",
              name: "${options?.name || 'Remise Marketplace'}",
              description: "${options?.description || 'Marketplace Order'}",
              order_id: "${razorpayOrderId}",
              prefill: {
                name: "${customerName}",
                email: "${customerEmail}",
                contact: "${customerContact}"
              },
              theme: {
                color: "#0d9488"
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'CANCELLED',
                    reason: 'user_closed_modal'
                  }));
                }
              },
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SUCCESS',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }));
              }
            };

            try {
              var rzp = new Razorpay(options);
              rzp.on('payment.failed', function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'FAILED',
                  error: response.error
                }));
              });
              rzp.open();
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FAILED',
                error: { description: e.message }
              }));
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    if (handledRef.current) return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS') {
        handledRef.current = true;
        setVerifying(true);
        try {
          const verifyPayload: any = {
            orderId,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          };

          const verifyRes = await paymentApi.verify(verifyPayload);

          if (verifyRes.data?.success) {
            navigation.replace('PaymentStatus', { orderId, status: 'SUCCESS' });
          } else {
            Alert.alert('Payment Verification Failed', verifyRes.data?.message || 'Payment could not be verified');
            navigation.goBack();
          }
        } catch (err: any) {
          console.error('Verification error:', err);
          navigation.replace('PaymentStatus', { orderId, status: 'FAILED' });
        }
      } else if (data.type === 'CANCELLED') {
        handledRef.current = true;
        paymentApi.cancel(orderId, 'app_webview_cancelled').catch(() => {});
        navigation.goBack();
      } else if (data.type === 'FAILED') {
        handledRef.current = true;
        paymentApi.cancel(orderId, 'app_webview_failed').catch(() => {});
        Alert.alert('Payment Failed', data.error?.description || 'Transaction failed or was declined');
        navigation.goBack();
      }
    } catch (e) {
      console.error('Failed to parse webview message:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: razorpayHtml,
          baseUrl: 'https://checkout.razorpay.com',
        }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={GoldColors.gold} />
          </View>
        )}
      />
      {verifying && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={GoldColors.gold} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
