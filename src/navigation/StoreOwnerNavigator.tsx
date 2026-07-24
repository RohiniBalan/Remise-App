import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart2, Package, Layers, ShoppingBag, Tag, Settings as SettingsIcon, Bell, User as UserIcon } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Store } from 'lucide-react-native';
import { StoreDashboardProvider, useStoreDashboard } from '../context/StoreDashboardContext';
import StoreOverviewScreen from '../screens/store/StoreOverviewScreen';
import StoreProductsScreen from '../screens/store/StoreProductsScreen';
import StoreProductFormScreen from '../screens/store/StoreProductFormScreen';
import StoreBulkProductScanScreen, { BulkProductRow } from '../screens/store/StoreBulkProductScanScreen';
import StoreCategoriesScreen from '../screens/store/StoreCategoriesScreen';
import StoreOrdersScreen from '../screens/store/StoreOrdersScreen';
import StoreOffersScreen from '../screens/store/StoreOffersScreen';
import StoreSettingsScreen from '../screens/store/StoreSettingsScreen';
import NewOfferScreen from '../screens/store/NewOfferScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import PhonePeWebViewScreen from '../screens/customer/PhonePeWebViewScreen';
import PaymentStatusScreen from '../screens/customer/PaymentStatusScreen';
import { CustomerColors } from '../styles/theme';
import { useCart } from '../context/CartContext';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import SettingsScreen from '../screens/customer/SettingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import NotificationScreen from '../screens/customer/NotificationsScreen';

// Mirrors the 6 tabs of app/store/dashboard/page.tsx exactly (Overview,
// Products, Categories, Orders, Offers, Settings) plus the stacked
// NewOffer and ProductForm screens. StoreDashboardProvider (see its file)
// reproduces web's single loadData()/refresh() shared across every tab,
// since each tab is a separate navigator screen here rather than a
// conditionally-rendered panel in one page component.

export type StoreOwnerTabParamList = {
  Overview: undefined;
  Products: undefined;
  StoreOwnerCategories: undefined;
  StoreOwnerOrders: undefined;
  Offers: undefined;
  StoreSettings: undefined;
};

export type StoreOwnerStackParamList = {
  StoreOwnerTabs: undefined;
  NewOffer: undefined;
  ProductForm: { product?: any; scanned?: any };
  BulkProductScan: { scanned: BulkProductRow[] };
  Cart: undefined;
  Checkout: undefined;
  PhonePeWebView: { payUrl: string };
  PaymentStatus: { orderId: string };
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
};

const Tab = createBottomTabNavigator<StoreOwnerTabParamList>();
const Stack = createNativeStackNavigator<StoreOwnerStackParamList>();

// Shows the store's name above each tab's title in the header. react-navigation
// passes the already-resolved title (from the Tab.Screen's `title` option,
// falling back to the route name) as `children`, so this stays in sync with
// each tab's title automatically.
function StoreHeaderTitle({ children }: { children?: string }) {
  const { store } = useStoreDashboard();
  return (
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerNameRow}>
        <Store size={14} color={CustomerColors.teal700} />
        <Text style={styles.headerStoreName} numberOfLines={1}>{store?.name || 'My Store'}</Text>
      </View>
      <Text style={styles.headerTabTitle}>{children}</Text>
    </View>
  );
}

function StoreHeaderRight() {
  const navigation = useNavigation<any>();
  const { cartCount } = useCart();
  const { unreadCount } = useUnreadNotifications();
  return (
    <View style={styles.headerIconRow}>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Notifications')}>
        <Bell size={18} color={CustomerColors.primary} />
        {unreadCount > 0 && (
          <View style={styles.headerIconBadge}><Text style={styles.headerIconBadgeText}>{unreadCount}</Text></View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Cart')}>
        <ShoppingBag size={18} color={CustomerColors.primary} />
        {cartCount > 0 && (
          <View style={styles.headerIconBadge}><Text style={styles.headerIconBadgeText}>{cartCount}</Text></View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Profile')}>
        <UserIcon size={18} color={CustomerColors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Settings')}>
        <SettingsIcon size={18} color={CustomerColors.primary} />
      </TouchableOpacity>
    </View>
  );
}

function StoreOwnerTabs() {
  return (
     <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: props => <StoreHeaderTitle {...props} />,
        headerRight: () => <StoreHeaderRight />,
        tabBarActiveTintColor: CustomerColors.teal700,
        tabBarInactiveTintColor: CustomerColors.textSecondary,
      }}>
      <Tab.Screen name="Overview" component={StoreOverviewScreen} options={{ tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} /> }} />
      <Tab.Screen name="Products" component={StoreProductsScreen} options={{ tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tab.Screen name="StoreOwnerCategories" component={StoreCategoriesScreen} options={{ title: 'Categories', tabBarIcon: ({ color, size }) => <Layers color={color} size={size} /> }} />
      <Tab.Screen name="StoreOwnerOrders" component={StoreOrdersScreen} options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }} />
      <Tab.Screen name="Offers" component={StoreOffersScreen} options={{ tabBarIcon: ({ color, size }) => <Tag color={color} size={size} /> }} />
      <Tab.Screen name="StoreSettings" component={StoreSettingsScreen} options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

// Mirrors web's noStore/loading gate (which wraps the whole dashboard
// before any tab renders) — a store_owner-role account should always have
// a store by construction (the role only flips to store_owner once
// registration succeeds), so this is a rare edge case, not a normal path.
function DashboardGate({ children }: { children: React.ReactNode }) {
  const { loading, noStore } = useStoreDashboard();
  const navigation = useNavigation<any>();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  if (noStore) {
    return (
      <View style={styles.center}>
        <Store size={40} color={CustomerColors.teal600} />
        <Text style={styles.noStoreTitle}>No store found</Text>
        <Text style={styles.noStoreSubtitle}>You haven't registered a store yet.</Text>
        <TouchableOpacity style={styles.registerBtn} onPress={()=> navigation.navigate('StoreRegister')}>
          <Text style={styles.registerBtnText} >Register Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

export default function StoreOwnerNavigator() {
  return (
    <StoreDashboardProvider>
      <DashboardGate>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="StoreOwnerTabs" component={StoreOwnerTabs} />
          <Stack.Screen name="NewOffer" component={NewOfferScreen} options={{ headerShown: true, title: 'New Offer' }} />
          <Stack.Screen name="ProductForm" component={StoreProductFormScreen} options={{ headerShown: true, title: 'Product' }} />
          <Stack.Screen name="BulkProductScan" component={StoreBulkProductScanScreen} options={{ headerShown: true, title: 'Scan Grocery List' }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Your Cart' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
          <Stack.Screen name="PhonePeWebView" component={PhonePeWebViewScreen} options={{ headerShown: true, title: 'PhonePe' }} />
          <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, title: 'Notifications' }} />
        </Stack.Navigator>
      </DashboardGate>
    </StoreDashboardProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg, padding: 32, gap: 8 },
  noStoreTitle: { fontSize: 18, fontWeight: '700', color: CustomerColors.black, marginTop: 8 },
  noStoreSubtitle: { fontSize: 13, color: CustomerColors.textSecondary, textAlign: 'center' },
  registerBtn: {marginTop: 20, backgroundColor: CustomerColors.teal600, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10},
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 16},
  headerTitleWrap: { alignItems: 'center' },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerStoreName: { fontSize: 15, fontWeight: '800', color: CustomerColors.black, maxWidth: 220 },
  headerTabTitle: { fontSize: 11, color: CustomerColors.textSecondary, marginTop: 1 },
  headerIconRow: { flexDirection: 'row', gap: 8, marginRight: 8, alignItems: 'center' },
  headerIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerIconBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: CustomerColors.primary, borderRadius: 8, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  headerIconBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});

