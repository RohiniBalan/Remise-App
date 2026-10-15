import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import RemiseLoading from '../components/common/RemiseLoading';
import { setNotificationNavigationRef } from '../services/fcmService';

import { useAuth } from '../context/AuthContext';

import CustomerNavigator from './CustomerNavigator';
import StoreOwnerNavigator from './StoreOwnerNavigator';
import WholesalerNavigator from './WholesalerNavigator';
import HomeBusinessNavigator from './HomeBusinessNavigator';
import SellerNavigator from './SellerNavigator';
import DeliveryPartnerNavigator from './DeliveryPartnerNavigator';

import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import BusinessLoginScreen from '../screens/auth/BusinessLoginScreen';
import BusinessSignupScreen from '../screens/auth/BusinessSignupScreen';
import GoogleAuthWebViewScreen from '../screens/auth/GoogleAuthWebViewScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import VerifyEmailTokenScreen from '../screens/auth/VerifyEmailTokenScreen';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import DeliveryPartnerLoginScreen from '../screens/auth/DeliveryPartnerLoginScreen';
import DeliveryPartnerRegisterScreen from '../screens/auth/DeliveryPartnerRegisterScreen';

import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../styles/theme';

export type RootStackParamList = {
  RoleGate: undefined;

  LoginRegister: undefined;
  BusinessLogin: undefined;
  BusinessSignup: undefined;
  GoogleAuthWebView: { role?: string } | undefined;
  ForgotPassword: { role?: string; returnTo?: string } | undefined;
  ResetPassword: { token?: string; role?: string; returnTo?: string } | undefined;

  VerifyEmail: undefined;
  VerifyEmailToken: { token?: string } | undefined;
  StoreRegister: undefined;
  DeliveryPartnerLogin: undefined;
  DeliveryPartnerRegister: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function RoleRejectionView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // non-fatal
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.rejectionContainer}>
      <View style={styles.rejectionCard}>
        <View style={styles.rejectionIconWrap}>
          <ShieldAlert size={40} color={CustomerColors.primary} />
        </View>
        <Text style={styles.rejectionTitle}>{title}</Text>
        <Text style={styles.rejectionMessage}>{message}</Text>
        <TouchableOpacity
          style={styles.rejectionButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.rejectionButtonText}>Sign Out & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RoleGate() {
  const { user, token } = useAuth();

  const navigatorKey = token
    ? `${user?.role ?? 'unknown'}-authenticated`
    : 'guest';

  console.log('ROLE GATE USER:', user);
  console.log('ROLE GATE ROLE:', user?.role);
  console.log('ROLE GATE TOKEN EXISTS:', !!token);
  console.log('ROLE GATE NAVIGATOR KEY:', navigatorKey);

  // Guest = Customer browsing mode
  if (!token || !user) {
    console.log('ROLE GATE -> CUSTOMER GUEST');
    return <CustomerNavigator key={navigatorKey} />;
  }

  const rawRole = (user?.role ? String(user.role) : '').toLowerCase().trim();

  switch (rawRole) {
    case 'admin':
    case 'superadmin':
    case 'super_admin':
      console.log('ROLE GATE -> REJECT ADMIN');
      return (
        <RoleRejectionView
          key={navigatorKey}
          title="Web Portal Access Required"
          message="Administrator accounts must access the Remise management console via the Web Portal at https://remise.digital. Mobile app access is not supported for administrators."
        />
      );

    case 'store_owner':
    case 'whole_saler':
    case 'wholesaler':
    case 'home_business':
      console.log('ROLE GATE -> REJECT BUSINESS');
      return (
        <RoleRejectionView
          key={navigatorKey}
          title="Remise Business Account"
          message="This account is registered as a Remise Business account. Store Owner, Wholesaler, and Home Business portals are supported in the Remise Business app. Please sign out to use the Customer storefront."
        />
      );

    case 'delivery_person':
    case 'delivery_partner':
    case 'delivery':
      console.log('ROLE GATE -> DELIVERY PARTNER');
      return <DeliveryPartnerNavigator key={navigatorKey} />;

    case 'user':
    default:
      console.log('ROLE GATE -> CUSTOMER');
      return <CustomerNavigator key={navigatorKey} />;
  }
}

export default function AppNavigator() {
  const { loading } = useAuth();
  const navRef = React.useRef<any>(null);

  if (loading) {
    return (
      <RemiseLoading
        fullscreen
        size="lg"
        message="Loading Remise..."
        subMessage="Preparing your experience"
      />
    );
  }

  return (
    <NavigationContainer
      ref={navRef}
      onReady={() => {
        setNotificationNavigationRef(navRef.current);
      }}
    >
      <RootStack.Navigator
        initialRouteName="RoleGate"
        screenOptions={{ headerShown: false }}
      >
        {/* ALWAYS-AVAILABLE HOME / ROLE NAVIGATOR */}
        <RootStack.Screen name="RoleGate" component={RoleGate} />

        {/* AUTH SCREENS */}
        <RootStack.Screen
          name="LoginRegister"
          component={LoginRegisterScreen}
        />

        <RootStack.Screen
          name="BusinessLogin"
          component={BusinessLoginScreen}
        />

        <RootStack.Screen
          name="BusinessSignup"
          component={BusinessSignupScreen}
        />

        <RootStack.Screen
          name="GoogleAuthWebView"
          component={GoogleAuthWebViewScreen}
        />

        <RootStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            headerShown: true,
            title: 'Forgot Password',
          }}
        />

        <RootStack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            headerShown: true,
            title: 'Reset Password',
          }}
        />

        {/* OTHER ROOT SCREENS */}
        <RootStack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{
            headerShown: true,
            title: 'Verify Email',
            presentation: 'modal',
          }}
        />

        <RootStack.Screen
          name="VerifyEmailToken"
          component={VerifyEmailTokenScreen}
          options={{
            headerShown: true,
            title: 'Verify Email',
            presentation: 'modal',
          }}
        />

        <RootStack.Screen
          name="StoreRegister"
          component={StoreRegisterScreen}
          options={{
            headerShown: true,
            title: 'Register Store',
          }}
        />
        <RootStack.Screen
          name="DeliveryPartnerLogin"
          component={DeliveryPartnerLoginScreen}
          options={{ headerShown: true, title: 'Delivery Partner Login' }}
        />
        <RootStack.Screen
          name="DeliveryPartnerRegister"
          component={DeliveryPartnerRegisterScreen}
          options={{ headerShown: true, title: 'Become a Delivery Partner' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
  },
  rejectionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.xl,
  },
  rejectionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  rejectionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  rejectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: CustomerColors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  rejectionMessage: {
    fontSize: FontSizes.md,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  rejectionButton: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectionButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
