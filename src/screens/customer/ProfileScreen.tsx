import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
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
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

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

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [saving, setSaving] = useState(false);
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
    dob: '',
    gender: '',
    avatar: '',

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
      },

      ...(user?.profileData || {}),
    },
  });
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

  const tabs = useMemo<{ id: TabKey; label: string }[]>(() => {
    const base: { id: TabKey; label: string }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'addresses', label: 'Addresses' },
      { id: 'security', label: 'Security' },
    ];
    if (user?.role === 'store_owner') {
      base.push({ id: 'store', label: 'Store' });
    }
    return base;
  }, [user?.role]);

  const saveProfile = async (nextForm?: typeof form) => {
    setSaving(true);
    try {
      const payload = nextForm || form;
      await authApi.updateProfile(payload);
      await updateUser({ ...payload, profileData: payload.profileData });
      Alert.alert('Saved', 'Profile updated.');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to save profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      await authApi.changePassword(
        security.currentPassword,
        security.newPassword,
      );
      Alert.alert('Success', 'Password updated.');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to change password.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl,
        }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Profile</Text>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => saveProfile()}
          >
            <Save size={15} color="#fff" />
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
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
              style={styles.input}
              value={form.fullname}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              onChangeText={value =>
                setForm(prev => ({ ...prev, fullname: value }))
              }
            />
            <TextInput
              style={styles.input}
              value={form.email}
              placeholder="Email"

              keyboardType="email-address"
              onChangeText={value =>
                setForm(prev => ({ ...prev, email: value }))
              }
            />
            <TextInput
              style={styles.input}
              value={form.mobilenumber}
              placeholder="Mobile number"

              keyboardType="phone-pad"
              onChangeText={value =>
                setForm(prev => ({ ...prev, mobilenumber: value }))
              }
            />
            <TextInput
              style={styles.input}
              value={form.dob}
              placeholder="Date of birth"
              placeholderTextColor="#9CA3AF"
              onChangeText={value => setForm(prev => ({ ...prev, dob: value }))}
            />
            <TextInput
              style={styles.input}
              value={form.gender}
              placeholder="Gender"
              placeholderTextColor="#9CA3AF"
              onChangeText={value =>
                setForm(prev => ({ ...prev, gender: value }))
              }
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
                  setAddressEditorOpen(true);
                }}
              >
                <Plus size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            {addressEditorOpen && (
              <View style={{ marginTop: Spacing.md }}>
                <TextInput
                  style={styles.input}
                  value={addressDraft.label}
                  placeholder="Label"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, label: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.fullName}
                  placeholder="Full name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, fullName: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.phone}
                  placeholder="Phone"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, phone: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.street}
                  placeholder="Street"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, street: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.city}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, city: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.state}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, state: value }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={addressDraft.pinCode}
                  placeholder="Pin code"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={value =>
                    setAddressDraft(prev => ({ ...prev, pinCode: value }))
                  }
                />
                <View style={styles.inlineRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setAddressEditorOpen(false)}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      const addresses = [...(form.profileData.addresses || [])];
                      const nextAddress = { ...addressDraft };
                      const index = addresses.findIndex(
                        (item: Address) => item.id === nextAddress.id,
                      );
                      if (index >= 0) addresses[index] = nextAddress;
                      else addresses.push(nextAddress);
                      const nextProfileData = {
                        ...form.profileData,
                        addresses,
                      };
                      setForm(prev => ({
                        ...prev,
                        profileData: nextProfileData,
                      }));
                      saveProfile({ ...form, profileData: nextProfileData });
                      setAddressEditorOpen(false);
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
                  backgroundColor: CustomerColors.dangerBg,
                  marginTop: Spacing.md,
                },
              ]}
              onPress={async () => {
                try {
                  await authApi.logoutAll();
                  await logout();
                } catch (error: any) {
                  Alert.alert(
                    'Error',
                    error.response?.data?.message || 'Unable to logout.',
                  );
                }
              }}
            >
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
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#9CA3AF"
              value={form.profileData.storeProfile?.category || ''}
              onChangeText={value =>
                setForm(prev => ({
                  ...prev,
                  profileData: {
                    ...prev.profileData,
                    storeProfile: {
                      ...(prev.profileData.storeProfile || {}),
                      category: value,
                    },
                  },
                }))
              }
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  heading: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    backgroundColor: CustomerColors.white,
    borderColor: CustomerColors.steelBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  secondaryBtnText: {
    color: CustomerColors.textSecondary,
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  profileCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
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
    color: CustomerColors.black,
  },
  avatarEmail: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
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
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  tabActive: { backgroundColor: CustomerColors.teal600 },
  tabText: { color: CustomerColors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  cardSection: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: FontSizes.sm,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
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
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
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
    backgroundColor: CustomerColors.bg,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  chipText: { color: CustomerColors.textSecondary, fontSize: FontSizes.xs },
  addressCard: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  addressTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  addressText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { marginLeft: Spacing.sm, padding: Spacing.xs },
});
