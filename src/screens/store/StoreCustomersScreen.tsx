import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Star, Users, Tag } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { buildCustomerInsights } from '../../utils/customerInsights';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's CustomersTab — same
// search (name/phone/email), same "Recurring only" toggle + count, same
// card fields (recurring badge, phone/email/customerId, last order date,
// totalSpent, totalOrders), same recurring-products chips + "Create Offer".
export default function StoreCustomersScreen() {
  const navigation = useNavigation<any>();
  const { orders } = useStoreDashboard();
  const [search, setSearch] = useState('');
  const [onlyRecurring, setOnlyRecurring] = useState(false);

  const customers = useMemo(() => buildCustomerInsights(orders), [orders]);
  const recurringCount = customers.filter((c: any) => c.isRecurring).length;

  const filtered = customers.filter((c: any) => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name?.toLowerCase().includes(q) || c.phone?.includes(search) || c.email?.toLowerCase().includes(q);
    const matchRecurring = !onlyRecurring || c.isRecurring;
    return matchSearch && matchRecurring;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={14} color={CustomerColors.textSecondary} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search by name, phone or email…" />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.recurringBtn, onlyRecurring && styles.recurringBtnActive]}
        onPress={() => setOnlyRecurring(v => !v)}
      >
        <Star size={13} color={onlyRecurring ? '#fff' : CustomerColors.textSecondary} />
        <Text style={[styles.recurringBtnText, onlyRecurring && styles.recurringBtnTextActive]}>Recurring only ({recurringCount})</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={c => c.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={40} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No customers found</Text>
          </View>
        }
        renderItem={({ item: c }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{c.name}</Text>
                  {c.isRecurring && (
                    <View style={styles.recurBadge}>
                      <Star size={9} color="#B45309" />
                      <Text style={styles.recurBadgeText}>Recurring buyer</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.meta}>
                  {[c.phone, c.email, c.customerId ? `Customer ID: ${c.customerId}` : null].filter(Boolean).join(' · ')}
                </Text>
                {c.lastOrderDate ? <Text style={styles.lastOrder}>Last order: {fmtDate(c.lastOrderDate)}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.spent}>₹{c.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.orderCount}>{c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}</Text>
              </View>
            </View>

            {c.isRecurring && (
              <View style={styles.recurSection}>
                <Text style={styles.recurLabel}>Buys repeatedly</Text>
                <View style={styles.chipRow}>
                  {c.recurringProducts.map((p: any) => (
                    <View key={p.title} style={styles.chip}>
                      <Text style={styles.chipText}>{p.title} · {p.monthCount} months</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.offerBtn}
                  onPress={() => navigation.navigate('NewOffer', { customerId: c.customerId || c.key, customerName: c.name })}
                >
                  <Tag size={13} color="#fff" />
                  <Text style={styles.offerBtnText}>Create Offer →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  toolbar: { padding: Spacing.md, paddingBottom: 0 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  recurringBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', margin: Spacing.md, marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  recurringBtnActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  recurringBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary },
  recurringBtnTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  card: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  recurBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: BorderRadius.pill, paddingHorizontal: 6, paddingVertical: 2 },
  recurBadgeText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
  meta: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 3 },
  lastOrder: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 4 },
  spent: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.teal700 },
  orderCount: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  recurSection: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  recurLabel: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  chip: { backgroundColor: '#DFF1F1', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: CustomerColors.teal700 },
  offerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.md },
  offerBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
});