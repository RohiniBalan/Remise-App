import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import BusinessLoginScreen from '../screens/auth/BusinessLoginScreen';
import BusinessSignupScreen from '../screens/auth/BusinessSignupScreen';
import GoogleAuthWebViewScreen from '../screens/auth/GoogleAuthWebViewScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

export type AuthStackParamList = {
  LoginRegister: undefined;
  BusinessLogin: undefined;
  BusinessSignup: undefined;
  GoogleAuthWebView: { role?: string } | undefined;
  ForgotPassword: { role?: string; returnTo?: string } | undefined;
  ResetPassword: { token?: string; role?: string; returnTo?: string } | undefined;
};


const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
      <Stack.Screen name="BusinessLogin" component={BusinessLoginScreen} />
      <Stack.Screen name="BusinessSignup" component={BusinessSignupScreen} />
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

