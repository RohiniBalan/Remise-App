import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';

import CustomerNavigator from './CustomerNavigator';
import StoreOwnerNavigator from './StoreOwnerNavigator';
import WholesalerNavigator from './WholesalerNavigator';
import HomeBusinessNavigator from './HomeBusinessNavigator';
import SellerNavigator from './SellerNavigator';
import AdminNavigator from './AdminNavigator';


import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import BusinessLoginScreen from '../screens/auth/BusinessLoginScreen';
import BusinessSignupScreen from '../screens/auth/BusinessSignupScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import GoogleAuthWebViewScreen from '../screens/auth/GoogleAuthWebViewScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import VerifyEmailTokenScreen from '../screens/auth/VerifyEmailTokenScreen';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';

import { CustomerColors } from '../styles/theme';

export type RootStackParamList = {
  RoleGate: undefined;

  LoginRegister: undefined;
  BusinessLogin: undefined;
  BusinessSignup: undefined;
  AdminLogin: undefined;
  GoogleAuthWebView: { role?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;


  VerifyEmail: undefined;
  VerifyEmailToken: { token?: string } | undefined;
  StoreRegister: undefined;
};


const RootStack = createNativeStackNavigator<RootStackParamList>();

function RoleGate() {
  const { user, token } = useAuth();

  // const navigatorKey = token
  //   ? `${user?.role ?? 'unknown'}-${token}`
  //   : 'guest';

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

  switch (user.role) {
    case 'admin':
      console.log('ROLE GATE -> ADMIN');
      return <AdminNavigator key={navigatorKey} />;

    case 'store_owner':
      console.log('ROLE GATE -> STORE OWNER');
      return <StoreOwnerNavigator key={navigatorKey} />;

    case 'whole_saler':
    case 'wholesaler':
      console.log('ROLE GATE -> WHOLESALER');
      return <WholesalerNavigator key={navigatorKey} />;

    case 'home_business':
      console.log('ROLE GATE -> HOME BUSINESS');
      return <HomeBusinessNavigator key={navigatorKey} />;

    case 'user':
    default:
      console.log('ROLE GATE -> CUSTOMER');
      return <CustomerNavigator key={navigatorKey} />;
  }

}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={CustomerColors.primary}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="RoleGate"
        screenOptions={{ headerShown: false }}
      >
        {/* ALWAYS-AVAILABLE HOME / ROLE NAVIGATOR */}
        <RootStack.Screen
          name="RoleGate"
          component={RoleGate}
        />

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
          name="AdminLogin"
          component={AdminLoginScreen}
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
});