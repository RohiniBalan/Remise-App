import React, { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  WebView,
  WebViewNavigation,
} from 'react-native-webview';

import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors } from '../../styles/theme';

export default function GoogleAuthWebViewScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handledRef = useRef(false);

  /**
   * Handle the Google success callback.
   *
   * IMPORTANT:
   * The backend still redirects to the existing web URL:
   *
   * /auth/google-success?token=...&user=...
   *
   * We intercept that URL inside the React Native WebView,
   * extract the authentication data, save it in AuthContext,
   * and then move to the mobile RoleGate.
   */
  const handleGoogleSuccess = async (url: string) => {
    if (handledRef.current) {
      return;
    }

    if (!url.includes('/auth/google-success')) {
      return;
    }

    console.log('GOOGLE SUCCESS CALLBACK DETECTED:', url);

    handledRef.current = true;
    setLoading(true);

    try {
      const parsedUrl = new URL(url);

      const token = parsedUrl.searchParams.get('token');
      const userParam = parsedUrl.searchParams.get('user');

      console.log('GOOGLE TOKEN EXISTS:', !!token);
      console.log('GOOGLE USER EXISTS:', !!userParam);

      if (!token || !userParam) {
        throw new Error(
          'Google sign-in did not return token or user information.',
        );
      }

      let user;

      try {
        user = JSON.parse(userParam);
      } catch {
        user = JSON.parse(decodeURIComponent(userParam));
      }

      console.log('GOOGLE USER:', user);
      console.log('GOOGLE ROLE:', user?.role);

      /**
       * Save Google authentication in the mobile app.
       */
      await login(user, token);

      console.log('GOOGLE LOGIN COMPLETED');
      console.log('REDIRECTING TO MOBILE ROLE GATE');

      /**
       * IMPORTANT:
       * Remove GoogleAuthWebView from the navigation stack
       * and explicitly open the mobile RoleGate.
       */
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });

    } catch (err) {
      console.error('GOOGLE LOGIN ERROR:', err);

      handledRef.current = false;
      setError('Could not complete Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Intercept navigation BEFORE WebView actually loads
   * the web frontend success page.
   *
   * This is the important part.
   */
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;

    console.log('GOOGLE WEBVIEW REQUEST:', url);

    if (url.includes('/auth/google-success')) {
      console.log('INTERCEPTING GOOGLE SUCCESS URL');

      handleGoogleSuccess(url);

      /**
       * Prevent the WebView from loading the web frontend.
       */
      return false;
    }

    return true;
  };

  /**
   * Keep this as a secondary fallback.
   */
  const handleNavigationStateChange = async (
    navState: WebViewNavigation,
  ) => {
    const url = navState.url;

    console.log('GOOGLE WEBVIEW NAVIGATION:', url);

    if (url.includes('/auth/google-success')) {
      await handleGoogleSuccess(url);
    }
  };

  const handleWebViewError = (event: any) => {
    console.error('GOOGLE WEBVIEW ERROR:', event.nativeEvent);

    setLoading(false);
    setError(
      'Unable to complete Google sign-in. Please check your connection and try again.',
    );
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Google Sign-In Failed</Text>

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
        source={{
          uri: authApi.googleAuthUrl,
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onLoadStart={() => {
          setLoading(true);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={CustomerColors.primary}
            />

            <Text style={styles.loadingText}>
              Completing Google Sign-In...
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={CustomerColors.primary}
          />

          <Text style={styles.loadingText}>
            Completing Google Sign-In...
          </Text>
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
    padding: 24,
    backgroundColor: CustomerColors.white,
  },

  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.white,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: CustomerColors.textSecondary,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CustomerColors.black,
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginBottom: 24,
    textAlignVertical: 'center',
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CustomerColors.primary,
  },

  retryText: {
    color: CustomerColors.white,
    fontWeight: '700',
  },
});