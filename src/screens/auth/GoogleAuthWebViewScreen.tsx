import React, { useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  WebView,
  WebViewNavigation,
} from 'react-native-webview';

import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

const USER_AGENT =
  Platform.OS === 'android'
    ? 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';

/**
 * Robust extraction of token and user object from Google OAuth callback URL.
 * Handles single/double URL-encoding across all Hermes & JSC runtimes.
 */
function extractAuthData(url: string): { token: string; user: any } | null {
  if (!url || (!url.includes('/auth/google-success') && !url.includes('token='))) {
    return null;
  }

  let token = '';
  let userParam = '';

  const tokenMatch = url.match(/[?&]token=([^&]+)/);
  if (tokenMatch) {
    token = decodeURIComponent(tokenMatch[1]);
  }

  const userMatch = url.match(/[?&]user=([^&]+)/);
  if (userMatch) {
    userParam = userMatch[1];
  }

  if (!token) return null;

  let user: any = null;
  if (userParam) {
    try {
      user = JSON.parse(decodeURIComponent(userParam));
    } catch {
      try {
        user = JSON.parse(userParam);
      } catch {
        try {
          user = JSON.parse(decodeURIComponent(decodeURIComponent(userParam)));
        } catch (e) {
          console.error('[GoogleAuth] Error parsing user payload:', e);
        }
      }
    }
  }

  return { token, user };
}

export default function GoogleAuthWebViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { login } = useAuth();

  const role = route.params?.role;
  const authUrl = authApi.getGoogleAuthUrl(role);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  const handleGoogleSuccess = async (url: string) => {
    if (handledRef.current) return;

    if (url.includes('error=google_auth_failed')) {
      handledRef.current = true;
      setError('Google authentication was cancelled or failed. Please try again.');
      setLoading(false);
      return;
    }

    const authData = extractAuthData(url);
    if (!authData || !authData.token) {
      return;
    }

    console.log('[GoogleAuth] Success URL detected:', url);
    handledRef.current = true;
    setLoading(true);

    try {
      const { user, token } = authData;

      console.log('[GoogleAuth] Authenticated user:', user);
      await login(user || {}, token);

      console.log('[GoogleAuth] Login saved. Redirecting to RoleGate.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });
    } catch (err) {
      console.error('[GoogleAuth] Error storing login session:', err);
      handledRef.current = false;
      setError('Could not complete Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;

    if (url.includes('/auth/google-success') || url.includes('token=')) {
      handleGoogleSuccess(url);
      return false;
    }

    if (url.includes('error=google_auth_failed')) {
      handleGoogleSuccess(url);
      return false;
    }

    return true;
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const url = navState.url;

    if (url.includes('/auth/google-success') || url.includes('token=') || url.includes('error=google_auth_failed')) {
      await handleGoogleSuccess(url);
    }
  };

  const handleWebViewError = (event: any) => {
    const failingUrl = event.nativeEvent?.url || event.nativeEvent?.failingUrl || '';

    // If the failing URL is the frontend redirect URL, extract the token and user!
    if (failingUrl.includes('/auth/google-success') || failingUrl.includes('token=')) {
      handleGoogleSuccess(failingUrl);
      return;
    }

    if (handledRef.current) return;

    console.error('[GoogleAuth] WebView error:', event.nativeEvent);
    setLoading(false);
    setError(
      'Unable to connect to Google sign-in. Please check your internet connection and try again.',
    );
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Google Sign-In</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            handledRef.current = false;
            setError('');
            setLoading(true);
          }}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: authUrl }}
        userAgent={USER_AGENT}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={CustomerColors.primary} />
            <Text style={styles.loadingText}>Connecting to Google...</Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={CustomerColors.primary} />
          <Text style={styles.loadingText}>Completing Google Sign-In...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomerColors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: CustomerColors.white,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    color: CustomerColors.danger,
    marginBottom: Spacing.xl,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.primary,
  },
  retryText: {
    color: CustomerColors.white,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});