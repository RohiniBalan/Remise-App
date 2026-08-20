import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { ShoppingBag, RefreshCw } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { sellerOrderApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  Processing: { bg: '#FFFBEB', fg: '#B45309' },
  Shipped: { bg: '#EFF6FF', fg: '#1D4ED8' },
  Delivered: { bg: '#F0FDF4', fg: '#15803D' },
  Cancelled: { bg: '#FEF2F2', fg: '#FF0000' },
};

export default function SellerOrdersScreen() {
  const { orders, refresh, loading } = useSellerDashboard();
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 30;

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
            <ShoppingBag size={36} color="#E5E7EB" />
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

          const st = STATUS_STYLE[o.orderStatus] || { bg: '#F3F4F6', fg: '#4B5563' };
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>{o.orderId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: st.fg }]}>{o.orderStatus}</Text>
                    </View>
                  </View>
                  {o.contactEmail ? <Text style={styles.email}>{o.contactEmail}</Text> : null}
                  {o.items?.map((it, i) => (
                    <Text key={i} style={styles.itemLine}>
                      {it.quantity}× {it.title} {it.tierLabel ? `(${it.tierLabel})` : ''} — ₹{it.price}/unit
                    </Text>
                  ))}
                  <Text style={styles.date}>
                    {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.amount}>₹{o.totalAmount?.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.orderShortId}>#{o._id.slice(-6).toUpperCase()}</Text>
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
                {updating === o._id && <ActivityIndicator size="small" color={CustomerColors.teal600} />}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder },
  filterChipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  filterChipTextActive: { color: '#fff' },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 6 },
  emptyTitle: { fontWeight: '700', fontSize: FontSizes.md, color: '#374151' },
  emptySub: { fontSize: FontSizes.sm, color: '#9CA3AF', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md },
  cardTop: { flexDirection: 'row', gap: Spacing.sm },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  orderId: { fontWeight: '800', color: CustomerColors.black, fontSize: FontSizes.sm },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
  email: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: 2 },
  itemLine: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  date: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  amount: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  orderShortId: { fontSize: 10, color: '#9CA3AF' },
  statusPicker: { flexDirection: 'row', gap: 4, flex: 1, flexWrap: 'wrap', justifyContent: 'flex-end' },
  statusOption: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F5F5F5' },
  statusOptionText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
});
