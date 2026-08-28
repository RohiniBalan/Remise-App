import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Upload, RefreshCw, CheckCircle2, Trash2, Plus, AlertCircle, ImageIcon, ListChecks, Camera } from 'lucide-react-native';

import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { requestCameraPermission } from '../../utils/permissions';

// Ported from client/app/store/seller/page.tsx's SellerBulkSmartUploadModal
// + its shared createOneSellerProduct helper (reimplemented as
// createOneProduct below since it needs RN FormData semantics).
//
// Uses react-native-image-picker (not expo-image-picker), matching this
// app's actual installed library.

type Row = {
  id: string; title: string; category: string; price: string; discountedPrice: string;
  description: string; brand: string; imageUrl: string; totalStock: string;
  availability: string; tags: string; moq: string;
};
type FailedItem = { name: string; reason: string };
type Step = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error';

const blankRow = (overrides: Partial<Row> = {}): Row => ({
  id: `${Date.now()}-${Math.random()}`, title: '', category: '', price: '', discountedPrice: '',
  description: '', brand: '', imageUrl: '', totalStock: '', availability: 'In Stock', tags: '', moq: '1',
  ...overrides,
});

export default function SellerBulkScanUploadScreen() {
  const navigation = useNavigation<any>();
  const { store, refresh } = useSellerDashboard();
  const { token } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [summary, setSummary] = useState<{ added: number; failed: FailedItem[] }>({ added: 0, failed: [] });

  const reset = () => {
    setAsset(null); setStep('idle'); setErrMsg(''); setRows([]); setFailedItems([]);
  };
  const setRow = (id: string, k: keyof Row, v: string) => setRows(rs => rs.map(r => (r.id === id ? { ...r, [k]: v } : r)));
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
      ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.didCancel || res.errorCode) return;
    const picked = res.assets?.[0];
    if (picked) {
      setAsset(picked); setStep('idle'); setErrMsg('');
    }
  };

  const handleScan = async () => {
    if (!asset?.uri) return;
    setStep('scanning');
    setErrMsg('');
    try {
      const fd = new FormData();
      fd.append('image', { uri: asset.uri, name: asset.fileName || 'list.jpg', type: asset.type || 'image/jpeg' } as any);
      const res = await sellerAiApi.scanProductList(fd);
      if (!res.data.success) throw new Error(res.data.message || 'Scan failed.');
      const newRows: Row[] = (res.data.products || []).map(p =>
        blankRow({ title: p.productName || '', category: p.category || '', description: p.description || '', brand: p.brand || '', imageUrl: p.imageUrl || '' }),
      );
      setRows(newRows);
      setFailedItems(res.data.failed || []);
      setStep('review');
    } catch (err: any) {
      setErrMsg(err.message || 'Something went wrong.');
      setStep('error');
    }
  };

  const createOneProduct = async (row: Row) => {
    const tags = row.tags.split(',').map(t => t.trim()).filter(Boolean);
    const catList = await storeProductApi.getCategories();
    const existing = (catList.data.data || []).find((c: any) => c.name.toLowerCase() === row.category.toLowerCase());
    if (!existing && row.category) await storeProductApi.createCategory(row.category);

    const fd = new FormData();
    fd.append('title', row.title);
    fd.append('category', row.category);
    fd.append('price', row.price);
    fd.append('discountedPrice', String(Number(row.discountedPrice) || Number(row.price)));
    fd.append('description', row.description);
    fd.append('brand', row.brand);
    fd.append('storeId', store._id);
    fd.append('availability', row.availability);
    fd.append('totalStock', String(Number(row.totalStock) || 0));
    fd.append('moq', String(Number(row.moq) || 1));
    if (tags.length) fd.append('tags', JSON.stringify(tags));
    if (row.imageUrl) fd.append('imageUrl', row.imageUrl);
    await storeProductApi.create(fd);
  };

  const handleAddAll = async () => {
    setStep('saving');
    let added = 0;
    const failed: FailedItem[] = [];
    for (const row of rows) {
      if (!row.title || !row.price) {
        failed.push({ name: row.title || '(unnamed)', reason: 'Missing name or price.' });
        continue;
      }
      try {
        await createOneProduct(row);
        added++;
      } catch (err: any) {
        failed.push({ name: row.title, reason: err?.response?.data?.message || err.message || 'Failed to create product.' });
      }
    }
    setSummary({ added, failed: [...failedItems, ...failed] });
    setStep('done');
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
                <ListChecks size={26} color={CustomerColors.teal600} />
                <Text style={styles.dropTitle}>Photograph a product list, invoice, or catalog sheet</Text>
              </View>
            )}
          </View>
          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
              <Camera size={15} color={CustomerColors.teal700} />
              <Text style={styles.pickBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
              <ImageIcon size={15} color={CustomerColors.teal700} />
              <Text style={styles.pickBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {step === 'scanning' && (
            <View style={styles.infoBanner}><RefreshCw size={16} color={CustomerColors.teal700} /><Text style={styles.infoBannerText}>Reading your list…</Text></View>
          )}
          {step === 'error' && (
            <View style={styles.errorBanner}><AlertCircle size={16} color="#FF0000" /><Text style={styles.errorBannerText}>{errMsg}</Text></View>
          )}
          <TouchableOpacity style={[styles.primaryBtn, !asset && styles.btnDisabled]} disabled={!asset || step === 'scanning'} onPress={handleScan}>
            {step === 'scanning' ? <ActivityIndicator color="#fff" size="small" /> : <><Sparkles size={15} color="#fff" /><Text style={styles.primaryBtnText}>Scan & Extract Products</Text></>}
          </TouchableOpacity>
        </>
      )}

      {(step === 'review' || step === 'saving') && (
        <>
          <View style={styles.reviewBanner}>
            <CheckCircle2 size={14} color={CustomerColors.teal700} />
            <Text style={styles.reviewBannerText}>{rows.length} product{rows.length === 1 ? '' : 's'} detected — review, set price/MOQ, then add all</Text>
          </View>

          {rows.map(row => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.rowThumb}>
                {row.imageUrl ? <Image source={{ uri: row.imageUrl }} style={styles.rowThumbImg} /> : <ImageIcon size={16} color="#CBD5E1" />}
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.rowTitleLine}>
                  <TextInput style={[styles.smallInput, { flex: 1, fontWeight: '700' }]} value={row.title} onChangeText={(v: string) => setRow(row.id, 'title', v)} placeholder="Product name *" placeholderTextColor="#9CA3AF" />
                  <TouchableOpacity onPress={() => removeRow(row.id)}><Trash2 size={15} color="#9CA3AF" /></TouchableOpacity>
                </View>
                <View style={styles.rowGrid}>
                  <TextInput style={styles.smallInput} value={row.price} onChangeText={(v: string) => setRow(row.id, 'price', v)} placeholder="Price ₹ *" keyboardType="numeric" placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.smallInput} value={row.totalStock} onChangeText={(v: string) => setRow(row.id, 'totalStock', v)} placeholder="Stock qty" keyboardType="numeric" placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.smallInput} value={row.moq} onChangeText={(v: string) => setRow(row.id, 'moq', v)} placeholder="MOQ" keyboardType="numeric" placeholderTextColor="#9CA3AF" />
                </View>
                <View style={styles.rowGrid}>
                  <TextInput style={styles.smallInput} value={row.category} onChangeText={(v: string) => setRow(row.id, 'category', v)} placeholder="Category" placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.smallInput} value={row.brand} onChangeText={(v: string) => setRow(row.id, 'brand', v)} placeholder="Brand" placeholderTextColor="#9CA3AF" />
                </View>
              </View>
            </View>
          ))}
          {rows.length === 0 && <Text style={styles.emptyText}>No products left to add.</Text>}

          {failedItems.length > 0 && (
            <View style={styles.warnBox}>
              <Text style={styles.warnTitle}>Couldn't confidently identify {failedItems.length} item{failedItems.length === 1 ? '' : 's'}:</Text>
              {failedItems.map(f => (
                <View key={f.name} style={styles.warnRow}>
                  <Text style={styles.warnRowText} numberOfLines={1}>{f.name} — {f.reason}</Text>
                  <TouchableOpacity onPress={() => addManually(f.name)}><Text style={styles.warnAddText}>Add manually</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {step === 'saving' && (
            <View style={styles.infoBanner}><RefreshCw size={16} color={CustomerColors.teal700} /><Text style={styles.infoBannerText}>Adding products…</Text></View>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} disabled={step === 'saving'} onPress={reset}><Text style={styles.secondaryBtnText}>← Rescan</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, rows.length === 0 && styles.btnDisabled]} disabled={rows.length === 0 || step === 'saving'} onPress={handleAddAll}>
              {step === 'saving' ? <ActivityIndicator color="#fff" size="small" /> : <><Plus size={14} color="#fff" /><Text style={styles.primaryBtnText}>Add All Products ({rows.length})</Text></>}
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 'done' && (
        <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl }}>
          <View style={styles.successCircle}><CheckCircle2 size={30} color="#16A34A" /></View>
          <Text style={styles.successText}>{summary.added} product{summary.added === 1 ? '' : 's'} added successfully!</Text>
          {summary.failed.length > 0 && <Text style={styles.warnText}>{summary.failed.length} could not be added</Text>}
          {summary.failed.length > 0 && (
            <View style={styles.warnBox}>
              {summary.failed.map((f, i) => <Text key={i} style={styles.warnRowText}><Text style={{ fontWeight: '700' }}>{f.name}</Text> — {f.reason}</Text>)}
            </View>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={reset}><Text style={styles.secondaryBtnText}>Scan Another List</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: CustomerColors.teal600 }]} onPress={async () => { await refresh(); navigation.goBack(); }}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  dropZone: { minHeight: 160, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  dropImage: { width: '100%', height: 160, borderRadius: BorderRadius.md },
  dropTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: '#374151', textAlign: 'center' },
  pickRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  pickBtn: { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: 'center' },

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
  rowCard: { flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm, backgroundColor: '#fff' },
  rowThumb: { width: 56, height: 56, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowThumbImg: { width: '100%', height: '100%' },
  rowTitleLine: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowGrid: { flexDirection: 'row', gap: 6 },
  smallInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, color: CustomerColors.black },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
  warnBox: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 6, marginBottom: Spacing.sm },
  warnTitle: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  warnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  warnRowText: { flex: 1, fontSize: 11, color: '#92400E' },
  warnAddText: { fontSize: 11, fontWeight: '700', color: CustomerColors.teal700 },
  warnText: { fontSize: FontSizes.sm, color: '#D97706', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  secondaryBtn: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  secondaryBtnText: { color: '#374151', fontWeight: '700', fontSize: FontSizes.sm },
  successCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  successText: { fontWeight: '800', color: CustomerColors.black, fontSize: FontSizes.md, textAlign: 'center' },
});