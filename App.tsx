/**
 * Remise mobile app — full web-parity rebuild (Customer + Store Owner + Admin).
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/i18n';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedApp() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0a0f1d' : '#FFFFFF'}
      />
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <AppNavigator />
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
