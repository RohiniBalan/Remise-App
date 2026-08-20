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
import { Eye, EyeOff, ShieldCheck, Lock, ArrowLeft } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { normalizeAuthErrorMessage, validateLoginForm } from '../../utils/authValidation';

export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    setError('');
    return Object.keys(errors).length === 0;
  };

  const handleAdminLogin = async () => {
    if (!validate()) return;

    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login(email.trim(), password);
      const userData = res.data.data;

      // Enforce admin-only access
      if (userData.role !== 'admin') {
        setError('Access Denied: This portal is strictly for administrator accounts only.');
        setSubmitting(false);
        return;
      }

      await login(userData, userData.token);

      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Authentication failed. Please verify your admin credentials.',
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
        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('RoleGate')}
        >
          <ArrowLeft size={18} color="#94A3B8" />
          <Text style={styles.backBtnText}>Return to Marketplace</Text>
        </TouchableOpacity>

        {/* Security Shield Icon */}
        <View style={styles.shieldContainer}>
          <View style={styles.shieldBox}>
            <ShieldCheck size={36} color="#6366F1" />
          </View>
          <View style={styles.adminBadge}>
            <Lock size={12} color="#818CF8" />
            <Text style={styles.adminBadgeText}>SECURE ADMIN CONSOLE</Text>
          </View>
        </View>

        <Text style={styles.heading}>Administrator Sign In</Text>
        <Text style={styles.subheading}>
          Restricted access for Remise platform & content management
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          {/* Admin Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Admin Email</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.email && styles.inputError]}
              placeholder="admin@remise.in"
              placeholderTextColor="#64748B"
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

          {/* Admin Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Admin Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  !!fieldErrors.password && styles.inputError,
                ]}
                placeholder="••••••••••••"
                placeholderTextColor="#64748B"
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
                  <EyeOff size={18} color="#94A3B8" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
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
            onPress={handleAdminLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Authenticate Admin</Text>
            )}
          </TouchableOpacity>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              All authentication attempts on the admin console are monitored and logged.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl + 4,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: FontSizes.sm,
    color: '#94A3B8',
    fontWeight: '600',
  },
  shieldContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shieldBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#A5B4FC',
  },
  heading: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subheading: {
    fontSize: FontSizes.sm,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
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
  form: {
    gap: Spacing.md,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  forgotText: {
    fontSize: FontSizes.xs,
    color: '#818CF8',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: '#4F46E5',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#4F46E5',
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
  noticeBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  noticeText: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
