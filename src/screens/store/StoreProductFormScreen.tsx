import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ImageIcon, Save, Mic, MicOff, AlertCircle, Camera } from 'lucide-react-native';

import { storeProductApi } from '../../api/storeProductApi';
import { parseVoiceProduct, buildGeneratedImageUrl } from '../../api/geminiScanApi';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { buildProductFormData, emptyProductForm, ProductFormFields } from '../../utils/productForm';
import ProductFieldsForm from '../../components/store/ProductFieldsForm';
import { useVoiceInput, VOICE_LANGUAGES, VoiceLanguageOption } from '../../hooks/useVoiceInput';

// Ported from client/app/store/dashboard/page.tsx's ProductModal — same
// field set (title*/description/price*/discountedPrice/category/brand/
// totalStock/availability/tags/image), rendered via the shared
// ProductFieldsForm component also used by StoreBulkProductScanScreen.
export default function StoreProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;
const initialTitle = route.params?.initialTitle;
const initialCategory = route.params?.initialCategory;
// `scanned` prefills from the "Scan Paper" flow; the initialTitle/initialCategory
// branch prefills from "Manage Brands → Add Brand" (title+category locked to the
// product type, brand/price/stock left blank). Neither sets `product`, so
// `isEdit` stays false in both cases — same as web's ProductModal initialTitle prop.
const prefill = product || route.params?.scanned || (initialTitle ? { title: initialTitle, category: initialCategory } : undefined);
const isEdit = Boolean(product?._id);
  const { store, categories, refresh } = useStoreDashboard();

  const [form, setForm] = useState<ProductFormFields>(emptyProductForm(prefill));
  const set = (k: keyof ProductFormFields, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(prefill?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(VOICE_LANGUAGES[0]);
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  // Speak-to-fill: transcript → geminiScanApi.parseVoiceProduct (Gemini
  // translates non-English speech and extracts fields in one call, since
  // this app can't reach the IndicTrans2 service web uses) → bulk-merge
  // into this SAME form state, exactly like the OCR `scanned` prefill
  // above. Reuses `buildGeneratedImageUrl` the same way the bulk-scan flow
  // (StoreProductsScreen.runBulkScan) already does for the image.
  const handleVoiceResult = useCallback(async (text: string) => {
    setVoiceParsing(true);
    setVoiceError('');
    try {
      const x = await parseVoiceProduct(text, voiceLang.short);
      setForm(f => ({
        ...f,
        title:           x.productName || f.title,
        category:        x.category || f.category,
        price:           x.price ? String(x.price) : f.price,
        discountedPrice: x.discountedPrice ? String(x.discountedPrice) : f.discountedPrice,
        totalStock:      x.totalStock ? String(x.totalStock) : f.totalStock,
        description:     x.description || f.description,
        brand:           x.brand || f.brand,
      }));
      if (x.productName) {
        setImageUri(null);
        setImageUrl(buildGeneratedImageUrl(x.productName, x.category));
      }
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not understand that.');
    } finally {
      setVoiceParsing(false);
    }
  }, [voiceLang]);

  const voice = useVoiceInput(handleVoiceResult);

  const pickImage = () => {
    Alert.alert('Product Photo', 'Take a photo of the product with your camera, or choose from gallery.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take Photo',
        onPress: async () => {
          const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          const uri = res.assets?.[0]?.uri;
          if (uri) setImageUri(uri);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          const uri = res.assets?.[0]?.uri;
          if (uri) setImageUri(uri);
        },
      },
    ]);
  };


  const handleSubmit = async () => {
    if (!form.title.trim() || !form.price.trim()) {
      setError('Title and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = buildProductFormData(form, store?._id || '', { imageUri, imageUrl });

      if (isEdit) await storeProductApi.update(product._id, fd);
      else await storeProductApi.create(fd);

      refresh();
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const preview = imageUri || imageUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.voiceBox}>
        <View style={styles.voiceLangRow}>
          {VOICE_LANGUAGES.map(l => (
            <TouchableOpacity key={l.code} onPress={() => setVoiceLang(l)} disabled={voice.listening || voiceParsing}
              style={[styles.langChip, voiceLang.code === l.code && styles.langChipActive]}>
              <Text style={[styles.langChipText, voiceLang.code === l.code && styles.langChipTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.voiceBtn, voice.listening && styles.voiceBtnActive]}
          disabled={voiceParsing}
          onPress={() => (voice.listening ? voice.stop() : voice.start(voiceLang))}
        >
          {voiceParsing
            ? <ActivityIndicator size="small" color="#fff" />
            : voice.listening
            ? <MicOff size={15} color="#fff" />
            : <Mic size={15} color="#fff" />}
          <Text style={styles.voiceBtnText}>
            {voiceParsing ? 'Understanding…' : voice.listening ? 'Stop' : 'Speak product details'}
          </Text>
        </TouchableOpacity>
        {voice.listening && (
          <Text style={styles.voiceListening} numberOfLines={2}>Listening… "{voice.partialTranscript || voice.transcript || '…'}"</Text>
        )}
        {(voice.error || voiceError) ? (
          <View style={styles.voiceErrorRow}>
            <AlertCircle size={11} color={CustomerColors.primary} />
            <Text style={styles.voiceErrorText}>{voice.error || voiceError}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.label}>Product Image</Text>
      <View style={styles.imageRow}>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {preview ? <Image source={{ uri: preview }} style={styles.imagePreview} /> : <ImageIcon size={22} color="#D1D5DB" />}
        </TouchableOpacity>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Or paste image URL" value={imageUrl} onChangeText={v => setImageUrl(v)} />
      </View>

      <ProductFieldsForm form={form} set={set} categories={categories} />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <><Save size={15} color="#fff" /><Text style={styles.submitBtnText}>{isEdit ? 'Save Changes' : 'Add Product'}</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  errorText: { color: CustomerColors.primary, backgroundColor: CustomerColors.dangerBg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, fontSize: FontSizes.sm },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  imageRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  imageBox: { width: 72, height: 72, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: CustomerColors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  submitBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
  voiceBox: { backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  voiceLangRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  langChip: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  langChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  langChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.textSecondary },
  langChipTextActive: { color: '#fff' },
  voiceBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  voiceBtnActive: { backgroundColor: CustomerColors.primary },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  voiceListening: { fontSize: FontSizes.xs, color: CustomerColors.teal700 },
  voiceErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceErrorText: { fontSize: FontSizes.xs, color: CustomerColors.primary, flex: 1 },
});
