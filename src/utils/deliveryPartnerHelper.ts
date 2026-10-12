export function isDeliveryPartnerUser(user: any): boolean {
  if (!user) return false;
  const role = typeof user.role === 'string' ? user.role.toLowerCase().trim() : '';
  return (
    role === 'delivery_person' ||
    role === 'delivery_partner' ||
    role === 'delivery' ||
    role === 'delivery_boy' ||
    role.includes('delivery') ||
    Boolean(user.deliveryPartner)
  );
}

export function navigateToDeliveryDashboard(navigation: any): void {
  try {
    // 1. Walk up the navigation hierarchy to find the navigator containing DeliveryPartnerDashboard or DeliveryDashboard
    let nav = navigation;
    let targetNav: any = null;
    let targetRoute = 'DeliveryPartnerDashboard';

    while (nav) {
      const state = nav.getState ? nav.getState() : null;
      const routeNames: string[] = state?.routeNames || [];
      if (routeNames.includes('DeliveryPartnerDashboard')) {
        targetNav = nav;
        targetRoute = 'DeliveryPartnerDashboard';
        break;
      }
      if (routeNames.includes('DeliveryDashboard')) {
        targetNav = nav;
        targetRoute = 'DeliveryDashboard';
        break;
      }
      nav = nav.getParent ? nav.getParent() : null;
    }

    if (targetNav) {
      targetNav.navigate(targetRoute);
      return;
    }

    // 2. Direct navigate attempts
    try {
      navigation.navigate('DeliveryPartnerDashboard');
      return;
    } catch {
      try {
        navigation.navigate('DeliveryDashboard');
        return;
      } catch {
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
      }
    }
  } catch (err) {
    console.warn('navigateToDeliveryDashboard error:', err);
  }
}
