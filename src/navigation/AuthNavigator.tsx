import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import GoogleAuthWebViewScreen from '../screens/auth/GoogleAuthWebViewScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

export type AuthStackParamList = {
  LoginRegister: undefined;
  GoogleAuthWebView: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Mirrors web's pre-login screens: app/login/page.tsx (single login/register
// toggle screen) and app/auth/google-success/page.tsx (WebView-interception
// variant, see plan). VerifyEmail/VerifyEmailToken are NOT here — on web,
// registering already logs the user in (token stored) before routing to
// /verify-email, so those screens live above the role-based navigators in
// AppNavigator's root stack instead, reachable while already authenticated
// (see AppNavigator.tsx).
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Forgot Password' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: true, title: 'Reset Password' }}
      />
      <Stack.Screen
        name="GoogleAuthWebView"
        component={GoogleAuthWebViewScreen}
        options={{ headerShown: true, title: 'Sign in with Google' }}
      />
    </Stack.Navigator>
  );
}
