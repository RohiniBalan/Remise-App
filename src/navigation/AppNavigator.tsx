import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import StoreOwnerNavigator from './StoreOwnerNavigator';
import AdminNavigator from './AdminNavigator';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import VerifyEmailTokenScreen from '../screens/auth/VerifyEmailTokenScreen';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import { CustomerColors } from '../styles/theme';

export type RootStackParamList = {
  RoleGate: undefined;
  VerifyEmail: undefined;
  VerifyEmailToken: { token?: string } | undefined;
  StoreRegister: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Picks one of four top-level navigators based on auth state — the mobile
// equivalent of web's client-side (not server-side) per-page route guards.
// A role can move between stacks at runtime (e.g. Customer -> StoreOwner
// right after store registration succeeds and AuthContext.login() is called
// again with the upgraded role/token), exactly like web's
// store/register/page.tsx calling ctx.login({...user, role:'store_owner'}, newToken).
function RoleGate() {
  const { user, token } = useAuth();
  const isAuthed = Boolean(token && user);

  if (!isAuthed) return <AuthNavigator />;
  if (user?.role === 'admin') return <AdminNavigator />;
  if (user?.role === 'store_owner') return <StoreOwnerNavigator />;
  return <CustomerNavigator />;
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* VerifyEmail/VerifyEmailToken live above the role gate, not inside
          AuthNavigator, because web's register flow logs the user in (token
          stored) BEFORE routing to /verify-email — by that point AppNavigator
          has already switched away from the pre-login stack, same as here. */}
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="RoleGate" component={RoleGate} />
        <RootStack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ headerShown: true, title: 'Verify Email', presentation: 'modal' }} />
        <RootStack.Screen name="VerifyEmailToken" component={VerifyEmailTokenScreen} options={{ headerShown: true, title: 'Verify Email', presentation: 'modal' }} />
        <RootStack.Screen name="StoreRegister" component={StoreRegisterScreen} options={{ headerShown: true, title: 'RegisterStore' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
});
