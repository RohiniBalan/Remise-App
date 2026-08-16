import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Edit2, Trash2, Package } from 'lucide-react-native';
import { GATEWAY_URL } from '../../api/endpoints';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;
function resolveImageUri(url?: string) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API}${url}`;
}

const AVAILABILITY_STYLE: Record<string, { bg: string; fg: string }> = {
  'In Stock': { bg: '#F0FDF4', fg: '#15803D' },
  'Out Of Stock': { bg: '#FEF2F2', fg: '#FF0000' },
  'Pre Order': { bg: '#FFFBEB', fg: '#B45309' },
};

export default function SellerManageBrandsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title, category, items: initialItems, brandCount, totalStock } = route.params;
  const { refresh, products } = useSellerDashboard();
  const { token } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Re-derive from live `products` so edits/deletes reflect immediately,
  // falling back to the params snapshot passed in from SellerProductsScreen.
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
          return (
            <View style={styles.row}>
              <View style={styles.thumb}>
                {img ? <Image source={{ uri: img }} style={styles.thumbImg} /> : <Package size={20} color="#E5E7EB" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandName} numberOfLines={1}>{p.brand || 'Unbranded'}</Text>
                <Text style={styles.price}>₹{p.discountedPrice || p.price}</Text>
                <Text style={styles.moqText}>MOQ: {p.moq || 1} · {p.bulkPricing?.length || 0} tier{p.bulkPricing?.length === 1 ? '' : 's'}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: avail.bg }]}>
                    <Text style={[styles.badgeText, { color: avail.fg }]}>{p.availability}</Text>
                  </View>
                  <Text style={[styles.stockText, p.totalStock < 5 && { color: '#D97706', fontWeight: '700' }]}>Stock {p.totalStock}</Text>
                </View>
              </View>
              <View style={styles.rowActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SellerProductForm', { product: p })}>
                  <Edit2 size={16} color={CustomerColors.teal700} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerTitle: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.black },
  headerSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FF0000', paddingHorizontal: 14, paddingVertical: 9, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  thumb: { width: 52, height: 52, borderRadius: BorderRadius.md, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  brandName: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  price: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700, marginTop: 2 },
  moqText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  stockText: { fontSize: 10, color: '#9CA3AF' },
  rowActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
