import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  ImageIcon,
  ListChecks,
  Camera,
  Check,
  ChevronDown,
  X,
  AlertTriangle,
} from 'lucide-react-native';
import { getCategories, getSubcategories } from '../../utils/categoryAttributes';
import { STOCK_UNIT_OPTIONS } from '../../utils/productForm';
import { useOptionalSellerDashboard } from '../../context/SellerDashboardContext';
import { useOptionalStoreDashboard } from '../../context/StoreDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { requestCameraPermission } from '../../utils/permissions';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';

type Row = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  price: string;
  discountedPrice: string;
  description: string;
  brand: string;
  imageUrl: string;
  totalStock: string;
  stockUnit: string;
  unit: string;
  availability: string;
  tags: string;
  moq: string;
};

type FailedItem = { name: string; reason: string };
type Step = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error';

const blankRow = (overrides: Partial<Row> = {}): Row => ({
  id: `${Date.now()}-${Math.random()}`,
  title: '',
  category: '',
  subcategory: '',
  price: '',
  discountedPrice: '',
  description: '',
  brand: '',
  imageUrl: '',
  totalStock: '10',
  stockUnit: 'Count',
  unit: 'Count',
  availability: 'In Stock',
  tags: '',
  moq: '1',
  ...overrides,
});

// Helper to extract price & clean title if price is embedded in the title string
function parseTitleAndPrice(rawTitle: string, explicitPrice?: number | string) {
  let priceStr = explicitPrice !== undefined && explicitPrice !== '' && Number(explicitPrice) > 0 ? String(explicitPrice) : '';
  let cleanTitle = (rawTitle || '').trim();

  if (!priceStr && cleanTitle) {
    const match =
      cleanTitle.match(/[-–—:]\s*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)/i) ||
      cleanTitle.match(/(?:₹|Rs\.?|INR)\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      priceStr = match[1];
      cleanTitle = cleanTitle
        .replace(/[-–—:]\s*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)/i, '')
        .replace(/(?:₹|Rs\.?|INR)\s*(\d+(?:\.\d+)?)/i, '')
        .trim();
    }
  }
  return { cleanTitle, priceStr };
}

interface BulkScanUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function BulkScanUploadModal({
  visible,
  onClose,
  onRefresh,
}: BulkScanUploadModalProps) {
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const sellerCtx = useOptionalSellerDashboard();
  const storeCtx = useOptionalStoreDashboard();
  const { user } = useAuth();
  const isStoreOwner = user?.role === 'store_owner';

  const store = sellerCtx?.store || storeCtx?.store;
  const categories = sellerCtx?.categories || storeCtx?.categories;
  const refresh = sellerCtx?.refresh || storeCtx?.refresh;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [initialExtractedRows, setInitialExtractedRows] = useState<Row[]>([]);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [summary, setSummary] = useState<{ added: number; failed: FailedItem[] }>({
    added: 0,
    failed: [],
  });
  const [activeCategoryRowId, setActiveCategoryRowId] = useState<string | null>(null);
  const [activeSubcategoryRowId, setActiveSubcategoryRowId] = useState<string | null>(null);
  const [activeStockUnitRowId, setActiveStockUnitRowId] = useState<string | null>(null);
  const [isCustomSubRows, setIsCustomSubRows] = useState<Record<string, boolean>>({});
  const [customSubs, setCustomSubs] = useState<Record<string, string>>({});

  // Validation Error Modal
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const categoryOptions = useMemo(() => {
    const predefined = getCategories();
    const dynamic = (categories || []).map((c: any) => c.name).filter(Boolean);
    return Array.from(new Set([...predefined, ...dynamic]));
  }, [categories]);

  const reset = () => {
    setAsset(null);
    setStep('idle');
    setErrMsg('');
    setRows([]);
    setInitialExtractedRows([]);
    setFailedItems([]);
    setIsCustomSubRows({});
    setCustomSubs({});
    setValidationErrors(null);
  };

  const handleModalClose = () => {
    reset();
    onClose();
  };

  const handleRefresh = () => {
    if (initialExtractedRows.length > 0) {
      setRows(JSON.parse(JSON.stringify(initialExtractedRows)));
      setErrMsg('');
    }
  };

  const setRow = (id: string, k: keyof Row, v: string) =>
    setRows(rs => rs.map(r => (r.id === id ? { ...r, [k]: v } : r)));

  const removeRow = (id: string) => setRows(rs => rs.filter(r => r.id !== id));

  const addManually = (name: string) => {
    setRows(rs => [...rs, blankRow({ title: name })]);
    setFailedItems(items => items.filter(i => i.name !== name));
  };

  const pickImage = async (fromCamera: boolean) => {
    if (fromCamera) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }
    const res = fromCamera
      ? await launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    if (res.didCancel || res.errorCode) return;
    const picked = res.assets?.[0];
    if (picked) {
      setAsset(picked);
      executeScan(picked);
    }
  };

  const executeScan = async (pickedAsset: Asset) => {
    if (!pickedAsset?.uri) return;
    setStep('scanning');
    setErrMsg('');
    try {
      const fd = new FormData();
      fd.append('image', {
        uri: pickedAsset.uri,
        name: pickedAsset.fileName || 'list.jpg',
        type: pickedAsset.type || 'image/jpeg',
      } as any);

      const res = await sellerAiApi.scanProductList(fd);
      if (!res.data?.success) throw new Error(res.data?.message || 'Scan failed.');

      const customSubMap: Record<string, boolean> = {};
      const customSubValueMap: Record<string, string> = {};

      const newRows: Row[] = (res.data.products || []).map(p => {
        const { cleanTitle, priceStr } = parseTitleAndPrice(p.productName || '', p.price);
        const cat = p.category || '';
        const rawSub = p.subcategory || '';
        const validSubs = cat ? getSubcategories(cat) : [];
        const isCustom = rawSub && !validSubs.includes(rawSub);

        const row = blankRow({
          title: cleanTitle || p.productName || '',
          price: priceStr,
          discountedPrice: p.discountedPrice ? String(p.discountedPrice) : '',
          category: cat,
          subcategory: isCustom ? 'Other' : rawSub,
          description: p.description || '',
          brand: p.brand || '',
          imageUrl: p.imageUrl || '',
          totalStock: p.totalStock !== undefined ? String(p.totalStock) : '10',
          stockUnit: p.stockUnit || p.unit || 'Count',
          unit: p.stockUnit || p.unit || 'Count',
          moq: (p as any).moq ? String((p as any).moq) : '1',
        });

        if (isCustom) {
          customSubMap[row.id] = true;
          customSubValueMap[row.id] = rawSub;
        }
        return row;
      });

      setIsCustomSubRows(customSubMap);
      setCustomSubs(customSubValueMap);
      setRows(newRows);
      setInitialExtractedRows(JSON.parse(JSON.stringify(newRows)));
      setFailedItems(res.data.failed || []);
      setStep('review');
    } catch (err: any) {
      setErrMsg(err.message || 'Something went wrong while scanning the image.');
      setStep('error');
    }
  };

  const createOneProduct = async (row: Row) => {
    const tags = (row.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const catList = await storeProductApi.getCategories();
    const existing = (catList.data?.data || []).find(
      (c: any) => c.name.toLowerCase() === (row.category || '').toLowerCase(),
    );
    if (!existing && row.category) await storeProductApi.createCategory(row.category);

    const finalSubcategory = isCustomSubRows[row.id]
      ? customSubs[row.id]?.trim() || ''
      : row.subcategory === 'Other'
      ? ''
      : row.subcategory || '';

    const fd = new FormData();
    fd.append('title', row.title.trim());
    fd.append('price', String(+row.price));
    fd.append('discountedPrice', String(row.discountedPrice ? +row.discountedPrice : +row.price));
    fd.append('category', row.category || 'General');
    if (finalSubcategory) fd.append('subcategory', finalSubcategory);
    fd.append('brand', row.brand || 'Generic');
    fd.append('description', row.description || '');
    fd.append('imageUrl', row.imageUrl || '');
    fd.append('images', JSON.stringify(row.imageUrl ? [row.imageUrl] : []));
    fd.append('totalStock', String(row.totalStock ? +row.totalStock : 0));
    fd.append('stockUnit', row.stockUnit || 'Count');
    fd.append('unit', row.stockUnit || 'Count');
    fd.append('availability', row.availability || 'In Stock');
    fd.append('tags', JSON.stringify(tags));
    fd.append('moq', String(row.moq ? +row.moq : 1));
    if (store?._id) fd.append('storeId', store._id);

    return storeProductApi.create(fd);
  };

  const handleAddAll = async () => {
    if (rows.length === 0) return;

    // Upfront validation
    const errors: string[] = [];
    rows.forEach((row, i) => {
      const missing: string[] = [];
      if (!row.title?.trim()) missing.push('Product Title');
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0)
        missing.push('Price (> ₹0)');
      if (
        row.totalStock === undefined ||
        row.totalStock === '' ||
        isNaN(Number(row.totalStock)) ||
        Number(row.totalStock) < 0
      )
        missing.push('Stock Quantity (>= 0)');
      if (missing.length > 0) {
        errors.push(`Item #${i + 1} "${row.title || 'Untitled'}": Missing ${missing.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStep('saving');
    let added = 0;
    const failed: FailedItem[] = [];
    for (const r of rows) {
      try {
        await createOneProduct(r);
        added++;
      } catch (err: any) {
        failed.push({ name: r.title, reason: err?.response?.data?.message || 'Failed to save product' });
      }
    }
    setSummary({ added, failed });
    setStep('done');
    if (refresh) refresh();
    if (onRefresh) onRefresh();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <ListChecks size={20} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
              <Text style={styles.headerTitle}>Scan Product List</Text>
            </View>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn}>
              <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── STEP 1: Idle (Select / Capture Image) ── */}
            {step === 'idle' && (
              <View style={styles.idleWrap}>
                <Text style={styles.helperText}>
                  Take a photo of a grocery list, invoice, or handwritten list (up to 10 products), or pick from your gallery.
                </Text>

                <TouchableOpacity style={styles.cameraBigBtn} onPress={() => pickImage(true)}>
                  <Camera size={22} color="#FFFFFF" />
                  <Text style={styles.cameraBigBtnText}>Take Photo with Camera</Text>
                </TouchableOpacity>

                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
                  <ImageIcon size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2: Scanning / Extracting ── */}
            {step === 'scanning' && (
              <View style={styles.scanningWrap}>
                <View style={styles.loadingSpinnerWrap}>
                  <ActivityIndicator size="large" color={CustomerColors.teal600} />
                </View>
                <Text style={styles.scanningTitle}>Extracting Products…</Text>
                <Text style={styles.scanningSub}>
                  Reading items, categories, and prices from your list image...
                </Text>
              </View>
            )}

            {/* ── STEP 3: Error ── */}
            {step === 'error' && (
              <View style={styles.errorWrap}>
                <AlertCircle size={32} color="#DC2626" />
                <Text style={styles.errorTitle}>Scan Failed</Text>
                <Text style={styles.errorMsg}>{errMsg}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={reset}>
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 4: Review Extracted Items ── */}
            {(step === 'review' || step === 'saving') && (
              <View style={styles.reviewWrap}>
                <View style={styles.reviewBanner}>
                  <Sparkles size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={styles.reviewBannerText}>
                    Extracted {rows.length} product{rows.length === 1 ? '' : 's'} — fill in any missing details
                  </Text>
                  <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
                    <RefreshCw size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.refreshBtnText}>Reset</Text>
                  </TouchableOpacity>
                </View>

                {rows.map((row, idx) => (
                  <View key={row.id} style={styles.rowCard}>
                    <View style={styles.rowThumb}>
                      {row.imageUrl ? (
                        <Image source={{ uri: resolveImageUrl(row.imageUrl) }} style={styles.rowThumbImg} />
                      ) : (
                        <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF' }}>#{idx + 1}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.rowTitleLine}>
                        <TextInput
                          style={[styles.smallInput, { flex: 1, fontWeight: '700' }]}
                          value={row.title}
                          onChangeText={(v: string) => setRow(row.id, 'title', v)}
                          placeholder="Product Title *"
                          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        />
                        <TouchableOpacity onPress={() => removeRow(row.id)} style={{ padding: 4 }}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.rowGrid}>
                        <TextInput
                          style={[styles.smallInput, { flex: 1.1 }]}
                          value={row.price}
                          onChangeText={(v: string) => setRow(row.id, 'price', v)}
                          placeholder="Price ₹ *"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        />
                        <TextInput
                          style={[styles.smallInput, { flex: 1 }]}
                          value={row.totalStock}
                          onChangeText={(v: string) => setRow(row.id, 'totalStock', v)}
                          placeholder="Stock Qty *"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        />
                        <TouchableOpacity
                          style={[styles.smallInput, { flex: 1, justifyContent: 'center' }]}
                          onPress={() => setActiveStockUnitRowId(row.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text
                              style={{
                                fontSize: 11,
                                color: isDark ? '#FFFFFF' : CustomerColors.black,
                                fontWeight: '600',
                              }}
                              numberOfLines={1}
                            >
                              {row.stockUnit || 'Count'}
                            </Text>
                            <ChevronDown size={12} color={isDark ? '#94A3B8' : CustomerColors.textSecondary} />
                          </View>
                        </TouchableOpacity>
                        {!isStoreOwner && (
                          <TextInput
                            style={[styles.smallInput, { flex: 0.8 }]}
                            value={row.moq}
                            onChangeText={(v: string) => setRow(row.id, 'moq', v)}
                            placeholder="MOQ"
                            keyboardType="numeric"
                            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                          />
                        )}
                      </View>

                      <View style={styles.rowGrid}>
                        <TouchableOpacity
                          style={[styles.smallInput, { flex: 1, justifyContent: 'center' }]}
                          onPress={() => setActiveCategoryRowId(row.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text
                              style={{
                                fontSize: 11,
                                color: isDark ? '#FFFFFF' : CustomerColors.black,
                                fontWeight: '600',
                              }}
                              numberOfLines={1}
                            >
                              {row.category || 'Category'}
                            </Text>
                            <ChevronDown size={12} color={isDark ? '#94A3B8' : CustomerColors.textSecondary} />
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.smallInput, { flex: 1, justifyContent: 'center' }]}
                          onPress={() => setActiveSubcategoryRowId(row.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text
                              style={{
                                fontSize: 11,
                                color: isDark ? '#FFFFFF' : CustomerColors.black,
                                fontWeight: '600',
                              }}
                              numberOfLines={1}
                            >
                              {isCustomSubRows[row.id]
                                ? customSubs[row.id] || 'Custom'
                                : row.subcategory || 'Subcategory'}
                            </Text>
                            <ChevronDown size={12} color={isDark ? '#94A3B8' : CustomerColors.textSecondary} />
                          </View>
                        </TouchableOpacity>

                        <TextInput
                          style={[styles.smallInput, { flex: 1 }]}
                          value={row.brand}
                          onChangeText={(v: string) => setRow(row.id, 'brand', v)}
                          placeholder="Brand"
                          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.addRowBtn} onPress={() => addManually('')}>
                  <Plus size={14} color={CustomerColors.teal700} />
                  <Text style={styles.addRowBtnText}>Add Another Product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitAllBtn, step === 'saving' && { opacity: 0.7 }]}
                  onPress={handleAddAll}
                  disabled={step === 'saving' || rows.length === 0}
                >
                  {step === 'saving' ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitAllBtnText}>
                      Add {rows.length} Product{rows.length === 1 ? '' : 's'} to Store
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 5: Done State ── */}
            {step === 'done' && (
              <View style={styles.doneWrap}>
                <View style={styles.doneIconBox}>
                  <CheckCircle2 size={40} color="#15803D" />
                </View>
                <Text style={styles.doneTitle}>
                  {summary.added} product{summary.added === 1 ? '' : 's'} added successfully!
                </Text>
                {summary.failed.length > 0 && (
                  <View style={styles.failedBox}>
                    <Text style={styles.failedBoxTitle}>Could not add {summary.failed.length} item(s):</Text>
                    {summary.failed.map((f, i) => (
                      <Text key={i} style={styles.failedBoxItem}>• {f.name}: {f.reason}</Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity style={styles.doneCloseBtn} onPress={handleModalClose}>
                  <Text style={styles.doneCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* ── Enhanced Incomplete Details Modal ── */}
      {validationErrors && (
        <Modal visible={Boolean(validationErrors)} transparent animationType="fade">
          <View style={styles.validationOverlay}>
            <View style={styles.validationCard}>
              <View style={styles.validationIconCircle}>
                <AlertTriangle size={24} color="#D97706" />
              </View>
              <Text style={styles.validationTitle}>Incomplete Product Details</Text>
              <Text style={styles.validationSubtitle}>
                Please fill in the required fields before adding products:
              </Text>
              <ScrollView style={{ maxHeight: 180, width: '100%', marginVertical: Spacing.sm }}>
                {validationErrors.map((err, i) => (
                  <View key={i} style={styles.validationErrorItem}>
                    <View style={styles.validationErrorDot} />
                    <Text style={styles.validationErrorText}>{err}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.validationBtn}
                onPress={() => setValidationErrors(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.validationBtnText}>Got it, let me fill them</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Category Dropdown Modal */}
      {activeCategoryRowId && (
        <Modal visible={Boolean(activeCategoryRowId)} transparent animationType="fade">
          <TouchableOpacity
            style={styles.selectOverlay}
            activeOpacity={1}
            onPress={() => setActiveCategoryRowId(null)}
          >
            <View style={styles.selectSheet}>
              <Text style={styles.selectTitle}>Select Category</Text>
              <FlatList
                data={categoryOptions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={() => {
                      setRow(activeCategoryRowId, 'category', item);
                      setRow(activeCategoryRowId, 'subcategory', '');
                      setActiveCategoryRowId(null);
                    }}
                  >
                    <Text style={styles.selectItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Subcategory Dropdown Modal */}
      {activeSubcategoryRowId && (
        <Modal visible={Boolean(activeSubcategoryRowId)} transparent animationType="fade">
          <TouchableOpacity
            style={styles.selectOverlay}
            activeOpacity={1}
            onPress={() => setActiveSubcategoryRowId(null)}
          >
            <View style={styles.selectSheet}>
              <Text style={styles.selectTitle}>Select Subcategory</Text>
              <FlatList
                data={
                  rows.find(r => r.id === activeSubcategoryRowId)?.category
                    ? getSubcategories(rows.find(r => r.id === activeSubcategoryRowId)!.category)
                    : []
                }
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={() => {
                      setRow(activeSubcategoryRowId, 'subcategory', item);
                      setActiveSubcategoryRowId(null);
                    }}
                  >
                    <Text style={styles.selectItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Stock Unit Dropdown Modal */}
      {activeStockUnitRowId && (
        <Modal visible={Boolean(activeStockUnitRowId)} transparent animationType="fade">
          <TouchableOpacity
            style={styles.selectOverlay}
            activeOpacity={1}
            onPress={() => setActiveStockUnitRowId(null)}
          >
            <View style={styles.selectSheet}>
              <Text style={styles.selectTitle}>Select Unit</Text>
              <FlatList
                data={STOCK_UNIT_OPTIONS}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={() => {
                      setRow(activeStockUnitRowId, 'stockUnit', item);
                      setRow(activeStockUnitRowId, 'unit', item);
                      setActiveStockUnitRowId(null);
                    }}
                  >
                    <Text style={styles.selectItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </Modal>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '90%',
      minHeight: 380,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#E5E7EB',
    },
    headerTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    idleWrap: {
      gap: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    helperText: {
      fontSize: FontSizes.xs + 1,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      lineHeight: 18,
    },
    cameraBigBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: CustomerColors.teal600,
      paddingVertical: 14,
      borderRadius: BorderRadius.md,
      marginTop: 4,
    },
    cameraBigBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: FontSizes.sm,
    },
    orDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
    },
    orText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textTransform: 'uppercase',
    },
    galleryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
      borderWidth: 1.5,
      borderColor: isDark ? '#374151' : CustomerColors.teal600,
      paddingVertical: 13,
      borderRadius: BorderRadius.md,
    },
    galleryBtnText: {
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      fontWeight: '700',
      fontSize: FontSizes.sm,
    },
    scanningWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xxl * 1.5,
      gap: Spacing.sm,
    },
    loadingSpinnerWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? '#1F2937' : '#CCFBF1',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    scanningTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    scanningSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      maxWidth: 260,
    },
    errorWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xl,
      gap: Spacing.sm,
    },
    errorTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: '#DC2626',
    },
    errorMsg: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    retryBtn: {
      backgroundColor: CustomerColors.teal600,
      paddingVertical: 10,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
    },
    retryBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: FontSizes.sm,
    },
    reviewWrap: {
      gap: Spacing.sm,
    },
    reviewBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#134E4A' : '#CCFBF1',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 8,
      borderRadius: BorderRadius.md,
      marginBottom: 4,
      gap: 6,
    },
    reviewBannerText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    refreshBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      backgroundColor: isDark ? '#115E59' : '#FFFFFF',
    },
    refreshBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    rowCard: {
      flexDirection: 'row',
      gap: Spacing.sm,
      padding: Spacing.sm,
      backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E2E8F0',
      borderRadius: BorderRadius.md,
    },
    rowThumb: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? '#111827' : '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    rowThumbImg: {
      width: '100%',
      height: '100%',
    },
    rowTitleLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    rowGrid: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    smallInput: {
      height: 34,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#CBD5E1',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 8,
      fontSize: 11,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    addRowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: 10,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: isDark ? '#0D9488' : CustomerColors.teal600,
      borderRadius: BorderRadius.md,
      marginTop: 4,
    },
    addRowBtnText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    submitAllBtn: {
      backgroundColor: CustomerColors.primary,
      paddingVertical: 13,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    submitAllBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.sm,
      fontWeight: '800',
    },
    doneWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xl,
      gap: Spacing.sm,
    },
    doneIconBox: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#DCFCE7',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    doneTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      textAlign: 'center',
    },
    failedBox: {
      width: '100%',
      backgroundColor: '#FEF2F2',
      borderWidth: 1,
      borderColor: '#FECACA',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.sm,
    },
    failedBoxTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#B91C1C',
      marginBottom: 4,
    },
    failedBoxItem: {
      fontSize: 11,
      color: '#DC2626',
    },
    doneCloseBtn: {
      backgroundColor: CustomerColors.teal600,
      paddingVertical: 12,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.md,
      width: '100%',
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    doneCloseBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: FontSizes.sm,
    },

    // Validation Alert Modal
    validationOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    validationCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    validationIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? '#451A03' : '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    validationTitle: {
      fontSize: FontSizes.md,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      textAlign: 'center',
      marginBottom: 4,
    },
    validationSubtitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    validationErrorItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      backgroundColor: isDark ? '#0F172A' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#FDE68A',
      padding: 8,
      borderRadius: BorderRadius.sm,
      marginBottom: 6,
    },
    validationErrorDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: '#D97706',
      marginTop: 5,
    },
    validationErrorText: {
      flex: 1,
      fontSize: 11,
      color: isDark ? '#FDE68A' : '#B45309',
      fontWeight: '600',
      lineHeight: 15,
    },
    validationBtn: {
      backgroundColor: CustomerColors.teal600,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      width: '100%',
      alignItems: 'center',
      marginTop: Spacing.xs,
    },
    validationBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.sm,
    },

    // Dropdown Selection Sheets
    selectOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    selectSheet: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
      maxHeight: 350,
      padding: Spacing.md,
    },
    selectTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    selectItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
    },
    selectItemText: {
      fontSize: FontSizes.sm,
      color: isDark ? '#E2E8F0' : CustomerColors.black,
      fontWeight: '500',
    },
  });
