import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native';
import { ShoppingBag, RefreshCw, Truck, ChevronDown, X, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { sellerOrderApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';
import { useTheme } from '../../context/ThemeContext';

const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
const DELIVERY_STATUSES = ['Pending', 'Assigned', 'Accepted', 'Ready', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

const STATUS_STYLE: Record<string, { bg: string; fg: string; darkBg: string; darkFg: string }> = {
  Processing: { bg: '#FFFBEB', fg: '#B45309', darkBg: 'rgba(217, 119, 6, 0.15)', darkFg: '#FBBF24' },
  Shipped: { bg: '#EFF6FF', fg: '#1D4ED8', darkBg: 'rgba(37, 99, 235, 0.15)', darkFg: '#60A5FA' },
  Delivered: { bg: '#F0FDF4', fg: '#15803D', darkBg: 'rgba(22, 163, 74, 0.15)', darkFg: '#4ADE80' },
  Cancelled: { bg: '#FEF2F2', fg: '#FF0000', darkBg: 'rgba(239, 68, 68, 0.15)', darkFg: '#F87171' },
};

export default function SellerOrdersScreen() {
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { orders, refresh, loading, markOrdersAsSeen } = useSellerDashboard();
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<any | null>(null);

  const ITEMS_PER_PAGE = 30;

  // Mark all orders as seen whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      markOrdersAsSeen();
    }, [markOrdersAsSeen])
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const counts: Record<string, number> = { all: orders.length };
  ORDER_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.orderStatus === s).length; });
  const filtered = useMemo(() => orders.filter(o => filter === 'all' || o.orderStatus === filter), [orders, filter]);

  const paginatedOrders = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await sellerOrderApi.updateOrderStatus(id, status);
      await refresh();
    } catch {
      Alert.alert('Failed', 'Could not update order status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeliveryStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    setDeliveryModalOrder(null);
    try {
      await sellerOrderApi.updateDeliveryStatus(orderId, status);
      await refresh();
    } catch {
      Alert.alert('Failed', 'Could not update delivery status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['all', ...ORDER_STATUSES] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && styles.filterChipActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.filterChipText, filter === s && styles.filterChipTextActive]}>
              {s === 'all' ? 'All' : s} ({counts[s] || 0})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={paginatedOrders}
        keyExtractor={o => o._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <ShoppingBag size={36} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Orders placed by store owners will show up here.</Text>
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
        renderItem={({ item: o }) => {
          const st = STATUS_STYLE[o.orderStatus] || { bg: '#F3F4F6', fg: '#4B5563', darkBg: '#1F2937', darkFg: '#9CA3AF' };
          const badgeBg = isDark ? st.darkBg : st.bg;
          const badgeFg = isDark ? st.darkFg : st.fg;
          const currentDeliveryStatus = o.deliveryStatus || (o.orderStatus === 'Delivered' ? 'Delivered' : 'Pending');
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>
                      {(o as any).shippingAddress?.fullName || 'Store Buyer'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeFg }]}>{o.orderStatus}</Text>
                    </View>
                    <View style={[styles.deliveryBadge]}>
                      <Truck size={10} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                      <Text style={styles.deliveryBadgeText}>{currentDeliveryStatus}</Text>
                    </View>
                  </View>
                  <Text style={styles.email}>{(o as any).user?.email || (o as any).shippingAddress?.phone}</Text>
                  {o.items?.map((it: any, i: number) => (
                    <Text key={i} style={styles.itemLine}>
                      {it.quantity}× {it.title} {it.tierLabel ? `(${it.tierLabel})` : ''} — ₹{it.price}/unit
                    </Text>
                  ))}
                  {o.vendorTransfers?.[0] ? (
                    <View style={styles.settlementBox}>
                      <Text style={styles.settlementText}>
                        Settlement: <Text style={{ fontWeight: '800', color: CustomerColors.teal700 }}>₹{o.vendorTransfers[0].vendorAmount}</Text>
                        <Text style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}> (Gross ₹{o.vendorTransfers[0].grossAmount} − Fee ₹{o.vendorTransfers[0].commissionAmount})</Text>
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.date}>
                    {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.amount}>₹{o.totalAmount?.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.orderShortId}>#{o._id.slice(-6).toUpperCase()}</Text>
                
                <View style={styles.actionsContainer}>
                  {/* Delivery Status Dropdown / Trigger */}
                  <TouchableOpacity
                    style={styles.deliveryPickerBtn}
                    onPress={() => setDeliveryModalOrder(o)}
                    disabled={updating === o._id}
                  >
                    <Truck size={11} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.deliveryPickerBtnText}>{currentDeliveryStatus}</Text>
                    <ChevronDown size={11} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  {/* Order Status Options */}
                  <View style={styles.statusPicker}>
                    {ORDER_STATUSES.map(s => (
                      <TouchableOpacity
                        key={s}
                        disabled={updating === o._id}
                        onPress={() => handleStatus(o._id, s)}
                        style={[styles.statusOption, o.orderStatus === s && { backgroundColor: CustomerColors.teal600 }]}
                      >
                        <Text style={[styles.statusOptionText, o.orderStatus === s && { color: '#fff' }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {updating === o._id && <ActivityIndicator size="small" color={CustomerColors.teal600} />}
              </View>
            </View>
          );
        }}
      />

      {/* Delivery Status Picker Modal */}
      {deliveryModalOrder && (
        <Modal
          visible={!!deliveryModalOrder}
          transparent
          animationType="slide"
          onRequestClose={() => setDeliveryModalOrder(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDeliveryModalOrder(null)}
          >
            <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Truck size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={styles.modalTitle}>Update Delivery Status</Text>
                </View>
                <TouchableOpacity onPress={() => setDeliveryModalOrder(null)}>
                  <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={DELIVERY_STATUSES}
                keyExtractor={item => item}
                renderItem={({ item }) => {
                  const currentSt = deliveryModalOrder.deliveryStatus || (deliveryModalOrder.orderStatus === 'Delivered' ? 'Delivered' : 'Pending');
                  const isSelected = currentSt === item;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, isSelected && styles.modalItemActive]}
                      onPress={() => handleDeliveryStatus(deliveryModalOrder.orderId || deliveryModalOrder._id, item)}
                    >
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                        {item}
                      </Text>
                      {isSelected && <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: isDark ? '#111827' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
  },
  filterChipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  filterChipText: { fontSize: 11, fontWeight: '700', color: isDark ? '#9CA3AF' : '#4B5563' },
  filterChipTextActive: { color: '#fff' },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 6 },
  emptyTitle: { fontWeight: '700', fontSize: FontSizes.md, color: isDark ? '#FFFFFF' : '#374151' },
  emptySub: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : '#9CA3AF', textAlign: 'center' },
  card: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.md,
  },
  cardTop: { flexDirection: 'row', gap: Spacing.sm },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  orderId: { fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black, fontSize: FontSizes.sm },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: isDark ? 'rgba(45,212,191,0.15)' : '#F0FDFA', borderWidth: 1, borderColor: isDark ? '#115E59' : '#CCFBF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  deliveryBadgeText: { fontSize: 9, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  email: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 },
  itemLine: { fontSize: 11, color: isDark ? '#D1D5DB' : '#6B7280', marginTop: 2 },
  date: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 4 },
  amount: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#1F2937' : '#F5F5F5',
    flexWrap: 'wrap',
  },
  orderShortId: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  deliveryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  deliveryPickerBtnText: { fontSize: 10, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  statusPicker: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  statusOption: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: isDark ? '#1F2937' : '#F5F5F5' },
  statusOptionText: { fontSize: 10, fontWeight: '700', color: isDark ? '#9CA3AF' : '#4B5563' },
  settlementBox: {
    backgroundColor: isDark ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? '#115E59' : '#CCFBF1',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  settlementText: { fontSize: 10, color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: isDark ? '#111827' : '#fff', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '75%', paddingBottom: Spacing.xl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F1F5F9' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F8FAFC' },
  modalItemActive: { backgroundColor: isDark ? 'rgba(45,212,191,0.1)' : '#F0FDFA' },
  modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItemTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '800' },
});
