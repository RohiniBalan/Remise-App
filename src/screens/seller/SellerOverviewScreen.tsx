import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IndianRupee, ShoppingBag, TrendingUp, Store, Clock, AlertCircle } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import {
  extractSellerLineItems, computeSellerAnalytics, buildSellerTrend, buildBuyerInsights, buildPaymentOverview,
} from '../../utils/sellerAnalytics';
import { MiniLineChart, MiniBarChart } from './MiniCharts';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const STATUS_COLORS: Record<string, { bg: string; fg: string; darkBg: string; darkFg: string }> = {
  PENDING: { bg: '#FFFBEB', fg: '#B45309', darkBg: 'rgba(217, 119, 6, 0.15)', darkFg: '#FBBF24' },
  PAID: { bg: '#F0FDF4', fg: '#15803D', darkBg: 'rgba(22, 163, 74, 0.15)', darkFg: '#4ADE80' },
  FAILED: { bg: '#FEF2F2', fg: '#FF0000', darkBg: 'rgba(239, 68, 68, 0.15)', darkFg: '#F87171' },
};

export default function SellerOverviewScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { store, orders, products, storeNameByOwnerId, loading, refresh } = useSellerDashboard();
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const isWholesaler = user?.role === 'whole_saler' || user?.role === 'wholesaler';

  const lineItems = useMemo(() => extractSellerLineItems(orders, products), [orders, products]);
  const analytics = useMemo(() => computeSellerAnalytics(lineItems), [lineItems]);
  const trend = useMemo(() => buildSellerTrend(analytics.byDay, analytics.byDayProduct, granularity), [analytics, granularity]);
  const buyers = useMemo(() => buildBuyerInsights(orders, storeNameByOwnerId), [orders, storeNameByOwnerId]);
  const payments = useMemo(() => buildPaymentOverview(orders, storeNameByOwnerId), [orders, storeNameByOwnerId]);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const monthDeliveredRevenue = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return orders
      .filter(o => (o.orderStatus || '').toLowerCase() === 'delivered' && new Date(o.createdAt) >= monthStart)
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
  }, [orders]);

  const target = store?.targetRevenue || 0;
  const pct = target > 0 ? Math.min(100, Math.round((monthDeliveredRevenue / target) * 100)) : 0;

  const stats = [
    { label: 'Total Orders', value: String(totalOrders), icon: ShoppingBag, color: '#2563EB' },
    { label: 'Total Revenue (₹)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#16A34A' },
    { label: 'Products Sold', value: String(analytics.totalProductsSold), icon: TrendingUp, color: '#7C3AED' },
  ];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      {/* Role & Store Header Banner */}
      <View style={styles.roleBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={styles.storeLogoBox}>
            {store?.logo ? (
              <Image source={{ uri: resolveImageUrl(store.logo) }} style={styles.storeLogo} />
            ) : (
              <Store size={22} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleBannerText} numberOfLines={1}>
              {store?.name || (isWholesaler ? 'Wholesale Merchant Console' : 'Home Business Console')}
            </Text>
            <Text style={styles.roleBannerSub}>
              {isWholesaler
                ? '📦 Wholesale Merchant Console'
                : '🏠 Artisan & Home Business Console'}
            </Text>
          </View>
        </View>
      </View>

      {/* Target revenue */}
      <View style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <Text style={styles.targetTitle}>Monthly Target</Text>
          {target === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('SellerSettings')}><Text style={styles.link}>Set target</Text></TouchableOpacity>
          )}
        </View>
        {target > 0 ? (
          <>
            <Text style={styles.targetAmounts}>
              ₹{monthDeliveredRevenue.toLocaleString('en-IN')} <Text style={styles.targetOf}>of ₹{target.toLocaleString('en-IN')}</Text>
            </Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
            <Text style={styles.targetPct}>{pct}% achieved this month</Text>
          </>
        ) : (
          <Text style={styles.targetEmpty}>Set a monthly revenue target in Settings to track progress here.</Text>
        )}
      </View>

      {/* Stat cards */}
      <View style={styles.statsGrid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <s.icon size={18} color={s.color} />
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Sales trend */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Sales Trend</Text>
          <View style={styles.granRow}>
            {(['daily', 'weekly', 'monthly'] as const).map(g => (
              <TouchableOpacity key={g} onPress={() => setGranularity(g)} style={[styles.granChip, granularity === g && styles.granChipActive]}>
                <Text style={[styles.granChipText, granularity === g && styles.granChipTextActive]}>{g[0].toUpperCase() + g.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <MiniLineChart data={trend} />
      </View>

      {/* Revenue by month */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue by Month</Text>
        <MiniBarChart data={analytics.revenueByMonth} />
      </View>

      {/* Top selling products */}
      <View style={styles.tableSection}>
        <Text style={styles.sectionTitleInset}>Top Selling Products</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Brand</Text>
          <Text style={[styles.tableHeaderText, { width: 40, textAlign: 'right' }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { width: 70, textAlign: 'right' }]}>Revenue</Text>
        </View>
        {analytics.topProducts.length === 0 ? (
          <Text style={styles.emptyText}>No data</Text>
        ) : (
          analytics.topProducts.map(r => (
            <View key={`${r.title}-${r.brand}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]} numberOfLines={1}>{r.title}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>{r.brand}</Text>
              <Text style={[styles.tableCell, { width: 40, textAlign: 'right' }]}>{r.qty}</Text>
              <Text style={[styles.tableCell, { width: 70, textAlign: 'right', color: CustomerColors.teal700, fontWeight: '700' }]}>₹{r.revenue.toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}
      </View>

      {/* Top buying stores */}
      <View style={styles.tableSection}>
        <View style={styles.sectionHeaderIconRow}>
          <Store size={15} color={CustomerColors.teal600} />
          <Text style={styles.sectionTitleInset}>Top Buying Stores</Text>
        </View>
        {buyers.length === 0 ? (
          <Text style={styles.emptyText}>No buyers yet</Text>
        ) : (
          buyers.slice(0, 8).map(b => (
            <View key={b.buyerId} style={styles.buyerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.buyerName} numberOfLines={1}>{b.storeName}</Text>
                <Text style={styles.buyerSub}>{b.totalOrders} order{b.totalOrders !== 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.buyerRevenue}>₹{b.totalRevenue.toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}
      </View>

      {/* Payment status overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Status Overview</Text>
        <View style={styles.paymentGrid}>
          {Object.entries(payments.statusCounts).map(([status, count]) => {
            const c = STATUS_COLORS[status] || { bg: '#F3F4F6', fg: '#4B5563', darkBg: '#1F2937', darkFg: '#9CA3AF' };
            const bg = isDark ? c.darkBg : c.bg;
            const fg = isDark ? c.darkFg : c.fg;
            return (
              <View key={status} style={[styles.paymentCard, { backgroundColor: bg }]}>
                <Text style={[styles.paymentCount, { color: fg }]}>{count}</Text>
                <Text style={[styles.paymentStatus, { color: fg }]}>{status}</Text>
                <Text style={[styles.paymentAmount, { color: fg }]}>₹{(payments.statusAmounts[status] || 0).toLocaleString('en-IN')}</Text>
              </View>
            );
          })}
          {Object.keys(payments.statusCounts).length === 0 && <Text style={styles.emptyText}>No orders yet</Text>}
        </View>
        <View style={styles.paymentStatLine}>
          <Text style={styles.paymentStatLabel}>Avg. pending days</Text>
          <Text style={styles.paymentStatValue}>{payments.avgPendingDays.toFixed(1)} days</Text>
        </View>
        <View style={styles.paymentStatLine}>
          <Text style={styles.paymentStatLabel}>Pending &gt; 7 days</Text>
          <Text style={[styles.paymentStatValue, payments.over7Days.length > 0 && { color: '#FF0000' }]}>{payments.over7Days.length}</Text>
        </View>
      </View>

      {/* Pending payment aging */}
      <View style={styles.tableSection}>
        <View style={styles.sectionHeaderIconRow}>
          <Clock size={15} color="#D97706" />
          <Text style={styles.sectionTitleInset}>Pending Payment Aging</Text>
        </View>
        {payments.pendingAging.length === 0 ? (
          <Text style={styles.emptyText}>No pending payments</Text>
        ) : (
          payments.pendingAging.map(p => (
            <View key={p.orderId} style={styles.buyerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.buyerName} numberOfLines={1}>{p.storeName}</Text>
                <Text style={styles.buyerSub}>{p.orderId}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.buyerRevenue}>₹{p.amount.toLocaleString('en-IN')}</Text>
                <View style={[styles.agingBadge, p.daysPending > 7 ? styles.agingBadgeUrgent : styles.agingBadgeWarn]}>
                  {p.daysPending > 7 && <AlertCircle size={10} color="#FF0000" />}
                  <Text style={[styles.agingText, p.daysPending > 7 && { color: '#FF0000' }]}>
                    Pending {p.daysPending} day{p.daysPending !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  roleBanner: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  storeLogoBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeLogo: {
    width: '100%',
    height: '100%',
  },
  roleBannerText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  roleBannerSub: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    marginTop: 3,
  },
  targetCard: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  targetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
  targetAmounts: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700, marginTop: 6 },
  targetOf: { fontSize: FontSizes.xs, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: CustomerColors.teal600 },
  targetPct: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 6 },
  targetEmpty: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 },
  link: { fontSize: FontSizes.xs, color: CustomerColors.teal600, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.sm,
    ...Shadows.card,
  },
  statValue: { fontSize: FontSizes.md, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 },
  section: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, marginBottom: Spacing.sm },
  granRow: { flexDirection: 'row', gap: 4 },
  granChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: isDark ? '#1F2937' : '#F5F5F5' },
  granChipActive: { backgroundColor: CustomerColors.teal600 },
  granChipText: { fontSize: 10, fontWeight: '700', color: isDark ? '#9CA3AF' : '#4B5563' },
  granChipTextActive: { color: '#fff' },
  tableSection: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  sectionTitleInset: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, padding: Spacing.md, paddingBottom: Spacing.sm },
  sectionHeaderIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: 6 },
  tableHeaderText: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 8, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
  tableCell: { fontSize: 11, color: isDark ? '#E5E7EB' : '#374151' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, padding: Spacing.lg },
  buyerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
  buyerName: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
  buyerSub: { fontSize: 10, color: '#9CA3AF' },
  buyerRevenue: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  paymentCard: { flex: 1, minWidth: 90, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  paymentCount: { fontSize: FontSizes.md, fontWeight: '800' },
  paymentStatus: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  paymentAmount: { fontSize: 10, marginTop: 2 },
  paymentStatLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
  paymentStatLabel: { fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' },
  paymentStatValue: { fontSize: 11, fontWeight: '700', color: isDark ? '#E5E7EB' : '#374151' },
  agingBadge: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  agingBadgeWarn: { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFFBEB' },
  agingBadgeUrgent: { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' },
  agingText: { fontSize: 9, fontWeight: '700', color: isDark ? '#FBBF24' : '#B45309' },
});
