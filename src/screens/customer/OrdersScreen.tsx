import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';

import {
  Search,
  PackageX,
  Star,
  FileText,
  Download,
  RotateCcw,
  MapPin,
} from 'lucide-react-native';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import { orderApi, OrderData } from '../../api/orderApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import InvoiceModal from '../../components/common/InvoiceModal';
import RefundModal from '../../components/common/RefundModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';
import { useTheme } from '../../context/ThemeContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

const STATUS_FILTERS = [
  'On the way',
  'Delivered',
  'Cancelled',
  'Returned',
] as const;

const currentYear = new Date().getFullYear();
const TIME_FILTERS = [
  'Last 30 days',
  String(currentYear),
  String(currentYear - 1),
  'Older',
] as const;

interface DisplayItem {
  key: string;
  orderId: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryStatus?: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  displayStatus: string;
  orderDate: string;
  deliveryDate: string;
  createdAt: string;
  totalAmount: number;
  refundWindowEndAt?: string;
}

function getStatusUI(
  status: string,
  orderDate: string,
  deliveryDate: string,
  deliveryStatus?: string,
) {
  if (
    status === 'REFUNDED' ||
    status === 'Refund Processing' ||
    status === 'Cancelled' ||
    deliveryStatus === 'Cancelled'
  )
    return {
      color: '#D97706',
      text: `Cancelled · Refund Processing`,
      subText:
        'Razorpay is processing the refund to your original payment method (5-7 business days).',
    };
  if (status === 'Delivered' || deliveryStatus === 'Delivered')
    return {
      color: CustomerColors.success,
      text: `Delivered on ${deliveryDate}`,
      subText: 'Your item has been delivered.',
    };
  if (status === 'Cancelled' || deliveryStatus === 'Cancelled')
    return {
      color: CustomerColors.danger,
      text: `Cancelled on ${orderDate}`,
      subText: 'Your order was cancelled.',
    };
  if (deliveryStatus === 'Out for Delivery')
    return {
      color: '#7C3AED',
      text: 'Out for Delivery',
      subText: 'Delivery partner is on the way to your location.',
    };
  if (deliveryStatus === 'Picked Up')
    return {
      color: '#2563EB',
      text: 'Picked Up from Store',
      subText: 'Item collected, arriving soon.',
    };
  if (deliveryStatus === 'Arrived at Store')
    return {
      color: '#4F46E5',
      text: 'Partner at Store',
      subText: 'Delivery partner is at the store collecting your items.',
    };
  if (deliveryStatus === 'Going to Store')
    return {
      color: CustomerColors.teal700,
      text: 'Partner Heading to Store',
      subText: 'Delivery partner is heading to the store for pickup.',
    };
  if (deliveryStatus === 'Accepted' || deliveryStatus === 'Assigned')
    return {
      color: CustomerColors.teal700,
      text: 'Delivery Partner Assigned',
      subText: 'A delivery partner is preparing your order pickup.',
    };
  if (deliveryStatus === 'Searching')
    return {
      color: '#4F46E5',
      text: 'Finding Delivery Partner',
      subText: 'Locating a nearby Remise delivery partner for your order.',
    };
  if (status === 'Shipped')
    return {
      color: '#3B82F6',
      text: `Shipped, arriving by ${deliveryDate}`,
      subText: 'Your item is on the way.',
    };
  return {
    color: CustomerColors.warning,
    text: `Processing, expected by ${deliveryDate}`,
    subText: 'Your order is currently being packed.',
  };
}

export default function OrdersScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [timeFilters, setTimeFilters] = useState<string[]>([]);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<
    string | null
  >(null);
  const [selectedRefund, setSelectedRefund] = useState<{
    orderId: string;
    totalAmount: number;
  } | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      Promise.allSettled([
        orderApi.getMyOrders(user._id, user.email),
        smartOrderApi.getMyOrders(user._id, user.email),
      ])
        .then(([legacyRes, smartRes]) => {
          const legacyOrders =
            legacyRes.status === 'fulfilled' && legacyRes.value.data.success
              ? legacyRes.value.data.data
              : [];
          const smartOrders =
            smartRes.status === 'fulfilled' && smartRes.value.data.success
              ? smartRes.value.data.data
              : [];

          // Deduplicate orders by orderId / _id
          const seenOrderIds = new Set<string>();
          const uniqueOrders = [...legacyOrders, ...smartOrders].filter(
            order => {
              const id = order.orderId || order._id || (order as any).id;
              if (!id) return true;
              if (seenOrderIds.has(id)) return false;
              seenOrderIds.add(id);
              return true;
            },
          );

          const merged = uniqueOrders.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setOrders(merged);

          if (legacyRes.status === 'rejected')
            console.warn(
              '[Orders] legacy load failed:',
              legacyRes.reason?.response?.status,
              legacyRes.reason?.message,
            );
          if (smartRes.status === 'rejected')
            console.warn(
              '[Orders] smart-order load failed:',
              smartRes.reason?.response?.status,
              smartRes.reason?.message,
            );
          if (
            legacyRes.status === 'rejected' &&
            smartRes.status === 'rejected'
          ) {
            setLoadError(
              'Could not load your orders. Check your connection and try again.',
            );
          }
        })
        .finally(() => setLoading(false));
    }, [user]),
  );

  const handleRefund = async (amount: number, note: string) => {
    if (!selectedRefund) return;
    setIsRefunding(true);
    setRefundError('');
    try {
      const response = await smartOrderApi.createRefund({
        orderId: selectedRefund.orderId,
        refundAmount: amount,
        refundNote: note,
      });
      if (!response.data?.success)
        throw new Error(
          response.data?.message || 'Refund could not be initiated.',
        );
      setOrders(prev =>
        prev.map(order =>
          (order.orderId || order._id) === selectedRefund.orderId
            ? { ...order, paymentStatus: 'REFUNDED', orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' }
            : order,
        ),
      );
      setSelectedRefund(null);
      Alert.alert(
        'Refund Initiated',
        `₹${amount.toLocaleString()} is currently processing via Razorpay. It usually reaches the original payment method within 5-7 business days.`,
      );
    } catch (error: any) {
      setRefundError(
        error?.response?.data?.message ||
          error?.message ||
          'Refund could not be initiated.',
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const displayItems: DisplayItem[] = useMemo(() => {
    const list: DisplayItem[] = [];
    orders.forEach((order, orderIdx) => {
      const orderDateObj = new Date(order.createdAt || Date.now());
      const deliveryDateObj = new Date(orderDateObj);
      deliveryDateObj.setDate(deliveryDateObj.getDate() + 5);
      const fmt = (d: Date) =>
        isNaN(d.getTime())
          ? ''
          : d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
      const orderDate = fmt(orderDateObj);
      const deliveryDate = fmt(deliveryDateObj);
      const items = order.items || [];

      if (items.length === 0) {
        list.push({
          key: `${order._id || orderIdx}`,
          orderId: order._id || '',
          paymentStatus: order.paymentStatus || 'PENDING',
          paymentMethod: order.paymentMethod,
          deliveryStatus: (order as any).deliveryStatus,
          title: `Order #${(order._id || '').slice(-6).toUpperCase()}`,
          price: order.totalAmount,
          quantity: 1,
          image: '',
          displayStatus: (order as any).status || 'Processing',
          orderDate,
          deliveryDate,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          refundWindowEndAt: (order as any).refundWindowEndAt,
        });
      } else {
        items.forEach((it, idx) => {
          list.push({
            key: `${order._id || orderIdx}-${idx}`,
            orderId: order._id || '',
            paymentStatus: order.paymentStatus || 'PENDING',
            paymentMethod: order.paymentMethod,
            deliveryStatus: (order as any).deliveryStatus,
            title: (it as any).name || it.title || 'Product',
            price: it.price,
            quantity: it.quantity,
            image: it.image || (it as any).imageUrl || '',
            displayStatus: (order as any).status || 'Processing',
            orderDate,
            deliveryDate,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            refundWindowEndAt: (order as any).refundWindowEndAt,
          });
        });
      }
    });
    return list;
  }, [orders]);

  const toggleStatus = (filter: string) =>
    setStatusFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter],
    );

  const toggleTime = (filter: string) =>
    setTimeFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter],
    );

  const clearAllFilters = () => {
    setStatusFilters([]);
    setTimeFilters([]);
    setSearchQuery('');
  };

  const filteredItems = displayItems.filter(item => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilters.length > 0) {
      matchesStatus = statusFilters.some(filter => {
        const isCancelled =
          item.displayStatus === 'Cancelled' ||
          item.displayStatus === 'Refund Processing' ||
          item.deliveryStatus === 'Cancelled';
        const isDelivered =
          item.displayStatus === 'Delivered' ||
          item.deliveryStatus === 'Delivered';
        const isReturned =
          item.displayStatus === 'Returned' ||
          item.displayStatus === 'Refund Processing' ||
          item.paymentStatus === 'REFUNDED';

        if (filter === 'Cancelled') return isCancelled;
        if (filter === 'Delivered') return isDelivered;
        if (filter === 'Returned') return isReturned;
        if (filter === 'On the way')
          return (
            !isCancelled &&
            !isDelivered &&
            !isReturned &&
            (item.displayStatus === 'Shipped' ||
              item.displayStatus === 'Processing' ||
              [
                'Pending',
                'Assigned',
                'Accepted',
                'Picked Up',
                'Out for Delivery',
              ].includes(item.deliveryStatus || ''))
          );
        return false;
      });
    }

    let matchesTime = true;
    if (timeFilters.length > 0) {
      const orderDate = new Date(item.createdAt);
      const orderTimestamp = orderDate.getTime();
      const now = Date.now();
      const orderYear = orderDate.getFullYear();

      matchesTime = timeFilters.some(filter => {
        if (filter === 'Last 30 days') {
          return now - orderTimestamp <= 30 * 24 * 60 * 60 * 1000;
        }
        if (filter === 'Older') {
          return orderYear < currentYear - 1;
        }
        return String(orderYear) === filter;
      });
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
      <BrandHeader />
      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      <View style={[styles.searchRow, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderColor: isDark ? '#1F2937' : CustomerColors.border }]}>
        <Search size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#FFFFFF' : CustomerColors.black }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by product name or order ID"
          placeholderTextColor={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isDark ? '#111827' : CustomerColors.white,
                  borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                },
                statusFilters.includes(f) && styles.filterChipActive,
              ]}
              onPress={() => toggleStatus(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary },
                  statusFilters.includes(f) && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          {TIME_FILTERS.map(t => (
            <TouchableOpacity
              key={t}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isDark ? '#111827' : CustomerColors.white,
                  borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                },
                timeFilters.includes(t) && styles.filterChipActive,
              ]}
              onPress={() => toggleTime(t)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary },
                  timeFilters.includes(t) && styles.filterChipTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
          {(statusFilters.length > 0 ||
            timeFilters.length > 0 ||
            searchQuery.trim() !== '') && (
            <TouchableOpacity
              style={styles.clearChip}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearChipText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <PackageX size={56} color={isDark ? '#4B5563' : '#D1D5DB'} />
            <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Orders Found</Text>
            <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
              {searchQuery ||
              statusFilters.length > 0 ||
              timeFilters.length > 0
                ? "We couldn't find any orders matching your search or filters."
                : "Looks like you haven't placed any orders yet."}
            </Text>
            {statusFilters.length > 0 ||
            timeFilters.length > 0 ||
            searchQuery.trim() !== '' ? (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const statusUI = getStatusUI(
            item.displayStatus,
            item.orderDate,
            item.deliveryDate,
            item.deliveryStatus,
          );

          return (
            <View style={[styles.orderCard, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
              <Image source={{ uri: resolveImageUrl(item.image) }} style={[styles.orderImage, isDark && { backgroundColor: '#1F2937' }]} />
              <View style={styles.orderInfo}>
                <Text style={[styles.orderTitle, isDark && { color: '#F9FAFB' }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.orderQty, isDark && { color: '#9CA3AF' }]}>
                  Qty: {item.quantity} · ₹{item.price.toLocaleString()}
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusUI.color },
                    ]}
                  />
                  <Text style={[styles.statusText, isDark && { color: '#F9FAFB' }]}>{statusUI.text}</Text>
                </View>
                <Text style={[styles.statusSub, isDark && { color: '#9CA3AF' }]}>{statusUI.subText}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.trackBtn, isDark && { backgroundColor: '#1E3A8A', borderColor: '#2563EB' }]}
                    onPress={() => navigation.navigate('OrderTracking', { orderId: item.orderId })}
                  >
                    <MapPin size={11} color={isDark ? '#93C5FD' : '#2563EB'} />
                    <Text style={[styles.trackBtnText, isDark && { color: '#93C5FD' }]}>Track</Text>
                  </TouchableOpacity>

                  {(item.paymentStatus === 'SUCCESS' ||
                    item.paymentMethod === 'cod' ||
                    item.paymentMethod === 'cash') && (
                    <View style={styles.invoiceRow}>
                      <TouchableOpacity
                        style={[styles.invoiceBtn, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)', borderColor: '#0f766e' }]}
                        onPress={() => setSelectedInvoiceOrderId(item.orderId)}
                      >
                        <FileText size={12} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
                        <Text style={[styles.invoiceBtnText, isDark && { color: '#5EEAD4' }]}>View Bill</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pdfBtn}
                        onPress={async () => {
                          const url = smartOrderApi.getInvoicePdfUrl(
                            item.orderId,
                          );
                          try {
                            await Linking.openURL(url);
                          } catch {
                            Alert.alert(
                              'Download',
                              'Could not open invoice download.',
                            );
                          }
                        }}
                      >
                        <Download size={11} color="#FFFFFF" />
                        <Text style={styles.pdfBtnText}>PDF</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {item.paymentStatus === 'SUCCESS' &&
                    item.paymentMethod?.toLowerCase() === 'razorpay' && (
                      <>
                        {(!item.refundWindowEndAt || new Date() < new Date(item.refundWindowEndAt)) ? (
                          <TouchableOpacity
                            style={[styles.refundBtn, isDark && { backgroundColor: 'rgba(194, 65, 12, 0.2)', borderColor: '#C2410C' }]}
                            onPress={() => {
                              setRefundError('');
                              setSelectedRefund({
                                orderId: item.orderId,
                                totalAmount: item.totalAmount,
                              });
                            }}
                          >
                            <RotateCcw size={13} color={isDark ? '#FDBA74' : '#C2410C'} />
                            <Text style={[styles.refundBtnText, isDark && { color: '#FDBA74' }]}>
                              {item.displayStatus === 'Delivered' || item.deliveryStatus === 'Delivered'
                                ? 'Return & Refund'
                                : 'Cancel Order'}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </>
                    )}

                  {item.displayStatus === 'Delivered' && (
                    <TouchableOpacity style={styles.reviewBtn}>
                      <Star
                        size={14}
                        color={CustomerColors.teal700}
                        fill={CustomerColors.teal700}
                      />
                      <Text style={[styles.reviewBtnText, isDark && { color: '#5EEAD4' }]}>
                        Rate & Review Product
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {selectedInvoiceOrderId ? (
        <InvoiceModal
          orderId={selectedInvoiceOrderId}
          visible={!!selectedInvoiceOrderId}
          onClose={() => setSelectedInvoiceOrderId(null)}
        />
      ) : null}
      {selectedRefund ? (
        <RefundModal
          visible={!!selectedRefund}
          totalAmount={selectedRefund.totalAmount}
          isSubmitting={isRefunding}
          error={refundError}
          onClose={() => {
            if (!isRefunding) setSelectedRefund(null);
          }}
          onSubmit={handleRefund}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F6' },
  errorBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: { fontSize: FontSizes.xs, color: '#92400E' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F6',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  filterContainer: {
    marginTop: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
  },
  filterChipActive: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: { color: CustomerColors.white },
  clearChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  clearChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.danger,
    fontWeight: '700',
  },
  clearBtn: {
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  list: { padding: Spacing.md },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  orderCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  orderImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F9F9F9',
  },
  orderInfo: { flex: 1, gap: 4 },
  orderTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: '#1F2937' },
  orderQty: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#1F2937' },
  statusSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  reviewBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  invoiceBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  pdfBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  refundBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  trackBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});
