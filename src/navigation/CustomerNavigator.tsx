import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid, ClipboardList, MapPin, Package } from 'lucide-react-native';
import PlaceholderScreen from '../screens/common/PlaceholderScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import CategoryScreen from '../screens/customer/CategoryScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import PhonePeWebViewScreen from '../screens/customer/PhonePeWebViewScreen';
import PaymentStatusScreen from '../screens/customer/PaymentStatusScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import BulkPurchaseScreen from '../screens/customer/BulkPurchaseScreen';
import CompareStoresScreen from '../screens/customer/CompareStoresScreen';
import NearbyOffersScreen from '../screens/customer/NearbyOffersScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import AboutScreen from '../screens/customer/AboutScreen';
import ServicesScreen from '../screens/customer/ServicesScreen';
import TestimonialsScreen from '../screens/customer/TestimonialsScreen';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import SuppliersScreen from '../screens/customer/SuppliersScreen';
import MyOffersScreen from '../screens/customer/MyOffersScreen';
import { SmartOrderCartItem } from '../api/smartOrderApi';
import { CustomerColors } from '../styles/theme';

// Bottom tabs mirror the web's primary customer nav destinations (Home,
// category browsing, Bulk-Purchase/Compare-Stores, Nearby Offers, Orders —
// see NavbarHome.tsx's nav links + orders/page.tsx). Detail/flow screens
// (ProductDetail, Cart, Checkout, PaymentStatus, Settings, About, Services,
// Testimonials, StoreRegister) are pushed on top of the tabs via the
// enclosing stack, same as web pushing a new route over the persistent navbar.
// Titles/web-source notes for the still-placeholder screens live in
// screens/common/placeholderMeta.ts, keyed by these same route names.

export type CustomerTabParamList = {
  Home: undefined;
  Categories: undefined;
  BulkPurchase: undefined;
  Nearby: undefined;
  Orders: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  PhonePeWebView: { payUrl: string };
  PaymentStatus: { orderId: string };
  Settings: undefined;
  Profile: undefined;
  About: undefined;
  Services: undefined;
  Testimonials: undefined;
  StoreRegister: undefined;
  CompareStores: { items: SmartOrderCartItem[] };
  Notifications: undefined;
  Suppliers: undefined;
  MyOffers: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CustomerColors.primary,
        tabBarInactiveTintColor: CustomerColors.textSecondary,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tab.Screen name="Categories" component={CategoryScreen} options={{ tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }} />
      <Tab.Screen name="BulkPurchase" component={BulkPurchaseScreen} options={{ title: 'Bulk Purchase', tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tab.Screen name="Nearby" component={NearbyOffersScreen} options={{ title: 'Nearby', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: 'Product' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Your Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
      <Stack.Screen name="PhonePeWebView" component={PhonePeWebViewScreen} options={{ headerShown: true, title: 'PhonePe' }} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true, title: 'About Us' }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: true, title: 'Our Services' }} />
      <Stack.Screen name="Testimonials" component={TestimonialsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} options={{ headerShown: true, title: 'Register Your Store' }} />
      <Stack.Screen name="CompareStores" component={CompareStoresScreen} options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Suppliers" component={SuppliersScreen} options={{ headerShown: true, title: 'Suppliers' }} />
<Stack.Screen name="MyOffers" component={MyOffersScreen} options={{ headerShown: true, title: 'My Offers' }} />
    </Stack.Navigator>
  );
}
