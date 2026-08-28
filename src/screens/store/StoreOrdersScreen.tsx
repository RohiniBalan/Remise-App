import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Search, Store, Truck, QrCode, Wallet, ShoppingBag, AlertCircle, FileText, CreditCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { offersApi } from '../../api/offersApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

// Ported from client/app/store/dashboard/page.tsx's OrdersTab — same merge
// of OfferOrder + smart-order sources, same search + status filter, same
// delivery-method/payment-method chips for smart orders, same
// status-update-only-for-OfferOrder-sourced-orders restriction (smart
// orders show a read-only status badge — no status-change UI exists for
// that source on web either).
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

import DeliveryFlowModal from '../../components/store/DeliveryFlowModal';

export default function StoreOrdersScreen() {
  const navigation = useNavigation<any>();
  const { orders, loading, refresh } = useStoreDashboard();
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
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.teal700} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topActionBar}>
        <View style={styles.searchRow}>
          <Search size={14} color={CustomerColors.textSecondary} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search by customer or offer…" />
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
            <ShoppingBag size={40} color="#E5E7EB" />
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
              <Text style={styles.orderTitle} numberOfLines={1}>{o.offerTitle}</Text>
              {o.deliveryStatus ? (
                <View style={styles.deliveryBadge}>
                  <Text style={styles.deliveryBadgeText}>Delivery: {o.deliveryStatus}</Text>
                </View>
              ) : null}
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
                  {o.deliveryMethod === 'pickup' ? <Store size={10} color="#6B7280" /> : <Truck size={10} color="#6B7280" />}
                  <Text style={styles.metaChipText}>{o.deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home Delivery'}</Text>
                </View>
                <View style={styles.metaChip}>
                  {o.paymentMethod === 'razorpay' ? <CreditCard size={10} color="#6B7280" /> : o.paymentMethod === 'qr' ? <QrCode size={10} color="#6B7280" /> : <Wallet size={10} color="#6B7280" />}
                  <Text style={styles.metaChipText}>{o.paymentMethod === 'razorpay' ? 'Razorpay' : o.paymentMethod === 'qr' ? 'QR' : 'Cash'} · {o.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending'}</Text>
                </View>
                {o.vendorTransfers?.[0] ? (
                  <View style={[styles.metaChip, { backgroundColor: '#F0FDFA' }]}>
                    <Text style={[styles.metaChipText, { color: CustomerColors.teal700, fontWeight: '700' }]}>
                      Route: {o.vendorTransfers[0].transferStatus?.toUpperCase()} (Net ₹{o.vendorTransfers[0].vendorAmount})
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            <Text style={styles.orderDate}>
              {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.footerTop}>
                <Text style={styles.orderId}>#{o._id.slice(-6).toUpperCase()}</Text>
                {updating === o._id && <ActivityIndicator size="small" color={CustomerColors.teal700} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.orderAmount}>₹{o.totalAmount}</Text>

              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                {o.deliveryMethod !== 'pickup' &&
                  (o.deliveryMethod === 'delivery' || !!o.deliveryAddress) &&
                  o.status !== 'Delivered' &&
                  o.deliveryStatus !== 'Delivered' && (
                    <TouchableOpacity
                      style={styles.deliveryFlowBtn}
                      onPress={() => setSelectedDeliveryOrder(o)}
                    >
                      <Truck size={12} color={CustomerColors.teal700} />
                      <Text style={styles.deliveryFlowBtnText}>
                        {o.deliveryToken ? 'View Delivery Link' : 'Manage Delivery'}
                      </Text>
                    </TouchableOpacity>
                  )}

                {o._source === 'smartOrder' ? (
                  <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>{o.status}</Text></View>
                ) : (
                  <View style={styles.statusChipRow}>
                    {ORDER_STATUSES.map(s => (

                      <TouchableOpacity key={s} style={[styles.statusOption, o.status === s && styles.statusOptionActive]} onPress={() => handleStatus(o._id, s)} disabled={updating === o._id}>
                        <Text style={[styles.statusOptionText, o.status === s && styles.statusOptionTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  topActionBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.md },
  searchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },

  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  deliveryLogsNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CustomerColors.teal700, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md },
  deliveryLogsNavBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  filterChipActive: { backgroundColor: CustomerColors.mint, borderColor: CustomerColors.teal600 },
  filterChipText: { fontSize: 10, color: CustomerColors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: CustomerColors.teal700 },
  list: { padding: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  card: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  orderTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  orderCustomer: { fontSize: FontSizes.xs, color: '#4B5563', marginTop: 2 },
  orderAddress: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  chipRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.pill },
  metaChipText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  footerRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  orderAmount: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700, marginBottom: Spacing.xs },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  deliveryBadge: { backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  deliveryBadgeText: { fontSize: 9, fontWeight: '700', color: CustomerColors.teal700 },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  deliveryFlowBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
  deliveryFlowBtnText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: CustomerColors.mint, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.pill },
  statusBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal700 },
  statusChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statusOption: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  statusOptionActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  statusOptionText: { fontSize: 9, color: CustomerColors.textSecondary, fontWeight: '600' },
  statusOptionTextActive: { color: '#fff' },
  orderNotes: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  orderDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  footerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' },
  errorModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  errorModalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', gap: Spacing.xs },
  errorModalIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  errorModalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  errorModalMsg: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
  errorModalBtn: { width: '100%', backgroundColor: CustomerColors.black, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  errorModalBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
});

