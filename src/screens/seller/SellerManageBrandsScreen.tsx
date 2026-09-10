import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Edit2, Trash2, Package, Eye } from 'lucide-react-native';
import { GATEWAY_URL } from '../../api/endpoints';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;
function resolveImageUri(url?: string) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API}${url}`;
}

const AVAILABILITY_STYLE: Record<string, { bg: string; fg: string; darkBg: string; darkFg: string }> = {
  'In Stock': { bg: '#F0FDF4', fg: '#15803D', darkBg: 'rgba(22, 163, 74, 0.15)', darkFg: '#4ADE80' },
  'Out Of Stock': { bg: '#FEF2F2', fg: '#FF0000', darkBg: 'rgba(239, 68, 68, 0.15)', darkFg: '#F87171' },
  'Pre Order': { bg: '#FFFBEB', fg: '#B45309', darkBg: 'rgba(217, 119, 6, 0.15)', darkFg: '#FBBF24' },
};

export default function SellerManageBrandsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { title, category, items: initialItems, brandCount, totalStock } = route.params;
  const { refresh, products } = useSellerDashboard();
  const { token } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  const typeKey = title.toLowerCase().trim().replace(/\s+/g, ' ');
  const items = products.filter((p: any) => (p.title || '').toLowerCase().trim().replace(/\s+/g, ' ') === typeKey);
  const list = items.length ? items : initialItems;

  const handleDelete = (id: string) => {
    Alert.alert('Delete this product?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting(id);
          try {
            await storeProductApi.delete(id);
            await refresh();
          } catch {
            Alert.alert('Failed', 'Could not delete product.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>{brandCount} brand{brandCount !== 1 ? 's' : ''} · {totalStock} total stock</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('SellerProductForm', { initialTitle: title, initialCategory: category })}>
          <Plus size={14} color="#fff" />
          <Text style={styles.addBtnText}>Add Brand</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p: any) => p._id}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        renderItem={({ item: p }: { item: any }) => {
          const img = resolveImageUri(p.imageUrl || p.images?.[0]);
          const avail = AVAILABILITY_STYLE[p.availability] || AVAILABILITY_STYLE['In Stock'];
          const badgeBg = isDark ? avail.darkBg : avail.bg;
          const badgeFg = isDark ? avail.darkFg : avail.fg;
          return (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.thumb}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                {img ? <Image source={{ uri: img }} style={styles.thumbImg} /> : <Package size={20} color={isDark ? '#4B5563' : '#E5E7EB'} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                <Text style={styles.brandName} numberOfLines={1}>{p.brand || 'Unbranded'}</Text>
                <Text style={styles.price}>₹{p.discountedPrice || p.price}</Text>
                <Text style={styles.moqText}>MOQ: {p.moq || 1} · {p.bulkPricing?.length || 0} tier{p.bulkPricing?.length === 1 ? '' : 's'}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeFg }]}>{p.availability}</Text>
                  </View>
                  <Text style={[styles.stockText, p.totalStock < 5 && { color: '#D97706', fontWeight: '700' }]}>Stock {p.totalStock}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.rowActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                >
                  <Eye size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SellerProductForm', { product: p })}>
                  <Edit2 size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(p._id)} disabled={deleting === p._id}>
                  {deleting === p._id ? <ActivityIndicator size="small" /> : <Trash2 size={16} color="#FF0000" />}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: isDark ? '#111827' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },
  headerTitle: { fontSize: FontSizes.md, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
  headerSub: { fontSize: 11, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 2 },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FF0000', paddingHorizontal: 14, paddingVertical: 9, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: isDark ? '#111827' : '#fff',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },
  thumb: { width: 52, height: 52, borderRadius: BorderRadius.md, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  brandName: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
  price: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700, marginTop: 2 },
  moqText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  stockText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF' },
  rowActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
