import React, { useState } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Search, Plus, Edit2, Trash2, Package, ScanLine, ListChecks, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { storeProductApi } from '../../api/storeProductApi';
import { scanProductImage, scanBulkProducts, buildGeneratedImageUrl } from '../../api/geminiScanApi';
import { emptyProductForm } from '../../utils/productForm';
import { BulkProductRow } from './StoreBulkProductScanScreen';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { groupProductsByType } from '../../utils/groupProducts';

export default function StoreProductsScreen() {
  const navigation = useNavigation<any>();
  const { products, categories, loading, refresh } = useStoreDashboard();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [scanning, setScanning] = useState(false);
  const [bulkScanning, setBulkScanning] = useState(false);
  const [scanModalType, setScanModalType] = useState<'single' | 'bulk' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);


  const filtered = products.filter(p => {
  const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase());
  const matchCat = !catFilter || p.category === catFilter;
  return matchSearch && matchCat;
});

const productTypes = groupProductsByType(filtered);

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

  const handleCameraScan = async () => {
    const isSingle = scanModalType === 'single';
    setScanModalType(null);
    const res = await launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.8, saveToPhotos: false });
    const asset = res.assets?.[0];
    if (asset?.base64) {
      if (isSingle) runScan(asset.base64, asset.type || 'image/jpeg');
      else runBulkScan(asset.base64, asset.type || 'image/jpeg');
    } else if (res.errorMessage) {
      Alert.alert('Camera unavailable', res.errorMessage);
    }
  };

  const handleGalleryScan = async () => {
    const isSingle = scanModalType === 'single';
    setScanModalType(null);
    const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.8 });
    const asset = res.assets?.[0];
    if (asset?.base64) {
      if (isSingle) runScan(asset.base64, asset.type || 'image/jpeg');
      else runBulkScan(asset.base64, asset.type || 'image/jpeg');
    }
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
        <TouchableOpacity style={styles.scanBtn} onPress={() => setScanModalType('single')} disabled={scanning}>
          {scanning ? <ActivityIndicator size="small" color="#fff" /> : <ScanLine size={16} color="#fff" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanBtn} onPress={() => setScanModalType('bulk')} disabled={bulkScanning}>
          {bulkScanning ? <ActivityIndicator size="small" color="#fff" /> : <ListChecks size={16} color="#fff" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProductForm', {})}>
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>


      <FlatList
  data={productTypes}
  keyExtractor={pt => pt.typeKey}
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
  renderItem={({ item: pt }) => {
    const brandRows = pt.items
      .map((p: any) => ({ brand: p.brand || 'Unbranded', stock: p.totalStock || 0 }))
      .sort((a: any, b: any) => b.stock - a.stock);
    const visibleBrands = brandRows.slice(0, 3);
    const extraCount = brandRows.length - visibleBrands.length;

    return (
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {pt.image ? <Image source={{ uri: pt.image }} style={styles.image} /> : <Package size={28} color="#E5E7EB" />}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.category}>{pt.category || '—'}</Text>
          <Text style={styles.title} numberOfLines={1}>{pt.title}</Text>
          <Text style={styles.brandCountText}>{pt.brandCount} Brand{pt.brandCount !== 1 ? 's' : ''}</Text>
          <Text style={styles.stock}>Total Stock: {pt.totalStock}</Text>

          <View style={styles.brandList}>
            {visibleBrands.map((b: any, i: number) => (
              <View key={i} style={styles.brandRow}>
                <Text style={styles.brandRowName} numberOfLines={1}>{b.brand}</Text>
                <Text style={[styles.brandRowStock, b.stock < 5 && styles.stockLow]}>{b.stock}</Text>
              </View>
            ))}
            {extraCount > 0 && <Text style={styles.moreText}>+{extraCount} more</Text>}
          </View>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => navigation.navigate('ManageBrands', { typeKey: pt.typeKey, title: pt.title, category: pt.category, items: pt.items, brandCount: pt.brandCount, totalStock: pt.totalStock })}
          >
            <Text style={styles.manageBtnText}>Manage Brands →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }}
/>

      {/* Camera & Scan Modal */}
      <Modal visible={Boolean(scanModalType)} transparent animationType="fade" onRequestClose={() => setScanModalType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                {scanModalType === 'bulk' ? (
                  <ListChecks size={20} color={CustomerColors.teal600} />
                ) : (
                  <ScanLine size={20} color={CustomerColors.teal600} />
                )}
                <Text style={styles.modalTitle}>
                  {scanModalType === 'bulk' ? 'Scan Product List' : 'Scan Paper Label'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setScanModalType(null)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {scanModalType === 'bulk'
                ? 'Take a photo of the grocery list, invoice, or handwritten list, or choose from gallery.'
                : 'Take a clear photo of the product label or choose from gallery.'}
            </Text>

            <TouchableOpacity style={styles.cameraActionBtn} onPress={handleCameraScan}>
              <Camera size={18} color="#fff" />
              <Text style={styles.cameraActionBtnText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.galleryActionBtn} onPress={handleGalleryScan}>
              <ImageIcon size={18} color={CustomerColors.teal700} />
              <Text style={styles.galleryActionBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  brandCountText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 4 },
  brandList: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F5F5F5', gap: 2 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between' },
  brandRowName: { fontSize: 11, color: '#4B5563', flex: 1, paddingRight: 6 },
  brandRowStock: { fontSize: 11, fontWeight: '700', color: '#374151' },
  moreText: { fontSize: 11, color: CustomerColors.textSecondary },
  manageBtn: { marginTop: Spacing.sm, backgroundColor: CustomerColors.teal600, paddingVertical: 8, borderRadius: BorderRadius.sm, alignItems: 'center' },
  manageBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  cameraActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  cameraActionBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: CustomerColors.steelBorder },
  orText: { fontSize: 11, color: CustomerColors.textSecondary, fontWeight: '600' },
  galleryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  galleryActionBtnText: { color: CustomerColors.teal700, fontSize: FontSizes.sm, fontWeight: '700' },
});
