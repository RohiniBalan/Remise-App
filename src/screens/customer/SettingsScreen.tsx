import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  User,
  SlidersHorizontal,
  Shield,
  Bell,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import {
  normalizeAuthErrorMessage,
  validatePasswordChangeForm,
} from '../../utils/authValidation';

// Ported from client/app/settings/page.tsx — same 4 tabs, in the same
// order, with the same "which tabs are real vs. client-only stub" split:
// Account save is a local merge into the stored user object (no backend
// PATCH — matches web exactly, not a mobile shortcut); Preferences and
// Notifications toggles are local component state only, "Save" just shows
// a toast, nothing persisted (matches web); Security is the one real
// backend call (POST /api/auth/change-password).
type Tab = 'account' | 'preferences' | 'security' | 'notifications';
const TABS: {
  id: Tab;
  label: string;
  icon: (color: string) => React.ReactNode;
}[] = [
  { id: 'account', label: 'Account', icon: c => <User size={15} color={c} /> },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: c => <SlidersHorizontal size={15} color={c} />,
  },
  {
    id: 'security',
    label: 'Security',
    icon: c => <Shield size={15} color={c} />,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: c => <Bell size={15} color={c} />,
  },
];

export default function SettingsScreen() {
  const { logout } = useAuth();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<Tab>(route.params?.initialTab || 'account');

  const handleSignOut = async () => {
    await logout();
    // AppNavigator's RoleGate switches to AuthNavigator automatically.
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={{ paddingHorizontal: Spacing.md }}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            {tab.icon(
              activeTab === tab.id
                ? CustomerColors.primary
                : CustomerColors.textSecondary,
            )}
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl,
        }}
      >
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={16} color={CustomerColors.primary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function AccountTab() {
  const { user, updateUser } = useAuth();
  const [fullname, setFullname] = useState(user?.fullname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [mobilenumber, setMobilenumber] = useState(user?.mobilenumber ?? '');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const isVerified = user?.isEmailVerified !== false;
  const initials = (fullname || 'U')
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const save = async () => {
    await updateUser({ fullname, email, mobilenumber });
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.avatarName}>{fullname || 'Your Name'}</Text>
          <Text style={styles.avatarEmail}>{email}</Text>
          {isVerified ? (
            <View style={styles.verifiedPill}>
              <CheckCircle size={10} color={CustomerColors.success} />
              <Text style={styles.verifiedPillText}>Verified</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.unverifiedPill}>
              <AlertCircle size={10} color={CustomerColors.warning} />
              <Text style={styles.unverifiedPillText}>Not verified</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Field
        label="Full Name"
        value={fullname}
        onChangeText={v => {
          setFullname(v);
          setDirty(true);
        }}
      />
      <Field
        label="Email Address"
        value={email}
        onChangeText={v => {
          setEmail(v);
          setDirty(true);
        }}
        keyboardType="email-address"
      />
      <Field
        label="Mobile Number"
        value={mobilenumber}
        onChangeText={v => {
          setMobilenumber(v);
          setDirty(true);
        }}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
        onPress={save}
        disabled={!dirty}
      >
        {saved ? (
          <CheckCircle size={15} color="#fff" />
        ) : (
          <Save size={15} color="#fff" />
        )}
        <Text style={styles.saveBtnText}>
          {saved ? 'Saved!' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function PreferencesTab() {
  const [darkMode, setDarkMode] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View>
      <View style={styles.card}>
        <ToggleRow
          label="Dark Mode"
          desc="Switch to dark theme across the app"
          value={darkMode}
          onChange={setDarkMode}
        />
        <ToggleRow
          label="Newsletter"
          desc="Receive weekly deals & product updates"
          value={newsletter}
          onChange={setNewsletter}
          last
        />
      </View>

      <Text style={styles.label}>Language</Text>
      <View style={styles.chipRow}>
        {[
          ['en', 'English'],
          ['hi', 'Hindi'],
          ['ta', 'Tamil'],
          ['te', 'Telugu'],
        ].map(([code, label]) => (
          <TouchableOpacity
            key={code}
            style={[styles.chip, language === code && styles.chipActive]}
            onPress={() => setLanguage(code)}
          >
            <Text
              style={[
                styles.chipText,
                language === code && styles.chipTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Currency</Text>
      <View style={styles.chipRow}>
        {[
          ['INR', '₹ INR'],
          ['USD', '$ USD'],
        ].map(([code, label]) => (
          <TouchableOpacity
            key={code}
            style={[styles.chip, currency === code && styles.chipActive]}
            onPress={() => setCurrency(code)}
          >
            <Text
              style={[
                styles.chipText,
                currency === code && styles.chipTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        {saved ? (
          <CheckCircle size={15} color="#fff" />
        ) : (
          <Save size={15} color="#fff" />
        )}
        <Text style={styles.saveBtnText}>
          {saved ? 'Saved!' : 'Save Preferences'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SecurityTab() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = async () => {
    setError('');
    setSuccess(false);
    const errors = validatePasswordChangeForm({
      currentPassword: current,
      newPassword: newPass,
      confirmPassword: confirm,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await authApi.changePassword(current, newPass);
      setSuccess(true);
      setCurrent('');
      setNewPass('');
      setConfirm('');
      setFieldErrors({});
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Failed to update password.',
      );
    }
  };

  return (
    <View>
      <View style={styles.infoBanner}>
        <Shield size={16} color={CustomerColors.teal700} />
        <Text style={styles.infoBannerText}>
          Keep your account secure by using a strong, unique password.
        </Text>
      </View>

      <PasswordField
        label="Current Password"
        value={current}
        onChangeText={value => {
          setCurrent(value);
          setFieldErrors(prev => ({ ...prev, currentPassword: '' }));
        }}
        show={showPass}
        onToggleShow={() => setShowPass(v => !v)}
      />
      <PasswordField
        label="New Password"
        value={newPass}
        onChangeText={value => {
          setNewPass(value);
          setFieldErrors(prev => ({ ...prev, newPassword: '' }));
        }}
        show={showPass}
        onToggleShow={() => setShowPass(v => !v)}
      />
      <PasswordField
        label="Confirm Password"
        value={confirm}
        onChangeText={value => {
          setConfirm(value);
          setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
        }}
        show={showPass}
        onToggleShow={() => setShowPass(v => !v)}
      />

      {fieldErrors.currentPassword ? (
        <Text style={styles.fieldError}>{fieldErrors.currentPassword}</Text>
      ) : null}
      {fieldErrors.newPassword ? (
        <Text style={styles.fieldError}>{fieldErrors.newPassword}</Text>
      ) : null}
      {fieldErrors.confirmPassword ? (
        <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? (
        <Text style={styles.successText}>Password updated successfully!</Text>
      ) : null}

      <TouchableOpacity style={styles.saveBtn} onPress={handleChange}>
        <Lock size={15} color="#fff" />
        <Text style={styles.saveBtnText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    nearbyOffers: true,
    emailDigest: false,
    pushEnabled: false,
    smsAlerts: false,
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [k]: !p[k] }));
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View>
      <Text style={styles.groupLabel}>Email Notifications</Text>
      <View style={styles.card}>
        <ToggleRow
          label="Order Updates"
          desc="Shipping, delivery, and status changes"
          value={prefs.orderUpdates}
          onChange={() => toggle('orderUpdates')}
        />
        <ToggleRow
          label="Promotions"
          desc="Exclusive deals, sales, and coupons"
          value={prefs.promotions}
          onChange={() => toggle('promotions')}
        />
        <ToggleRow
          label="Weekly Digest"
          desc="A summary of activity and new products"
          value={prefs.emailDigest}
          onChange={() => toggle('emailDigest')}
          last
        />
      </View>

      <Text style={styles.groupLabel}>Push & SMS</Text>
      <View style={styles.card}>
        <ToggleRow
          label="Nearby Offers"
          desc="Alerts when stores near you post deals"
          value={prefs.nearbyOffers}
          onChange={() => toggle('nearbyOffers')}
        />
        <ToggleRow
          label="Push Alerts"
          desc="In-app push notifications"
          value={prefs.pushEnabled}
          onChange={() => toggle('pushEnabled')}
        />
        <ToggleRow
          label="SMS Alerts"
          desc="Text message updates for your orders"
          value={prefs.smsAlerts}
          onChange={() => toggle('smsAlerts')}
          last
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        {saved ? (
          <CheckCircle size={15} color="#fff" />
        ) : (
          <Save size={15} color="#fff" />
        )}
        <Text style={styles.saveBtnText}>
          {saved ? 'Saved!' : 'Save Preferences'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...inputProps} />
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  show,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={onToggleShow}>
          {show ? (
            <EyeOff size={16} color={CustomerColors.textSecondary} />
          ) : (
            <Eye size={16} color={CustomerColors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
  last,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleRowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <TouchableOpacity
        style={[styles.switch, value && styles.switchActive]}
        onPress={() => onChange(!value)}
      >
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  tabBar: {
    backgroundColor: CustomerColors.white,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.border,
    flexGrow: 0,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: CustomerColors.primary },
  tabLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.textSecondary,
  },
  tabLabelActive: { color: CustomerColors.primary },
  content: { flex: 1 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CustomerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '800' },
  avatarName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  avatarEmail: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.successBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.success,
  },
  unverifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.warningBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
  },
  unverifiedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.warning,
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
    fontSize: FontSizes.base,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: Spacing.md },
  saveBtn: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  card: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  groupLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  toggleLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  toggleDesc: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    padding: 2,
  },
  switchActive: { backgroundColor: CustomerColors.primary },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  switchThumbActive: { transform: [{ translateX: 20 }] },
  infoBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBannerText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
  },
  errorText: {
    color: CustomerColors.primary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  fieldError: {
    color: CustomerColors.primary,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  successText: {
    color: CustomerColors.success,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.dangerBg,
  },
  signOutText: {
    color: CustomerColors.primary,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});
