import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Upload, RefreshCw, CheckCircle2, Trash2, Plus, AlertCircle, ImageIcon } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/seller/page.tsx's SellerSmartUploadModal.
// createOneSellerProduct on web also does a categories check/create — kept
// here via productApi.getCategories()/createCategory() inline.
//
// Uses react-native-image-picker (not expo-image-picker), matching this
// app's actual installed library.

type Step = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error';
type Tier = { minQty: string; price: string };

export default function SellerScanUploadScreen() {
  const navigation = useNavigation<any>();
  const { store, categories, refresh } = useSellerDashboard();
  const { token } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [engine, setEngine] = useState('');
  const [form, setForm] = useState({
    title: '', category: '', price: '', discountedPrice: '', description: '',
    brand: '', imageUrl: '', totalStock: '', availability: 'In Stock', tags: '', moq: '1',
  });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const addTier = () => setTiers(t => [...t, { minQty: '', price: '' }]);
  const removeTier = (i: number) => setTiers(t => t.filter((_, idx) => idx !== i));
  const setTier = (i: number, k: keyof Tier, v: string) => setTiers(t => t.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const reset = () => {
    setAsset(null);
    setStep('idle');
    setErrMsg('');
    setEngine('');
    setForm({ title: '', category: '', price: '', discountedPrice: '', description: '', brand: '', imageUrl: '', totalStock: '', availability: 'In Stock', tags: '', moq: '1' });
    setTiers([]);
  };

  const pickImage = async (fromCamera: boolean) => {
    const res = fromCamera
      ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
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
      setForm({
        title: x.productName || '', category: x.category || '',
        price: String(x.price || ''), discountedPrice: String(x.discountedPrice || x.price || ''),
        description: x.description || '', brand: x.brand || '', imageUrl: x.imageUrl || '',
        totalStock: '', availability: 'In Stock', tags: '', moq: '1',
      });
      setStep('review');
    } catch (err: any) {
      setErrMsg(err.message || 'Something went wrong.');
      setStep('error');
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.price) return;
    setStep('saving');
    try {
      const catList = await storeProductApi.getCategories();
      const existing = (catList.data.data || []).find((c: any) => c.name.toLowerCase() === form.category.toLowerCase());
      if (!existing && form.category) await storeProductApi.createCategory(form.category);

      const fd = new FormData();
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const validTiers = tiers.filter(t => t.minQty && t.price);
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('discountedPrice', String(Number(form.discountedPrice) || Number(form.price)));
      fd.append('description', form.description);
      fd.append('brand', form.brand);
      fd.append('storeId', store._id);
      fd.append('availability', form.availability);
      fd.append('totalStock', String(Number(form.totalStock) || 0));
      fd.append('moq', String(Number(form.moq) || 1));
      if (tags.length) fd.append('tags', JSON.stringify(tags));
      if (validTiers.length) fd.append('bulkPricing', JSON.stringify(validTiers.map(t => ({ minQty: Number(t.minQty), price: Number(t.price) }))));
      if (form.imageUrl) fd.append('imageUrl', form.imageUrl);

      await storeProductApi.create(fd);
      setStep('done');
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to create product.');
      setStep('error');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      {(step === 'idle' || step === 'scanning' || step === 'error') && (
        <>
          <View style={styles.dropZone}>
            {asset?.uri ? (
              <Image source={{ uri: asset.uri }} style={styles.dropImage} resizeMode="contain" />
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Upload size={26} color={CustomerColors.teal600} />
                <Text style={styles.dropTitle}>Add a photo of the paper label / handwritten note</Text>
              </View>
            )}
          </View>
          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}><Text style={styles.pickBtnText}>Take Photo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}><Text style={styles.pickBtnText}>Choose from Gallery</Text></TouchableOpacity>
          </View>
          {step === 'scanning' && (
            <View style={styles.infoBanner}><RefreshCw size={16} color={CustomerColors.teal700} /><Text style={styles.infoBannerText}>Reading your paper…</Text></View>
          )}
          {step === 'error' && (
            <View style={styles.errorBanner}><AlertCircle size={16} color="#FF0000" /><Text style={styles.errorBannerText}>{errMsg}</Text></View>
          )}
          <TouchableOpacity style={[styles.primaryBtn, !asset && styles.btnDisabled]} disabled={!asset || step === 'scanning'} onPress={handleScan}>
            {step === 'scanning' ? <ActivityIndicator color="#fff" size="small" /> : <><Sparkles size={15} color="#fff" /><Text style={styles.primaryBtnText}>Scan & Extract Details</Text></>}
          </TouchableOpacity>
        </>
      )}

      {(step === 'review' || step === 'saving') && (
        <>
          <View style={styles.reviewBanner}>
            <CheckCircle2 size={14} color={CustomerColors.teal700} />
            <Text style={styles.reviewBannerText}>Details extracted — review and correct if needed</Text>
            {engine ? <Text style={styles.engineBadge}>via {engine}</Text> : null}
          </View>

          <View style={styles.imageRow}>
            <View style={styles.thumbBox}>
              {form.imageUrl ? <Image source={{ uri: form.imageUrl }} style={styles.thumbImg} /> : <ImageIcon size={18} color="#CBD5E1" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Product Image URL</Text>
              <TextInput style={styles.input} value={form.imageUrl} onChangeText={(t: string) => set('imageUrl', t)} placeholder="Auto-fetched" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <Field label="Product Title *" value={form.title} onChangeText={(t: string) => set('title', t)} />
          <View style={styles.row2}>
            <Field style={{ flex: 1 }} label="Price (₹) *" value={form.price} onChangeText={(t: string) => set('price', t)} keyboardType="numeric" />
            <Field style={{ flex: 1 }} label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={(t: string) => set('discountedPrice', t)} keyboardType="numeric" />
          </View>
          <View style={styles.row2}>
            <Field style={{ flex: 1 }} label="Category" value={form.category} onChangeText={(t: string) => set('category', t)} />
            <Field style={{ flex: 1 }} label="Brand" value={form.brand} onChangeText={(t: string) => set('brand', t)} />
          </View>
          <View style={styles.row2}>
            <Field style={{ flex: 1 }} label="Stock Quantity" value={form.totalStock} onChangeText={(t: string) => set('totalStock', t)} keyboardType="numeric" />
            <Field style={{ flex: 1 }} label="Availability" value={form.availability} onChangeText={(t: string) => set('availability', t)} />
          </View>
          <Field label="Tags (comma-separated)" value={form.tags} onChangeText={(t: string) => set('tags', t)} />
          <Field label="Description" value={form.description} onChangeText={(t: string) => set('description', t)} multiline />

          <View style={styles.divider} />
          <Field label="Minimum Order Quantity (MOQ) *" value={form.moq} onChangeText={(t: string) => set('moq', t)} keyboardType="numeric" />
          <Text style={styles.label}>Bulk Pricing Tiers</Text>
          {tiers.map((t, i) => (
            <View key={i} style={styles.tierRow}>
              <TextInput style={[styles.input, { flex: 1 }]} value={t.minQty} onChangeText={(v: string) => setTier(i, 'minQty', v)} placeholder="Min qty" keyboardType="numeric" />
              <Text style={styles.tierAt}>units @ ₹</Text>
              <TextInput style={[styles.input, { flex: 1 }]} value={t.price} onChangeText={(v: string) => setTier(i, 'price', v)} placeholder="Price" keyboardType="numeric" />
              <TouchableOpacity onPress={() => removeTier(i)}><Trash2 size={16} color="#9CA3AF" /></TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addTier}><Text style={styles.addTierText}>+ Add tier</Text></TouchableOpacity>

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
            <TouchableOpacity style={styles.secondaryBtn} onPress={reset}><Text style={styles.secondaryBtnText}>Scan Another</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: CustomerColors.teal600 }]} onPress={async () => { await refresh(); navigation.goBack(); }}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[{ marginBottom: Spacing.sm }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline && { height: 70, textAlignVertical: 'top' }]} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  dropZone: { minHeight: 160, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  dropImage: { width: '100%', height: 160, borderRadius: BorderRadius.md },
  dropTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: '#374151', textAlign: 'center' },
  pickRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  pickBtn: { flex: 1, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: 'center' },
  pickBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#374151' },
  infoBanner: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#99F6E4', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  infoBannerText: { color: CustomerColors.teal700, fontWeight: '700', fontSize: FontSizes.sm },
  errorBanner: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  errorBannerText: { color: '#FF0000', fontSize: FontSizes.sm, flex: 1 },
  primaryBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', paddingVertical: 13, borderRadius: BorderRadius.md },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  btnDisabled: { opacity: 0.5 },
  reviewBanner: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#99F6E4', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  reviewBannerText: { flex: 1, fontSize: 11, fontWeight: '700', color: CustomerColors.teal700 },
  engineBadge: { fontSize: 9, fontWeight: '800', color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  imageRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  thumbBox: { width: 72, height: 72, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 9, fontSize: FontSizes.sm, color: CustomerColors.black },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: Spacing.md },
  tierRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  tierAt: { fontSize: 11, color: '#9CA3AF' },
  addTierText: { color: CustomerColors.teal600, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  secondaryBtn: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  secondaryBtnText: { color: '#374151', fontWeight: '700', fontSize: FontSizes.sm },
  successCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  successText: { fontWeight: '800', color: CustomerColors.black, fontSize: FontSizes.md },
});