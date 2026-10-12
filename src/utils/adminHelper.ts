/**
 * Admin Navigation & Role Helper
 * Utilities for detecting admin users and navigating between Customer storefront
 * and Admin Dashboard console.
 */

export function isAdminUser(user: any): boolean {
  if (!user) return false;
  const role = typeof user.role === 'string' ? user.role.toLowerCase().trim() : '';
  return role === 'admin' || role === 'superadmin' || role === 'super_admin';
}

export function navigateToAdminDashboard(navigation: any): void {
  try {
    // 1. Walk up the navigation hierarchy to find the navigator containing AdminDashboard
    let nav = navigation;
    let targetNav: any = null;

    while (nav) {
      const state = nav.getState ? nav.getState() : null;
      const routeNames: string[] = state?.routeNames || [];
      if (routeNames.includes('AdminDashboard')) {
        targetNav = nav;
        break;
      }
      nav = nav.getParent ? nav.getParent() : null;
    }

    if (targetNav) {
      targetNav.navigate('AdminDashboard');
      return;
    }

    // 2. If canGoBack, try popping back to AdminDashboard
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    // 3. Direct navigate attempts
    try {
      navigation.navigate('AdminDashboard');
      return;
    } catch {
      try {
        navigation.getParent()?.navigate('AdminDashboard');
        return;
      } catch {
        try {
          navigation.navigate('RoleGate');
        } catch (err) {
          console.warn('navigateToAdminDashboard fallback failed:', err);
        }
      }
    }
  } catch (err) {
    console.warn('navigateToAdminDashboard error:', err);
  }
}
