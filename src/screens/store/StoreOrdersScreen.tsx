import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Search, Store, Truck, ShoppingBag, AlertCircle, FileText, CreditCard, RotateCcw } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { offersApi } from '../../api/offersApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';
import DeliveryFlowModal from '../../components/store/DeliveryFlowModal';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function StoreOrdersScreen() {
  const navigation = useNavigation<any>();
  const { orders, loading, refresh, markOrdersAsSeen } = useStoreDashboard();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  useFocusEffect(
    useCallback(() => {
      markOrdersAsSeen?.();
    }, [markOrdersAsSeen])
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<any>(null);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const [errorModal, setErrorModal] = useState<string | null>(null);

  const counts: Record<string, number> = { all: orders.length };
  ORDER_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.offerTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await offersApi.updateOrderStatus(orderId, status);
      refresh();
    } catch {
      setErrorModal('Failed to update order status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topActionBar}>
        <View style={styles.searchRow}>
          <Search size={14} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by customer or offer…"
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          />
        </View>
        <TouchableOpacity
          style={styles.deliveryLogsNavBtn}
          onPress={() => navigation.navigate('StoreDeliveries')}
        >
          <Truck size={14} color="#FFFFFF" />
          <Text style={styles.deliveryLogsNavBtnText}>Deliveries Log</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['all', ...ORDER_STATUSES].map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterChipText, filter === s && styles.filterChipTextActive]}>
              {s === 'all' ? `All (${counts.all})` : `${s} (${counts[s] || 0})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={paginatedOrders}
        keyExtractor={o => o._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingBag size={40} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>No orders found</Text>
          </View>
        }
        ListFooterComponent={
          <PaginationControl
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        }
        renderItem={({ item: o }) => (
          <View style={styles.card}>
            <View style={styles.orderHeaderRow}>
              <Text style={styles.orderTitle} numberOfLines={1}>{o.offerTitle || o.productName || o.customerName || 'Order'}</Text>
              <View style={styles.badgeGroup}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{o.status}</Text>
                </View>
                {o.deliveryStatus ? (
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryBadgeText}>Delivery: {o.deliveryStatus}</Text>
                  </View>
                ) : null}
                {o.refundStatus && o.refundStatus !== 'none' ? (
                  <View style={[
                    styles.refundBadge,
                    (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundBadgeCompleted : styles.refundBadgePending
                  ]}>
                    <RotateCcw size={10} color={(o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? '#9333EA' : '#D97706'} />
                    <Text style={[
                      styles.refundBadgeText,
                      (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundBadgeTextCompleted : styles.refundBadgeTextPending
                    ]}>
                      {o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED'
                        ? `Refunded: ₹${o.totalRefundedAmount || o.totalAmount}`
                        : o.refundStatus === 'partially_refunded'
                        ? `Partially Refunded: ₹${o.totalRefundedAmount}`
                        : o.refundStatus === 'requested'
                        ? 'Refund Requested'
                        : o.refundStatus === 'processing'
                        ? 'Refund Processing'
                        : `Refund: ${o.refundStatus}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.orderCustomer}>
              {o.customerName}
              {o.customerPhone ? ` · ${o.customerPhone}` : ''}
              {(o.customerId || o.userId || o.userID) ? ` · Customer ID: ${o.customerId || o.userId || o.userID}` : ''}
            </Text>
            <Text style={styles.orderAddress} numberOfLines={1}>{o.deliveryAddress}</Text>
            {o.notes ? <Text style={styles.orderNotes}>"{o.notes}"</Text> : null}
            {o._source === 'smartOrder' && o.deliveryMethod && (
              <View style={styles.chipRow}>
                <View style={styles.metaChip}>
                  {o.deliveryMethod === 'pickup' ? <Store size={10} color={isDark ? '#9CA3AF' : '#6B7280'} /> : <Truck size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />}
                  <Text style={styles.metaChipText}>{o.deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home Delivery'}</Text>
                </View>
                <View style={[styles.metaChip, (o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded') && { backgroundColor: isDark ? '#3b0764' : '#FAF5FF', borderColor: '#E9D5FF' }]}>
                  <CreditCard size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.metaChipText, (o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded') && { color: '#9333EA', fontWeight: '700' }]}>
                    {o.paymentMethod === 'razorpay' ? 'Razorpay' : o.paymentMethod === 'qr' ? 'QR' : o.paymentMethod === 'cod' ? 'Cash' : (o.paymentMethod || 'Online')} · {
                      o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded'
                        ? 'Refunded'
                        : o.refundStatus === 'requested'
                        ? 'Refund Requested'
                        : o.paymentStatus === 'SUCCESS'
                        ? 'Paid'
                        : 'Pending'
                    }
                  </Text>
                </View>
                {o.vendorTransfers?.[0] ? (
                  <View style={[styles.metaChip, { backgroundColor: isDark ? '#134e4a' : '#F0FDFA' }]}>
                    <Text style={[styles.metaChipText, { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700' }]}>
                      Route: {o.vendorTransfers[0].transferStatus?.toUpperCase()} (Net ₹{o.vendorTransfers[0].vendorAmount})
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {o.refundStatus && o.refundStatus !== 'none' ? (
              <View style={[
                styles.refundNoticeBox,
                (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundNoticeBoxCompleted : styles.refundNoticeBoxPending
              ]}>
                <RotateCcw size={13} color={(o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? '#9333EA' : '#D97706'} />
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.refundNoticeTitle,
                    (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundNoticeTitleCompleted : styles.refundNoticeTitlePending
                  ]}>
                    {o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED'
                      ? `Refund Completed (₹${o.totalRefundedAmount || o.totalAmount})`
                      : o.refundStatus === 'partially_refunded'
                      ? `Partially Refunded (₹${o.totalRefundedAmount})`
                      : o.refundStatus === 'requested'
                      ? 'Customer Requested a Refund'
                      : o.refundStatus === 'processing'
                      ? 'Refund Processing via Gateway'
                      : `Refund Status: ${o.refundStatus}`}
                  </Text>
                  {o.refunds?.[0]?.reason ? (
                    <Text style={styles.refundNoticeReason}>Reason: "{o.refunds[0].reason}"</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Text style={styles.orderDate}>
              {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.footerTop}>
                <Text style={styles.orderId}>#{o._id.slice(-6).toUpperCase()}</Text>
                {updating === o._id && <ActivityIndicator size="small" color={isDark ? '#2DD4BF' : CustomerColors.teal700} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.orderAmount}>₹{o.totalAmount}</Text>

              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                {o.deliveryMethod !== 'pickup' &&
                  (o.deliveryMethod === 'delivery' || !!o.deliveryAddress) && (
                    <TouchableOpacity
                      style={styles.trackOrderBtn}
                      onPress={() => navigation.navigate('StoreOrderTracking', { orderId: o.orderId || o._id })}
                    >
                      <Truck size={12} color="#2563EB" />
                      <Text style={styles.trackOrderBtnText}>Live Track</Text>
                    </TouchableOpacity>
                  )}

                {o.deliveryMethod !== 'pickup' &&
                  (o.deliveryMethod === 'delivery' || !!o.deliveryAddress) &&
                  o.status !== 'Delivered' &&
                  o.deliveryStatus !== 'Delivered' && (
                    <TouchableOpacity
                      style={styles.deliveryFlowBtn}
                      onPress={() => setSelectedDeliveryOrder(o)}
                    >
                      <Truck size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                      <Text style={styles.deliveryFlowBtnText}>
                        {o.deliveryToken ? 'View Delivery Link' : 'Manage Delivery'}
                      </Text>
                    </TouchableOpacity>
                  )}

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{o.status}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {selectedDeliveryOrder && (
        <DeliveryFlowModal
          order={selectedDeliveryOrder}
          visible={!!selectedDeliveryOrder}
          onClose={() => setSelectedDeliveryOrder(null)}
          onRefresh={refresh}
        />
      )}

      {/* Custom Error Modal */}
      {errorModal ? (
        <Modal visible={!!errorModal} transparent animationType="fade" onRequestClose={() => setErrorModal(null)}>
          <View style={styles.errorModalBackdrop}>
            <View style={styles.errorModalCard}>
              <View style={styles.errorModalIconWrap}>
                <AlertCircle size={28} color="#DC2626" />
              </View>
              <Text style={styles.errorModalTitle}>Notification</Text>
              <Text style={styles.errorModalMsg}>{errorModal}</Text>
              <TouchableOpacity style={styles.errorModalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.errorModalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    topActionBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.md },
    searchRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
    deliveryLogsNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CustomerColors.teal700, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md },
    deliveryLogsNavBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
    filterChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.pill,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    filterChipActive: { backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, borderColor: isDark ? '#2DD4BF' : CustomerColors.teal600 },
    filterChipText: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
    filterChipTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    list: { padding: Spacing.md },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: isDark ? '#9CA3AF' : '#374151' },
    card: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    orderTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, flex: 1 },
    orderCustomer: { fontSize: FontSizes.xs, color: isDark ? '#D1D5DB' : '#4B5563', marginTop: 2 },
    orderAddress: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
    chipRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.pill,
    },
    metaChipText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' },
    footerRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
    orderAmount: { fontSize: FontSizes.md, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, marginBottom: Spacing.xs },
    orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
    deliveryBadge: { backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, borderWidth: 1, borderColor: isDark ? '#115e59' : CustomerColors.steelBorder, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
    deliveryBadgeText: { fontSize: 9, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    refundBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
    refundBadgePending: { backgroundColor: isDark ? '#451a03' : '#FEF3C7', borderColor: isDark ? '#78350f' : '#FDE68A' },
    refundBadgeCompleted: { backgroundColor: isDark ? '#3b0764' : '#F3E8FF', borderColor: isDark ? '#6b21a8' : '#E9D5FF' },
    refundBadgeText: { fontSize: 9, fontWeight: '700' },
    refundBadgeTextPending: { color: isDark ? '#FBBF24' : '#D97706' },
    refundBadgeTextCompleted: { color: isDark ? '#C084FC' : '#9333EA' },
    refundNoticeBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 8, borderRadius: BorderRadius.sm, borderWidth: 1, marginTop: 8 },
    refundNoticeBoxPending: { backgroundColor: isDark ? '#451a03' : '#FFFBEB', borderColor: isDark ? '#78350f' : '#FDE68A' },
    refundNoticeBoxCompleted: { backgroundColor: isDark ? '#3b0764' : '#FAF5FF', borderColor: isDark ? '#6b21a8' : '#F3E8FF' },
    refundNoticeTitle: { fontSize: 11, fontWeight: '700' },
    refundNoticeTitlePending: { color: isDark ? '#FBBF24' : '#B45309' },
    refundNoticeTitleCompleted: { color: isDark ? '#C084FC' : '#7E22CE' },
    refundNoticeReason: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 },
    actionButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    trackOrderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? '#3b82f6' : '#BFDBFE',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    trackOrderBtnText: { fontSize: 10, fontWeight: '700', color: isDark ? '#93C5FD' : '#1D4ED8' },
    deliveryFlowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : CustomerColors.steelBorder,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    deliveryFlowBtnText: { fontSize: 10, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    statusBadge: { alignSelf: 'flex-start', backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.pill },
    statusBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    orderNotes: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontStyle: 'italic', marginTop: 2 },
    orderDate: { fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 4 },
    footerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    orderId: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', fontFamily: 'monospace' },
    errorModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
    errorModalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: isDark ? '#111827' : '#fff',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      gap: Spacing.xs,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1F2937' : 'transparent',
    },
    errorModalIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: isDark ? '#450a0a' : '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    errorModalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
    errorModalMsg: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
    errorModalBtn: { width: '100%', backgroundColor: CustomerColors.primary, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
    errorModalBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  });

