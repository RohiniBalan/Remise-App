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
  Modal,
  FlatList,
  KeyboardTypeOptions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Store,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Utensils,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { storeApi } from '../../api/storeApi';
import SuccessModal from '../../components/common/SuccessModal';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { indianStates, getCities } from '../../utils/indiaLocation';

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

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Store },
  { id: 2, title: 'Verification', icon: FileText },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'Bank & Payouts', icon: CreditCard },
];

export default function StoreRegisterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, token, login } = useAuth();

  const storeType =
    route.params?.storeType ||
    (user?.role === 'whole_saler' || user?.role === 'wholesaler'
      ? 'whole_saler'
      : user?.role === 'home_business'
        ? 'home_business'
        : 'store');

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    category: 'Food & Beverages',
    pan: '',
    fssaiNumber: '',
    gstin: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: '',
    longitude: '',
    legalBusinessName: user?.fullname || '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
  });

  const [panVerified, setPanVerified] = useState(false);
  const [panError, setPanError] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Modals for Selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  const isFoodCategory = form.category === 'Food & Beverages';

  const set = (k: keyof typeof form, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (uri) setLogoUri(uri);
  };

  const lookupPincode = async (cityName: string) => {
    if (!cityName) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`,
      );
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
        const pin = data[0].PostOffice[0].Pincode;
        if (pin) set('pinCode', String(pin));
      }
    } catch (e) {
      // silent
    }
  };

  const handleSelectState = (stateObj: any) => {
    set('state', stateObj.name);
    set('city', '');
    set('pinCode', '');
    const cityList = stateObj.isoCode ? getCities(stateObj.isoCode) : [];
    setCities(cityList);
    setShowStateModal(false);
  };

  const handleSelectCity = (cityName: string) => {
    set('city', cityName);
    setShowCityModal(false);
    lookupPincode(cityName);
  };

  const verifyPAN = (panVal: string) => {
    const cleanPan = panVal.trim().toUpperCase();
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!cleanPan) {
      setPanError('Please enter a PAN number.');
      setPanVerified(false);
      return false;
    }
    if (!PAN_REGEX.test(cleanPan)) {
      setPanError('Invalid PAN format (expected 10 characters e.g. ABCDE1234F).');
      setPanVerified(false);
      return false;
    }
    setPanError('');
    setPanVerified(true);
    return true;
  };

  const detectLocation = async () => {
    setDetecting(true);
    setError('');
    const granted = await requestLocationPermission();
    if (!granted) {
      setDetecting(false);
      setError('Location permission is required to detect GPS coordinates.');
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
        setError('Could not detect GPS location. Please enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const validateStep = (step: number): boolean => {
    setError('');
    if (step === 1) {
      if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
        setError('Please fill in Store Name, Phone, and Email.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!form.pan.trim()) {
        setError('PAN number is mandatory for merchant onboarding.');
        return false;
      }
      const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!PAN_REGEX.test(form.pan.trim().toUpperCase())) {
        setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
        return false;
      }

      if (isFoodCategory) {
        if (!form.fssaiNumber.trim()) {
          setError('FSSAI License Number is mandatory for Food & Beverages.');
          return false;
        }
        const FSSAI_REGEX = /^[0-9]{14}$/;
        if (!FSSAI_REGEX.test(form.fssaiNumber.trim())) {
          setError('Please enter a valid 14-digit numeric FSSAI License Number.');
          return false;
        }
      }

      if (form.gstin.trim()) {
        const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!GSTIN_REGEX.test(form.gstin.trim().toUpperCase())) {
          setError('Please enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      if (!form.street.trim() || !form.state.trim() || !form.city.trim()) {
        setError('Please complete street, state, and city address fields.');
        return false;
      }
      if (!form.latitude || !form.longitude) {
        setError('Store GPS location (latitude & longitude) is required.');
        return false;
      }
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      if (!isValidLatLng(lat, lng)) {
        setError('Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (form.accountNumber && form.accountNumber !== form.confirmAccountNumber) {
        setError('Bank Account Number and Confirm Account Number do not match.');
        return false;
      }
      if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase())) {
        setError('Please enter a valid 11-character Indian IFSC code (e.g. IDIB000K073).');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in to register a store.');
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
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
      if (form.fssaiNumber.trim()) {
        fd.append('fssaiNumber', form.fssaiNumber.trim());
        fd.append('fssai', form.fssaiNumber.trim());
      }
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
      fd.append('ownerName', user?.fullname || form.name);
      fd.append('storeType', storeType);
      fd.append('legalBusinessName', form.legalBusinessName || form.name);

      if (form.accountNumber.trim() && form.ifscCode.trim()) {
        fd.append(
          'bankAccount',
          JSON.stringify({
            accountNumber: form.accountNumber.trim(),
            ifscCode: form.ifscCode.trim().toUpperCase(),
            beneficiaryName: form.legalBusinessName || form.name,
          }),
        );
      }

      if (logoUri) {
        fd.append('logo', {
          uri: logoUri,
          name: 'logo.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const res = await storeApi.register(fd);
      const newToken = res.data?.token;
      const targetRole =
        storeType === 'whole_saler'
          ? 'whole_saler'
          : storeType === 'home_business'
            ? 'home_business'
            : 'store_owner';

      setShowSuccess(true);
      setTimeout(async () => {
        const tokenToUse = newToken || token;
        if (user && tokenToUse) {
          await login({ ...user, role: targetRole }, tokenToUse);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl * 2,
        }}
      >
        {/* Header */}
        <Text style={styles.title}>Register Your Store</Text>
        <Text style={styles.subtitle}>
          Complete your 4-step merchant profile to start receiving orders & settlements.
        </Text>

        {/* ── Stepper Indicator ─────────────────────────────────── */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperRow}>
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <TouchableOpacity
                    style={styles.stepItem}
                    onPress={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isCurrent && styles.stepCircleCurrent,
                      ]}
                    >
                      {isCompleted ? (
                        <Check size={16} color="#ffffff" strokeWidth={3} />
                      ) : (
                        <Text
                          style={[
                            styles.stepNumber,
                            (isCurrent || isCompleted) && styles.stepNumberActive,
                          ]}
                        >
                          {step.id}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isCompleted && styles.stepLabelCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                  </TouchableOpacity>
                  {idx < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepDivider,
                        currentStep > step.id && styles.stepDividerActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Error Notice */}
        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color="#dc2626" style={{ marginTop: 2 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 1: Basic Information & Logo                         */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            {/* Logo Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Store Logo</Text>
              <View style={styles.logoRow}>
                <TouchableOpacity style={styles.logoBox} onPress={pickLogo}>
                  {logoUri ? (
                    <Image source={{ uri: logoUri }} style={styles.logoImage} />
                  ) : (
                    <Camera size={26} color={CustomerColors.steelBorder} />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.logoLabel}>
                    {logoUri ? '✓ Logo selected' : 'Upload your store logo'}
                  </Text>
                  <Text style={styles.logoHint}>Optional · JPG / PNG up to 5 MB</Text>
                  <TouchableOpacity
                    style={styles.logoButton}
                    onPress={pickLogo}
                  >
                    <Text style={styles.logoButtonText}>
                      {logoUri ? 'Change Logo' : 'Choose Image'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Basic Info Fields */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Store Identity & Contact</Text>
              <Field
                label="Store Name *"
                value={form.name}
                onChangeText={v => set('name', v)}
                placeholder="e.g. Smart Electronics"
              />

              <Text style={styles.fieldLabel}>Category *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.dropdownText}>{form.category}</Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>

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
                autoCapitalize="none"
              />

              <Field
                label="Description"
                value={form.description}
                onChangeText={v => set('description', v)}
                placeholder="Tell nearby customers what your store offers…"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 2: Verification (PAN + FSSAI + GSTIN)               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={20} color="#0d9488" />
                <Text style={styles.sectionTitle}>Tax & Legal Compliance</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Regulatory credentials required for marketplace payout routing.
              </Text>

              {/* PAN Number Section */}
              <View style={styles.panCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.fieldLabel}>Permanent Account Number (PAN) *</Text>
                  {panVerified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={13} color="#047857" />
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                    </View>
                  )}
                </View>

                <View style={styles.panInputRow}>
                  <TextInput
                    style={[styles.input, styles.panInput]}
                    value={form.pan}
                    onChangeText={v => {
                      set('pan', v.toUpperCase());
                      if (panVerified) setPanVerified(false);
                    }}
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => verifyPAN(form.pan)}
                  >
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </TouchableOpacity>
                </View>
                {panError ? <Text style={styles.panErrorText}>{panError}</Text> : null}
                <Text style={styles.fieldHint}>
                  10-character Permanent Account Number issued by Income Tax Dept.
                </Text>
              </View>

              {/* Conditional FSSAI Number for Food & Beverages */}
              {isFoodCategory && (
                <View style={styles.fssaiCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Utensils size={16} color="#b45309" />
                      <Text style={[styles.fieldLabel, { color: '#92400e', marginBottom: 0 }]}>
                        FSSAI License Number *
                      </Text>
                    </View>
                    <View style={styles.fssaiBadge}>
                      <Text style={styles.fssaiBadgeText}>Mandatory for Food</Text>
                    </View>
                  </View>

                  <TextInput
                    style={[styles.input, styles.fssaiInput]}
                    value={form.fssaiNumber}
                    onChangeText={v => set('fssaiNumber', v.replace(/\D/g, ''))}
                    placeholder="e.g. 10012345678901 (14 digits)"
                    maxLength={14}
                    keyboardType="number-pad"
                  />
                  <Text style={[styles.fieldHint, { color: '#b45309' }]}>
                    14-digit food safety registration / license issued by FSSAI.
                  </Text>
                </View>
              )}

              {/* GSTIN */}
              <Field
                label="GSTIN Number (Optional)"
                value={form.gstin}
                onChangeText={v => set('gstin', v.toUpperCase())}
                placeholder="e.g. 22AAAAA0000A1Z5"
                maxLength={15}
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHint}>
                15-digit Goods and Services Tax Identification Number.
              </Text>
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 3: Store Address & GPS Location                     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <MapPin size={20} color="#0d9488" />
                <Text style={styles.sectionTitle}>Physical Store Address</Text>
              </View>

              <Field
                label="Street Address *"
                value={form.street}
                onChangeText={v => set('street', v)}
                placeholder="e.g. 123 Bazaar Road, 2nd Cross"
              />

              {/* State Dropdown */}
              <Text style={styles.fieldLabel}>State *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowStateModal(true)}
              >
                <Text style={[styles.dropdownText, !form.state && { color: '#94a3b8' }]}>
                  {form.state || 'Select State'}
                </Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>

              {/* City Dropdown */}
              <Text style={styles.fieldLabel}>City *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, !form.state && { opacity: 0.6 }]}
                disabled={!form.state}
                onPress={() => setShowCityModal(true)}
              >
                <Text style={[styles.dropdownText, !form.city && { color: '#94a3b8' }]}>
                  {form.city || (form.state ? 'Select City' : 'Select State first')}
                </Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>

              {/* PIN Code */}
              <Field
                label="PIN Code *"
                value={form.pinCode}
                onChangeText={v => set('pinCode', v.replace(/\D/g, ''))}
                placeholder="e.g. 600001"
                maxLength={6}
                keyboardType="number-pad"
              />
              <Text style={styles.fieldHint}>Auto-populated on city select</Text>

              {/* GPS Coordinates Section */}
              <View style={styles.gpsSection}>
                <View style={styles.rowBetween}>
                  <Text style={styles.fieldLabel}>Store GPS Location *</Text>
                  <TouchableOpacity
                    style={styles.gpsButton}
                    onPress={detectLocation}
                    disabled={detecting}
                  >
                    {detecting ? (
                      <ActivityIndicator size="small" color="#0d9488" />
                    ) : (
                      <>
                        <MapPin size={14} color="#0d9488" />
                        <Text style={styles.gpsButtonText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.coordRow}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Field
                      label="Latitude *"
                      value={form.latitude}
                      onChangeText={v => set('latitude', v)}
                      placeholder="e.g. 13.0827"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="Longitude *"
                      value={form.longitude}
                      onChangeText={v => set('longitude', v)}
                      placeholder="e.g. 80.2707"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {form.latitude && form.longitude ? (
                  <View style={styles.locationTag}>
                    <CheckCircle size={15} color="#047857" />
                    <Text style={styles.locationTagText}>
                      Coordinates: {parseFloat(form.latitude).toFixed(4)},{' '}
                      {parseFloat(form.longitude).toFixed(4)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 4: Bank Details & Razorpay Connection               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Building2 size={20} color="#0d9488" />
                <Text style={styles.sectionTitle}>Settlement Bank Account</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Used for automated marketplace payouts directly to your bank account via Razorpay Route.
              </Text>

              <Field
                label="Legal Business / Entity Name *"
                value={form.legalBusinessName}
                onChangeText={v => set('legalBusinessName', v)}
                placeholder="e.g. Rohini B"
              />
              <Text style={styles.fieldHint}>Must match your bank passbook name</Text>

              <Field
                label="Bank Account Number *"
                value={form.accountNumber}
                onChangeText={v => set('accountNumber', v.replace(/\D/g, ''))}
                placeholder="e.g. 6285854908"
                secureTextEntry
                keyboardType="number-pad"
              />

              <Field
                label="Confirm Bank Account Number *"
                value={form.confirmAccountNumber}
                onChangeText={v => set('confirmAccountNumber', v.replace(/\D/g, ''))}
                placeholder="Re-enter bank account number"
                keyboardType="number-pad"
              />

              <Field
                label="Bank IFSC Code *"
                value={form.ifscCode}
                onChangeText={v => set('ifscCode', v.toUpperCase())}
                placeholder="e.g. IDIB000K073"
                maxLength={11}
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHint}>11-character Indian bank branch code</Text>

              {/* Razorpay Connection Card matching reference */}
              <View style={styles.razorpayCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: Spacing.sm }}>
                    <Text style={styles.razorpayCardTitle}>
                      Razorpay Route Marketplace
                    </Text>
                    <Text style={styles.razorpayCardSubtitle}>
                      Mandatory to accept online Razorpay payments. Customer payments are split directly to your linked account.
                    </Text>
                  </View>
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyBadgeText}>Razorpay Ready</Text>
                  </View>
                </View>

                <View style={styles.razorpayCardFooter}>
                  <Text style={styles.razorpayFooterLabel}>Account Connection:</Text>
                  <Text style={styles.razorpayFooterValue}>
                    Auto-linking upon store creation
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Navigation Buttons ─────────────────────────────────── */}
        <View style={styles.navButtonsRow}>
          {currentStep > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrev}
              disabled={loading}
            >
              <ArrowLeft size={16} color="#334155" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}

          {currentStep < 4 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Store size={18} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Register Store</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Selection Modals ────────────────────────────────────── */}
      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Store Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.category === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    set('category', item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.category === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.category === item ? (
                    <Check size={16} color="#0d9488" />
                  ) : null}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select State</Text>
            <FlatList
              data={indianStates}
              keyExtractor={item => item.isoCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.state === item.name && styles.modalItemActive,
                  ]}
                  onPress={() => handleSelectState(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.state === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select City</Text>
            <FlatList
              data={cities}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.city === item.name && styles.modalItemActive,
                  ]}
                  onPress={() => handleSelectCity(item.name)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.city === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCityModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={showSuccess}
        title="Store Registered!"
        message="Your store has been created and linked to Razorpay Route successfully."
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  maxLength?: number;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: CustomerColors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  // Stepper
  stepperCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: Spacing.lg,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 65,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  stepCircleCurrent: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  stepNumber: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: CustomerColors.primary,
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#0d9488',
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  stepDividerActive: {
    backgroundColor: '#0d9488',
  },

  // Steps
  stepContent: {
    gap: Spacing.md,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: FontSizes.xs,
    color: '#64748b',
    marginBottom: Spacing.md,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  logoButton: {
    marginTop: Spacing.xs,
    backgroundColor: '#f0fdfa',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    alignSelf: 'flex-start',
  },
  logoButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
  },

  // Form Fields
  fieldWrapper: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: -2,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  dropdownText: {
    fontSize: FontSizes.sm,
    color: '#1e293b',
    fontWeight: '500',
  },

  // PAN Card
  panCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  panInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  panInput: {
    flex: 1,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  verifyButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  panErrorText: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 4,
  },

  // FSSAI Card
  fssaiCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  fssaiBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  fssaiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
  },
  fssaiInput: {
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 6,
  },

  // GPS
  gpsSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  gpsButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0d9488',
  },
  coordRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },

  // Razorpay Card
  razorpayCard: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  razorpayCardTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: '#0f172a',
  },
  razorpayCardSubtitle: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  razorpayCardFooter: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  razorpayFooterLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  razorpayFooterValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
  },

  // Nav Buttons
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#334155',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CustomerColors.primary,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  nextButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#ffffff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  submitButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Alerts & Modals
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#dc2626',
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemActive: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalItemText: {
    fontSize: FontSizes.md,
    color: '#334155',
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: '#0d9488',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#475569',
  },
});
