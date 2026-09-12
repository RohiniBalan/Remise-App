import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import {
  Settings, User, Bell, Shield, Palette, Server,
  AlertTriangle, Save, Eye, EyeOff, ChevronRight,
  Moon, Sun, Smartphone, Database, RefreshCw, Cpu, Key,
  CheckCircle2,
} from 'lucide-react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

// ─── Section tab definitions ──────────────────────────────────────────────────
const TABS = [
  { id: 'general',       label: 'General',        icon: Settings    },
  { id: 'profile',       label: 'Profile',         icon: User        },
  { id: 'appearance',    label: 'Appearance',      icon: Palette     },
  { id: 'notifications', label: 'Notifications',   icon: Bell        },
  { id: 'security',      label: 'Security',        icon: Shield      },
  { id: 'api',           label: 'API & Services',  icon: Server      },
  { id: 'danger',        label: 'Danger Zone',     icon: AlertTriangle },
];

// ─── Reusable components ──────────────────────────────────────────────────────
function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {description ? <Text style={s.cardDesc}>{description}</Text> : null}
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {sub ? <Text style={s.toggleSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: AdminColors.primary + '80' }}
        thumbColor={value ? AdminColors.primary : '#fff'}
      />
    </View>
  );
}

function InputField({ label, sub, value, onChange, placeholder, secureTextEntry, rightEl }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.inputLabel}>{label}</Text>
      {sub ? <Text style={s.inputSub}>{sub}</Text> : null}
      <View style={s.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          style={[s.input, rightEl ? { paddingRight: 44 } : {}]}
        />
        {rightEl ? <View style={s.inputRight}>{rightEl}</View> : null}
      </View>
    </View>
  );
}

function SaveBtn({ loading, onPress }: { loading: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.saveBtn} onPress={onPress} activeOpacity={0.85} disabled={loading}>
      {loading
        ? <ActivityIndicator size={14} color="#fff" />
        : <Save size={14} color="#fff" />}
      <Text style={s.saveBtnText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
    </TouchableOpacity>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: { val: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.val}
            onPress={() => onChange(opt.val)}
            style={[s.chip, value === opt.val && s.chipActive]}
          >
            <Text style={[s.chipText, value === opt.val && s.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminSettingsScreen() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  // General
  const [platformName, setPlatformName] = useState('Remise');
  const [supportEmail, setSupportEmail] = useState('support@remise.com');
  const [timezone, setTimezone] = useState('IST');
  const [currency, setCurrency] = useState('INR');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  // Profile
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@remise.com');
  const [adminPhone, setAdminPhone] = useState('');

  // Appearance
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(appTheme || 'light');
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);

  // Notifications
  const [emailOrders, setEmailOrders] = useState(true);
  const [emailUsers, setEmailUsers] = useState(true);
  const [emailStock, setEmailStock] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('7d');

  // API
  const [googleKey, setGoogleKey] = useState('••••••••••••••••••••');
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_TRXC8nEMqsywBS');
  const [cashfreeMode, setCashfreeMode] = useState('production');
  const [webhookUrl, setWebhookUrl] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    showToast('Settings saved successfully!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <SectionCard title="Platform Identity" description="Core information shown to users.">
              <InputField label="Platform Name" value={platformName} onChange={setPlatformName} placeholder="Remise" />
              <InputField label="Support Email" value={supportEmail} onChange={setSupportEmail} placeholder="support@remise.com" />
            </SectionCard>
            <SectionCard title="Locale & Currency">
              <SelectRow label="Timezone" value={timezone} onChange={setTimezone}
                options={[{ val: 'IST', label: 'IST (India)' }, { val: 'UTC', label: 'UTC' }, { val: 'EST', label: 'EST (US)' }]} />
              <SelectRow label="Currency" value={currency} onChange={setCurrency}
                options={[{ val: 'INR', label: '₹ INR' }, { val: 'USD', label: '$ USD' }, { val: 'EUR', label: '€ EUR' }]} />
            </SectionCard>
            <SectionCard title="Platform Controls">
              <ToggleRow label="Maintenance Mode" sub="Hide storefront for visitors" value={maintenanceMode} onChange={setMaintenanceMode} />
              <ToggleRow label="Allow Registrations" sub="Let new users sign up" value={allowRegistrations} onChange={setAllowRegistrations} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'profile':
        return (
          <>
            <SectionCard title="Admin Profile" description="Your personal admin account information.">
              <View style={s.avatarRow}>
                <View style={s.avatarBox}>
                  <Text style={s.avatarText}>{adminName.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.avatarName}>{adminName || 'Admin User'}</Text>
                  <Text style={s.avatarEmail}>{adminEmail}</Text>
                  <View style={s.roleBadge}><Text style={s.roleBadgeText}>Administrator</Text></View>
                </View>
              </View>
              <InputField label="Full Name" value={adminName} onChange={setAdminName} placeholder="Admin User" />
              <InputField label="Email Address" value={adminEmail} onChange={setAdminEmail} placeholder="admin@remise.com" />
              <InputField label="Phone Number" value={adminPhone} onChange={setAdminPhone} placeholder="+91 98765 43210" />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'appearance':
        return (
          <>
            <SectionCard title="Theme" description="Choose your preferred dashboard color scheme.">
              <SelectRow label="" value={theme} onChange={(val) => {
                const mode = val as 'light' | 'dark' | 'system';
                setTheme(mode);
                if (mode === 'light' || mode === 'dark') {
                  setAppTheme(mode);
                }
              }}
                options={[{ val: 'light', label: '☀️ Light' }, { val: 'dark', label: '🌙 Dark' }, { val: 'system', label: '📱 System' }]} />
            </SectionCard>
            <SectionCard title="Accent Color">
              <View style={s.colorRow}>
                {['#EF0000', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'].map(c => (
                  <TouchableOpacity key={c} style={[s.colorSwatch, { backgroundColor: c }]} onPress={() => showToast(`Accent color set to ${c}`)} />
                ))}
              </View>
            </SectionCard>
            <SectionCard title="Display">
              <ToggleRow label="Compact Mode" sub="Reduce spacing on screen" value={compactMode} onChange={setCompactMode} />
              <ToggleRow label="Animations" sub="Enable smooth motion effects" value={showAnimations} onChange={setShowAnimations} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'notifications':
        return (
          <>
            <SectionCard title="Email Alerts">
              <ToggleRow label="New Orders" sub="When a customer places an order" value={emailOrders} onChange={setEmailOrders} />
              <ToggleRow label="New Registrations" sub="When a new user signs up" value={emailUsers} onChange={setEmailUsers} />
              <ToggleRow label="Low Stock Warnings" sub="When inventory runs low" value={emailStock} onChange={setEmailStock} />
            </SectionCard>
            <SectionCard title="Push & SMS">
              <ToggleRow label="Push Notifications" sub="Real-time app alerts" value={pushEnabled} onChange={setPushEnabled} />
              <ToggleRow label="SMS Alerts" sub="Text alerts for critical events" value={smsAlerts} onChange={setSmsAlerts} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'security':
        return (
          <>
            <SectionCard title="Change Password">
              <InputField label="Current Password" value={currentPwd} onChange={setCurrentPwd} placeholder="Enter current password"
                secureTextEntry={!showPwd}
                rightEl={
                  <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
                  </TouchableOpacity>
                }
              />
              <InputField label="New Password" value={newPwd} onChange={setNewPwd} placeholder="Minimum 8 characters" secureTextEntry />
              <InputField label="Confirm Password" value={confirmPwd} onChange={setConfirmPwd} placeholder="Repeat new password" secureTextEntry />
              {newPwd !== '' && confirmPwd !== '' && newPwd !== confirmPwd && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -8, marginBottom: 8 }}>⚠ Passwords do not match</Text>
              )}
            </SectionCard>
            <SectionCard title="Two-Factor Authentication">
              <ToggleRow label="Enable 2FA" sub="Require a code on every login" value={twoFA} onChange={setTwoFA} />
            </SectionCard>
            <SectionCard title="Session Timeout">
              <SelectRow label="" value={sessionTimeout} onChange={setSessionTimeout}
                options={[{ val: '1d', label: '1 Day' }, { val: '7d', label: '7 Days' }, { val: '14d', label: '14 Days' }, { val: '30d', label: '30 Days' }]} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'api':
        return (
          <>
            <SectionCard title="AI Integration" description="Gemini API for smart product scan & voice features.">
              <InputField
                label="Google Gemini API Key"
                value={googleKey} onChange={setGoogleKey}
                placeholder="AQ.Ab8RN6..."
                secureTextEntry={!showApiKey}
                rightEl={
                  <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
                  </TouchableOpacity>
                }
              />
              <View style={s.infoBanner}>
                <Cpu size={16} color="#7C3AED" style={{ marginRight: 8, flexShrink: 0 }} />
                <Text style={s.infoBannerText}>Token usage is tracked automatically and shown on the Dashboard.</Text>
              </View>
            </SectionCard>
            <SectionCard title="Payment Gateways">
              <InputField label="Razorpay Key ID" value={razorpayKey} onChange={setRazorpayKey} placeholder="rzp_test_..." />
              <SelectRow label="Cashfree Mode" value={cashfreeMode} onChange={setCashfreeMode}
                options={[{ val: 'sandbox', label: 'Sandbox' }, { val: 'production', label: 'Production' }]} />
            </SectionCard>
            <SectionCard title="Webhooks">
              <InputField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-domain.com/api/webhook" />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'danger':
        return (
          <>
            <View style={s.dangerBanner}>
              <AlertTriangle size={18} color="#B91C1C" style={{ marginRight: 10, flexShrink: 0 }} />
              <View>
                <Text style={s.dangerBannerTitle}>Caution: Irreversible Actions</Text>
                <Text style={s.dangerBannerSub}>These actions are permanent and cannot be undone.</Text>
              </View>
            </View>

            <SectionCard title="Clear Cache" description="Flush all server-side caches.">
              <TouchableOpacity style={s.outlineBtn} onPress={() => showToast('Cache cleared!')}>
                <RefreshCw size={14} color={AdminColors.textPrimary} />
                <Text style={s.outlineBtnText}>Clear All Caches</Text>
              </TouchableOpacity>
            </SectionCard>

            <SectionCard title="Export Data" description="Download a full backup of your platform data.">
              <TouchableOpacity style={s.outlineBtn} onPress={() => showToast('Export started — you will receive an email.')}>
                <Database size={14} color={AdminColors.textPrimary} />
                <Text style={s.outlineBtnText}>Export All Data</Text>
              </TouchableOpacity>
            </SectionCard>

            <View style={[s.card, { borderColor: '#FCA5A5', borderWidth: 2 }]}>
              <Text style={[s.cardTitle, { color: '#B91C1C' }]}>Delete Platform Data</Text>
              <Text style={[s.cardDesc, { marginBottom: 12 }]}>This will permanently erase all orders, products, and user data.</Text>
              <InputField
                label={'Type "DELETE" to confirm'}
                value={confirmDelete} onChange={setConfirmDelete}
                placeholder="DELETE"
              />
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: confirmDelete === 'DELETE' ? '#EF4444' : '#9CA3AF' }]}
                disabled={confirmDelete !== 'DELETE'}
                onPress={() => Alert.alert('Blocked', 'This action is blocked in demo mode.')}
              >
                <AlertTriangle size={14} color="#fff" />
                <Text style={s.saveBtnText}>Delete All Data</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: AdminColors.bg }}>
      {/* Toast */}
      {toastMsg ? (
        <View style={s.toast}>
          <CheckCircle2 size={14} color="#fff" />
          <Text style={s.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Horizontal tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tabItem, active && s.tabItemActive, tab.id === 'danger' && !active && { borderColor: '#FCA5A5' }]}
            >
              <Icon size={13} color={active ? AdminColors.primary : (tab.id === 'danger' ? '#EF4444' : AdminColors.textSecondary)} />
              <Text style={[s.tabLabel, active && s.tabLabelActive, tab.id === 'danger' && !active && { color: '#EF4444' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', maxHeight: 52 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 14, marginRight: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: AdminColors.primary },
  tabLabel: { fontSize: 12, fontWeight: '600', color: AdminColors.textSecondary },
  tabLabelActive: { color: AdminColors.primary, fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#111827' },
  cardDesc: { fontSize: 11, color: '#6B7280', marginTop: 3 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  toggleSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  inputSub: { fontSize: 11, color: '#9CA3AF', marginBottom: 6, marginTop: -4 },
  inputWrap: { position: 'relative' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#111827' },
  inputRight: { position: 'absolute', right: 12, top: '50%', marginTop: -10 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', marginRight: 8, backgroundColor: '#F9FAFB' },
  chipActive: { borderColor: AdminColors.primary, backgroundColor: '#FFF1F2' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: AdminColors.primary },

  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  colorSwatch: { width: 36, height: 36, borderRadius: 10 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AdminColors.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: BorderRadius.md, alignSelf: 'flex-end', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  outlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#E5E7EB', alignSelf: 'flex-start', backgroundColor: '#F9FAFB' },
  outlineBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#F9FAFB', borderRadius: BorderRadius.md },
  avatarBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: AdminColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  avatarName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  avatarEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  roleBadge: { backgroundColor: '#FFF1F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: AdminColors.primary },

  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE', borderRadius: BorderRadius.md, padding: 12, marginTop: 4 },
  infoBannerText: { fontSize: 12, color: '#7C3AED', fontWeight: '500', flex: 1 },

  dangerBanner: { flexDirection: 'row', backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: BorderRadius.md, padding: 14, marginBottom: Spacing.md, alignItems: 'flex-start' },
  dangerBannerTitle: { fontSize: 13, fontWeight: '800', color: '#B91C1C' },
  dangerBannerSub: { fontSize: 11, color: '#EF4444', marginTop: 2 },

  toast: { position: 'absolute', bottom: 24, left: 20, right: 20, zIndex: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, ...Shadows.card },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});
