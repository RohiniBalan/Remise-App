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
      current.navigate('RoleGate');
      return true;
    } catch {
      // Fall through to the parent navigator if this one cannot handle the route.
    }
    current = current.getParent?.();
  }

  return false;
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
