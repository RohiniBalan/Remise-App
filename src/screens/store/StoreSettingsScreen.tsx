import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native';
import { QrCode, Save, CheckCircle, RefreshCw, LogOut, ChevronDown, X } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeApi } from '../../api/storeApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { indianStates, getCities } from '../../utils/indiaLocation';
import { mergeCategories } from '../../utils/storeCategories';

const STORE_CATEGORIES = ['Food & Beverages', 'Grocery', 'Fashion', 'Electronics', 'Pharmacy', 'Toys', 'Home & Living', 'Beauty', 'Sports', 'Other'];
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function StoreSettingsScreen() {
  const { store, loading, refresh, categories } = useStoreDashboard();
  const { logout } = useAuth();

  const [form, setForm] = useState({
    name: store?.name || '', description: store?.description || '', phone: store?.phone || '', email: store?.email || '',
    category: store?.category || '', street: store?.address?.street || '', city: store?.address?.city || '',
    state: store?.address?.state || '', pinCode: store?.address?.pinCode || '',
    targetRevenue: store?.targetRevenue ? String(store.targetRevenue) : '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const [upiId, setUpiId] = useState(store?.upiId || '');
  const upiError = upiId.trim() && !UPI_ID_REGEX.test(upiId.trim()) ? 'Invalid UPI ID format (expected e.g. name@bank).' : '';

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [fssai, setFssai] = useState(store?.fssai || '');

  
  const categoryOptions = useMemo(
  () =>
    mergeCategories(categories || []).map(c => ({
      key: c.name,
      label: c.name,
    })),
  [categories]
);

  // ── State/City dropdown support ──
  const [cities, setCities] = useState<any[]>([]);

  const findState = useCallback((value: string) => {
    const v = normalize(value);
    if (!v) return undefined;
    return indianStates.find(s => normalize(s.name) === v || normalize(s.isoCode) === v);
  }, []);

  useEffect(() => {
    if (!form.state) { setCities([]); return; }
    const state = findState(form.state);
    setCities(state ? getCities(state.isoCode) : []);
  }, [form.state, findState]);

  const stateOptions = indianStates.map(s => ({ key: s.isoCode, label: s.name }));
  const cityOptions = cities.map((c: any) => ({ key: c.name, label: c.name }));

  const handleStateSelect = (isoCode: string, label: string) => {
    setForm(f => ({ ...f, state: label, city: '', pinCode: '' }));
    setCities(getCities(isoCode));
  };

  const handleCitySelect = async (cityName: string) => {
    set('city', cityName);
    if (!cityName) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        set('pinCode', data[0].PostOffice[0].Pincode);
      }
    } catch {
      // pincode lookup is best-effort — leave existing value on failure
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.teal700} /></View>;
  }

  const handleSignOut = async () => {
    await logout();
  };

  const handleSave = async () => {
    if (upiError) { setError(upiError); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('category', form.category);
      fd.append('address[street]', form.street);
      fd.append('address[city]', form.city);
      fd.append('address[state]', form.state);
      fd.append('address[pinCode]', form.pinCode);
      fd.append('targetRevenue', form.targetRevenue);
      fd.append('upiId', upiId.trim());
      fd.append('fssai', form.category === 'Food & Beverages' ? fssai.trim() : '');
      await storeApi.update(store._id, fd);
      setSaved(true);
      refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      <Text style={styles.sectionTitle}>Store Profile</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Field label="Store Name *" value={form.name} onChangeText={v => set('name', v)} />
      <Field
        label="Monthly Revenue Target (₹)"
        value={form.targetRevenue}
        onChangeText={v => set('targetRevenue', v)}
        keyboardType="numeric"
        placeholder="e.g. 100000"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 70 }]} multiline value={form.description} onChangeText={v => set('description', v)} />
      <Field label="Phone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
      <Field label="Email" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" />

      <SelectField
  label="Category"
  value={form.category}
  placeholder="Select Category"
  options={categoryOptions}
  onSelect={(key) => set('category', key)}
/>

      {form.category === 'Food & Beverages' && (
  <Field
    label="FSSAI License Number"
    value={fssai}
    onChangeText={setFssai}
    keyboardType="number-pad"
    maxLength={14}
    placeholder="14-digit FSSAI number"
  />
)}

      <Field label="Street" value={form.street} onChangeText={v => set('street', v)} />

      <SelectField
        label="State"
        value={form.state}
        placeholder="Select State"
        options={stateOptions}
        onSelect={handleStateSelect}
      />
      <SelectField
        label="City"
        value={form.city}
        placeholder={form.state ? 'Select City' : 'Select a state first'}
        options={cityOptions}
        disabled={!form.state}
        onSelect={handleCitySelect}
      />

      <Field label="Pin Code" value={form.pinCode} onChangeText={v => set('pinCode', v)} keyboardType="numeric" />

      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>UPI Payment QR Code</Text>
        <Text style={styles.qrSubtitle}>Enter your UPI ID to generate a scannable QR code. Customers who choose QR payment will see this.</Text>
        <View style={styles.qrRow}>
          <View style={styles.qrPreviewBox}>
            {store?.qrCodeImage ? <Image source={{ uri: store.qrCodeImage }} style={styles.qrPreviewImage} /> : <QrCode size={22} color="#D1D5DB" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} placeholder="merchant@upi" autoCapitalize="none" />
            {upiError ? <Text style={styles.errorText}>{upiError}</Text> : null}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : saved ? <><CheckCircle size={15} color="#fff" /><Text style={styles.saveBtnText}>Saved!</Text></> : <><Save size={15} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
      </TouchableOpacity>

      <View style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Verification Status</Text>
        {store?.isVerified ? (
          <View style={styles.verifiedBanner}><CheckCircle size={16} color={CustomerColors.success} /><Text style={styles.verifiedText}>Your store is verified</Text></View>
        ) : (
          <View style={styles.pendingBanner}><RefreshCw size={16} color="#D97706" /><Text style={styles.pendingText}>Verification pending — our team typically verifies stores within 24–48 hours.</Text></View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={16} color={CustomerColors.primary} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

// Modal-based dropdown since RN has no native <select>.
function SelectField({
  label, value, placeholder, options, disabled, onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.key}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { onSelect(item.key, item.label); setOpen(false); }}
                >
                  <Text style={[styles.modalItemText, item.label === value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.modalEmpty}>No options found</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.md },
  errorText: { color: CustomerColors.primary, fontSize: FontSizes.xs, marginBottom: Spacing.sm },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm, marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  chipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  chipText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  qrSection: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: Spacing.md, marginTop: Spacing.sm },
  qrTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#374151' },
  qrSubtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  qrRow: { flexDirection: 'row', gap: Spacing.md },
  qrPreviewBox: { width: 72, height: 72, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: CustomerColors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  qrPreviewImage: { width: '100%', height: '100%' },
  saveBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.lg },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
  verificationCard: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.lg, marginTop: Spacing.lg },
  verificationTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.sm },
  verifiedBanner: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', backgroundColor: CustomerColors.successBg, padding: Spacing.md, borderRadius: BorderRadius.md },
  verifiedText: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.success },
  pendingBanner: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', backgroundColor: '#FFFBEB', padding: Spacing.md, borderRadius: BorderRadius.md },
  pendingText: { flex: 1, fontSize: FontSizes.xs, color: '#92400E' },
  signOutBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.dangerBg },
  signOutText: { color: CustomerColors.primary, fontWeight: '700', fontSize: FontSizes.sm },

  // ── SelectField / modal ──
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.sm, color: CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#9CA3AF', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, maxHeight: '70%', paddingBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});