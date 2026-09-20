import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput,
  ActivityIndicator, Modal, FlatList, Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Upload, RefreshCw, CheckCircle2, Trash2, Plus, AlertCircle, ImageIcon, ListChecks, Camera, Check, ChevronDown, X } from 'lucide-react-native';
import { getCategories, getSubcategories } from '../../utils/categoryAttributes';
import { STOCK_UNIT_OPTIONS } from '../../utils/productForm';

import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { sellerAiApi } from '../../api/sellerApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { requestCameraPermission } from '../../utils/permissions';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';

type Row = {
  id: string; title: string; category: string; subcategory?: string; price: string; discountedPrice: string;
  description: string; brand: string; imageUrl: string; totalStock: string;
  stockUnit: string; unit: string; availability: string; tags: string; moq: string;
};
type FailedItem = { name: string; reason: string };
type Step = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error';

const blankRow = (overrides: Partial<Row> = {}): Row => ({
  id: `${Date.now()}-${Math.random()}`, title: '', category: '', subcategory: '', price: '', discountedPrice: '',
  description: '', brand: '', imageUrl: '', totalStock: '', stockUnit: 'Count', unit: 'Count', availability: 'In Stock', tags: '', moq: '1',
  ...overrides,
});

export default function SellerBulkScanUploadScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { store, categories, refresh } = useSellerDashboard();
  const { token, user } = useAuth();
  const isStoreOwner = user?.role === 'store_owner';

  const [asset, setAsset] = useState<Asset | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [initialExtractedRows, setInitialExtractedRows] = useState<Row[]>([]);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [summary, setSummary] = useState<{ added: number; failed: FailedItem[] }>({ added: 0, failed: [] });
  const [activeCategoryRowId, setActiveCategoryRowId] = useState<string | null>(null);
  const [activeSubcategoryRowId, setActiveSubcategoryRowId] = useState<string | null>(null);
  const [activeStockUnitRowId, setActiveStockUnitRowId] = useState<string | null>(null);
  const [isCustomSubRows, setIsCustomSubRows] = useState<Record<string, boolean>>({});
  const [customSubs, setCustomSubs] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(() => {
    const predefined = getCategories();
    const dynamic = (categories || []).map((c: any) => c.name).filter(Boolean);
    return Array.from(new Set([...predefined, ...dynamic]));
  }, [categories]);

  const reset = () => {
    setAsset(null); setStep('idle'); setErrMsg(''); setRows([]); setInitialExtractedRows([]); setFailedItems([]);
    setIsCustomSubRows({}); setCustomSubs({});
  };
  const handleRefresh = () => {
    if (initialExtractedRows.length > 0) {
      setRows(JSON.parse(JSON.stringify(initialExtractedRows)));
      setErrMsg('');
    }
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
      ? await launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
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
      const customSubMap: Record<string, boolean> = {};
      const customSubValueMap: Record<string, string> = {};
      const newRows: Row[] = (res.data.products || []).map(p => {
        const cat = p.category || '';
        const rawSub = p.subcategory || '';
        const validSubs = cat ? getSubcategories(cat) : [];
        const isCustom = rawSub && !validSubs.includes(rawSub);
        const row = blankRow({
          title: p.productName || '',
          category: cat,
          subcategory: isCustom ? 'Other' : rawSub,
          description: p.description || '',
          brand: p.brand || '',
          imageUrl: p.imageUrl || '',
          stockUnit: p.stockUnit || p.unit || 'Count',
          unit: p.stockUnit || p.unit || 'Count',
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
      setErrMsg(err.message || 'Something went wrong.');
      setStep('error');
    }
  };

  const createOneProduct = async (row: Row) => {
    const tags = row.tags.split(',').map(t => t.trim()).filter(Boolean);
    const catList = await storeProductApi.getCategories();
    const existing = (catList.data.data || []).find((c: any) => c.name.toLowerCase() === row.category.toLowerCase());
    if (!existing && row.category) await storeProductApi.createCategory(row.category);

    const finalSubcategory = isCustomSubRows[row.id]
      ? (customSubs[row.id]?.trim() || '')
      : (row.subcategory === 'Other' ? '' : (row.subcategory || ''));

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
    fd.append('availability', row.availability);
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
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) missing.push('Price (> ₹0)');
      if (row.totalStock === undefined || row.totalStock === '' || isNaN(Number(row.totalStock)) || Number(row.totalStock) < 0) missing.push('Stock Quantity (>= 0)');
      if (missing.length > 0) {
        errors.push(`• Item #${i + 1} "${row.title || 'Untitled'}": Missing ${missing.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      Alert.alert(
        'Incomplete Product Details',
        'Please provide Title, Price, and Stock Quantity for all items before adding:\n\n' + errors.join('\n')
      );
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
        failed.push({ name: r.title, reason: err?.response?.data?.message || 'Failed' });
      }
    }
    setSummary({ added, failed });
    setStep('done');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      {step === 'idle' && (
        <>
          <TouchableOpacity style={styles.dropZone} activeOpacity={1} onPress={() => pickImage(false)}>
            {asset ? (
              <Image source={{ uri: asset.uri }} style={styles.dropImage} resizeMode="contain" />
            ) : (
              <>
                <ListChecks size={36} color={CustomerColors.teal600} />
                <Text style={styles.dropTitle}>Tap to select invoice, bill, or product list photo</Text>
                <Text style={{ fontSize: 11, color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '600', marginTop: 4 }}>
                  Up to 10 products per scan
                </Text>
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
              <Text style={styles.primaryBtnText}>Scan Product List</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {step === 'scanning' && (
        <View style={styles.infoBanner}>
          <RefreshCw size={18} color={CustomerColors.teal700} />
          <Text style={styles.infoBannerText}>Extracting multiple products from list…</Text>
        </View>
      )}

      {step === 'error' && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color="#FF0000" />
          <Text style={styles.errorBannerText}>{errMsg}</Text>
          <TouchableOpacity onPress={reset}><Text style={styles.warnAddText}>Try again</Text></TouchableOpacity>
        </View>
      )}

      {(step === 'review' || step === 'saving') && (
        <>
          <View style={styles.reviewBanner}>
            <Sparkles size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
            <Text style={styles.reviewBannerText}>Extracted {rows.length} product{rows.length === 1 ? '' : 's'} — fill in missing prices</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
              <RefreshCw size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={styles.refreshBtnText}>Refresh</Text>
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
                  <TouchableOpacity onPress={() => removeRow(row.id)}><Trash2 size={15} color={isDark ? '#94A3B8' : '#9CA3AF'} /></TouchableOpacity>
                </View>
                <View style={styles.rowGrid}>
                  <TextInput style={[styles.smallInput, { flex: 1.1 }]} value={row.price} onChangeText={(v: string) => setRow(row.id, 'price', v)} placeholder="Price ₹ *" keyboardType="numeric" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} />
                  <TextInput style={[styles.smallInput, { flex: 1 }]} value={row.totalStock} onChangeText={(v: string) => setRow(row.id, 'totalStock', v)} placeholder="Stock Qty *" keyboardType="numeric" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} />
                  <TouchableOpacity
                    style={[styles.smallInput, { flex: 1, justifyContent: 'center' }]}
                    onPress={() => setActiveStockUnitRowId(row.id)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text
                        style={{
                          fontSize: 12,
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
                    <TextInput style={[styles.smallInput, { flex: 0.8 }]} value={row.moq} onChangeText={(v: string) => setRow(row.id, 'moq', v)} placeholder="MOQ" keyboardType="numeric" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} />
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
                          fontSize: 12,
                          color: row.category ? (isDark ? '#FFFFFF' : CustomerColors.black) : (isDark ? '#94A3B8' : '#9CA3AF'),
                          fontWeight: row.category ? '600' : 'normal',
                        }}
                        numberOfLines={1}
                      >
                        {row.category || 'Category'}
                      </Text>
                      <ChevronDown size={14} color={isDark ? '#94A3B8' : CustomerColors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallInput, { flex: 1, justifyContent: 'center' }]}
                    onPress={() => setActiveSubcategoryRowId(row.id)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: (isCustomSubRows[row.id] || row.subcategory) ? (isDark ? '#FFFFFF' : CustomerColors.black) : (isDark ? '#94A3B8' : '#9CA3AF'),
                          fontWeight: (isCustomSubRows[row.id] || row.subcategory) ? '600' : 'normal',
                        }}
                        numberOfLines={1}
                      >
                        {isCustomSubRows[row.id] ? (customSubs[row.id] ? `Other (${customSubs[row.id]})` : 'Other') : (row.subcategory || 'Subcategory')}
                      </Text>
                      <ChevronDown size={14} color={isDark ? '#94A3B8' : CustomerColors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  <TextInput style={[styles.smallInput, { flex: 0.9 }]} value={row.brand} onChangeText={(v: string) => setRow(row.id, 'brand', v)} placeholder="Brand" placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'} />
                </View>
                {isCustomSubRows[row.id] && (
                  <TextInput
                    style={[styles.smallInput, { marginTop: 4 }]}
                    value={customSubs[row.id] || ''}
                    onChangeText={(v: string) => setCustomSubs(prev => ({ ...prev, [row.id]: v }))}
                    placeholder="Enter Custom Subcategory *"
                    placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  />
                )}
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
            <TouchableOpacity style={styles.cancelBtn} disabled={step === 'saving'} onPress={() => navigation.goBack()}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
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
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: CustomerColors.teal600, flex: 1 }]} onPress={async () => { await refresh(); navigation.goBack(); }}>
              <Check size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category Modal Picker */}
      <Modal visible={activeCategoryRowId !== null} transparent animationType="slide" onRequestClose={() => setActiveCategoryRowId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setActiveCategoryRowId(null)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Array.from(new Set([...categoryOptions, ...(rows.find(r => r.id === activeCategoryRowId)?.category ? [rows.find(r => r.id === activeCategoryRowId)!.category] : [])]))}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const currentRow = rows.find(r => r.id === activeCategoryRowId);
                const isSelected = currentRow?.category === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemActive,
                    ]}
                    onPress={() => {
                      if (activeCategoryRowId) {
                        setRow(activeCategoryRowId, 'category', item);
                        setRow(activeCategoryRowId, 'subcategory', '');
                        setIsCustomSubRows(prev => ({ ...prev, [activeCategoryRowId]: false }));
                        setCustomSubs(prev => ({ ...prev, [activeCategoryRowId]: '' }));
                      }
                      setActiveCategoryRowId(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal Picker */}
      <Modal visible={activeSubcategoryRowId !== null} transparent animationType="slide" onRequestClose={() => setActiveSubcategoryRowId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setActiveSubcategoryRowId(null)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={(() => {
                const currentRow = rows.find(r => r.id === activeSubcategoryRowId);
                const base = currentRow?.category ? getSubcategories(currentRow.category) : [];
                return [...base, 'Other'];
              })()}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const currentRow = rows.find(r => r.id === activeSubcategoryRowId);
                const isSelected = isCustomSubRows[activeSubcategoryRowId || '']
                  ? item === 'Other'
                  : currentRow?.subcategory === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemActive,
                    ]}
                    onPress={() => {
                      if (activeSubcategoryRowId) {
                        if (item === 'Other') {
                          setIsCustomSubRows(prev => ({ ...prev, [activeSubcategoryRowId]: true }));
                          setRow(activeSubcategoryRowId, 'subcategory', 'Other');
                        } else {
                          setIsCustomSubRows(prev => ({ ...prev, [activeSubcategoryRowId]: false }));
                          setRow(activeSubcategoryRowId, 'subcategory', item);
                        }
                      }
                      setActiveSubcategoryRowId(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
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
      <Modal visible={activeStockUnitRowId !== null} transparent animationType="slide" onRequestClose={() => setActiveStockUnitRowId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stock Unit</Text>
              <TouchableOpacity onPress={() => setActiveStockUnitRowId(null)}>
                <X size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={STOCK_UNIT_OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const currentRow = rows.find(r => r.id === activeStockUnitRowId);
                const isSelected = (currentRow?.stockUnit || 'Count') === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemActive,
                    ]}
                    onPress={() => {
                      if (activeStockUnitRowId) {
                        setRow(activeStockUnitRowId, 'stockUnit', item);
                        setRow(activeStockUnitRowId, 'unit', item);
                      }
                      setActiveStockUnitRowId(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(45, 212, 191, 0.2)' : '#CCFBF1',
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  rowCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: isDark ? '#111827' : '#fff',
  },
  rowThumb: { width: 56, height: 56, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowThumbImg: { width: '100%', height: '100%' },
  rowTitleLine: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowGrid: { flexDirection: 'row', gap: 6 },
  smallInput: {
    flex: 1,
    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  emptyText: { textAlign: 'center', color: isDark ? '#9CA3AF' : '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
  warnBox: {
    backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB',
    borderWidth: 1,
    borderColor: isDark ? '#92400E' : '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  warnTitle: { fontSize: 11, fontWeight: '700', color: isDark ? '#FBBF24' : '#92400E' },
  warnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  warnRowText: { flex: 1, fontSize: 11, color: isDark ? '#FBBF24' : '#92400E' },
  warnAddText: { fontSize: 11, fontWeight: '700', color: CustomerColors.teal700 },
  warnText: { fontSize: FontSizes.sm, color: isDark ? '#FBBF24' : '#D97706', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
  },
  cancelBtnText: { color: isDark ? '#9CA3AF' : '#4B5563', fontWeight: '700', fontSize: FontSizes.sm },
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
  successText: { fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, fontSize: FontSizes.md, textAlign: 'center' },
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