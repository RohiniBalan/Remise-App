import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Briefcase, ShoppingBag, Store, Package, Home, CheckCircle2 } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { normalizeAuthErrorMessage, validateSignupForm } from '../../utils/authValidation';

type BusinessRole = 'store_owner' | 'whole_saler' | 'home_business';

interface RoleOption {
  value: BusinessRole;
  label: string;
  desc: string;
  icon: any;
}

const BUSINESS_ROLES: RoleOption[] = [
  {
    value: 'store_owner',
    label: 'Store Owner',
    desc: 'Retail store & offline merchant',
    icon: Store,
  },
  {
    value: 'whole_saler',
    label: 'Wholesaler',
    desc: 'Bulk supplier & B2B distributor',
    icon: Package,
  },
  {
    value: 'home_business',
    label: 'Home Business',
    desc: 'Direct-to-consumer & artisan producer',
    icon: Home,
  },
];

export default function BusinessSignupScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [role, setRole] = useState<BusinessRole>('store_owner');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors = validateSignupForm({
      fullname,
      email,
      mobilenumber,
      password,
    });
    setFieldErrors(errors);
    setError('');
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.register({
        fullname: fullname.trim(),
        email: email.trim(),
        mobilenumber: mobilenumber.replace(/\D/g, ''),
        password,
        role,
      });

      const userData = res.data.data;
      await login(userData, userData.token);
      navigation.navigate('VerifyEmail');
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Registration failed. Please check your details.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Top Header Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Briefcase size={16} color="#FF0000" />
            <Text style={styles.badgeText}>PARTNER ON REMISE</Text>
          </View>
        </View>

        <Text style={styles.heading}>Register your Business</Text>
        <Text style={styles.subheading}>
          Select your business type and create your merchant portal
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Business Role Selector Cards */}
        <Text style={styles.sectionLabel}>Select Business Model</Text>
        <View style={styles.roleList}>
          {BUSINESS_ROLES.map(opt => {
            const isSelected = role === opt.value;
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.roleCard, isSelected && styles.roleCardActive]}
                onPress={() => setRole(opt.value)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, isSelected && styles.roleIconBoxActive]}>
                  <Icon size={20} color={isSelected ? '#FF0000' : '#94A3B8'} />
                </View>
                <View style={styles.roleContent}>
                  <Text style={[styles.roleTitle, isSelected && styles.roleTitleActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.roleDesc}>{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <CheckCircle2 size={16} color="#FF0000" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          {/* Owner / Merchant Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Business / Owner Name</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.fullname && styles.inputError]}
              placeholder="e.g. John Doe / Green Supermarket"
              placeholderTextColor="#6B7280"
              value={fullname}
              onChangeText={text => {
                setFullname(text);
                if (fieldErrors.fullname) setFieldErrors(prev => ({ ...prev, fullname: '' }));
              }}
            />
            {fieldErrors.fullname ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.fullname}</Text>
            ) : null}
          </View>

          {/* Business Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.email && styles.inputError]}
              placeholder="e.g. contact@business.com"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {fieldErrors.email ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            ) : null}
          </View>

          {/* Mobile Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.mobilenumber && styles.inputError]}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#6B7280"
              value={mobilenumber}
              onChangeText={text => {
                setMobilenumber(text);
                if (fieldErrors.mobilenumber)
                  setFieldErrors(prev => ({ ...prev, mobilenumber: '' }));
              }}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {fieldErrors.mobilenumber ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.mobilenumber}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password (Min 8 chars, 1 Upper, 1 Special)</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  !!fieldErrors.password && styles.inputError,
                ]}
                placeholder="Create a strong password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Create Business Account</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => navigation.navigate('GoogleAuthWebView', { role })}
          >
            <Text style={styles.googleBtnText}>Register Business with Google</Text>
          </TouchableOpacity>

          {/* Login Switch */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have a business account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessLogin')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>


          {/* Switch to Customer Signup */}
          <TouchableOpacity
            style={styles.switchPortalBtn}
            onPress={() => navigation.navigate('LoginRegister')}
          >
            <ShoppingBag size={16} color="#FF0000" />
            <Text style={styles.switchPortalText}>Want to shop instead? Customer Registration</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl + 4,
    flexGrow: 1,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.25)',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FF4D4D',
  },
  heading: {
    fontSize: FontSizes.xl + 2,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subheading: {
    fontSize: FontSizes.xs + 1,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: '#F87171',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  roleList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  roleCardActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderColor: '#FF0000',
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleIconBoxActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleDesc: {
    fontSize: FontSizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  checkCircle: {
    marginLeft: Spacing.sm,
  },
  form: {
    gap: Spacing.md,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: FontSizes.base,
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldErrorText: {
    fontSize: FontSizes.xs,
    color: '#F87171',
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  submitBtn: {
    backgroundColor: '#FF0000',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.base,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  googleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  loginPrompt: {
    color: '#94A3B8',
    fontSize: FontSizes.sm,
  },
  loginLink: {
    color: '#FF4D4D',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  switchPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: Spacing.sm,
  },
  switchPortalText: {
    color: '#E2E8F0',
    fontSize: FontSizes.xs + 1,
    fontWeight: '600',
  },
});
