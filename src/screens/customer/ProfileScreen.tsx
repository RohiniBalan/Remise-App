import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Heart,
  ShoppingBag,
  Gift,
  MapPin,
  Shield,
  Store,
  Save,
  LogOut,
  LogIn,
  User,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Calendar,
  Bell,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { authApi } from '../../api/authApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { indianStates, getCities } from '../../utils/indiaLocation';
import {
  LocationSelectField,
  normalizeLoc,
  lookupPincode,
} from '../../components/common/LocationSelectField';
import { mergeCategories } from '../../utils/storeCategories';
import { storeProductApi } from '../../api/storeProductApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'overview' | 'addresses' | 'security' | 'store';

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault?: boolean;
};

interface StoreProfile {
  name: string;
  category: string;
  address: string;
  workingHours: string;
  deliveryRadius: string;
  minimumOrderAmount: string;
}

interface BusinessDetails {
  gst: string;
  license: string;
  taxDetails: string;
  pan: string;
  fssai: string;
}

interface ProfileData {
  addresses: Address[];
  paymentMethods: string[];
  wishlist: string[];
  savedCart: string[];
  rewardsCoupons: string[];
  recentOrders: string[];
  recentlyViewedProducts: string[];
  favoriteStores: string[];

  upiId: string;

  storeProfile: StoreProfile;

  businessDetails: BusinessDetails;

  [key: string]: any;
}

const GENDER_OPTIONS = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
  { key: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// dob is stored as 'YYYY-MM-DD'; this just formats it for display
const formatDob = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // fall back to raw string for legacy values
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser, logout } = useAuth();
  const { isDark } = useTheme();
  const { unreadCount } = useUnreadNotifications();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [form, setForm] = useState<{
    fullname: string;
    email: string;
    mobilenumber: string;
    dob: string;
    gender: string;
    avatar: string;
    profileData: ProfileData;
  }>({
    fullname: user?.fullname || '',
    email: user?.email || '',
    mobilenumber: user?.mobilenumber || '',
    dob: user?.dob || (user?.profileData as any)?.dob || '',
    gender: user?.gender || (user?.profileData as any)?.gender || '',
    avatar: user?.avatar || (user?.profileData as any)?.avatar || '',

    profileData: {
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      savedCart: [],
      rewardsCoupons: [],
      recentOrders: [],
      recentlyViewedProducts: [],
      favoriteStores: [],

      upiId: '',

      storeProfile: {
        name: '',
        category: '',
        address: '',
        workingHours: '',
        deliveryRadius: '',
        minimumOrderAmount: '',
      },

      businessDetails: {
        gst: '',
        license: '',
        taxDetails: '',
        pan: '',
        fssai: '',
      },

      ...((user?.profileData as any) || {}),
    },
  });

  const [initialForm, setInitialForm] = useState<typeof form | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !initialForm) {
      const initForm = {
        fullname: user.fullname || '',
        email: user.email || '',
        mobilenumber: user.mobilenumber || '',
        dob: user.dob || (user.profileData as any)?.dob || '',
        gender: user.gender || (user.profileData as any)?.gender || '',
        avatar: user.avatar || (user.profileData as any)?.avatar || '',
        profileData: {
          addresses: [],
          paymentMethods: [],
          wishlist: [],
          savedCart: [],
          rewardsCoupons: [],
          recentOrders: [],
          recentlyViewedProducts: [],
          favoriteStores: [],
          upiId: '',
          storeProfile: {
            name: '',
            category: '',
            address: '',
            workingHours: '',
            deliveryRadius: '',
            minimumOrderAmount: '',
          },
          businessDetails: {
            gst: '',
            license: '',
            taxDetails: '',
            pan: '',
            fssai: '',
          },
          ...((user.profileData as any) || {}),
        },
      };
      setForm(initForm);
      setInitialForm(initForm);
    }
  }, [user, initialForm]);

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await storeProductApi.getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  loadCategories();
}, []);

  const categoryOptions = useMemo(
  () =>
    mergeCategories(categories || []).map(c => ({
      key: c.name,
      label: c.name,
    })),
  [categories]
);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [addressDraft, setAddressDraft] = useState<Address>({
    id: `${Date.now()}`,
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: true,
  });
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [draftCities, setDraftCities] = useState<any[]>([]);

  const findState = useCallback((value: string) => {
    const v = normalizeLoc(value);
    if (!v) return undefined;
    return indianStates.find(
      s => normalizeLoc(s.name) === v || normalizeLoc(s.isoCode) === v,
    );
  }, []);

  useEffect(() => {
    if (!addressDraft.state) {
      setDraftCities([]);
      return;
    }
    const state = findState(addressDraft.state);
    setDraftCities(state ? getCities(state.isoCode) : []);
  }, [addressDraft.state, findState]);

  const stateOptions = indianStates.map(s => ({
    key: s.isoCode,
    label: s.name,
  }));
  const draftCityOptions = draftCities.map((c: any) => ({
    key: c.name,
    label: c.name,
  }));

  const handleDraftStateSelect = (isoCode: string, label: string) => {
    setAddressDraft(prev => ({ ...prev, state: label, city: '', pinCode: '' }));
    setDraftCities(getCities(isoCode));
  };

  const handleDraftCitySelect = async (cityName: string) => {
    setAddressDraft(prev => ({ ...prev, city: cityName }));
    if (!cityName) return;
    const pin = await lookupPincode(cityName);
    if (pin) setAddressDraft(prev => ({ ...prev, pinCode: pin }));
  };

  const tabs = useMemo<{ id: TabKey; label: string }[]>(() => {
    const base: { id: TabKey; label: string }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'addresses', label: 'Addresses' },
      { id: 'security', label: 'Security' },
    ];
    if (['store_owner', 'whole_saler', 'home_business'].includes(user?.role || '')) {
      base.push({ id: 'store', label: 'Store' });
    }
    return base;
  }, [user?.role]);

  const validatePersonalDetails = () => {
    const errors: Record<string, string> = {};
    if (!form.fullname || !form.fullname.trim()) {
      errors.fullname = 'Full name is required';
    } else if (form.fullname.trim().length < 2) {
      errors.fullname = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !form.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (form.mobilenumber && form.mobilenumber.trim()) {
      const cleanPhone = form.mobilenumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        errors.mobilenumber = 'Mobile number must be exactly 10 digits';
      }
    }

    if (form.dob) {
      const d = new Date(form.dob);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(d.getTime())) {
        errors.dob = 'Please select a valid date';
      } else if (d > today) {
        errors.dob = 'Date of birth cannot be in the future';
      }
    }

    return errors;
  };

  const validateAddressDraft = () => {
    const errors: Record<string, string> = {};
    if (!addressDraft.label || !addressDraft.label.trim()) {
      errors.label = 'Label is required (e.g. Home, Work)';
    }
    if (!addressDraft.fullName || !addressDraft.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (addressDraft.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    const cleanPhone = (addressDraft.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!addressDraft.street || !addressDraft.street.trim()) {
      errors.street = 'Street address is required';
    } else if (addressDraft.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters';
    }
    if (!addressDraft.state || !addressDraft.state.trim()) {
      errors.state = 'Please select a state';
    }
    if (!addressDraft.city || !addressDraft.city.trim()) {
      errors.city = 'Please select a city';
    }
    const cleanPin = (addressDraft.pinCode || '').trim();
    if (!cleanPin) {
      errors.pinCode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errors.pinCode = 'Pin code must be exactly 6 digits';
    }
    return errors;
  };

  const isProfileDirty = () => {
    if (!initialForm) return false;
    if ((form.fullname || '').trim() !== (initialForm.fullname || '').trim()) return true;
    if ((form.email || '').trim().toLowerCase() !== (initialForm.email || '').trim().toLowerCase()) return true;
    const cleanPhone = (form.mobilenumber || '').replace(/\D/g, '');
    const initialPhone = (initialForm.mobilenumber || '').replace(/\D/g, '');
    if (cleanPhone !== initialPhone) return true;
    if ((form.dob || '') !== (initialForm.dob || '')) return true;
    if ((form.gender || '') !== (initialForm.gender || '')) return true;
    if ((form.avatar || '') !== (initialForm.avatar || '')) return true;

    // Check store fields if present
    if (JSON.stringify(form.profileData?.storeProfile || {}) !== JSON.stringify(initialForm.profileData?.storeProfile || {})) return true;
    if (JSON.stringify(form.profileData?.businessDetails || {}) !== JSON.stringify(initialForm.profileData?.businessDetails || {})) return true;
    if ((form.profileData?.upiId || '') !== (initialForm.profileData?.upiId || '')) return true;

    return false;
  };

  const saveProfile = async (nextForm?: typeof form) => {
    setSaving(true);
    try {
      const payload = nextForm || form;
      await authApi.updateProfile(payload);
      await updateUser({ ...payload, profileData: payload.profileData });
      setInitialForm(payload);
      setFeedbackModal({
        visible: true,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile details and changes have been saved successfully.',
      });
    } catch (error: any) {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Unable to save profile details. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfileClicked = async () => {
    if (!isProfileDirty()) {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'No Changes',
        message: 'No changes have been made to your profile details.',
      });
      return;
    }

    const errors = validatePersonalDetails();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the highlighted errors before saving.',
      });
      return;
    }

    await saveProfile(form);
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirm password do not match.',
      });
      return;
    }
    try {
      await authApi.changePassword(
        security.currentPassword,
        security.newPassword,
      );
      setFeedbackModal({
        visible: true,
        type: 'success',
        title: 'Password Updated',
        message: 'Your account password has been changed securely.',
      });
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'Password Change Failed',
        message: error.response?.data?.message || 'Unable to change password.',
      });
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.guestContainer}>
          <View style={styles.guestAvatar}>
            <User size={42} color={CustomerColors.primary} />
          </View>
          <Text style={styles.guestTitle}>Welcome to REmise</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to view your orders, saved addresses, wishlist, and manage your account.
          </Text>
          <TouchableOpacity
            style={styles.guestLoginActionBtn}
            onPress={() => navigation.navigate('LoginRegister')}
            activeOpacity={0.85}
          >
            <LogIn size={18} color="#FFFFFF" />
            <Text style={styles.guestLoginActionBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl,
        }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={isDark ? '#FFFFFF' : CustomerColors.black} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => handleSaveProfileClicked()}
              activeOpacity={0.8}
            >
              <Save size={15} color="#fff" />
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(form.fullname || user?.email || 'U')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.avatarName}>
                {form.fullname || 'Your Name'}
              </Text>
              <Text style={styles.avatarEmail}>{user?.email}</Text>
              <View style={styles.verifiedPill}>
                <CheckCircle size={10} color={CustomerColors.success} />
                <Text style={styles.verifiedPillText}>
                  {user?.isEmailVerified === false
                    ? 'Verify email'
                    : 'Verified'}
                </Text>
              </View>
            </View>
            {/* Logout button inside avatar card */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setLogoutModalOpen(true)}
            >
              <LogOut size={16} color={CustomerColors.primary} />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'overview' && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Personal details</Text>
            <TextInput
              style={[styles.input, fieldErrors.fullname && styles.inputError]}
              value={form.fullname}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              onChangeText={value => {
                setForm(prev => ({ ...prev, fullname: value }));
                if (fieldErrors.fullname) setFieldErrors(prev => ({ ...prev, fullname: '' }));
              }}
            />
            {fieldErrors.fullname ? (
              <Text style={styles.errorText}>{fieldErrors.fullname}</Text>
            ) : null}

            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              value={form.email}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              onChangeText={value => {
                setForm(prev => ({ ...prev, email: value }));
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
            />
            {fieldErrors.email ? (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            ) : null}

            <TextInput
              style={[styles.input, fieldErrors.mobilenumber && styles.inputError]}
              value={form.mobilenumber}
              placeholder="Mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              onChangeText={value => {
                setForm(prev => ({ ...prev, mobilenumber: value }));
                if (fieldErrors.mobilenumber) setFieldErrors(prev => ({ ...prev, mobilenumber: '' }));
              }}
            />
            {fieldErrors.mobilenumber ? (
              <Text style={styles.errorText}>{fieldErrors.mobilenumber}</Text>
            ) : null}

            {/* Date of birth — calendar picker */}
            <TouchableOpacity
              style={[styles.input, styles.dobInput, fieldErrors.dob && styles.inputError]}
              onPress={() => setShowDobPicker(true)}
            >
              <Text style={form.dob ? styles.dobValue : styles.dobPlaceholder}>
                {form.dob ? formatDob(form.dob) : 'Date of birth'}
              </Text>
              <Calendar size={16} color={isDark ? '#F9FAFB' : CustomerColors.textSecondary} />
            </TouchableOpacity>
            {fieldErrors.dob ? (
              <Text style={styles.errorText}>{fieldErrors.dob}</Text>
            ) : null}

            {showDobPicker && (
              <DateTimePicker
                value={
                  form.dob && !isNaN(new Date(form.dob).getTime())
                    ? new Date(form.dob)
                    : new Date(2000, 0, 1)
                }
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDobPicker(false);
                  if (event.type === 'set' && selectedDate) {
                    const iso = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD
                    setForm(prev => ({ ...prev, dob: iso }));
                    if (fieldErrors.dob) setFieldErrors(prev => ({ ...prev, dob: '' }));
                  }
                }}
              />
            )}

            {/* Gender — dropdown */}
            <LocationSelectField
              label="Gender"
              value={GENDER_OPTIONS.find(g => g.key === form.gender)?.label || form.gender}
              placeholder="Select Gender"
              options={GENDER_OPTIONS}
              onSelect={key => setForm(prev => ({ ...prev, gender: key }))}
            />
          </View>
        )}

        {activeTab === 'addresses' && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved addresses</Text>
              <TouchableOpacity
                style={styles.smallActionBtn}
                onPress={() => {
                  setAddressDraft({
                    id: `${Date.now()}`,
                    label: 'Home',
                    fullName: '',
                    phone: '',
                    street: '',
                    city: '',
                    state: '',
                    pinCode: '',
                    isDefault: true,
                  });
                  setAddressErrors({});
                  setAddressEditorOpen(true);
                }}
              >
                <Plus size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            {addressEditorOpen && (
              <View style={{ marginTop: Spacing.md }}>
                <TextInput
                  style={[styles.input, addressErrors.label && styles.inputError]}
                  value={addressDraft.label}
                  placeholder="Label (e.g. Home, Work)"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value => {
                    setAddressDraft(prev => ({ ...prev, label: value }));
                    if (addressErrors.label) setAddressErrors(prev => ({ ...prev, label: '' }));
                  }}
                />
                {addressErrors.label ? (
                  <Text style={styles.errorText}>{addressErrors.label}</Text>
                ) : null}

                <TextInput
                  style={[styles.input, addressErrors.fullName && styles.inputError]}
                  value={addressDraft.fullName}
                  placeholder="Full name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value => {
                    setAddressDraft(prev => ({ ...prev, fullName: value }));
                    if (addressErrors.fullName) setAddressErrors(prev => ({ ...prev, fullName: '' }));
                  }}
                />
                {addressErrors.fullName ? (
                  <Text style={styles.errorText}>{addressErrors.fullName}</Text>
                ) : null}

                <TextInput
                  style={[styles.input, addressErrors.phone && styles.inputError]}
                  value={addressDraft.phone}
                  placeholder="Phone"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  onChangeText={value => {
                    setAddressDraft(prev => ({ ...prev, phone: value }));
                    if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: '' }));
                  }}
                />
                {addressErrors.phone ? (
                  <Text style={styles.errorText}>{addressErrors.phone}</Text>
                ) : null}

                <TextInput
                  style={[styles.input, addressErrors.street && styles.inputError]}
                  value={addressDraft.street}
                  placeholder="Street"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value => {
                    setAddressDraft(prev => ({ ...prev, street: value }));
                    if (addressErrors.street) setAddressErrors(prev => ({ ...prev, street: '' }));
                  }}
                />
                {addressErrors.street ? (
                  <Text style={styles.errorText}>{addressErrors.street}</Text>
                ) : null}

                <LocationSelectField
                  label="State"
                  value={addressDraft.state}
                  placeholder="Select State"
                  options={stateOptions}
                  onSelect={handleDraftStateSelect}
                />
                {addressErrors.state ? (
                  <Text style={styles.errorText}>{addressErrors.state}</Text>
                ) : null}

                <LocationSelectField
                  label="City"
                  value={addressDraft.city}
                  placeholder={
                    addressDraft.state ? 'Select City' : 'Select a state first'
                  }
                  options={draftCityOptions}
                  disabled={!addressDraft.state}
                  onSelect={handleDraftCitySelect}
                />
                {addressErrors.city ? (
                  <Text style={styles.errorText}>{addressErrors.city}</Text>
                ) : null}

                <TextInput
                  style={[styles.input, addressErrors.pinCode && styles.inputError]}
                  value={addressDraft.pinCode}
                  placeholder="Pin code"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value => {
                    setAddressDraft(prev => ({ ...prev, pinCode: value }));
                    if (addressErrors.pinCode) setAddressErrors(prev => ({ ...prev, pinCode: '' }));
                  }}
                />
                {addressErrors.pinCode ? (
                  <Text style={styles.errorText}>{addressErrors.pinCode}</Text>
                ) : null}

                <View style={styles.inlineRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setAddressEditorOpen(false);
                      setAddressErrors({});
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      const errors = validateAddressDraft();
                      setAddressErrors(errors);
                      if (Object.keys(errors).length > 0) {
                        setFeedbackModal({
                          visible: true,
                          type: 'error',
                          title: 'Invalid Address',
                          message: 'Please fill in all address fields correctly.',
                        });
                        return;
                      }
                      setAddressErrors({});

                      const addresses = [...(form.profileData.addresses || [])];
                      const nextAddress: Address = {
                        ...addressDraft,
                        label: addressDraft.label.trim(),
                        fullName: addressDraft.fullName.trim(),
                        phone: addressDraft.phone.replace(/\D/g, ''),
                        street: addressDraft.street.trim(),
                        pinCode: addressDraft.pinCode.trim(),
                      };
                      const index = addresses.findIndex(
                        (item: Address) => item.id === nextAddress.id,
                      );
                      if (index >= 0) addresses[index] = nextAddress;
                      else addresses.push(nextAddress);
                      if (!addresses.some((item: Address) => item.isDefault)) {
                        nextAddress.isDefault = true;
                      }
                      const nextProfileData = {
                        ...form.profileData,
                        addresses,
                      };
                      const nextFormState = { ...form, profileData: nextProfileData };
                      setForm(nextFormState);
                      saveProfile(nextFormState);
                      setAddressEditorOpen(false);
                      setAddressDraft({
                        id: `${Date.now()}`,
                        label: 'Home',
                        fullName: '',
                        phone: '',
                        street: '',
                        city: '',
                        state: '',
                        pinCode: '',
                        isDefault: true,
                      });
                      setDraftCities([]);
                    }}
                  >
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {(form.profileData.addresses || []).map((item: Address) => (
              <View key={item.id} style={styles.addressCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressTitle}>{item.label}</Text>
                  <Text style={styles.addressText}>
                    {item.fullName} · {item.phone}
                  </Text>
                  <Text style={styles.addressText}>
                    {item.street}, {item.city}, {item.state} - {item.pinCode}
                  </Text>
                </View>
                <View style={styles.inlineRow}>
                  {!item.isDefault && (
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => {
                        const addresses = (
                          form.profileData.addresses || []
                        ).map((entry: Address) => ({
                          ...entry,
                          isDefault: entry.id === item.id,
                        }));
                        const nextProfileData = {
                          ...form.profileData,
                          addresses,
                        };
                        setForm(prev => ({
                          ...prev,
                          profileData: nextProfileData,
                        }));
                        saveProfile({ ...form, profileData: nextProfileData });
                      }}
                    >
                      <Text style={styles.secondaryBtnText}>Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setAddressDraft(item);
                      setAddressEditorOpen(true);
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      const addresses = (
                        form.profileData.addresses || []
                      ).filter((entry: Address) => entry.id !== item.id);
                      const nextProfileData = {
                        ...form.profileData,
                        addresses,
                      };
                      setForm(prev => ({
                        ...prev,
                        profileData: nextProfileData,
                      }));
                      saveProfile({ ...form, profileData: nextProfileData });
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'security' && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Security</Text>
            {[
              { key: 'current', label: 'Current password' },
              { key: 'new', label: 'New password' },
              { key: 'confirm', label: 'Confirm password' },
            ].map(item => (
              <View key={item.key} style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>{item.label}</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    secureTextEntry={
                      !showPassword[item.key as 'current' | 'new' | 'confirm']
                    }
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder={item.label}
                    placeholderTextColor="#9CA3AF"
                    value={
                      item.key === 'current'
                        ? security.currentPassword
                        : item.key === 'new'
                        ? security.newPassword
                        : security.confirmPassword
                    }
                    onChangeText={value =>
                      setSecurity(prev => ({
                        ...prev,
                        [item.key === 'current'
                          ? 'currentPassword'
                          : item.key === 'new'
                          ? 'newPassword'
                          : 'confirmPassword']: value,
                      }))
                    }
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() =>
                      setShowPassword(prev => ({
                        ...prev,
                        [item.key as 'current' | 'new' | 'confirm']:
                          !prev[item.key as 'current' | 'new' | 'confirm'],
                      }))
                    }
                  >
                    {showPassword[item.key as 'current' | 'new' | 'confirm'] ? (
                      <EyeOff size={16} color={CustomerColors.textSecondary} />
                    ) : (
                      <Eye size={16} color={CustomerColors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handlePasswordChange}
            >
              <Text style={styles.saveBtnText}>Update password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : '#FFF5F5',
                  marginTop: Spacing.md,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : '#FFD0D0',
                },
              ]}
              onPress={() => setLogoutModalOpen(true)}
            >
              <LogOut size={15} color={CustomerColors.primary} />
              <Text
                style={[styles.saveBtnText, { color: CustomerColors.primary }]}
              >
                Logout from all devices
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'store' && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Store profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Store name"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.name || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      name: value,
                    },
                  },
                }))
              }
            />

            {/* Category — dropdown */}
<LocationSelectField
  label="Category"
  value={form.profileData.storeProfile?.category || ''}
  placeholder="Select Category"
  options={categoryOptions}
  onSelect={key =>
    setForm(prev => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        storeProfile: {
          ...(prev.profileData.storeProfile || {}),
          category: key,
        },
      },
    }))
  }
/>

            {/* FSSAI — only for Food & Beverages */}
{form.profileData.storeProfile?.category === 'Food & Beverages' && (
  <TextInput
    style={styles.input}
    placeholder="FSSAI License Number"
    placeholderTextColor="#9CA3AF"
    keyboardType="number-pad"
    maxLength={14}
    value={form.profileData.businessDetails?.fssai || ''}
    onChangeText={value =>
      setForm(prev => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          businessDetails: {
            ...(prev.profileData.businessDetails || {}),
            fssai: value,
          },
        },
      }))
    }
  />
)}

            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.address || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      address: value,
                    },
                  },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Working hours"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.workingHours || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      workingHours: value,
                    },
                  },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Delivery radius"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.deliveryRadius || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      deliveryRadius: value,
                    },
                  },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Minimum order"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.minimumOrderAmount || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      minimumOrderAmount: value,
                    },
                  },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="UPI ID"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.upiId || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: { ...prev.profileData, upiId: value },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="GST"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.businessDetails?.gst || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    businessDetails: {
                      ...(prev.profileData.businessDetails || {}),
                      gst: value,
                    },
                  },
                }))
              }
            />

            {/* PAN Card Number */}
            <TextInput
              style={styles.input}
              placeholder="PAN Card Number"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={10}
              value={form.profileData.businessDetails?.pan || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    businessDetails: {
                      ...(prev.profileData.businessDetails || {}),
                      pan: value.toUpperCase(),
                    },
                  },
                }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="License"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.businessDetails?.license || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    businessDetails: {
                      ...(prev.profileData.businessDetails || {}),
                      license: value,
                    },
                  },
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Tax details"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.businessDetails?.taxDetails || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    businessDetails: {
                      ...(prev.profileData.businessDetails || {}),
                      taxDetails: value,
                    },
                  },
                }))
              }
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() =>
                saveProfile({ ...form, profileData: form.profileData })
              }
            >
              <Text style={styles.saveBtnText}>Save store info</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Custom Logout Confirmation Modal ─────────────────────────── */}
      <Modal
        visible={logoutModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLogoutModalOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            {/* Icon */}
            <View style={styles.modalIconWrap}>
              <LogOut size={28} color={CustomerColors.primary} />
            </View>

            {/* Text */}
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalSubtitle}>
              You'll need to sign in again to access your account and orders.
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={async () => {
                setLogoutModalOpen(false);
                try {
                  await authApi.logoutAll();
                } catch {
                  // non-fatal
                }
                await logout();
                // Navigate to Home tab after logout
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'CustomerTabs' }],
                });
              }}
            >
              <LogOut size={16} color="#FFFFFF" />
              <Text style={styles.modalConfirmBtnText}>Yes, Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setLogoutModalOpen(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Beautiful Profile Feedback / Alert Modal ────────────────── */}
      <Modal
        visible={feedbackModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
        >
          <Pressable style={styles.feedbackCard} onPress={() => {}}>
            <View
              style={[
                styles.feedbackIconWrap,
                feedbackModal.type === 'success'
                  ? styles.feedbackSuccessIconWrap
                  : styles.feedbackErrorIconWrap,
              ]}
            >
              {feedbackModal.type === 'success' ? (
                <CheckCircle size={32} color="#16A34A" />
              ) : (
                <AlertCircle size={32} color="#DC2626" />
              )}
            </View>

            <Text style={styles.feedbackTitle}>{feedbackModal.title}</Text>
            <Text style={styles.feedbackSubtitle}>{feedbackModal.message}</Text>

            <TouchableOpacity
              style={[
                styles.feedbackActionBtn,
                feedbackModal.type === 'success'
                  ? { backgroundColor: CustomerColors.primary }
                  : { backgroundColor: '#DC2626' },
              ]}
              onPress={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
              activeOpacity={0.85}
            >
              <Text style={styles.feedbackActionBtnText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg,
    },
    heading: {
      fontSize: FontSizes.xl,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    notifBtn: {
      padding: 8,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : CustomerColors.steelBorder,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notifBadge: {
      position: 'absolute',
      top: -3,
      right: -3,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: CustomerColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '800',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: CustomerColors.primary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
    secondaryBtn: {
      backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    secondaryBtnText: {
      color: isDark ? '#D1D5DB' : CustomerColors.textSecondary,
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    profileCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      marginBottom: Spacing.md,
    },
    avatarRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: CustomerColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.lg },
    avatarName: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    avatarEmail: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    verifiedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xs,
      gap: 4,
    },
    verifiedPillText: {
      color: CustomerColors.success,
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    tabBar: { paddingVertical: Spacing.sm, gap: Spacing.sm },
    tab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: BorderRadius.pill,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    },
    tabActive: {
      backgroundColor: CustomerColors.teal600,
      borderColor: CustomerColors.teal600,
    },
    tabText: {
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontWeight: '700',
    },
    tabTextActive: { color: '#fff' },
    cardSection: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginTop: Spacing.md,
    },
    sectionTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
      fontSize: FontSizes.sm,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    },
    inputError: {
      borderColor: CustomerColors.danger,
    },
    errorText: {
      color: CustomerColors.danger,
      fontSize: 11,
      marginTop: -4,
      marginBottom: Spacing.sm,
      marginLeft: 4,
    },
    label: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginBottom: Spacing.xs,
      textTransform: 'uppercase',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    inlineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    inlineInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    },
    smallActionBtn: {
      backgroundColor: CustomerColors.primary,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chipPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
      borderRadius: BorderRadius.pill,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
    },
    chipText: {
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontSize: FontSizes.xs,
    },
    addressCard: {
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginTop: Spacing.sm,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
    },
    addressTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    addressText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    eyeBtn: { marginLeft: Spacing.sm, padding: Spacing.xs },
    dobInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dobValue: {
      fontSize: FontSizes.sm,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    dobPlaceholder: {
      fontSize: FontSizes.sm,
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    logoutBtn: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : '#FFD0D0',
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : '#FFF5F5',
    },
    logoutBtnText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: CustomerColors.primary,
    },
    // ── Logout Modal ──────────────────────────────────────────────────────────
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: 36,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 20,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#374151' : '#E2E8F0',
      marginBottom: Spacing.lg,
    },
    modalIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : '#FFF0F0',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 0, 0, 0.3)' : '#FFD0D0',
    },
    modalTitle: {
      fontSize: FontSizes.xl,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : '#1A1A2E',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.sm,
    },
    modalConfirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: CustomerColors.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: 14,
      width: '100%',
      marginBottom: Spacing.sm,
      shadowColor: CustomerColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    modalConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.base,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    modalCancelBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
      borderRadius: BorderRadius.lg,
      paddingVertical: 14,
      width: '100%',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E2E8F0',
    },
    modalCancelBtnText: {
      color: isDark ? '#D1D5DB' : CustomerColors.textSecondary,
      fontSize: FontSizes.base,
      fontWeight: '600',
    },
    guestContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      marginTop: 40,
    },
    guestAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    guestTitle: {
      fontSize: FontSizes.xl,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    guestSubtitle: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: Spacing.xl,
      maxWidth: 280,
    },
    guestLoginActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: CustomerColors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: BorderRadius.pill,
      shadowColor: CustomerColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    guestLoginActionBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.base,
      fontWeight: '700',
    },
    feedbackCard: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      alignItems: 'center',
      width: '85%',
      maxWidth: 340,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    feedbackIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    feedbackSuccessIconWrap: {
      backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7',
    },
    feedbackErrorIconWrap: {
      backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#FEE2E2',
    },
    feedbackTitle: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    feedbackSubtitle: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: Spacing.lg,
    },
    feedbackActionBtn: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    feedbackActionBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.base,
      fontWeight: '700',
    },
  });