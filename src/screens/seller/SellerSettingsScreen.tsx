import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Save, CheckCircle, QrCode } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { storeApi } from '../../api/storeApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/seller/page.tsx's SellerSettingsTab —
// same UPI_ID_REGEX validation web uses.
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export default function SellerSettingsScreen() {
  const { store, refresh } = useSellerDashboard();
  const [form, setForm] = useState({
    name: store?.name || '',
    description: store?.description || '',
    phone: store?.phone || '',
    email: store?.email || '',
    street: store?.address?.street || '',
    city: store?.address?.city || '',
    state: store?.address?.state || '',
    pinCode: store?.address?.pinCode || '',
    targetRevenue: store?.targetRevenue ? String(store.targetRevenue) : '',
  });
  const [upiId, setUpiId] = useState(store?.upiId || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const upiError = upiId.trim() && !UPI_ID_REGEX.test(upiId.trim()) ? 'Invalid UPI ID format (expected e.g. name@bank).' : '';

  const handleSave = async () => {
    if (upiError) { setError(upiError); return; }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('address[street]', form.street);
      fd.append('address[city]', form.city);
      fd.append('address[state]', form.state);
      fd.append('address[pinCode]', form.pinCode);
      fd.append('targetRevenue', form.targetRevenue);
      fd.append('upiId', upiId.trim());
      await storeApi.update(store._id, fd);
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Profile</Text>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Field label="Business Name *" value={form.name} onChangeText={(t: string) => set('name', t)} />
        <Field label="Monthly Revenue Target (₹)" value={form.targetRevenue} onChangeText={(t: string) => set('targetRevenue', t)} keyboardType="numeric" placeholder="e.g. 50000" />
        <Field label="Description" value={form.description} onChangeText={(t: string) => set('description', t)} multiline />
        <View style={styles.row2}>
          <Field style={{ flex: 1 }} label="Phone" value={form.phone} onChangeText={(t: string) => set('phone', t)} keyboardType="phone-pad" />
          <Field style={{ flex: 1 }} label="Email" value={form.email} onChangeText={(t: string) => set('email', t)} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <Field label="Pin Code" value={form.pinCode} onChangeText={(t: string) => set('pinCode', t)} keyboardType="numeric" />
        <Field label="Street" value={form.street} onChangeText={(t: string) => set('street', t)} />
        <View style={styles.row2}>
          <Field style={{ flex: 1 }} label="City" value={form.city} onChangeText={(t: string) => set('city', t)} />
          <Field style={{ flex: 1 }} label="State" value={form.state} onChangeText={(t: string) => set('state', t)} />
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>UPI Payment QR Code</Text>
        <Text style={styles.sectionHint}>Enter your UPI ID to generate a scannable QR code for order payments.</Text>
        <View style={styles.upiRow}>
          <View style={styles.qrBox}>
            {store?.qrCodeImage ? <Image source={{ uri: store.qrCodeImage }} style={styles.qrImage} resizeMode="contain" /> : <QrCode size={22} color="#CBD5E1" />}
          </View>
          <View style={{ flex: 1 }}>
            <Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="merchant@upi" autoCapitalize="none" />
            {upiError ? <Text style={styles.upiError}>{upiError}</Text> : null}
            <Text style={styles.sectionHint}>{store?.qrCodeImage ? 'Save changes to regenerate the QR code.' : 'Save a valid UPI ID to generate your QR code.'}</Text>
          </View>
        </View>

        <View style={styles.saveRow}>
          <TouchableOpacity style={styles.saveBtn} disabled={saving} onPress={handleSave}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <><Save size={14} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
          </TouchableOpacity>
          {saved && (
            <View style={styles.savedRow}><CheckCircle size={14} color="#16A34A" /><Text style={styles.savedText}>Saved!</Text></View>
          )}
        </View>
      </View>
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
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md },
  cardTitle: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.sm },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  errorText: { color: '#FF0000', fontSize: FontSizes.sm },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FontSizes.sm, color: CustomerColors.black },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: Spacing.md },
  sectionLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: '#374151', marginBottom: 4 },
  sectionHint: { fontSize: 11, color: '#9CA3AF', marginBottom: Spacing.sm },
  upiRow: { flexDirection: 'row', gap: Spacing.sm },
  qrBox: { width: 96, height: 96, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  qrImage: { width: '100%', height: '100%', backgroundColor: '#fff' },
  upiError: { fontSize: 11, color: '#FF0000', marginTop: 2 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  saveBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF0000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  savedRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  savedText: { color: '#16A34A', fontWeight: '600', fontSize: FontSizes.sm },
});
