import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  Camera,
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
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import {
  getCategories,
  getSubcategories,
  getCategoryAttributes,
  matchExtractedToAttributes,
  normalizeSpecifications,
} from '../../utils/categoryAttributes';
import { STOCK_UNIT_OPTIONS } from '../../utils/productForm';

type BulkTier = { minQty: string; price: string };

export interface ProductImageItem {
  id: string;
  uri: string;
  asset?: Asset;
  url?: string;
}

export default function SellerProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;
  const scanned = route.params?.scanned;
  const initialTitle = route.params?.initialTitle;
  const initialCategory = route.params?.initialCategory;
  const isEdit = !!product;

  const { store, categories, refresh } = useSellerDashboard();
  const { token, user } = useAuth();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const isHomeBusiness = user?.role === 'home_business';
  const isStoreOwner = user?.role === 'store_owner';

  const [form, setForm] = useState({
    title: product?.title || scanned?.title || initialTitle || '',
    description: product?.description || scanned?.description || '',
    price: product?.price ? String(product.price) : scanned?.price ? String(scanned.price) : '',
    discountedPrice: product?.discountedPrice ? String(product.discountedPrice) : scanned?.discountedPrice ? String(scanned.discountedPrice) : '',
    storePrice: product?.storePrice ? String(product.storePrice) : scanned?.storePrice ? String(scanned.storePrice) : '',
    storeDiscountedPrice: product?.storeDiscountedPrice ? String(product.storeDiscountedPrice) : scanned?.storeDiscountedPrice ? String(scanned.storeDiscountedPrice) : '',
    category: product?.category || scanned?.category || initialCategory || '',
    subcategory: product?.subcategory || scanned?.subcategory || '',
    brand: product?.brand || scanned?.brand || '',
    totalStock: product?.totalStock ? String(product.totalStock) : scanned?.totalStock ? String(scanned.totalStock) : '',
    stockUnit: product?.stockUnit || product?.unit || scanned?.stockUnit || scanned?.unit || 'Count',
    availability: product?.availability || scanned?.availability || 'In Stock',
    tags: product?.tags?.join(', ') || (Array.isArray(scanned?.tags) ? scanned.tags.join(', ') : scanned?.tags) || '',
    moq: product?.moq ? String(product.moq) : scanned?.moq ? String(scanned.moq) : '1',
  });

  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, string>>(() => {
    if (product?.attributes && typeof product.attributes === 'object') {
      return { ...product.attributes };
    }
    if (scanned?.attributes && typeof scanned.attributes === 'object') {
      return { ...scanned.attributes };
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

  // Multi-image state
  const [images, setImages] = useState<ProductImageItem[]>(() => {
    const initialList: ProductImageItem[] = [];
    const rawList: string[] =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : product?.imageUrl
          ? [product.imageUrl]
          : Array.isArray(scanned?.images) && scanned.images.length > 0
            ? scanned.images
            : scanned?.imageUrl
              ? [scanned.imageUrl]
              : [];

    rawList.forEach((u: string, idx: number) => {
      if (u && typeof u === 'string') {
        initialList.push({
          id: `existing-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          uri: resolveImageUrl(u) || u,
          url: u,
        });
      }
    });
    return initialList;
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiAutofilling, setAiAutofilling] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState(scanned ? '✨ Product details auto-filled from scan!' : '');

  const handleRefresh = () => {
    setForm({
      title: product?.title || scanned?.title || initialTitle || '',
      description: product?.description || scanned?.description || '',
      price: product?.price ? String(product.price) : scanned?.price ? String(scanned.price) : '',
      discountedPrice: product?.discountedPrice ? String(product.discountedPrice) : scanned?.discountedPrice ? String(scanned.discountedPrice) : '',
      storePrice: product?.storePrice ? String(product.storePrice) : scanned?.storePrice ? String(scanned.storePrice) : '',
      storeDiscountedPrice: product?.storeDiscountedPrice ? String(product.storeDiscountedPrice) : scanned?.storeDiscountedPrice ? String(scanned.storeDiscountedPrice) : '',
      category: product?.category || scanned?.category || initialCategory || '',
      subcategory: product?.subcategory || scanned?.subcategory || '',
      brand: product?.brand || scanned?.brand || '',
      totalStock: product?.totalStock ? String(product.totalStock) : scanned?.totalStock ? String(scanned.totalStock) : '',
      stockUnit: product?.stockUnit || product?.unit || scanned?.stockUnit || scanned?.unit || 'Count',
      availability: product?.availability || scanned?.availability || 'In Stock',
      tags: product?.tags?.join(', ') || (Array.isArray(scanned?.tags) ? scanned.tags.join(', ') : scanned?.tags) || '',
      moq: product?.moq ? String(product.moq) : scanned?.moq ? String(scanned.moq) : '1',
    });

    if (product?.attributes && typeof product.attributes === 'object') {
      setDynamicAttributes({ ...product.attributes });
    } else if (scanned?.attributes && typeof scanned.attributes === 'object') {
      setDynamicAttributes({ ...scanned.attributes });
    } else if (Array.isArray(product?.specifications)) {
      const init: Record<string, string> = {};
      product.specifications.forEach((s: any) => {
        if (s?.label && s?.value) init[s.label] = s.value;
      });
      setDynamicAttributes(init);
    } else {
      setDynamicAttributes({});
    }

    setBulkTiers(
      product?.bulkPricing?.map((t: any) => ({ minQty: String(t.minQty), price: String(t.price) })) || [],
    );

    const initialList: ProductImageItem[] = [];
    const rawList: string[] =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : product?.imageUrl
          ? [product.imageUrl]
          : Array.isArray(scanned?.images) && scanned.images.length > 0
            ? scanned.images
            : scanned?.imageUrl
              ? [scanned.imageUrl]
              : [];

    rawList.forEach((u: string, idx: number) => {
      if (u && typeof u === 'string') {
        initialList.push({
          id: `existing-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          uri: resolveImageUrl(u) || u,
          url: u,
        });
      }
    });
    setImages(initialList);
    setNewImageUrl('');
    setError('');
    setAiSuccessMsg(scanned ? '✨ Product details auto-filled from scan!' : '');
    setVoiceError('');
  };

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Edit Product' : 'Add New Product',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleRefresh}
          style={{ marginRight: Spacing.sm, padding: Spacing.xs }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <RefreshCw size={20} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEdit, isDark, product, initialTitle, initialCategory]);

  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(VOICE_LANGUAGES[0]);
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [stockUnitModalVisible, setStockUnitModalVisible] = useState(false);

  const [isCustomSubcategory, setIsCustomSubcategory] = useState<boolean>(() => {
    if (!product?.subcategory) return false;
    const initialSubs = getSubcategories(product?.category || '');
    return !initialSubs.includes(product.subcategory);
  });
  const [customSubcategory, setCustomSubcategory] = useState<string>(() => {
    if (!product?.subcategory) return '';
    const initialSubs = getSubcategories(product?.category || '');
    return !initialSubs.includes(product.subcategory) ? product.subcategory : '';
  });

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

  // Automatically map existing attributes to active schema fields if not already populated
  useEffect(() => {
    if (dynamicFields.length > 0 && Object.keys(dynamicAttributes).length > 0) {
      const remapped = matchExtractedToAttributes(dynamicFields, {
        brand: form.brand,
        attributes: dynamicAttributes,
      });
      let hasChange = false;
      for (const field of dynamicFields) {
        if (remapped[field.key] && !dynamicAttributes[field.key]) {
          hasChange = true;
          break;
        }
      }
      if (hasChange) {
        setDynamicAttributes(prev => ({
          ...prev,
          ...remapped,
        }));
      }
    }
  }, [form.category, form.subcategory, dynamicFields, form.brand]);

  const handleCategorySelect = (selectedCat: string) => {
    setForm(f => ({
      ...f,
      category: selectedCat,
      subcategory: '', // Reset subcategory when category changes
    }));
    setIsCustomSubcategory(false);
    setCustomSubcategory('');
    setCategoryModalVisible(false);
  };

  const handleSubcategorySelect = (selectedSub: string) => {
    if (selectedSub === 'Other') {
      setIsCustomSubcategory(true);
      setForm(f => ({ ...f, subcategory: customSubcategory || '' }));
    } else {
      setIsCustomSubcategory(false);
      setForm(f => ({ ...f, subcategory: selectedSub }));
    }
    setSubcategoryModalVisible(false);
  };

  const handleCustomSubcategoryChange = (val: string) => {
    setCustomSubcategory(val);
    setForm(f => ({ ...f, subcategory: val }));
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
      const voiceImg = x.imageUrl;
      if (voiceImg) {
        setImages(prev => [
          {
            id: `voice-${Date.now()}`,
            uri: voiceImg,
            url: voiceImg,
          },
          ...prev.filter(i => i.uri !== voiceImg),
        ]);
      }
    } catch (err: any) {
      setVoiceError(err.message || 'Could not understand that.');
    } finally {
      setVoiceParsing(false);
    }
  };

  const voice = useVoiceInput(handleVoiceResult);

  // ── AI Auto-Fill ─────────────────────────────────────────────────────────
  const handleAiAutoFill = async (fileAsset?: Asset) => {
    const firstAsset = images.find(img => img.asset)?.asset;
    const targetAsset = fileAsset || firstAsset;
    if (!targetAsset) {
      pickImage(false, true);
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

      const ext = data.extracted || {};
      const targetCat = ext.category || form.category;
      const targetSub = ext.subcategory || form.subcategory;
      const schema = getCategoryAttributes(targetCat, targetSub);
      const matched = matchExtractedToAttributes(schema, ext);

      if (targetSub) {
        const subs = getSubcategories(targetCat);
        if (subs.includes(targetSub)) {
          setIsCustomSubcategory(false);
          setCustomSubcategory('');
        } else {
          setIsCustomSubcategory(true);
          setCustomSubcategory(targetSub);
        }
      }

      setForm(f => ({
        ...f,
        title: ext.productName || f.title,
        category: targetCat || f.category,
        subcategory: targetSub || f.subcategory,
        brand: ext.brand || matched.brand || f.brand,
        price: ext.price ? String(ext.price) : f.price,
        discountedPrice: ext.discountedPrice ? String(ext.discountedPrice) : f.discountedPrice,
        description: ext.description || f.description,
      }));

      setDynamicAttributes(prev => ({
        ...prev,
        ...matched,
      }));

      const aiImg = ext.imageUrl;
      if (aiImg) {
        setImages(prev => [
          {
            id: `ai-${Date.now()}`,
            uri: aiImg,
            url: aiImg,
          },
          ...prev.filter(i => i.uri !== aiImg && (!targetAsset?.uri || (i.uri !== targetAsset.uri && i.asset?.uri !== targetAsset.uri))),
        ]);
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
      ? await launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 0, maxWidth: 1600, maxHeight: 1600 });
    if (res.didCancel || res.errorCode) return;
    const assets = res.assets || [];
    if (assets.length > 0) {
      if (autoScan) {
        handleAiAutoFill(assets[0]);
      } else {
        const newItems: ProductImageItem[] = assets.map((asset, i) => ({
          id: `asset-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          uri: asset.uri || '',
          asset,
        }));
        setImages(prev => [...newItems, ...prev]);
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setImages(prev => [
      {
        id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        uri: trimmed,
        url: trimmed,
      },
      ...prev,
    ]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title || !form.title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (form.title.trim().length < 2) {
      setError('Product title must be at least 2 characters.');
      return;
    }
    if (!form.category || !form.category.trim()) {
      setError('Please select a product category.');
      return;
    }
    if (isCustomSubcategory && !customSubcategory.trim()) {
      setError('Please specify the custom subcategory.');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }
    if (form.discountedPrice) {
      const disc = Number(form.discountedPrice);
      if (isNaN(disc) || disc < 0) {
        setError('Discounted price must be a valid positive number.');
        return;
      }
      if (disc >= Number(form.price)) {
        setError('Discounted price must be less than the regular price.');
        return;
      }
    }
    if (form.storePrice) {
      const sp = Number(form.storePrice);
      if (isNaN(sp) || sp <= 0) {
        setError('Store price must be a valid positive number.');
        return;
      }
    }
    if (form.storeDiscountedPrice) {
      const sdp = Number(form.storeDiscountedPrice);
      const basePrice = form.storePrice ? Number(form.storePrice) : Number(form.price);
      if (isNaN(sdp) || sdp < 0) {
        setError('Store discounted price must be a valid positive number.');
        return;
      }
      if (sdp >= basePrice) {
        setError('Store discounted price must be less than the store price.');
        return;
      }
    }
    if (form.totalStock) {
      const stock = Number(form.totalStock);
      if (isNaN(stock) || stock < 0) {
        setError('Stock quantity cannot be negative.');
        return;
      }
    }
    if (form.moq) {
      const moqVal = Number(form.moq);
      if (isNaN(moqVal) || moqVal < 1) {
        setError('Minimum Order Quantity (MOQ) must be at least 1.');
        return;
      }
    }
    if (bulkTiers && bulkTiers.length > 0) {
      for (const tier of bulkTiers) {
        if (tier.minQty || tier.price) {
          if (!tier.minQty || isNaN(Number(tier.minQty)) || Number(tier.minQty) <= 1) {
            setError('Bulk tier minimum quantity must be greater than 1.');
            return;
          }
          if (!tier.price || isNaN(Number(tier.price)) || Number(tier.price) <= 0) {
            setError('Bulk tier price must be greater than 0.');
            return;
          }
        }
      }
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'imageUrl') return;
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

      // Append multiple image assets & retained URLs
      const retainedUrls: string[] = [];
      images.forEach(img => {
        if (img.asset?.uri) {
          fd.append('images', {
            uri: img.asset.uri,
            name: img.asset.fileName || 'product.jpg',
            type: img.asset.type || 'image/jpeg',
          } as any);
        } else if (img.url) {
          retainedUrls.push(img.url);
        }
      });
      fd.append('images', JSON.stringify(retainedUrls));
      if (retainedUrls.length > 0) {
        fd.append('imageUrl', retainedUrls[0]);
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
                {images.some(img => img.asset) ? 'Auto-fill from current photo' : 'Upload photo & Auto-fill'}
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

      {/* Product Photos Section */}
      <View style={styles.card}>
        <View style={styles.photosHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Product Photos ({images.length})</Text>
            <Text style={styles.photosSubtext}>First photo is the primary cover photo.</Text>
          </View>
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => pickImage(true)}
            >
              <Camera size={13} color="#fff" />
              <Text style={styles.photoActionButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoActionButton, styles.galleryActionButton]}
              onPress={() => pickImage(false)}
            >
              <ImageIcon size={13} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={[styles.photoActionButtonText, styles.galleryActionButtonText]}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* URL Input Row */}
        <View style={styles.urlInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Or paste image URL (https://...)"
            placeholderTextColor="#9CA3AF"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
          />
          <TouchableOpacity
            style={[styles.addUrlBtn, !newImageUrl.trim() && { opacity: 0.5 }]}
            onPress={handleAddUrl}
            disabled={!newImageUrl.trim()}
          >
            <Text style={styles.addUrlBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Thumbnails List */}
        {images.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyPhotoBox}
            onPress={() =>
              Alert.alert('Add Product Photo', 'Choose source', [
                { text: 'Camera', onPress: () => pickImage(true) },
                { text: 'Gallery', onPress: () => pickImage(false) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
          >
            <ImageIcon size={28} color={CustomerColors.textSecondary} />
            <Text style={styles.emptyPhotoText}>Tap to add product photos</Text>
            <Text style={styles.emptyPhotoSubtext}>Upload multiple photos from gallery or camera</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsScroll}
          >
            {images.map((img, idx) => (
              <View key={img.id} style={[styles.thumbCard, idx === 0 && styles.coverThumbCard]}>
                <Image source={{ uri: resolveImageUrl(img.uri) || img.uri }} style={styles.thumbImage} resizeMode="cover" />

                {/* Cover Badge or Set Cover Button */}
                {idx === 0 ? (
                  <View style={styles.coverBadge}>
                    <Star size={9} color="#fff" />
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.setCoverBtn}
                    onPress={() => handleSetCover(idx)}
                  >
                    <Star size={9} color="#D97706" />
                    <Text style={styles.setCoverBtnText}>Cover</Text>
                  </TouchableOpacity>
                )}

                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => handleRemoveImage(img.id)}
                >
                  <Trash2 size={11} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add More Tile */}
            <TouchableOpacity
              style={styles.addMoreTile}
              onPress={() =>
                Alert.alert('Add More Photos', 'Choose source', [
                  { text: 'Camera', onPress: () => pickImage(true) },
                  { text: 'Gallery', onPress: () => pickImage(false) },
                  { text: 'Cancel', style: 'cancel' },
                ])
              }
            >
              <Plus size={18} color={CustomerColors.teal700} />
              <Text style={styles.addMoreText}>Add More</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
          <Text style={(isCustomSubcategory || form.subcategory) ? styles.selectText : styles.placeholderText}>
            {!form.category
              ? 'Select Category first'
              : isCustomSubcategory
              ? 'Other'
              : form.subcategory || 'Select Subcategory'}
          </Text>
          <ChevronDown size={18} color={CustomerColors.textSecondary} />
        </TouchableOpacity>

        {isCustomSubcategory && (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={styles.fieldLabel}>Custom Subcategory *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter custom subcategory"
              placeholderTextColor="#9CA3AF"
              value={customSubcategory}
              onChangeText={handleCustomSubcategoryChange}
            />
          </View>
        )}

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
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1.2 }}>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Stock Unit</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setStockUnitModalVisible(true)}
            >
              <Text style={styles.selectText} numberOfLines={1}>
                {form.stockUnit || 'Count'}
              </Text>
              <ChevronDown size={18} color={CustomerColors.textSecondary} />
            </TouchableOpacity>
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
                value={
                  dynamicAttributes[field.key] ??
                  dynamicAttributes[field.key.toLowerCase()] ??
                  dynamicAttributes[field.label] ??
                  dynamicAttributes[field.label.toLowerCase()] ??
                  (field.key.toLowerCase() === 'brand' ? form.brand : '') ??
                  ''
                }
                onChangeText={v => handleAttributeChange(field.key, v)}
              />
            </View>
          ))}
        </View>
      )}

      {/* MOQ & Bulk Pricing */}
      {!isStoreOwner && (
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
      )}

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
              data={[...subcategoryOptions, 'Other']}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isActive = (isCustomSubcategory && item === 'Other') || (!isCustomSubcategory && form.subcategory === item);
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
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
                      <Check size={16} color={CustomerColors.teal700} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Stock Unit Modal */}
      <Modal
        visible={stockUnitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStockUnitModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStockUnitModalVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stock Unit</Text>
              <TouchableOpacity onPress={() => setStockUnitModalVisible(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={STOCK_UNIT_OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    set('stockUnit', item);
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
                    <Check size={16} color={CustomerColors.teal700} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : '#F8FAFC' },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  aiCard: {
    backgroundColor: isDark ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA',
    borderColor: isDark ? '#115E59' : '#99F6E4',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  aiCardTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  aiCardSubtitle: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.teal700, marginBottom: Spacing.sm },
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
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
    borderColor: isDark ? '#991B1B' : '#FECACA',
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
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#F0FDF4',
    borderColor: isDark ? '#166534' : '#BBF7D0',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: { color: isDark ? '#4ADE80' : CustomerColors.teal700, fontSize: FontSizes.xs, fontWeight: '600', flex: 1 },
  voiceSection: {
    backgroundColor: isDark ? '#111827' : '#fff',
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
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
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#fff',
  },
  voiceLangChipActive: { backgroundColor: CustomerColors.teal700, borderColor: CustomerColors.teal700 },
  voiceLangText: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
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
    backgroundColor: isDark ? '#111827' : '#fff',
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
    marginBottom: Spacing.md,
  },
  fieldBlock: { marginBottom: Spacing.sm },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: isDark ? '#1F2937' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: isDark ? '#FFFFFF' : CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#1F2937' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  disabledBtn: { opacity: 0.5, backgroundColor: isDark ? '#111827' : '#F8FAFC' },
  selectText: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black, fontWeight: '600' },
  placeholderText: { fontSize: FontSizes.sm, color: isDark ? '#94A3B8' : '#9CA3AF' },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  photosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  photosSubtext: { fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 1 },
  photoActionsRow: { flexDirection: 'row', gap: 6 },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.teal700,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  galleryActionButton: {
    backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#99F6E4',
  },
  photoActionButtonText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  galleryActionButtonText: { color: isDark ? '#2DD4BF' : CustomerColors.teal700 },

  urlInputRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', marginBottom: Spacing.sm },
  addUrlBtn: {
    backgroundColor: isDark ? '#374151' : '#F1F5F9',
    borderWidth: 1,
    borderColor: isDark ? '#4B5563' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black },

  emptyPhotoBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
    marginVertical: 4,
  },
  emptyPhotoText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black, marginTop: Spacing.xs },
  emptyPhotoSubtext: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },

  thumbnailsScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4 },
  thumbCard: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
    position: 'relative',
  },
  coverThumbCard: {
    borderColor: CustomerColors.teal700,
    borderWidth: 2,
  },
  thumbImage: { width: '100%', height: '100%' },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: CustomerColors.teal700,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  coverBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  setCoverBtn: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  setCoverBtnText: { color: '#D97706', fontSize: 9, fontWeight: '700' },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(220,38,38,0.85)',
    padding: 3,
    borderRadius: 4,
  },
  addMoreTile: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addMoreText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: isDark ? '#111827' : '#fff', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '75%', paddingBottom: Spacing.xl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F1F5F9' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F8FAFC' },
  modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  modalItemTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '800' },
  modalEmpty: { textAlign: 'center', color: isDark ? '#9CA3AF' : '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});