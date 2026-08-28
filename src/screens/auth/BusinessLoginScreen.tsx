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
import { Eye, EyeOff, Briefcase, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { normalizeAuthErrorMessage, validateLoginForm } from '../../utils/authValidation';

export default function BusinessLoginScreen() {
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

  const handleLogin = async () => {
    if (!validate()) return;

    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login(email.trim(), password);
      const userData = res.data.data;

      await login(userData, userData.token);

      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleGate' }],
      });
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
        'Authentication failed. Please check your credentials.',
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
            <Text style={styles.badgeText}>BUSINESS PORTAL</Text>
          </View>
        </View>

        <Text style={styles.heading}>Sign in to your business</Text>
        <Text style={styles.subheading}>
          Manage your store, wholesale stock, and catalog orders
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.email && styles.inputError]}
              placeholder="e.g. store@company.com"
              placeholderTextColor={CustomerColors.textSecondary}
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

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
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
                placeholder="Enter your password"
                placeholderTextColor={CustomerColors.textSecondary}
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
                  <EyeOff size={18} color={CustomerColors.textSecondary} />
                ) : (
                  <Eye size={18} color={CustomerColors.textSecondary} />
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
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In to Business</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => navigation.navigate('GoogleAuthWebView')}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register Business Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New to Remise Business?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessSignup')}>
              <Text style={styles.registerLink}> Register Business</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>


          {/* Customer Login switch */}
          <TouchableOpacity
            style={styles.switchPortalBtn}
            onPress={() => navigation.navigate('LoginRegister')}
          >
            <ShoppingBag size={16} color="#FF0000" />
            <Text style={styles.switchPortalText}>Looking for personal shopping? Customer Login</Text>
          </TouchableOpacity>

          {/* Admin Login link */}
          {/* <TouchableOpacity
            style={styles.adminLinkBtn}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <ShieldCheck size={14} color={CustomerColors.textSecondary} />
            <Text style={styles.adminLinkText}>Admin Portal →</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: CustomerColors.bg,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl + 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: CustomerColors.primary,
  },
  heading: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subheading: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  errorText: {
    color: CustomerColors.danger,
    backgroundColor: CustomerColors.dangerBg,
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
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  forgotText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: FontSizes.base,
    color: CustomerColors.black,
  },
  inputError: {
    borderColor: CustomerColors.danger,
  },
  fieldErrorText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.danger,
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
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  googleBtnText: {
    color: CustomerColors.black,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },

  registerPrompt: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.sm,
  },
  registerLink: {
    color: CustomerColors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CustomerColors.border,
  },
  dividerText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginHorizontal: Spacing.md,
  },
  switchPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  switchPortalText: {
    color: CustomerColors.black,
    fontSize: FontSizes.xs + 1,
    fontWeight: '600',
  },
  adminLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
  },
  adminLinkText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});