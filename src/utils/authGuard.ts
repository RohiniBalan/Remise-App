import { Alert } from 'react-native';

type NavigationLike = {
  navigate: (name: string, params?: any) => void;
  getParent?: () => NavigationLike | undefined;
};

export function navigateToAuthFlow(navigation: NavigationLike | undefined) {
  let current: NavigationLike | undefined = navigation;
  const visited = new Set<NavigationLike>();

  while (current && !visited.has(current)) {
    visited.add(current);
    try {
      current.navigate('LoginRegister');
      return true;
    } catch {
      // Fall through
    }
    try {
      current.navigate('RoleGate');
      return true;
    } catch {
      // Fall through to the parent navigator if this one cannot handle the route.
    }
    current = current.getParent?.();
  }

  return false;
}

export function navigateAfterLogin(navigation: any) {
  if (!navigation) return;

  // 1. Walk up to the root navigator (RootStack) which owns RoleGate
  let rootNav: any = navigation;
  while (rootNav?.getParent?.()) {
    rootNav = rootNav.getParent();
  }

  // 2. If we found a parent root navigator with RoleGate, reset it
  if (rootNav && rootNav !== navigation) {
    try {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });
      return;
    } catch {
      // Fall through
    }
  }

  // 3. Try resetting current navigator to RoleGate
  try {
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleGate' }],
    });
    return;
  } catch {
    // Fall through
  }

  // 4. Try resetting current navigator to CustomerTabs -> Home
  try {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerTabs', params: { screen: 'Home' } }],
    });
    return;
  } catch {
    // Fall through
  }

  // 5. Try navigating directly to CustomerTabs or RoleGate
  try {
    navigation.navigate('CustomerTabs', { screen: 'Home' });
    return;
  } catch {
    // Fall through
  }

  try {
    navigation.navigate('RoleGate');
    return;
  } catch {
    // Fall through
  }

  // 6. Fallback: pop to top or goBack
  try {
    if (navigation.canGoBack?.()) {
      if (typeof navigation.popToTop === 'function') {
        navigation.popToTop();
      } else {
        navigation.goBack();
      }
    }
  } catch {
    // Non-fatal
  }
}

export function requireAuthForPurchase(params: {
  navigation: NavigationLike | undefined;
  isAuthenticated: boolean;
  title?: string;
  message?: string;
}) {
  if (params.isAuthenticated) return true;

  Alert.alert(
    params.title ?? 'Login required',
    params.message ?? 'Please sign in to continue with your purchase.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log in',
        onPress: () => {
          navigateToAuthFlow(params.navigation);
        },
      },
    ],
  );

  return false;
}
