import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BarChart2,
  Package,
  ShoppingBag,
  Settings as SettingsIcon,
  Bell,
  User as UserIcon,
  Truck,
  Store,
  SlidersHorizontal,
  LogOut,
  CheckCircle,
  AlertCircle,
  Layers,
  Plus,
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
import {
  SellerDashboardProvider,
  useSellerDashboard,
} from '../context/SellerDashboardContext';
import { useAuth } from '../context/AuthContext';
import SellerOverviewScreen from '../screens/seller/SellerOverviewScreen';
import SellerCategoriesScreen from '../screens/seller/SellerCategoriesScreen';
import SellerProductsScreen from '../screens/seller/SellerProductsScreen';
import SellerManageBrandsScreen from '../screens/seller/SellerManageBrandsScreen';
import SellerProductFormScreen from '../screens/seller/SellerProductFormScreen';
import SellerScanUploadScreen from '../screens/seller/SellerScanUploadScreen';
import SellerBulkScanUploadScreen from '../screens/seller/SellerBulkScanUploadScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import SellerSettingsScreen from '../screens/seller/SellerSettingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import NotificationScreen from '../screens/customer/NotificationsScreen';
import AccountSettingsScreen from '../screens/customer/SettingsScreen';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../styles/theme';

export type WholesalerTabParamList = {
  WholesalerOverview: undefined;
  WholesalerCategories: undefined;
  WholesalerProducts: undefined;
  WholesalerOrders: undefined;
  WholesalerSettings: undefined;
};

export type WholesalerStackParamList = {
  WholesalerTabs: undefined;
  SellerCategories: undefined;
  SellerProductForm: {
    product?: any;
    initialTitle?: string;
    initialCategory?: string;
  };
  SellerManageBrands: {
    typeKey: string;
    title: string;
    category: string;
    items: any[];
    brandCount: number;
    totalStock: number;
  };
  SellerScanUpload: undefined;
  SellerBulkScanUpload: undefined;
  Notifications: undefined;
  Profile: undefined;
  AccountSettings:
    | { initialTab?: 'account' | 'preferences' | 'security' | 'notifications' }
    | undefined;
  StoreRegister: undefined;
};

const Tab = createBottomTabNavigator<WholesalerTabParamList>();
const Stack = createNativeStackNavigator<WholesalerStackParamList>();

function WholesalerHeaderTitle({ children }: { children?: string }) {
  const { store } = useSellerDashboard();
  return (
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerNameRow}>
        <Truck size={14} color={CustomerColors.teal700} />
        <Text style={styles.headerStoreName} numberOfLines={1}>
          {store?.name || 'Wholesale Business'}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Wholesaler</Text>
        </View>
      </View>
      <Text style={styles.headerTabTitle}>{children}</Text>
    </View>
  );
}

function WholesalerUserMenu() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const displayName = user?.fullname || user?.name || 'Wholesaler';
  const isVerified = user?.isEmailVerified !== false;

  const close = () => setOpen(false);
  const go = (screen: string, params?: any) => {
    close();
    navigation.navigate(screen, params);
  };
  const handleSignOut = () => {
    close();
    logout();
  };

  return (
    <>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => setOpen(true)}>
        <UserIcon size={18} color={CustomerColors.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.menuBackdrop} onPress={close}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.menuName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.menuEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>📦 Wholesaler Merchant</Text>
                  </View>
                </View>
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={9} color="#15803D" />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : (
                  <View style={styles.unverifiedBadge}>
                    <AlertCircle size={9} color="#B45309" />
                    <Text style={styles.unverifiedBadgeText}>Verify</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.menuLinks}>
              <TouchableOpacity style={styles.menuItem} onPress={() => go('Profile')}>
                <UserIcon size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => go('WholesalerTabs')}>
                <Store size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>Wholesale Dashboard</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => go('AccountSettings', { initialTab: 'account' })}
              >
                <SettingsIcon size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => go('AccountSettings', { initialTab: 'preferences' })}
              >
                <SlidersHorizontal size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>Preferences</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                <LogOut size={15} color="#FF0000" />
                <Text style={[styles.menuItemText, { color: '#FF0000' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function WholesalerHeaderRight() {
  const navigation = useNavigation<any>();
  const { unreadCount } = useUnreadNotifications();
  return (
    <View style={styles.headerIconRow}>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Bell size={18} color={CustomerColors.primary} />
        {unreadCount > 0 && (
          <View style={styles.headerIconBadge}>
            <Text style={styles.headerIconBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <WholesalerUserMenu />
    </View>
  );
}

function WholesalerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: props => <WholesalerHeaderTitle {...props} />,
        headerRight: () => <WholesalerHeaderRight />,
        tabBarActiveTintColor: CustomerColors.teal700,
        tabBarInactiveTintColor: CustomerColors.textSecondary,
      }}
    >
      <Tab.Screen
        name="WholesalerOverview"
        component={SellerOverviewScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="WholesalerCategories"
        component={SellerCategoriesScreen}
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="WholesalerProducts"
        component={SellerProductsScreen}
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="WholesalerOrders"
        component={SellerOrdersScreen}
        options={{
          title: 'Incoming Orders',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="WholesalerSettings"
        component={SellerSettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function WholesalerDashboardGate({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<any>();
  const { loading, noStore } = useSellerDashboard();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
        <Text style={styles.loadingText}>Loading your wholesale business…</Text>
      </View>
    );
  }

  if (noStore) {
    return (
      <View style={styles.center}>
        <View style={styles.noStoreIconCircle}>
          <Truck size={32} color={CustomerColors.teal700} />
        </View>
        <Text style={styles.noStoreTitle}>No wholesale business profile found</Text>
        <Text style={styles.noStoreSubtitle}>
          Please register your wholesale business to start managing bulk orders.
        </Text>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate('StoreRegister')}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.registerBtnText}>Register Wholesale Business</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

export default function WholesalerNavigator() {
  return (
    <SellerDashboardProvider>
      <WholesalerDashboardGate>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WholesalerTabs" component={WholesalerTabs} />
          <Stack.Screen
            name="SellerCategories"
            component={SellerCategoriesScreen}
            options={{ headerShown: true, title: 'Wholesale Categories' }}
          />
          <Stack.Screen
            name="SellerProductForm"
            component={SellerProductFormScreen}
            options={{ headerShown: true, title: 'Wholesale Product' }}
          />
          <Stack.Screen
            name="SellerManageBrands"
            component={SellerManageBrandsScreen}
            options={{ headerShown: true, title: 'Manage Wholesale Brands' }}
          />
          <Stack.Screen
            name="SellerScanUpload"
            component={SellerScanUploadScreen}
            options={{ headerShown: true, title: 'Scan Paper & Add Product' }}
          />
          <Stack.Screen
            name="SellerBulkScanUpload"
            component={SellerBulkScanUploadScreen}
            options={{ headerShown: true, title: 'Scan Wholesale Product List' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: true, title: 'Profile' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationScreen}
            options={{ headerShown: true, title: 'Notifications' }}
          />
          <Stack.Screen
            name="AccountSettings"
            component={AccountSettingsScreen}
            options={{ headerShown: true, title: 'Settings' }}
          />
        </Stack.Navigator>
      </WholesalerDashboardGate>
    </SellerDashboardProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.xl,
    gap: 8,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.sm,
  },
  noStoreIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: CustomerColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  noStoreTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: CustomerColors.black,
    marginTop: 8,
  },
  noStoreSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  headerTitleWrap: { alignItems: 'center' },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerStoreName: {
    fontSize: 14,
    fontWeight: '800',
    color: CustomerColors.black,
    maxWidth: 160,
  },
  roleBadge: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  headerTabTitle: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  menuCard: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#DFF1F1',
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
  },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  menuName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  menuEmail: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  roleTag: {
    backgroundColor: 'rgba(15, 163, 177, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  verifiedBadgeText: { fontSize: 9, fontWeight: '700', color: '#15803D' },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unverifiedBadgeText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
  menuLinks: { paddingVertical: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  menuItemText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  menuDivider: {
    height: 1,
    backgroundColor: CustomerColors.steelBorder,
    marginVertical: 4,
  },
});
