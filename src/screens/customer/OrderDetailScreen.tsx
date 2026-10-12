import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  Alert,
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
  Store,
  CreditCard,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  Star,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useTheme } from '../../context/ThemeContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import InvoiceModal from '../../components/common/InvoiceModal';
import RefundModal from '../../components/common/RefundModal';
import StoreReviewModal from '../../components/common/StoreReviewModal';
import { useTranslation, translateProductName } from '../../i18n';

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { language, t } = useTranslation();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<{
    orderId: string;
    totalAmount: number;
  } | null>(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<any | null>(null);
  const [refundError, setRefundError] = useState('');
  const [refundNotice, setRefundNotice] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchOrderDetail = useCallback(async (isBackground = false) => {
    if (!orderId) return;
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError('');

      const res = await smartOrderApi.getOrderDetails(orderId);
      if (res.data?.success && res.data.data) {
        setOrder(res.data.data);
      } else {
        setError(res.data?.message || 'Order not found');
      }
    } catch (err: any) {
      // Fallback to getOrderTracking
      try {
        const trackRes = await smartOrderApi.getOrderTracking(orderId);
        if (trackRes.data?.success && trackRes.data.data) {
          setOrder(trackRes.data.data);
          return;
        }
      } catch (_) {}
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load order details'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleRefundSubmit = async (amount: number, note: string) => {
    if (!selectedRefund) return;
    setIsRefunding(true);
    setRefundError('');
    try {
      const response = await smartOrderApi.createRefund({
        orderId: selectedRefund.orderId,
        refundAmount: amount,
        refundNote: note,
      });
      if (!response.data?.success) {
        setRefundError(response.data?.message || 'Failed to submit refund request');
        return;
      }
      setSelectedRefund(null);
      setRefundNotice(
        response.data?.message || 'Refund request submitted successfully.'
      );
      fetchOrderDetail(true);
    } catch (err: any) {
      setRefundError(
        err.response?.data?.message || err.message || 'Refund failed'
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const itemsSubtotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
  }, [order]);

  const deliveryFee = Number(order?.deliveryFee) || 0;
  const platformFee = Number(order?.platformFee) || 0;
  const totalAmount = Number(order?.totalAmount) || itemsSubtotal + deliveryFee + platformFee;

  const isPickup = (order?.deliveryMethod || '').toLowerCase() === 'pickup';
  const isDelivered =
    order?.deliveryStatus === 'Delivered' ||
    order?.orderStatus === 'Delivered' ||
    (isPickup && (order?.deliveryStatus === 'Picked Up' || Boolean(order?.pickedUpAt)));

  const isCancelled =
    order?.orderStatus === 'Cancelled' ||
    order?.deliveryStatus === 'Cancelled' ||
    order?.paymentStatus === 'REFUNDED' ||
    order?.refundStatus === 'refunded';

  const isRefundCompleted =
    order?.paymentStatus === 'REFUNDED' ||
    order?.refundStatus === 'refunded' ||
    order?.refundStatus === 'processed';

  const isRefundProcessing =
    !isRefundCompleted &&
    (order?.refundStatus === 'processing' || order?.refundStatus === 'requested');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSub}>
            #{order?.orderId || (orderId || '').slice(-8)}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={CustomerColors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={CustomerColors.danger} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSub}>{error || 'Could not find this order.'}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchOrderDetail()}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrderDetail(true)}
              tintColor={CustomerColors.primary}
            />
          }
        >
          {/* Refund Notice Banner */}
          {Boolean(refundNotice) && (
            <View style={styles.noticeBanner}>
              <Text style={styles.noticeText}>{refundNotice}</Text>
              <TouchableOpacity onPress={() => setRefundNotice('')}>
                <Text style={styles.noticeDismiss}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Highlight Banner */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardHeader}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isCancelled
                      ? CustomerColors.danger
                      : isDelivered
                      ? CustomerColors.success
                      : CustomerColors.primary,
                  },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>
                  {isCancelled
                    ? 'Order Cancelled'
                    : isDelivered
                    ? isPickup
                      ? 'Picked Up from Store'
                      : 'Delivered Successfully'
                    : order.deliveryStatus || order.orderStatus || 'Processing'}
                </Text>
                <Text style={styles.statusDesc}>
                  {isCancelled
                    ? 'This order has been cancelled.'
                    : isDelivered
                    ? isPickup
                      ? 'You have collected your order from the store counter.'
                      : 'Your package was safely handed over.'
                    : isPickup
                    ? 'Store is packing your items for counter collection.'
                    : 'Your package is on its way to your destination.'}
                </Text>
              </View>
            </View>

            <View style={styles.badgesRow}>
              {/* Payment Status Badge */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isRefundCompleted
                      ? isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'
                      : isRefundProcessing
                      ? isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB'
                      : order.paymentStatus === 'SUCCESS'
                      ? isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'
                      : isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                    borderColor: isRefundCompleted
                      ? '#10B981'
                      : isRefundProcessing
                      ? '#F59E0B'
                      : order.paymentStatus === 'SUCCESS'
                      ? '#10B981'
                      : '#EF4444',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isRefundCompleted
                        ? '#10B981'
                        : isRefundProcessing
                        ? '#F59E0B'
                        : order.paymentStatus === 'SUCCESS'
                        ? '#10B981'
                        : '#EF4444',
                    },
                  ]}
                >
                  {isRefundCompleted
                    ? t('orders.paymentRefunded') || 'Refunded'
                    : isRefundProcessing
                    ? t('orders.paymentRefundProcessing') || 'Refund Processing'
                    : order.paymentStatus === 'SUCCESS'
                    ? 'Paid · ' + (t('orders.paymentSuccess') || 'SUCCESS')
                    : order.paymentStatus || 'Pending'}
                </Text>
              </View>

              {/* Delivery Method Badge */}
              <View style={[styles.badge, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <Text style={[styles.badgeText, { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary }]}>
                  {isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                </Text>
              </View>
            </View>

            {order.createdAt && (
              <View style={styles.dateRow}>
                <Calendar size={13} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
                <Text style={styles.dateText}>
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionGrid}>
            {/* Live Track */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => navigation.navigate('OrderTracking', { orderId: order.orderId || order._id })}
            >
              <Truck size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>
                {t('orders.trackOrder') || 'Live Tracking'}
              </Text>
            </TouchableOpacity>

            {/* View Bill */}
            {(order.paymentStatus === 'SUCCESS' ||
              order.paymentMethod === 'cod' ||
              order.paymentMethod === 'cash') && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSecondary]}
                  onPress={() => setSelectedInvoiceOrderId(order.orderId || order._id)}
                >
                  <FileText size={14} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
                  <Text style={styles.actionBtnSecondaryText}>
                    {t('orders.viewBill') || 'View Bill'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDownload]}
                  onPress={async () => {
                    const url = smartOrderApi.getInvoicePdfUrl(order.orderId || order._id);
                    try {
                      await Linking.openURL(url);
                    } catch {
                      Alert.alert('Download', 'Could not open invoice download.');
                    }
                  }}
                >
                  <Download size={14} color="#FFFFFF" />
                  <Text style={styles.actionBtnDownloadText}>PDF</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Rate Store */}
            {Boolean(
              (order.isOtpVerified || isDelivered) &&
                order.paymentStatus === 'SUCCESS' &&
                !isCancelled
            ) && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnAmber]}
                onPress={() => setSelectedReviewOrder(order)}
              >
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.actionBtnAmberText}>Rate Store</Text>
              </TouchableOpacity>
            )}

            {/* Cancel / Refund */}
            {!isCancelled && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnCancel]}
                onPress={() => {
                  setRefundError('');
                  setSelectedRefund({
                    orderId: order.orderId || order._id,
                    totalAmount,
                  });
                }}
              >
                <RotateCcw size={14} color={isDark ? '#FDBA74' : '#C2410C'} />
                <Text style={styles.actionBtnCancelText}>
                  {isDelivered
                    ? t('orders.returnRefund') || 'Return / Refund'
                    : t('orders.cancelOrder') || 'Cancel Order'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Items Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package size={16} color={CustomerColors.primary} />
              <Text style={styles.cardTitle}>
                Items in this Order ({order.items?.length || 0})
              </Text>
            </View>

            {(order.items || []).map((item: any, idx: number) => {
              const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
              return (
                <View
                  key={idx}
                  style={[
                    styles.itemRow,
                    idx < (order.items?.length || 0) - 1 && styles.itemRowBorder,
                  ]}
                >
                  <Image
                    source={{ uri: resolveImageUrl(item.image) }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    {Boolean(item.brand) && (
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    )}
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {translateProductName(item.title, language)}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {t('orders.qty') || 'Qty'}: {item.quantity} · ₹{Number(item.price).toLocaleString('en-IN')} each
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    ₹{itemTotal.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Pricing & Bill Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CreditCard size={16} color={CustomerColors.teal700} />
              <Text style={styles.cardTitle}>Bill Details & Payment</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Subtotal</Text>
              <Text style={styles.summaryValue}>₹{itemsSubtotal.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, (isPickup || deliveryFee === 0) && styles.freeText]}>
                {isPickup ? 'FREE (Store Pickup)' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
              </Text>
            </View>

            {platformFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform Fee</Text>
                <Text style={styles.summaryValue}>₹{platformFee.toLocaleString('en-IN')}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount Paid</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentInfoRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.paymentMethodValue}>
                {order.paymentMethod === 'razorpay'
                  ? 'Online (Razorpay)'
                  : order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : order.paymentMethod === 'credit'
                  ? 'Store Credit (Kadan)'
                  : order.paymentMethod === 'qr'
                  ? 'UPI / QR Pay'
                  : order.paymentMethod || 'Online'}
              </Text>
            </View>

            <View style={styles.paymentInfoRow}>
              <Text style={styles.summaryLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.paymentStatusValue,
                  {
                    color: order.paymentStatus === 'SUCCESS'
                      ? CustomerColors.success
                      : order.paymentMethod === 'cod' && order.codDetails?.status === 'collected'
                      ? CustomerColors.success
                      : CustomerColors.warning,
                  },
                ]}
              >
                {order.paymentMethod === 'cod'
                  ? order.codDetails?.status === 'collected' || order.paymentStatus === 'SUCCESS'
                    ? 'CASH COLLECTED'
                    : 'AWAITING CASH COLLECTION'
                  : order.paymentMethod === 'credit'
                  ? order.creditDetails?.debtRecorded
                    ? 'CREDIT DEBT CONFIRMED'
                    : 'CREDIT RESERVED'
                  : order.paymentStatus || 'PENDING'}
              </Text>
            </View>
            {order.paymentMethod === 'cod' && order.codDetails?.receiptNumber && (
              <View style={styles.paymentInfoRow}>
                <Text style={styles.summaryLabel}>Cash Receipt #</Text>
                <Text style={styles.paymentMethodValue}>{order.codDetails.receiptNumber}</Text>
              </View>
            )}
            {order.paymentMethod === 'credit' && order.creditDetails?.repaymentDueDate && (
              <View style={styles.paymentInfoRow}>
                <Text style={styles.summaryLabel}>Repayment Due Date</Text>
                <Text style={[styles.paymentMethodValue, { color: CustomerColors.teal700, fontWeight: '700' }]}>
                  {new Date(order.creditDetails.repaymentDueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Delivery & Address Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={16} color={CustomerColors.primary} />
              <Text style={styles.cardTitle}>
                {isPickup ? 'Pickup & Contact Details' : 'Shipping Address'}
              </Text>
            </View>

            <Text style={styles.recipientName}>
              {order.customerName ||
                [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
                  .filter(Boolean)
                  .join(' ') ||
                'Customer'}
            </Text>

            {(order.customerPhone || order.shippingAddress?.phone) && (
              <View style={styles.phoneRow}>
                <Phone size={13} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
                <Text style={styles.phoneText}>
                  {order.customerPhone || order.shippingAddress?.phone}
                </Text>
              </View>
            )}

            <Text style={styles.addressText}>
              {isPickup
                ? 'Store Counter Pickup. Present order ID upon arrival.'
                : order.deliveryAddress?.fullAddress ||
                  [
                    order.shippingAddress?.address,
                    order.shippingAddress?.apartment,
                    order.shippingAddress?.city,
                    order.shippingAddress?.state,
                    order.shippingAddress?.pinCode,
                  ]
                    .filter(Boolean)
                    .join(', ') ||
                  'No delivery address recorded'}
            </Text>
          </View>

          {/* Store Card */}
          {order.store && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Store size={16} color={CustomerColors.primary} />
                <Text style={styles.cardTitle}>Fulfilling Store</Text>
              </View>

              <Text style={styles.storeName}>
                {order.store.name || order.storeName || 'Partner Store'}
              </Text>
              {Boolean(order.store.address) && (
                <Text style={styles.storeAddress}>{order.store.address}</Text>
              )}
              {Boolean(order.store.phone) && (
                <View style={styles.phoneRow}>
                  <Phone size={13} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
                  <Text style={styles.phoneText}>{order.store.phone}</Text>
                </View>
              )}
            </View>
          )}

          {/* Trust Banner */}
          <View style={styles.trustBanner}>
            <ShieldCheck size={18} color="#0D9488" />
            <Text style={styles.trustText}>
              Verified Remise Order · Guaranteed Store Fulfillment
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Invoice Modal */}
      {Boolean(selectedInvoiceOrderId) && (
        <InvoiceModal
          visible={Boolean(selectedInvoiceOrderId)}
          orderId={selectedInvoiceOrderId!}
          onClose={() => setSelectedInvoiceOrderId(null)}
        />
      )}

      {/* Refund Modal */}
      {Boolean(selectedRefund) && (
        <RefundModal
          visible={Boolean(selectedRefund)}
          totalAmount={selectedRefund!.totalAmount}
          isSubmitting={isRefunding}
          error={refundError}
          onClose={() => {
            setSelectedRefund(null);
            setRefundError('');
          }}
          onSubmit={handleRefundSubmit}
        />
      )}

      {/* Store Review Modal */}
      {Boolean(selectedReviewOrder) && (
        <StoreReviewModal
          visible={Boolean(selectedReviewOrder)}
          orderId={selectedReviewOrder.orderId || selectedReviewOrder._id}
          storeId={selectedReviewOrder.store?.storeId || selectedReviewOrder.storeId}
          storeName={selectedReviewOrder.store?.name || selectedReviewOrder.storeName || 'Partner Store'}
          onClose={() => setSelectedReviewOrder(null)}
          onSuccess={() => {
            setSelectedReviewOrder(null);
            fetchOrderDetail(true);
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
      backgroundColor: isDark ? '#0B1329' : '#F9FAFB',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#E5E7EB',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    headerTitleWrap: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    headerSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontFamily: 'monospace',
      marginTop: 2,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    loadingText: {
      marginTop: Spacing.md,
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    errorTitle: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
      marginTop: Spacing.md,
    },
    errorSub: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    retryBtn: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.lg,
      backgroundColor: CustomerColors.primary,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.sm,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    noticeBanner: {
      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
      borderColor: '#10B981',
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    noticeText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#6EE7B7' : '#065F46',
      flex: 1,
    },
    noticeDismiss: {
      fontSize: FontSizes.xs,
      color: isDark ? '#A7F3D0' : '#047857',
      fontWeight: '800',
      marginLeft: Spacing.sm,
      textDecorationLine: 'underline',
    },
    statusCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#E5E7EB',
      padding: Spacing.md,
      ...Shadows.card,
    },
    statusCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: BorderRadius.pill,
      marginTop: 4,
    },
    statusTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    statusDesc: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.md,
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    dateText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    actionGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flexWrap: 'wrap',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing.md,
      paddingVertical: 9,
      borderRadius: BorderRadius.lg,
    },
    actionBtnPrimary: {
      backgroundColor: '#0D9488',
    },
    actionBtnPrimaryText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '800',
    },
    actionBtnSecondary: {
      backgroundColor: isDark ? 'rgba(15, 163, 177, 0.2)' : '#F0FDFA',
      borderColor: isDark ? '#0F766E' : '#CCFBF1',
      borderWidth: 1,
    },
    actionBtnSecondaryText: {
      color: isDark ? '#5EEAD4' : CustomerColors.teal700,
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    actionBtnDownload: {
      backgroundColor: CustomerColors.primary,
    },
    actionBtnDownloadText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    actionBtnAmber: {
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
      borderColor: isDark ? '#B45309' : '#FDE68A',
      borderWidth: 1,
    },
    actionBtnAmberText: {
      color: '#F59E0B',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    actionBtnCancel: {
      backgroundColor: isDark ? 'rgba(194, 65, 12, 0.15)' : '#FFF7ED',
      borderColor: isDark ? '#9A3412' : '#FFEDD5',
      borderWidth: 1,
    },
    actionBtnCancelText: {
      color: isDark ? '#FDBA74' : '#C2410C',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    card: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#E5E7EB',
      padding: Spacing.md,
      ...Shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
      paddingBottom: Spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    cardTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
    },
    itemRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    itemImage: {
      width: 54,
      height: 54,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    itemInfo: {
      flex: 1,
    },
    itemBrand: {
      fontSize: 10,
      fontWeight: '800',
      color: '#0D9488',
      textTransform: 'uppercase',
    },
    itemTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
      marginTop: 1,
    },
    itemMeta: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    itemTotal: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summaryLabel: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    summaryValue: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    freeText: {
      color: CustomerColors.success,
      fontWeight: '800',
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#1F2937' : '#E5E7EB',
      marginVertical: Spacing.xs,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    totalLabel: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    totalValue: {
      fontSize: FontSizes.md,
      fontWeight: '900',
      color: CustomerColors.primary,
    },
    paymentInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    paymentMethodValue: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#E5E7EB' : CustomerColors.black,
      textTransform: 'uppercase',
    },
    paymentStatusValue: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
    },
    recipientName: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
      marginTop: 2,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    phoneText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    addressText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#D1D5DB' : CustomerColors.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    storeName: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    storeAddress: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    trustBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      padding: Spacing.md,
      backgroundColor: isDark ? 'rgba(13, 148, 136, 0.1)' : '#F0FDFA',
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#115E59' : '#CCFBF1',
    },
    trustText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
  });
