import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Save, Trash2, Plus, Mic, MicOff, RefreshCw, ImageIcon, AlertCircle } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { useVoiceInput, VOICE_LANGUAGES, VoiceLanguageOption } from '../../hooks/useVoiceInput';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Ported from client/app/store/seller/page.tsx's SellerProductModal.
// Web renders this as a centered modal overlay; here it's a pushed stack
// screen (SellerNavigator.tsx), same as StoreProductFormScreen already does
// for the store-owner side.
//
// Uses react-native-image-picker (not expo-image-picker) and this app's
// real useVoiceInput hook (listening/transcript/partialTranscript/error/
// start/stop — no `supported` flag, no `interimTranscript`), matching what
// StoreProductFormScreen already uses.

type BulkTier = { minQty: string; price: string };

export default function SellerProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;
  const initialTitle = route.params?.initialTitle;
  const initialCategory = route.params?.initialCategory;
  const isEdit = !!product;

  const { store, categories, refresh } = useSellerDashboard();
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: product?.title || initialTitle || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    discountedPrice: product?.discountedPrice ? String(product.discountedPrice) : '',
    category: product?.category || initialCategory || '',
    brand: product?.brand || '',
    totalStock: product?.totalStock ? String(product.totalStock) : '',
    availability: product?.availability || 'In Stock',
    tags: product?.tags?.join(', ') || '',
    moq: product?.moq ? String(product.moq) : '1',
  });
  const [bulkTiers, setBulkTiers] = useState<BulkTier[]>(
    product?.bulkPricing?.map((t: any) => ({ minQty: String(t.minQty), price: String(t.price) })) || [],
  );
  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  const [preview, setPreview] = useState<string>(product?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(VOICE_LANGUAGES[0]);
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const addTier = () => setBulkTiers(t => [...t, { minQty: '', price: '' }]);
  const removeTier = (i: number) => setBulkTiers(t => t.filter((_, idx) => idx !== i));
  const setTier = (i: number, k: keyof BulkTier, v: string) =>
    setBulkTiers(t => t.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const handleVoiceResult = async (text: string) => {
    setVoiceParsing(true);
    setVoiceError('');
    try {
      const res = await sellerAiApi.parseVoiceProduct(text, voiceLang.short);
      if (!res.data.success) throw new Error(res.data.message || "Could not understand that.");
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

  const pickImage = async (fromCamera: boolean) => {
    const res = fromCamera
      ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.didCancel || res.errorCode) return;
    const asset = res.assets?.[0];
    if (asset) {
      setImageAsset(asset);
      setPreview(asset.uri || '');
    }
  };

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
      const validTiers = bulkTiers.filter(t => t.minQty && t.price);
      if (validTiers.length) {
        fd.append('bulkPricing', JSON.stringify(validTiers.map(t => ({ minQty: Number(t.minQty), price: Number(t.price) }))));
      }
      if (imageAsset?.uri) {
        fd.append('image', {
          uri: imageAsset.uri,
          name: imageAsset.fileName || 'product.jpg',
          type: imageAsset.type || 'image/jpeg',
        } as any);
      }

      if (isEdit) await storeProductApi.update(product._id, fd);
      else await storeProductApi.create(fd);

      await refresh();
      navigation.goBack();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      {error ? (
        <View style={styles.errorBox}>
          <AlertCircle size={14} color="#FF0000" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Voice fill */}
      <View style={styles.voiceCard}>
        <View style={styles.voiceLangRow}>
          {VOICE_LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              disabled={voice.listening || voiceParsing}
              onPress={() => setVoiceLang(l)}
              style={[styles.langChip, voiceLang.code === l.code && styles.langChipActive]}
            >
              <Text style={[styles.langChipText, voiceLang.code === l.code && styles.langChipTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          disabled={voiceParsing}
          onPress={() => (voice.listening ? voice.stop() : voice.start(voiceLang))}
          style={[styles.voiceBtn, voice.listening && styles.voiceBtnActive]}
        >
          {voiceParsing ? (
            <><RefreshCw size={14} color="#fff" /><Text style={styles.voiceBtnText}>Understanding…</Text></>
          ) : voice.listening ? (
            <><MicOff size={14} color="#fff" /><Text style={styles.voiceBtnText}>Stop</Text></>
          ) : (
            <><Mic size={14} color="#fff" /><Text style={styles.voiceBtnText}>Speak product details</Text></>
          )}
        </TouchableOpacity>
        {voice.listening && <Text style={styles.listeningText}>Listening… "{voice.partialTranscript || voice.transcript || '…'}"</Text>}
        {(voice.error || voiceError) ? <Text style={styles.voiceError}>{voice.error || voiceError}</Text> : null}
      </View>

      {/* Image */}
      <Text style={styles.label}>Product Image</Text>
      <View style={styles.imageRow}>
        <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(false)}>
          {preview ? <Image source={{ uri: preview }} style={styles.imagePreview} /> : <ImageIcon size={22} color="#CBD5E1" />}
        </TouchableOpacity>
        <View style={styles.imageBtnCol}>
          <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(false)}><Text style={styles.imageBtnText}>Choose from Gallery</Text></TouchableOpacity>
          <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(true)}><Text style={styles.imageBtnText}>Take Photo</Text></TouchableOpacity>
        </View>
      </View>

      <Field label="Product Title *" value={form.title} onChangeText={(t: string) => set('title', t)} placeholder="e.g. Organic Face Moisturizer" />
      <Field label="Description" value={form.description} onChangeText={(t: string) => set('description', t)} multiline />
      <View style={styles.row2}>
        <Field style={{ flex: 1 }} label="Price (₹) *" value={form.price} onChangeText={(t: string) => set('price', t)} keyboardType="numeric" />
        <Field style={{ flex: 1 }} label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={(t: string) => set('discountedPrice', t)} keyboardType="numeric" />
      </View>
      <Field label="Category" value={form.category} onChangeText={(t: string) => set('category', t)} placeholder={categories.map((c: any) => c.name).join(', ') || 'e.g. Groceries'} />
      <Field label="Brand" value={form.brand} onChangeText={(t: string) => set('brand', t)} />
      <View style={styles.row2}>
        <Field style={{ flex: 1 }} label="Stock Quantity" value={form.totalStock} onChangeText={(t: string) => set('totalStock', t)} keyboardType="numeric" />
        <Field style={{ flex: 1 }} label="Availability" value={form.availability} onChangeText={(t: string) => set('availability', t)} placeholder="In Stock / Out Of Stock / Pre Order" />
      </View>
      <Field label="Tags (comma-separated)" value={form.tags} onChangeText={(t: string) => set('tags', t)} />

      <View style={styles.divider} />
      <Field label="Minimum Order Quantity (MOQ) *" value={form.moq} onChangeText={(t: string) => set('moq', t)} keyboardType="numeric" />

      <Text style={styles.label}>Bulk Pricing Tiers</Text>
      {bulkTiers.map((t, i) => (
        <View key={i} style={styles.tierRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={t.minQty} onChangeText={(v: string) => setTier(i, 'minQty', v)} placeholder="Min qty" keyboardType="numeric" />
          <Text style={styles.tierAt}>units @ ₹</Text>
          <TextInput style={[styles.input, { flex: 1 }]} value={t.price} onChangeText={(v: string) => setTier(i, 'price', v)} placeholder="Price" keyboardType="numeric" />
          <TouchableOpacity onPress={() => removeTier(i)}><Trash2 size={16} color="#9CA3AF" /></TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addTier}><Text style={styles.addTierText}>+ Add tier</Text></TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.saveBtn} disabled={saving} onPress={handleSubmit}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <><Save size={14} color="#fff" /><Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Product'}</Text></>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[{ marginBottom: Spacing.sm }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline && { height: 80, textAlignVertical: 'top' }]} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  errorBox: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  errorText: { color: '#FF0000', fontSize: FontSizes.xs, flex: 1 },
  voiceCard: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.md, gap: 8 },
  voiceLangRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  langChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder },
  langChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  langChipText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  langChipTextActive: { color: '#fff' },
  voiceBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: 10, borderRadius: BorderRadius.md },
  voiceBtnActive: { backgroundColor: '#FF0000' },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  listeningText: { fontSize: 11, color: CustomerColors.teal700 },
  voiceError: { fontSize: 11, color: '#FF0000' },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FontSizes.sm, color: CustomerColors.black },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  imageRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, alignItems: 'center' },
  imagePicker: { width: 96, height: 96, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imageBtnCol: { gap: 8 },
  imageBtn: { borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
  imageBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#374151' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: Spacing.md },
  tierRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  tierAt: { fontSize: 11, color: '#9CA3AF' },
  addTierText: { color: CustomerColors.teal600, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  saveBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', paddingVertical: 14, borderRadius: BorderRadius.md },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  cancelBtnText: { color: '#374151', fontWeight: '700', fontSize: FontSizes.sm },
});