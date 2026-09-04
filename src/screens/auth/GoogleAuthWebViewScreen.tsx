import React, { useRef, useState, useEffect, useCallback } from 'react';
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

/** Timeout in ms — if auth hasn't completed after this, show a retry UI. */
const AUTH_TIMEOUT_MS = 120_000;

/**
 * JavaScript injected into every page the WebView loads.
 * It checks the current URL on DOMContentLoaded AND immediately, and posts
 * it back to React Native via postMessage if it looks like the OAuth
 * callback redirect. This is the most reliable interception method on
 * Android where native onShouldStartLoadWithRequest is unreliable for
 * server-side (302) redirects.
 */
const INJECTED_JS = `
(function() {
  function checkAndPost() {
    var url = window.location.href;
    if (
      url.indexOf('/auth/google-success') !== -1 ||
      (url.indexOf('token=') !== -1 && url.indexOf('user=') !== -1) ||
      url.indexOf('error=google_auth_failed') !== -1
    ) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'auth_url', url: url }));
    }
  }
  checkAndPost();
  document.addEventListener('DOMContentLoaded', checkAndPost);
  // Also try after a short delay in case the URL changes via client-side routing
  setTimeout(checkAndPost, 500);
  setTimeout(checkAndPost, 1500);
})();
true;
`;

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

/** Returns true if the URL looks like our OAuth callback (success or error). */
function isAuthCallbackUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/google-success') ||
    (url.includes('token=') && url.includes('user=')) ||
    url.includes('error=google_auth_failed')
  );
}

export default function GoogleAuthWebViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { login } = useAuth();

  const role = route.params?.role;
  const authUrl = authApi.getGoogleAuthUrl(role);

  const [error, setError] = useState('');
  const [processingAuth, setProcessingAuth] = useState(false);
  const handledRef = useRef(false);
  const webViewRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Timeout safety net ──────────────────────────────────────────────────
  // If auth hasn't completed within AUTH_TIMEOUT_MS, show an error/retry UI
  // instead of leaving the user staring at a spinner forever.
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!handledRef.current) {
        console.warn('[GoogleAuth] Timeout — auth did not complete in time.');
        setProcessingAuth(false);
        setError(
          'Google sign-in is taking too long. Please check your internet connection and try again.',
        );
      }
    }, AUTH_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Core handler — processes the OAuth callback URL ─────────────────────
  const handleGoogleSuccess = useCallback(
    async (url: string) => {
      if (handledRef.current) return;

      // Error case: Google auth was cancelled or failed
      if (url.includes('error=google_auth_failed')) {
        handledRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setError('Google authentication was cancelled or failed. Please try again.');
        setProcessingAuth(false);
        return;
      }

      // Success case: extract token + user
      const authData = extractAuthData(url);
      if (!authData || !authData.token) {
        return;
      }

      console.log('[GoogleAuth] Success URL detected:', url.substring(0, 120) + '…');
      handledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setProcessingAuth(true);

      // Stop the WebView from continuing to load the (slow) frontend page
      if (webViewRef.current) {
        webViewRef.current.stopLoading();
      }

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
        setProcessingAuth(false);
      }
    },
    [login, navigation],
  );

  // ── onMessage: receives postMessage from the injected JS ────────────────
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'auth_url' && data.url) {
          console.log('[GoogleAuth] Received auth URL via postMessage');
          handleGoogleSuccess(data.url);
        }
      } catch {
        // Not JSON — could be from the loaded page's own scripts, ignore.
      }
    },
    [handleGoogleSuccess],
  );

  // ── onShouldStartLoadWithRequest: blocks navigation to callback URL ─────
  // Works reliably on iOS; may or may not fire on Android for 302 redirects.
  const handleShouldStartLoadWithRequest = useCallback(
    (request: any) => {
      const url = request.url;

      if (isAuthCallbackUrl(url)) {
        console.log('[GoogleAuth] Intercepted via onShouldStartLoadWithRequest');
        handleGoogleSuccess(url);
        return false; // block the WebView from actually loading this URL
      }

      return true;
    },
    [handleGoogleSuccess],
  );

  // ── onNavigationStateChange: fallback interception ──────────────────────
  // Fires for all navigations including 302 redirects on Android.
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState.url;

      if (isAuthCallbackUrl(url)) {
        console.log('[GoogleAuth] Intercepted via onNavigationStateChange');
        handleGoogleSuccess(url);
      }
    },
    [handleGoogleSuccess],
  );

  // ── onError: catches page-load failures ─────────────────────────────────
  // On Android, loading the Vercel frontend URL may fail (ERR_CONNECTION_REFUSED,
  // ERR_NAME_NOT_RESOLVED, etc.) but the failing URL still has our token!
  const handleWebViewError = useCallback(
    (event: any) => {
      const failingUrl = event.nativeEvent?.url || event.nativeEvent?.failingUrl || '';

      // If the failing URL is the frontend redirect URL, extract the token!
      if (isAuthCallbackUrl(failingUrl)) {
        console.log('[GoogleAuth] Intercepted via onError — failing URL has token');
        handleGoogleSuccess(failingUrl);
        return;
      }

      if (handledRef.current) return;

      console.error('[GoogleAuth] WebView error:', event.nativeEvent);
      setProcessingAuth(false);
      setError(
        'Unable to connect to Google sign-in. Please check your internet connection and try again.',
      );
    },
    [handleGoogleSuccess],
  );

  // ── onHttpError: catches HTTP 4xx/5xx on the redirect URL ───────────────
  // If the frontend success page returns e.g. 404 or 500, we can still read
  // the URL and extract the token from it.
  const handleHttpError = useCallback(
    (event: any) => {
      const failingUrl = event.nativeEvent?.url || '';
      const statusCode = event.nativeEvent?.statusCode || 0;

      console.log(`[GoogleAuth] HTTP error ${statusCode} on:`, failingUrl.substring(0, 100));

      if (isAuthCallbackUrl(failingUrl)) {
        console.log('[GoogleAuth] Intercepted via onHttpError — URL has token');
        handleGoogleSuccess(failingUrl);
        return;
      }
    },
    [handleGoogleSuccess],
  );

  // ── Loading state handlers ──────────────────────────────────────────────
  // No-op: the WebView's own `startInLoadingState` + `renderLoading` handles
  // showing a spinner during the very first page load. We deliberately do NOT
  // show a full-screen overlay during Google's interactive auth flow — that
  // was the bug (it blocked the password field). The `processingAuth` overlay
  // only appears after we've intercepted the callback URL.

  // ── Retry handler ───────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    handledRef.current = false;
    setError('');
    setProcessingAuth(false);
    // Reset the timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!handledRef.current) {
        setProcessingAuth(false);
        setError(
          'Google sign-in is taking too long. Please check your internet connection and try again.',
        );
      }
    }, AUTH_TIMEOUT_MS);
  }, []);

  // ── Error UI ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Google Sign-In</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main WebView UI ─────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: authUrl }}
        userAgent={USER_AGENT}
        injectedJavaScript={INJECTED_JS}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onHttpError={handleHttpError}
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

      {processingAuth && (
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