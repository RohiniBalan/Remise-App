import React, { useState } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Search, Plus, Edit2, Trash2, Package, ScanLine, ListChecks } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { storeProductApi } from '../../api/storeProductApi';
import { scanProductImage, scanBulkProducts, buildGeneratedImageUrl } from '../../api/geminiScanApi';
import { emptyProductForm } from '../../utils/productForm';
import { BulkProductRow } from './StoreBulkProductScanScreen';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's ProductsTab — same
// search + category filter, same grid card fields (discount %, featured
// badge, availability/stock chips), same edit/delete actions. "Scan Paper"
// (SmartUploadModal, POST /api/smart-product-upload on web) calls Gemini
// directly from this app instead (see geminiScanApi.ts + endpoints.ts's
// GOOGLE_AI_API_KEY comment) since there's no mobile-reachable backend
// route for it. Scan result prefills StoreProductFormScreen the same way
// editing an existing product does — the store owner still reviews/edits
// before saving, same as web's review step.
export default function StoreProductsScreen() {
  const navigation = useNavigation<any>();
  const { products, categories, loading, refresh } = useStoreDashboard();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [scanning, setScanning] = useState(false);
  const [bulkScanning, setBulkScanning] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete this product?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(id);
          try {
            await storeProductApi.delete(id);
            refresh();
          } catch {
            Alert.alert('Error', 'Failed to delete product.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const runScan = async (base64: string, mimeType: string) => {
    setScanning(true);
    try {
      const extracted = await scanProductImage(base64, mimeType);
      navigation.navigate('ProductForm', {
        scanned: {
          title: extracted.productName,
          description: extracted.description,
          price: String(extracted.price || ''),
          discountedPrice: String(extracted.discountedPrice || ''),
          category: extracted.category,
          brand: extracted.brand,
          imageUrl: buildGeneratedImageUrl(extracted.productName, extracted.category), 
        },
      });
    } catch (err: any) {
      Alert.alert('Scan failed', err?.message || 'Could not read product details from that photo. Try Add Product to enter them manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleScanPress = () => {
    Alert.alert('Scan Paper', 'Take a photo of the product label, or choose one from your gallery.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.8 });
          const asset = res.assets?.[0];
          if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          const res = await launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.8, saveToPhotos: false });
          const asset = res.assets?.[0];
          if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
          else if (res.errorMessage) Alert.alert('Camera unavailable', res.errorMessage);
        },
      },
    ]);
  };

  // New, separate entry point from the single-photo scan above — reuses the
  // same gallery/camera picking pattern but calls scanBulkProducts (one
  // Gemini vision call returning an array of products) and hands the
  // resulting rows to the new StoreBulkProductScanScreen for review, instead
  // of prefilling the single ProductForm.
  const runBulkScan = async (base64: string, mimeType: string) => {
  setBulkScanning(true);
  try {
    const extracted = await scanBulkProducts(base64, mimeType);
    if (extracted.length === 0) {
      Alert.alert('No products found', 'Could not read any product names from that image.');
      return;
    }
    const scanned: BulkProductRow[] = [];
    for (let i = 0; i < extracted.length; i++) {
      const p = extracted[i];
      const url = buildGeneratedImageUrl(p.productName, p.category, i);
      // Wait for THIS image to actually finish loading before starting the next one —
      // mirrors web's sequential `for...await` loop in smart-bulk-product-scan/route.ts,
      // avoiding a burst of simultaneous requests to Pollinations.
      await new Promise<void>(resolve => {
        Image.prefetch(url).then(() => resolve()).catch(() => resolve());
      });
      scanned.push({
        id: `${Date.now()}-${i}`,
        ...emptyProductForm({
          title: p.productName,
          description: p.description,
          price: p.price || '',
          discountedPrice: p.discountedPrice || '',
          category: p.category,
          brand: p.brand,
        }),
        imageUrl: url,
      });
    }
    navigation.navigate('BulkProductScan', { scanned });
  } catch (err: any) {
    Alert.alert('Scan failed', err?.message || 'Could not read products from that photo. Try Add Product to enter them manually.');
  } finally {
    setBulkScanning(false);
  }
};

  const handleBulkScanPress = () => {
    Alert.alert('Scan Product List', 'Take a photo of the grocery list, invoice, or handwritten list, or choose one from your gallery.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.8 });
          const asset = res.assets?.[0];
          if (asset?.base64) runBulkScan(asset.base64, asset.type || 'image/jpeg');
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          const res = await launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.8, saveToPhotos: false });
          const asset = res.assets?.[0];
          if (asset?.base64) runBulkScan(asset.base64, asset.type || 'image/jpeg');
          else if (res.errorMessage) Alert.alert('Camera unavailable', res.errorMessage);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.teal700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={14} color={CustomerColors.textSecondary} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search products…" />
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={handleScanPress} disabled={scanning}>
          {scanning ? <ActivityIndicator size="small" color="#fff" /> : <ScanLine size={16} color="#fff" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanBtn} onPress={handleBulkScanPress} disabled={bulkScanning}>
          {bulkScanning ? <ActivityIndicator size="small" color="#fff" /> : <ListChecks size={16} color="#fff" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProductForm', {})}>
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => p._id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={40} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>{products.length === 0 ? 'No products found' : 'No results'}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('ProductForm', {})}>
              <Text style={styles.emptyBtnText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: p }) => {
          const img = p.imageUrl || p.images?.[0];
          const discountPct = p.discountedPrice && p.price > 0 ? Math.round((1 - p.discountedPrice / p.price) * 100) : 0;
          return (
            <View style={styles.card}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: img }} style={styles.image} />
                {discountPct > 0 && <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>{discountPct}% OFF</Text></View>}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.category}>{p.category || '—'}</Text>
                <Text style={styles.title} numberOfLines={1}>{p.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{p.discountedPrice || p.price}</Text>
                  {p.discountedPrice ? <Text style={styles.originalPrice}>₹{p.price}</Text> : null}
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.availability}>{p.availability}</Text>
                  <Text style={[styles.stock, p.totalStock < 5 && styles.stockLow]}>{p.totalStock} in stock</Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ProductForm', { product: p })}>
                    <Edit2 size={13} color={CustomerColors.teal700} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p._id)} disabled={deleting === p._id}>
                    <Trash2 size={13} color={CustomerColors.primary} />
                  </TouchableOpacity>
                </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  toolbar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  scanBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.teal600, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  emptyBtn: { backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  card: { width: '48%', backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, overflow: 'hidden', marginBottom: Spacing.sm },
  imageWrap: { aspectRatio: 1, backgroundColor: '#F5F5F5', padding: Spacing.sm },
  image: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: CustomerColors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardBody: { padding: Spacing.sm },
  category: { fontSize: 10, color: CustomerColors.textSecondary },
  title: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.teal700 },
  originalPrice: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  availability: { fontSize: 9, fontWeight: '700', color: CustomerColors.success },
  stock: { fontSize: 9, color: CustomerColors.textSecondary },
  stockLow: { color: '#D97706', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: Spacing.sm },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, backgroundColor: CustomerColors.bg, borderRadius: BorderRadius.sm },
});
