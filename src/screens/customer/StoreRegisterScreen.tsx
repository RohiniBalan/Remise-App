import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import { Store, MapPin, Camera, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { storeApi } from '../../api/storeApi';
import SuccessModal from '../../components/common/SuccessModal';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

// Ported from client/app/store/register/page.tsx — same field set, same
// lat/lng validity guard against corrupted GPS readings, same
// register-then-immediately-upgrade-role-via-fresh-token flow
// (storeApi.register returns a new JWT with role: 'store_owner', which we
// feed straight into AuthContext.login() — AppNavigator's RoleGate then
// switches to StoreOwnerNavigator automatically, no explicit navigation
// needed, same as web relying on the next render).
const CATEGORIES = [
  'Food & Beverages',
  'Grocery',
  'Fashion',
  'Electronics',
  'Pharmacy',
  'Toys',
  'Home & Living',
  'Beauty',
  'Sports',
  'Other',
];

const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  lat >= -90 &&
  lat <= 90 &&
  Number.isFinite(lng) &&
  lng >= -180 &&
  lng <= 180;

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function StoreRegisterScreen() {
  const navigation = useNavigation<any>();
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    category: 'Other',
    pan: '',
    gstin: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: '',
    longitude: '',
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (uri) setLogoUri(uri);
  };

  const detectLocation = async () => {
    setDetecting(true);
    setError('');
    const granted = await requestLocationPermission();
    if (!granted) {
      setDetecting(false);
      setError('Could not detect location. Enter manually.');
      return;
    }
    Geolocation.getCurrentPosition(
      pos => {
        setDetecting(false);
        const { latitude, longitude } = pos.coords;
        if (!isValidLatLng(latitude, longitude)) {
          setError(
            `Detected location looks invalid (lat: ${latitude}, lng: ${longitude}). Please enter your coordinates manually.`,
          );
          return;
        }
        set('latitude', String(latitude));
        set('longitude', String(longitude));
      },
      () => {
        setDetecting(false);
        setError('Could not detect location. Enter manually.');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.pan.trim()) {
      setError('PAN number is mandatory.');
      return;
    }
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!PAN_REGEX.test(form.pan.trim().toUpperCase())) {
      setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }
    if (form.gstin.trim()) {
      const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!GSTIN_REGEX.test(form.gstin.trim().toUpperCase())) {
        setError('Please enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
        return;
      }
    }
    if (!form.latitude || !form.longitude) {
      setError('Store location is required.');
      return;
    }
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!isValidLatLng(lat, lng)) {
      setError(
        `Invalid location coordinates (lat: ${form.latitude}, lng: ${form.longitude}). Latitude must be between -90 and 90, longitude between -180 and 180 — please re-detect or re-enter your location.`,
      );
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('category', form.category);
      fd.append('pan', form.pan.trim().toUpperCase());
      if (form.gstin.trim()) {
        fd.append('gstin', form.gstin.trim().toUpperCase());
      }
      fd.append('latitude', form.latitude);
      fd.append('longitude', form.longitude);
      fd.append(
        'address',
        JSON.stringify({
          street: form.street,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
        }),
      );
      fd.append('ownerName', user?.fullname || 'Owner');
      if (logoUri)
        fd.append('logo', {
          uri: logoUri,
          name: 'logo.jpg',
          type: 'image/jpeg',
        } as any);

      const res = await storeApi.register(fd);
      const newToken = res.data?.token;
      setShowSuccess(true);
      setTimeout(async () => {
        if (newToken && user) {
          await login({ ...user, role: 'store_owner' }, newToken);
        }
        navigation.popToTop();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
      }}
    >
      <Text style={styles.title}>Register Your Store</Text>
      <Text style={styles.subtitle}>
        Start publishing offers to nearby customers.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Logo</Text>
        <View style={styles.logoRow}>
          <TouchableOpacity style={styles.logoBox} onPress={pickLogo}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} />
            ) : (
              <Camera size={22} color={CustomerColors.steelBorder} />
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.logoLabel}>
              {logoUri ? 'Logo selected ✓' : 'Upload your store logo'}
            </Text>
            <Text style={styles.logoHint}>Optional · JPG / PNG up to 5 MB</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Field
          label="Store Name *"
          value={form.name}
          onChangeText={v => set('name', v)}
          placeholder="e.g. Fresh Mart"
        />
        <Text style={styles.label}>Category *</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.category === c && styles.chipActive]}
              onPress={() => set('category', c)}
            >
              <Text
                style={[
                  styles.chipText,
                  form.category === c && styles.chipTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field
          label="Contact Phone *"
          value={form.phone}
          onChangeText={v => set('phone', v)}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />
        <Field
          label="Contact Email *"
          value={form.email}
          onChangeText={v => set('email', v)}
          placeholder="store@email.com"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={form.description}
          onChangeText={v => set('description', v)}
          placeholder="Tell customers what you sell…"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tax & Business Verification</Text>
        <Text style={styles.logoHint}>
          Required for marketplace compliance and payouts.
        </Text>
        <Field
          label="PAN Number * (Mandatory)"
          value={form.pan}
          onChangeText={v => set('pan', v.toUpperCase())}
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
          autoCapitalize="characters"
        />
        <Field
          label="GSTIN Number (Optional)"
          value={form.gstin}
          onChangeText={v => set('gstin', v.toUpperCase())}
          placeholder="e.g. 22AAAAA0000A1Z5"
          maxLength={15}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Address</Text>
        <Field
          label="Street"
          value={form.street}
          onChangeText={v => set('street', v)}
          placeholder="123 Main Street"
        />
        <Field
          label="City"
          value={form.city}
          onChangeText={v => set('city', v)}
          placeholder="Chennai"
        />
        <Field
          label="State"
          value={form.state}
          onChangeText={v => set('state', v)}
          placeholder="Tamil Nadu"
        />
        <Field
          label="PIN Code"
          value={form.pinCode}
          onChangeText={v => set('pinCode', v)}
          placeholder="600001"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Location *</Text>
        <Text style={styles.logoHint}>
          Used to show your offers to customers nearby.
        </Text>
        <TouchableOpacity
          style={styles.detectBtn}
          onPress={detectLocation}
          disabled={detecting}
        >
          {detecting ? (
            <ActivityIndicator size="small" color={CustomerColors.teal700} />
          ) : (
            <MapPin size={15} color={CustomerColors.teal700} />
          )}
          <Text style={styles.detectBtnText}>
            {detecting ? 'Detecting…' : 'Use My Current Location'}
          </Text>
        </TouchableOpacity>
        <View style={styles.row2}>
          <Field
            label="Latitude *"
            value={form.latitude}
            onChangeText={v => set('latitude', v)}
            placeholder="e.g. 13.0827"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <Field
            label="Longitude *"
            value={form.longitude}
            onChangeText={v => set('longitude', v)}
            placeholder="e.g. 80.2707"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>
        {form.latitude && form.longitude ? (
          <TouchableOpacity
            style={styles.locationSetBanner}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps?q=${form.latitude},${form.longitude}`,
              )
            }
          >
            <CheckCircle size={15} color={CustomerColors.teal600} />
            <Text style={styles.locationSetText}>
              Location set: {parseFloat(form.latitude).toFixed(4)},{' '}
              {parseFloat(form.longitude).toFixed(4)}
            </Text>
            <Text style={styles.viewMapText}>View on map ↗</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Store size={18} color="#fff" />
            <Text style={styles.submitBtnText}>Register Store</Text>
          </>
        )}
      </TouchableOpacity>
      <SuccessModal
        visible={showSuccess}
        title="Store Registered!"
        message="Setting up your dashboard…"
      />
    </ScrollView>
  );
}

function Field({
  label,
  style,
  ...props
}: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: CustomerColors.primary,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    fontSize: FontSizes.sm,
  },
  section: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#374151',
    marginBottom: Spacing.md,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: CustomerColors.steelBorder,
    borderStyle: 'dashed',
    backgroundColor: CustomerColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  logoLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: '#374151' },
  logoHint: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  chipActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  chipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: { color: '#fff' },
  detectBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  detectBtnText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  locationSetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  locationSetText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  viewMapText: { fontSize: FontSizes.xs, color: CustomerColors.teal600 },
  submitBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
});
