import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { QrCode, Save, CheckCircle, RefreshCw, LogOut, ChevronDown, X, Camera, Store, CheckCircle2 } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storeApi } from '../../api/storeApi';
import { GATEWAY_URL } from '../../api/endpoints';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { indianStates, getCities } from '../../utils/indiaLocation';
import { mergeCategories } from '../../utils/storeCategories';

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;

function resolveImageUri(url?: string) {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}

const STORE_CATEGORIES = ['Food & Beverages', 'Grocery', 'Fashion', 'Electronics', 'Pharmacy', 'Toys', 'Home & Living', 'Beauty', 'Sports', 'Other'];
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function StoreSettingsScreen() {
  const { store, loading, refresh, categories } = useStoreDashboard();
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const [logoUri, setLogoUri] = useState<string | null>(store?.logo || null);
  const [logoAsset, setLogoAsset] = useState<any>(null);

  useEffect(() => {
    if (store?.logo) {
      setLogoUri(store.logo);
    }
  }, [store?.logo]);

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    const asset = res.assets?.[0];
    if (asset?.uri) {
      setLogoUri(asset.uri);
      setLogoAsset(asset);
    }
  };

  const [form, setForm] = useState({
    name: store?.name || '', description: store?.description || '', phone: store?.phone || '', email: store?.email || '',
    category: store?.category || '', street: store?.address?.street || '', city: store?.address?.city || '',
    state: store?.address?.state || '', pinCode: store?.address?.pinCode || '',
    targetRevenue: store?.targetRevenue ? String(store.targetRevenue) : '',
    pan: store?.pan || store?.businessDetails?.pan || '',
    gstin: store?.gstin || store?.businessDetails?.gstin || '',
    legalBusinessName: store?.businessDetails?.legalBusinessName || '',
    bankAccountNumber: store?.businessDetails?.bankAccount?.accountNumber || '',
    bankIfsc: store?.businessDetails?.bankAccount?.ifscCode || '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const [upiId, setUpiId] = useState(store?.upiId || '');
  const upiError = upiId.trim() && !UPI_ID_REGEX.test(upiId.trim()) ? 'Invalid UPI ID format (expected e.g. name@bank).' : '';

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [onboardingRoute, setOnboardingRoute] = useState(false);
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
    return <View style={styles.center}><ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} /></View>;
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
      fd.append('pan', form.pan.trim().toUpperCase());
      fd.append('gstin', form.gstin.trim().toUpperCase());
      fd.append('upiId', upiId.trim());
      fd.append('fssai', form.category === 'Food & Beverages' ? fssai.trim() : '');
      if (logoAsset?.uri) {
        const uri = Platform.OS === 'android' ? logoAsset.uri : logoAsset.uri.replace('file://', '');
        const type = logoAsset.type || 'image/jpeg';
        const name = logoAsset.fileName || `store_logo_${Date.now()}.${type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'}`;
        fd.append('logo', {
          uri,
          type,
          name,
        } as any);
      }
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

  const handleRazorpayOnboard = async () => {
    setOnboardingRoute(true);
    setError('');
    try {
      const res = await storeApi.onboardRazorpay({
        legalBusinessName: form.legalBusinessName || store?.businessDetails?.legalBusinessName || form.name,
        businessType: 'individual',
        pan: form.pan || store?.businessDetails?.pan || store?.pan,
        gstin: form.gstin || store?.businessDetails?.gstin || store?.gstin,
        bankAccount: {
          accountNumber: form.bankAccountNumber || store?.businessDetails?.bankAccount?.accountNumber,
          ifscCode: form.bankIfsc || store?.businessDetails?.bankAccount?.ifscCode,
          beneficiaryName: form.name,
        },
      });

      if (res.data?.success) {
        await refresh();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.data?.message || 'Failed to configure Razorpay Route account.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to connect Razorpay Route.');
    } finally {
      setOnboardingRoute(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      <Text style={styles.sectionTitle}>Store Profile</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.formCard}>
        {/* Store Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>Store Logo</Text>
          <View style={styles.logoRow}>
            <View style={styles.logoPreviewBox}>
              {logoUri ? (
                <Image source={{ uri: resolveImageUri(logoUri) }} style={styles.logoPreviewImage} resizeMode="cover" />
              ) : (
                <Store size={28} color={isDark ? '#6B7280' : '#9CA3AF'} />
              )}
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <TouchableOpacity style={styles.changeLogoBtn} onPress={pickLogo}>
                <Camera size={14} color="#fff" />
                <Text style={styles.changeLogoBtnText}>{logoUri ? 'Change Logo' : 'Upload Logo'}</Text>
              </TouchableOpacity>
              <Text style={styles.logoHelpText}>JPG, PNG or WebP image</Text>
            </View>
          </View>
        </View>

        <Field label="Store Name *" value={form.name} onChangeText={v => set('name', v)} styles={styles} isDark={isDark} />
        <Field
          label="Monthly Revenue Target (₹)"
          value={form.targetRevenue}
          onChangeText={v => set('targetRevenue', v)}
          keyboardType="numeric"
          placeholder="e.g. 100000"
          styles={styles}
          isDark={isDark}
        />
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            value={form.description}
            onChangeText={v => set('description', v)}
            placeholder="Store description..."
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          />
        </View>
        <Field label="Phone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" styles={styles} isDark={isDark} />
        <Field label="Email" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" styles={styles} isDark={isDark} />

        <SelectField
          label="Category"
          value={form.category}
          placeholder="Select Category"
          options={categoryOptions}
          onSelect={(key) => set('category', key)}
          styles={styles}
          isDark={isDark}
        />

        {form.category === 'Food & Beverages' && (
          <Field
            label="FSSAI License Number"
            value={fssai}
            onChangeText={setFssai}
            keyboardType="number-pad"
            maxLength={14}
            placeholder="14-digit FSSAI number"
            styles={styles}
            isDark={isDark}
          />
        )}

        <Field
          label="PAN Number * (Mandatory)"
          value={form.pan}
          onChangeText={v => set('pan', v.toUpperCase())}
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
          autoCapitalize="characters"
          styles={styles}
          isDark={isDark}
        />
        <Field
          label="GSTIN Number (Optional)"
          value={form.gstin}
          onChangeText={v => set('gstin', v.toUpperCase())}
          placeholder="e.g. 22AAAAA0000A1Z5"
          maxLength={15}
          autoCapitalize="characters"
          styles={styles}
          isDark={isDark}
        />

        <Field label="Street" value={form.street} onChangeText={v => set('street', v)} styles={styles} isDark={isDark} />

        <SelectField
          label="State"
          value={form.state}
          placeholder="Select State"
          options={stateOptions}
          onSelect={handleStateSelect}
          styles={styles}
          isDark={isDark}
        />
        <SelectField
          label="City"
          value={form.city}
          placeholder={form.state ? 'Select City' : 'Select a state first'}
          options={cityOptions}
          disabled={!form.state}
          onSelect={handleCitySelect}
          styles={styles}
          isDark={isDark}
        />

        <Field label="Pin Code" value={form.pinCode} onChangeText={v => set('pinCode', v)} keyboardType="numeric" styles={styles} isDark={isDark} />

        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>UPI Payment QR Code</Text>
          <Text style={styles.qrSubtitle}>Enter your UPI ID to generate a scannable QR code. Customers who choose QR payment will see this.</Text>
          <View style={styles.qrRow}>
            <View style={styles.qrPreviewBox}>
              {store?.qrCodeImage ? <Image source={{ uri: store.qrCodeImage }} style={styles.qrPreviewImage} /> : <QrCode size={22} color={isDark ? '#6B7280' : '#D1D5DB'} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="merchant@upi"
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                autoCapitalize="none"
              />
              {upiError ? <Text style={styles.errorText}>{upiError}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.qrSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.qrTitle}>Razorpay Route Marketplace</Text>
            <View style={[
              styles.routeBadge,
              store?.razorpayAccountId
                ? store?.razorpayRouteStatus === 'active'
                  ? styles.routeBadgeActive
                  : styles.routeBadgePending
                : styles.routeBadgeNone
            ]}>
              <Text style={[
                styles.routeBadgeText,
                store?.razorpayAccountId
                  ? store?.razorpayRouteStatus === 'active'
                    ? styles.routeBadgeTextActive
                    : styles.routeBadgeTextPending
                  : styles.routeBadgeTextNone
              ]}>
                {store?.razorpayAccountId
                  ? `ROUTE: ${store?.razorpayRouteStatus?.toUpperCase() || 'CONNECTED'}`
                  : 'ROUTE: NOT CONNECTED'}
              </Text>
            </View>
          </View>
          <Text style={styles.qrSubtitle}>
            Connect your Razorpay Linked Account to automatically receive customer payments directly into your bank account.
          </Text>

          {store?.razorpayAccountId ? (
            <View style={styles.routeInfoBox}>
              <Text style={styles.routeInfoText}>
                <Text style={{ fontWeight: '700' }}>Account ID: </Text>{store.razorpayAccountId}
              </Text>
              <Text style={styles.routeInfoText}>
                <Text style={{ fontWeight: '700' }}>Platform Commission: </Text>{store.commissionPercentage ?? 10}%
              </Text>
            </View>
          ) : null}

          <Field
            label="Legal Business / Entity Name"
            value={form.legalBusinessName}
            onChangeText={v => set('legalBusinessName', v)}
            placeholder="e.g. John Doe Enterprises"
            styles={styles}
            isDark={isDark}
          />
          <Field
            label="Bank Account Number"
            value={form.bankAccountNumber}
            onChangeText={v => set('bankAccountNumber', v)}
            placeholder="Account Number"
            keyboardType="numeric"
            styles={styles}
            isDark={isDark}
          />
          <Field
            label="Bank IFSC Code"
            value={form.bankIfsc}
            onChangeText={v => set('bankIfsc', v.toUpperCase())}
            placeholder="e.g. HDFC0001234"
            autoCapitalize="characters"
            styles={styles}
            isDark={isDark}
          />

          <TouchableOpacity
            style={styles.routeBtn}
            disabled={onboardingRoute}
            onPress={handleRazorpayOnboard}
          >
            {onboardingRoute ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.routeBtnText}>
                {store?.razorpayAccountId ? 'Sync / Update Razorpay Account' : 'Connect with Razorpay Route'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : saved ? <><CheckCircle size={15} color="#fff" /><Text style={styles.saveBtnText}>Saved!</Text></> : <><Save size={15} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
        </TouchableOpacity>
      </View>

      <View style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Verification Status</Text>
        {store?.isVerified ? (
          <View style={styles.verifiedBanner}><CheckCircle size={16} color={CustomerColors.success} /><Text style={styles.verifiedText}>Your store is verified</Text></View>
        ) : (
          <View style={styles.pendingBanner}><RefreshCw size={16} color={isDark ? '#FBBF24' : '#D97706'} /><Text style={styles.pendingText}>Verification pending — our team typically verifies stores within 24–48 hours.</Text></View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={16} color={isDark ? '#F87171' : CustomerColors.primary} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({
  label,
  styles,
  isDark,
  ...props
}: {
  label: string;
  styles: any;
  isDark?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
        {...props}
      />
    </View>
  );
}

// Modal-based dropdown since RN has no native <select>.
function SelectField({
  label, value, placeholder, options, disabled, onSelect, styles, isDark,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
  styles: any;
  isDark?: boolean;
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
        <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
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

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    formCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, marginBottom: Spacing.md },
    errorText: { color: isDark ? '#F87171' : CustomerColors.primary, fontSize: FontSizes.xs, marginBottom: Spacing.sm },
    label: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#D1D5DB' : CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
    logoSection: {
      marginBottom: Spacing.md,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    logoPreviewBox: {
      width: 64,
      height: 64,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoPreviewImage: {
      width: '100%',
      height: '100%',
    },
    changeLogoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: CustomerColors.teal700,
      paddingHorizontal: Spacing.md,
      paddingVertical: 7,
      borderRadius: BorderRadius.md,
    },
    changeLogoBtnText: {
      color: '#fff',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    logoHelpText: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 4,
    },
    input: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder },
    chipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
    chipText: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    qrSection: { borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5', paddingTop: Spacing.md, marginTop: Spacing.sm },
    qrTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : '#374151' },
    qrSubtitle: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
    qrRow: { flexDirection: 'row', gap: Spacing.md },
    qrPreviewBox: {
      width: 72,
      height: 72,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderStyle: 'dashed',
      backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    qrPreviewImage: { width: '100%', height: '100%' },
    saveBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.lg },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
    verificationCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.lg,
    },
    verificationTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, marginBottom: Spacing.sm },
    verifiedBanner: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', backgroundColor: isDark ? '#064e3b' : CustomerColors.successBg, padding: Spacing.md, borderRadius: BorderRadius.md },
    verifiedText: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#34D399' : CustomerColors.success },
    pendingBanner: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'flex-start',
      backgroundColor: isDark ? '#451a03' : '#FFFBEB',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#78350f' : 'transparent',
    },
    pendingText: { flex: 1, fontSize: FontSizes.xs, color: isDark ? '#fde68a' : '#92400E' },
    signOutBtn: {
      flexDirection: 'row',
      gap: Spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#450a0a' : CustomerColors.dangerBg,
    },
    signOutText: { color: isDark ? '#F87171' : CustomerColors.primary, fontWeight: '700', fontSize: FontSizes.sm },

    // ── SelectField / modal ──
    selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    selectDisabled: { opacity: 0.5 },
    selectValue: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black, flex: 1 },
    selectPlaceholder: { fontSize: FontSizes.sm, color: isDark ? '#94A3B8' : '#9CA3AF', flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: isDark ? '#111827' : '#fff',
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
      maxHeight: '70%',
      paddingBottom: Spacing.lg,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1F2937' : 'transparent',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
    modalItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F5F5F5' },
    modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#F9FAFB' : CustomerColors.black },
    modalItemTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700' },
    modalEmpty: { textAlign: 'center', color: isDark ? '#94A3B8' : '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
    routeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.pill, borderWidth: 1 },
    routeBadgeActive: { backgroundColor: isDark ? '#064e3b' : '#F0FDF4', borderColor: isDark ? '#059669' : '#BBF7D0' },
    routeBadgePending: { backgroundColor: isDark ? '#451a03' : '#FFFBEB', borderColor: isDark ? '#78350f' : '#FDE68A' },
    routeBadgeNone: { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderColor: isDark ? '#374151' : '#E5E7EB' },
    routeBadgeText: { fontSize: 10, fontWeight: '700' },
    routeBadgeTextActive: { color: isDark ? '#34D399' : '#15803D' },
    routeBadgeTextPending: { color: isDark ? '#FBBF24' : '#B45309' },
    routeBadgeTextNone: { color: isDark ? '#9CA3AF' : '#6B7280' },
    routeInfoBox: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : '#CCFBF1',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.sm,
      gap: 2,
    },
    routeInfoText: { fontSize: FontSizes.xs, color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    routeBtn: {
      backgroundColor: CustomerColors.teal700,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    routeBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  });