import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import {
  Settings, User, Bell, Shield, Palette, Server,
  AlertTriangle, Save, Eye, EyeOff,
  Database, RefreshCw, Cpu,
  CheckCircle2,
} from 'lucide-react-native';
import { AdminColors, getAdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
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
function SectionCard({ title, description, children, themeColors, isDark }: { title: string; description?: string; children: React.ReactNode; themeColors: any; isDark: boolean }) {
  return (
    <View style={[s.card, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
      <Text style={[s.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>{title}</Text>
      {description ? <Text style={[s.cardDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{description}</Text> : null}
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange, themeColors, isDark }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; themeColors: any; isDark: boolean }) {
  return (
    <View style={[s.toggleRow, { borderBottomColor: isDark ? '#374151' : '#F3F4F6' }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[s.toggleLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>{label}</Text>
        {sub ? <Text style={[s.toggleSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: AdminColors.primary + '80' }}
        thumbColor={value ? AdminColors.primary : '#fff'}
      />
    </View>
  );
}

function InputField({ label, sub, value, onChange, placeholder, secureTextEntry, rightEl, themeColors, isDark }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[s.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>{label}</Text>
      {sub ? <Text style={[s.inputSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{sub}</Text> : null}
      <View style={s.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          secureTextEntry={secureTextEntry}
          style={[
            s.input,
            {
              backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
              borderColor: isDark ? '#374151' : '#E5E7EB',
              color: isDark ? '#FFFFFF' : '#111827',
            },
            rightEl ? { paddingRight: 44 } : {}
          ]}
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

function SelectRow({ label, value, options, onChange, themeColors, isDark }: { label: string; value: string; options: { val: string; label: string }[]; onChange: (v: string) => void; themeColors: any; isDark: boolean }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[s.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {options.map(opt => {
          const active = value === opt.val;
          return (
            <TouchableOpacity
              key={opt.val}
              onPress={() => onChange(opt.val)}
              style={[
                s.chip,
                {
                  backgroundColor: active
                    ? (isDark ? 'rgba(255, 0, 0, 0.2)' : '#FFF1F2')
                    : (isDark ? '#1F2937' : '#F9FAFB'),
                  borderColor: active
                    ? AdminColors.primary
                    : (isDark ? '#374151' : '#E5E7EB'),
                }
              ]}
            >
              <Text
                style={[
                  s.chipText,
                  {
                    color: active
                      ? AdminColors.primary
                      : (isDark ? '#FFFFFF' : '#374151'),
                    fontWeight: active ? '700' : '600',
                  }
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminSettingsScreen() {
  const { theme: appTheme, setTheme: setAppTheme, isDark } = useTheme();
  const themeColors = getAdminColors(isDark);

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
            <SectionCard title="Platform Identity" description="Core information shown to users." themeColors={themeColors} isDark={isDark}>
              <InputField label="Platform Name" value={platformName} onChange={setPlatformName} placeholder="Remise" themeColors={themeColors} isDark={isDark} />
              <InputField label="Support Email" value={supportEmail} onChange={setSupportEmail} placeholder="support@remise.com" themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SectionCard title="Locale & Currency" themeColors={themeColors} isDark={isDark}>
              <SelectRow label="Timezone" value={timezone} onChange={setTimezone} themeColors={themeColors} isDark={isDark}
                options={[{ val: 'IST', label: 'IST (India)' }, { val: 'UTC', label: 'UTC' }, { val: 'EST', label: 'EST (US)' }]} />
              <SelectRow label="Currency" value={currency} onChange={setCurrency} themeColors={themeColors} isDark={isDark}
                options={[{ val: 'INR', label: '₹ INR' }, { val: 'USD', label: '$ USD' }, { val: 'EUR', label: '€ EUR' }]} />
            </SectionCard>
            <SectionCard title="Platform Controls" themeColors={themeColors} isDark={isDark}>
              <ToggleRow label="Maintenance Mode" sub="Hide storefront for visitors" value={maintenanceMode} onChange={setMaintenanceMode} themeColors={themeColors} isDark={isDark} />
              <ToggleRow label="Allow Registrations" sub="Let new users sign up" value={allowRegistrations} onChange={setAllowRegistrations} themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'profile':
        return (
          <>
            <SectionCard title="Admin Profile" description="Your personal admin account information." themeColors={themeColors} isDark={isDark}>
              <View style={[s.avatarRow, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
                <View style={s.avatarBox}>
                  <Text style={s.avatarText}>{adminName.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.avatarName, { color: isDark ? '#FFFFFF' : '#111827' }]}>{adminName || 'Admin User'}</Text>
                  <Text style={[s.avatarEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{adminEmail}</Text>
                  <View style={[s.roleBadge, { backgroundColor: isDark ? 'rgba(255, 0, 0, 0.2)' : '#FFF1F2' }]}><Text style={s.roleBadgeText}>Administrator</Text></View>
                </View>
              </View>
              <InputField label="Full Name" value={adminName} onChange={setAdminName} placeholder="Admin User" themeColors={themeColors} isDark={isDark} />
              <InputField label="Email Address" value={adminEmail} onChange={setAdminEmail} placeholder="admin@remise.com" themeColors={themeColors} isDark={isDark} />
              <InputField label="Phone Number" value={adminPhone} onChange={setAdminPhone} placeholder="+91 98765 43210" themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'appearance':
        return (
          <>
            <SectionCard title="Theme" description="Choose your preferred dashboard color scheme." themeColors={themeColors} isDark={isDark}>
              <SelectRow label="" value={theme} onChange={(val) => {
                const mode = val as 'light' | 'dark' | 'system';
                setTheme(mode);
                if (mode === 'light' || mode === 'dark') {
                  setAppTheme(mode);
                }
              }}
                themeColors={themeColors} isDark={isDark}
                options={[{ val: 'light', label: '☀️ Light' }, { val: 'dark', label: '🌙 Dark' }, { val: 'system', label: '📱 System' }]} />
            </SectionCard>
            <SectionCard title="Accent Color" themeColors={themeColors} isDark={isDark}>
              <View style={s.colorRow}>
                {['#EF0000', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'].map(c => (
                  <TouchableOpacity key={c} style={[s.colorSwatch, { backgroundColor: c }]} onPress={() => showToast(`Accent color set to ${c}`)} />
                ))}
              </View>
            </SectionCard>
            <SectionCard title="Display" themeColors={themeColors} isDark={isDark}>
              <ToggleRow label="Compact Mode" sub="Reduce spacing on screen" value={compactMode} onChange={setCompactMode} themeColors={themeColors} isDark={isDark} />
              <ToggleRow label="Animations" sub="Enable smooth motion effects" value={showAnimations} onChange={setShowAnimations} themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'notifications':
        return (
          <>
            <SectionCard title="Email Alerts" themeColors={themeColors} isDark={isDark}>
              <ToggleRow label="New Orders" sub="When a customer places an order" value={emailOrders} onChange={setEmailOrders} themeColors={themeColors} isDark={isDark} />
              <ToggleRow label="New Registrations" sub="When a new user signs up" value={emailUsers} onChange={setEmailUsers} themeColors={themeColors} isDark={isDark} />
              <ToggleRow label="Low Stock Warnings" sub="When inventory runs low" value={emailStock} onChange={setEmailStock} themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SectionCard title="Push & SMS" themeColors={themeColors} isDark={isDark}>
              <ToggleRow label="Push Notifications" sub="Real-time app alerts" value={pushEnabled} onChange={setPushEnabled} themeColors={themeColors} isDark={isDark} />
              <ToggleRow label="SMS Alerts" sub="Text alerts for critical events" value={smsAlerts} onChange={setSmsAlerts} themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'security':
        return (
          <>
            <SectionCard title="Change Password" themeColors={themeColors} isDark={isDark}>
              <InputField label="Current Password" value={currentPwd} onChange={setCurrentPwd} placeholder="Enter current password"
                secureTextEntry={!showPwd}
                themeColors={themeColors} isDark={isDark}
                rightEl={
                  <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} color={isDark ? '#9CA3AF' : '#6B7280'} /> : <Eye size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />}
                  </TouchableOpacity>
                }
              />
              <InputField label="New Password" value={newPwd} onChange={setNewPwd} placeholder="Minimum 8 characters" secureTextEntry themeColors={themeColors} isDark={isDark} />
              <InputField label="Confirm Password" value={confirmPwd} onChange={setConfirmPwd} placeholder="Repeat new password" secureTextEntry themeColors={themeColors} isDark={isDark} />
              {newPwd !== '' && confirmPwd !== '' && newPwd !== confirmPwd && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -8, marginBottom: 8 }}>⚠ Passwords do not match</Text>
              )}
            </SectionCard>
            <SectionCard title="Two-Factor Authentication" themeColors={themeColors} isDark={isDark}>
              <ToggleRow label="Enable 2FA" sub="Require a code on every login" value={twoFA} onChange={setTwoFA} themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SectionCard title="Session Timeout" themeColors={themeColors} isDark={isDark}>
              <SelectRow label="" value={sessionTimeout} onChange={setSessionTimeout} themeColors={themeColors} isDark={isDark}
                options={[{ val: '1d', label: '1 Day' }, { val: '7d', label: '7 Days' }, { val: '14d', label: '14 Days' }, { val: '30d', label: '30 Days' }]} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'api':
        return (
          <>
            <SectionCard title="AI Integration" description="Gemini API for smart product scan & voice features." themeColors={themeColors} isDark={isDark}>
              <InputField
                label="Google Gemini API Key"
                value={googleKey} onChange={setGoogleKey}
                placeholder="AQ.Ab8RN6..."
                secureTextEntry={!showApiKey}
                themeColors={themeColors} isDark={isDark}
                rightEl={
                  <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff size={16} color={isDark ? '#9CA3AF' : '#6B7280'} /> : <Eye size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />}
                  </TouchableOpacity>
                }
              />
              <View style={[s.infoBanner, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF', borderColor: isDark ? '#5B21B6' : '#EDE9FE' }]}>
                <Cpu size={16} color="#A78BFA" style={{ marginRight: 8, flexShrink: 0 }} />
                <Text style={[s.infoBannerText, { color: isDark ? '#DDD6FE' : '#7C3AED' }]}>Token usage is tracked automatically and shown on the Dashboard.</Text>
              </View>
            </SectionCard>
            <SectionCard title="Payment Gateways" themeColors={themeColors} isDark={isDark}>
              <InputField label="Razorpay Key ID" value={razorpayKey} onChange={setRazorpayKey} placeholder="rzp_test_..." themeColors={themeColors} isDark={isDark} />
              <SelectRow label="Cashfree Mode" value={cashfreeMode} onChange={setCashfreeMode} themeColors={themeColors} isDark={isDark}
                options={[{ val: 'sandbox', label: 'Sandbox' }, { val: 'production', label: 'Production' }]} />
            </SectionCard>
            <SectionCard title="Webhooks" themeColors={themeColors} isDark={isDark}>
              <InputField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-domain.com/api/webhook" themeColors={themeColors} isDark={isDark} />
            </SectionCard>
            <SaveBtn loading={saving} onPress={handleSave} />
          </>
        );

      case 'danger':
        return (
          <>
            <View style={[s.dangerBanner, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF1F2', borderColor: isDark ? '#7F1D1D' : '#FECACA' }]}>
              <AlertTriangle size={18} color="#EF4444" style={{ marginRight: 10, flexShrink: 0 }} />
              <View>
                <Text style={[s.dangerBannerTitle, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>Caution: Irreversible Actions</Text>
                <Text style={[s.dangerBannerSub, { color: isDark ? '#F87171' : '#EF4444' }]}>These actions are permanent and cannot be undone.</Text>
              </View>
            </View>

            <SectionCard title="Clear Cache" description="Flush all server-side caches." themeColors={themeColors} isDark={isDark}>
              <TouchableOpacity style={[s.outlineBtn, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }]} onPress={() => showToast('Cache cleared!')}>
                <RefreshCw size={14} color={isDark ? '#FFFFFF' : '#374151'} />
                <Text style={[s.outlineBtnText, { color: isDark ? '#FFFFFF' : '#374151' }]}>Clear All Caches</Text>
              </TouchableOpacity>
            </SectionCard>

            <SectionCard title="Export Data" description="Download a full backup of your platform data." themeColors={themeColors} isDark={isDark}>
              <TouchableOpacity style={[s.outlineBtn, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }]} onPress={() => showToast('Export started — you will receive an email.')}>
                <Database size={14} color={isDark ? '#FFFFFF' : '#374151'} />
                <Text style={[s.outlineBtnText, { color: isDark ? '#FFFFFF' : '#374151' }]}>Export All Data</Text>
              </TouchableOpacity>
            </SectionCard>

            <View style={[s.card, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#7F1D1D' : '#FCA5A5', borderWidth: 2 }]}>
              <Text style={[s.cardTitle, { color: '#EF4444' }]}>Delete Platform Data</Text>
              <Text style={[s.cardDesc, { color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 12 }]}>This will permanently erase all orders, products, and user data.</Text>
              <InputField
                label={'Type "DELETE" to confirm'}
                value={confirmDelete} onChange={setConfirmDelete}
                placeholder="DELETE"
                themeColors={themeColors} isDark={isDark}
              />
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: confirmDelete === 'DELETE' ? '#EF4444' : (isDark ? '#374151' : '#9CA3AF') }]}
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
    <View style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }}>
      {/* Toast */}
      {toastMsg ? (
        <View style={s.toast}>
          <CheckCircle2 size={14} color="#fff" />
          <Text style={s.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Horizontal tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabBar, { backgroundColor: isDark ? '#111827' : '#fff', borderBottomColor: isDark ? '#1F2937' : '#F3F4F6' }]} contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tabItem, active && s.tabItemActive, tab.id === 'danger' && !active && { borderColor: '#FCA5A5' }]}
            >
              <Icon size={13} color={active ? AdminColors.primary : (tab.id === 'danger' ? '#EF4444' : (isDark ? '#9CA3AF' : AdminColors.textSecondary))} />
              <Text style={[s.tabLabel, { color: isDark ? '#9CA3AF' : AdminColors.textSecondary }, active && s.tabLabelActive, tab.id === 'danger' && !active && { color: '#EF4444' }]}>
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

  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: '800' },
  cardDesc: { fontSize: 11, marginTop: 3 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 13, fontWeight: '700' },
  toggleSub: { fontSize: 11, marginTop: 1 },

  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  inputSub: { fontSize: 11, marginBottom: 6, marginTop: -4 },
  inputWrap: { position: 'relative' },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  inputRight: { position: 'absolute', right: 12, top: '50%', marginTop: -10 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },

  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  colorSwatch: { width: 36, height: 36, borderRadius: 10 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AdminColors.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: BorderRadius.md, alignSelf: 'flex-end', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  outlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, alignSelf: 'flex-start' },
  outlineBtnText: { fontSize: 13, fontWeight: '600' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, borderRadius: BorderRadius.md },
  avatarBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: AdminColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  avatarName: { fontSize: 14, fontWeight: '800' },
  avatarEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: AdminColors.primary },

  infoBanner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: BorderRadius.md, padding: 12, marginTop: 4 },
  infoBannerText: { fontSize: 12, fontWeight: '500', flex: 1 },

  dangerBanner: { flexDirection: 'row', borderWidth: 1, borderRadius: BorderRadius.md, padding: 14, marginBottom: Spacing.md, alignItems: 'flex-start' },
  dangerBannerTitle: { fontSize: 13, fontWeight: '800' },
  dangerBannerSub: { fontSize: 11, marginTop: 2 },

  toast: { position: 'absolute', bottom: 24, left: 20, right: 20, zIndex: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, ...Shadows.card },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});
