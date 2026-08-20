import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IndianRupee, ShoppingBag, TrendingUp, Store, Clock, AlertCircle } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import {
  extractSellerLineItems, computeSellerAnalytics, buildSellerTrend, buildBuyerInsights, buildPaymentOverview,
} from '../../utils/sellerAnalytics';
import { MiniLineChart, MiniBarChart } from './MiniCharts';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#FFFBEB', fg: '#B45309' },
  PAID: { bg: '#F0FDF4', fg: '#15803D' },
  FAILED: { bg: '#FEF2F2', fg: '#FF0000' },
};

export default function SellerOverviewScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { store, orders, products, storeNameByOwnerId, loading, refresh } = useSellerDashboard();
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const isWholesaler = user?.role === 'whole_saler' || user?.role === 'wholesaler';
  const roleLabel = isWholesaler ? 'Wholesale Business' : 'Home Business';

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
      {/* Role Banner */}
      <View style={styles.roleBanner}>
        <Text style={styles.roleBannerText}>
          {isWholesaler ? '📦 Wholesale Merchant Console' : '🏠 Home Business Console'}
        </Text>
        <Text style={styles.roleBannerSub}>
          {isWholesaler
            ? 'Track B2B volume, retailer orders, and bulk stock performance.'
            : 'Track artisan production, custom orders, and direct sales.'}
        </Text>
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
            const c = STATUS_COLORS[status] || { bg: '#F3F4F6', fg: '#4B5563' };
            return (
              <View key={status} style={[styles.paymentCard, { backgroundColor: c.bg }]}>
                <Text style={[styles.paymentCount, { color: c.fg }]}>{count}</Text>
                <Text style={[styles.paymentStatus, { color: c.fg }]}>{status}</Text>
                <Text style={[styles.paymentAmount, { color: c.fg }]}>₹{(payments.statusAmounts[status] || 0).toLocaleString('en-IN')}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  roleBanner: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  roleBannerText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  roleBannerSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 3,
  },
  targetCard: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },

  targetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  targetAmounts: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700, marginTop: 6 },
  targetOf: { fontSize: FontSizes.xs, fontWeight: '600', color: '#6B7280' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#F5F5F5', marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: CustomerColors.teal600 },
  targetPct: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: 6 },
  targetEmpty: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: 4 },
  link: { fontSize: FontSizes.xs, color: CustomerColors.teal600, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, minHeight: 92, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.sm, ...Shadows.card },
  statValue: { fontSize: FontSizes.md, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.sm },
  granRow: { flexDirection: 'row', gap: 4 },
  granChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F5F5F5' },
  granChipActive: { backgroundColor: CustomerColors.teal600 },
  granChipText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
  granChipTextActive: { color: '#fff' },
  tableSection: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, marginBottom: Spacing.md, overflow: 'hidden' },
  sectionTitleInset: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black, padding: Spacing.md, paddingBottom: Spacing.sm },
  sectionHeaderIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: 6 },
  tableHeaderText: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  tableCell: { fontSize: 11, color: '#374151' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, padding: Spacing.lg },
  buyerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  buyerName: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  buyerSub: { fontSize: 10, color: '#9CA3AF' },
  buyerRevenue: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  paymentCard: { flex: 1, minWidth: 90, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  paymentCount: { fontSize: FontSizes.md, fontWeight: '800' },
  paymentStatus: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  paymentAmount: { fontSize: 10, marginTop: 2 },
  paymentStatLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  paymentStatLabel: { fontSize: 11, color: '#6B7280' },
  paymentStatValue: { fontSize: 11, fontWeight: '700', color: '#374151' },
  agingBadge: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  agingBadgeWarn: { backgroundColor: '#FFFBEB' },
  agingBadgeUrgent: { backgroundColor: '#FEF2F2' },
  agingText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
});
