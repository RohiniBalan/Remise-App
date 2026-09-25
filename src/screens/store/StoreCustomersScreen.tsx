import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Star, Users, Tag } from 'lucide-react-native';
import { useOptionalStoreDashboard } from '../../context/StoreDashboardContext';
import { useOptionalSellerDashboard } from '../../context/SellerDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { buildCustomerInsights } from '../../utils/customerInsights';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

export default function StoreCustomersScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const storeDash = useOptionalStoreDashboard();
  const sellerDash = useOptionalSellerDashboard();
  const dash = (storeDash && storeDash.store) ? storeDash : ((sellerDash && sellerDash.store) ? sellerDash : (storeDash || sellerDash || {}));
  const { orders = [] } = dash as any;
  const [search, setSearch] = useState('');
  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, onlyRecurring]);

  const customers = useMemo(() => buildCustomerInsights(orders), [orders]);
  const recurringCount = customers.filter((c: any) => c.isRecurring).length;

  const filtered = customers.filter((c: any) => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name?.toLowerCase().includes(q) || c.phone?.includes(search) || c.email?.toLowerCase().includes(q);
    const matchRecurring = !onlyRecurring || c.isRecurring;
    return matchSearch && matchRecurring;
  });

  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={14} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, phone or email…"
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.recurringBtn, onlyRecurring && styles.recurringBtnActive]}
        onPress={() => setOnlyRecurring(v => !v)}
      >
        <Star size={13} color={onlyRecurring ? '#fff' : (isDark ? '#9CA3AF' : CustomerColors.textSecondary)} />
        <Text style={[styles.recurringBtnText, onlyRecurring && styles.recurringBtnTextActive]}>Recurring only ({recurringCount})</Text>
      </TouchableOpacity>

      <FlatList
        data={paginatedCustomers}
        keyExtractor={c => c.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={40} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>No customers found</Text>
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
        renderItem={({ item: c }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{c.name || c.phone || 'Customer'}</Text>
                  {c.isRecurring && (
                    <View style={styles.recurBadge}>
                      <Star size={9} color={isDark ? '#FCD34D' : '#B45309'} />
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

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  toolbar: { padding: Spacing.md, paddingBottom: 0 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: isDark ? '#1F2937' : CustomerColors.white, borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  recurringBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', margin: Spacing.md, marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.pill, backgroundColor: isDark ? '#111827' : CustomerColors.white, borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder },
  recurringBtnActive: { backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600, borderColor: isDark ? '#0f766e' : CustomerColors.teal600 },
  recurringBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
  recurringBtnTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: isDark ? '#E5E7EB' : '#374151' },
  card: { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
  recurBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: isDark ? '#78350F' : '#FFFBEB', borderWidth: 1, borderColor: isDark ? '#92400E' : '#FDE68A', borderRadius: BorderRadius.pill, paddingHorizontal: 6, paddingVertical: 2 },
  recurBadgeText: { fontSize: 9, fontWeight: '700', color: isDark ? '#FDE68A' : '#B45309' },
  meta: { fontSize: FontSizes.xs, color: isDark ? '#D1D5DB' : CustomerColors.textSecondary, marginTop: 3 },
  lastOrder: { fontSize: FontSizes.xs, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 4 },
  spent: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  orderCount: { fontSize: FontSizes.xs, color: isDark ? '#6B7280' : '#9CA3AF' },
  recurSection: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
  recurLabel: { fontSize: 10, fontWeight: '700', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  chip: { backgroundColor: isDark ? '#134e4a' : '#DFF1F1', borderWidth: 1, borderColor: isDark ? '#115e59' : CustomerColors.steelBorder, borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  offerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.md },
  offerBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
});