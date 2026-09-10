import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  IndianRupee, 
  Package, 
  Users, 
  Gamepad2, 
  TrendingUp, 
  TrendingDown, 
  Store, 
  Truck, 
  Home, 
  UserCheck, 
  Key,
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight
} from 'lucide-react-native';
import { adminStatsApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const formatCompactINR = (val: number = 0) => {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 10000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const DEFAULT_7_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => ({
  label,
  date: '',
  value: 0,
  orders: 0
}));

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Delivered: { bg: '#DCFCE7', text: '#15803D' },
  Processing: { bg: '#FEF9C3', text: '#A16207' },
  Shipped: { bg: '#DBEAFE', text: '#1D4ED8' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    totalProducts: 0,
    totalStoreOwners: 0,
    totalWholesalers: 0,
    totalHomeBusinesses: 0,
    totalUsers: 0,
    tokensUsed: 0,
    revenueTrend: [] as any[],
    topProducts: [] as any[],
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminStatsApi.getDashboardStats();
      const data = res.data?.data || res.data;
      if (data) {
        setStats({
          totalRevenue: data.totalRevenue ?? 0,
          totalOrders: data.totalOrders ?? 0,
          activeCustomers: data.activeCustomers ?? 0,
          totalProducts: data.totalProducts ?? 0,
          totalStoreOwners: data.totalStoreOwners ?? 0,
          totalWholesalers: data.totalWholesalers ?? 0,
          totalHomeBusinesses: data.totalHomeBusinesses ?? 0,
          totalUsers: data.totalUsers ?? 0,
          tokensUsed: data.tokensUsed ?? 0,
          revenueTrend: data.revenueTrend ?? [],
          topProducts: data.topProducts ?? [],
        });
        if (data.recentOrders && Array.isArray(data.recentOrders)) {
          setRecentOrders(data.recentOrders);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      tag: 'Live Sales',
      icon: IndianRupee,
      color: '#16A34A',
      bg: '#F0FDF4',
    },
    {
      label: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString('en-IN'),
      tag: 'All Time',
      icon: Package,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      label: 'Active Customers',
      value: (stats.activeCustomers || 0).toLocaleString('en-IN'),
      tag: 'Retail Buyers',
      icon: Users,
      color: '#9333EA',
      bg: '#FAF5FF',
    },
    {
      label: 'Products in Catalog',
      value: (stats.totalProducts || 0).toLocaleString('en-IN'),
      tag: 'Active Catalog',
      icon: Gamepad2,
      color: '#CA8A04',
      bg: '#FEFCE8',
    },
    {
      label: 'Total Store Owners',
      value: (stats.totalStoreOwners || 0).toLocaleString('en-IN'),
      tag: 'Retailers',
      icon: Store,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      label: 'Total Wholesalers',
      value: (stats.totalWholesalers || 0).toLocaleString('en-IN'),
      tag: 'B2B Suppliers',
      icon: Truck,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      label: 'Home Businesses',
      value: (stats.totalHomeBusinesses || 0).toLocaleString('en-IN'),
      tag: 'Local Producers',
      icon: Home,
      color: '#0D9488',
      bg: '#F0FDFA',
    },
    {
      label: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString('en-IN'),
      tag: 'Registered',
      icon: UserCheck,
      color: '#0284C7',
      bg: '#F0F9FF',
    },
    {
      label: 'Tokens Used',
      value: (stats.tokensUsed || 0).toLocaleString('en-IN'),
      tag: 'System Tokens',
      icon: Key,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AdminColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 8 Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map(s => (
          <View key={s.label} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <s.icon size={18} color={s.color} />
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{s.tag}</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Weekly Revenue Bar Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Weekly Revenue Trend</Text>
            <Text style={styles.sectionSub}>Performance over the last 7 days</Text>
          </View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>Last 7 Days</Text>
          </View>
        </View>
        <View style={styles.barChart}>
          {(() => {
            const chartData = stats.revenueTrend && stats.revenueTrend.length > 0 ? stats.revenueTrend : DEFAULT_7_DAYS;
            const maxVal = Math.max(...chartData.map((d: any) => d.value), 1);
            return chartData.map((d: any, idx: number) => {
              const height = Math.max(8, (d.value / maxVal) * 85);
              return (
                <View key={d.date || d.label || idx} style={styles.barCol}>
                  {d.value > 0 ? (
                    <Text style={styles.barValue}>{formatCompactINR(d.value)}</Text>
                  ) : null}
                  <View style={[styles.bar, { height, backgroundColor: d.value > 0 ? AdminColors.primary : '#E5E7EB' }]} />
                  <Text style={styles.barLabel}>{d.label}</Text>
                </View>
              );
            });
          })()}
        </View>
      </View>

      {/* Top Selling Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('AdminProduct')}
          >
            <Text style={styles.linkText}>View Catalog</Text>
            <ExternalLink size={12} color={AdminColors.primary} />
          </TouchableOpacity>
        </View>
        {stats.topProducts && stats.topProducts.length > 0 ? (
          stats.topProducts.map((p: any, i: number) => (
            <View key={p.id || p.name || i} style={styles.row}>
              <View style={styles.rankBadgeBox}>
                <Text style={styles.rankBadgeText}>#{i + 1}</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.rowSub}>{p.category} · {p.sales} sold</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowAmount}>{formatCompactINR(p.revenue)}</Text>
                <Text style={[styles.rowTrend, { color: (p.trend || '+5%').startsWith('-') ? '#DC2626' : '#16A34A' }]}>
                  {p.trend || '+5%'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Text style={styles.emptyRecentText}>No product sales recorded yet</Text>
          </View>
        )}
      </View>

      {/* Recent Orders Table */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Text style={styles.sectionSub}>Latest transactions from database</Text>
          </View>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('AdminOrderHistory')}
          >
            <Text style={styles.linkText}>View All</Text>
            <ExternalLink size={12} color={AdminColors.primary} />
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Package size={32} color="#D1D5DB" />
            <Text style={styles.emptyRecentText}>No orders recorded yet</Text>
          </View>
        ) : (
          recentOrders.map((o: any, i: number) => {
            const st = STATUS_COLOR[o.status] || { bg: '#F3F4F6', text: '#4B5563' };
            return (
              <TouchableOpacity
                key={o.id || o._id || i}
                style={styles.orderCard}
                onPress={() => navigation.navigate('AdminOrderHistory')}
                activeOpacity={0.7}
              >
                <View style={styles.orderTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderIdText}>{o.id || `#ORD-${String(i + 1).padStart(4, '0')}`}</Text>
                    <Text style={styles.orderProductText} numberOfLines={1}>
                      {o.product || 'Order Item'}
                      {o.itemCount > 1 ? ` (+${o.itemCount - 1} more)` : ''}
                    </Text>
                    <Text style={styles.orderCustomerText}>
                      {o.customer || 'Customer'} {o.email ? `· ${o.email}` : ''}
                    </Text>
                    <Text style={styles.orderDateText}>{o.date || 'Recent'}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Text style={styles.orderAmountText}>{o.amount || `₹${o.rawAmount || 0}`}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: st.text }]}>{o.status || 'Pending'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, ...Shadows.card },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  tagBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  tagText: { fontSize: 9, color: '#4B5563', fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  statValue: { fontSize: FontSizes.base, fontWeight: '800', color: '#111827', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#111827' },
  sectionSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontSize: 11, fontWeight: '700', color: AdminColors.primary },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, marginTop: Spacing.sm },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  barValue: { fontSize: 8, fontWeight: '800', color: AdminColors.primary, marginBottom: 2 },
  bar: { width: 22, backgroundColor: AdminColors.primary, borderRadius: 4 },
  barLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700' },
  rankBadgeBox: { width: 32, height: 32, borderRadius: BorderRadius.sm, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  rankBadgeText: { fontSize: 11, fontWeight: '800', color: AdminColors.primary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rowTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  rowTrend: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  emptyRecent: { paddingVertical: Spacing.lg, alignItems: 'center', gap: 6 },
  emptyRecentText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  orderCard: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  orderIdText: { fontSize: 11, fontFamily: 'monospace', fontWeight: '800', color: '#111827' },
  orderProductText: { fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 2 },
  orderCustomerText: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  orderDateText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  orderAmountText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginTop: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
});

