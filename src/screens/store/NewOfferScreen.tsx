import React, { useEffect, useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
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
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  MapPin,
  Satellite,
  ImageIcon,
  Calendar,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { storeApi } from '../../api/storeApi';
import { offersApi } from '../../api/offersApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { mergeCategories } from '../../utils/storeCategories';

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const DEFAULT_CATEGORIES = [
  'General',
  'Groceries',
  'Food & Beverages',
  'Electronics',
  'Fashion',
  'Health & Beauty',
  'Home & Kitchen',
  'Toys & Baby',
  'Sports & Fitness',
  'Books & Stationery',
];

export default function NewOfferScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { store: contextStore, categories, refresh } = useStoreDashboard();
  const [store, setStore] = useState<any>(contextStore || null);
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Groceries',
    originalPrice: '',
    offerPrice: '',
    validUntil: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Date / Time picker state
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Dropdown modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Custom Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locSource, setLocSource] = useState<'store' | 'gps' | 'manual'>('store');

  const targetCustomerId = route.params?.customerId;
  const targetCustomerName = route.params?.customerName;

  // Category options merged with store's categories
  const categoryOptions = useMemo(() => {
    const merged = mergeCategories(categories || []);
    if (!merged || merged.length === 0) {
      return DEFAULT_CATEGORIES.map(c => ({ key: c, label: c }));
    }
    return merged.map(c => ({ key: c.name, label: c.name }));
  }, [categories]);

  useEffect(() => {
    // Initialise validUntil string
    const isoString = selectedDate.toISOString().slice(0, 16);
    set('validUntil', isoString);
  }, []);

  useEffect(() => {
    if (contextStore?.location?.coordinates) {
      setStore(contextStore);
      setLongitude(String(contextStore.location.coordinates[0]));
      setLatitude(String(contextStore.location.coordinates[1]));
      setLocSource('store');
    } else {
      storeApi
        .getMyStore()
        .then(res => {
          const s = res.data.data;
          setStore(s);
          if (s?.location?.coordinates) {
            setLongitude(String(s.location.coordinates[0]));
            setLatitude(String(s.location.coordinates[1]));
            setLocSource('store');
          }
        })
        .catch(() => navigation.replace('StoreRegister'));
    }
  }, [contextStore]);

  const resetToStoreLocation = () => {
    if (!store?.location?.coordinates) return;
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
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (uri) setImgUri(uri);
  };

  const discount =
    form.originalPrice && form.offerPrice
      ? Math.max(0, Math.round(((+form.originalPrice - +form.offerPrice) / +form.originalPrice) * 100))
      : 0;

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      const updated = new Date(selectedDate);
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(updated);
      set('validUntil', updated.toISOString().slice(0, 16));
      // Prompt for time on Android
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && time) {
      const updated = new Date(selectedDate);
      updated.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setSelectedDate(updated);
      set('validUntil', updated.toISOString().slice(0, 16));
    }
  };

  const formatDisplayDate = (d: Date) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${mins}`;
  };

  const handleSubmit = async () => {
    if (!imgUri) {
      setError('Please upload an offer image.');
      return;
    }
    if (!store) {
      setError('Store not found.');
      return;
    }
    if (!latitude || !longitude) {
      setError('Notification coordinates are required.');
      return;
    }
    if (!form.title.trim() || !form.originalPrice || !form.offerPrice || !form.validUntil) {
      setError('Please fill in all required fields.');
      return;
    }
    if (+form.offerPrice >= +form.originalPrice) {
      setError('Offer price must be less than original price.');
      return;
    }

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
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish offer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  if (!store) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
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
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={28} color={CustomerColors.primary} />
            <Text style={styles.uploadText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Field
        label="Offer Title *"
        value={form.title}
        onChangeText={v => set('title', v)}
        placeholder="e.g. 20% off all groceries"
      />

      {/* ── Category Dropdown Field ── */}
      <View style={{ marginBottom: Spacing.md }}>
        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectInput]}
          onPress={() => setCategoryModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={form.category ? styles.selectValue : styles.selectPlaceholder}>
            {form.category || 'Select Category'}
          </Text>
          <ChevronDown size={18} color={CustomerColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
        multiline
        value={form.description}
        onChangeText={v => set('description', v)}
        placeholder="Describe special discounts, bundled items, or terms…"
        placeholderTextColor="#9CA3AF"
      />

      <View style={styles.row2}>
        <Field
          label="Original Price (₹) *"
          value={form.originalPrice}
          onChangeText={v => set('originalPrice', v)}
          keyboardType="numeric"
          style={{ flex: 1 }}
          placeholder="500"
        />
        <Field
          label="Offer Price (₹) *"
          value={form.offerPrice}
          onChangeText={v => set('offerPrice', v)}
          keyboardType="numeric"
          style={{ flex: 1 }}
          placeholder="350"
        />
      </View>
      {form.originalPrice && form.offerPrice ? (
        <Text style={styles.discountText}>
          Customers save ₹{(+form.originalPrice - +form.offerPrice).toFixed(0)} · {discount}% off
        </Text>
      ) : null}

      {/* ── Valid Until Calendar Field ── */}
      <View style={{ marginBottom: Spacing.md }}>
        <Text style={styles.label}>Valid Until *</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectInput]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Calendar size={18} color={CustomerColors.primary} />
            <Text style={styles.selectValue}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
          <Clock size={16} color={CustomerColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* ── Notification Location Section ── */}
      <View style={styles.locationSection}>
        <Text style={styles.label}>Notification Target Location *</Text>
        <View style={styles.locBtnRow}>
          <TouchableOpacity style={styles.locBtn} onPress={resetToStoreLocation}>
            <MapPin size={13} color={CustomerColors.primary} />
            <Text style={styles.locBtnText}>Use Store Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locBtn} onPress={detectGPS} disabled={detecting}>
            {detecting ? (
              <ActivityIndicator size="small" color={CustomerColors.primary} />
            ) : (
              <Satellite size={13} color={CustomerColors.primary} />
            )}
            <Text style={styles.locBtnText}>Use Current GPS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>Source: {locSource}</Text>
        </View>
        <View style={styles.row2}>
          <Field
            label="Latitude *"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <Field
            label="Longitude *"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Publish Offer</Text>
        )}
      </TouchableOpacity>

      {/* ── Category Selection Modal ── */}
      <Modal visible={categoryModalOpen} transparent animationType="slide" onRequestClose={() => setCategoryModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModalOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalOpen(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryOptions}
              keyExtractor={item => item.key}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => {
                const isSelected = form.category === item.label;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      set('category', item.label);
                      setCategoryModalOpen(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {item.label}
                    </Text>
                    {isSelected && <CheckCircle size={18} color={CustomerColors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── High Quality Custom Success Modal ── */}
      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={handleSuccessClose}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Offer Published!</Text>
            <Text style={styles.successSubtitle}>
              Your offer has been created successfully. Customers near your store will be notified about this deal.
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={handleSuccessClose} activeOpacity={0.85}>
              <Text style={styles.successButtonText}>View Offers</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Field({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
    gap: Spacing.sm,
  },
  loadingText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm },
  errorText: {
    color: CustomerColors.primary,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    fontSize: FontSizes.sm,
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
    color: CustomerColors.black,
  },
  imageBox: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: CustomerColors.steelBorder,
    borderStyle: 'dashed',
    backgroundColor: CustomerColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.primary,
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  discountText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.primary,
    fontWeight: '700',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  locationSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  locBtnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  locBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  locBtnText: { fontSize: FontSizes.xs, color: CustomerColors.primary, fontWeight: '700' },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.md,
  },
  sourceBadgeText: { fontSize: 10, color: CustomerColors.textSecondary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
  privateBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  privateBannerText: { fontSize: FontSizes.xs, color: '#92400E' },

  // Dropdown Select styles
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: { fontSize: FontSizes.sm, color: CustomerColors.black, fontWeight: '600' },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#9CA3AF' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '75%',
    paddingBottom: Spacing.xl,
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
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemActive: { backgroundColor: 'rgba(255,0,0,0.05)' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black, fontWeight: '500' },
  modalItemTextActive: { color: CustomerColors.primary, fontWeight: '700' },

  // Success Modal styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: CustomerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    color: CustomerColors.black,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
