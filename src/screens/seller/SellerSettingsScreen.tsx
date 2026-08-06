import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator, Modal,
  FlatList,
} from 'react-native';
import { Save, CheckCircle, QrCode, ChevronDown, X  } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { storeApi } from '../../api/storeApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { indianStates, getCities } from '../../utils/indiaLocation';
import { normalizeLoc, lookupPincode } from '../../components/common/LocationSelectField';
import { mergeCategories } from '../../utils/storeCategories';

const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const STORE_CATEGORIES = [
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

export default function SellerSettingsScreen() {
  const { store, refresh, categories } = useSellerDashboard();
  const [form, setForm] = useState({
    name: store?.name || '',
    description: store?.description || '',
    phone: store?.phone || '',
    email: store?.email || '',
    category: store?.category || '',
    street: store?.address?.street || '',
    city: store?.address?.city || '',
    state: store?.address?.state || '',
    pinCode: store?.address?.pinCode || '',
    targetRevenue: store?.targetRevenue ? String(store.targetRevenue) : '',
  });
  const [upiId, setUpiId] = useState(store?.upiId || '');
  const [fssai, setFssai] = useState(store?.fssai || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) =>
    setForm(f => ({ ...f, [k]: v }));
  const upiError =
    upiId.trim() && !UPI_ID_REGEX.test(upiId.trim())
      ? 'Invalid UPI ID format (expected e.g. name@bank).'
      : '';

      const categoryOptions = useMemo(
  () =>
    mergeCategories(categories || []).map(c => ({
      key: c.name,
      label: c.name,
    })),
  [categories]
);

  // ── State/City dropdown support ──
  const [cities, setCities] = useState<any[]>([])

  const findState = useCallback((value: string) => {
    const v = normalizeLoc(value);
    if (!v) return undefined;
    return indianStates.find(
      s => normalizeLoc(s.name) === v || normalizeLoc(s.isoCode) === v,
    );
  }, []);

  useEffect(() => {
    if (!form.state) {
      setCities([]);
      return;
    }
    const state = findState(form.state);
    setCities(state ? getCities(state.isoCode) : []);
  }, [form.state, findState]);

  const stateOptions = indianStates.map(s => ({
    key: s.isoCode,
    label: s.name,
  }));
  const cityOptions = cities.map((c: any) => ({ key: c.name, label: c.name }));

  const handleStateSelect = (isoCode: string, label: string) => {
    setForm(f => ({ ...f, state: label, city: '', pinCode: '' }));
    setCities(getCities(isoCode));
  };

  const handleCitySelect = async (cityName: string) => {
    set('city', cityName);
    if (!cityName) return;
    const pin = await lookupPincode(cityName);
    if (pin) set('pinCode', pin);
  };

  const handleSave = async () => {
    if (upiError) {
      setError(upiError);
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
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
      fd.append(
        'fssai',
        form.category === 'Food & Beverages' ? fssai.trim() : '',
      );
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
      }}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Profile</Text>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Field
          label="Business Name *"
          value={form.name}
          onChangeText={(t: string) => set('name', t)}
        />
        <Field
          label="Monthly Revenue Target (₹)"
          value={form.targetRevenue}
          onChangeText={(t: string) => set('targetRevenue', t)}
          keyboardType="numeric"
          placeholder="e.g. 50000"
        />
        <Field
          label="Description"
          value={form.description}
          onChangeText={(t: string) => set('description', t)}
          multiline
        />
        <View style={styles.row2}>
          <Field
            style={{ flex: 1 }}
            label="Phone"
            value={form.phone}
            onChangeText={(t: string) => set('phone', t)}
            keyboardType="phone-pad"
          />
          <Field
            style={{ flex: 1 }}
            label="Email"
            value={form.email}
            onChangeText={(t: string) => set('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Category */}
        <SelectField
  label="Category"
  value={form.category}
  placeholder="Select Category"
  options={categoryOptions}
  onSelect={(key) => set('category', key)}
/>

        {/* FSSAI — only for Food & Beverages */}
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

        <Field
          label="Street"
          value={form.street}
          onChangeText={(t: string) => set('street', t)}
        />

        <View style={styles.row2}>
          <SelectField
          style={{ flex: 1}}
  label="State"
  value={form.state}
  placeholder="Select State"
  options={stateOptions}
  onSelect={handleStateSelect}
/>
          <SelectField
    style={{ flex: 1 }}
  label="City"
  value={form.city}
  placeholder={form.state ? 'Select City' : 'Select state first'}
  options={cityOptions}
  disabled={!form.state}
  onSelect={handleCitySelect}
/>
        </View>

        <Field
          label="Pin Code"
          value={form.pinCode}
          onChangeText={(t: string) => set('pinCode', t)}
          keyboardType="numeric"
        />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>UPI Payment QR Code</Text>
        <Text style={styles.sectionHint}>
          Enter your UPI ID to generate a scannable QR code for order payments.
        </Text>
        <View style={styles.upiRow}>
          <View style={styles.qrBox}>
            {store?.qrCodeImage ? (
              <Image
                source={{ uri: store.qrCodeImage }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <QrCode size={22} color="#CBD5E1" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="merchant@upi"
              autoCapitalize="none"
            />
            {upiError ? <Text style={styles.upiError}>{upiError}</Text> : null}
            <Text style={styles.sectionHint}>
              {store?.qrCodeImage
                ? 'Save changes to regenerate the QR code.'
                : 'Save a valid UPI ID to generate your QR code.'}
            </Text>
          </View>
        </View>

        <View style={styles.saveRow}>
          <TouchableOpacity
            style={styles.saveBtn}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Save size={14} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          {saved && (
            <View style={styles.savedRow}>
              <CheckCircle size={14} color="#16A34A" />
              <Text style={styles.savedText}>Saved!</Text>
            </View>
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
      <TextInput
        style={[
          styles.input,
          props.multiline && { height: 70, textAlignVertical: 'top' },
        ]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}

function SelectField({
  label, value, placeholder, options, disabled, onSelect, style,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  style?: any;
  onSelect: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: { color: '#FF0000', fontSize: FontSizes.sm },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  sectionHint: { fontSize: 11, color: '#9CA3AF', marginBottom: Spacing.sm },
  upiRow: { flexDirection: 'row', gap: Spacing.sm },
  qrBox: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: CustomerColors.steelBorder,
    borderStyle: 'dashed',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrImage: { width: '100%', height: '100%', backgroundColor: '#fff' },
  upiError: { fontSize: 11, color: '#FF0000', marginTop: 2 },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  savedRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  savedText: { color: '#16A34A', fontWeight: '600', fontSize: FontSizes.sm },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
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
  selectInput: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
selectDisabled: {
  opacity: 0.5,
},
selectValue: {
  fontSize: FontSizes.sm,
  color: CustomerColors.black,
  flex: 1,
},
selectPlaceholder: {
  fontSize: FontSizes.sm,
  color: '#9CA3AF',
  flex: 1,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},
modalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: BorderRadius.lg,
  borderTopRightRadius: BorderRadius.lg,
  maxHeight: '70%',
  paddingBottom: Spacing.lg,
},
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F5F5F5',
},
modalTitle: {
  fontSize: FontSizes.base,
  fontWeight: '800',
  color: CustomerColors.black,
},
modalItem: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F5F5F5',
},
modalItemText: {
  fontSize: FontSizes.sm,
  color: CustomerColors.black,
},
modalItemTextActive: {
  color: CustomerColors.teal700,
  fontWeight: '700',
},
modalEmpty: {
  textAlign: 'center',
  color: '#9CA3AF',
  fontSize: FontSizes.sm,
  paddingVertical: Spacing.lg,
},
});
