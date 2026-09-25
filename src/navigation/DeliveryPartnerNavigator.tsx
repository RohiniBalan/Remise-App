import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryPartnerDashboardScreen from '../screens/delivery/DeliveryPartnerDashboardScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';

export type DeliveryPartnerStackParamList = {
  DeliveryPartnerDashboard: undefined;
  Notifications: undefined;
};
const Stack = createNativeStackNavigator<DeliveryPartnerStackParamList>();

export default function DeliveryPartnerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DeliveryPartnerDashboard"
        component={DeliveryPartnerDashboardScreen}
        options={{ headerShown: false, title: 'Remise Delivery Partner' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
