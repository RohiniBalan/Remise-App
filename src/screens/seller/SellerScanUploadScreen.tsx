import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput,
  ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Upload, RefreshCw, CheckCircle2, Trash2, Plus, AlertCircle, ImageIcon, Camera, Check, ChevronDown, X } from 'lucide-react-native';
import { getCategories, getSubcategories } from '../../utils/categoryAttributes';
import { STOCK_UNIT_OPTIONS } from '../../utils/productForm';

import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { requestCameraPermission } from '../../utils/permissions';
import { useTheme } from '../../context/ThemeContext';

type Step = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error';
type Tier = { minQty: string; price: string };

export default function SellerScanUploadScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { store, categories, refresh } = useSellerDashboard();
  const { token, user } = useAuth();
  const isHomeBusiness = user?.role === 'home_business';
  const isStoreOwner = user?.role === 'store_owner';

  const [asset, setAsset] = useState<Asset | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [engine, setEngine] = useState('');
  const [form, setForm] = useState<{
    title: string; category: string; subcategory: string; price: string; discountedPrice: string;
    storePrice: string; storeDiscountedPrice: string; description: string; aboutDescription: string;
    aboutFeatures: string[]; specifications: Array<{ label: string; value: string }>;
    attributes: Record<string, any>; idealFor: string[];
    brand: string; imageUrl: string; totalStock: string; stockUnit: string; unit: string; availability: string; tags: string; moq: string;
  }>({
    title: '', category: '', subcategory: '', price: '', discountedPrice: '', storePrice: '', storeDiscountedPrice: '',
    description: '', aboutDescription: '', aboutFeatures: [], specifications: [], attributes: {}, idealFor: [],
    brand: '', imageUrl: '', totalStock: '', stockUnit: 'Count', unit: 'Count', availability: 'In Stock', tags: '', moq: '1',
  });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [stockUnitModalVisible, setStockUnitModalVisible] = useState(false);

  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');

  const categoryOptions = useMemo(() => {
    const predefined = getCategories();
    const dynamic = (categories || []).map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
    const custom = form.category ? [form.category] : [];
    return Array.from(new Set([...predefined, ...dynamic, ...custom]));
  }, [categories, form.category]);

  const subcategoryOptions = useMemo(() => {
    return getSubcategories(form.category);
  }, [form.category]);

  const handleCategorySelect = (selectedCat: string) => {
    set('category', selectedCat);
    set('subcategory', '');
    setIsCustomSubcategory(false);
    setCustomSubcategory('');
    setCategoryModalVisible(false);
  };

  const handleSubcategorySelect = (selectedSub: string) => {
    if (selectedSub === 'Other') {
      setIsCustomSubcategory(true);
      set('subcategory', customSubcategory || '');
    } else {
      setIsCustomSubcategory(false);
      set('subcategory', selectedSub);
    }
    setSubcategoryModalVisible(false);
  };

  const handleCustomSubcategoryChange = (val: string) => {
    setCustomSubcategory(val);
    set('subcategory', val);
  };

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const addTier = () => setTiers(t => [...t, { minQty: '', price: '' }]);
  const removeTier = (i: number) => setTiers(t => t.filter((_, idx) => idx !== i));
  const setTier = (i: number, k: keyof Tier, v: string) => setTiers(t => t.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const reset = () => {
    setAsset(null);
    setStep('idle');
    setErrMsg('');
    setEngine('');
    setIsCustomSubcategory(false);
    setCustomSubcategory('');
    setForm({
      title: '', category: '', subcategory: '', price: '', discountedPrice: '', storePrice: '', storeDiscountedPrice: '',
      description: '', aboutDescription: '', aboutFeatures: [], specifications: [], attributes: {}, idealFor: [],
      brand: '', imageUrl: '', totalStock: '', stockUnit: 'Count', unit: 'Count', availability: 'In Stock', tags: '', moq: '1',
    });
    setTiers([]);
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
      setStep('idle');
      setErrMsg('');
    }
  };

  const handleScan = async () => {
    if (!asset?.uri) return;
    setStep('scanning');
    setErrMsg('');
    try {
      const fd = new FormData();
      fd.append('image', { uri: asset.uri, name: asset.fileName || 'paper.jpg', type: asset.type || 'image/jpeg' } as any);
      const res = await sellerAiApi.scanSingleProduct(fd);
      if (!res.data.success) throw new Error(res.data.message || 'Scan failed.');
      const x = res.data.extracted;
      setEngine(res.data.engine || 'ocr');
      const targetCat = x.category || '';
      const targetSub = x.subcategory || '';
      if (targetSub) {
        const subs = getSubcategories(targetCat);
        if (subs.includes(targetSub)) {
          setIsCustomSubcategory(false);
          setCustomSubcategory('');
        } else {
          setIsCustomSubcategory(true);
          setCustomSubcategory(targetSub);
        }
      } else {
        setIsCustomSubcategory(false);
        setCustomSubcategory('');
      }
      setForm({
        title: x.productName || '', category: targetCat, subcategory: targetSub,
        price: String(x.price || ''), discountedPrice: String(x.discountedPrice || x.price || ''),
        storePrice: String(x.storePrice || ''), storeDiscountedPrice: String(x.storeDiscountedPrice || ''),
        description: x.description || '', aboutDescription: x.aboutDescription || x.description || '',
        aboutFeatures: x.aboutFeatures || [], specifications: x.specifications || [],
        attributes: x.attributes || {}, idealFor: x.idealFor || [],
        brand: x.brand || '', imageUrl: x.imageUrl || '',
        totalStock: '', stockUnit: x.stockUnit || x.unit || 'Count', unit: x.stockUnit || x.unit || 'Count', availability: 'In Stock', tags: '', moq: '1',
      });
      setStep('review');
    } catch (err: any) {
      setErrMsg(err.message || 'Something went wrong.');
      setStep('error');
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setErrMsg('Product Title is required.');
      setStep('error');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setErrMsg('A valid Price greater than ₹0 is required.');
      setStep('error');
      return;
    }
    if (form.totalStock === '' || form.totalStock === undefined || isNaN(Number(form.totalStock)) || Number(form.totalStock) < 0) {
      setErrMsg('Stock Quantity (>= 0) is required.');
      setStep('error');
      return;
    }
    setStep('saving');
    try {
      const bulkPricing = tiers
        .filter(t => +t.minQty > 0 && +t.price > 0)
        .map(t => ({ minQty: +t.minQty, price: +t.price }));

      const payload: any = {
        title: form.title,
        price: +form.price,
        discountedPrice: form.discountedPrice ? +form.discountedPrice : +form.price,
        category: form.category || 'General',
        brand: form.brand || 'Generic',
        description: form.description || '',
        imageUrl: form.imageUrl || '',
        totalStock: form.totalStock ? +form.totalStock : 0,
        stockUnit: form.stockUnit || 'Count',
        unit: form.stockUnit || 'Count',
        availability: form.availability,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        moq: form.moq ? +form.moq : 1,
        bulkPricing,
      };
      if (form.subcategory) payload.subcategory = form.subcategory;
      if (form.aboutDescription) payload.aboutDescription = form.aboutDescription;
      if (form.aboutFeatures && form.aboutFeatures.length) payload.aboutFeatures = form.aboutFeatures;
      if (form.specifications && form.specifications.length) payload.specifications = form.specifications;
      if (form.attributes && Object.keys(form.attributes).length) payload.attributes = form.attributes;
      if (form.idealFor && form.idealFor.length) payload.idealFor = form.idealFor;

      if (isHomeBusiness) {
        if (form.storePrice) payload.storePrice = +form.storePrice;
        if (form.storeDiscountedPrice) payload.storeDiscountedPrice = +form.storeDiscountedPrice;
      }

      await storeProductApi.create(payload);
      setStep('done');
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || 'Failed to create product.');
      setStep('error');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      {step === 'idle' && (
        <>
          <TouchableOpacity style={styles.dropZone} onPress={() => pickImage(false)}>
            {asset ? (
              <Image source={{ uri: asset.uri }} style={styles.dropImage} resizeMode="contain" />
            ) : (
              <>
                <Upload size={36} color={CustomerColors.teal600} />
                <Text style={styles.dropTitle}>Tap to select product paper/packaging photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
              <Camera size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={styles.pickBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
              <ImageIcon size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={styles.pickBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {asset && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleScan}>
              <Sparkles size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Scan with AI</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {step === 'scanning' && (
        <View style={styles.infoBanner}>
          <RefreshCw size={18} color={CustomerColors.teal700} />
          <Text style={styles.infoBannerText}>Analyzing image with AI…</Text>
        </View>
      )}

      {step === 'error' && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color="#FF0000" />
          <Text style={styles.errorBannerText}>{errMsg}</Text>
          <TouchableOpacity onPress={reset}><Text style={styles.addTierText}>Try again</Text></TouchableOpacity>
        </View>
      )}

      {(step === 'review' || step === 'saving') && (
        <>
          <View style={styles.reviewBanner}>
            <Sparkles size={14} color={CustomerColors.teal700} />
            <Text style={styles.reviewBannerText}>Auto-filled via {engine || 'AI'}</Text>
          </View>

          {form.imageUrl ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md, padding: Spacing.sm, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}>
              <Image source={{ uri: form.imageUrl }} style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' }} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#F9FAFB' : '#111827' }}>Product Image</Text>
                <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>Clean product image matched & generated for this product.</Text>
              </View>
            </View>
          ) : null}

          <Field label="Product Title *" value={form.title} onChangeText={(t: string) => set('title', t)} styles={styles} isDark={isDark} />
          <View style={styles.row2}>
            <Field style={{ flex: 1 }} label="Price (₹) *" value={form.price} onChangeText={(t: string) => set('price', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
            <Field style={{ flex: 1 }} label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={(t: string) => set('discountedPrice', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
          </View>

          {isHomeBusiness && (
            <View style={styles.row2}>
              <Field style={{ flex: 1 }} label="Store Price (₹)" value={form.storePrice} onChangeText={(t: string) => set('storePrice', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
              <Field style={{ flex: 1 }} label="Store Disc. Price (₹)" value={form.storeDiscountedPrice} onChangeText={(t: string) => set('storeDiscountedPrice', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
            </View>
          )}

          <View style={styles.row2}>
            <View style={{ flex: 1, marginBottom: Spacing.sm }}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={form.category ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                  {form.category || 'Select Category'}
                </Text>
                <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginBottom: Spacing.sm }}>
              <Text style={styles.label}>Subcategory</Text>
              <TouchableOpacity
                style={[styles.selector, !form.category && { opacity: 0.6 }]}
                disabled={!form.category}
                onPress={() => setSubcategoryModalVisible(true)}
              >
                <Text style={(isCustomSubcategory || form.subcategory) ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                  {!form.category
                    ? 'Select Category first'
                    : isCustomSubcategory
                    ? 'Other'
                    : form.subcategory || 'Select Subcategory'}
                </Text>
                <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          {isCustomSubcategory && (
            <Field
              label="Custom Subcategory *"
              placeholder="Enter custom subcategory"
              value={customSubcategory}
              onChangeText={handleCustomSubcategoryChange}
              styles={styles}
              isDark={isDark}
            />
          )}
          <View style={styles.row2}>
            <Field style={{ flex: 1 }} label="Brand" value={form.brand} onChangeText={(t: string) => set('brand', t)} styles={styles} isDark={isDark} />
            <Field style={{ flex: 1 }} label="Stock Quantity *" value={form.totalStock} onChangeText={(t: string) => set('totalStock', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
          </View>
          <View style={styles.row2}>
            <View style={{ flex: 1, marginBottom: Spacing.sm }}>
              <Text style={styles.label}>Stock Unit</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setStockUnitModalVisible(true)}
              >
                <Text style={styles.selectorValue} numberOfLines={1}>
                  {form.stockUnit || 'Count'}
                </Text>
                <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Availability" value={form.availability} onChangeText={(t: string) => set('availability', t)} styles={styles} isDark={isDark} />
            </View>
          </View>
          <Field label="Tags (comma-separated)" value={form.tags} onChangeText={(t: string) => set('tags', t)} styles={styles} isDark={isDark} />
          <Field label="Description / Overview" value={form.description} onChangeText={(t: string) => set('description', t)} multiline styles={styles} isDark={isDark} />

          {((form.specifications && form.specifications.length > 0) || (form.aboutFeatures && form.aboutFeatures.length > 0)) && (
            <View style={{ backgroundColor: isDark ? '#1F2937' : '#F0FDFA', borderWidth: 1, borderColor: isDark ? '#374151' : '#CCFBF1', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm, gap: 6 }}>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal700, textTransform: 'uppercase' }}>
                Extracted Specifications ({form.specifications?.length || 0})
              </Text>
              {form.specifications?.slice(0, 8).map((s, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDark ? '#111827' : '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: isDark ? '#9CA3AF' : '#4B5563' }}>{s.label}:</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: isDark ? '#F9FAFB' : '#111827', fontWeight: '500' }}>{s.value}</Text>
                </View>
              ))}
              {form.aboutFeatures && form.aboutFeatures.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>Key Features:</Text>
                  {form.aboutFeatures.slice(0, 3).map((f, i) => (
                    <Text key={i} style={{ fontSize: 11, color: isDark ? '#D1D5DB' : '#374151' }}>• {f}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {!isStoreOwner && (
            <>
              <View style={styles.divider} />
              <Field label="Minimum Order Quantity (MOQ) *" value={form.moq} onChangeText={(t: string) => set('moq', t)} keyboardType="numeric" styles={styles} isDark={isDark} />
              <Text style={styles.label}>Bulk Pricing Tiers</Text>
              {tiers.map((t, i) => (
                <View key={i} style={styles.tierRow}>
                  <TextInput style={[styles.input, { flex: 1, color: isDark ? '#FFFFFF' : CustomerColors.black, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]} value={t.minQty} onChangeText={(v: string) => setTier(i, 'minQty', v)} placeholder="Min qty" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} keyboardType="numeric" />
                  <Text style={styles.tierAt}>units @ ₹</Text>
                  <TextInput style={[styles.input, { flex: 1, color: isDark ? '#FFFFFF' : CustomerColors.black, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]} value={t.price} onChangeText={(v: string) => setTier(i, 'price', v)} placeholder="Price" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} keyboardType="numeric" />
                  <TouchableOpacity onPress={() => removeTier(i)}><Trash2 size={16} color={isDark ? '#9CA3AF' : '#9CA3AF'} /></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addTier}><Text style={styles.addTierText}>+ Add tier</Text></TouchableOpacity>
            </>
          )}

          {step === 'saving' && (
            <View style={styles.infoBanner}><RefreshCw size={16} color={CustomerColors.teal700} /><Text style={styles.infoBannerText}>Creating product…</Text></View>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} disabled={step === 'saving'} onPress={reset}><Text style={styles.secondaryBtnText}>← Rescan</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, (!form.title || !form.price) && styles.btnDisabled]} disabled={!form.title || !form.price || step === 'saving'} onPress={handleCreate}>
              {step === 'saving' ? <ActivityIndicator color="#fff" size="small" /> : <><Plus size={14} color="#fff" /><Text style={styles.primaryBtnText}>Create Product</Text></>}
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 'done' && (
        <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl }}>
          <View style={styles.successCircle}><CheckCircle2 size={30} color="#16A34A" /></View>
          <Text style={styles.successText}>Product created successfully!</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={reset}><Text style={styles.secondaryBtnText}>Scan Another Paper</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: CustomerColors.teal600, flex: 1 }]} onPress={async () => { await refresh(); navigation.goBack(); }}>
              <Check size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category Modal Picker */}
      <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.category === item && styles.modalItemActive,
                  ]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.category === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.category === item && (
                    <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal Picker */}
      <Modal visible={subcategoryModalVisible} transparent animationType="slide" onRequestClose={() => setSubcategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setSubcategoryModalVisible(false)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[...subcategoryOptions, 'Other']}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isActive = (isCustomSubcategory && item === 'Other') || (!isCustomSubcategory && form.subcategory === item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isActive && styles.modalItemActive,
                    ]}
                    onPress={() => handleSubcategorySelect(item)}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isActive && styles.modalItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {isActive && (
                      <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Stock Unit Modal Picker */}
      <Modal visible={stockUnitModalVisible} transparent animationType="slide" onRequestClose={() => setStockUnitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stock Unit</Text>
              <TouchableOpacity onPress={() => setStockUnitModalVisible(false)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={STOCK_UNIT_OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    (form.stockUnit || 'Count') === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    set('stockUnit', item);
                    set('unit', item);
                    setStockUnitModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      (form.stockUnit || 'Count') === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {(form.stockUnit || 'Count') === item && (
                    <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Field({ label, style, styles, isDark, ...props }: any) {
  return (
    <View style={[{ marginBottom: Spacing.sm }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { color: isDark ? '#FFFFFF' : CustomerColors.black, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          props.multiline && { height: 70, textAlignVertical: 'top' }
        ]}
        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
        {...props}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  dropZone: {
    minHeight: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderStyle: 'dashed',
    backgroundColor: isDark ? '#111827' : '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dropImage: { width: '100%', height: 160, borderRadius: BorderRadius.md },
  dropTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: isDark ? '#F9FAFB' : '#374151', textAlign: 'center' },
  pickRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#fff',
  },
  pickBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#F9FAFB' : '#374151' },
  infoBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? '#115E59' : '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoBannerText: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700', fontSize: FontSizes.sm },
  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
    borderWidth: 1,
    borderColor: isDark ? '#991B1B' : '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorBannerText: { color: '#FF0000', fontSize: FontSizes.sm, flex: 1 },
  primaryBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', paddingVertical: 13, borderRadius: BorderRadius.md },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  btnDisabled: { opacity: 0.5 },
  reviewBanner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? '#115E59' : '#99F6E4',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reviewBannerText: { flex: 1, fontSize: 11, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  engineBadge: { fontSize: 9, fontWeight: '800', color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  imageRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  thumbBox: { width: 72, height: 72, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  label: { fontSize: 11, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  input: {
    backgroundColor: isDark ? '#1F2937' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: FontSizes.sm,
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  divider: { height: 1, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', marginVertical: Spacing.md },
  tierRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  tierAt: { fontSize: 11, color: isDark ? '#9CA3AF' : '#9CA3AF' },
  addTierText: { color: CustomerColors.teal600, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  secondaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#fff',
  },
  secondaryBtnText: { color: isDark ? '#F9FAFB' : '#374151', fontWeight: '700', fontSize: FontSizes.sm },
  successCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  successText: { fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, fontSize: FontSizes.md },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
  },
  selectorPlaceholder: {
    fontSize: FontSizes.sm,
    color: isDark ? '#6B7280' : '#9CA3AF',
  },
  selectorValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#E2E8F0',
  },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F1F5F9',
  },
  modalItemActive: { backgroundColor: isDark ? '#134e4a' : '#F0FDFA' },
  modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItemTextActive: { fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
});