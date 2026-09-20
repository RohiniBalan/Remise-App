import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Package,
  Navigation,
  Store,
  User,
  AlertCircle,
  Banknote,
  Check,
  RefreshCw,
  ExternalLink,
  Bike,
  RotateCcw,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const TRACKING_STEPS = [
  { key: 'Pending', label: 'Order Placed', desc: 'Order received by store' },
  { key: 'Accepted', label: 'Partner Assigned', desc: 'Delivery partner assigned' },
  { key: 'Going to Store', label: 'Heading to Store', desc: 'Partner on the way to store' },
  { key: 'Arrived at Store', label: 'At Store', desc: 'Partner collecting items' },
  { key: 'Picked Up', label: 'Picked Up', desc: 'Collected & packed' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'On the way to your door' },
  { key: 'Delivered', label: 'Delivered', desc: 'Successfully delivered' },
];

export default function OrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = useCallback(
    async (isBackground = false) => {
      if (!orderId) return;
      try {
        if (!isBackground) setLoading(true);
        else setRefreshing(true);
        setError('');

        const res = await smartOrderApi.getOrderTracking(orderId);
        if (res.data?.success) {
          setOrder(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load tracking data');
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Order not found or tracking unavailable'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchTracking(false);
  }, [fetchTracking]);

  // Live polling every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTracking(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const isRefundedOrCancelled =
    order?.paymentStatus === 'REFUNDED' ||
    order?.orderStatus === 'Cancelled' ||
    order?.deliveryStatus === 'Cancelled' ||
    (order as any)?.refundStatus === 'refunded' ||
    (order as any)?.refundStatus === 'processing';

  const currentStatus = isRefundedOrCancelled
    ? 'Refund Processing'
    : order?.deliveryStatus || order?.orderStatus || 'Pending';
  const driver = order?.deliveryPerson || {};
  const isCod = order?.paymentMethod === 'cod' || order?.paymentMethod === 'cash';

  const getActiveStepIndex = () => {
    if (isRefundedOrCancelled) return 0;
    if (currentStatus === 'Delivered' || order?.orderStatus === 'Delivered') return 6;
    if (currentStatus === 'Out for Delivery') return 5;
    if (currentStatus === 'Picked Up') return 4;
    if (currentStatus === 'Arrived at Store') return 3;
    if (currentStatus === 'Going to Store') return 2;
    if (currentStatus === 'Accepted' || currentStatus === 'Assigned') return 1;
    if (currentStatus === 'Searching') return 1;
    return 0;
  };

  const activeStepIdx = getActiveStepIndex();

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenMap = (address: string) => {
    if (!address) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerTitle}>Live Order Tracking</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>Order #{orderId}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchTracking(true)}>
          <RefreshCw size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
          <Text style={styles.loadingText}>Loading Live Tracking…</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <AlertCircle size={36} color="#DC2626" />
          <Text style={styles.errorTitle}>Tracking Unavailable</Text>
          <Text style={styles.errorSub}>{error || 'Could not locate this order.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTracking(false)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTracking(true)}
              colors={[CustomerColors.teal600]}
              tintColor={CustomerColors.teal600}
            />
          }
        >
          {/* Status Header Banner */}
          <View style={[styles.statusCard, isRefundedOrCancelled && { borderColor: '#F59E0B' }]}>
            <View style={styles.statusHeaderRow}>
              <View style={[styles.statusIconWrap, isRefundedOrCancelled && { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                {isRefundedOrCancelled ? (
                  <RotateCcw size={24} color="#D97706" />
                ) : currentStatus === 'Delivered' ? (
                  <CheckCircle2 size={24} color="#15803D" />
                ) : (
                  <Truck size={24} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusEta, isRefundedOrCancelled && { color: '#D97706' }]}>
                  {isRefundedOrCancelled
                    ? 'Refund in Progress'
                    : currentStatus === 'Delivered'
                    ? 'Fulfillment Completed'
                    : 'Estimated Arrival: ~15-20 Mins'}
                </Text>
                <Text style={styles.statusMainText}>
                  {isRefundedOrCancelled
                    ? 'Order Cancelled · Refund Processing'
                    : currentStatus === 'Delivered'
                    ? 'Order Delivered!'
                    : currentStatus === 'Out for Delivery'
                    ? 'Out for Delivery!'
                    : currentStatus === 'Picked Up'
                    ? 'Picked Up from Store'
                    : currentStatus === 'Arrived at Store'
                    ? 'Partner at Store'
                    : currentStatus === 'Going to Store'
                    ? 'Partner Heading to Store'
                    : currentStatus === 'Searching'
                    ? 'Finding Delivery Partner…'
                    : 'Order Confirmed & Preparing'}
                </Text>
              </View>
            </View>

            {isRefundedOrCancelled ? (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#FDE68A' : '#92400E', lineHeight: 16, fontWeight: '500' }}>
                  This order was cancelled. Your refund of ₹{order?.totalAmount} is currently being processed by Razorpay (5-7 business days).
                </Text>
              </View>
            ) : null}
          </View>

          {/* Stepper Milestone List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Live Milestone Progress</Text>
            <View style={styles.stepperContainer}>
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed ? (
                          <Check size={11} color="#FFFFFF" />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotText,
                              isCurrent && styles.stepDotTextCurrent,
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        )}
                      </View>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            isPassed && styles.stepLinePassed,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepContentCol}>
                      <View style={styles.stepTitleRow}>
                        <Text
                          style={[
                            styles.stepLabel,
                            isCurrent && styles.stepLabelCurrent,
                            isPassed && styles.stepLabelPassed,
                          ]}
                        >
                          {step.label}
                        </Text>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Assigned Driver Card */}
          {driver?.name ? (
            <View style={styles.driverCard}>
              <View style={styles.driverRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {driver.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {driver.rating || '4.8'}</Text>
                    </View>
                  </View>
                  <Text style={styles.driverVehicle}>
                    {driver.vehicleType || 'Bike'} {driver.vehicleNumber ? `• ${driver.vehicleNumber}` : ''}
                  </Text>
                </View>

                {driver.phone ? (
                  <TouchableOpacity
                    style={styles.callPartnerBtn}
                    onPress={() => handleCall(driver.phone)}
                  >
                    <Phone size={13} color="#FFFFFF" />
                    <Text style={styles.callPartnerBtnText}>Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Store & Delivery Address Cards */}
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <Store size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressSectionTitle}>Pickup Store</Text>
                <Text style={styles.addressName}>{order.store?.name || order.storeName}</Text>
                {order.store?.address ? (
                  <Text style={styles.addressDetail}>{order.store.address}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.addressRow}>
              <MapPin size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressSectionTitle}>Delivery Address</Text>
                <Text style={styles.addressName}>{order.customerName}</Text>
                <Text style={styles.addressDetail}>
                  {order.deliveryAddress?.fullAddress || 'Address on file'}
                </Text>
                {order.customerPhone ? (
                  <Text style={styles.phoneText}>📞 {order.customerPhone}</Text>
                ) : null}
              </View>
              {order.deliveryAddress?.fullAddress ? (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => handleOpenMap(order.deliveryAddress.fullAddress)}
                >
                  <Navigation size={12} color="#2563EB" />
                  <Text style={styles.mapBtnText}>Map</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Order Items Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Items ({order.items?.length || 0})
            </Text>

            <View style={styles.itemsList}>
              {(order.items || []).map((item: any, idx: number) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemInfoCol}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.brand ? (
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    ) : null}
                  </View>
                  <View style={styles.itemPriceCol}>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.divider, { marginTop: 10 }]} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isRefundedOrCancelled ? 'Refund Amount:' : 'Total Amount:'}
              </Text>
              <Text style={[styles.totalValue, isRefundedOrCancelled && { color: '#D97706' }]}>
                ₹{order.totalAmount}
              </Text>
            </View>

            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={styles.totalLabel}>Payment Status:</Text>
              <Text
                style={[
                  styles.totalValue,
                  {
                    fontSize: 12,
                    color: isRefundedOrCancelled
                      ? '#D97706'
                      : order.paymentStatus === 'SUCCESS'
                      ? '#16A34A'
                      : '#D97706',
                  },
                ]}
              >
                {isRefundedOrCancelled ? 'REFUND PROCESSING' : order.paymentStatus}
              </Text>
            </View>

            {isCod && order.paymentStatus !== 'SUCCESS' ? (
              <View style={styles.codAlert}>
                <Banknote size={16} color="#B45309" />
                <Text style={styles.codAlertText}>
                  Please pay ₹{order.totalAmount} cash to the delivery partner.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0B0F17' : '#F4F7F9',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    backBtn: {
      padding: 6,
      borderRadius: BorderRadius.md,
    },
    headerTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    headerSub: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontFamily: 'monospace',
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(22, 163, 74, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: 'rgba(22, 163, 74, 0.3)',
    },
    liveDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: '#16A34A',
    },
    liveBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#16A34A',
    },
    refreshBtn: {
      padding: 8,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: 8,
    },
    loadingText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontWeight: '600',
    },
    errorTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    errorSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: CustomerColors.teal600,
      borderRadius: BorderRadius.md,
      marginTop: 8,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    statusCard: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      ...Shadows.card,
    },
    statusHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusEta: {
      fontSize: 10,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statusMainText: {
      fontSize: FontSizes.lg,
      fontWeight: '900',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginTop: 2,
    },
    card: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      ...Shadows.card,
      gap: Spacing.sm,
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    stepperContainer: {
      paddingLeft: 4,
    },
    stepRow: {
      flexDirection: 'row',
      gap: 12,
      minHeight: 48,
    },
    stepIndicatorCol: {
      alignItems: 'center',
      width: 22,
    },
    stepDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? '#1F2937' : '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDotPassed: {
      backgroundColor: '#16A34A',
    },
    stepDotCurrent: {
      backgroundColor: CustomerColors.teal600,
      transform: [{ scale: 1.15 }],
    },
    stepDotText: {
      fontSize: 9,
      fontWeight: '800',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    stepDotTextCurrent: {
      color: '#FFFFFF',
    },
    stepLine: {
      width: 2,
      flex: 1,
      backgroundColor: isDark ? '#1F2937' : '#E5E7EB',
      marginVertical: 2,
    },
    stepLinePassed: {
      backgroundColor: '#16A34A',
    },
    stepContentCol: {
      flex: 1,
      paddingBottom: 12,
    },
    stepTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    stepLabelPassed: {
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    stepLabelCurrent: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    currentBadge: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: BorderRadius.pill,
    },
    currentBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    stepDesc: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    driverCard: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#0f766e' : '#CCFBF1',
    },
    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    driverAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: CustomerColors.teal600,
      alignItems: 'center',
      justifyContent: 'center',
    },
    driverAvatarText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 16,
    },
    driverName: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    ratingBadge: {
      backgroundColor: isDark ? '#0f766e' : '#CCFBF1',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    ratingText: {
      fontSize: 9,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.teal700,
    },
    driverVehicle: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    callPartnerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: CustomerColors.teal600,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: BorderRadius.pill,
    },
    callPartnerBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    addressRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
    },
    addressSectionTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase',
    },
    addressName: {
      fontSize: FontSizes.xs + 1,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginTop: 2,
    },
    addressDetail: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    phoneText: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 4,
      fontFamily: 'monospace',
    },
    mapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
      backgroundColor: '#EFF6FF',
    },
    mapBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#2563EB',
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      marginVertical: 4,
    },
    itemsList: {
      gap: 8,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemInfoCol: {
      flex: 1,
    },
    itemTitle: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    itemBrand: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    itemPriceCol: {
      alignItems: 'flex-end',
    },
    itemQty: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    itemPrice: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 4,
    },
    totalLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    totalValue: {
      fontSize: FontSizes.base,
      fontWeight: '900',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    codAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? '#451a03' : '#FEF3C7',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginTop: 6,
    },
    codAlertText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#FCD34D' : '#92400E',
    },
  });
