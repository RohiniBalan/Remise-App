import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import { MapPin, Satellite, ImageIcon } from 'lucide-react-native';
import { storeApi } from '../../api/storeApi';
import { offersApi } from '../../api/offersApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useStoreDashboard } from '../../context/StoreDashboardContext';

// Ported from client/app/store/offers/new/page.tsx — same field set,
// same "offer price must be < original price" validation, same
// store-location vs GPS vs manual location-source tracking for the
// notification target coordinates. "Scan Paper Offer" (Next.js-only
// /api/smart-offer-scan) has no mobile-reachable route — same caveat as
// the other AI-scan features — the manual form is fully implemented.
async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function NewOfferScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { refresh } = useStoreDashboard();
  const [store, setStore] = useState<any>(null);
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ title: '', description: '', category: 'General', originalPrice: '', offerPrice: '', validUntil: '' });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locSource, setLocSource] = useState<'store' | 'gps' | 'manual'>('store');

  const targetCustomerId = route.params?.customerId;
const targetCustomerName = route.params?.customerName;

  useEffect(() => {
    storeApi
      .getMyStore()
      .then(res => {
        const s = res.data.data;
        setStore(s);
        setLongitude(String(s.location.coordinates[0]));
        setLatitude(String(s.location.coordinates[1]));
        setLocSource('store');
      })
      .catch(() => navigation.replace('StoreRegister'));
  }, []);

  const resetToStoreLocation = () => {
    if (!store) return;
    setLongitude(String(store.location.coordinates[0]));
    setLatitude(String(store.location.coordinates[1]));
    setLocSource('store');
  };

  const detectGPS = async () => {
    setDetecting(true);
    const granted = await requestLocationPermission();
    if (!granted) {
      setDetecting(false);
      setError('Could not detect GPS location. Enter coordinates manually.');
      return;
    }
    Geolocation.getCurrentPosition(
      pos => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setLocSource('gps');
        setDetecting(false);
      },
      () => {
        setError('Could not detect GPS location. Enter coordinates manually.');
        setDetecting(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (uri) setImgUri(uri);
  };

  const discount = form.originalPrice && form.offerPrice
    ? Math.max(0, Math.round(((+form.originalPrice - +form.offerPrice) / +form.originalPrice) * 100))
    : 0;

  const handleSubmit = async () => {
    if (!imgUri) { setError('Please upload an offer image.'); return; }
    if (!store) { setError('Store not found.'); return; }
    if (!latitude || !longitude) { setError('Notification coordinates are required.'); return; }
    if (!form.title.trim() || !form.originalPrice || !form.offerPrice || !form.validUntil) { setError('Please fill in all required fields.'); return; }
    if (+form.offerPrice >= +form.originalPrice) { setError('Offer price must be less than original price.'); return; }

    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', { uri: imgUri, name: 'offer.jpg', type: 'image/jpeg' } as any);
      fd.append('storeId', store._id);
      fd.append('storeName', store.name);
      fd.append('latitude', latitude);
      fd.append('longitude', longitude);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
if (targetCustomerId) {
  fd.append('targetCustomerId', targetCustomerId);
  fd.append('targetCustomerName', targetCustomerName || '');
}
await offersApi.create(fd);
      refresh();
      Alert.alert('Offer published!', 'Customers near you will be notified.');
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish offer.');
    } finally {
      setLoading(false);
    }
  };

  if (!store) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.teal700} />
        <Text style={styles.loadingText}>Loading store info…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

{targetCustomerId ? (
  <View style={styles.privateBanner}>
    <Text style={styles.privateBannerText}>
      Creating a private offer — only <Text style={{ fontWeight: '800' }}>{targetCustomerName}</Text> will see it.
    </Text>
  </View>
) : null}

      <Text style={styles.label}>Offer Image *</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {imgUri ? <Image source={{ uri: imgUri }} style={styles.imagePreview} /> : <ImageIcon size={26} color="#D1D5DB" />}
      </TouchableOpacity>

      <Field label="Offer Title *" value={form.title} onChangeText={v => set('title', v)} placeholder="e.g. 20% off all groceries" />
      <Field label="Category" value={form.category} onChangeText={v => set('category', v)} placeholder="e.g. Groceries" />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 70 }]} multiline value={form.description} onChangeText={v => set('description', v)} />

      <View style={styles.row2}>
        <Field label="Original Price (₹) *" value={form.originalPrice} onChangeText={v => set('originalPrice', v)} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Offer Price (₹) *" value={form.offerPrice} onChangeText={v => set('offerPrice', v)} keyboardType="numeric" style={{ flex: 1 }} />
      </View>
      {form.originalPrice && form.offerPrice ? (
        <Text style={styles.discountText}>
          Customers save ₹{(+form.originalPrice - +form.offerPrice).toFixed(0)} · {discount}% off
        </Text>
      ) : null}

      <Field label="Valid Until * (YYYY-MM-DDTHH:mm)" value={form.validUntil} onChangeText={v => set('validUntil', v)} placeholder="2026-08-01T18:00" />

      <View style={styles.locationSection}>
        <Text style={styles.label}>Notification Target Location *</Text>
        <View style={styles.locBtnRow}>
          <TouchableOpacity style={styles.locBtn} onPress={resetToStoreLocation}>
            <MapPin size={13} color={CustomerColors.teal700} />
            <Text style={styles.locBtnText}>Use Store Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locBtn} onPress={detectGPS} disabled={detecting}>
            {detecting ? <ActivityIndicator size="small" color={CustomerColors.teal700} /> : <Satellite size={13} color={CustomerColors.teal700} />}
            <Text style={styles.locBtnText}>Use My Current GPS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sourceBadge}><Text style={styles.sourceBadgeText}>Source: {locSource}</Text></View>
        <View style={styles.row2}>
          <Field label="Latitude *" value={latitude} onChangeText={setLatitude} keyboardType="numeric" style={{ flex: 1 }} />
          <Field label="Longitude *" value={longitude} onChangeText={setLongitude} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publish Offer</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg, gap: Spacing.sm },
  loadingText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm },
  errorText: { color: CustomerColors.primary, backgroundColor: CustomerColors.dangerBg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, fontSize: FontSizes.sm },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  imageBox: { width: 96, height: 96, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: CustomerColors.steelBorder, borderStyle: 'dashed', backgroundColor: CustomerColors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: Spacing.md },
  imagePreview: { width: '100%', height: '100%' },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  discountText: { fontSize: FontSizes.xs, color: CustomerColors.teal700, fontWeight: '600', marginTop: -Spacing.sm, marginBottom: Spacing.md },
  locationSection: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: Spacing.md, marginTop: Spacing.sm },
  locBtnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  locBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  locBtnText: { fontSize: FontSizes.xs, color: CustomerColors.teal700, fontWeight: '600' },
  sourceBadge: { alignSelf: 'flex-start', backgroundColor: CustomerColors.bg, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.pill, marginBottom: Spacing.md },
  sourceBadgeText: { fontSize: 10, color: CustomerColors.textSecondary, fontWeight: '600' },
  submitBtn: { backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.lg },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
  privateBanner: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
privateBannerText: { fontSize: FontSizes.xs, color: '#92400E' },
});
