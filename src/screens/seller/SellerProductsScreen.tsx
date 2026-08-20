import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, ScanLine, ListChecks, Package } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { GATEWAY_URL } from '../../api/endpoints';

// Ported from client/app/store/seller/page.tsx's groupSellerProductsByType +
// the default grid view of SellerProductsTab. The "brand management" inline
// view becomes its own pushed screen (SellerManageBrandsScreen) rather than
// a local state swap, matching how StoreManageBrandsScreen already works
// for the store-owner side.

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;

function resolveImageUri(url?: string) {
  if (!url) return undefined;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const base = API.replace(/\/api\/?$/, '');

  return url.startsWith('/')
    ? `${base}${url}`
    : `${base}/${url}`;
}

function getProductImage(p: any): string {
  return (
    p?.imageUrl ||
    p?.image ||
    p?.productImage ||
    p?.images?.[0] ||
    ''
  );
}

function groupByType(products: any[]) {
  const byTitle: Record<
    string,
    {
      title: string;
      image: string;
      category: string;
      items: any[];
    }
  > = {};

  for (const p of products) {
    const key = (p.title || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    if (!byTitle[key]) {
      byTitle[key] = {
        title: p.title,
        image: getProductImage(p),
        category: p.category || '',
        items: [],
      };
    }

    byTitle[key].items.push(p);

    // If the first product had no image, use the first
    // available image from another brand/product.
    if (!byTitle[key].image) {
      byTitle[key].image = getProductImage(p);
    }
  }

  return Object.values(byTitle).map(v => ({
    typeKey: v.title.toLowerCase().trim().replace(/\s+/g, ' '),
    title: v.title,
    image: v.image,
    category: v.category,
    items: v.items,
    brandCount: v.items.length,
    totalStock: v.items.reduce(
      (s, p) => s + (p.totalStock || 0),
      0
    ),
  }));
}

import { useAuth } from '../../context/AuthContext';

export default function SellerProductsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { products, refresh, loading } = useSellerDashboard();
  const [search, setSearch] = useState('');

  const isWholesaler = user?.role === 'whole_saler' || user?.role === 'wholesaler';

  const filtered = useMemo(
    () => products.filter((p: any) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );
  const productTypes = useMemo(() => groupByType(filtered), [filtered]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={15} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={isWholesaler ? 'Search wholesale catalog…' : 'Search artisan products…'}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SellerScanUpload')}>
          <ScanLine size={15} color="#fff" />
          <Text style={styles.actionBtnText}>Scan Paper</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SellerBulkScanUpload')}>
          <ListChecks size={15} color="#fff" />
          <Text style={styles.actionBtnText}>Scan List</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('SellerProductForm', {})}>
        <Plus size={15} color="#fff" />
        <Text style={styles.addBtnText}>
          {isWholesaler ? 'Add Wholesale Product' : 'Add Home Product'}
        </Text>
      </TouchableOpacity>


      <FlatList
        data={productTypes}
        keyExtractor={pt => pt.typeKey}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Package size={36} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>{products.length === 0 ? 'No products yet' : 'No results'}</Text>
            <Text style={styles.emptySub}>
              {products.length === 0 ? 'Add your first bulk product for store owners to order.' : 'Try a different search.'}
            </Text>
          </View>
        }
        renderItem={({ item: pt }) => {
          const img = resolveImageUri(pt.image);

  console.log('PRODUCT IMAGE DEBUG:', {
    title: pt.title,
    image: pt.image,
    resolved: img,
    items: pt.items,
  });
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('SellerManageBrands', { typeKey: pt.typeKey, title: pt.title, category: pt.category, items: pt.items, brandCount: pt.brandCount, totalStock: pt.totalStock })}
            >
              <View style={styles.cardImageWrap}>
                {img ? <Image source={{ uri: img }} style={styles.cardImage} /> : <Package size={30} color="#E5E7EB" />}
              </View>
              <View style={{ padding: Spacing.sm }}>
                <Text style={styles.cardCategory} numberOfLines={1}>{pt.category || '—'}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{pt.title}</Text>
                <Text style={styles.cardSub}>{pt.brandCount} Brand{pt.brandCount !== 1 ? 's' : ''}</Text>
                <Text style={styles.cardSub}>Total Stock: {pt.totalStock}</Text>
                <View style={styles.manageBtn}><Text style={styles.manageBtnText}>Manage Brands →</Text></View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  searchRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: FontSizes.sm, color: CustomerColors.black },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: 10, borderRadius: BorderRadius.md },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', marginHorizontal: Spacing.md, marginTop: Spacing.sm, paddingVertical: 12, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 6 },
  emptyTitle: { fontWeight: '700', fontSize: FontSizes.md, color: '#374151' },
  emptySub: { fontSize: FontSizes.sm, color: '#9CA3AF', textAlign: 'center' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, overflow: 'hidden', ...Shadows.card },
  cardImageWrap: { aspectRatio: 1, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  cardImage: { width: '100%', height: '100%' },
  cardCategory: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  cardSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  manageBtn: { marginTop: 8, backgroundColor: CustomerColors.teal600, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  manageBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
