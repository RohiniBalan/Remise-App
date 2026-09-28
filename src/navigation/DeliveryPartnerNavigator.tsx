import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryPartnerDashboardScreen from '../screens/delivery/DeliveryPartnerDashboardScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import CustomerNavigator from './CustomerNavigator';

export type DeliveryPartnerStackParamList = {
  DeliveryPartnerDashboard: undefined;
  CustomerHome: undefined;
  Notifications: undefined;
};
const Stack = createNativeStackNavigator<DeliveryPartnerStackParamList>();

export default function DeliveryPartnerNavigator() {
  return (
    <Stack.Navigator initialRouteName="DeliveryPartnerDashboard">
      <Stack.Screen
        name="DeliveryPartnerDashboard"
        component={DeliveryPartnerDashboardScreen}
        options={{ headerShown: false, title: 'Remise Delivery Partner' }}
      />
      <Stack.Screen
        name="CustomerHome"
        component={CustomerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
