import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHeader from '../screens/admin/AdminHeader';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrderHistoryScreen from '../screens/admin/AdminOrderHistoryScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminDynamicContentScreen from '../screens/admin/AdminDynamicContentScreen';
import AdminProductScreen from '../screens/admin/AdminProductScreen';
import AdminHeroScreen from '../screens/admin/AdminHeroScreen';
import AdminContactScreen from '../screens/admin/AdminContactScreen';
import AdminCharactersScreen from '../screens/admin/AdminCharactersScreen';
import AdminBestSellersScreen from '../screens/admin/AdminBestSellersScreen';
import AdminShopByAgeScreen from '../screens/admin/AdminShopByAgeScreen';
import AdminShopByCategoryScreen from '../screens/admin/AdminShopByCategoryScreen';
import AdminBentoGridScreen from '../screens/admin/AdminBentoGridScreen';
import AdminReviewsScreen from '../screens/admin/AdminReviewsScreen';
import AdminServicesScreen from '../screens/admin/AdminServicesScreen';
import AdminBlogLifestyleScreen from '../screens/admin/AdminBlogLifestyleScreen';
import AdminTestimonialsScreen from '../screens/admin/AdminTestimonialsScreen';
import AdminHotDropsScreen from '../screens/admin/AdminHotDropsScreen';
import AdminStudioScreen from '../screens/admin/AdminStudioScreen';
import AdminRalleyzScreen from '../screens/admin/AdminRalleyzScreen';
import AdminStoresScreen from '../screens/admin/AdminStoresScreen';
import AdminStoreRegistrationsScreen from '../screens/admin/AdminStoreRegistrationsScreen';
import AdminBlogsScreen from '../screens/admin/AdminBlogsScreen';
import AdminPressScreen from '../screens/admin/AdminPressScreen';
import AdminDeliveryPartnersScreen from '../screens/admin/AdminDeliveryPartnersScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import HomeScreen from '../screens/customer/HomeScreen';

// Mirrors client/app/admin/layout/sidebar.tsx's nav structure: Dashboard,
// Stores, a "Portfolio" group of 14 marketing-content editor pages, then
// Blogs / Press / Product / Order History / User Management / Delivery Partners / Dynamic Content / Settings.
// The custom AdminHeader component renders the slide-in side menu (see its
// file for why this isn't @react-navigation/drawer).

export type AdminDrawerParamList = {
  CustomerHome: undefined;
  AdminDashboard: undefined;
  AdminStores: undefined;
  AdminStoreRegistrations: undefined;
  AdminHero: undefined;
  AdminHotDrops: undefined;
  AdminStudio: undefined;
  AdminRalleyz: undefined;
  AdminCharacters: undefined;
  AdminBestSellers: undefined;
  AdminShopByAge: undefined;
  AdminShopByCategory: undefined;
  AdminBentoGrid: undefined;
  AdminReviews: undefined;
  AdminServices: undefined;
  AdminContact: undefined;
  AdminBlogLifestyle: undefined;
  AdminTestimonials: undefined;
  AdminProduct: undefined;
  AdminOrderHistory: undefined;
  AdminUsers: undefined;
  AdminDeliveryPartners: undefined;
  AdminDynamicContent: undefined;
  AdminBlogs: undefined;
  AdminPress: undefined;
  AdminSettings: undefined;
};

// All 14 marketing-content editor pages — see PARITY_CHECKLIST.md for
// per-page notes (field lists, API shapes, preview-pane omission).
const PORTFOLIO_GROUP: Array<[keyof AdminDrawerParamList, string, React.ComponentType<any>]> = [
  ['AdminHero', 'Hero', AdminHeroScreen],
  ['AdminHotDrops', 'Hot Drops', AdminHotDropsScreen],
  ['AdminStudio', 'Studio', AdminStudioScreen],
  ['AdminRalleyz', 'Ralleyz Section', AdminRalleyzScreen],
  ['AdminCharacters', 'Characters', AdminCharactersScreen],
  ['AdminBestSellers', 'Top Picks', AdminBestSellersScreen],
  ['AdminShopByAge', 'Shop By Age', AdminShopByAgeScreen],
  ['AdminShopByCategory', 'Categories (Carousel)', AdminShopByCategoryScreen],
  ['AdminBentoGrid', 'Best of WOW', AdminBentoGridScreen],
  ['AdminReviews', 'Reviews', AdminReviewsScreen],
  ['AdminServices', 'Services/Products', AdminServicesScreen],
  ['AdminContact', 'Contact Form', AdminContactScreen],
  ['AdminBlogLifestyle', 'Blog & Lifestyle', AdminBlogLifestyleScreen],
  ['AdminTestimonials', 'Testimonials', AdminTestimonialsScreen],
];

const Stack = createNativeStackNavigator<AdminDrawerParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: props => <AdminHeader {...props} /> }}>
      <Stack.Screen name="CustomerHome" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AdminStores" component={AdminStoresScreen} options={{ title: 'Store Management' }} />
      <Stack.Screen name="AdminStoreRegistrations" component={AdminStoreRegistrationsScreen} options={{ title: 'Store Registrations' }} />
      {PORTFOLIO_GROUP.map(([name, title, Component]) => (
        <Stack.Screen key={name} name={name} component={Component} options={{ title }} />
      ))}
      <Stack.Screen name="AdminBlogs" component={AdminBlogsScreen} options={{ title: 'Blogs & News' }} />
      <Stack.Screen name="AdminPress" component={AdminPressScreen} options={{ title: 'Press Releases' }} />
      <Stack.Screen name="AdminProduct" component={AdminProductScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="AdminOrderHistory" component={AdminOrderHistoryScreen} options={{ title: 'Order History' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'User Management' }} />
      <Stack.Screen name="AdminDeliveryPartners" component={AdminDeliveryPartnersScreen} options={{ title: 'Delivery Partners' }} />
      <Stack.Screen name="AdminDynamicContent" component={AdminDynamicContentScreen} options={{ title: 'Dynamic Content' }} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
