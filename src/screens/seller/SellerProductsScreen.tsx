import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, ScanLine, ListChecks, Package, Camera, ImageIcon, X } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import { requestCameraPermission } from '../../utils/permissions';
import { sellerAiApi } from '../../api/sellerApi';

function getProductImage(p: any): string {
  const raw =
    p?.images?.[0] ||
    p?.imageUrl ||
    p?.image ||
    p?.productImage ||
    '';
  return resolveImageUrl(raw) || '';
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
    stockUnit: v.items.find((p: any) => p.stockUnit || p.unit)?.stockUnit || v.items.find((p: any) => p.stockUnit || p.unit)?.unit || 'Count',
    totalStock: v.items.reduce(
      (s: number, p: any) => s + (p.totalStock || 0),
      0,
    ),
  }));
}

export default function SellerProductsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { products, refresh, loading } = useSellerDashboard();
  const [search, setSearch] = useState('');
  const [scanModalType, setScanModalType] = useState<'single' | 'bulk' | null>(null);
  const [scanning, setScanning] = useState(false);

  const isWholesaler = user?.role === 'whole_saler' || user?.role === 'wholesaler';

  const filtered = useMemo(
    () => products.filter((p: any) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );
  const productTypes = useMemo(() => groupByType(filtered), [filtered]);

  const handleScanSingle = async (asset: any) => {
    if (!asset?.uri) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', {
        uri: asset.uri,
        name: asset.fileName || 'product.jpg',
        type: asset.type || 'image/jpeg',
      } as any);

      const res = await sellerAiApi.scanSingleProduct(fd);
      if (!res.data.success) throw new Error(res.data.message || 'Scan failed.');
      const ext = res.data.extracted;
      navigation.navigate('SellerProductForm', {
        scanned: {
          title: ext.productName || '',
          category: ext.category || '',
          subcategory: ext.subcategory || '',
          price: ext.price ? String(ext.price) : '',
          discountedPrice: ext.discountedPrice ? String(ext.discountedPrice) : '',
          storePrice: ext.storePrice ? String(ext.storePrice) : '',
          storeDiscountedPrice: ext.storeDiscountedPrice ? String(ext.storeDiscountedPrice) : '',
          description: ext.description || '',
          brand: ext.brand || '',
          imageUrl: ext.imageUrl || '',
          stockUnit: ext.stockUnit || ext.unit || 'Count',
          unit: ext.stockUnit || ext.unit || 'Count',
          availability: 'In Stock',
          attributes: ext.attributes || {},
          specifications: ext.specifications || [],
        },
      });
    } catch (err: any) {
      Alert.alert('Scan Failed', err?.message || 'Could not detect product details from that image. Opening form to enter manually.', [
        { text: 'OK', onPress: () => navigation.navigate('SellerProductForm', {}) },
      ]);
    } finally {
      setScanning(false);
      setScanModalType(null);
    }
  };

  const handleCamera = async () => {
    const isSingle = scanModalType === 'single';
    setScanModalType(null);
    const granted = await requestCameraPermission();
    if (!granted) return;

    if (!isSingle) {
      navigation.navigate('SellerBulkScanUpload');
      return;
    }

    const res = await launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    if (res.didCancel || res.errorCode) return;
    const picked = res.assets?.[0];
    if (picked) {
      handleScanSingle(picked);
    }
  };

  const handleGallery = async () => {
    const isSingle = scanModalType === 'single';
    setScanModalType(null);

    if (!isSingle) {
      navigation.navigate('SellerBulkScanUpload');
      return;
    }

    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    if (res.didCancel || res.errorCode) return;
    const picked = res.assets?.[0];
    if (picked) {
      handleScanSingle(picked);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={15} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={isWholesaler ? 'Search wholesale catalog…' : 'Search artisan products…'}
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setScanModalType('single')} disabled={scanning}>
          {scanning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <ScanLine size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Scan Paper</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SellerBulkScanUpload')} disabled={scanning}>
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
            <Package size={36} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>{products.length === 0 ? 'No products yet' : 'No results'}</Text>
            <Text style={styles.emptySub}>
              {products.length === 0 ? 'Add your first bulk product for store owners to order.' : 'Try a different search.'}
            </Text>
          </View>
        }
        renderItem={({ item: pt }) => {
          const img = resolveImageUrl(pt.image);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('SellerManageBrands', { typeKey: pt.typeKey, title: pt.title, category: pt.category, items: pt.items, brandCount: pt.brandCount, totalStock: pt.totalStock, stockUnit: (pt as any).stockUnit })}
            >
              <View style={styles.cardImageWrap}>
                {img ? <Image source={{ uri: img }} style={styles.cardImage} /> : <Package size={30} color={isDark ? '#4B5563' : '#E5E7EB'} />}
              </View>
              <View style={{ padding: Spacing.sm }}>
                <Text style={styles.cardCategory} numberOfLines={1}>{pt.category || '—'}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{pt.title}</Text>
                <Text style={styles.cardSub}>{pt.brandCount} Brand{pt.brandCount !== 1 ? 's' : ''}</Text>
                <Text style={styles.cardSub}>Total Stock: {pt.totalStock} {(pt as any).stockUnit || 'Count'}</Text>
                <View style={styles.manageBtn}><Text style={styles.manageBtnText}>Manage Brands →</Text></View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Scan Modal */}
      <Modal visible={Boolean(scanModalType)} transparent animationType="fade" onRequestClose={() => setScanModalType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <ScanLine size={20} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
                <Text style={styles.modalTitle}>Scan Paper Label</Text>
              </View>
              <TouchableOpacity onPress={() => setScanModalType(null)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Take a clear photo of the product label/packaging or choose from gallery to auto-detect details.
            </Text>

            <TouchableOpacity style={styles.cameraActionBtn} onPress={handleCamera}>
              <Camera size={18} color="#fff" />
              <Text style={styles.cameraActionBtnText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.galleryActionBtn} onPress={handleGallery}>
              <ImageIcon size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={styles.galleryActionBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  searchRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: isDark ? '#111827' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: 10, borderRadius: BorderRadius.md },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', marginHorizontal: Spacing.md, marginTop: Spacing.sm, paddingVertical: 12, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 6 },
  emptyTitle: { fontWeight: '700', fontSize: FontSizes.md, color: isDark ? '#FFFFFF' : '#374151' },
  emptySub: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : '#9CA3AF', textAlign: 'center' },
  card: {
    width: '48%',
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    overflow: 'hidden',
    ...Shadows.card,
  },
  cardImageWrap: { aspectRatio: 1, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  cardImage: { width: '100%', height: '100%' },
  cardCategory: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', marginBottom: 2 },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black },
  cardSub: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 },
  manageBtn: { marginTop: 8, backgroundColor: CustomerColors.teal600, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  manageBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },
  modalSub: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  cameraActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: CustomerColors.teal600,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  cameraActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? '#374151' : '#E5E7EB',
  },
  orText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  galleryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: isDark ? '#1F2937' : '#F0FDF4',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#BBF7D0',
  },
  galleryActionBtnText: {
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});
