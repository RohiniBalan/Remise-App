import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Share, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Plus, Trash2, Check, Share2, Store, ListChecks, ScanLine, Mic, MicOff, HelpCircle, AlertCircle, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { scanBulkList, parseVoiceList } from '../../api/geminiScanApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useVoiceInput, VOICE_LANGUAGES, VoiceLanguageOption } from '../../hooks/useVoiceInput';
import { requestCameraPermission } from '../../utils/permissions';
import BrandHeader from '../../components/common/BrandHeader';

let idCounter = 0;
const uid = () => `item-${++idCounter}-${Date.now()}`;

interface BulkItem {
  id: string;
  name: string;
  brand: string;
  quantity: string;
  checked: boolean;
  needsClarification?: boolean;
}

export default function BulkPurchaseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<BulkItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(VOICE_LANGUAGES[0]);
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const addBlank = () => setItems(prev => [...prev, { id: uid(), name: '', brand: '', quantity: '', checked: false }]);
  const update = (id: string, field: 'name' | 'brand' | 'quantity', value: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value, needsClarification: false } : i)));
  const toggleCheck = (id: string) => setItems(prev => prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clearAll = () => setItems([]);

  const handleShare = async () => {
    const text = items.map((it, i) => `${i + 1}. ${it.name}${it.brand ? ` (${it.brand})` : ''}${it.quantity ? ` — ${it.quantity}` : ''}`).join('\n');
    if (!text) return;
    try {
      await Share.share({ message: `Monthly / Bulk Purchase List\n\n${text}` });
    } catch {
      // user cancelled
    }
  };

  const runScan = async (base64: string, mimeType: string) => {
    setScanning(true);
    try {
      const scanned = await scanBulkList(base64, mimeType);
      if (scanned.length === 0) {
        Alert.alert('No items found', "Couldn't read any list items from that photo. Try a clearer photo or add items manually.");
        return;
      }
      setItems(prev => [...prev, ...scanned.map(it => ({ id: uid(), name: it.name, brand: '', quantity: it.quantity, checked: false }))]);
    } catch (err: any) {
      Alert.alert('Scan failed', err?.message || 'Could not read the list from that photo. Try Add Item to enter it manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleVoiceResult = useCallback(async (text: string) => {
    setVoiceParsing(true);
    setVoiceError('');
    try {
      const parsed = await parseVoiceList(text, voiceLang.short);
      if (parsed.length === 0) {
        Alert.alert('No items found', "Couldn't make out any items in that — try again or add items manually.");
        return;
      }
      setItems(prev => [...prev, ...parsed.map(it => ({ id: uid(), name: it.name, brand: '', quantity: it.quantity, checked: false, needsClarification: it.needsClarification }))]);
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not understand that.');
    } finally {
      setVoiceParsing(false);
    }
  }, [voiceLang]);

  const voice = useVoiceInput(handleVoiceResult);

  const handleCameraScan = async () => {
    setShowScanModal(false);
    const granted = await requestCameraPermission();
    if (!granted) return;
    const res = await launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.8, saveToPhotos: false });
    const asset = res.assets?.[0];
    if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
    else if (res.errorMessage) Alert.alert('Camera unavailable', res.errorMessage);
  };

  const handleGalleryScan = async () => {
    setShowScanModal(false);
    const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.8 });
    const asset = res.assets?.[0];
    if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
  };


  const handleCompare = () => {
    if (items.length === 0) return;
    navigation.navigate('CompareStores', {
      items: items.map(it => ({ name: it.name, brand: it.brand, quantity: it.quantity })),
      purchaseType: 'bulk',
      onSuccess: () => setItems([]),
    });
  };


  const checkedCount = items.filter(i => i.checked).length;

  return (
    <View style={styles.container}>
      <BrandHeader />
      <View style={styles.hero}>
        <View style={styles.heroIcon}><ListChecks size={24} color={CustomerColors.teal600} /></View>
        <Text style={styles.heroTitle}>Monthly / Bulk Purchase</Text>
        <Text style={styles.heroSubtitle}>Build a shopping list, then compare nearby stores and place a smart order.</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanModal(true)} disabled={scanning}>
          {scanning ? <ActivityIndicator size="small" color="#fff" /> : <ScanLine size={15} color="#fff" />}
          <Text style={styles.scanBtnText}>{scanning ? 'Scanning…' : 'Scan Paper List'}</Text>
        </TouchableOpacity>

      </View>

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
            {voiceParsing ? 'Understanding…' : voice.listening ? 'Stop' : 'Speak your list'}
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

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <ListChecks size={44} color={CustomerColors.steelBorder} />
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>Add items manually to get started</Text>
          <TouchableOpacity style={styles.addBtn} onPress={addBlank}>
            <Plus size={15} color={CustomerColors.black} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.toolbarText}>
              {items.length} item{items.length !== 1 ? 's' : ''}
              {checkedCount > 0 ? ` · ${checkedCount} checked` : ''}
            </Text>
            <View style={styles.toolbarActions}>
              <TouchableOpacity style={styles.iconAction} onPress={addBlank}><Plus size={14} color={CustomerColors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity style={styles.iconAction} onPress={handleShare}><Share2 size={14} color={CustomerColors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity style={styles.iconAction} onPress={clearAll}><Trash2 size={14} color={CustomerColors.primary} /></TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.row, item.checked && styles.rowChecked, item.needsClarification && styles.rowFlagged]}>
                {/* Checkbox */}
                <TouchableOpacity style={[styles.checkbox, item.checked && styles.checkboxChecked]} onPress={() => toggleCheck(item.id)}>
                  {item.checked && <Check size={11} color="#fff" strokeWidth={3} />}
                </TouchableOpacity>
                {item.needsClarification && <HelpCircle size={13} color="#D97706" />}

                {/* Fields column */}
                <View style={styles.fieldsCol}>
                  {/* Row 1: [Name + Brand column] + [Qty column] */}
                  <View style={styles.nameQtyRow}>
                    {/* Left: name on top, brand below */}
                    <View style={styles.nameBrandCol}>
                      <TextInput
                        style={styles.nameInput}
                        value={item.name}
                        onChangeText={v => update(item.id, 'name', v)}
                        placeholder="Item name"
                        placeholderTextColor="#D1D5DB"
                      />
                      <TextInput
                        style={styles.brandInput}
                        value={item.brand}
                        onChangeText={v => update(item.id, 'brand', v)}
                        placeholder="Brand (optional)"
                        placeholderTextColor="#D1D5DB"
                      />
                    </View>
                    {/* Right: Qty */}
                    <TextInput
                      style={styles.qtyInput}
                      value={item.quantity}
                      onChangeText={v => update(item.id, 'quantity', v)}
                      placeholder="Qty"
                      placeholderTextColor="#D1D5DB"
                    />
                  </View>
                </View>

                {/* Delete */}
                <TouchableOpacity onPress={() => remove(item.id)}><Trash2 size={15} color="#D1D5DB" /></TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.compareBtn} onPress={handleCompare}>
              <Store size={16} color="#fff" />
              <Text style={styles.compareBtnText}>Find Cheapest Store & Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Camera & Scan Modal */}
      <Modal visible={showScanModal} transparent animationType="fade" onRequestClose={() => setShowScanModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <ScanLine size={20} color={CustomerColors.teal600} />
                <Text style={styles.modalTitle}>Scan Purchase List</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScanModal(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Take a clear photo of your paper list or upload an existing photo.
            </Text>

            <TouchableOpacity style={styles.cameraActionBtn} onPress={handleCameraScan}>
              <Camera size={18} color="#fff" />
              <Text style={styles.cameraActionBtnText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.galleryActionBtn} onPress={handleGalleryScan}>
              <ImageIcon size={18} color={CustomerColors.teal700} />
              <Text style={styles.galleryActionBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  hero: { backgroundColor: CustomerColors.white, borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder, padding: Spacing.lg, alignItems: 'flex-start' },
  heroIcon: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  heroTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.black },
  heroSubtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.md },
  scanBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: CustomerColors.teal600, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  voiceBox: { backgroundColor: CustomerColors.white, borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder, padding: Spacing.md, gap: Spacing.sm },
  voiceLangRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  langChip: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  langChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  langChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.textSecondary },
  langChipTextActive: { color: '#fff' },
  voiceBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  voiceBtnActive: { backgroundColor: CustomerColors.primary },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  voiceListening: { fontSize: FontSizes.xs, color: CustomerColors.teal700 },
  voiceErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceErrorText: { fontSize: FontSizes.xs, color: CustomerColors.primary, flex: 1 },
  emptyState: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.xs },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151', marginTop: Spacing.sm },
  emptySubtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginBottom: Spacing.md },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  addBtnText: { fontWeight: '700', fontSize: FontSizes.xs, color: '#374151' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  toolbarText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  toolbarActions: { flexDirection: 'row', gap: Spacing.xs },
  iconAction: { width: 30, height: 30, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.sm, marginBottom: Spacing.xs },
  rowChecked: { opacity: 0.5 },
  rowFlagged: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  fieldsCol: { flex: 1, gap: 4 },
  nameQtyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  nameBrandCol: { flex: 1, gap: 2 },
  nameInput: { flex: 1, fontSize: FontSizes.sm, fontWeight: '500', color: '#1F2937' },
  qtyInput: { width: 64, fontSize: FontSizes.sm, color: CustomerColors.teal700, fontWeight: '600', textAlign: 'right' },
  brandInput: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, paddingVertical: 0 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.md, backgroundColor: CustomerColors.bg, borderTopWidth: 1, borderTopColor: CustomerColors.steelBorder },
  compareBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  compareBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  cameraActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  cameraActionBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: CustomerColors.steelBorder },
  orText: { fontSize: 11, color: CustomerColors.textSecondary, fontWeight: '600' },
  galleryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  galleryActionBtnText: { color: CustomerColors.teal700, fontSize: FontSizes.sm, fontWeight: '700' },
});

