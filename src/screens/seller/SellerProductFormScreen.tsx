import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {
  Save,
  Trash2,
  Plus,
  Mic,
  MicOff,
  RefreshCw,
  ImageIcon,
  AlertCircle,
  ChevronDown,
  Check,
  Sparkles,
  Sliders,
  X,
  Layers,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { useVoiceInput, VOICE_LANGUAGES, VoiceLanguageOption } from '../../hooks/useVoiceInput';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { requestCameraPermission } from '../../utils/permissions';
import {
  getCategories,
  getSubcategories,
  getCategoryAttributes,
  normalizeSpecifications,
} from '../../utils/categoryAttributes';

type BulkTier = { minQty: string; price: string };

export default function SellerProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;
  const initialTitle = route.params?.initialTitle;
  const initialCategory = route.params?.initialCategory;
  const isEdit = !!product;

  const { store, categories, refresh } = useSellerDashboard();
  const { token, user } = useAuth();
  const isHomeBusiness = user?.role === 'home_business';

  const [form, setForm] = useState({
    title: product?.title || initialTitle || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    discountedPrice: product?.discountedPrice ? String(product.discountedPrice) : '',
    storePrice: product?.storePrice ? String(product.storePrice) : '',
    storeDiscountedPrice: product?.storeDiscountedPrice ? String(product.storeDiscountedPrice) : '',
    category: product?.category || initialCategory || '',
    subcategory: product?.subcategory || '',
    brand: product?.brand || '',
    totalStock: product?.totalStock ? String(product.totalStock) : '',
    availability: product?.availability || 'In Stock',
    tags: product?.tags?.join(', ') || '',
    moq: product?.moq ? String(product.moq) : '1',
  });

  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, string>>(() => {
    if (product?.attributes && typeof product.attributes === 'object') {
      return { ...product.attributes };
    }
    if (Array.isArray(product?.specifications)) {
      const init: Record<string, string> = {};
      product.specifications.forEach((s: any) => {
        if (s?.label && s?.value) init[s.label] = s.value;
      });
      return init;
    }
    return {};
  });

  const [bulkTiers, setBulkTiers] = useState<BulkTier[]>(
    product?.bulkPricing?.map((t: any) => ({ minQty: String(t.minQty), price: String(t.price) })) || [],
  );

  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  const [preview, setPreview] = useState<string>(product?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiAutofilling, setAiAutofilling] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(VOICE_LANGUAGES[0]);
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const addTier = () => setBulkTiers(t => [...t, { minQty: '', price: '' }]);
  const removeTier = (i: number) => setBulkTiers(t => t.filter((_, idx) => idx !== i));
  const setTier = (i: number, k: keyof BulkTier, v: string) =>
    setBulkTiers(t => t.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  // Category & Subcategory options
  const categoryOptions = useMemo(() => {
    const predefined = getCategories();
    const dynamic = (categories || []).map((c: any) => c.name).filter(Boolean);
    return Array.from(new Set([...predefined, ...dynamic]));
  }, [categories]);

  const subcategoryOptions = useMemo(() => {
    return getSubcategories(form.category);
  }, [form.category]);

  const dynamicFields = useMemo(() => {
    return getCategoryAttributes(form.category, form.subcategory);
  }, [form.category, form.subcategory]);

  const handleCategorySelect = (selectedCat: string) => {
    setForm(f => ({
      ...f,
      category: selectedCat,
      subcategory: '', // Reset subcategory when category changes
    }));
    setCategoryModalVisible(false);
  };

  const handleSubcategorySelect = (selectedSub: string) => {
    setForm(f => ({ ...f, subcategory: selectedSub }));
    setSubcategoryModalVisible(false);
  };

  const handleAttributeChange = (key: string, value: string) => {
    setDynamicAttributes(prev => ({ ...prev, [key]: value }));
  };

  // ── Voice Input ──────────────────────────────────────────────────────────
  const handleVoiceResult = async (text: string) => {
    setVoiceParsing(true);
    setVoiceError('');
    try {
      const res = await sellerAiApi.parseVoiceProduct(text, voiceLang.short);
      if (!res.data.success) throw new Error(res.data.message || 'Could not understand that.');
      const x = res.data.extracted;
      setForm(f => ({
        ...f,
        title: x.productName || f.title,
        category: x.category || f.category,
        price: x.price ? String(x.price) : f.price,
        discountedPrice: x.discountedPrice ? String(x.discountedPrice) : f.discountedPrice,
        totalStock: x.totalStock ? String(x.totalStock) : f.totalStock,
        description: x.description || f.description,
        brand: x.brand || f.brand,
      }));
      if (x.imageUrl) setPreview(x.imageUrl);
    } catch (err: any) {
      setVoiceError(err.message || 'Could not understand that.');
    } finally {
      setVoiceParsing(false);
    }
  };

  const voice = useVoiceInput(handleVoiceResult);

  // ── AI Auto-Fill ─────────────────────────────────────────────────────────
  const handleAiAutoFill = async (assetToScan?: Asset) => {
    const targetAsset = assetToScan || imageAsset;
    if (!targetAsset?.uri) {
      Alert.alert(
        'Upload Image First',
        'Please take a photo or select an image from your gallery to auto-fill product details.',
        [
          { text: 'Camera', onPress: () => pickImage(true, true) },
          { text: 'Gallery', onPress: () => pickImage(false, true) },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    setAiAutofilling(true);
    setAiSuccessMsg('');
    setError('');

    try {
      const fd = new FormData();
      fd.append('image', {
        uri: targetAsset.uri,
        name: targetAsset.fileName || 'product.jpg',
        type: targetAsset.type || 'image/jpeg',
      } as any);

      const res = await sellerAiApi.scanSingleProduct(fd);
      const data = res.data;
      if (!data.success) throw new Error(data.message || 'Could not detect product details.');

      const ext = data.extracted;
      setForm(f => ({
        ...f,
        title: ext.productName || f.title,
        category: ext.category || f.category,
        subcategory: ext.subcategory || f.subcategory,
        brand: ext.brand || f.brand,
        price: ext.price ? String(ext.price) : f.price,
        discountedPrice: ext.discountedPrice ? String(ext.discountedPrice) : f.discountedPrice,
        description: ext.description || f.description,
      }));

      if (ext.attributes && typeof ext.attributes === 'object') {
        setDynamicAttributes(prev => ({
          ...prev,
          ...ext.attributes,
        }));
      }

      setAiSuccessMsg('✨ Product details auto-filled! Please review and edit before saving.');
    } catch (err: any) {
      setError(err.message || 'AI auto-fill failed. Please enter details manually.');
    } finally {
      setAiAutofilling(false);
    }
  };

  const pickImage = async (fromCamera: boolean, autoScan: boolean = false) => {
    if (fromCamera) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }
    const res = fromCamera
      ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.didCancel || res.errorCode) return;
    const asset = res.assets?.[0];
    if (asset) {
      setImageAsset(asset);
      setPreview(asset.uri || '');
      if (autoScan) {
        handleAiAutoFill(asset);
      }
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      setError('Title and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, String(v));
      });
      fd.append('storeId', store._id);

      const cleanSpecs = normalizeSpecifications(
        dynamicAttributes,
        [],
        form.category,
        form.subcategory,
      );
      fd.append('specifications', JSON.stringify(cleanSpecs));
      fd.append('attributes', JSON.stringify(dynamicAttributes));

      const validTiers = bulkTiers.filter(t => t.minQty && t.price);
      if (validTiers.length) {
        fd.append(
          'bulkPricing',
          JSON.stringify(validTiers.map(t => ({ minQty: Number(t.minQty), price: Number(t.price) }))),
        );
      }
      if (imageAsset?.uri) {
        fd.append('image', {
          uri: imageAsset.uri,
          name: imageAsset.fileName || 'product.jpg',
          type: imageAsset.type || 'image/jpeg',
        } as any);
      }

      if (isEdit) await storeProductApi.update(product._id || product.id, fd);
      else await storeProductApi.create(fd);

      await refresh();
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* AI Auto-Fill Card */}
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <Sparkles size={18} color={CustomerColors.teal700} />
          <Text style={styles.aiCardTitle}>✨ Auto-fill Product Details</Text>
        </View>
        <Text style={styles.aiCardSubtitle}>
          Scan product packaging or photo to auto-detect title, category, subcategory, price, and specs.
        </Text>
        <TouchableOpacity
          style={[styles.aiButton, aiAutofilling && styles.buttonDisabled]}
          onPress={() => handleAiAutoFill()}
          disabled={aiAutofilling}
        >
          {aiAutofilling ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.aiButtonText}>Scanning with AI…</Text>
            </>
          ) : (
            <>
              <Sparkles size={14} color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.aiButtonText}>
                {imageAsset ? 'Auto-fill from current photo' : 'Upload photo & Auto-fill'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {aiSuccessMsg ? (
        <View style={styles.successBanner}>
          <Check size={16} color={CustomerColors.teal700} />
          <Text style={styles.successText}>{aiSuccessMsg}</Text>
        </View>
      ) : null}

      {/* Voice Assistant */}
      <View style={styles.voiceSection}>
        <View style={styles.voiceLanguages}>
          {VOICE_LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setVoiceLang(l)}
              disabled={voice.listening || voiceParsing}
              style={[
                styles.voiceLangChip,
                voiceLang.code === l.code && styles.voiceLangChipActive,
              ]}
            >
              <Text
                style={[
                  styles.voiceLangText,
                  voiceLang.code === l.code && styles.voiceLangTextActive,
                ]}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => (voice.listening ? voice.stop() : voice.start(voiceLang))}
          disabled={voiceParsing}
          style={[
            styles.voiceButton,
            voice.listening ? styles.voiceButtonActive : styles.voiceButtonIdle,
          ]}
        >
          {voiceParsing ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonText}>Processing…</Text>
            </>
          ) : voice.listening ? (
            <>
              <MicOff size={16} color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonText}>Stop Listening</Text>
            </>
          ) : (
            <>
              <Mic size={16} color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonText}>Speak Details</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Preview & Pickers */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Product Image</Text>
        <View style={styles.imageRow}>
          <View style={styles.previewBox}>
            {preview ? (
              <Image source={{ uri: preview }} style={styles.previewImg} />
            ) : (
              <ImageIcon size={32} color={CustomerColors.textSecondary} />
            )}
          </View>
          <View style={styles.imageBtns}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => pickImage(true)}>
              <Text style={styles.pickerBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => pickImage(false)}>
              <Text style={styles.pickerBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Core Fields */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Product Details</Text>

        <Text style={styles.fieldLabel}>Product Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Organic Face Moisturizer / Galaxy S24"
          placeholderTextColor="#9CA3AF"
          value={form.title}
          onChangeText={v => set('title', v)}
        />

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe product highlights, materials, and benefits..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          value={form.description}
          onChangeText={v => set('description', v)}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={form.price}
              onChangeText={v => set('price', v)}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>Discounted Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={form.discountedPrice}
              onChangeText={v => set('discountedPrice', v)}
            />
          </View>
        </View>

        {isHomeBusiness && (
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Store Owner Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={form.storePrice}
                onChangeText={v => set('storePrice', v)}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Store Disc. Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={form.storeDiscountedPrice}
                onChangeText={v => set('storeDiscountedPrice', v)}
              />
            </View>
          </View>
        )}

        {/* Category Selector */}
        <Text style={styles.fieldLabel}>Category *</Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={form.category ? styles.selectText : styles.placeholderText}>
            {form.category || 'Select Category'}
          </Text>
          <ChevronDown size={18} color={CustomerColors.textSecondary} />
        </TouchableOpacity>

        {/* Subcategory Selector */}
        <Text style={styles.fieldLabel}>Subcategory</Text>
        <TouchableOpacity
          style={[styles.selectBtn, !form.category && styles.disabledBtn]}
          onPress={() => form.category && setSubcategoryModalVisible(true)}
          disabled={!form.category}
        >
          <Text style={form.subcategory ? styles.selectText : styles.placeholderText}>
            {!form.category
              ? 'Select Category first'
              : form.subcategory || 'Select Subcategory'}
          </Text>
          <ChevronDown size={18} color={CustomerColors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apple, Organic India"
              placeholderTextColor="#9CA3AF"
              value={form.brand}
              onChangeText={v => set('brand', v)}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={form.totalStock}
              onChangeText={v => set('totalStock', v)}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. fresh, organic, fast-delivery"
          placeholderTextColor="#9CA3AF"
          value={form.tags}
          onChangeText={v => set('tags', v)}
        />
      </View>

      {/* Dynamic Specifications & Details */}
      {form.category && dynamicFields.length > 0 && (
        <View style={styles.card}>
          <View style={styles.dynamicHeader}>
            <Sliders size={16} color={CustomerColors.teal700} />
            <Text style={styles.sectionLabel}>
              {form.subcategory || form.category} Specifications
            </Text>
          </View>

          {dynamicFields.map(field => (
            <View key={field.key} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                value={dynamicAttributes[field.key] || ''}
                onChangeText={v => handleAttributeChange(field.key, v)}
              />
            </View>
          ))}
        </View>
      )}

      {/* MOQ & Bulk Pricing */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Wholesale & Bulk Pricing</Text>

        <Text style={styles.fieldLabel}>Minimum Order Quantity (MOQ) *</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={form.moq}
          onChangeText={v => set('moq', v)}
        />

        <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Bulk Pricing Tiers</Text>
        {bulkTiers.map((t, idx) => (
          <View key={idx} style={styles.tierRow}>
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Min Qty"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={t.minQty}
              onChangeText={v => setTier(idx, 'minQty', v)}
            />
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Unit Price ₹"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={t.price}
              onChangeText={v => setTier(idx, 'price', v)}
            />
            <TouchableOpacity onPress={() => removeTier(idx)} style={styles.trashBtn}>
              <Trash2 size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addTierBtn} onPress={addTier}>
          <Plus size={14} color={CustomerColors.teal700} style={{ marginRight: Spacing.xs }} />
          <Text style={styles.addTierText}>Add Bulk Price Tier</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Save size={18} color="#fff" style={{ marginRight: Spacing.sm }} />
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Save Changes' : 'Publish Product'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
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
                    <Check size={16} color={CustomerColors.teal700} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        visible={subcategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubcategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSubcategoryModalVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setSubcategoryModalVisible(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={subcategoryOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSubcategorySelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.subcategory === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.subcategory === item && (
                    <Check size={16} color={CustomerColors.teal700} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No subcategories available</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  aiCard: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  aiCardTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700 },
  aiCardSubtitle: { fontSize: FontSizes.xs, color: CustomerColors.teal700, marginBottom: Spacing.sm },
  aiButton: {
    backgroundColor: CustomerColors.teal700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  aiButtonText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#DC2626', fontSize: FontSizes.xs, fontWeight: '600', flex: 1 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: { color: CustomerColors.teal700, fontSize: FontSizes.xs, fontWeight: '600', flex: 1 },
  voiceSection: {
    backgroundColor: '#fff',
    borderColor: CustomerColors.steelBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  voiceLanguages: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  voiceLangChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: '#fff',
  },
  voiceLangChipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  voiceLangText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  voiceLangTextActive: { color: '#fff' },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  voiceButtonIdle: { backgroundColor: CustomerColors.teal700 },
  voiceButtonActive: { backgroundColor: '#DC2626' },
  voiceButtonText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderColor: CustomerColors.steelBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.md,
  },
  fieldBlock: { marginBottom: Spacing.sm },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  disabledBtn: { opacity: 0.5, backgroundColor: '#F8FAFC' },
  selectText: { fontSize: FontSizes.sm, color: CustomerColors.black, fontWeight: '600' },
  placeholderText: { fontSize: FontSizes.sm, color: '#9CA3AF' },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  imageRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  previewBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBtns: { flex: 1, gap: Spacing.xs },
  pickerBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  pickerBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.black },
  dynamicHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  trashBtn: { padding: Spacing.sm },
  addTierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingVertical: 4,
  },
  addTierText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal700 },
  saveBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
    ...Shadows.card,
  },
  saveBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '800', textTransform: 'uppercase' },
  buttonDisabled: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '75%', paddingBottom: Spacing.xl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '800' },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});