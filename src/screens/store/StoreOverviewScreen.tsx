import React, { useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package, Tag, ShoppingBag, IndianRupee, Clock, AlertCircle, } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's OverviewTab — same 6
// stat tiles (Total Products/Active Offers/Total Orders/Revenue/Pending
// Orders/Low Stock), same "Recent Orders" (top 5) + "Product Stock" (top 4
// by stock desc) lists, same store-verification-pending notice.
export default function StoreOverviewScreen() {
  const navigation = useNavigation<any>();
  const { store, offers, orders, products, loading, loadError, refresh } = useStoreDashboard();

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const activeOffers = offers.filter(o => o.isActive && new Date(o.validUntil) > new Date()).length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const lowStock = products.filter(p => p.totalStock < 5 && p.availability !== 'Out Of Stock').length;
    return [
      { label: 'Total Products', value: products.length, icon: Package, color: '#7C3AED' },
      { label: 'Active Offers', value: activeOffers, icon: Tag, color: CustomerColors.teal700 },
      { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#2563EB' },
      { label: 'Revenue (₹)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: CustomerColors.success },
      { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: pendingOrders > 0 ? CustomerColors.primary : '#6B7280' },
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

          <View style={styles.statsGrid}>
            {stats.map(s => (
              <View key={s.label} style={styles.statCard}>
                <s.icon size={18} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
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
                  <Image source={{ uri: p.imageUrl || p.images?.[0] }} style={styles.productThumb} />
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '31%', backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.sm, ...Shadows.card },
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
