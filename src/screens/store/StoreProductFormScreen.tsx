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
import { useStoreDashboard } from '../../context/StoreDashboardContext';
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
import { AVAILABILITY_OPTIONS } from '../../utils/productForm';

export default function StoreProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;
  const initialTitle = route.params?.initialTitle;
  const initialCategory = route.params?.initialCategory;
  const isEdit = Boolean(product?._id);

  const { store, categories, refresh } = useStoreDashboard();

  const [form, setForm] = useState({
    title: product?.title || initialTitle || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    discountedPrice: product?.discountedPrice ? String(product.discountedPrice) : '',
    category: product?.category || initialCategory || '',
    subcategory: product?.subcategory || '',
    brand: product?.brand || '',
    totalStock: product?.totalStock ? String(product.totalStock) : '',
    availability: product?.availability || 'In Stock',
    tags: Array.isArray(product?.tags) ? product.tags.join(', ') : product?.tags || '',
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

  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl || '');
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
      if (x.imageUrl) setImageUrl(x.imageUrl);
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
      setImageUrl('');
      if (autoScan) {
        handleAiAutoFill(asset);
      }
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.price.trim()) {
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
      if (store?._id) fd.append('storeId', store._id);

      const cleanSpecs = normalizeSpecifications(
        dynamicAttributes,
        [],
        form.category,
        form.subcategory,
      );
      fd.append('specifications', JSON.stringify(cleanSpecs));
      fd.append('attributes', JSON.stringify(dynamicAttributes));

      if (imageAsset?.uri) {
        fd.append('image', {
          uri: imageAsset.uri,
          name: imageAsset.fileName || 'product.jpg',
          type: imageAsset.type || 'image/jpeg',
        } as any);
      } else if (imageUrl) {
        fd.append('imageUrl', imageUrl);
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

  const preview = imageAsset?.uri || imageUrl;

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
            voice.listening && styles.voiceButtonListening,
            voiceParsing && styles.buttonDisabled,
          ]}
        >
          {voiceParsing ? (
            <>
              <RefreshCw size={15} color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonText}>Processing Voice…</Text>
            </>
          ) : voice.listening ? (
            <>
              <MicOff size={15} color="#fff" style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonText}>Stop Listening</Text>
            </>
          ) : (
            <>
              <Mic size={15} color={CustomerColors.black} style={{ marginRight: Spacing.xs }} />
              <Text style={styles.voiceButtonTextInactive}>Speak product details</Text>
            </>
          )}
        </TouchableOpacity>

        {voice.listening && (
          <Text style={styles.voiceTranscript} numberOfLines={2}>
            Listening: "{voice.partialTranscript || voice.transcript || '…'}"
          </Text>
        )}

        {(voice.error || voiceError) ? (
          <View style={styles.voiceErrorRow}>
            <AlertCircle size={12} color="#DC2626" />
            <Text style={styles.voiceErrorText}>{voice.error || voiceError}</Text>
          </View>
        ) : null}
      </View>

      {/* Product Image Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRODUCT IMAGE</Text>
        <View style={styles.imageRow}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={() =>
              Alert.alert('Product Photo', 'Choose source', [
                { text: 'Camera', onPress: () => pickImage(true) },
                { text: 'Gallery', onPress: () => pickImage(false) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
          >
            {preview ? (
              <Image source={{ uri: preview }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={28} color={CustomerColors.textSecondary} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TextInput
              style={styles.input}
              placeholder="Or paste image URL"
              value={imageUrl}
              onChangeText={v => {
                setImageUrl(v);
                if (v) setImageAsset(null);
              }}
            />
          </View>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRODUCT DETAILS</Text>

        <Text style={styles.inputLabel}>Product Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Organic Face Moisturizer / Galaxy S24"
          value={form.title}
          onChangeText={v => set('title', v)}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Provide product highlights, features, and key specifications..."
          multiline
          numberOfLines={3}
          value={form.description}
          onChangeText={v => set('description', v)}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={form.price}
              onChangeText={v => set('price', v)}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Discounted Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={form.discountedPrice}
              onChangeText={v => set('discountedPrice', v)}
            />
          </View>
        </View>

        {/* Category & Subcategory Selectors */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={form.category ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                {form.category || 'Select Category'}
              </Text>
              <ChevronDown size={16} color={CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.col}>
            <Text style={styles.inputLabel}>Subcategory</Text>
            <TouchableOpacity
              style={[styles.selector, (!form.category || subcategoryOptions.length === 0) && styles.selectorDisabled]}
              onPress={() => {
                if (form.category && subcategoryOptions.length > 0) {
                  setSubcategoryModalVisible(true);
                }
              }}
              disabled={!form.category || subcategoryOptions.length === 0}
            >
              <Text style={form.subcategory ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                {form.subcategory || (form.category ? 'Select Subcategory' : 'Select Category first')}
              </Text>
              <ChevronDown size={16} color={CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apple, Organic India"
              value={form.brand}
              onChangeText={v => set('brand', v)}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              keyboardType="numeric"
              value={form.totalStock}
              onChangeText={v => set('totalStock', v)}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Availability</Text>
        <View style={styles.chipRow}>
          {AVAILABILITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                form.availability === opt && styles.chipActive,
              ]}
              onPress={() => set('availability', opt)}
            >
              <Text
                style={[
                  styles.chipText,
                  form.availability === opt && styles.chipTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Tags (Comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. bestseller, trending, fast-delivery"
          value={form.tags}
          onChangeText={v => set('tags', v)}
        />
      </View>

      {/* Dynamic Product Specifications / Attributes */}
      {dynamicFields.length > 0 && (
        <View style={styles.section}>
          <View style={styles.dynamicHeader}>
            <Sliders size={16} color={CustomerColors.teal700} />
            <Text style={styles.dynamicTitle}>
              {form.subcategory ? `${form.subcategory} Specifications` : `${form.category} Specifications`}
            </Text>
          </View>
          <Text style={styles.dynamicSubtitle}>
            Specific attributes for {form.subcategory || form.category}. These details will show up nicely on the product page.
          </Text>

          <View style={styles.dynamicFieldsGrid}>
            {dynamicFields.map(field => (
              <View key={field.key} style={styles.dynamicFieldItem}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  value={dynamicAttributes[field.key] || ''}
                  onChangeText={v => handleAttributeChange(field.key, v)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: Spacing.sm }} />
            <Text style={styles.saveButtonText}>Saving Product…</Text>
          </>
        ) : (
          <>
            <Save size={18} color="#fff" style={{ marginRight: Spacing.sm }} />
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Save Changes' : 'Publish Product'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Category Modal Picker */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={20} color={CustomerColors.black} />
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
                  {form.category === item && <Check size={16} color={CustomerColors.teal700} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal Picker */}
      <Modal visible={subcategoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setSubcategoryModalVisible(false)}>
                <X size={20} color={CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={subcategoryOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.subcategory === item && styles.modalItemActive,
                  ]}
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
                  {form.subcategory === item && <Check size={16} color={CustomerColors.teal700} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl * 2 },

  aiCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  aiCardTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#115E59' },
  aiCardSubtitle: { fontSize: FontSizes.xs, color: '#0F766E', marginBottom: Spacing.sm },
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#DC2626', fontSize: FontSizes.xs, flex: 1 },

  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  successText: { color: '#065F46', fontSize: FontSizes.xs, flex: 1 },

  voiceSection: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  voiceLanguages: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  voiceLangChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voiceLangChipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  voiceLangText: { fontSize: 11, fontWeight: '600', color: CustomerColors.textSecondary },
  voiceLangTextActive: { color: '#fff' },
  voiceButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonListening: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  voiceButtonText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  voiceButtonTextInactive: { color: CustomerColors.black, fontSize: FontSizes.xs, fontWeight: '600' },
  voiceTranscript: { fontSize: 11, color: CustomerColors.teal700, marginTop: 4 },
  voiceErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  voiceErrorText: { fontSize: 11, color: '#DC2626' },

  section: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: CustomerColors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  imageRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  imagePicker: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 10, color: CustomerColors.textSecondary, marginTop: 2 },

  inputLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.black, marginBottom: 4, marginTop: Spacing.xs },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  textArea: { height: 70, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: Spacing.md },
  col: { flex: 1 },

  selector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDisabled: { backgroundColor: '#F1F5F9', opacity: 0.7 },
  selectorValue: { fontSize: FontSizes.sm, color: CustomerColors.black, flex: 1 },
  selectorPlaceholder: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, flex: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  chipText: { fontSize: 11, fontWeight: '600', color: CustomerColors.textSecondary },
  chipTextActive: { color: '#fff' },

  dynamicHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  dynamicTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700 },
  dynamicSubtitle: { fontSize: 11, color: CustomerColors.textSecondary, marginBottom: Spacing.sm },
  dynamicFieldsGrid: { gap: Spacing.xs },
  dynamicFieldItem: { marginBottom: Spacing.xs },

  saveButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    ...Shadows.card,
  },
  saveButtonText: { color: '#fff', fontSize: FontSizes.base, fontWeight: '800' },
  buttonDisabled: { opacity: 0.6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemActive: { backgroundColor: '#F0FDFA' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { fontWeight: '700', color: CustomerColors.teal700 },
});
