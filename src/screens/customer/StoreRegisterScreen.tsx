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
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Lock,
  RefreshCw,
  Fingerprint,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storeApi } from '../../api/storeApi';
import { contactApi } from '../../api/contentApi';
import SuccessModal from '../../components/common/SuccessModal';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
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
  const { isDark, colors } = useTheme();

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
    panName: '',
    aadhaar: '',
    aadhaarName: '',
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

  // Cashfree Verification States
  const [panVerified, setPanVerified] = useState(false);
  const [panData, setPanData] = useState<any>(null);
  const [panError, setPanError] = useState('');
  const [verifyingPan, setVerifyingPan] = useState(false);

  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarData, setAadhaarData] = useState<any>(null);
  const [aadhaarError, setAadhaarError] = useState('');
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarRefId, setAadhaarRefId] = useState('');
  const [showAadhaarOtpModal, setShowAadhaarOtpModal] = useState(false);
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);

  // GSTIN Preference Selection
  const [hasGstin, setHasGstin] = useState<'yes' | 'no'>('no');

  const [gstinVerified, setGstinVerified] = useState(false);
  const [gstinData, setGstinData] = useState<any>(null);
  const [gstinError, setGstinError] = useState('');
  const [verifyingGstin, setVerifyingGstin] = useState(false);

  const [bankVerified, setBankVerified] = useState(false);
  const [bankData, setBankData] = useState<any>(null);
  const [bankError, setBankError] = useState('');
  const [verifyingBank, setVerifyingBank] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);

  const [ifscVerified, setIfscVerified] = useState(false);
  const [ifscData, setIfscData] = useState<any>(null);
  const [ifscError, setIfscError] = useState('');
  const [verifyingIfsc, setVerifyingIfsc] = useState(false);

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoAsset, setLogoAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Modals for Selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  const isFoodCategory = form.category === 'Food & Beverages';

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setFieldErrors(prev => {
      if (!prev[k] && !(k === 'latitude' || k === 'longitude' ? prev.coordinates : false)) return prev;
      const next = { ...prev };
      delete next[k];
      if (k === 'latitude' || k === 'longitude') delete next.coordinates;
      return next;
    });
    if (k === 'pan' || k === 'panName') {
      setPanError('');
      if (panVerified) setPanVerified(false);
    }
    if (k === 'gstin') {
      setGstinError('');
      if (gstinVerified) setGstinVerified(false);
    }
    if (k === 'aadhaar' || k === 'aadhaarName') {
      setAadhaarError('');
      if (aadhaarVerified) setAadhaarVerified(false);
    }
    if (k === 'accountNumber' || k === 'confirmAccountNumber' || k === 'legalBusinessName') {
      setBankError('');
      if (bankVerified) setBankVerified(false);
    }
    if (k === 'ifscCode') {
      setIfscError('');
      if (ifscVerified) setIfscVerified(false);
    }
  };

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    const asset = res.assets?.[0];
    if (asset?.uri) {
      setLogoUri(asset.uri);
      setLogoAsset(asset);
    }
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
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.state;
      return next;
    });
  };

  const handleSelectCity = (cityName: string) => {
    set('city', cityName);
    setShowCityModal(false);
    lookupPincode(cityName);
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.city;
      return next;
    });
  };

  // ── Cashfree Identity Verification Handlers ───────────────────
  const verifyPANWithCashfree = async () => {
    const cleanPan = form.pan.trim().toUpperCase();
    const cleanPanName = form.panName.trim();
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!cleanPan) {
      setPanError('Please enter a PAN number.');
      setFieldErrors(prev => ({ ...prev, pan: 'PAN number is required.' }));
      return;
    }
    if (!PAN_REGEX.test(cleanPan)) {
      setPanError('Invalid PAN format (e.g. ABCDE1234F).');
      setFieldErrors(prev => ({ ...prev, pan: 'Please enter a valid 10-character PAN number.' }));
      return;
    }
    if (!cleanPanName) {
      setPanError('Please enter the name as it appears on your PAN card.');
      setFieldErrors(prev => ({ ...prev, panName: 'Name as on PAN Card is required.' }));
      return;
    }
    setVerifyingPan(true);
    setPanError('');
    try {
      const res = await storeApi.verifyPan(
        cleanPan,
        cleanPanName,
      );
      const data = res.data;
      if (data?.valid) {
        if (data.belongsToUser === false) {
          setPanVerified(false);
          const registeredName = data.registeredName ? `"${data.registeredName}"` : 'the PAN card holder';
          setPanError(`Name mismatch: PAN records show the name as ${registeredName}. Please enter your legal name exactly as it appears on your PAN card.`);
          setFieldErrors(prev => ({ ...prev, panName: `Name does not match PAN card (${registeredName})` }));
          return;
        }
        setPanVerified(true);
        setPanData(data);
        setPanError('');
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.pan;
          delete next.panName;
          return next;
        });
      } else {
        setPanVerified(false);
        setPanError(data?.message || 'PAN verification failed.');
        setFieldErrors(prev => ({ ...prev, pan: data?.message || 'PAN verification failed.' }));
      }
    } catch (err: any) {
      setPanError(
        err?.response?.data?.message || 'Could not verify PAN with Cashfree.',
      );
    } finally {
      setVerifyingPan(false);
    }
  };

  const sendAadhaarOtpWithCashfree = async () => {
    const cleanAadhaar = form.aadhaar.replace(/\D/g, '');
    const cleanAadhaarName = form.aadhaarName.trim();
    if (!cleanAadhaarName) {
      setAadhaarError('Please enter the name as it appears on your Aadhaar card.');
      setFieldErrors(prev => ({ ...prev, aadhaarName: 'Name as on Aadhaar Card is required.' }));
      return;
    }
    if (cleanAadhaar.length !== 12) {
      setAadhaarError('Please enter a valid 12-digit Aadhaar number.');
      setFieldErrors(prev => ({ ...prev, aadhaar: 'Please enter a valid 12-digit Aadhaar number.' }));
      return;
    }
    setVerifyingAadhaar(true);
    setAadhaarError('');
    try {
      const res = await storeApi.generateAadhaarOtp(cleanAadhaar);
      const data = res.data;
      if (data?.success && data?.refId) {
        setAadhaarRefId(data.refId);
        setAadhaarOtpSent(true);
        setShowAadhaarOtpModal(true);
      } else {
        setAadhaarError(
          data?.message || 'Failed to generate Aadhaar OTP from UIDAI.',
        );
      }
    } catch (err: any) {
      setAadhaarError(
        err?.response?.data?.message || 'Aadhaar OTP request failed.',
      );
    } finally {
      setVerifyingAadhaar(false);
    }
  };

  const verifyAadhaarOtpWithCashfree = async () => {
    const cleanAadhaarName = form.aadhaarName.trim();
    if (!cleanAadhaarName) {
      setAadhaarError('Please enter the name as it appears on your Aadhaar card.');
      setFieldErrors(prev => ({ ...prev, aadhaarName: 'Name as on Aadhaar Card is required.' }));
      return;
    }
    if (!aadhaarOtp || aadhaarOtp.length < 4) {
      setAadhaarError('Please enter the OTP sent to your Aadhaar-linked mobile.');
      return;
    }
    setVerifyingAadhaarOtp(true);
    setAadhaarError('');
    try {
      const res = await storeApi.verifyAadhaarOtp(
        aadhaarRefId,
        aadhaarOtp,
        cleanAadhaarName,
      );
      const data = res.data;
      if (data?.valid) {
        if (data.belongsToUser === false) {
          setAadhaarError(`Name mismatch: Aadhaar records show the name as "${data.nameOnAadhaar || 'the Aadhaar holder'}". Please use the legal name matching your Aadhaar.`);
          setFieldErrors(prev => ({ ...prev, aadhaarName: `Name does not match Aadhaar (${data.nameOnAadhaar})` }));
          return;
        }
        setAadhaarVerified(true);
        setAadhaarData(data);
        setAadhaarError('');
        setShowAadhaarOtpModal(false);
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.aadhaar;
          delete next.aadhaarName;
          return next;
        });
      } else {
        setAadhaarError(data?.message || 'Invalid Aadhaar OTP.');
      }
    } catch (err: any) {
      setAadhaarError(
        err?.response?.data?.message || 'Failed to verify Aadhaar OTP.',
      );
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  const verifyAadhaarDirectWithCashfree = async () => {
    const cleanAadhaar = form.aadhaar.replace(/\D/g, '');
    const cleanAadhaarName = form.aadhaarName.trim();
    if (!cleanAadhaarName) {
      setAadhaarError('Please enter the name as it appears on your Aadhaar card.');
      setFieldErrors(prev => ({ ...prev, aadhaarName: 'Name as on Aadhaar Card is required.' }));
      return;
    }
    if (cleanAadhaar.length !== 12) {
      setAadhaarError('Please enter a valid 12-digit Aadhaar number.');
      setFieldErrors(prev => ({ ...prev, aadhaar: 'Please enter a valid 12-digit Aadhaar number.' }));
      return;
    }
    setVerifyingAadhaar(true);
    setAadhaarError('');
    try {
      const res = await storeApi.verifyAadhaarDirect(
        cleanAadhaar,
        cleanAadhaarName,
      );
      const data = res.data;
      if (data?.valid) {
        if (data.belongsToUser === false) {
          setAadhaarError(`Name mismatch: Aadhaar records show "${data.nameOnAadhaar || 'a different name'}". Please ensure your legal name matches your Aadhaar card.`);
          setFieldErrors(prev => ({ ...prev, aadhaarName: `Name does not match Aadhaar (${data.nameOnAadhaar})` }));
          return;
        }
        setAadhaarVerified(true);
        setAadhaarData(data);
        setAadhaarError('');
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.aadhaar;
          delete next.aadhaarName;
          return next;
        });
      } else {
        setAadhaarError(
          data?.message || 'Aadhaar checksum validation failed.',
        );
      }
    } catch (err: any) {
      setAadhaarError(
        err?.response?.data?.message || 'Could not verify Aadhaar.',
      );
    } finally {
      setVerifyingAadhaar(false);
    }
  };

  const verifyGSTINWithCashfree = async () => {
    const cleanGstin = form.gstin.trim().toUpperCase();
    const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!cleanGstin) {
      setGstinError('Please enter a GSTIN number.');
      setFieldErrors(prev => ({ ...prev, gstin: 'GSTIN Number is required.' }));
      return;
    }
    if (!GSTIN_REGEX.test(cleanGstin)) {
      setGstinError('Invalid GSTIN format (e.g. 22AAAAA0000A1Z5).');
      setFieldErrors(prev => ({ ...prev, gstin: 'Please enter a valid 15-character GSTIN.' }));
      return;
    }
    setVerifyingGstin(true);
    setGstinError('');
    try {
      const res = await storeApi.verifyGstin(
        cleanGstin,
        form.name || form.legalBusinessName,
        form.pan ? form.pan.trim().toUpperCase() : cleanGstin.substring(2, 12),
      );
      const data = res.data;
      if (data?.valid) {
        if (data.panMatches === false && form.pan.trim()) {
          setGstinVerified(false);
          setGstinError(
            `GSTIN PAN mismatch: The PAN embedded in your GSTIN (${
              data.embeddedPan || 'unknown'
            }) does not match the PAN you entered (${
              form.pan.trim().toUpperCase()
            }). Please use the GSTIN registered to your PAN card.`,
          );
          setFieldErrors(prev => ({ ...prev, gstin: `GSTIN PAN mismatch (${data.embeddedPan || 'mismatch'})` }));
          return;
        }
        if (data.belongsToUser === false) {
          setGstinVerified(false);
          setGstinError(`Business name mismatch: GSTIN records show "${data.legalName || 'a different name'}". Please verify your legal business name matches your GSTIN registration.`);
          setFieldErrors(prev => ({ ...prev, gstin: `Business name does not match GSTIN (${data.legalName})` }));
          return;
        }
        setGstinVerified(true);
        setGstinData(data);
        setGstinError('');
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.gstin;
          return next;
        });
      } else {
        setGstinVerified(false);
        setGstinError(data?.message || 'GSTIN verification failed.');
        setFieldErrors(prev => ({ ...prev, gstin: data?.message || 'GSTIN verification failed.' }));
      }
    } catch (err: any) {
      setGstinError(
        err?.response?.data?.message || 'Could not verify GSTIN with Cashfree.',
      );
    } finally {
      setVerifyingGstin(false);
    }
  };

  const verifyIFSCWithCashfree = async (codeToVerify?: string) => {
    const cleanIfsc = (codeToVerify || form.ifscCode).trim().toUpperCase();
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!cleanIfsc) {
      setIfscError('Please enter an IFSC code.');
      setFieldErrors(prev => ({ ...prev, ifscCode: 'IFSC Code is required.' }));
      return;
    }
    if (!IFSC_REGEX.test(cleanIfsc)) {
      setIfscError('Invalid IFSC format (must be 11 characters e.g. HDFC0001234).');
      setFieldErrors(prev => ({ ...prev, ifscCode: 'Please enter a valid 11-character Indian IFSC code.' }));
      return;
    }
    setVerifyingIfsc(true);
    setIfscError('');
    try {
      const res = await storeApi.verifyIFSC(cleanIfsc);
      const data = res.data;
      if (data?.valid) {
        setIfscVerified(true);
        setIfscData(data);
        setIfscError('');
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.ifscCode;
          return next;
        });
      } else {
        setIfscVerified(false);
        setIfscData(null);
        setIfscError(data?.message || `IFSC Code "${cleanIfsc}" could not be verified.`);
        setFieldErrors(prev => ({ ...prev, ifscCode: data?.message || 'Invalid IFSC code.' }));
      }
    } catch (err: any) {
      setIfscVerified(false);
      setIfscData(null);
      setIfscError(err?.response?.data?.message || `Failed to verify IFSC Code "${cleanIfsc}".`);
    } finally {
      setVerifyingIfsc(false);
    }
  };

  const verifyBankWithCashfree = async () => {
    if (!form.legalBusinessName.trim()) {
      setBankError('Legal Business / Account Holder Name is required.');
      setFieldErrors(prev => ({ ...prev, legalBusinessName: 'Legal Business / Account Holder Name is required.' }));
      return;
    }
    if (!form.accountNumber.trim()) {
      setBankError('Bank Account Number is required.');
      setFieldErrors(prev => ({ ...prev, accountNumber: 'Bank Account Number is required.' }));
      return;
    }
    if (form.accountNumber !== form.confirmAccountNumber) {
      setBankError('Account numbers do not match.');
      setFieldErrors(prev => ({ ...prev, confirmAccountNumber: 'Bank Account Number and Confirm Account Number do not match.' }));
      return;
    }
    const cleanIfsc = form.ifscCode.trim().toUpperCase();
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!IFSC_REGEX.test(cleanIfsc)) {
      setBankError('Invalid IFSC format (e.g. IDIB000K073).');
      setFieldErrors(prev => ({ ...prev, ifscCode: 'Please enter a valid 11-character Indian IFSC code.' }));
      return;
    }
    setVerifyingBank(true);
    setBankError('');
    setIfscError('');
    try {
      const res = await storeApi.verifyBankAccount(
        form.accountNumber.trim(),
        cleanIfsc,
        form.legalBusinessName.trim(),
        form.phone,
      );
      const data = res.data;
      if (data?.valid) {
        if (data.ifscDetails) {
          setIfscVerified(true);
          setIfscData(data.ifscDetails);
          setIfscError('');
        } else {
          setIfscVerified(true);
        }
        if (data.belongsToUser === false) {
          setBankVerified(false);
          const nameAtBank = data.nameAtBank ? `"${data.nameAtBank}"` : 'a different account holder';
          setBankError(`Name mismatch: Bank records show the account belongs to ${nameAtBank}. Please ensure the legal business name matches the bank account holder name.`);
          setFieldErrors(prev => ({ ...prev, legalBusinessName: `Name does not match bank records (${nameAtBank})` }));
          return;
        }
        const verifiedName = data.nameAtBank || data.registeredName || form.legalBusinessName.trim();
        setBankVerified(true);
        setBankData({ ...data, nameAtBank: verifiedName });
        setBankError('');
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.accountNumber;
          delete next.confirmAccountNumber;
          delete next.legalBusinessName;
          delete next.ifscCode;
          return next;
        });
      } else {
        setBankVerified(false);
        if (data?.ifscValid === false) {
          setIfscVerified(false);
          setIfscError(data?.message || 'Invalid IFSC code.');
        }
        setBankError(data?.message || 'Bank account verification failed. Check Account & IFSC.');
      }
    } catch (err: any) {
      setBankError(
        err?.response?.data?.message || 'Could not verify Bank Account.',
      );
    } finally {
      setVerifyingBank(false);
    }
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
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.coordinates;
          return next;
        });
      },
      () => {
        setDetecting(false);
        setError(
          'Could not detect GPS location. Please enter coordinates manually.',
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const validateStep = (step: number): boolean => {
    setError('');
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!form.name.trim()) {
        errs.name = 'Store Name is required.';
      }
      if (!form.phone.trim()) {
        errs.phone = 'Contact Phone is required.';
      } else {
        const cleanPhone = form.phone.replace(/[\s\-()]/g, '');
        const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;
        if (!PHONE_REGEX.test(cleanPhone)) {
          errs.phone = 'Please enter a valid 10-digit mobile number (e.g. 9876543210).';
        }
      }
      if (!form.email.trim()) {
        errs.email = 'Contact Email is required.';
      } else {
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!EMAIL_REGEX.test(form.email.trim())) {
          errs.email = 'Please enter a valid email address (e.g. store@email.com).';
        }
      }
    }

    if (step === 2) {
      if (hasGstin === 'yes') {
        if (!form.gstin.trim()) {
          errs.gstin = 'GSTIN Number is required.';
        } else {
          const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!GSTIN_REGEX.test(form.gstin.trim().toUpperCase())) {
            errs.gstin = 'Please enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).';
          }
        }
      } else {
        if (!form.pan.trim()) {
          errs.pan = 'PAN number is mandatory for merchant onboarding.';
        } else {
          const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!PAN_REGEX.test(form.pan.trim().toUpperCase())) {
            errs.pan = 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).';
          }
        }
        if (!form.panName.trim()) {
          errs.panName = 'Name as on PAN Card is required.';
        }
      }

      if (form.aadhaar.trim()) {
        const cleanAadhaar = form.aadhaar.replace(/\D/g, '');
        if (cleanAadhaar.length !== 12) {
          errs.aadhaar = 'Aadhaar Number must be 12 digits.';
        }
        if (!form.aadhaarName.trim()) {
          errs.aadhaarName = 'Name as on Aadhaar Card is required.';
        }
      }

      if (isFoodCategory) {
        if (!form.fssaiNumber.trim()) {
          errs.fssaiNumber = 'FSSAI License Number is mandatory for Food & Beverages.';
        } else {
          const FSSAI_REGEX = /^[0-9]{14}$/;
          if (!FSSAI_REGEX.test(form.fssaiNumber.trim())) {
            errs.fssaiNumber = 'Please enter a valid 14-digit numeric FSSAI License Number.';
          }
        }
      }
    }

    if (step === 3) {
      if (!form.street.trim()) {
        errs.street = 'Street address is required.';
      }
      if (!form.state) {
        errs.state = 'Please select a state.';
      }
      if (!form.city) {
        errs.city = 'Please select a city.';
      }
      if (!form.pinCode.trim()) {
        errs.pinCode = 'PIN Code is required.';
      }
      if (!form.latitude || !form.longitude) {
        errs.coordinates = 'Store GPS location (latitude & longitude) is required.';
      } else {
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (!isValidLatLng(lat, lng)) {
          errs.coordinates = 'Invalid coordinates. Latitude must be -90 to 90.';
        }
      }
    }

    if (step === 4) {
      if (!form.legalBusinessName.trim()) {
        errs.legalBusinessName = 'Legal Business / Account Holder Name is required.';
      }
      if (!form.accountNumber.trim()) {
        errs.accountNumber = 'Bank Account Number is required for settlement payouts.';
      }
      if (form.accountNumber !== form.confirmAccountNumber) {
        errs.confirmAccountNumber = 'Bank Account Number and Confirm Account Number do not match.';
      }
      if (
        !form.ifscCode ||
        !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase())
      ) {
        errs.ifscCode = 'Please enter a valid 11-character Indian IFSC code.';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
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

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }
    if (!validateStep(4)) {
      setCurrentStep(4);
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
      const effectivePan = form.pan.trim().toUpperCase() || (hasGstin === 'yes' && form.gstin.trim().length === 15 ? form.gstin.trim().substring(2, 12).toUpperCase() : '');
      if (effectivePan) {
        fd.append('pan', effectivePan);
      }
      fd.append('aadhaar', form.aadhaar.replace(/\D/g, ''));
      if (form.fssaiNumber.trim()) {
        fd.append('fssaiNumber', form.fssaiNumber.trim());
        fd.append('fssai', form.fssaiNumber.trim());
      }
      if (hasGstin === 'yes' && form.gstin.trim()) {
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
        const holderName = form.legalBusinessName.trim() || form.name;
        fd.append(
          'bankAccount',
          JSON.stringify({
            accountNumber: form.accountNumber.trim(),
            ifscCode: form.ifscCode.trim().toUpperCase(),
            accountHolderName: holderName,
            beneficiaryName: holderName,
          }),
        );
      }

      // Verification Details metadata for Cashfree trust score
      const verificationDetails = {
        pan: {
          verified: panVerified,
          registeredName: panData?.registeredName || '',
          matchScore: panData?.matchScore || 0,
        },
        aadhaar: {
          verified: aadhaarVerified,
          nameOnAadhaar: aadhaarData?.nameOnAadhaar || '',
          matchScore: aadhaarData?.matchScore || 0,
        },
        gstin: {
          verified: gstinVerified,
          legalName: gstinData?.legalName || '',
          status: gstinData?.gstinStatus || '',
          panMatches: gstinData?.panMatches || false,
        },
        bankAccount: {
          verified: bankVerified,
          nameAtBank: bankData?.nameAtBank || form.legalBusinessName.trim() || '',
          bankName: bankData?.bankName || '',
          accountStatus: bankData?.accountStatus || '',
        },
      };
      fd.append('verificationDetails', JSON.stringify(verificationDetails));

      if (logoUri) {
        const filename = logoAsset?.fileName || logoUri.split('/').pop() || 'store-logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = logoAsset?.type || (match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg');
        fd.append('logo', {
          uri: Platform.OS === 'android' ? logoUri : logoUri.replace('file://', ''),
          name: filename,
          type: mimeType,
        } as any);
      }

      const res = await storeApi.register(fd);

      // Automatically send registration details email from the person's email to porulontechnologies@gmail.com
      try {
        const storeTypeLabel =
          storeType === 'whole_saler'
            ? 'Wholesaler (B2B/Bulk)'
            : storeType === 'home_business'
              ? 'Home Business / Artisan'
              : 'Store Owner (Retail)';
        const fullAddr = [form.street, form.city, form.state, form.pinCode].filter(Boolean).join(', ') || 'Not specified';
        const emailBody = `🎉 NEW STORE REGISTRATION ON REMISE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 STORE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Store Name: ${form.name}
• Store / Business Type: ${storeTypeLabel}
• Category: ${form.category || 'General'}
• Owner Name: ${user?.fullname || form.name}
• Contact Email: ${form.email}
• Contact Phone: ${form.phone}
• Address: ${fullAddr}
• Description: ${form.description || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ KYC & LEGAL IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Legal Business Name: ${form.legalBusinessName || form.name}
• PAN: ${form.pan || (hasGstin === 'yes' && form.gstin.length === 15 ? form.gstin.substring(2, 12).toUpperCase() : 'Not provided')} ${panVerified ? '(✓ Verified via Cashfree)' : ''}
• Aadhaar: ${form.aadhaar || 'Not provided'} ${aadhaarVerified ? '(✓ Verified via Cashfree)' : ''}
• GSTIN: ${hasGstin === 'yes' && form.gstin ? form.gstin : 'Not provided'} ${gstinVerified ? '(✓ Verified via Cashfree)' : ''}
• FSSAI License: ${form.fssaiNumber || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 BANKING & PAYOUT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Account Holder Name: ${form.legalBusinessName || form.name}
• Bank Account Number: ${form.accountNumber ? `${form.accountNumber}` : 'Not provided'}
• IFSC Code: ${form.ifscCode || 'Not provided'} ${bankVerified ? '(✓ Verified via Cashfree)' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Registered at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
`;

        contactApi.sendMessage({
          name: user?.fullname || form.name || 'Merchant',
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: `[Remise Registration] New Store Created: ${form.name} (${storeTypeLabel})`,
          message: emailBody,
        }).catch(e => console.warn('Email dispatch error:', e));
      } catch (mailErr) {
        console.warn('Store creation email notification notice:', mailErr);
      }

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
    <View style={[styles.screenContainer, isDark && { backgroundColor: '#0a0f1d' }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl * 2,
        }}
      >
        {/* Header */}
        <Text style={styles.title}>Register Your Store</Text>
        <Text style={[styles.subtitle, isDark && { color: '#94a3b8' }]}>
          Complete your 4-step merchant profile with real-time KYC verification to start receiving orders.
        </Text>

        {/* ── Stepper Indicator ─────────────────────────────────── */}
        <View style={[styles.stepperCard, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
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
                        isDark && { backgroundColor: '#1e293b', borderColor: '#334155' },
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
                            isDark && { color: '#94a3b8' },
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
                        isDark && { color: '#94a3b8' },
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
                        isDark && { backgroundColor: '#1f2937' },
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
            <View style={[styles.section, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
              <Text style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Store Logo</Text>
              <View style={styles.logoRow}>
                <TouchableOpacity
                  style={[styles.logoBox, isDark && { backgroundColor: '#0f172a', borderColor: '#334155' }]}
                  onPress={pickLogo}
                >
                  {logoUri ? (
                    <Image source={{ uri: logoUri }} style={styles.logoImage} />
                  ) : (
                    <Camera size={26} color={isDark ? '#64748b' : '#94a3b8'} />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[styles.logoLabel, isDark && { color: '#f8fafc' }]}>
                    {logoUri ? '✓ Logo selected' : 'Upload your store logo'}
                  </Text>
                  <Text style={[styles.logoHint, isDark && { color: '#94a3b8' }]}>Optional · JPG / PNG up to 5 MB</Text>
                  <TouchableOpacity
                    style={[styles.logoButton, isDark && { backgroundColor: '#134e4a33', borderColor: '#0f766e' }]}
                    onPress={pickLogo}
                  >
                    <Text style={[styles.logoButtonText, isDark && { color: '#2dd4bf' }]}>
                      {logoUri ? 'Change Logo' : 'Choose Image'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Basic Info Fields */}
            <View style={[styles.section, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
              <Text style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Store Identity & Contact</Text>
              <Field
                label="Store Name *"
                value={form.name}
                onChangeText={v => set('name', v)}
                placeholder="e.g. Smart Electronics"
                error={fieldErrors.name}
              />

              <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>Category *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                ]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.dropdownText, isDark && { color: '#ffffff' }]}>{form.category}</Text>
                <ChevronDown size={18} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>

              <Field
                label="Contact Phone *"
                value={form.phone}
                onChangeText={v => set('phone', v.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                keyboardType="number-pad"
                maxLength={10}
                error={fieldErrors.phone}
              />

              <Field
                label="Contact Email *"
                value={form.email}
                onChangeText={v => set('email', v)}
                placeholder="store@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldErrors.email}
              />

              <Field
                label="Description"
                value={form.description}
                onChangeText={v => set('description', v)}
                placeholder="Tell nearby customers what your store offers…"
                multiline
                numberOfLines={3}
                error={fieldErrors.description}
              />
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 2: Verification (PAN + Aadhaar + GSTIN + FSSAI)     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <View style={[styles.section, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={20} color="#0d9488" />
                <Text style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Cashfree Identity & Tax KYC</Text>
              </View>
              <Text style={[styles.sectionSubtitle, isDark && { color: '#94a3b8' }]}>
                Live verification with Income Tax, UIDAI & GST databases ensures legitimate merchant identity.
              </Text>

              {/* 1. GSTIN Preference Toggle Card */}
              <View
                style={[
                  styles.verifyCard,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Building2 size={16} color={isDark ? '#38bdf8' : '#0284c7'} />
                  <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>
                    Do you have a GSTIN Number? *
                  </Text>
                </View>
                <Text style={[styles.fieldHint, { marginTop: 0, marginBottom: 12 }, isDark && { color: '#94a3b8' }]}>
                  If you have a GSTIN, select Yes to verify with GST portal. If not, select No to verify using PAN Card.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      },
                      hasGstin === 'yes'
                        ? {
                            backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                            borderColor: '#0284c7',
                          }
                        : {
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                          },
                    ]}
                    onPress={() => {
                      setHasGstin('yes');
                      setError('');
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.gstin;
                        delete next.pan;
                        delete next.panName;
                        return next;
                      });
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        borderWidth: 1.5,
                        borderColor: hasGstin === 'yes' ? '#0284c7' : '#94a3b8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {hasGstin === 'yes' ? (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0284c7' }} />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: hasGstin === 'yes' ? (isDark ? '#38bdf8' : '#0369a1') : (isDark ? '#cbd5e1' : '#475569'),
                      }}
                    >
                      Yes, I have GSTIN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      },
                      hasGstin === 'no'
                        ? {
                            backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                            borderColor: '#0284c7',
                          }
                        : {
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                          },
                    ]}
                    onPress={() => {
                      setHasGstin('no');
                      setError('');
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.gstin;
                        delete next.pan;
                        delete next.panName;
                        return next;
                      });
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        borderWidth: 1.5,
                        borderColor: hasGstin === 'no' ? '#0284c7' : '#94a3b8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {hasGstin === 'no' ? (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0284c7' }} />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: hasGstin === 'no' ? (isDark ? '#38bdf8' : '#0369a1') : (isDark ? '#cbd5e1' : '#475569'),
                      }}
                    >
                      No, use PAN Card
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. If Yes: GSTIN Number Card */}
              {hasGstin === 'yes' && (
                <View
                  style={[
                    styles.verifyCard,
                    isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                    gstinVerified && (isDark ? { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: '#059669' } : styles.verifyCardSuccess),
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                      <Building2 size={16} color={gstinVerified ? '#047857' : (isDark ? '#38bdf8' : '#0284c7')} />
                      <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]} numberOfLines={1}>GSTIN Number *</Text>
                    </View>
                    {gstinVerified ? (
                      <View style={styles.verifiedBadge}>
                        <BadgeCheck size={13} color="#047857" />
                        <Text style={styles.verifiedBadgeText}>GST Active</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.inputActionRow}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.monoInput,
                        {
                          backgroundColor: isDark ? '#020617' : '#ffffff',
                          color: isDark ? '#ffffff' : '#111827',
                          borderColor: fieldErrors.gstin ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
                        },
                      ]}
                      value={form.gstin}
                      onChangeText={v => {
                        set('gstin', v.toUpperCase());
                        if (gstinVerified) setGstinVerified(false);
                      }}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                      maxLength={15}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.actionButton, verifyingGstin && { opacity: 0.7 }]}
                      onPress={verifyGSTINWithCashfree}
                      disabled={verifyingGstin || !form.gstin.trim()}
                    >
                      {verifyingGstin ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : gstinVerified ? (
                        <Text style={styles.actionButtonText}>Re-verify</Text>
                      ) : (
                        <Text style={styles.actionButtonText}>Verify GST</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.gstin ? (
                    <View style={styles.fieldErrorRow}>
                      <AlertCircle size={13} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.gstin}</Text>
                    </View>
                  ) : null}
                  {gstinError ? <Text style={styles.panErrorText}>{gstinError}</Text> : null}
                  {gstinVerified && gstinData && (
                    <View style={[styles.verifiedDetailBox, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: '#065f46' }]}>
                      <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                        <Text style={{ fontWeight: '700' }}>Legal Name: </Text>
                        {gstinData.legalName}
                      </Text>
                      <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                        <Text style={{ fontWeight: '700' }}>Status: </Text>
                        {gstinData.gstinStatus} ({gstinData.taxpayerType || 'Regular'})
                      </Text>
                      {gstinData.embeddedPan && (
                        <Text style={[styles.verifiedMatchText, isDark && { color: '#34d399' }]}>
                          ✓ Embedded PAN: {gstinData.embeddedPan} (No separate PAN card required)
                        </Text>
                      )}
                    </View>
                  )}
                  <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>
                    15-character Goods and Services Tax Identification Number. PAN verification is not required when GSTIN is provided.
                  </Text>
                </View>
              )}

              {/* 3. If No: PAN Number Card */}
              {hasGstin === 'no' && (
                <View
                  style={[
                    styles.verifyCard,
                    isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                    panVerified && (isDark ? { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: '#059669' } : styles.verifyCardSuccess),
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                      <FileText size={16} color={panVerified ? '#047857' : (isDark ? '#94a3b8' : '#475569')} />
                      <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]} numberOfLines={1}>Permanent Account Number (PAN) *</Text>
                    </View>
                    {panVerified ? (
                      <View style={styles.verifiedBadge}>
                        <BadgeCheck size={13} color="#047857" />
                        <Text style={styles.verifiedBadgeText}>ITD Verified</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={{ marginTop: 6, marginBottom: 8 }}>
                    <Text style={[styles.fieldLabel, { fontSize: 10, marginBottom: 4, textTransform: 'none' }, isDark && { color: '#cbd5e1' }]}>
                      Name as on PAN Card *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? '#020617' : '#ffffff',
                          color: isDark ? '#ffffff' : '#111827',
                          borderColor: fieldErrors.panName ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
                        },
                      ]}
                      value={form.panName}
                      onChangeText={v => {
                        set('panName', v);
                        if (panVerified) setPanVerified(false);
                      }}
                      placeholder="e.g. JOHN DOE"
                      placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                      autoCapitalize="words"
                    />
                    {fieldErrors.panName ? (
                      <View style={styles.fieldErrorRow}>
                        <AlertCircle size={13} color="#dc2626" />
                        <Text style={styles.fieldErrorText}>{fieldErrors.panName}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={[styles.fieldLabel, { fontSize: 10, marginBottom: 4, textTransform: 'none' }, isDark && { color: '#cbd5e1' }]}>
                    PAN Number *
                  </Text>
                  <View style={styles.inputActionRow}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.monoInput,
                        {
                          backgroundColor: isDark ? '#020617' : '#ffffff',
                          color: isDark ? '#ffffff' : '#111827',
                          borderColor: fieldErrors.pan ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
                        },
                      ]}
                      value={form.pan}
                      onChangeText={v => {
                        set('pan', v.toUpperCase());
                        if (panVerified) setPanVerified(false);
                      }}
                      placeholder="e.g. ABCDE1234F"
                      placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                      maxLength={10}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.actionButton, verifyingPan && { opacity: 0.7 }]}
                      onPress={verifyPANWithCashfree}
                      disabled={verifyingPan || !form.pan.trim() || !form.panName?.trim()}
                    >
                      {verifyingPan ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : panVerified ? (
                        <Text style={styles.actionButtonText}>Re-verify</Text>
                      ) : (
                        <Text style={styles.actionButtonText}>Verify PAN</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.pan ? (
                    <View style={styles.fieldErrorRow}>
                      <AlertCircle size={13} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.pan}</Text>
                    </View>
                  ) : null}
                  {panError ? <Text style={styles.panErrorText}>{panError}</Text> : null}
                  {panVerified && panData && (
                    <View style={[styles.verifiedDetailBox, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: '#065f46' }]}>
                      {panData.registeredName ? (
                        <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                          <Text style={{ fontWeight: '700' }}>Registered Name: </Text>
                          {panData.registeredName}
                        </Text>
                      ) : (
                        <Text style={{ color: '#d97706', fontSize: 11, fontWeight: '500' }}>
                          ⚠ Name not returned by Cashfree API. Add production keys to enable identity verification.
                        </Text>
                      )}
                      {panData.registeredName && panData.belongsToUser && (
                        <Text style={[styles.verifiedMatchText, isDark && { color: '#34d399' }]}>
                          ✓ PAN matches applicant ({form.panName || form.legalBusinessName || user?.fullname || form.name}).
                        </Text>
                      )}
                    </View>
                  )}
                  <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>
                    10-character Permanent Account Number issued by Income Tax Dept.
                  </Text>
                </View>
              )}

              {/* 4. Aadhaar Number Card (UIDAI Paperless e-KYC) */}
              <View
                style={[
                  styles.verifyCard,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                  aadhaarVerified && (isDark ? { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: '#059669' } : styles.verifyCardSuccess),
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                    <Fingerprint size={16} color={aadhaarVerified ? '#047857' : (isDark ? '#38bdf8' : '#0284c7')} />
                    <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]} numberOfLines={1}>
                      Aadhaar Number (UIDAI OKYC)
                    </Text>
                  </View>
                  {aadhaarVerified ? (
                    <View style={styles.verifiedBadge}>
                      <BadgeCheck size={13} color="#047857" />
                      <Text style={styles.verifiedBadgeText}>Aadhaar Verified</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 10, fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                      UIDAI e-KYC
                    </Text>
                  )}
                </View>

                {/* Name as on Aadhaar Card */}
                <View style={{ marginTop: 6, marginBottom: 8 }}>
                  <Text style={[styles.fieldLabel, { fontSize: 10, marginBottom: 4, textTransform: 'none' }, isDark && { color: '#cbd5e1' }]}>
                    Name as on Aadhaar Card
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#020617' : '#ffffff',
                        color: isDark ? '#ffffff' : '#111827',
                        borderColor: fieldErrors.aadhaarName ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
                      },
                    ]}
                    value={form.aadhaarName}
                    onChangeText={v => {
                      set('aadhaarName', v);
                      if (aadhaarVerified) setAadhaarVerified(false);
                      if (aadhaarOtpSent) setAadhaarOtpSent(false);
                    }}
                    placeholder="e.g. JOHN DOE"
                    placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                    autoCapitalize="words"
                  />
                  {fieldErrors.aadhaarName ? (
                    <View style={styles.fieldErrorRow}>
                      <AlertCircle size={13} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.aadhaarName}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Aadhaar Number Input */}
                <Text style={[styles.fieldLabel, { fontSize: 10, marginBottom: 4, textTransform: 'none' }, isDark && { color: '#cbd5e1' }]}>
                  Aadhaar Number (12 digits)
                </Text>
                <View style={styles.inputActionRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.monoInput,
                      {
                        backgroundColor: isDark ? '#020617' : '#ffffff',
                        color: isDark ? '#ffffff' : '#111827',
                        borderColor: fieldErrors.aadhaar ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
                      },
                    ]}
                    value={form.aadhaar}
                    onChangeText={v => {
                      const clean = v.replace(/\D/g, '').slice(0, 12);
                      set('aadhaar', clean);
                      if (aadhaarVerified) setAadhaarVerified(false);
                      if (aadhaarOtpSent) setAadhaarOtpSent(false);
                    }}
                    placeholder="e.g. 123456789012"
                    placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                    maxLength={12}
                    keyboardType="number-pad"
                  />
                  {!aadhaarOtpSent ? (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        (verifyingAadhaar || form.aadhaar.length < 12 || !form.aadhaarName.trim()) && { opacity: 0.6 },
                      ]}
                      onPress={sendAadhaarOtpWithCashfree}
                      disabled={verifyingAadhaar || form.aadhaar.length < 12 || !form.aadhaarName.trim()}
                    >
                      {verifyingAadhaar ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.actionButtonText}>Verify Aadhaar</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
                {fieldErrors.aadhaar ? (
                  <View style={styles.fieldErrorRow}>
                    <AlertCircle size={13} color="#dc2626" />
                    <Text style={styles.fieldErrorText}>{fieldErrors.aadhaar}</Text>
                  </View>
                ) : null}

                {/* Aadhaar OTP Section */}
                {aadhaarOtpSent && !aadhaarVerified && (
                  <View
                    style={{
                      marginTop: 10,
                      backgroundColor: isDark ? 'rgba(15, 118, 110, 0.2)' : '#f0fdfa',
                      borderWidth: 1,
                      borderColor: isDark ? '#115e59' : '#99f6e4',
                      borderRadius: BorderRadius.md,
                      padding: Spacing.sm + 2,
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: isDark ? '#5eead4' : '#0f766e',
                      }}
                    >
                      Enter 6-digit OTP sent to your Aadhaar-linked mobile:
                    </Text>
                    <View style={styles.inputActionRow}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.monoInput,
                          {
                            backgroundColor: isDark ? '#020617' : '#ffffff',
                            color: isDark ? '#ffffff' : '#111827',
                            textAlign: 'center',
                            fontSize: 16,
                            letterSpacing: 4,
                          },
                        ]}
                        value={aadhaarOtp}
                        onChangeText={v => setAadhaarOtp(v.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                        maxLength={6}
                        keyboardType="number-pad"
                      />
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: '#059669' },
                          (verifyingAadhaarOtp || aadhaarOtp.length < 4) && { opacity: 0.6 },
                        ]}
                        onPress={verifyAadhaarOtpWithCashfree}
                        disabled={verifyingAadhaarOtp || aadhaarOtp.length < 4}
                      >
                        {verifyingAadhaarOtp ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.actionButtonText}>Submit OTP</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {aadhaarError ? <Text style={styles.panErrorText}>{aadhaarError}</Text> : null}

                {aadhaarVerified && aadhaarData && (
                  <View style={[styles.verifiedDetailBox, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: '#065f46' }]}>
                    <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                      <Text style={{ fontWeight: '700' }}>Aadhaar Holder: </Text>
                      {aadhaarData.nameOnAadhaar}
                    </Text>
                    {aadhaarData.belongsToUser && (
                      <Text style={[styles.verifiedMatchText, isDark && { color: '#34d399' }]}>
                        ✓ Aadhaar identity confirmed and matches store applicant.
                      </Text>
                    )}
                  </View>
                )}

                <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>
                  Your 12-digit Unique Identification Authority of India (UIDAI) citizen number.
                </Text>
              </View>

              {/* 5. Conditional FSSAI Number for Food & Beverages */}
              {isFoodCategory && (
                <View style={[styles.fssaiCard, isDark && { backgroundColor: 'rgba(120, 53, 15, 0.2)', borderColor: '#78350f' }]}>
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                      <Utensils size={16} color={isDark ? '#fbbf24' : '#b45309'} />
                      <Text style={[styles.fieldLabel, { color: isDark ? '#fde68a' : '#92400e', marginBottom: 0 }]} numberOfLines={1}>
                        FSSAI License Number *
                      </Text>
                    </View>
                    <View style={styles.fssaiBadge}>
                      <Text style={styles.fssaiBadgeText}>Mandatory for Food</Text>
                    </View>
                  </View>

                  <TextInput
                    style={[
                      styles.input,
                      styles.fssaiInput,
                      {
                        backgroundColor: isDark ? '#020617' : '#ffffff',
                        color: isDark ? '#ffffff' : '#111827',
                        borderColor: fieldErrors.fssaiNumber ? '#dc2626' : (isDark ? '#334155' : '#fde68a'),
                      },
                    ]}
                    value={form.fssaiNumber}
                    onChangeText={v => set('fssaiNumber', v.replace(/\D/g, ''))}
                    placeholder="e.g. 10012345678901 (14 digits)"
                    placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                    maxLength={14}
                    keyboardType="number-pad"
                  />
                  {fieldErrors.fssaiNumber ? (
                    <View style={styles.fieldErrorRow}>
                      <AlertCircle size={13} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.fssaiNumber}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.fieldHint, { color: isDark ? '#fde68a' : '#b45309' }]}>
                    14-digit food safety registration / license issued by FSSAI.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* STEP 3: Store Address & GPS Location                     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={[styles.section, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
              <View style={styles.sectionHeaderRow}>
                <MapPin size={20} color="#0d9488" />
                <Text style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Physical Store Address</Text>
              </View>

              <Field
                label="Street Address *"
                value={form.street}
                onChangeText={v => set('street', v)}
                placeholder="e.g. 123 Bazaar Road, 2nd Cross"
                error={fieldErrors.street}
              />

              {/* State Dropdown */}
              <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>State *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                  fieldErrors.state && { borderColor: '#dc2626' },
                ]}
                onPress={() => setShowStateModal(true)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !form.state
                      ? { color: isDark ? '#64748b' : '#94a3b8' }
                      : isDark
                        ? { color: '#ffffff' }
                        : { color: '#111827' },
                  ]}
                >
                  {form.state || 'Select State'}
                </Text>
                <ChevronDown size={18} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
              {fieldErrors.state ? (
                <View style={styles.fieldErrorRow}>
                  <AlertCircle size={13} color="#dc2626" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.state}</Text>
                </View>
              ) : null}

              {/* City Dropdown */}
              <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>City *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                  fieldErrors.city && { borderColor: '#dc2626' },
                  !form.state && { opacity: 0.6 },
                ]}
                disabled={!form.state}
                onPress={() => setShowCityModal(true)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !form.city
                      ? { color: isDark ? '#64748b' : '#94a3b8' }
                      : isDark
                        ? { color: '#ffffff' }
                        : { color: '#111827' },
                  ]}
                >
                  {form.city || (form.state ? 'Select City' : 'Select State first')}
                </Text>
                <ChevronDown size={18} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
              {fieldErrors.city ? (
                <View style={styles.fieldErrorRow}>
                  <AlertCircle size={13} color="#dc2626" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.city}</Text>
                </View>
              ) : null}

              {/* PIN Code */}
              <Field
                label="PIN Code *"
                value={form.pinCode}
                onChangeText={v => set('pinCode', v.replace(/\D/g, ''))}
                placeholder="e.g. 600001"
                maxLength={6}
                keyboardType="number-pad"
                error={fieldErrors.pinCode}
              />
              <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>Auto-populated on city select</Text>

              {/* GPS Coordinates Section */}
              <View style={styles.gpsSection}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>Store GPS Location *</Text>
                  <TouchableOpacity
                    style={[styles.gpsButton, isDark && { backgroundColor: '#134e4a33', borderColor: '#0f766e' }]}
                    onPress={detectLocation}
                    disabled={detecting}
                  >
                    {detecting ? (
                      <ActivityIndicator size="small" color="#0d9488" />
                    ) : (
                      <>
                        <MapPin size={14} color="#0d9488" />
                        <Text style={[styles.gpsButtonText, isDark && { color: '#2dd4bf' }]}>Use Current Location</Text>
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

                {fieldErrors.coordinates ? (
                  <View style={[styles.fieldErrorRow, { marginTop: 6 }]}>
                    <AlertCircle size={13} color="#dc2626" />
                    <Text style={styles.fieldErrorText}>{fieldErrors.coordinates}</Text>
                  </View>
                ) : null}

                {form.latitude && form.longitude ? (
                  <View style={[styles.locationTag, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: '#059669' }]}>
                    <CheckCircle size={15} color="#047857" />
                    <Text style={[styles.locationTagText, isDark && { color: '#6ee7b7' }]}>
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
        {/* STEP 4: Bank Details & Cashfree Penny Drop               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <View style={[styles.section, isDark && { backgroundColor: '#111827', borderColor: '#1f2937' }]}>
              <View style={styles.sectionHeaderRow}>
                <Building2 size={20} color="#0d9488" />
                <Text style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Settlement Bank Account</Text>
              </View>
              <Text style={[styles.sectionSubtitle, isDark && { color: '#94a3b8' }]}>
                Used for automated marketplace payouts directly to your verified bank account.
              </Text>

              <Field
                label="Legal Business / Entity Name *"
                value={form.legalBusinessName}
                onChangeText={v => set('legalBusinessName', v)}
                placeholder="e.g. Rohini B"
                error={fieldErrors.legalBusinessName}
              />
              <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>Must match your bank passbook name</Text>

              <Field
                label="Bank Account Number *"
                value={form.accountNumber}
                onChangeText={v => {
                  set('accountNumber', v.replace(/\D/g, ''));
                  if (bankVerified) setBankVerified(false);
                }}
                placeholder="e.g. 6285854908"
                secureTextEntry={!showAccountNumber}
                keyboardType="number-pad"
                error={fieldErrors.accountNumber}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowAccountNumber(!showAccountNumber)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={showAccountNumber ? "Hide bank account number" : "Show bank account number"}
                  >
                    {showAccountNumber ? (
                      <EyeOff size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    ) : (
                      <Eye size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    )}
                  </TouchableOpacity>
                }
              />

              <Field
                label="Confirm Bank Account Number *"
                value={form.confirmAccountNumber}
                onChangeText={v => {
                  set('confirmAccountNumber', v.replace(/\D/g, ''));
                  if (bankVerified) setBankVerified(false);
                }}
                placeholder="Re-enter bank account number"
                secureTextEntry={!showConfirmAccountNumber}
                keyboardType="number-pad"
                error={fieldErrors.confirmAccountNumber}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={showConfirmAccountNumber ? "Hide bank account number" : "Show bank account number"}
                  >
                    {showConfirmAccountNumber ? (
                      <EyeOff size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    ) : (
                      <Eye size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    )}
                  </TouchableOpacity>
                }
              />

              <View style={{ marginBottom: 12 }}>
                <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.fieldLabel, { marginBottom: 0 }, isDark && { color: '#e2e8f0' }]} numberOfLines={1}>
                      Bank IFSC Code *
                    </Text>
                  </View>
                  {ifscVerified && ifscData ? (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={11} color="#047857" />
                      <Text style={styles.verifiedBadgeText}>Verified IFSC</Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },
                      isDark && { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' },
                      fieldErrors.ifscCode && { borderColor: '#dc2626' },
                    ]}
                    value={form.ifscCode}
                    onChangeText={v => {
                      const val = v.toUpperCase();
                      set('ifscCode', val);
                      if (bankVerified) setBankVerified(false);
                      if (ifscVerified) setIfscVerified(false);
                      if (val.length === 11 && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val)) {
                        verifyIFSCWithCashfree(val);
                      }
                    }}
                    onBlur={() => {
                      if (form.ifscCode.length === 11 && !ifscVerified) {
                        verifyIFSCWithCashfree();
                      }
                    }}
                    placeholder="e.g. IDIB000K073"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    maxLength={11}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { paddingVertical: 10, paddingHorizontal: 12 },
                      (verifyingIfsc || form.ifscCode.length !== 11) && { opacity: 0.6 },
                    ]}
                    disabled={verifyingIfsc || form.ifscCode.length !== 11}
                    onPress={() => verifyIFSCWithCashfree()}
                  >
                    {verifyingIfsc ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {ifscVerified ? '✓ Verified' : 'Verify IFSC'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                {fieldErrors.ifscCode ? (
                  <View style={styles.fieldErrorRow}>
                    <AlertCircle size={13} color="#dc2626" />
                    <Text style={styles.fieldErrorText}>{fieldErrors.ifscCode}</Text>
                  </View>
                ) : null}
                {ifscError ? <Text style={styles.panErrorText}>{ifscError}</Text> : null}
                {ifscVerified && ifscData ? (
                  <View style={[styles.verifiedDetailBox, { marginTop: 6 }, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: '#065f46' }]}>
                    <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                      <Text style={{ fontWeight: '700' }}>Bank: </Text>
                      {ifscData.bankName}
                    </Text>
                    {ifscData.branch ? (
                      <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                        <Text style={{ fontWeight: '700' }}>Branch: </Text>
                        {ifscData.branch}
                      </Text>
                    ) : null}
                    {ifscData.city || ifscData.state ? (
                      <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                        <Text style={{ fontWeight: '700' }}>Location: </Text>
                        {[ifscData.city, ifscData.state].filter(Boolean).join(', ')}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>11-character Indian bank branch code</Text>
              </View>

              {/* Cashfree Bank Penny Drop Verification Card */}
              <View
                style={[
                  styles.verifyCard,
                  isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                  bankVerified && (isDark ? { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: '#059669' } : styles.verifyCardSuccess),
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                    <BadgeCheck
                      size={16}
                      color={bankVerified ? '#047857' : '#0d9488'}
                    />
                    <Text style={[styles.fieldLabel, { marginBottom: 0, flexShrink: 1 }, isDark && { color: '#e2e8f0' }]} numberOfLines={1}>
                      Cashfree Bank Verification
                    </Text>
                  </View>
                  {bankVerified ? (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={13} color="#047857" />
                      <Text style={styles.verifiedBadgeText}>Penny Drop Verified</Text>
                    </View>
                  ) : null}
                </View>

                <View style={{ marginTop: 6, marginBottom: 4 }}>
                  <TouchableOpacity
                    style={[styles.bankVerifyButton, verifyingBank && { opacity: 0.7 }]}
                    onPress={verifyBankWithCashfree}
                    disabled={
                      verifyingBank || !form.accountNumber || !form.ifscCode || !form.legalBusinessName.trim()
                    }
                  >
                    {verifyingBank ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        ⚡ Verify Bank Account (Instant Sync)
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                {bankError ? <Text style={styles.panErrorText}>{bankError}</Text> : null}

                {bankVerified && bankData && (
                  <View style={[styles.verifiedDetailBox, isDark && { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: '#065f46' }]}>
                    <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                      <Text style={{ fontWeight: '700' }}>Account Holder: </Text>
                      {bankData.nameAtBank || bankData.registeredName || form.legalBusinessName}
                    </Text>
                    {bankData.bankName ? (
                      <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                        <Text style={{ fontWeight: '700' }}>Bank: </Text>
                        {bankData.bankName} {bankData.branch ? `(${bankData.branch})` : ''}
                      </Text>
                    ) : null}
                    <Text style={[styles.verifiedDetailText, isDark && { color: '#6ee7b7' }]}>
                      <Text style={{ fontWeight: '700' }}>Status: </Text>
                      {bankData.accountStatus || 'ACTIVE'}
                    </Text>
                    {bankData.nameMatches !== false && (
                      <Text style={[styles.verifiedMatchText, isDark && { color: '#34d399' }]}>
                        ✓ Bank holder name matches applicant identity.
                      </Text>
                    )}
                  </View>
                )}
                <Text style={[styles.fieldHint, isDark && { color: '#94a3b8' }]}>
                  Penny drop verification confirms active account and holder name with NPCI / Cashfree.
                </Text>
              </View>

              {/* Overall Cashfree KYC Trust Card */}
              <View style={styles.kycTrustCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Lock size={15} color="#2dd4bf" />
                    <Text style={styles.kycTrustTitle}>Cashfree KYC Trust Summary</Text>
                  </View>
                  <View style={styles.kycTrustBadge}>
                    <Text style={styles.kycTrustBadgeText}>SecureID</Text>
                  </View>
                </View>

                <View style={styles.kycGrid}>
                  <View
                    style={[
                      styles.kycGridItem,
                      panVerified && styles.kycGridItemSuccess,
                    ]}
                  >
                    <Text style={styles.kycGridLabel}>PAN ID</Text>
                    <Text
                      style={[
                        styles.kycGridValue,
                        panVerified && { color: '#34d399' },
                      ]}
                    >
                      {panVerified ? '✓ Verified' : 'Pending'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.kycGridItem,
                      aadhaarVerified && styles.kycGridItemSuccess,
                    ]}
                  >
                    <Text style={styles.kycGridLabel}>Aadhaar</Text>
                    <Text
                      style={[
                        styles.kycGridValue,
                        aadhaarVerified && { color: '#34d399' },
                      ]}
                    >
                      {aadhaarVerified ? '✓ Verified' : 'Pending'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.kycGridItem,
                      gstinVerified && styles.kycGridItemSuccess,
                    ]}
                  >
                    <Text style={styles.kycGridLabel}>GSTIN</Text>
                    <Text
                      style={[
                        styles.kycGridValue,
                        gstinVerified && { color: '#34d399' },
                      ]}
                    >
                      {gstinVerified ? '✓ Verified' : form.gstin ? 'Pending' : 'Optional'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.kycGridItem,
                      bankVerified && styles.kycGridItemSuccess,
                    ]}
                  >
                    <Text style={styles.kycGridLabel}>Bank Sync</Text>
                    <Text
                      style={[
                        styles.kycGridValue,
                        bankVerified && { color: '#34d399' },
                      ]}
                    >
                      {bankVerified ? '✓ Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.kycTrustSubtitle}>
                  Verified records are cross-matched with Government databases.
                </Text>
              </View>

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
              style={[styles.backButton, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
              onPress={handlePrev}
              disabled={loading}
            >
              <ArrowLeft size={16} color={isDark ? '#cbd5e1' : '#334155'} />
              <Text style={[styles.backButtonText, isDark && { color: '#cbd5e1' }]}>Back</Text>
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
      {/* Aadhaar OTP Verification Modal */}
      <Modal visible={showAadhaarOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && { color: '#ffffff' }]}>Enter Aadhaar OTP</Text>
            <Text style={[styles.otpSubtitle, isDark && { color: '#94a3b8' }]}>
              Please enter the 6-digit OTP sent to your Aadhaar-linked mobile number by UIDAI.
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.otpInput,
                {
                  backgroundColor: isDark ? '#020617' : '#ffffff',
                  color: isDark ? '#ffffff' : '#111827',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                },
              ]}
              value={aadhaarOtp}
              onChangeText={setAadhaarOtp}
              placeholder="e.g. 123456"
              placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
              keyboardType="number-pad"
              maxLength={6}
            />
            {aadhaarError ? (
              <Text style={[styles.panErrorText, { textAlign: 'center', marginBottom: 8 }]}>
                {aadhaarError}
              </Text>
            ) : null}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { width: '100%', justifyContent: 'center' },
                verifyingAadhaarOtp && { opacity: 0.7 },
              ]}
              onPress={verifyAadhaarOtpWithCashfree}
              disabled={verifyingAadhaarOtp}
            >
              {verifyingAadhaarOtp ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm & Verify Aadhaar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCloseButton, isDark && { borderTopColor: '#334155' }]}
              onPress={() => setShowAadhaarOtpModal(false)}
            >
              <Text style={[styles.modalCloseText, isDark && { color: '#94a3b8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && { color: '#ffffff' }]}>Select Store Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    isDark && { borderBottomColor: '#334155' },
                    form.category === item && (isDark ? { backgroundColor: '#0f172a' } : styles.modalItemActive),
                  ]}
                  onPress={() => {
                    set('category', item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isDark && { color: '#f8fafc' },
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
              style={[styles.modalCloseButton, isDark && { borderTopColor: '#334155' }]}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={[styles.modalCloseText, isDark && { color: '#94a3b8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && { color: '#ffffff' }]}>Select State</Text>
            <FlatList
              data={indianStates}
              keyExtractor={item => item.isoCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    isDark && { borderBottomColor: '#334155' },
                    form.state === item.name && (isDark ? { backgroundColor: '#0f172a' } : styles.modalItemActive),
                  ]}
                  onPress={() => handleSelectState(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isDark && { color: '#f8fafc' },
                      form.state === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, isDark && { borderTopColor: '#334155' }]}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={[styles.modalCloseText, isDark && { color: '#94a3b8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && { color: '#ffffff' }]}>Select City</Text>
            <FlatList
              data={cities}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    isDark && { borderBottomColor: '#334155' },
                    form.city === item.name && (isDark ? { backgroundColor: '#0f172a' } : styles.modalItemActive),
                  ]}
                  onPress={() => handleSelectCity(item.name)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isDark && { color: '#f8fafc' },
                      form.city === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, isDark && { borderTopColor: '#334155' }]}
              onPress={() => setShowCityModal(false)}
            >
              <Text style={[styles.modalCloseText, isDark && { color: '#94a3b8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={showSuccess}
        title="Store Registered!"
        message="Your store has been created and verified successfully."
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
  rightElement?: React.ReactNode;
  error?: string;
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
  rightElement,
  error,
}: FieldProps) {
  const { isDark } = useTheme();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, isDark && { color: '#e2e8f0' }]}>{label}</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#ffffff' : '#111827',
              borderColor: error ? '#dc2626' : (isDark ? '#334155' : '#cbd5e1'),
              paddingRight: rightElement ? 44 : Spacing.md,
            },
            multiline && styles.textArea,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
        />
        {rightElement ? (
          <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            {rightElement}
          </View>
        ) : null}
      </View>
      {error ? (
        <View style={styles.fieldErrorRow}>
          <AlertCircle size={13} color="#dc2626" />
          <Text style={styles.fieldErrorText}>{error}</Text>
        </View>
      ) : null}
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
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: '#111827',
  },
  monoInput: {
    flex: 1,
    fontWeight: '700',
    letterSpacing: 1.2,
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
    color: '#111827',
    fontWeight: '500',
  },

  // Verification Cards
  verifyCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
  },
  verifyCardSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  inputActionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  bankVerifyButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    flexShrink: 0,
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
    fontWeight: '500',
  },
  verifiedDetailBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    gap: 2,
  },
  verifiedDetailText: {
    fontSize: 11,
    color: '#065f46',
  },
  verifiedMatchText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
    marginTop: 2,
  },

  // FSSAI Card
  fssaiCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
  },
  fssaiBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexShrink: 0,
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

  // KYC Trust Card
  kycTrustCard: {
    backgroundColor: '#0f172a',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  kycTrustTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: '#ffffff',
  },
  kycTrustBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  kycTrustBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2dd4bf',
  },
  kycGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  kycGridItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.md,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  kycGridItemSuccess: {
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  kycGridLabel: {
    fontSize: 9,
    color: '#94a3b8',
  },
  kycGridValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
    marginTop: 2,
  },
  kycTrustSubtitle: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: Spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: FontSizes.xs,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: FontSizes.xl,
    letterSpacing: 6,
    fontWeight: '800',
    marginBottom: Spacing.md,
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
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 2,
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    flex: 1,
  },
});
