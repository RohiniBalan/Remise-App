import React, { useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GATEWAY_URL } from '../../api/endpoints';
import { Package, Tag, ShoppingBag, IndianRupee, Clock, AlertCircle, TrendingUp, Target } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;

function resolveImageUri(url?: string) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function StoreOverviewScreen() {
  const navigation = useNavigation<any>();
  const { store, offers, orders, products, loading, loadError, refresh } = useStoreDashboard();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

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
      { label: 'Total Products', value: products.length, icon: Package, color: isDark ? '#A78BFA' : '#7C3AED' },
      { label: 'Active Offers', value: activeOffers, icon: Tag, color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
      { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: isDark ? '#60A5FA' : '#2563EB' },
      { label: 'Revenue (₹)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: isDark ? '#34D399' : CustomerColors.success },
      { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: pendingOrders > 0 ? (isDark ? '#F87171' : CustomerColors.primary) : (isDark ? '#9CA3AF' : '#6B7280') },
      { label: 'Offer Revenue (₹)', value: `₹${offerRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: isDark ? '#34D399' : CustomerColors.success },
      { label: 'Low Stock', value: lowStock, icon: AlertCircle, color: lowStock > 0 ? (isDark ? '#FBBF24' : '#D97706') : (isDark ? '#9CA3AF' : '#6B7280') },
    ];
  }, [offers, orders, products, isDark]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [orders]);
  const topProducts = useMemo(() => [...products].sort((a, b) => b.totalStock - a.totalStock).slice(0, 4), [products]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.primary} />
      </View>
    );
  }

  const target = store?.targetRevenue || 0;
  const pct = target > 0 ? Math.min(100, Math.round((monthDeliveredRevenue / target) * 100)) : 0;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={isDark ? '#2DD4BF' : undefined} />}
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
                <Target size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
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
              <TrendingUp size={18} color={isDark ? '#A78BFA' : '#7C3AED'} />
              <Text style={[styles.statValue, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>{totalProductsSold}</Text>
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
                    <Text style={[styles.listRowAmount, p.totalStock < 5 && { color: isDark ? '#FBBF24' : '#D97706' }]}>{p.totalStock} left</Text>
                    <Text style={styles.listRowSub}>₹{p.discountedPrice || p.price}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {!store?.isVerified && (
            <View style={styles.verificationBanner}>
              <AlertCircle size={16} color={isDark ? '#FBBF24' : '#D97706'} />
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

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    errorBanner: {
      backgroundColor: isDark ? '#451a03' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? '#78350f' : '#FDE68A',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    errorText: { fontSize: FontSizes.xs, color: isDark ? '#fde68a' : '#92400E' },
    targetCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      ...Shadows.card,
    },
    targetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    targetTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
    targetAmounts: { fontSize: FontSizes.md, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, marginTop: Spacing.xs },
    targetOf: { fontSize: FontSizes.xs, fontWeight: '600', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', marginTop: Spacing.sm, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal600 },
    targetPct: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 6 },
    targetEmpty: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: Spacing.xs },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: {
      width: '31%',
      minHeight: 92,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.sm,
      ...Shadows.card,
    },
    statValue: { fontSize: FontSizes.md, fontWeight: '800', marginTop: 4 },
    statLabel: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
    section: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      marginBottom: Spacing.md,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
    link: { fontSize: FontSizes.xs, color: isDark ? '#2DD4BF' : CustomerColors.teal600, fontWeight: '700' },
    emptyText: { textAlign: 'center', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontSize: FontSizes.sm, padding: Spacing.lg },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    productThumb: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: isDark ? '#1F2937' : '#F5F5F5' },
    listRowTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
    listRowSub: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
    listRowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    listRowStatus: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
    verificationBanner: {
      flexDirection: 'row',
      gap: Spacing.sm,
      backgroundColor: isDark ? '#451a03' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? '#78350f' : '#FDE68A',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    verificationTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#fde68a' : '#92400E' },
    verificationText: { fontSize: FontSizes.xs, color: isDark ? '#fde68a' : '#92400E', marginTop: 2 },
    topIconRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.md },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: CustomerColors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
    iconBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  });