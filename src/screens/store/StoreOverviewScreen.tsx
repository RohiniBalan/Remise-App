import React, { useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package, Tag, ShoppingBag, IndianRupee, Clock, AlertCircle, TrendingUp, Target } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's OverviewTab.
//
// UPDATE: this screen was missing a few things web has —
//  1. "Offer Revenue" stat card (offer-orders only, excludes wholesale/smart orders)
//  2. "Total Products Sold" card
//  3. The Target Revenue progress card (achieved-this-month vs store.targetRevenue,
//     Settings just added the targetRevenue field this reads from)
//  4. Product-stock thumbnails weren't prefixed with the API base URL, so a
//     relative image path (e.g. "/uploads/xyz.png") rendered a broken image.
//
// NOT ported (bigger lift — needs a charting library like react-native-chart-kit
// or victory-native, plus the date-range analytics bar): Sales Trend line chart,
// Top/Least Selling tables, Brand-wise Revenue bar chart, Category-wise pie chart,
// Revenue by Month bar chart, Best Sales Day card, Export PDF. Happy to build
// these next if you want full parity.

// TODO: point this at whatever your app already uses for the API base URL
// (e.g. an existing config/env file) — this mirrors the web app's
// NEXT_PUBLIC_API_URL fallback so relative image paths resolve correctly.
const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

function resolveImageUri(url?: string) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function StoreOverviewScreen() {
  const navigation = useNavigation<any>();
  const { store, offers, orders, products, loading, loadError, refresh } = useStoreDashboard();

  const totalProductsSold = useMemo(
    () => orders.reduce((s, o: any) => s + (o.quantity || 0), 0),
    [orders],
  );

  const monthDeliveredRevenue = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return orders
      .filter((o: any) => o.status === 'Delivered' && new Date(o.createdAt) >= monthStart)
      .reduce((s, o: any) => s + (o.totalAmount || 0), 0);
  }, [orders]);

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const offerRevenue = orders
      .filter((o: any) => o.status === 'Delivered' && o._source !== 'smartOrder')
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const activeOffers = offers.filter(o => o.isActive && new Date(o.validUntil) > new Date()).length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const lowStock = products.filter(p => p.totalStock < 5 && p.availability !== 'Out Of Stock').length;
    return [
      { label: 'Total Products', value: products.length, icon: Package, color: '#7C3AED' },
      { label: 'Active Offers', value: activeOffers, icon: Tag, color: CustomerColors.teal700 },
      { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#2563EB' },
      { label: 'Revenue (₹)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: CustomerColors.success },
      { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: pendingOrders > 0 ? CustomerColors.primary : '#6B7280' },
      { label: 'Offer Revenue (₹)', value: `₹${offerRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: CustomerColors.success },
      { label: 'Low Stock', value: lowStock, icon: AlertCircle, color: lowStock > 0 ? '#D97706' : '#6B7280' },
    ];
  }, [offers, orders, products]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [orders]);
  const topProducts = useMemo(() => [...products].sort((a, b) => b.totalStock - a.totalStock).slice(0, 4), [products]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  const target = store?.targetRevenue || 0;
  const pct = target > 0 ? Math.min(100, Math.round((monthDeliveredRevenue / target) * 100)) : 0;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      data={[]}
      keyExtractor={() => '_'}
      renderItem={null}
      ListHeaderComponent={
        <View>
          {loadError ? (
            <View style={styles.errorBanner}><Text style={styles.errorText}>{loadError}</Text></View>
          ) : null}

          {/* ── Target Revenue card ── */}
          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Target size={16} color={CustomerColors.teal700} />
                <Text style={styles.targetTitle}>Monthly Target</Text>
              </View>
              {target === 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('StoreSettings')}>
                  <Text style={styles.link}>Set target</Text>
                </TouchableOpacity>
              )}
            </View>
            {target > 0 ? (
              <>
                <Text style={styles.targetAmounts}>
                  ₹{monthDeliveredRevenue.toLocaleString('en-IN')}{' '}
                  <Text style={styles.targetOf}>of ₹{target.toLocaleString('en-IN')}</Text>
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.targetPct}>{pct}% achieved this month</Text>
              </>
            ) : (
              <Text style={styles.targetEmpty}>Set a monthly revenue target in Settings to track progress here.</Text>
            )}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TrendingUp size={18} color="#7C3AED" />
              <Text style={[styles.statValue, { color: '#7C3AED' }]}>{totalProductsSold}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>Products Sold</Text>
            </View>
            {stats.map(s => (
              <View key={s.label} style={styles.statCard}>
                <s.icon size={18} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('StoreOwnerOrders')}><Text style={styles.link}>View all</Text></TouchableOpacity>
            </View>
            {recentOrders.length === 0 ? (
              <Text style={styles.emptyText}>No orders yet</Text>
            ) : (
              recentOrders.map(o => (
                <View key={o._id} style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listRowTitle} numberOfLines={1}>{o.offerTitle || o.customerName}</Text>
                    <Text style={styles.listRowSub}>{o.customerName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.listRowAmount}>₹{o.totalAmount}</Text>
                    <Text style={styles.listRowStatus}>{o.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Product Stock</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}><Text style={styles.link}>Manage</Text></TouchableOpacity>
            </View>
            {topProducts.length === 0 ? (
              <Text style={styles.emptyText}>No products yet</Text>
            ) : (
              topProducts.map(p => (
                <View key={p._id} style={styles.listRow}>
                  <Image source={{ uri: resolveImageUri(p.imageUrl || p.images?.[0]) }} style={styles.productThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listRowTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.listRowSub}>{p.category || '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.listRowAmount, p.totalStock < 5 && { color: '#D97706' }]}>{p.totalStock} left</Text>
                    <Text style={styles.listRowSub}>₹{p.discountedPrice || p.price}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {!store?.isVerified && (
            <View style={styles.verificationBanner}>
              <AlertCircle size={16} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.verificationTitle}>Store Verification Pending</Text>
                <Text style={styles.verificationText}>Our team will review and verify your store shortly.</Text>
              </View>
            </View>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  errorBanner: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  errorText: { fontSize: FontSizes.xs, color: '#92400E' },
  targetCard: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  targetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  targetTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  targetAmounts: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.teal700, marginTop: Spacing.xs },
  targetOf: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.textSecondary },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#F5F5F5', marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: CustomerColors.teal600 },
  targetPct: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 6 },
  targetEmpty: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: Spacing.xs },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '31%', minHeight: 92, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.sm, ...Shadows.card },
  statValue: { fontSize: FontSizes.md, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, color: CustomerColors.textSecondary, marginTop: 2 },
  section: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, marginBottom: Spacing.md, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  link: { fontSize: FontSizes.xs, color: CustomerColors.teal600, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: CustomerColors.textSecondary, fontSize: FontSizes.sm, padding: Spacing.lg },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  productThumb: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: '#F5F5F5' },
  listRowTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  listRowSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  listRowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.teal700 },
  listRowStatus: { fontSize: 10, color: CustomerColors.textSecondary },
  verificationBanner: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: BorderRadius.md, padding: Spacing.md },
  verificationTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#92400E' },
  verificationText: { fontSize: FontSizes.xs, color: '#92400E', marginTop: 2 },
  topIconRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.md },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, alignItems: 'center', justifyContent: 'center' },
  iconBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: CustomerColors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  iconBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});