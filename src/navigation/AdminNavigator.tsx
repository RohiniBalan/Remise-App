import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHeader from '../screens/admin/AdminHeader';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminStoresScreen from '../screens/admin/AdminStoresScreen';
import AdminBlogsScreen from '../screens/admin/AdminBlogsScreen';
import AdminPressScreen from '../screens/admin/AdminPressScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminDeliveryPartnersScreen from '../screens/admin/AdminDeliveryPartnersScreen';
import AdminNewsletterScreen from '../screens/admin/AdminNewsletterScreen';
import AdminDynamicContentScreen from '../screens/admin/AdminDynamicContentScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import CustomerNavigator from './CustomerNavigator';

// Exact 10 pages matching client/app/admin/layout/sidebar.tsx:
// 1. Dashboard (/admin/dashboard)
// 2. Analytics (/admin/analytics)
// 3. Stores (/admin/stores)
// 4. Blogs & News (/admin/blogs)
// 5. Press Releases (/admin/press)
// 6. User Management (/admin/users)
// 7. Delivery Partners (/admin/delivery-partners)
// 8. Newsletter (/admin/newsletter)
// 9. Category (/admin/category)
// 10. Settings (/admin/settings)

export type AdminDrawerParamList = {
  AdminDashboard: undefined;
  AdminAnalytics: undefined;
  AdminStores: undefined;
  AdminStoreRegistrations: undefined;
  AdminBlogs: undefined;
  AdminPress: undefined;
  AdminUsers: undefined;
  AdminDeliveryPartners: undefined;
  AdminNewsletter: undefined;
  AdminCategory: undefined;
  AdminDynamicContent: undefined;
  AdminSettings: undefined;
  CustomerHome: undefined;
};

const Stack = createNativeStackNavigator<AdminDrawerParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="AdminDashboard"
      screenOptions={{ header: props => <AdminHeader {...props} /> }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ title: 'Analytics' }} />
      <Stack.Screen name="AdminStores" component={AdminStoresScreen} options={{ title: 'Stores' }} />
      <Stack.Screen name="AdminStoreRegistrations" component={AdminStoresScreen} options={{ title: 'Stores' }} />
      <Stack.Screen name="AdminBlogs" component={AdminBlogsScreen} options={{ title: 'Blogs & News' }} />
      <Stack.Screen name="AdminPress" component={AdminPressScreen} options={{ title: 'Press Releases' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'User Management' }} />
      <Stack.Screen name="AdminDeliveryPartners" component={AdminDeliveryPartnersScreen} options={{ title: 'Delivery Partners' }} />
      <Stack.Screen name="AdminNewsletter" component={AdminNewsletterScreen} options={{ title: 'Newsletter' }} />
      <Stack.Screen name="AdminCategory" component={AdminDynamicContentScreen} options={{ title: 'Category' }} />
      <Stack.Screen name="AdminDynamicContent" component={AdminDynamicContentScreen} options={{ title: 'Category' }} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="CustomerHome" component={CustomerNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
