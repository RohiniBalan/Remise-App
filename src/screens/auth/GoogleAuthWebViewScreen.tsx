import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors } from '../../styles/theme';

// Zero-backend-change equivalent of web's full-page-redirect Google OAuth
// (see app/auth/google-success/page.tsx). The backend's OAuth success
// redirect target is a hardcoded web URL
// (`{FRONTEND_URL}/auth/google-success?token=...&user=<url-encoded-json>`),
// not a custom mobile URL scheme, so true OS-level deep-linking isn't
// possible without touching the backend. Instead: load the same
// `{gateway}/api/auth/google` URL in this WebView and watch every
// navigation event. The moment the URL matches `.../auth/google-success`,
// grab the token/user query params directly and finish login — the WebView
// never actually needs to reach that page.
export default function GoogleAuthWebViewScreen() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const handledRef = useRef(false);

  console.log('Google Auth URL:', authApi.googleAuthUrl);
  
  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    if (handledRef.current) return;
    if (!navState.url.includes('/auth/google-success')) return;

    handledRef.current = true;
    try {
      const [, queryString] = navState.url.split('?');
      const params = new URLSearchParams(queryString);
      const token = params.get('token');
      const userRaw = params.get('user');
      if (!token || !userRaw) {
        setError('Google sign-in did not return the expected data.');
        return;
      }
      const user = JSON.parse(decodeURIComponent(userRaw));
      await login(user, token);
      // AppNavigator's RoleGate re-renders automatically once auth state
      // changes, same as web's ctx.login(...) + router.push('/').
    } catch {
      setError('Could not complete Google sign-in. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.center}>
          {/* Minimal inline error text — a full ErrorState component comes
              with the shared-components pass in a later phase. */}
        </View>
      ) : (
        <WebView
          source={{ uri: authApi.googleAuthUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.primary} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
