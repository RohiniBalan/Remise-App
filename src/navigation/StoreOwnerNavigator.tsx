import React, { useState, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BarChart2,
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Settings as SettingsIcon,
  Bell,
  User as UserIcon,
  MoreHorizontal,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Store as StoreIcon2,
  CheckCircle2,
} from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RemiseLoading from '../components/common/RemiseLoading';
import { Store } from 'lucide-react-native';
import {
  StoreDashboardProvider,
  useStoreDashboard,
} from '../context/StoreDashboardContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StoreOverviewScreen from '../screens/store/StoreOverviewScreen';
import StoreAnalyticsScreen from '../screens/store/StoreAnalyticsScreen';
import StoreProductsScreen from '../screens/store/StoreProductsScreen';
import StoreProductFormScreen from '../screens/store/StoreProductFormScreen';
import StoreManageBrandsScreen from '../screens/store/StoreManageBrandsScreen';
import StoreBulkProductScanScreen, {
  BulkProductRow,
} from '../screens/store/StoreBulkProductScanScreen';
import StoreCategoriesScreen from '../screens/store/StoreCategoriesScreen';
import StoreOrdersScreen from '../screens/store/StoreOrdersScreen';
import StoreOffersScreen from '../screens/store/StoreOffersScreen';
import StoreSettingsScreen from '../screens/store/StoreSettingsScreen';
import StoreMoreScreen from '../screens/store/StoreMoreScreen';
import StoreDeliveriesScreen from '../screens/store/StoreDeliveriesScreen';
import StoreOrderTrackingScreen from '../screens/store/StoreOrderTrackingScreen';
import NewOfferScreen from '../screens/store/NewOfferScreen';

import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import PhonePeWebViewScreen from '../screens/customer/PhonePeWebViewScreen';
import RazorpayWebViewScreen from '../screens/customer/RazorpayWebViewScreen';
import PaymentStatusScreen from '../screens/customer/PaymentStatusScreen';
import { CustomerColors } from '../styles/theme';
import { useCart } from '../context/CartContext';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import SettingsScreen from '../screens/customer/SettingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import NotificationScreen from '../screens/customer/NotificationsScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import StoreCustomersScreen from '../screens/store/StoreCustomersScreen';
import StoreSuppliersScreen from '../screens/store/StoreSuppliersScreen';
import StoreSupplierBrandsScreen from '../screens/store/StoreSupplierBrandsScreen';
import StoreSupplierCompareScreen from '../screens/store/StoreSupplierCompareScreen';
import StoreSupplierCartScreen from '../screens/store/StoreSupplierCartScreen';
import { SupplierCartProvider } from '../context/SupplierCartContext';
import { Truck, Users } from 'lucide-react-native';

export type StoreOwnerTabParamList = {
  Overview: undefined;
  Analytics: undefined;
  Products: undefined;
  StoreOwnerOrders: undefined;
  Offers: undefined;
  More: undefined;
};

export type StoreOwnerStackParamList = {
  StoreOwnerTabs: undefined;
  StoreDeliveries: undefined;
  StoreOrderTracking: { orderId: string };
  StoreOwnerCategories: undefined;
  Suppliers: { initialView?: 'browse' | 'orders' } | undefined;
  StoreOwnerCustomers: undefined;
  StoreSettings: undefined;
  NewOffer: { offer?: any; targetCustomerId?: string; targetCustomerName?: string } | undefined;

  ProductForm: {
    product?: any;
    scanned?: any;
    initialTitle?: string;
    initialCategory?: string;
  };
  ManageBrands: {
    typeKey: string;
    title: string;
    category: string;
    items: any[];
    brandCount: number;
    totalStock: number;
  };
  BulkProductScan: { scanned: BulkProductRow[] };
  Cart: undefined;
  Checkout: undefined;
  PhonePeWebView: { payUrl: string };
  RazorpayWebView: { options: any; orderId: string };
  PaymentStatus: { orderId: string; status?: string };
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
  Orders: undefined;
  SupplierBrands: { titleGroup: any };
  SupplierCompare: { group: any };
  SupplierCart: undefined;
  StoreRegister: undefined;
  ProductDetail: { productId: string };
};

const Tab = createBottomTabNavigator<StoreOwnerTabParamList>();
const Stack = createNativeStackNavigator<StoreOwnerStackParamList>();

function StoreHeaderTitle({ children }: { children?: string }) {
  const { store } = useStoreDashboard();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  return (
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerNameRow}>
        <Store size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
        <Text style={styles.headerStoreName} numberOfLines={1}>
          {store?.name || 'My Store'}
        </Text>
      </View>
      <Text style={styles.headerTabTitle}>{children}</Text>
    </View>
  );
}

function useOwnerIdentity() {
  const { user } = useAuth();
  const { store } = useStoreDashboard();
  const name = user?.fullname || user?.name || store?.name || 'Store Owner';
  const email = user?.email || '';
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase())
      .join('') || 'S';
  return { name, email, initials, isVerified: !!store?.isVerified };
}

function StoreProfileMenu() {
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const { name, email, initials, isVerified } = useOwnerIdentity();
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const close = () => setOpen(false);
  const go = (route: string, params?: object) => {
    close();
    navigation.navigate(route, params);
  };

  const handleSignOut = async () => {
    close();
    try {
      await logout();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.avatarBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.avatarBtnText}>{initials}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.menuBackdrop} onPress={close}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Text style={styles.menuName} numberOfLines={1}>
                    {name}
                  </Text>
                  {isVerified && (
                    <CheckCircle2 size={13} color={CustomerColors.success} />
                  )}
                </View>
                {!!email && (
                  <Text style={styles.menuEmail} numberOfLines={1}>
                    {email}
                  </Text>
                )}
                <Text style={styles.menuRole}>STORE OWNER</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <MenuItem
              icon={UserIcon}
              label="My Profile"
              onPress={() => go('Profile')}
              isDark={isDark}
            />
            <MenuItem
              icon={ShoppingBag}
              label="My Orders"
              onPress={() => go('Orders')}
              isDark={isDark}
            />
            <MenuItem
              icon={StoreIcon2}
              label="My Store"
              onPress={() => go('StoreOwnerTabs')}
              isDark={isDark}
            />
            <MenuItem
              icon={SettingsIcon}
              label="Settings"
              onPress={() => go('StoreSettings')}
              isDark={isDark}
            />
            <MenuItem
              icon={SlidersHorizontal}
              label="Preferences"
              onPress={() => go('StoreSettings')}
              isDark={isDark}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon={LogOut}
              label="Sign Out"
              danger
              onPress={handleSignOut}
              isDark={isDark}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  danger,
  isDark,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
  isDark?: boolean;
}) {
  const styles = useMemo(() => getStyles(!!isDark), [isDark]);
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Icon
        size={16}
        color={danger ? '#EF4444' : isDark ? '#9CA3AF' : CustomerColors.textSecondary}
      />
      <Text style={[styles.menuItemText, danger && { color: '#EF4444' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StoreHeaderRight() {
  const navigation = useNavigation<any>();
  const { cartCount } = useCart();
  const { unreadCount } = useUnreadNotifications();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  return (
    <View style={styles.headerIconRow}>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Bell size={18} color={isDark ? '#2DD4BF' : CustomerColors.primary} />
        {unreadCount > 0 && (
          <View style={styles.headerIconBadge}>
            <Text style={styles.headerIconBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => navigation.navigate('Cart')}
      >
        <ShoppingBag size={18} color={isDark ? '#2DD4BF' : CustomerColors.primary} />
        {cartCount > 0 && (
          <View style={styles.headerIconBadge}>
            <Text style={styles.headerIconBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <StoreProfileMenu />
    </View>
  );
}

function StoreOwnerTabs() {
  const { isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1F2937' : '#EAEAEA',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitle: props => <StoreHeaderTitle {...props} />,
        headerRight: () => <StoreHeaderRight />,
        tabBarActiveTintColor: isDark ? '#2DD4BF' : CustomerColors.teal700,
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
        tabBarStyle: {
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1F2937' : '#EAEAEA',
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={StoreOverviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart2 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={StoreAnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TrendingUp color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={StoreProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="StoreOwnerOrders"
        component={StoreOrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Offers"
        component={StoreOffersScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={StoreMoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DashboardGate({ children }: { children: React.ReactNode }) {
  const { loading, noStore } = useStoreDashboard();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  if (loading) {
    return (
      <RemiseLoading
        fullscreen
        message="Loading Store Dashboard..."
        subMessage="Fetching store inventory & orders"
      />
    );
  }

  if (noStore) {
    return (
      <View style={styles.center}>
        <Store size={40} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
        <Text style={styles.noStoreTitle}>No store found</Text>
        <Text style={styles.noStoreSubtitle}>
          You haven't registered a store yet.
        </Text>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate('StoreRegister')}
        >
          <Text style={styles.registerBtnText}>Register Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

export default function StoreOwnerNavigator() {
  const { isDark } = useTheme();
  const stackHeaderOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#EAEAEA',
    },
    headerTintColor: isDark ? '#F9FAFB' : CustomerColors.black,
    headerTitleStyle: {
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      fontWeight: '700' as const,
    },
  };

  return (
    <StoreDashboardProvider>
      <SupplierCartProvider>
        <DashboardGate>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StoreOwnerTabs" component={StoreOwnerTabs} />
            <Stack.Screen
              name="StoreDeliveries"
              component={StoreDeliveriesScreen}
              options={{ ...stackHeaderOptions, title: 'Deliveries Log' }}
            />
            <Stack.Screen
              name="StoreOrderTracking"
              component={StoreOrderTrackingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StoreOwnerCategories"
              component={StoreCategoriesScreen}
              options={{ ...stackHeaderOptions, title: 'Categories' }}
            />
            <Stack.Screen
              name="Suppliers"
              component={StoreSuppliersScreen}
              options={{ ...stackHeaderOptions, title: 'Order Stock' }}
            />
            <Stack.Screen
              name="StoreOwnerCustomers"
              component={StoreCustomersScreen}
              options={{ ...stackHeaderOptions, title: 'Customers' }}
            />
            <Stack.Screen
              name="StoreSettings"
              component={StoreSettingsScreen}
              options={{ ...stackHeaderOptions, title: 'Settings' }}
            />
            <Stack.Screen
              name="NewOffer"
              component={NewOfferScreen}
              options={{ ...stackHeaderOptions, title: 'New Offer' }}
            />
            <Stack.Screen
              name="ProductForm"
              component={StoreProductFormScreen}
              options={{ ...stackHeaderOptions, title: 'Product' }}
            />
            <Stack.Screen
              name="BulkProductScan"
              component={StoreBulkProductScanScreen}
              options={{ ...stackHeaderOptions, title: 'Scan Grocery List' }}
            />
            <Stack.Screen
              name="ManageBrands"
              component={StoreManageBrandsScreen}
              options={{ ...stackHeaderOptions, title: 'Manage Brands' }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ ...stackHeaderOptions, title: 'Your Cart' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ ...stackHeaderOptions }}
            />
            <Stack.Screen
              name="PhonePeWebView"
              component={PhonePeWebViewScreen}
              options={{ ...stackHeaderOptions, title: 'PhonePe' }}
            />
            <Stack.Screen
              name="RazorpayWebView"
              component={RazorpayWebViewScreen}
              options={{
                headerShown: true,
                title: 'Razorpay Checkout',
                headerStyle: { backgroundColor: '#0a0a0a' },
                headerTintColor: '#D4AF37',
              }}
            />
            <Stack.Screen
              name="PaymentStatus"
              component={PaymentStatusScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ ...stackHeaderOptions, title: 'Settings' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ ...stackHeaderOptions, title: 'Profile' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationScreen}
              options={{ ...stackHeaderOptions, title: 'Notifications' }}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
              options={{ ...stackHeaderOptions, title: 'My Orders' }}
            />
            <Stack.Screen
              name="StoreRegister"
              component={StoreRegisterScreen}
              options={{ ...stackHeaderOptions, title: 'Register Your Store' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </DashboardGate>
      </SupplierCartProvider>
    </StoreDashboardProvider>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg,
      padding: 32,
      gap: 8,
    },
    noStoreTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginTop: 8,
    },
    noStoreSubtitle: {
      fontSize: 13,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
    },
    registerBtn: {
      marginTop: 20,
      backgroundColor: CustomerColors.teal600,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },
    registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    headerTitleWrap: { alignItems: 'center' },
    headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerStoreName: {
      fontSize: 15,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      maxWidth: 220,
    },
    headerTabTitle: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 1,
    },
    headerIconRow: {
      flexDirection: 'row',
      gap: 8,
      marginRight: 8,
      alignItems: 'center',
    },
    headerIconBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: CustomerColors.primary,
      borderRadius: 8,
      minWidth: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    headerIconBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },

    // Avatar trigger button
    avatarBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: CustomerColors.teal700,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

    // Dropdown card
    menuBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'flex-end',
    },
    menuCard: {
      marginTop: 56,
      marginRight: 12,
      width: 240,
      backgroundColor: isDark ? '#111827' : '#fff',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#EEE',
      paddingVertical: 10,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingBottom: 8,
    },
    menuAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: CustomerColors.teal700,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuAvatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    menuName: {
      fontSize: 14,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      maxWidth: 140,
    },
    menuEmail: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 1,
    },
    menuRole: {
      fontSize: 9,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      marginTop: 2,
      letterSpacing: 0.5,
    },
    menuDivider: {
      height: 1,
      backgroundColor: isDark ? '#1F2937' : '#F0F0F0',
      marginVertical: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    menuItemText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
  });