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
import { GATEWAY_URL } from '../../api/endpoints';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const editingOffer = route.params?.offer;
  const isEditing = !!editingOffer;

  const [store, setStore] = useState<any>(contextStore || null);
  const [imgUri, setImgUri] = useState<string | null>(() => {
    if (editingOffer?.image) {
      return editingOffer.image.startsWith('http')
        ? editingOffer.image
        : `${GATEWAY_URL}${editingOffer.image}`;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: editingOffer?.title || '',
    description: editingOffer?.description || '',
    category: editingOffer?.category || 'Groceries',
    originalPrice: editingOffer?.originalPrice !== undefined ? String(editingOffer.originalPrice) : '',
    offerPrice: editingOffer?.offerPrice !== undefined ? String(editingOffer.offerPrice) : '',
    validUntil: editingOffer?.validUntil ? new Date(editingOffer.validUntil).toISOString().slice(0, 16) : '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Date / Time picker state
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (editingOffer?.validUntil) {
      return new Date(editingOffer.validUntil);
    }
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

  const targetCustomerId = route.params?.targetCustomerId || editingOffer?.targetCustomerId;
  const targetCustomerName = route.params?.targetCustomerName || editingOffer?.targetCustomerName;

  // Category options merged with store's categories
  const categoryOptions = useMemo(() => {
    return mergeCategories(categories || []);
  }, [categories]);

  const applyStoreCoords = (s: any) => {
    if (!s) return;
    const coords = s?.location?.coordinates || s?.coordinates;
    if (Array.isArray(coords) && coords.length === 2 && coords[0] !== undefined && coords[1] !== undefined) {
      setLongitude(String(coords[0]));
      setLatitude(String(coords[1]));
      setLocSource('store');
      return;
    }
    if (s?.latitude && s?.longitude) {
      setLatitude(String(s.latitude));
      setLongitude(String(s.longitude));
      setLocSource('store');
      return;
    }
    if (s?.location?.latitude && s?.location?.longitude) {
      setLatitude(String(s.location.latitude));
      setLongitude(String(s.location.longitude));
      setLocSource('store');
      return;
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Offer' : 'New Offer' });
  }, [isEditing, navigation]);

  useEffect(() => {
    // Initialise validUntil string
    const isoString = selectedDate.toISOString().slice(0, 16);
    set('validUntil', isoString);

    if (contextStore) {
      setStore(contextStore);
      applyStoreCoords(contextStore);
    } else {
      storeApi.getMyStore().then(res => {
        const s = res.data.data;
        if (s) {
          setStore(s);
          applyStoreCoords(s);
        }
      }).catch(() => navigation.replace('StoreRegister'));
    }
  }, [contextStore]);

  const resetToStoreLocation = () => {
    if (store || contextStore) applyStoreCoords(store || contextStore);
  };

  const detectGPS = async () => {
    setDetecting(true);
    const ok = await requestLocationPermission();
    if (!ok) {
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 }, res => {
      const uri = res.assets?.[0]?.uri;
      if (uri) setImgUri(uri);
    });
  };

  const discount = useMemo(() => {
    const orig = parseFloat(form.originalPrice);
    const off = parseFloat(form.offerPrice);
    if (!orig || !off || off >= orig) return 0;
    return Math.round(((orig - off) / orig) * 100);
  }, [form.originalPrice, form.offerPrice]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      const updated = new Date(selectedDate);
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(updated);
      set('validUntil', updated.toISOString().slice(0, 16));
      setShowTimePicker(true);
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
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!imgUri) {
      setError('Please upload an offer image.');
      return;
    }
    if (!form.title || !form.originalPrice || !form.offerPrice) {
      setError('Title, Original Price, and Offer Price are required.');
      return;
    }
    if (Number(form.offerPrice) >= Number(form.originalPrice)) {
      setError('Offer price must be less than original price.');
      return;
    }

    let lat = parseFloat(latitude);
    let lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      const current = store || contextStore;
      const coords = current?.location?.coordinates || current?.coordinates;
      if (Array.isArray(coords) && coords.length === 2 && !isNaN(Number(coords[0])) && !isNaN(Number(coords[1]))) {
        lng = parseFloat(String(coords[0]));
        lat = parseFloat(String(coords[1]));
        setLongitude(String(lng));
        setLatitude(String(lat));
      } else if (current?.latitude && current?.longitude) {
        lat = parseFloat(String(current.latitude));
        lng = parseFloat(String(current.longitude));
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      setError('Notification coordinates (latitude and longitude) are required.');
      return;
    }

    const currentStore = store || contextStore;
    const storeId = currentStore?._id || currentStore?.id;
    if (!storeId) {
      setError('Store ID is required. Please re-open the screen.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      if (imgUri.startsWith('file://') || imgUri.startsWith('content://')) {
        const fn = imgUri.split('/').pop() || 'photo.jpg';
        const ext = fn.split('.').pop() || 'jpg';
        fd.append('image', {
          uri: imgUri,
          name: fn,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        } as any);
      }
      fd.append('storeId', String(storeId));
      fd.append('storeName', String(currentStore.name || currentStore.storeName || 'Store'));
      fd.append('latitude', String(lat));
      fd.append('longitude', String(lng));
      const finalIso = (selectedDate instanceof Date && !isNaN(selectedDate.getTime()))
        ? selectedDate.toISOString()
        : new Date(form.validUntil || Date.now()).toISOString();
      fd.append('validUntil', finalIso);

      Object.entries(form).forEach(([k, v]) => {
        if (k === 'validUntil') return;
        if (v !== undefined && v !== null && v !== '') {
          fd.append(k, String(v));
        }
      });
      if (targetCustomerId) {
        fd.append('targetCustomerId', targetCustomerId);
        fd.append('targetCustomerName', targetCustomerName || '');
      }

      if (isEditing) {
        await offersApi.update(editingOffer._id, fd);
      } else {
        await offersApi.create(fd);
      }
      refresh();
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditing ? 'Failed to update offer.' : 'Failed to publish offer.'));
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
          <Image source={{ uri: resolveImageUrl(imgUri) || imgUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={28} color={isDark ? '#2DD4BF' : CustomerColors.primary} />
            <Text style={styles.uploadText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Field
        label="Offer Title *"
        value={form.title}
        onChangeText={v => set('title', v)}
        placeholder="e.g. 20% off all groceries"
        styles={styles}
        isDark={isDark}
      />

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
          <ChevronDown size={18} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
        multiline
        value={form.description}
        onChangeText={v => set('description', v)}
        placeholder="Describe special discounts, bundled items, or terms…"
        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
      />

      <View style={styles.row2}>
        <Field
          label="Original Price (₹) *"
          value={form.originalPrice}
          onChangeText={v => set('originalPrice', v)}
          keyboardType="numeric"
          style={{ flex: 1 }}
          placeholder="500"
          styles={styles}
          isDark={isDark}
        />
        <Field
          label="Offer Price (₹) *"
          value={form.offerPrice}
          onChangeText={v => set('offerPrice', v)}
          keyboardType="numeric"
          style={{ flex: 1 }}
          placeholder="350"
          styles={styles}
          isDark={isDark}
        />
      </View>
      {form.originalPrice && form.offerPrice ? (
        <Text style={styles.discountText}>
          Customers save ₹{(+form.originalPrice - +form.offerPrice).toFixed(0)} · {discount}% off
        </Text>
      ) : null}

      <View style={{ marginBottom: Spacing.md }}>
        <Text style={styles.label}>Valid Until *</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectInput]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Calendar size={18} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={styles.selectValue}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
          <Clock size={16} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <View style={styles.locationSection}>
        <Text style={styles.label}>Notification Target Location *</Text>
        <View style={styles.locBtnRow}>
          <TouchableOpacity style={styles.locBtn} onPress={resetToStoreLocation}>
            <MapPin size={13} color={isDark ? '#2DD4BF' : CustomerColors.primary} />
            <Text style={styles.locBtnText}>Use Store Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locBtn} onPress={detectGPS} disabled={detecting}>
            {detecting ? (
              <ActivityIndicator size="small" color={isDark ? '#2DD4BF' : CustomerColors.primary} />
            ) : (
              <Satellite size={13} color={isDark ? '#2DD4BF' : CustomerColors.primary} />
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
            styles={styles}
            isDark={isDark}
          />
          <Field
            label="Longitude *"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            style={{ flex: 1 }}
            styles={styles}
            isDark={isDark}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>{isEditing ? 'Update Offer' : 'Publish Offer'}</Text>
        )}
      </TouchableOpacity>

      <Modal visible={categoryModalOpen} transparent animationType="slide" onRequestClose={() => setCategoryModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModalOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalOpen(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryOptions}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                const isSelected = form.category === item.name;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      set('category', item.name);
                      setCategoryModalOpen(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {item.name}
                    </Text>
                    {isSelected && <CheckCircle size={18} color={isDark ? '#2DD4BF' : CustomerColors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={handleSuccessClose}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{isEditing ? 'Offer Updated!' : 'Offer Published!'}</Text>
            <Text style={styles.successSubtitle}>
              {isEditing ? 'Your offer changes have been saved successfully.' : 'Your offer has been created successfully.'}
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

function Field({
  label,
  style,
  styles,
  isDark,
  ...props
}: {
  label: string;
  style?: any;
  styles: any;
  isDark?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
        {...props}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg,
      gap: Spacing.sm,
    },
    loadingText: { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontSize: FontSizes.sm },
    errorText: {
      color: isDark ? '#F87171' : CustomerColors.primary,
      backgroundColor: isDark ? '#450a0a' : CustomerColors.dangerBg,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
      fontSize: FontSizes.sm,
    },
    label: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : CustomerColors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    imageBox: {
      width: '100%',
      height: 150,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderStyle: 'dashed',
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
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
      color: isDark ? '#2DD4BF' : CustomerColors.primary,
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    row2: { flexDirection: 'row', gap: Spacing.sm },
    discountText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#2DD4BF' : CustomerColors.primary,
      fontWeight: '700',
      marginTop: -Spacing.sm,
      marginBottom: Spacing.md,
    },
    locationSection: {
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F0F0F0',
      paddingTop: Spacing.md,
      marginTop: Spacing.sm,
    },
    locBtnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
    locBtn: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(45,212,191,0.1)' : 'rgba(255,0,0,0.06)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(45,212,191,0.3)' : 'rgba(255,0,0,0.2)',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    locBtnText: { fontSize: FontSizes.xs, color: isDark ? '#2DD4BF' : CustomerColors.primary, fontWeight: '700' },
    sourceBadge: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
      marginBottom: Spacing.md,
    },
    sourceBadgeText: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
    submitBtn: {
      backgroundColor: CustomerColors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
    privateBanner: {
      backgroundColor: isDark ? '#451a03' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? '#78350f' : '#FDE68A',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    privateBannerText: { fontSize: FontSizes.xs, color: isDark ? '#fde68a' : '#92400E' },
    selectInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectValue: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black, fontWeight: '600' },
    selectPlaceholder: { fontSize: FontSizes.sm, color: isDark ? '#94A3B8' : '#6B7280' },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? '#111827' : '#fff',
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
      maxHeight: '75%',
      paddingBottom: Spacing.xl,
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
    modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    modalItemActive: { backgroundColor: isDark ? 'rgba(45,212,191,0.1)' : 'rgba(255,0,0,0.05)' },
    modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black, fontWeight: '500' },
    modalItemTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.primary, fontWeight: '700' },
    successOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    successCard: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
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
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1F2937' : 'transparent',
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
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    successSubtitle: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
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
