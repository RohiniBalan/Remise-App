import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Search, X, Package } from 'lucide-react-native';
import { adminOrderApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 30;

  const load = () => {
    adminOrderApi.getAll().then(res => setOrders(res.data.data || res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const customerName = o.userId?.fullname || `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`;
    return !q || o.orderId?.toLowerCase().includes(q) || o.contactEmail?.toLowerCase().includes(q) || customerName.toLowerCase().includes(q);
  });

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await adminOrderApi.updateStatus(orderId, status);
      load();
      if (selected?.orderId === orderId) setSelected((s: any) => ({ ...s, orderStatus: status }));
    } catch {
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Search size={14} color={AdminColors.textSecondary} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search order ID, email, name…" />
      </View>

      <FlatList
        data={paginated}
        keyExtractor={o => o._id || o.orderId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={36} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders found</Text>
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
          const customerName = o.userId?.fullname || `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.trim() || 'Customer';
          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelected(o)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>{o.orderId}</Text>
                <Text style={styles.orderMeta}>{customerName} · {o.contactEmail}</Text>
                <Text style={styles.orderAmount}>₹{o.totalAmount}</Text>
              </View>
              <View style={styles.statusChipRow}>
                {STATUSES.map(s => (
                  <TouchableOpacity key={s} style={[styles.statusChip, o.orderStatus === s && styles.statusChipActive]} onPress={() => handleStatus(o.orderId, s)} disabled={updating === o.orderId}>
                    <Text style={[styles.statusChipText, o.orderStatus === s && styles.statusChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />


      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selected.orderId}</Text>
                <TouchableOpacity onPress={() => setSelected(null)}><X size={20} color={AdminColors.textSecondary} /></TouchableOpacity>
              </View>
              <Text style={styles.modalLabel}>Shipping Address</Text>
              <Text style={styles.modalValue}>
                {selected.shippingAddress?.firstName} {selected.shippingAddress?.lastName}, {selected.shippingAddress?.address}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.pinCode}
              </Text>
              <Text style={styles.modalLabel}>Payment</Text>
              <Text style={styles.modalValue}>{selected.paymentMethod} · {selected.paymentStatus}</Text>
              <Text style={styles.modalLabel}>Items</Text>
              {(selected.items || []).map((it: any, i: number) => (
                <Text key={i} style={styles.modalValue}>{it.quantity}x {it.title} — ₹{it.price}</Text>
              ))}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', margin: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  list: { padding: Spacing.md },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  orderId: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary },
  orderMeta: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 2 },
  orderAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.primary, marginTop: 4 },
  statusChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing.sm },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.pill, backgroundColor: AdminColors.bg, borderWidth: 1, borderColor: AdminColors.border },
  statusChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  statusChipText: { fontSize: 9, color: AdminColors.textSecondary, fontWeight: '600' },
  statusChipTextActive: { color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: AdminColors.textPrimary },
  modalLabel: { fontSize: 10, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', marginTop: Spacing.sm },
  modalValue: { fontSize: FontSizes.sm, color: AdminColors.textPrimary, marginTop: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: AdminColors.textSecondary, fontWeight: '600' },
});

