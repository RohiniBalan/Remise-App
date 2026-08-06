import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BarChart2, Package, ShoppingBag, Settings as SettingsIcon, Bell, User as UserIcon, Truck,
  Store, SlidersHorizontal, LogOut, CheckCircle, AlertCircle,
  Layers,
} from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SellerDashboardProvider, useSellerDashboard } from '../context/SellerDashboardContext';
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
import { CustomerColors } from '../styles/theme';

// Mirrors the 4 tabs of client/app/store/seller/page.tsx (Overview,
// Products, Incoming Orders, Settings) exactly, following the same
// Provider -> DashboardGate -> Stack(Tabs + pushed screens) shape as
// StoreOwnerNavigator.tsx. Used for both 'whole_saler' and 'home_business'
// roles, same as web's single seller page serving both storeTypes.

export type SellerTabParamList = {
  SellerOverview: undefined;
  SellerCategories: undefined;
  SellerProducts: undefined;
  SellerOrders: undefined;
  SellerSettings: undefined;
};

export type SellerStackParamList = {
  SellerTabs: undefined;
  SellerCategories: undefined;
  SellerProductForm: { product?: any; initialTitle?: string; initialCategory?: string };
  SellerManageBrands: { typeKey: string; title: string; category: string; items: any[]; brandCount: number; totalStock: number };
  SellerScanUpload: undefined;
  SellerBulkScanUpload: undefined;
  Notifications: undefined;
  Profile: undefined;
  AccountSettings: { initialTab?: 'account' | 'preferences' | 'security' | 'notifications' } | undefined;
};

const Tab = createBottomTabNavigator<SellerTabParamList>();
const Stack = createNativeStackNavigator<SellerStackParamList>();

function SellerHeaderTitle({ children }: { children?: string }) {
  const { store } = useSellerDashboard();
  return (
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerNameRow}>
        <Truck size={14} color={CustomerColors.teal700} />
        <Text style={styles.headerStoreName} numberOfLines={1}>{store?.name || 'My Business'}</Text>
      </View>
      <Text style={styles.headerTabTitle}>{children}</Text>
    </View>
  );
}

function SellerUserMenu() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const displayName = user?.fullname || user?.name || 'User';
  const isVerified = user?.isEmailVerified !== false;

  const close = () => setOpen(false);
  const go = (screen: string, params?: any) => {
    close();
    navigation.navigate(screen, params);
  };
  const handleSignOut = () => {
    close();
    logout();
    // AppNavigator's RoleGate switches to AuthNavigator automatically.
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
                  <Text style={styles.menuName} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.menuEmail} numberOfLines={1}>{user?.email}</Text>
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
              <TouchableOpacity style={styles.menuItem} onPress={() => go('SellerTabs')}>
                <Store size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>My Store</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => go('AccountSettings', { initialTab: 'account' })}>
                <SettingsIcon size={15} color="#9CA3AF" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => go('AccountSettings', { initialTab: 'preferences' })}>
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

function SellerHeaderRight() {
  const navigation = useNavigation<any>();
  const { unreadCount } = useUnreadNotifications();
  return (
    <View style={styles.headerIconRow}>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Notifications')}>
        <Bell size={18} color={CustomerColors.primary} />
        {unreadCount > 0 && <View style={styles.headerIconBadge}><Text style={styles.headerIconBadgeText}>{unreadCount}</Text></View>}
      </TouchableOpacity>
      <SellerUserMenu />
    </View>
  );
}

function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: props => <SellerHeaderTitle {...props} />,
        headerRight: () => <SellerHeaderRight />,
        tabBarActiveTintColor: CustomerColors.teal700,
        tabBarInactiveTintColor: CustomerColors.textSecondary,
      }}
    >
      <Tab.Screen name="SellerOverview" component={SellerOverviewScreen} options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} /> }} />
      <Tab.Screen name='SellerCategories' component={SellerCategoriesScreen} options={{ title: 'Categories', tabBarIcon: ({ color, size }) => <Layers color={color} size={size} /> }} />
      <Tab.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: 'Products', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tab.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Incoming Orders', tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }} />
      <Tab.Screen name="SellerSettings" component={SellerSettingsScreen} options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

function DashboardGate({ children }: { children: React.ReactNode }) {
  const { loading, noStore } = useSellerDashboard();

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.primary} /></View>;
  }

  if (noStore) {
    return (
      <View style={styles.center}>
        <Truck size={40} color={CustomerColors.teal600} />
        <Text style={styles.noStoreTitle}>No business profile found</Text>
        <Text style={styles.noStoreSubtitle}>Please register your business first.</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function SellerNavigator() {
  return (
    <SellerDashboardProvider>
      <DashboardGate>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SellerTabs" component={SellerTabs} />
          <Stack.Screen name="SellerCategories" component={SellerCategoriesScreen} options={{ headerShown: true, title: 'Categories'}} />
          <Stack.Screen name="SellerProductForm" component={SellerProductFormScreen} options={{ headerShown: true, title: 'Product' }} />
          <Stack.Screen name="SellerManageBrands" component={SellerManageBrandsScreen} options={{ headerShown: true, title: 'Manage Brands' }} />
          <Stack.Screen name="SellerScanUpload" component={SellerScanUploadScreen} options={{ headerShown: true, title: 'Scan Paper & Add Product' }} />
          <Stack.Screen name="SellerBulkScanUpload" component={SellerBulkScanUploadScreen} options={{ headerShown: true, title: 'Scan Product List' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, title: 'Notifications' }} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
        </Stack.Navigator>
      </DashboardGate>
    </SellerDashboardProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg, padding: 32, gap: 8 },
  noStoreTitle: { fontSize: 18, fontWeight: '700', color: CustomerColors.black, marginTop: 8 },
  noStoreSubtitle: { fontSize: 13, color: CustomerColors.textSecondary, textAlign: 'center' },
  headerTitleWrap: { alignItems: 'center' },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerStoreName: { fontSize: 15, fontWeight: '800', color: CustomerColors.black, maxWidth: 220 },
  headerTabTitle: { fontSize: 11, color: CustomerColors.textSecondary, marginTop: 1 },
  headerIconRow: { flexDirection: 'row', gap: 8, marginRight: 8, alignItems: 'center' },
  headerIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerIconBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: CustomerColors.primary, borderRadius: 8, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  headerIconBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'flex-end', paddingTop: 56, paddingRight: 12 },
  menuCard: { width: 250, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: CustomerColors.steelBorder, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  menuHeader: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#DFF1F1', borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  menuName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  menuEmail: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  verifiedBadgeText: { fontSize: 9, fontWeight: '700', color: '#15803D' },
  unverifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  unverifiedBadgeText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
  menuLinks: { paddingVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11 },
  menuItemText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: CustomerColors.steelBorder, marginVertical: 4 },
});
