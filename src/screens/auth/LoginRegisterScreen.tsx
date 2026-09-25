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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import {
  normalizeAuthErrorMessage,
  validateLoginForm,
  validateSignupForm,
} from '../../utils/authValidation';

export default function LoginRegisterScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [fullname, setFullname] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setFullname('');
    setMobilenumber('');
    setPassword('');
    setShowPassword(false);
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors = isLogin
      ? validateLoginForm({ email, password })
      : validateSignupForm({ fullname, email, mobilenumber, password });

    setFieldErrors(errors);
    setError('');

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        const res = await authApi.login(email.trim(), password);

        await login(res.data.data, res.data.data.token);
        setSuccessMessage('Logged in successfully!');
        setShowSuccess(true);
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'RoleGate' }],
          });
        }, 1200);
      } else {
        const res = await authApi.register({
          fullname: fullname.trim(),
          email: email.trim(),
          mobilenumber: mobilenumber.replace(/\D/g, ''),
          password,
          role: 'user',
        });
        await login(res.data.data, res.data.data.token);
        setSuccessMessage('Account created! Opening verification...');
        setShowSuccess(true);
        setTimeout(() => {
          navigation.navigate('VerifyEmail');
        }, 1500);
      }
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Something went wrong. Please try again.',
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
      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <CheckCircle2 size={40} color={CustomerColors.primary} />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalSubtitle}>{successMessage}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>Remise</Text>
        <Text style={styles.heading}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLogin && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={value => {
                setFullname(value);
                setFieldErrors(prev => ({ ...prev, fullname: '' }));
              }}
              placeholder="Your name"
              placeholderTextColor={CustomerColors.textSecondary}
            />
            {fieldErrors.fullname ? (
              <Text style={styles.fieldError}>{fieldErrors.fullname}</Text>
            ) : null}
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobilenumber}
              onChangeText={value => {
                setMobilenumber(value);
                setFieldErrors(prev => ({ ...prev, mobilenumber: '' }));
              }}
              placeholder="10-digit mobile number"
              placeholderTextColor={CustomerColors.textSecondary}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {fieldErrors.mobilenumber ? (
              <Text style={styles.fieldError}>{fieldErrors.mobilenumber}</Text>
            ) : null}
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={value => {
            setEmail(value);
            setFieldErrors(prev => ({ ...prev, email: '' }));
          }}
          placeholder="you@example.com"
          placeholderTextColor={CustomerColors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {fieldErrors.email ? (
          <Text style={styles.fieldError}>{fieldErrors.email}</Text>
        ) : null}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={value => {
              setPassword(value);
              setFieldErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            placeholderTextColor={CustomerColors.textSecondary}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(v => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={CustomerColors.textSecondary} />
            ) : (
              <Eye size={18} color={CustomerColors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? (
          <Text style={styles.fieldError}>{fieldErrors.password}</Text>
        ) : null}

        {isLogin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotLinkText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={CustomerColors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isLogin ? 'Log In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() =>
            navigation.navigate('GoogleAuthWebView', {
              role: isLogin ? undefined : 'user',
            })
          }
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode} style={styles.toggleLink}>
          <Text style={styles.toggleLinkText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.toggleLinkAccent}>
              {isLogin ? 'Register' : 'Log In'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Business Portal Link Card */}
        <View style={styles.businessSection}>
          <TouchableOpacity
            style={styles.deliveryCard}
            onPress={() => navigation.navigate('DeliveryPartnerLogin')}
          >
            <Text style={styles.deliveryCardTitle}>
              🚚 Delivery Partner Portal
            </Text>
            <Text style={styles.deliveryCardSubtitle}>
              Login or register to deliver with Remise →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.businessCard}
            onPress={() => navigation.navigate('BusinessLogin')}
          >
            <Text style={styles.businessCardTitle}>
              💼 Are you a Business or Seller?
            </Text>
            <Text style={styles.businessCardSubtitle}>
              Store Owner · Wholesaler · Home Business Login →
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.adminLink}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.adminLinkText}>Admin Portal Console →</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CustomerColors.bg },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  brand: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: CustomerColors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heading: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: CustomerColors.black,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  error: {
    color: CustomerColors.danger,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    fontSize: FontSizes.sm,
  },
  fieldError: {
    color: CustomerColors.danger,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: CustomerColors.black,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: Spacing.xxl },
  eyeBtn: { position: 'absolute', right: Spacing.md },
  submitButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  forgotLink: { alignItems: 'flex-end', marginTop: Spacing.sm },
  forgotLinkText: {
    color: CustomerColors.teal700,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  submitButtonText: {
    color: CustomerColors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: CustomerColors.white,
  },
  googleButtonText: {
    color: CustomerColors.black,
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  toggleLink: { marginTop: Spacing.lg, alignItems: 'center' },
  toggleLinkText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.sm,
  },
  toggleLinkAccent: { color: CustomerColors.teal700, fontWeight: '700' },
  businessSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.border,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  businessCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  businessCardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  businessCardSubtitle: {
    color: '#94A3B8',
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  deliveryCard: {
    width: '100%',
    backgroundColor: '#115E59',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deliveryCardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  deliveryCardSubtitle: {
    color: '#CCFBF1',
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  adminLink: {
    paddingVertical: Spacing.xs,
  },
  adminLinkText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
