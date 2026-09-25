import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Power,
  Truck,
  XCircle,
  Home,
  Wallet,
  User,
  Star,
  ShieldCheck,
  Package,
  Phone,
  HelpCircle,
  Compass,
  LogOut,
  TrendingUp,
  Sun,
  Moon,
  Edit3,
  Save,
  X,
  Award,
  Navigation,
  ExternalLink,
  Map,
  Bell,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { CustomerColors, Spacing, BorderRadius, FontSizes } from '../../styles/theme';

const vehicleOptions = ['Bike', 'Scooter', 'Bicycle', 'Car', 'Auto', 'Van'];

const nextActions: Record<string, { status: string; label: string }> = {
  Accepted: { status: 'Going to Store', label: 'Start Navigation to Store' },
  'Going to Store': {
    status: 'Arrived at Store',
    label: "I've Arrived at Store",
  },
  'Arrived at Store': { status: 'Picked Up', label: 'Confirm Pickup' },
  'Picked Up': { status: 'Out for Delivery', label: 'Start Delivery' },
  'Out for Delivery': { status: 'Delivered', label: 'Mark as Delivered' },
};

type Dashboard = {
  requests: any[];
  activeDelivery: any | null;
  completedDeliveries: number;
};

type ActiveTab = 'live' | 'earnings' | 'profile';

export default function DeliveryPartnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const { isDark, toggleTheme } = useTheme();
  const styles = getStyles(isDark);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('live');
  const [dashboard, setDashboard] = useState<Dashboard>({
    requests: [],
    activeDelivery: null,
    completedDeliveries: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [working, setWorking] = useState(false);

  const prevRequestIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // Live Navigation Modal State
  const [showNavModal, setShowNavModal] = useState(false);
  const [navTarget, setNavTarget] = useState<{
    title: string;
    address: string;
    type: 'store' | 'customer';
  }>({
    title: '',
    address: '',
    type: 'store',
  });


  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    mobilenumber: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    address: '',
  });

  const load = useCallback(async () => {
    try {
      const [profileResponse, dashboardResponse] = await Promise.all([
        smartOrderApi.getDeliveryPartnerProfile(),
        smartOrderApi.getDeliveryPartnerDashboard(),
      ]);
      const pData = profileResponse.data?.data;
      setProfile(pData);
      if (pData) {
        setEditForm({
          fullname: pData.fullname || '',
          mobilenumber: pData.mobilenumber || '',
          vehicleType: pData.deliveryPartner?.vehicleType || 'Bike',
          vehicleNumber: pData.deliveryPartner?.vehicleNumber || '',
          address: pData.deliveryPartner?.address || '',
        });
      }
      const nextDash = dashboardResponse.data?.data || {
        requests: [],
        activeDelivery: null,
        completedDeliveries: 0,
      };
      const currentReqs: any[] = nextDash.requests || [];
      const currentIds = new Set<string>(currentReqs.map((r: any) => String(r.orderId || r.deliveryRequestId)));

      if (!isInitialLoadRef.current) {
        const newReqs = currentReqs.filter((r: any) => !prevRequestIdsRef.current.has(String(r.orderId || r.deliveryRequestId)));
        if (newReqs.length > 0) {
          const firstReq = newReqs[0];
          Alert.alert(
            '🚨 New Delivery Request!',
            `New delivery request available!\nStore: ${firstReq.storeName || 'Store'}\nEarnings: Rs ${firstReq.earnings || 0}\nDistance: ${firstReq.distanceKm || 3.5} km`,
            [
              { text: 'View Requests', onPress: () => setActiveTab('live') },
              { text: 'Dismiss', style: 'cancel' },
            ]
          );
        }
      } else {
        isInitialLoadRef.current = false;
      }
      prevRequestIdsRef.current = currentIds;
      setDashboard(nextDash);
    } catch (error: any) {
      Alert.alert(
        'Delivery dashboard',
        error?.response?.data?.message || 'Unable to load delivery data.',
      );
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleAvailability = async () => {
    if (!profile) return;
    setWorking(true);
    try {
      const next =
        profile.deliveryPartner?.availability === 'AVAILABLE'
          ? 'OFFLINE'
          : 'AVAILABLE';
      const response = await smartOrderApi.updateDeliveryPartnerAvailability(
        next,
      );
      setProfile(response.data?.data);
      await load();
    } catch (error: any) {
      Alert.alert(
        'Availability',
        error?.response?.data?.message || 'Could not update availability.',
      );
    } finally {
      setWorking(false);
    }
  };

  const accept = async (orderId: string) => {
    setWorking(true);
    try {
      await smartOrderApi.acceptDeliveryPartnerRequest(orderId);
      await load();
    } catch (error: any) {
      Alert.alert(
        'Delivery unavailable',
        error?.response?.data?.message ||
          'Another partner may have accepted this request.',
      );
      await load();
    } finally {
      setWorking(false);
    }
  };

  const decline = async (orderId: string) => {
    setWorking(true);
    try {
      await smartOrderApi.declineDeliveryPartnerRequest(orderId);
      await load();
    } catch (error: any) {
      Alert.alert(
        'Decline failed',
        error?.response?.data?.message || 'Could not decline this request.',
      );
    } finally {
      setWorking(false);
    }
  };

  const openNavigationModal = (destType: 'store' | 'customer' = 'store') => {
    const active = dashboard.activeDelivery;
    if (!active) return;
    const isStore = destType === 'store';
    const address = isStore
      ? active.deliveryRequest?.pickupAddress || active.storeName || 'Store Location'
      : active.deliveryRequest?.dropAddress || 'Customer Destination';
    const title = isStore
      ? (active.storeName ? `${active.storeName} (Store Pickup)` : 'Store Pickup Location')
      : 'Customer Drop-off Destination';

    setNavTarget({ title, address, type: destType });
    setShowNavModal(true);
  };

  const openGoogleMapsApp = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Maps Navigation', 'Could not open external maps application.');
    });
  };

  const advance = async () => {
    const active = dashboard.activeDelivery;
    const action = active && nextActions[active.deliveryStatus];
    if (!active || !action) return;
    setWorking(true);
    try {
      await smartOrderApi.updateDeliveryPartnerStatus(
        active.orderId,
        action.status,
      );
      if (action.status === 'Going to Store') {
        const dest = active.deliveryRequest?.pickupAddress || active.storeName || 'Store Location';
        openNavigationModal('store');
        openGoogleMapsApp(dest);
      } else if (action.status === 'Out for Delivery') {
        const dest = active.deliveryRequest?.dropAddress || 'Customer Destination';
        openNavigationModal('customer');
        openGoogleMapsApp(dest);
      }
      await load();
    } catch (error: any) {
      Alert.alert(
        'Status update failed',
        error?.response?.data?.message || 'Invalid delivery transition.',
      );
    } finally {
      setWorking(false);
    }
  };


  const handleReturnHome = () => {
    Alert.alert(
      'Return to Store Home',
      'Would you like to return to the main store?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Store Home',
          onPress: async () => {
            await logout();
            try {
              navigation.getParent()?.reset({ index: 0, routes: [{ name: 'RoleGate' }] });
            } catch {
              try {
                navigation.reset({ index: 0, routes: [{ name: 'RoleGate' }] });
              } catch {
                // AuthContext RoleGate listener will auto-mount Customer home
              }
            }
          },
        },
      ],
    );
  };

  const handleStartEditProfile = () => {
    setEditForm({
      fullname: profile?.fullname || user?.fullname || '',
      mobilenumber: profile?.mobilenumber || user?.mobilenumber || '',
      vehicleType: profile?.deliveryPartner?.vehicleType || 'Bike',
      vehicleNumber: profile?.deliveryPartner?.vehicleNumber || '',
      address: profile?.deliveryPartner?.address || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullname.trim()) {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }
    if (!editForm.mobilenumber.trim()) {
      Alert.alert('Validation Error', 'Mobile number is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const response = await smartOrderApi.updateDeliveryPartnerProfile({
        fullname: editForm.fullname.trim(),
        mobilenumber: editForm.mobilenumber.trim(),
        vehicleType: editForm.vehicleType,
        vehicleNumber: editForm.vehicleNumber.trim(),
        address: editForm.address.trim(),
      });
      if (response.data?.data) {
        setProfile(response.data.data);
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message || 'Could not update profile. Please try again.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (!profile)
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading delivery partner dashboard...</Text>
      </View>
    );

  const available = profile.deliveryPartner?.availability === 'AVAILABLE';
  const active = dashboard.activeDelivery;
  const action = active && nextActions[active.deliveryStatus];
  const totalEarned = (dashboard.completedDeliveries || 0) * 120;

  return (
    <View style={styles.screen}>
      {/* Top Header Bar with Spacing */}
      <View style={styles.topBar}>
        <View style={styles.headerIdentity}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleReturnHome}
            accessibilityLabel="Return to store home"
          >
            <Home size={18} color="#FF0000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.themeBtn}
            onPress={toggleTheme}
            accessibilityLabel="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} color="#6366F1" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <Bell size={17} color={isDark ? '#E2E8F0' : '#1E293B'} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View>
            <View style={styles.partnerNameRow}>
              <Text style={styles.partnerName}>
                {user?.fullname || profile.fullname}
              </Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.vehicleSubtitle}>
              {profile.deliveryPartner?.vehicleType} · {profile.deliveryPartner?.vehicleNumber}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={toggleAvailability}
          disabled={working}
          style={[styles.availability, available && styles.offline]}
        >
          <Power size={13} color="#fff" />
          <Text style={styles.availabilityText}>
            {available ? 'Go Offline' : 'Go Available'}
          </Text>
        </Pressable>
      </View>

      {/* Tabs Menu */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'live' && styles.tabItemActive]}
          onPress={() => setActiveTab('live')}
        >
          <Truck size={14} color={activeTab === 'live' ? CustomerColors.primary : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
            Live Trips
          </Text>
          {dashboard.requests.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{dashboard.requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'earnings' && styles.tabItemActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <Wallet size={14} color={activeTab === 'earnings' ? CustomerColors.primary : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
            Earnings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <User size={14} color={activeTab === 'profile' ? CustomerColors.primary : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={CustomerColors.primary} />
        }
      >
        {/* GPS Live Signal Bar */}
        <View style={styles.gpsBar}>
          <View style={styles.gpsLeft}>
            <View style={[styles.gpsDot, available && styles.gpsDotActive]} />
            <Text style={styles.gpsText}>
              {available ? 'GPS Active · Available in Your Zone' : 'Offline · Go available to receive trips'}
            </Text>
          </View>
          <Compass size={13} color={isDark ? '#94A3B8' : '#64748B'} />
        </View>

        {/* ══════════════ TAB 1: LIVE TRIPS ══════════════ */}
        {activeTab === 'live' && (
          <>
            {/* Quick Metrics */}
            <View style={styles.stats}>
              <Stat
                label="Status"
                value={available ? 'Available' : 'Offline'}
                sub={available ? 'Receiving trips' : 'Standby'}
                styles={styles}
                highlight={available}
              />
              <Stat
                label="New Trips"
                value={String(dashboard.requests.length)}
                sub="waiting"
                styles={styles}
              />
              <Stat
                label="Completed"
                value={String(dashboard.completedDeliveries)}
                sub="trips"
                styles={styles}
              />
            </View>

            {/* Active Delivery Card */}
            {active && (
              <View style={styles.activeCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={styles.activeIconWrap}>
                      <Truck size={17} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.activeEyebrow}>Active Order in Progress</Text>
                      <Text style={styles.activeOrderId}>Order #{active.orderId}</Text>
                    </View>
                  </View>
                  <Text style={styles.statusBadgeText}>{active.deliveryStatus}</Text>
                </View>

                <View style={styles.infoGroup}>
                  <Info
                    label="Store Pickup"
                    value={active.deliveryRequest?.pickupAddress || active.storeName || 'Store Partner'}
                    styles={styles}
                  />
                  <Info
                    label="Drop-off Address"
                    value={active.deliveryRequest?.dropAddress || 'Customer destination'}
                    styles={styles}
                  />
                </View>

                <View style={styles.activeActionsRow}>
                  {action && (
                    <Pressable
                      onPress={advance}
                      disabled={working}
                      style={[styles.primary, { flex: 1 }]}
                    >
                      <CheckCircle2 size={16} color="#fff" />
                      <Text style={styles.primaryText}>{action.label}</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => openNavigationModal(active.deliveryStatus === 'Picked Up' || active.deliveryStatus === 'Out for Delivery' ? 'customer' : 'store')}
                    style={styles.mapBtn}
                  >
                    <Navigation size={14} color="#FF0000" />
                    <Text style={styles.mapBtnText}>Map</Text>
                  </Pressable>
                </View>
              </View>
            )}


            {/* Requests Section */}
            <Text style={styles.sectionTitle}>Available Delivery Requests</Text>
            {dashboard.requests.length === 0 ? (
              <View style={styles.empty}>
                <Package size={28} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text style={styles.emptyTitle}>No pending requests</Text>
                <Text style={styles.muted}>
                  {available
                    ? 'Nearby store requests will appear here in realtime.'
                    : 'Go available above to start receiving delivery requests.'}
                </Text>
              </View>
            ) : (
              dashboard.requests.map(request => (
                <View style={styles.card} key={request.orderId}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {request.storeName || 'Store pickup'}
                      </Text>
                      <Info
                        label="Pickup"
                        value={request.pickupAddress || 'Store'}
                        styles={styles}
                      />
                      <Info
                        label="Drop-off"
                        value={request.dropAddress || 'Customer destination'}
                        styles={styles}
                      />
                    </View>
                    <View style={styles.earningsBox}>
                      <Text style={styles.earnings}>Rs {request.earnings || 120}</Text>
                      <Text style={styles.distanceKm}>{request.distanceKm || 2.4} km</Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => accept(request.orderId)}
                      disabled={working}
                      style={[styles.primary, { flex: 1 }]}
                    >
                      <CheckCircle2 size={15} color="#fff" />
                      <Text style={styles.primaryText}>Accept Request</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => decline(request.orderId)}
                      disabled={working}
                      style={styles.secondary}
                    >
                      <XCircle size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                      <Text style={styles.secondaryText}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ══════════════ TAB 2: EARNINGS ══════════════ */}
        {activeTab === 'earnings' && (
          <View style={styles.tabContent}>
            <View style={styles.earningsSummaryCard}>
              <Text style={styles.earningsLabel}>Estimated Total Earnings</Text>
              <Text style={styles.earningsBigValue}>Rs {totalEarned.toLocaleString()}</Text>
              <View style={styles.earningsRateRow}>
                <TrendingUp size={13} color="#10B981" />
                <Text style={styles.earningsRateText}>Rs 120 avg per verified delivery</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payout Summary</Text>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Completed Trips</Text>
                <Text style={styles.tableValue}>{dashboard.completedDeliveries}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Base Fare</Text>
                <Text style={styles.tableValue}>Rs 80.00 / trip</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Distance Incentive</Text>
                <Text style={styles.tableValue}>Rs 40.00 avg</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Payout Frequency</Text>
                <Text style={styles.tableHighlight}>Weekly Direct Transfer</Text>
              </View>
            </View>
          </View>
        )}

        {/* ══════════════ TAB 3: PROFILE & OPTIONS ══════════════ */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            {!isEditingProfile ? (
              <View style={styles.card}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <User size={26} color={CustomerColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{user?.fullname || profile.fullname}</Text>
                    <Text style={styles.profileDetails}>{profile.email}</Text>
                    <Text style={styles.profileDetails}>{profile.mobilenumber}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={handleStartEditProfile}
                  >
                    <Edit3 size={14} color="#FF0000" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Vehicle Type</Text>
                  <Text style={styles.tableValue}>{profile.deliveryPartner?.vehicleType || 'Bike'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Vehicle Number</Text>
                  <Text style={styles.tableValue}>{profile.deliveryPartner?.vehicleNumber || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Partner Rating</Text>
                  <Text style={styles.tableValue}>4.9 ★ (Top Rated)</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Service Area</Text>
                  <Text style={styles.tableValue}>{profile.deliveryPartner?.address || 'Not specified'}</Text>
                </View>
              </View>
            ) : (
              /* Profile Edit Form */
              <View style={styles.card}>
                <View style={styles.editHeaderRow}>
                  <Text style={styles.cardTitle}>Edit Partner Profile</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditingProfile(false)}
                    style={styles.cancelSmallBtn}
                  >
                    <X size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.fullname}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, fullname: txt }))}
                    placeholder="Your Full Name"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.mobilenumber}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, mobilenumber: txt }))}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Vehicle Type</Text>
                  <View style={styles.vehicleTypePills}>
                    {vehicleOptions.map(vType => {
                      const isSelected = editForm.vehicleType.toLowerCase() === vType.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={vType}
                          style={[styles.vehiclePill, isSelected && styles.vehiclePillActive]}
                          onPress={() => setEditForm(prev => ({ ...prev, vehicleType: vType }))}
                        >
                          <Text style={[styles.vehiclePillText, isSelected && styles.vehiclePillTextActive]}>
                            {vType}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Vehicle License Plate Number</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.vehicleNumber}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, vehicleNumber: txt }))}
                    placeholder="e.g. TN 20 AQ 2004"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Service Area / Address</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.address}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, address: txt }))}
                    placeholder="e.g. RS Puram, Coimbatore"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>

                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.primary}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    <Save size={15} color="#fff" />
                    <Text style={styles.primaryText}>
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondary}
                    onPress={() => setIsEditingProfile(false)}
                    disabled={savingProfile}
                  >
                    <Text style={styles.secondaryText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Actions / Home Option */}
            <TouchableOpacity style={styles.homeActionBtn} onPress={handleReturnHome}>
              <Home size={16} color="#FF0000" />
              <Text style={styles.homeActionText}>Return to Store / Home Page</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                await logout();
                try {
                  navigation.getParent()?.reset({ index: 0, routes: [{ name: 'RoleGate' }] });
                } catch {
                  try {
                    navigation.reset({ index: 0, routes: [{ name: 'RoleGate' }] });
                  } catch {
                    // AuthContext RoleGate listener will auto-mount Customer home
                  }
                }
              }}
            >
              <LogOut size={15} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out Partner Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ══════════════ NAVIGATION MAP MODAL ══════════════ */}
      <Modal
        visible={showNavModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNavModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.navIconWrap}>
                  <Navigation size={18} color="#FF0000" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalEyebrow}>LIVE GPS NAVIGATION</Text>
                  <Text style={styles.modalTitle} numberOfLines={1}>{navTarget.title}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowNavModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={styles.navContentBox}>
              <View style={styles.navTargetRow}>
                <MapPin size={16} color="#FF0000" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.navTargetLabel}>
                    {navTarget.type === 'store' ? 'STORE PICKUP LOCATION' : 'CUSTOMER DROP-OFF DESTINATION'}
                  </Text>
                  <Text style={styles.navTargetAddress}>{navTarget.address}</Text>
                </View>
              </View>

              <View style={styles.navModeBadge}>
                <Compass size={13} color="#10B981" />
                <Text style={styles.navModeText}>Directions from your current GPS location</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryNavBtn}
                onPress={() => openGoogleMapsApp(navTarget.address)}
              >
                <ExternalLink size={16} color="#fff" />
                <Text style={styles.primaryNavBtnText}>Open Turn-by-Turn in Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryNavBtn}
                onPress={() => setShowNavModal(false)}
              >
                <Text style={styles.secondaryNavBtnText}>Close Navigation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Stat({ label, value, sub, styles, highlight = false }: any) {
  return (
    <View style={[styles.stat, highlight && styles.statHighlight]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function Info({ label, value, styles }: any) {
  return (
    <View style={styles.info}>
      <MapPin size={13} color={CustomerColors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: isDark ? '#070707' : '#F8FAFC' },
    content: { padding: 16, gap: 14, paddingBottom: 40 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#070707' : '#F8FAFC',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: isDark ? '#0E0E0E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#E2E8F0',
      elevation: 2,
    },
    headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    homeBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)',
    },
    themeBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#18181B' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
    },
    notifBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#18181B' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
      position: 'relative',
    },
    notifBadge: {
      position: 'absolute',
      top: -3,
      right: -3,
      backgroundColor: CustomerColors.primary,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    notifBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '800',
    },
    partnerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    partnerName: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 14, fontWeight: '800' },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    verifiedText: { color: '#10B981', fontSize: 9, fontWeight: '700' },
    vehicleSubtitle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 1 },
    availability: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: CustomerColors.primary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    offline: {
      backgroundColor: isDark ? '#27272A' : '#64748B',
      borderWidth: 1,
      borderColor: isDark ? '#3F3F46' : '#475569',
    },
    availabilityText: { color: '#fff', fontWeight: '800', fontSize: 11 },

    tabBar: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#0E0E0E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#E2E8F0',
      paddingHorizontal: 12,
    },
    tabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabItemActive: { borderBottomColor: CustomerColors.primary },
    tabText: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: '700' },
    tabTextActive: { color: CustomerColors.primary },
    badgeCount: {
      backgroundColor: CustomerColors.primary,
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    badgeCountText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    gpsBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? '#242424' : '#E2E8F0',
    },
    gpsLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    gpsDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: isDark ? '#64748B' : '#94A3B8' },
    gpsDotActive: { backgroundColor: '#10B981' },
    gpsText: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: '600' },

    stats: { flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? '#222222' : '#E2E8F0',
    },
    statHighlight: {
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)',
    },
    statLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    statValue: { color: isDark ? '#F9FAFB' : '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 3 },
    statValueHighlight: { color: CustomerColors.primary },
    statSub: { color: isDark ? '#64748B' : '#94A3B8', fontSize: 9, marginTop: 1 },

    activeCard: {
      backgroundColor: isDark ? '#160B0B' : '#FFF5F5',
      borderRadius: 16,
      padding: 14,
      gap: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.35)' : 'rgba(255, 0, 0, 0.25)',
    },
    activeIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: CustomerColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeEyebrow: { color: CustomerColors.primary, fontSize: 10, fontWeight: '800' },
    activeOrderId: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 14, fontWeight: '800' },
    statusBadgeText: {
      color: CustomerColors.primary,
      fontSize: 11,
      fontWeight: '700',
      backgroundColor: isDark ? 'rgba(255,0,0,0.15)' : 'rgba(255,0,0,0.08)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    infoGroup: { gap: 6 },
    info: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    infoValue: { color: isDark ? '#E2E8F0' : '#1E293B', fontSize: 12, fontWeight: '600' },
    activeActionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    mapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 0, 0, 0.3)',
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.08)',
    },
    mapBtnText: { color: '#FF0000', fontSize: 12, fontWeight: '800' },

    sectionTitle: { color: isDark ? '#F9FAFB' : '#0F172A', fontSize: 15, fontWeight: '800', marginTop: 2 },
    empty: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 14,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#222222' : '#E2E8F0',
      gap: 6,
    },
    emptyTitle: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 14, fontWeight: '700' },
    muted: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 17 },

    card: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 16,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: isDark ? '#222222' : '#E2E8F0',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    cardTitle: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 14, fontWeight: '800' },
    earningsBox: { alignItems: 'flex-end' },
    earnings: { color: CustomerColors.primary, fontWeight: '800', fontSize: 16 },
    distanceKm: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, marginTop: 1 },

    actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    primary: {
      minHeight: 40,
      borderRadius: 10,
      backgroundColor: CustomerColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 12,
    },
    primaryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    secondary: {
      minHeight: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#333333' : '#CBD5E1',
      backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 5,
      paddingHorizontal: 12,
    },
    secondaryText: { color: isDark ? '#94A3B8' : '#475569', fontWeight: '700', fontSize: 12 },

    tabContent: { gap: 12 },
    earningsSummaryCard: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.25)' : 'rgba(255, 0, 0, 0.2)',
    },
    earningsLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    earningsBigValue: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 28, fontWeight: '900', marginTop: 4 },
    earningsRateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    earningsRateText: { color: '#10B981', fontSize: 11, fontWeight: '600' },

    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E1E1E' : '#F1F5F9',
    },
    tableLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
    tableValue: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 12, fontWeight: '700' },
    tableHighlight: { color: '#10B981', fontSize: 12, fontWeight: '700' },

    profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F1F1F' : '#F1F5F9' },
    profileAvatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileName: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 15, fontWeight: '800' },
    profileDetails: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 1 },

    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)',
    },
    editBtnText: { color: '#FF0000', fontSize: 11, fontWeight: '700' },

    editHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#F1F5F9',
    },
    cancelSmallBtn: {
      padding: 4,
      borderRadius: 6,
    },
    formGroup: { gap: 4 },
    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#CBD5E1' : '#475569',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: isDark ? '#18181B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#CBD5E1',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 13,
      color: isDark ? '#FFFFFF' : '#0F172A',
    },
    vehicleTypePills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 2,
    },
    vehiclePill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#CBD5E1',
      backgroundColor: isDark ? '#18181B' : '#F1F5F9',
    },
    vehiclePillActive: {
      borderColor: CustomerColors.primary,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)',
    },
    vehiclePillText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    vehiclePillTextActive: {
      color: CustomerColors.primary,
    },
    editActionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },

    homeActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? '#18181B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.25)',
      borderRadius: 12,
      paddingVertical: 12,
    },
    homeActionText: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 13, fontWeight: '700' },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
    },
    logoutText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#222222' : '#E2E8F0',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#F1F5F9',
    },
    modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    navIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalEyebrow: { color: '#FF0000', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    modalTitle: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 15, fontWeight: '800' },
    modalCloseBtn: { padding: 6, borderRadius: 8 },
    navContentBox: {
      backgroundColor: isDark ? '#18181B' : '#F8FAFC',
      borderRadius: 14,
      padding: 14,
      gap: 10,
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
    },
    navTargetRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    navTargetLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: '700' },
    navTargetAddress: { color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 13, fontWeight: '600', marginTop: 2 },
    navModeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    navModeText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
    modalActions: { gap: 10, marginTop: 4 },
    primaryNavBtn: {
      backgroundColor: CustomerColors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      elevation: 3,
    },
    primaryNavBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    secondaryNavBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
      backgroundColor: isDark ? '#18181B' : '#F1F5F9',
    },
    secondaryNavBtnText: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 13, fontWeight: '700' },
  });


