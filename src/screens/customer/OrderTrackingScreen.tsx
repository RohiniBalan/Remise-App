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
  Star,
  ShieldCheck,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import LiveDeliveryTrackingMap from '../../components/common/LiveDeliveryTrackingMap';
import StoreReviewModal from '../../components/common/StoreReviewModal';
import { useTranslation, translateProductName, getSupplierTranslations } from '../../i18n';

export default function OrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { language, t } = useTranslation();
  const tSupplier = useMemo(() => getSupplierTranslations(language), [language]);
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const trackingSteps = useMemo(
    () => [
      { key: 'Pending', label: tSupplier.stepOrderPlaced, desc: tSupplier.stepOrderPlacedDesc },
      { key: 'Accepted', label: tSupplier.stepPartnerAssigned, desc: tSupplier.stepPartnerAssignedDesc },
      { key: 'Going to Store', label: tSupplier.stepHeadingToStore, desc: tSupplier.stepHeadingToStoreDesc },
      { key: 'Arrived at Store', label: tSupplier.stepAtStore, desc: tSupplier.stepAtStoreDesc },
      { key: 'Picked Up', label: tSupplier.stepPickedUp, desc: tSupplier.stepPickedUpDesc },
      { key: 'Out for Delivery', label: tSupplier.stepOutForDelivery, desc: tSupplier.stepOutForDeliveryDesc },
      { key: 'Delivered', label: tSupplier.stepDelivered, desc: tSupplier.stepDeliveredDesc },
    ],
    [tSupplier]
  );

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

  const isRefundCompleted =
    order?.paymentStatus === 'REFUNDED' ||
    (order as any)?.refundStatus === 'refunded' ||
    (order as any)?.refundStatus === 'processed';

  const isRefundProcessing =
    !isRefundCompleted &&
    (order?.orderStatus === 'Cancelled' ||
      order?.deliveryStatus === 'Cancelled' ||
      (order as any)?.refundStatus === 'processing' ||
      (order as any)?.refundStatus === 'requested');

  const isRefundedOrCancelled = isRefundCompleted || isRefundProcessing;

  const currentStatus = isRefundCompleted
    ? 'Refund Completed'
    : isRefundProcessing
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

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isFulfilled =
    currentStatus === 'Delivered' ||
    order?.orderStatus === 'Delivered' ||
    currentStatus === 'Picked Up' ||
    order?.orderStatus === 'Picked Up';
  const isEligibleForReview =
    isFulfilled &&
    order?.isOtpVerified === true &&
    !isRefundedOrCancelled;

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
            <Text style={styles.headerTitle}>{tSupplier.liveOrderTracking}</Text>
            <View
              style={[
                styles.liveBadge,
                isRefundCompleted && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' },
                isRefundProcessing && { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' },
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  isRefundCompleted && { backgroundColor: '#10B981' },
                  isRefundProcessing && { backgroundColor: '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.liveBadgeText,
                  isRefundCompleted && { color: '#10B981' },
                  isRefundProcessing && { color: '#D97706' },
                ]}
              >
                {isRefundCompleted ? tSupplier.refunded : isRefundProcessing ? tSupplier.refunding : tSupplier.live}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSub}>{tSupplier.orderNumber} #{orderId}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchTracking(true)}>
          <RefreshCw size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
          <Text style={styles.loadingText}>{tSupplier.loadingTracking}</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <AlertCircle size={36} color="#DC2626" />
          <Text style={styles.errorTitle}>{tSupplier.trackingUnavailable}</Text>
          <Text style={styles.errorSub}>{error || tSupplier.couldNotLocateOrder}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTracking(false)}>
            <Text style={styles.retryBtnText}>{tSupplier.retry}</Text>
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
          <View
            style={[
              styles.statusCard,
              isRefundCompleted && { borderColor: '#10B981' },
              isRefundProcessing && { borderColor: '#F59E0B' },
            ]}
          >
            <View style={styles.statusHeaderRow}>
              <View
                style={[
                  styles.statusIconWrap,
                  isRefundCompleted && { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                  isRefundProcessing && { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                ]}
              >
                {isRefundCompleted ? (
                  <CheckCircle2 size={24} color="#10B981" />
                ) : isRefundProcessing ? (
                  <RotateCcw size={24} color="#D97706" />
                ) : currentStatus === 'Delivered' ? (
                  <CheckCircle2 size={24} color="#15803D" />
                ) : (
                  <Truck size={24} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.statusEta,
                    isRefundCompleted && { color: '#10B981' },
                    isRefundProcessing && { color: '#D97706' },
                  ]}
                >
                  {isRefundCompleted
                    ? tSupplier.refundCompleted
                    : isRefundProcessing
                    ? tSupplier.refundInProgress
                    : currentStatus === 'Delivered'
                    ? tSupplier.fulfillmentCompleted
                    : tSupplier.estimatedArrival}
                </Text>
                <Text style={styles.statusMainText}>
                  {isRefundCompleted
                    ? tSupplier.orderCancelledRefundCompleted
                    : isRefundProcessing
                    ? tSupplier.orderCancelledRefundProcessing
                    : currentStatus === 'Delivered'
                    ? tSupplier.orderDeliveredExcl
                    : currentStatus === 'Out for Delivery'
                    ? tSupplier.outForDeliveryExcl
                    : currentStatus === 'Picked Up'
                    ? tSupplier.pickedUpFromStore
                    : currentStatus === 'Arrived at Store'
                    ? tSupplier.partnerAtStore
                    : currentStatus === 'Going to Store'
                    ? tSupplier.partnerHeadingToStore
                    : currentStatus === 'Searching'
                    ? tSupplier.findingDeliveryPartner
                    : tSupplier.orderConfirmedPreparing}
                </Text>
              </View>
            </View>

            {isRefundCompleted ? (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#6EE7B7' : '#065F46', lineHeight: 16, fontWeight: '500' }}>
                  {tSupplier.refundSuccessMsg.replace('{{amount}}', String(order?.totalAmount || 0))}
                </Text>
              </View>
            ) : isRefundProcessing ? (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#FDE68A' : '#92400E', lineHeight: 16, fontWeight: '500' }}>
                  {tSupplier.refundProcessingMsg.replace('{{amount}}', String(order?.totalAmount || 0))}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Delivery Handover OTP Card */}
          {Boolean(
            order?.orderOtp &&
              !order?.isOtpVerified &&
              currentStatus !== 'Delivered' &&
              !isRefundCompleted &&
              !isRefundProcessing &&
              (order?.deliveryMethod || '').toLowerCase() !== 'pickup'
          ) && (
            <View style={styles.otpBannerCard}>
              <View style={styles.otpBannerHeader}>
                <View style={styles.otpIconWrap}>
                  <ShieldCheck size={22} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.otpBannerBadge}>DELIVERY HANDOVER OTP</Text>
                  <Text style={styles.otpBannerTitle}>Share this OTP with Delivery Partner</Text>
                  <Text style={styles.otpBannerSub}>
                    Provide this 6-digit code upon receiving your items to verify delivery.
                  </Text>
                </View>
              </View>
              <View style={styles.otpCodeContainer}>
                <Text style={styles.otpCodeText}>{order.orderOtp}</Text>
              </View>
            </View>
          )}

          {/* Post-Fulfillment Store Review Prompt */}
          {isEligibleForReview && !reviewSubmitted && (
            <View style={styles.reviewPromptCard}>
              <View style={styles.reviewPromptHeader}>
                <View style={styles.reviewIconWrap}>
                  <Star size={22} color="#F59E0B" fill="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewPromptTitle}>Order Completed & Verified!</Text>
                  <Text style={styles.reviewPromptSub}>
                    Rate your experience with {order.store?.name || order.storeName || 'the store'} across 10 service criteria.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.reviewPromptBtn}
                onPress={() => setReviewModalVisible(true)}
              >
                <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.reviewPromptBtnText}>{t('orders.rateYourStore')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {reviewSubmitted && (
            <View style={styles.reviewSubmittedCard}>
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.reviewSubmittedText}>Thank you! Your store review has been submitted.</Text>
            </View>
          )}

          {/* Real-time Live GPS Tracking Map */}
          {!isRefundedOrCancelled ? (
            <LiveDeliveryTrackingMap
              orderId={orderId}
              deliveryStatus={currentStatus}
              driver={driver}
              storeName={order?.store?.name || order?.storeName}
              storeAddress={order?.store?.address || 'Store Location'}
              customerName={order?.customerName}
              customerAddress={order?.deliveryAddress?.fullAddress || 'Customer Address'}
              isStoreOwner={false}
              isDark={isDark}
            />
          ) : null}

          {/* Stepper Milestone List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{tSupplier.liveMilestoneProgress}</Text>
            <View style={styles.stepperContainer}>
              {trackingSteps.map((step, idx) => {
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
                      {idx < trackingSteps.length - 1 && (
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
                            <Text style={styles.currentBadgeText}>{tSupplier.stepCurrent}</Text>
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
                    <Text style={styles.callPartnerBtnText}>{tSupplier.callPartner}</Text>
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
                <Text style={styles.addressSectionTitle}>{tSupplier.pickupStore}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.addressName}>{order.store?.name || order.storeName}</Text>
                  {order.store?.rating ? (
                    <View style={styles.storeRatingBadge}>
                      <Star size={10} color="#D97706" fill="#D97706" />
                      <Text style={styles.storeRatingText}>
                        {Number(order.store.rating).toFixed(1)}{order.store.reviewCount ? ` (${order.store.reviewCount})` : ''}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {order.store?.address ? (
                  <Text style={styles.addressDetail}>{order.store.address}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.addressRow}>
              <MapPin size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressSectionTitle}>{tSupplier.deliveryAddress}</Text>
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
                  <Text style={styles.mapBtnText}>{tSupplier.openMap}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Order Items Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {tSupplier.orderItems} ({order.items?.length || 0})
            </Text>

            <View style={styles.itemsList}>
              {(order.items || []).map((item: any, idx: number) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemInfoCol}>
                    <Text style={styles.itemTitle}>{translateProductName(item.title, language)}</Text>
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

            {Boolean((order as any).platformFee) && (
              <View style={[styles.totalRow, { marginBottom: 4 }]}>
                <Text style={styles.totalLabel}>Platform Fee:</Text>
                <Text style={[styles.totalValue, { fontSize: 13, fontWeight: '600' }]}>
                  ₹{(order as any).platformFee}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isRefundedOrCancelled ? tSupplier.refundAmountColon : tSupplier.totalAmountColon}
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  isRefundCompleted && { color: '#10B981' },
                  isRefundProcessing && { color: '#D97706' },
                ]}
              >
                ₹{order.totalAmount}
              </Text>
            </View>

            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={styles.totalLabel}>{tSupplier.paymentStatusColon}</Text>
              <Text
                style={[
                  styles.totalValue,
                  {
                    fontSize: 12,
                    color: isRefundCompleted
                      ? '#10B981'
                      : isRefundProcessing
                      ? '#D97706'
                      : order.paymentStatus === 'SUCCESS'
                      ? '#16A34A'
                      : '#D97706',
                  },
                ]}
              >
                {isRefundCompleted
                  ? tSupplier.statusRefunded
                  : isRefundProcessing
                  ? tSupplier.refunding
                  : order.paymentStatus}
              </Text>
            </View>

            {isCod && order.paymentStatus !== 'SUCCESS' ? (
              <View style={styles.codAlert}>
                <Banknote size={16} color="#B45309" />
                <Text style={styles.codAlertText}>
                  {tSupplier.payCashToPartner.replace('{{amount}}', String(order.totalAmount || 0))}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {order && (
        <StoreReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          orderId={order._id || orderId}
          storeId={order.store?._id || order.storeId || order.store}
          storeName={order.store?.name || order.storeName || 'Store'}
          onSubmitted={() => {
            setReviewSubmitted(true);
            fetchTracking(true);
          }}
        />
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
    reviewPromptCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#FDE68A',
      ...Shadows.card,
    },
    reviewPromptHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    reviewIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewPromptTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: 2,
    },
    reviewPromptSub: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      lineHeight: 16,
    },
    reviewPromptBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#D97706',
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
    },
    reviewPromptBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '800',
    },
    reviewSubmittedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    reviewSubmittedText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#6EE7B7' : '#065F46',
    },
    storeRatingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
    },
    storeRatingText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#D97706',
    },
    otpBannerCard: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0',
    },
    otpBannerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    otpIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpBannerBadge: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    otpBannerTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#0F172A',
    },
    otpBannerSub: {
      fontSize: 11,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
      lineHeight: 15,
    },
    otpCodeContainer: {
      marginTop: 12,
      alignSelf: 'center',
      backgroundColor: '#10B981',
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: BorderRadius.md,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    otpCodeText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 6,
      textAlign: 'center',
    },
  });
