import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Search, Store, Truck, QrCode, Wallet, ShoppingBag } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { offersApi } from '../../api/offersApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's OrdersTab — same merge
// of OfferOrder + smart-order sources, same search + status filter, same
// delivery-method/payment-method chips for smart orders, same
// status-update-only-for-OfferOrder-sourced-orders restriction (smart
// orders show a read-only status badge — no status-change UI exists for
// that source on web either).
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function StoreOrdersScreen() {
  const { orders, loading, refresh } = useStoreDashboard();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.offerTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await offersApi.updateOrderStatus(orderId, status);
      refresh();
    } catch {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.teal700} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Search size={14} color={CustomerColors.textSecondary} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search by customer or offer…" />
      </View>
      <View style={styles.filterRow}>
        {['all', ...ORDER_STATUSES].map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterChipText, filter === s && styles.filterChipTextActive]}>{s === 'all' ? 'All' : s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingBag size={40} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No orders found</Text>
          </View>
        }
        renderItem={({ item: o }) => (
          <View style={styles.card}>
            <Text style={styles.orderTitle} numberOfLines={1}>{o.offerTitle}</Text>
            <Text style={styles.orderCustomer}>{o.customerName}{o.customerPhone ? ` · ${o.customerPhone}` : ''}</Text>
            <Text style={styles.orderAddress} numberOfLines={1}>{o.deliveryAddress}</Text>
            {o._source === 'smartOrder' && o.deliveryMethod && (
              <View style={styles.chipRow}>
                <View style={styles.metaChip}>
                  {o.deliveryMethod === 'pickup' ? <Store size={10} color="#6B7280" /> : <Truck size={10} color="#6B7280" />}
                  <Text style={styles.metaChipText}>{o.deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home Delivery'}</Text>
                </View>
                <View style={styles.metaChip}>
                  {o.paymentMethod === 'qr' ? <QrCode size={10} color="#6B7280" /> : <Wallet size={10} color="#6B7280" />}
                  <Text style={styles.metaChipText}>{o.paymentMethod === 'qr' ? 'QR' : 'Cash'} · {o.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending'}</Text>
                </View>
              </View>
            )}
            <View style={styles.footerRow}>
              <Text style={styles.orderAmount}>₹{o.totalAmount}</Text>
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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, marginHorizontal: Spacing.md, marginTop: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
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
  statusBadge: { alignSelf: 'flex-start', backgroundColor: CustomerColors.mint, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.pill },
  statusBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal700 },
  statusChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statusOption: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  statusOptionActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  statusOptionText: { fontSize: 9, color: CustomerColors.textSecondary, fontWeight: '600' },
  statusOptionTextActive: { color: '#fff' },
});
