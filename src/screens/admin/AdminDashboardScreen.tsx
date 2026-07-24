import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { IndianRupee, Package, Users, Gamepad2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Ported from client/app/admin/dashboard/page.tsx — this page has NO API
// calls on web either (100% hardcoded mock data) — ported as-is rather
// than "fixed" into real data, matching the plan's explicit instruction
// not to deviate from the web app's actual (mock) behavior here. The
// custom animated SVG revenue chart has no direct RN equivalent without a
// charting library; reproduced as a simple bar list instead (same
// revenueData values, different widget — a legitimate "redesign the UI"
// substitution since no interactivity/business-logic is lost).
const STATS = [
  { label: 'Total Revenue', value: '₹24,56,890', change: '+15.3%', up: true, icon: IndianRupee, color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Total Orders', value: '1,284', change: '+8.2%', up: true, icon: Package, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Active Customers', value: '8,439', change: '-2.4%', up: false, icon: Users, color: '#9333EA', bg: '#FAF5FF' },
  { label: 'Products in Catalog', value: '452', change: 'New: 12', up: null, icon: Gamepad2, color: '#CA8A04', bg: '#FEFCE8' },
];

const RECENT_ORDERS = [
  { id: '#ORD-7031', product: 'Ferrari F1 Ultimate Collector', customer: 'Rahul Sharma', amount: '₹12,499', status: 'Delivered', date: 'Today, 10:42 AM' },
  { id: '#ORD-7032', product: 'Robotic Coding Kit Pro', customer: 'Priya Patel', amount: '₹11,999', status: 'Processing', date: 'Today, 09:15 AM' },
  { id: '#ORD-7033', product: 'Magic Artist Studio Pro', customer: 'Amit Kumar', amount: '₹5,499', status: 'Shipped', date: 'Yesterday, 04:30 PM' },
  { id: '#ORD-7034', product: 'Premium LEGO Architecture', customer: 'Sneha Reddy', amount: '₹9,999', status: 'Delivered', date: 'Yesterday, 02:10 PM' },
  { id: '#ORD-7035', product: 'Interactive Globe Explorer', customer: 'Vikram Singh', amount: '₹6,499', status: 'Processing', date: 'Yesterday, 11:20 AM' },
];

const TOP_PRODUCTS = [
  { name: 'AI Smart Companion Bot', category: 'Tech Toys', sales: 342, revenue: '₹30,77,658', trend: '+12%' },
  { name: 'Ferrari F1 Diecast', category: 'Collectibles', sales: 289, revenue: '₹36,12,211', trend: '+8%' },
  { name: 'LEGO Architecture', category: 'Building Blocks', sales: 256, revenue: '₹25,59,744', trend: '-3%' },
];

const REVENUE_DATA = [
  { label: 'Mon', value: 12500 }, { label: 'Tue', value: 18200 }, { label: 'Wed', value: 15400 },
  { label: 'Thu', value: 24600 }, { label: 'Fri', value: 21800 }, { label: 'Sat', value: 35500 }, { label: 'Sun', value: 28900 },
];

const STATUS_COLOR: Record<string, string> = { Delivered: '#16A34A', Processing: '#CA8A04', Shipped: '#2563EB' };

export default function AdminDashboardScreen() {
  const maxRevenue = Math.max(...REVENUE_DATA.map(d => d.value));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      <View style={styles.statsGrid}>
        {STATS.map(s => (
          <View key={s.label} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}><s.icon size={18} color={s.color} /></View>
              {s.up !== null && (
                <View style={[styles.trendPill, { backgroundColor: s.up ? '#F0FDF4' : '#FEF2F2' }]}>
                  {s.up ? <TrendingUp size={11} color="#16A34A" /> : <TrendingDown size={11} color="#DC2626" />}
                  <Text style={[styles.trendText, { color: s.up ? '#16A34A' : '#DC2626' }]}>{s.change}</Text>
                </View>
              )}
              {s.up === null && <View style={styles.trendPillNeutral}><Text style={styles.trendTextNeutral}>{s.change}</Text></View>}
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Revenue</Text>
        <View style={styles.barChart}>
          {REVENUE_DATA.map(d => (
            <View key={d.label} style={styles.barCol}>
              <View style={[styles.bar, { height: 6 + (d.value / maxRevenue) * 90 }]} />
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Toys</Text>
        {TOP_PRODUCTS.map(p => (
          <View key={p.name} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.name}</Text>
              <Text style={styles.rowSub}>{p.category} · {p.sales} sold</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowAmount}>{p.revenue}</Text>
              <Text style={[styles.rowTrend, { color: p.trend.startsWith('-') ? '#DC2626' : '#16A34A' }]}>{p.trend}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {RECENT_ORDERS.map(o => (
          <View key={o.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{o.product}</Text>
              <Text style={styles.rowSub}>{o.customer} · {o.id}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowAmount}>{o.amount}</Text>
              <Text style={[styles.rowStatus, { color: STATUS_COLOR[o.status] || '#6B7280' }]}>{o.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, ...Shadows.card },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  trendText: { fontSize: 9, fontWeight: '700' },
  trendPillNeutral: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  trendTextNeutral: { fontSize: 9, color: '#6B7280', fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6B7280' },
  statValue: { fontSize: FontSizes.lg, fontWeight: '800', color: '#111827', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#111827', marginBottom: Spacing.md },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { width: 18, backgroundColor: AdminColors.primary, borderRadius: 4 },
  barLabel: { fontSize: 9, color: '#9CA3AF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rowTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  rowTrend: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  rowStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
