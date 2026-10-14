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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  AlertCircle,
  QrCode,
  Copy,
  MessageSquare,
  Check,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import RemiseLoading from '../../components/common/RemiseLoading';
import { CustomerColors, Spacing, BorderRadius, FontSizes } from '../../styles/theme';
import { useDeliveryPartnerTranslations, useDeliveryTranslations } from '../../i18n';

type Dashboard = {
  requests: any[];
  activeDelivery: any | null;
  completedDeliveries: number;
};

type ActiveTab = 'live' | 'earnings' | 'profile';

export default function DeliveryPartnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, token, logout } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const { isDark, toggleTheme } = useTheme();
  const styles = getStyles(isDark);
  const tPartner = useDeliveryPartnerTranslations();
  const tDeliv = useDeliveryTranslations();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('live');

  const getNextAction = (status: string) => {
    switch (status) {
      case 'Accepted':
        return { status: 'Going to Store', label: tPartner.actionStartNavStore };
      case 'Going to Store':
        return { status: 'Arrived at Store', label: tPartner.actionArrivedStore };
      case 'Arrived at Store':
        return { status: 'Picked Up', label: tPartner.actionConfirmPickup };
      case 'Picked Up':
        return { status: 'Out for Delivery', label: tPartner.actionStartDelivery };
      case 'Out for Delivery':
        return { status: 'Delivered', label: 'Verify OTP & Deliver' };
      default:
        return null;
    }
  };

  const translateMilestone = (status: string) => {
    switch (status) {
      case 'Accepted': return tDeliv.statusAccepted;
      case 'Going to Store': return tDeliv.statusGoingToStore;
      case 'Arrived at Store': return tDeliv.statusArrivedAtStore;
      case 'Ready': return tDeliv.statusReady;
      case 'Picked Up': return tDeliv.statusPickedUp;
      case 'Out for Delivery': return tDeliv.statusOutForDelivery;
      case 'Delivered': return tDeliv.statusDelivered;
      default: return status;
    }
  };

  const translateVehicle = (v?: string) => {
    switch (v?.toLowerCase()) {
      case 'bike': return tPartner.vehicleBike;
      case 'scooter': return tPartner.vehicleScooter;
      case 'bicycle': return tPartner.vehicleBicycle;
      case 'car': return tPartner.vehicleCar;
      case 'auto': return tPartner.vehicleAuto;
      case 'van': return tPartner.vehicleVan;
      default: return v || tPartner.vehicleFallback;
    }
  };

  const vehicleOptions = [
    { key: 'Bike', label: tPartner.vehicleBike },
    { key: 'Scooter', label: tPartner.vehicleScooter },
    { key: 'Bicycle', label: tPartner.vehicleBicycle },
    { key: 'Car', label: tPartner.vehicleCar },
    { key: 'Auto', label: tPartner.vehicleAuto },
    { key: 'Van', label: tPartner.vehicleVan },
  ];
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

  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
    });
  };

  // Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Delivery OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Delivery Payment Preference & Razorpay Link State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState<{ url: string; amount: number; orderId: string } | null>(null);
  const [prefLoading, setPrefLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
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
      const currentReqs: any[] = (nextDash.requests || []).filter(
        (r: any) => !r.assignedPartnerId && r.deliveryStatus !== 'Accepted',
      );
      nextDash.requests = currentReqs;
      const currentIds = new Set<string>(currentReqs.map((r: any) => String(r.orderId || r.deliveryRequestId)));

      if (!isInitialLoadRef.current) {
        const newReqs = currentReqs.filter((r: any) => !prevRequestIdsRef.current.has(String(r.orderId || r.deliveryRequestId)));
        if (newReqs.length > 0) {
          const firstReq = newReqs[0];
          showAlert(
            tPartner.newRequestAlertTitle,
            `${tPartner.newRequestAlertMsg}\n${tPartner.storePickup}: ${firstReq.storeName || tPartner.storeFallback}\n${tPartner.earningsTab}: ${tPartner.currencyPrefix} ${firstReq.earnings || 0}\nDistance: ${firstReq.distanceKm || 3.5} ${tPartner.kmUnit}`,
            'info',
          );
        }
      } else {
        isInitialLoadRef.current = false;
      }
      prevRequestIdsRef.current = currentIds;
      setDashboard(nextDash);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Unauthenticated or token cleared, ignore gracefully
        return;
      }
      console.warn('Delivery dashboard load error:', error?.message);
    }
  }, [token, tPartner.newRequestAlertTitle, tPartner.newRequestAlertMsg, tPartner.storePickup, tPartner.storeFallback, tPartner.earningsTab, tPartner.currencyPrefix, tPartner.kmUnit]);

  useEffect(() => {
    if (!token) return;
    load();
    const timer = setInterval(() => {
      if (token) {
        load();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [load, token]);

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
      showAlert(
        'Availability',
        error?.response?.data?.message || 'Could not update availability.',
        'error',
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
      // Optimistically remove request from list so it disappears immediately
      setDashboard((prev: any) => ({
        ...prev,
        requests: (prev?.requests || []).filter((r: any) => (r.orderId || r._id) !== orderId),
      }));
      showAlert(
        tPartner.deliveryUnavailableTitle || 'Delivery Unavailable',
        error?.response?.data?.message ||
          tPartner.deliveryUnavailableMsg ||
          'This delivery request is no longer available.',
        'error',
      );
      await load();
    } finally {
      setWorking(false);
    }
  };

  const decline = async (orderId: string) => {
    setWorking(true);
    // Optimistically remove request from list so UI responds instantly
    setDashboard((prev: any) => ({
      ...prev,
      requests: (prev?.requests || []).filter((r: any) => (r.orderId || r._id) !== orderId),
    }));
    try {
      await smartOrderApi.declineDeliveryPartnerRequest(orderId);
      await load();
    } catch (error: any) {
      showAlert(
        'Decline failed',
        error?.response?.data?.message || 'Could not decline this request.',
        'error',
      );
      await load();
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
      showAlert('Maps Navigation', 'Could not open external maps application.', 'error');
    });
  };

  const handleVerifyAndDeliver = async () => {
    const active = dashboard.activeDelivery;
    const clean = deliveryOtp.trim();
    if (!active) return;
    if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
      setOtpError('Please enter a valid 6-digit numeric OTP provided by the customer.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      await smartOrderApi.updateDeliveryPartnerStatus(active.orderId, 'Delivered', undefined, clean);
      setShowOtpModal(false);
      setDeliveryOtp('');
      showAlert('Delivery Verified', '🎉 Order delivered successfully! Customer OTP verified.', 'success');
      await load();
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'Invalid OTP. Please check with the customer and try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const advance = async () => {
    const active = dashboard.activeDelivery;
    const action = active && getNextAction(active.deliveryStatus);
    if (!active || !action) return;

    // If advancing to Delivered, customer OTP verification is mandatory
    if (action.status === 'Delivered') {
      setDeliveryOtp('');
      setOtpError('');
      setShowOtpModal(true);
      return;
    }

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
      showAlert(
        'Status update failed',
        error?.response?.data?.message || 'Invalid delivery transition.',
        'error',
      );
    } finally {
      setWorking(false);
    }
  };

  const handleSetPreference = async (pref: 'CASH' | 'ONLINE') => {
    const active = dashboard.activeDelivery;
    if (!active) return;
    setPrefLoading(true);
    try {
      await smartOrderApi.setDeliveryPartnerPaymentPreference(active.orderId, pref);
      showAlert(
        'Payment Preference',
        `Preference set to ${pref === 'CASH' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}.`,
        'success',
      );
      await load();
    } catch (err: any) {
      showAlert(
        'Update Failed',
        err?.response?.data?.message || 'Failed to update payment preference',
        'error',
      );
    } finally {
      setPrefLoading(false);
    }
  };

  const handleResendPreferencePrompt = async () => {
    const active = dashboard.activeDelivery;
    if (!active) return;
    setPrefLoading(true);
    try {
      await smartOrderApi.resendPaymentPreferencePrompt(active.orderId);
      showAlert('Prompt Sent', 'WhatsApp payment preference message resent to customer.', 'success');
      await load();
    } catch (err: any) {
      showAlert('Send Failed', err?.response?.data?.message || 'Failed to resend WhatsApp prompt', 'error');
    } finally {
      setPrefLoading(false);
    }
  };

  const handleResendPaymentLink = async () => {
    const active = dashboard.activeDelivery;
    if (!active) return;
    setPrefLoading(true);
    try {
      await smartOrderApi.resendPaymentLinkWhatsApp(active.orderId);
      showAlert('Link Sent', 'Payment link resent to customer via WhatsApp.', 'success');
      await load();
    } catch (err: any) {
      showAlert('Send Failed', err?.response?.data?.message || 'Failed to resend payment link', 'error');
    } finally {
      setPrefLoading(false);
    }
  };


  const handleReturnHome = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('CustomerHome');
      }
    } catch {
      try {
        navigation.navigate('CustomerHome');
      } catch {
        navigation.navigate('Home');
      }
    }
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
      showAlert('Validation Error', 'Full name is required.', 'error');
      return;
    }
    if (!editForm.mobilenumber.trim()) {
      showAlert('Validation Error', 'Mobile number is required.', 'error');
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
        showAlert('Success', 'Profile updated successfully!', 'success');
      }
    } catch (error: any) {
      showAlert(
        'Update Failed',
        error?.response?.data?.message || 'Could not update profile. Please try again.',
        'error',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }

    // Reset root navigation to RoleGate (identical to standard app signout process)
    try {
      let rootNav: any = navigation;
      while (rootNav?.getParent && rootNav.getParent()) {
        rootNav = rootNav.getParent();
      }
      rootNav?.reset?.({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });
      return;
    } catch {}

    try {
      navigation.navigate('CustomerHome');
      return;
    } catch {}

    try {
      navigation.navigate('Home');
      return;
    } catch {}
  };

  // If logged out / no auth token, do NOT show dashboard loading screen
  if (!token) {
    return null;
  }

  if (!profile) {
    return (
      <RemiseLoading
        fullscreen
        size="lg"
        message={tPartner.loadingDashboard}
        subMessage={tPartner.loadingDashboardSub}
      />
    );
  }

  const available = profile.deliveryPartner?.availability === 'AVAILABLE';
  const active = dashboard.activeDelivery;
  const action = active && getNextAction(active.deliveryStatus);
  const totalEarned = (dashboard.completedDeliveries || 0) * 120;

  return (
    <View style={styles.screen}>
      {/* Top Header Bar with Spacing & Status Safe Area */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        {/* Upper Row: Utility Action Buttons & Availability Toggle */}
        <View style={styles.topRow}>
          <View style={styles.headerLeftActions}>
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

            <TouchableOpacity
              style={styles.logoutHeaderBtn}
              onPress={() => setShowLogoutModal(true)}
              accessibilityLabel="Sign out"
            >
              <LogOut size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={toggleAvailability}
            disabled={working}
            style={[styles.availability, available && styles.offline]}
          >
            <Power size={13} color="#fff" />
            <Text style={styles.availabilityText}>
              {available ? tPartner.goOffline : tPartner.goAvailable}
            </Text>
          </Pressable>
        </View>

        {/* Lower Row: Delivery Partner Info & Live Status Badge */}
        <View style={styles.partnerInfoRow}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerAvatarText}>
              {(user?.fullname || profile?.fullname || 'D').trim().charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.partnerDetails}>
            <View style={styles.partnerNameRow}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {user?.fullname || profile.fullname}
              </Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#10B981" />
                <Text style={styles.verifiedText}>{tPartner.verified}</Text>
              </View>
            </View>
            <Text style={styles.vehicleSubtitle} numberOfLines={1}>
              {translateVehicle(profile.deliveryPartner?.vehicleType)} · {profile.deliveryPartner?.vehicleNumber || tPartner.registeredFallback}
            </Text>
          </View>
          <View style={[styles.statusIndicator, available ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusIndicatorDot, available ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.statusIndicatorText, available ? styles.textOnline : styles.textOffline]}>
              {available ? tPartner.online : tPartner.offline}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs Menu */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'live' && styles.tabItemActive]}
          onPress={() => setActiveTab('live')}
        >
          <Truck size={14} color={activeTab === 'live' ? CustomerColors.primary : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]} numberOfLines={1}>
            {tPartner.liveTripsTab}
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
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]} numberOfLines={1}>
            {tPartner.earningsTab}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <User size={14} color={activeTab === 'profile' ? CustomerColors.primary : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]} numberOfLines={1}>
            {tPartner.profileTab}
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
            <Text style={styles.gpsText} numberOfLines={1} ellipsizeMode="tail">
              {available ? tPartner.gpsActiveZone : tPartner.gpsOfflinePrompt}
            </Text>
          </View>
          <Compass size={14} color={isDark ? '#94A3B8' : '#64748B'} />
        </View>

        {/* ══════════════ TAB 1: LIVE TRIPS ══════════════ */}
        {activeTab === 'live' && (
          <>
            {/* Quick Metrics */}
            <View style={styles.stats}>
              <Stat
                label={tPartner.statusLabel}
                value={available ? tPartner.availableStatus : tPartner.offlineStatus}
                sub={available ? tPartner.receivingTripsSub : tPartner.standbySub}
                styles={styles}
                highlight={available}
              />
              <Stat
                label={tPartner.newTripsLabel}
                value={String(dashboard.requests.length)}
                sub={tPartner.waitingSub}
                styles={styles}
              />
              <Stat
                label={tPartner.completedLabel}
                value={String(dashboard.completedDeliveries)}
                sub={tPartner.tripsSub}
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
                      <Text style={styles.activeEyebrow}>{tPartner.activeOrderInProgress}</Text>
                      <Text style={styles.activeOrderId}>{tPartner.orderPrefix}{active.orderId}</Text>
                    </View>
                  </View>
                  <Text style={styles.statusBadgeText}>{translateMilestone(active.deliveryStatus)}</Text>
                </View>

                <View style={styles.infoGroup}>
                  <Info
                    label={tPartner.storePickup}
                    value={active.deliveryRequest?.pickupAddress || active.storeName || tPartner.storeFallback}
                    styles={styles}
                  />
                  <Info
                    label={tPartner.dropoffAddress}
                    value={active.deliveryRequest?.dropAddress || tPartner.customerDropoffDestination}
                    styles={styles}
                  />
                  <Info
                    label="Customer Name"
                    value={active.customerName || [active.shippingAddress?.firstName, active.shippingAddress?.lastName].filter(Boolean).join(' ') || 'Customer'}
                    styles={styles}
                    icon={<User size={13} color="#3B82F6" />}
                  />
                  <View style={styles.phoneRowCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Phone size={13} color="#10B981" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.statLabel}>Customer Mobile</Text>
                        <Text style={styles.infoValue}>{active.customerPhone || active.shippingAddress?.phone || 'N/A'}</Text>
                      </View>
                    </View>
                    {(active.customerPhone || active.shippingAddress?.phone) && (
                      <TouchableOpacity
                        style={styles.callSmallBtn}
                        onPress={() => Linking.openURL(`tel:${active.customerPhone || active.shippingAddress?.phone}`)}
                      >
                        <Phone size={11} color="#FFFFFF" />
                        <Text style={styles.callSmallBtnText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Total Bill / Order Total Amount Highlight Box */}
                <View style={styles.totalBillBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.walletIconWrap}>
                      <Wallet size={16} color="#FF0000" />
                    </View>
                    <View>
                      <Text style={styles.totalBillLabel}>Customer Total Bill</Text>
                      <Text style={styles.totalBillSub}>Total Order Amount</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.totalBillAmount}>Rs {Number(active.totalAmount || 0).toLocaleString()}</Text>
                    <Text style={styles.totalBillPaymentType}>
                      {active.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'}
                    </Text>
                  </View>
                </View>

                {/* Customer Payment Preference & Razorpay Payment Link */}
                {(active.paymentMethod === 'cod' || active.paymentPreference || active.deliveryPaymentPrompt) && (
                  <View style={[
                    styles.prefBox,
                    active.paymentStatus === 'paid' ? styles.prefBoxPaid :
                    active.paymentPreference === 'ONLINE' ? styles.prefBoxOnline :
                    styles.prefBoxDefault
                  ]}>
                    <View style={styles.prefHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MessageSquare size={15} color={active.paymentPreference === 'ONLINE' ? '#3B82F6' : active.paymentPreference === 'CASH' ? '#F59E0B' : '#FF0000'} />
                        <Text style={styles.prefTitle}>Payment Preference</Text>
                      </View>
                      <View style={[
                        styles.prefBadge,
                        active.paymentStatus === 'paid' ? styles.prefBadgePaid :
                        active.paymentPreference === 'ONLINE' ? styles.prefBadgeOnline :
                        active.paymentPreference === 'CASH' ? styles.prefBadgeCash :
                        styles.prefBadgeWaiting
                      ]}>
                        <Text style={[
                          styles.prefBadgeText,
                          active.paymentStatus === 'paid' ? styles.prefTextPaid :
                          active.paymentPreference === 'ONLINE' ? styles.prefTextOnline :
                          active.paymentPreference === 'CASH' ? styles.prefTextCash :
                          styles.prefTextWaiting
                        ]}>
                          {active.paymentStatus === 'paid'
                            ? 'PAID & VERIFIED'
                            : active.paymentPreference === 'ONLINE'
                            ? 'Online Payment'
                            : active.paymentPreference === 'CASH'
                            ? 'Cash on Delivery'
                            : 'Waiting Reply'}
                        </Text>
                      </View>
                    </View>

                    {active.paymentStatus === 'paid' ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <CheckCircle2 size={14} color="#10B981" />
                        <Text style={[styles.prefDesc, { color: '#10B981', fontWeight: 'bold' }]}>
                          Online payment completed (Rs {Number(active.paymentLinkDetails?.amount || active.totalAmount).toLocaleString()}). Handover with OTP.
                        </Text>
                      </View>
                    ) : active.paymentPreference === 'ONLINE' ? (
                      <View style={{ marginTop: 8, gap: 8 }}>
                        <Text style={styles.prefDesc}>Customer chose to pay online. Payment link is ready.</Text>
                        {active.paymentLinkDetails?.shortUrl && (
                          <View style={styles.prefLinkBox}>
                            <Text style={styles.prefLinkText} numberOfLines={1}>
                              {active.paymentLinkDetails.shortUrl}
                            </Text>
                            <TouchableOpacity
                              style={styles.qrSmallBtn}
                              onPress={() => {
                                setQrData({
                                  url: active.paymentLinkDetails.shortUrl,
                                  amount: active.paymentLinkDetails.amount || active.totalAmount,
                                  orderId: active.orderId,
                                });
                                setShowQrModal(true);
                              }}
                            >
                              <QrCode size={13} color="#FFFFFF" />
                              <Text style={styles.qrSmallBtnText}>QR</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                          <TouchableOpacity
                            style={styles.prefActionBtn}
                            onPress={handleResendPaymentLink}
                            disabled={prefLoading}
                          >
                            <Text style={styles.prefActionBtnText}>Resend Link (WhatsApp)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.prefSecondaryBtn}
                            onPress={() => handleSetPreference('CASH')}
                            disabled={prefLoading}
                          >
                            <Text style={styles.prefSecondaryBtnText}>Switch to Cash</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : active.paymentPreference === 'CASH' ? (
                      <View style={{ marginTop: 8, gap: 8 }}>
                        <Text style={styles.prefDesc}>
                          Collect <Text style={{ color: '#FF0000', fontWeight: 'bold' }}>Rs {Number(active.totalAmount || 0).toLocaleString()}</Text> in cash upon handover.
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                          <TouchableOpacity
                            style={styles.prefActionBtn}
                            onPress={() => handleSetPreference('ONLINE')}
                            disabled={prefLoading}
                          >
                            <Text style={styles.prefActionBtnText}>Customer Wants Online</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={{ marginTop: 8, gap: 8 }}>
                        <Text style={styles.prefDesc}>WhatsApp prompt sent. Customer has not chosen yet.</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                          <TouchableOpacity
                            style={styles.prefSecondaryBtn}
                            onPress={handleResendPreferencePrompt}
                            disabled={prefLoading}
                          >
                            <Text style={styles.prefSecondaryBtnText}>Resend Prompt</Text>
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TouchableOpacity
                              style={[styles.prefPillBtn, { borderColor: '#F59E0B' }]}
                              onPress={() => handleSetPreference('CASH')}
                              disabled={prefLoading}
                            >
                              <Text style={[styles.prefPillBtnText, { color: '#F59E0B' }]}>Cash</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.prefPillBtn, { borderColor: '#3B82F6' }]}
                              onPress={() => handleSetPreference('ONLINE')}
                              disabled={prefLoading}
                            >
                              <Text style={[styles.prefPillBtnText, { color: '#3B82F6' }]}>Online</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

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
                    <Text style={styles.mapBtnText}>{tPartner.mapBtn}</Text>
                  </Pressable>
                </View>
              </View>
            )}


            {/* Requests Section */}
            <Text style={styles.sectionTitle}>{tPartner.availableRequestsTitle}</Text>
            {dashboard.requests.length === 0 ? (
              <View style={styles.empty}>
                <Package size={28} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text style={styles.emptyTitle}>{tPartner.noPendingRequestsTitle}</Text>
                <Text style={styles.muted}>
                  {available
                    ? tPartner.nearbyStoreRequestsDesc
                    : tPartner.goAvailableToReceiveDesc}
                </Text>
              </View>
            ) : (
              dashboard.requests.map(request => (
                <View style={styles.card} key={request.orderId}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {request.storeName || tPartner.storeFallback}
                      </Text>
                      <Info
                        label={tPartner.pickupLabel}
                        value={request.pickupAddress || tPartner.storePickup}
                        styles={styles}
                      />
                      <Info
                        label={tPartner.dropoffLabel}
                        value={request.dropAddress || tPartner.customerDropoffDestination}
                        styles={styles}
                      />
                      <Info
                        label="Customer Details"
                        value={`${request.customerName || 'Customer'}${request.customerPhone ? ' · ' + request.customerPhone : ''}`}
                        styles={styles}
                        icon={<User size={13} color="#3B82F6" />}
                      />
                    </View>
                    <View style={styles.earningsBox}>
                      <Text style={styles.earnings}>Rs {request.earnings || 120}</Text>
                      <Text style={styles.distanceKm}>{request.distanceKm || 2.4} {tPartner.kmUnit}</Text>
                      <View style={styles.reqBillWrap}>
                        <Text style={styles.reqBillLabel}>Customer Bill</Text>
                        <Text style={styles.reqBillAmount}>Rs {Number(request.totalAmount || 0).toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => accept(request.orderId || request._id)}
                      disabled={working}
                      style={[styles.primary, { flex: 1 }]}
                    >
                      <CheckCircle2 size={15} color="#fff" />
                      <Text style={styles.primaryText}>{tPartner.acceptRequestBtn}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => decline(request.orderId || request._id)}
                      disabled={working}
                      style={styles.secondary}
                    >
                      <XCircle size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                      <Text style={styles.secondaryText}>{tPartner.declineBtn}</Text>
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
              <Text style={styles.earningsLabel}>{tPartner.estimatedTotalEarnings}</Text>
              <Text style={styles.earningsBigValue}>Rs {totalEarned.toLocaleString()}</Text>
              <View style={styles.earningsRateRow}>
                <TrendingUp size={13} color="#10B981" />
                <Text style={styles.earningsRateText}>{tPartner.avgPerVerifiedDelivery}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{tPartner.payoutSummaryTitle}</Text>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>{tPartner.completedTripsLabel}</Text>
                <Text style={styles.tableValue}>{dashboard.completedDeliveries}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>{tPartner.baseFareLabel}</Text>
                <Text style={styles.tableValue}>{tPartner.baseFareValue}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>{tPartner.distanceIncentiveLabel}</Text>
                <Text style={styles.tableValue}>{tPartner.distanceIncentiveValue}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>{tPartner.payoutFrequencyLabel}</Text>
                <Text style={styles.tableHighlight}>{tPartner.weeklyDirectTransfer}</Text>
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
                    <Text style={styles.editBtnText}>{tPartner.editBtn}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{tPartner.vehicleTypeLabel}</Text>
                  <Text style={styles.tableValue}>{translateVehicle(profile.deliveryPartner?.vehicleType || 'Bike')}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{tPartner.vehicleNumberLabel}</Text>
                  <Text style={styles.tableValue}>{profile.deliveryPartner?.vehicleNumber || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{tPartner.partnerRatingLabel}</Text>
                  <Text style={styles.tableValue}>4.9 ★ ({tPartner.topRated})</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{tPartner.serviceAreaLabel}</Text>
                  <Text style={styles.tableValue}>{profile.deliveryPartner?.address || tPartner.notSpecified}</Text>
                </View>
              </View>
            ) : (
              /* Profile Edit Form */
              <View style={styles.card}>
                <View style={styles.editHeaderRow}>
                  <Text style={styles.cardTitle}>{tPartner.editPartnerProfileTitle}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditingProfile(false)}
                    style={styles.cancelSmallBtn}
                  >
                    <X size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>{tPartner.fullNameLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.fullname}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, fullname: txt }))}
                    placeholder={tPartner.fullNamePlaceholder}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>{tPartner.mobileNumberLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.mobilenumber}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, mobilenumber: txt }))}
                    placeholder={tPartner.mobileNumberPlaceholder}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>{tPartner.vehicleTypeLabel}</Text>
                  <View style={styles.vehicleTypePills}>
                    {vehicleOptions.map(vOpt => {
                      const isSelected = editForm.vehicleType.toLowerCase() === vOpt.key.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={vOpt.key}
                          style={[styles.vehiclePill, isSelected && styles.vehiclePillActive]}
                          onPress={() => setEditForm(prev => ({ ...prev, vehicleType: vOpt.key }))}
                        >
                          <Text style={[styles.vehiclePillText, isSelected && styles.vehiclePillTextActive]}>
                            {vOpt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>{tPartner.licensePlateLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.vehicleNumber}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, vehicleNumber: txt }))}
                    placeholder={tPartner.vehicleNumberPlaceholder}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>{tPartner.serviceAreaLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.address}
                    onChangeText={txt => setEditForm(prev => ({ ...prev, address: txt }))}
                    placeholder={tPartner.serviceAreaPlaceholder}
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
                      {savingProfile ? tPartner.savingProfileBtn : tPartner.saveProfileBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondary}
                    onPress={() => setIsEditingProfile(false)}
                    disabled={savingProfile}
                  >
                    <Text style={styles.secondaryText}>{tPartner.cancelBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Actions / Home Option */}
            <TouchableOpacity style={styles.homeActionBtn} onPress={handleReturnHome}>
              <Home size={16} color="#FF0000" />
              <Text style={styles.homeActionText}>{tPartner.returnToStoreHomeBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setShowLogoutModal(true)}
            >
              <LogOut size={15} color="#EF4444" />
              <Text style={styles.logoutText}>{tPartner.signOutPartnerAccountBtn}</Text>
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
                  <Text style={styles.modalEyebrow}>{tPartner.liveGpsNavTitle}</Text>
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
                    {navTarget.type === 'store' ? tPartner.storePickupLocation : tPartner.customerDropoffDestination}
                  </Text>
                  <Text style={styles.navTargetAddress}>{navTarget.address}</Text>
                </View>
              </View>

              <View style={styles.navModeBadge}>
                <Compass size={13} color="#10B981" />
                <Text style={styles.navModeText}>{tPartner.directionsFromCurrentGps}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryNavBtn}
                onPress={() => openGoogleMapsApp(navTarget.address)}
              >
                <ExternalLink size={16} color="#fff" />
                <Text style={styles.primaryNavBtnText}>{tPartner.openTurnByTurnMaps}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryNavBtn}
                onPress={() => setShowNavModal(false)}
              >
                <Text style={styles.secondaryNavBtnText}>{tPartner.closeNavBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════ OTP VERIFICATION MODAL ══════════════ */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!verifyingOtp) setShowOtpModal(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!verifyingOtp) setShowOtpModal(false);
          }}
        >
          <Pressable style={styles.otpModalCard} onPress={e => e.stopPropagation?.()}>
            <View style={styles.shieldIconWrap}>
              <ShieldCheck size={28} color="#10B981" />
            </View>

            <Text style={styles.otpModalTitle}>Verify Customer Delivery OTP</Text>
            <Text style={styles.otpModalSub}>
              Ask the customer for the 6-digit confirmation OTP received upon placing the home delivery order.
            </Text>

            {dashboard.activeDelivery && (
              <View style={styles.otpSummaryCard}>
                <View style={styles.otpSummaryRow}>
                  <Text style={styles.otpSummaryLabel}>Customer:</Text>
                  <Text style={styles.otpSummaryValue}>
                    {dashboard.activeDelivery.customerName || 'Customer'}
                  </Text>
                </View>
                {dashboard.activeDelivery.customerPhone ? (
                  <View style={styles.otpSummaryRow}>
                    <Text style={styles.otpSummaryLabel}>Mobile:</Text>
                    <Text style={styles.otpSummaryValue}>
                      {dashboard.activeDelivery.customerPhone}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.otpSummaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Text style={styles.otpSummaryLabel}>Bill Total:</Text>
                  <Text style={[styles.otpSummaryValue, { color: '#10B981', fontWeight: '800' }]}>
                    ₹{Number(dashboard.activeDelivery.totalAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ width: '100%', marginBottom: 16 }}>
              <Text style={styles.otpInputLabel}>ENTER 6-DIGIT OTP</Text>
              <TextInput
                style={styles.otpTextInput}
                placeholder="• • • • • •"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                keyboardType="numeric"
                maxLength={6}
                value={deliveryOtp}
                onChangeText={text => {
                  setDeliveryOtp(text.replace(/[^0-9]/g, ''));
                  if (otpError) setOtpError('');
                }}
                editable={!verifyingOtp}
                autoFocus={true}
              />
              {otpError ? (
                <View style={styles.otpErrorWrap}>
                  <AlertCircle size={14} color="#EF4444" />
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                </View>
              ) : (
                <Text style={styles.otpHelperText}>
                  Both you and the store owner will be updated instantly once verified.
                </Text>
              )}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.alertCancelBtn, { flex: 1 }]}
                onPress={() => setShowOtpModal(false)}
                disabled={verifyingOtp}
              >
                <Text style={styles.alertCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.alertBtn,
                  { flex: 1.5, backgroundColor: deliveryOtp.trim().length === 6 ? '#10B981' : CustomerColors.primary },
                  verifyingOtp && { opacity: 0.7 },
                ]}
                onPress={handleVerifyAndDeliver}
                disabled={verifyingOtp}
              >
                <Text style={styles.alertBtnText}>
                  {verifyingOtp ? 'Verifying...' : 'Confirm & Deliver'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══════════════ CUSTOM THEMED ALERT MODAL ══════════════ */}
      <Modal
        visible={alertModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.alertOverlay}
          onPress={() => setAlertModal(prev => ({ ...prev, visible: false }))}
        >
          <Pressable style={styles.alertCard} onPress={e => e.stopPropagation?.()}>
            <View
              style={[
                styles.alertIconWrap,
                alertModal.type === 'info'
                  ? styles.alertInfoWrap
                  : alertModal.type === 'success'
                  ? styles.alertSuccessWrap
                  : styles.alertErrorWrap,
              ]}
            >
              {alertModal.type === 'info' ? (
                <Bell size={26} color="#3B82F6" />
              ) : alertModal.type === 'success' ? (
                <CheckCircle2 size={26} color="#10B981" />
              ) : (
                <AlertCircle size={26} color="#EF4444" />
              )}
            </View>

            <Text style={styles.alertTitle}>{alertModal.title}</Text>
            <Text style={styles.alertMessage}>{alertModal.message}</Text>

            <TouchableOpacity
              style={styles.alertBtn}
              onPress={() => setAlertModal(prev => ({ ...prev, visible: false }))}
              activeOpacity={0.85}
            >
              <Text style={styles.alertBtnText}>{tPartner.okBtn || 'OK'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══════════════ CUSTOM THEMED LOGOUT MODAL ══════════════ */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.alertOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable style={styles.alertCard} onPress={e => e.stopPropagation?.()}>
            <View style={[styles.alertIconWrap, styles.alertErrorWrap]}>
              <LogOut size={26} color="#EF4444" />
            </View>

            <Text style={styles.alertTitle}>{tPartner.signOutPartnerAccountBtn}</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to log out of your delivery partner account?
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.alertBtn, { flex: 1 }]}
                onPress={handleConfirmLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.alertBtnText}>{tPartner.signOutPartnerAccountBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alertCancelBtn, { flex: 1 }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.alertCancelBtnText}>{tPartner.cancelBtn || 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════ PAYMENT LINK QR CODE MODAL ═══════════ */}
      <Modal visible={showQrModal && !!qrData} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={[styles.alertCard, { maxWidth: 320, alignItems: 'center', padding: 22 }]}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 14, right: 14, padding: 4 }}
              onPress={() => setShowQrModal(false)}
            >
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(59, 130, 246, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <QrCode size={22} color="#3B82F6" />
            </View>

            <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#0F172A' }}>
              Scan to Pay Online
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center', marginTop: 4 }}>
              Customer can scan with Google Pay, PhonePe, Paytm, or any UPI app.
            </Text>

            {qrData?.url ? (
              <View style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, marginVertical: 14 }}>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData.url)}` }}
                  style={{ width: 180, height: 180 }}
                />
              </View>
            ) : null}

            <Text style={{ fontSize: 18, fontWeight: '900', color: '#FF0000', marginBottom: 6 }}>
              Rs {Number(qrData?.amount || 0).toLocaleString()}
            </Text>

            <TouchableOpacity
              style={[styles.primary, { width: '100%', marginTop: 8 }]}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.primaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Stat({ label, value, sub, styles, highlight = false }: any) {
  return (
    <View style={[styles.stat, highlight && styles.statHighlight]}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text
        style={[styles.statValue, highlight && styles.statValueHighlight]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      {sub ? <Text style={styles.statSub} numberOfLines={2}>{sub}</Text> : null}
    </View>
  );
}

function Info({ label, value, styles, icon }: any) {
  return (
    <View style={styles.info}>
      {icon || <MapPin size={13} color={CustomerColors.primary} />}
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
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: isDark ? '#0E0E0E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#E2E8F0',
      gap: 12,
      elevation: 2,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    homeBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)',
    },
    themeBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: isDark ? '#18181B' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
    },
    notifBtn: {
      width: 38,
      height: 38,
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
    logoutHeaderBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
    },
    partnerInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: isDark ? '#141414' : '#F8FAFC',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#222222' : '#EEF2F6',
    },
    partnerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#27272A' : '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    partnerAvatarText: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: 15,
      fontWeight: '800',
    },
    partnerDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    partnerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    partnerName: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: 13,
      fontWeight: '800',
      flexShrink: 1,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
      flexShrink: 0,
    },
    verifiedText: {
      color: '#10B981',
      fontSize: 8.5,
      fontWeight: '700',
    },
    vehicleSubtitle: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: 11,
      marginTop: 2,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 12,
      flexShrink: 0,
    },
    statusOnline: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    },
    statusOffline: {
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.1)',
    },
    statusIndicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    dotOnline: {
      backgroundColor: '#10B981',
    },
    dotOffline: {
      backgroundColor: isDark ? '#64748B' : '#94A3B8',
    },
    statusIndicatorText: {
      fontSize: 9.5,
      fontWeight: '800',
    },
    textOnline: {
      color: '#10B981',
    },
    textOffline: {
      color: isDark ? '#94A3B8' : '#64748B',
    },
    availability: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: CustomerColors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    offline: {
      backgroundColor: isDark ? '#27272A' : '#64748B',
      borderWidth: 1,
      borderColor: isDark ? '#3F3F46' : '#475569',
    },
    availabilityText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 12,
    },

    tabBar: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#0E0E0E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F1F1F' : '#E2E8F0',
      paddingHorizontal: 4,
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 11,
      paddingHorizontal: 2,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabItemActive: { borderBottomColor: CustomerColors.primary },
    tabText: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: 11,
      fontWeight: '700',
      flexShrink: 1,
    },
    tabTextActive: { color: CustomerColors.primary },
    badgeCount: {
      backgroundColor: CustomerColors.primary,
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
      marginLeft: 2,
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
      gap: 8,
    },
    gpsLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      marginRight: 6,
    },
    gpsDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: isDark ? '#64748B' : '#94A3B8' },
    gpsDotActive: { backgroundColor: '#10B981' },
    gpsText: {
      flex: 1,
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: 11,
      fontWeight: '600',
    },

    stats: { flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
      borderRadius: 12,
      padding: 9,
      minHeight: 96,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDark ? '#222222' : '#E2E8F0',
    },
    statHighlight: {
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)',
    },
    statLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    statValue: { color: isDark ? '#F9FAFB' : '#0F172A', fontSize: 14, fontWeight: '800', marginTop: 2, lineHeight: 18 },
    statValueHighlight: { color: CustomerColors.primary },
    statSub: { color: isDark ? '#64748B' : '#94A3B8', fontSize: 9, marginTop: 1, lineHeight: 12 },

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
    primaryText: { color: '#fff', fontWeight: '800', fontSize: 12, textAlign: 'center', flexShrink: 1 },
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
    secondaryText: { color: isDark ? '#94A3B8' : '#475569', fontWeight: '700', fontSize: 12, textAlign: 'center', flexShrink: 1 },

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
      alignItems: 'center',
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E1E1E' : '#F1F5F9',
      gap: 10,
    },
    tableLabel: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: 12,
      flex: 1,
    },
    tableValue: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'right',
      flexShrink: 1,
      maxWidth: '60%',
    },
    tableHighlight: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'right',
      flexShrink: 1,
      maxWidth: '60%',
    },

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
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    alertCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: isDark ? '#161616' : '#FFFFFF',
      borderRadius: 20,
      paddingVertical: 22,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    alertIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    alertErrorWrap: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
    },
    alertSuccessWrap: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    },
    alertInfoWrap: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
    },
    alertTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#0F172A',
      textAlign: 'center',
      marginBottom: 6,
    },
    alertMessage: {
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 20,
      paddingHorizontal: 6,
    },
    alertBtn: {
      backgroundColor: CustomerColors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'center',
    },
    alertCancelBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#CBD5E1',
      backgroundColor: isDark ? '#1E1E20' : '#F1F5F9',
    },
    alertCancelBtnText: {
      color: isDark ? '#CBD5E1' : '#475569',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    modalActionsRow: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    phoneRowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    callSmallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#10B981',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    callSmallBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    totalBillBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.08)' : '#FFF1F2',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.2)' : '#FECDD3',
      borderRadius: 12,
      padding: 12,
      marginVertical: 10,
    },
    walletIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : '#FFE4E6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalBillLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1E293B',
    },
    totalBillSub: {
      fontSize: 11,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    totalBillAmount: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FF0000',
    },
    totalBillPaymentType: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    reqBillWrap: {
      marginTop: 4,
      alignItems: 'flex-end',
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.08)' : '#FFF1F2',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    reqBillLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : '#64748B',
      textTransform: 'uppercase',
    },
    reqBillAmount: {
      fontSize: 13,
      fontWeight: '900',
      color: '#FF0000',
    },
    otpModalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: isDark ? '#161616' : '#FFFFFF',
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    shieldIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    otpModalTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: isDark ? '#FFFFFF' : '#0F172A',
      textAlign: 'center',
      marginBottom: 6,
    },
    otpModalSub: {
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 16,
    },
    otpSummaryCard: {
      width: '100%',
      backgroundColor: isDark ? '#1E1E20' : '#F8FAFC',
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#E2E8F0',
    },
    otpSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#27272A' : '#F1F5F9',
    },
    otpSummaryLabel: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
      fontWeight: '600',
    },
    otpSummaryValue: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontWeight: '700',
    },
    otpInputLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: isDark ? '#94A3B8' : '#64748B',
      marginBottom: 8,
      textAlign: 'center',
    },
    otpTextInput: {
      width: '100%',
      height: 52,
      backgroundColor: isDark ? '#1F1F23' : '#F1F5F9',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: isDark ? '#3F3F46' : '#CBD5E1',
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: 8,
      textAlign: 'center',
      color: isDark ? '#FFFFFF' : '#0F172A',
    },
    otpHelperText: {
      fontSize: 11,
      color: isDark ? '#71717A' : '#94A3B8',
      textAlign: 'center',
      marginTop: 6,
    },
    otpErrorWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 6,
    },
    otpErrorText: {
      fontSize: 12,
      color: '#EF4444',
      fontWeight: '600',
    },
    prefBox: {
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      marginVertical: 4,
    },
    prefBoxDefault: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    },
    prefBoxPaid: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
    },
    prefBoxOnline: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
    },
    prefHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    },
    prefTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#0F172A',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    prefBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
    },
    prefBadgePaid: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    prefBadgeOnline: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    prefBadgeCash: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    prefBadgeWaiting: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
    },
    prefBadgeText: {
      fontSize: 10,
      fontWeight: '800',
    },
    prefTextPaid: { color: '#10B981' },
    prefTextOnline: { color: '#3B82F6' },
    prefTextCash: { color: '#F59E0B' },
    prefTextWaiting: { color: isDark ? '#94A3B8' : '#64748B' },
    prefDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: isDark ? '#CBD5E1' : '#475569',
    },
    prefLinkBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      gap: 6,
    },
    prefLinkText: {
      flex: 1,
      fontSize: 11,
      color: isDark ? '#93C5FD' : '#2563EB',
    },
    qrSmallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#3B82F6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    qrSmallBtnText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    prefActionBtn: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.35)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
    },
    prefActionBtnText: {
      color: '#3B82F6',
      fontSize: 11,
      fontWeight: '700',
    },
    prefSecondaryBtn: {
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
    },
    prefSecondaryBtnText: {
      color: isDark ? '#CBD5E1' : '#64748B',
      fontSize: 11,
      fontWeight: '600',
    },
    prefPillBtn: {
      borderWidth: 1,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
    },
    prefPillBtnText: {
      fontSize: 11,
      fontWeight: '800',
    },
  });


