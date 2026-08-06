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
import { Eye, EyeOff } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { normalizeAuthErrorMessage, validateLoginForm, validateSignupForm } from '../../utils/authValidation';

// Ported from client/app/login/page.tsx — single screen, login/register
// toggle, same field set, validation rules, and role options as web.

type RegisterRole = 'user' | 'store_owner' | 'whole_saler' | 'home_business';

export default function LoginRegisterScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [registerAs, setRegisterAs] = useState<RegisterRole>('user');
  const [fullname, setFullname] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    // Match web's toggleMode: clear signup-only fields and state so
    // switching tabs doesn't carry over a half-filled form.
    setFullname('');
    setMobilenumber('');
    setPassword('');
    setShowPassword(false);
    setFieldErrors({});
    setRegisterAs('user');
  };

  // Mirrors web's validateForm: actually applies field errors and returns
  // a boolean, instead of the old version which computed errors and threw
  // them away by always returning null.
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
        // AppNavigator's RoleGate re-renders automatically once auth state
        // changes — no explicit navigation needed here, same as web relying
        // on the next render's redirectDestination(role).
      } else {
        const res = await authApi.register({
          fullname: fullname.trim(),
          email: email.trim(),
          mobilenumber: mobilenumber.replace(/\D/g, ''),
          password,
          role: registerAs,
        });
        // Web logs the user in immediately on register success, then routes
        // to /verify-email — same order here (see AppNavigator's RootStack
        // comment for why VerifyEmail lives above the role gate).
        await login(res.data.data, res.data.data.token);
        navigation.navigate('VerifyEmail');
      }
    } catch (err: any) {
      setError(normalizeAuthErrorMessage(err.response?.data?.message || err.message) || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Remise</Text>
        <Text style={styles.heading}>{isLogin ? 'Welcome back' : 'Create your account'}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLogin && (
          <View style={styles.roleGrid}>
            <TouchableOpacity
              style={[styles.rolePill, registerAs === 'user' && styles.rolePillActive]}
              onPress={() => setRegisterAs('user')}>
              <Text style={[styles.rolePillText, registerAs === 'user' && styles.rolePillTextActive]}>🛍️ Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, registerAs === 'store_owner' && styles.rolePillActive]}
              onPress={() => setRegisterAs('store_owner')}>
              <Text style={[styles.rolePillText, registerAs === 'store_owner' && styles.rolePillTextActive]}>🏪 Store Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, registerAs === 'whole_saler' && styles.rolePillActive]}
              onPress={() => setRegisterAs('whole_saler')}>
              <Text style={[styles.rolePillText, registerAs === 'whole_saler' && styles.rolePillTextActive]}>📦 Wholesaler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, registerAs === 'home_business' && styles.rolePillActive]}
              onPress={() => setRegisterAs('home_business')}>
              <Text style={[styles.rolePillText, registerAs === 'home_business' && styles.rolePillTextActive]}>🏠 Home Business</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLogin && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={(value) => {
                setFullname(value);
                setFieldErrors(prev => ({ ...prev, fullname: '' }));
              }}
              placeholder="Your name"
            />
            {fieldErrors.fullname ? <Text style={styles.fieldError}>{fieldErrors.fullname}</Text> : null}
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobilenumber}
              onChangeText={(value) => {
                setMobilenumber(value);
                setFieldErrors(prev => ({ ...prev, mobilenumber: '' }));
              }}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {fieldErrors.mobilenumber ? <Text style={styles.fieldError}>{fieldErrors.mobilenumber}</Text> : null}
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFieldErrors(prev => ({ ...prev, email: '' }));
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {showPassword ? <EyeOff size={18} color={CustomerColors.textSecondary} /> : <Eye size={18} color={CustomerColors.textSecondary} />}
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

        {isLogin && (
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
            <Text style={styles.forgotLinkText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={CustomerColors.white} />
          ) : (
            <Text style={styles.submitButtonText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={() => navigation.navigate('GoogleAuthWebView')}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode} style={styles.toggleLink}>
          <Text style={styles.toggleLinkText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.toggleLinkAccent}>{isLogin ? 'Register' : 'Log In'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CustomerColors.bg },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  brand: { fontSize: FontSizes.xxl, fontWeight: '800', color: CustomerColors.primary, textAlign: 'center', marginBottom: Spacing.sm },
  heading: { fontSize: FontSizes.md, fontWeight: '600', color: CustomerColors.black, textAlign: 'center', marginBottom: Spacing.lg },
  error: { color: CustomerColors.danger, backgroundColor: CustomerColors.dangerBg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, fontSize: FontSizes.sm },
  fieldError: { color: CustomerColors.danger, fontSize: FontSizes.xs, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  // 2x2 grid (was a single row) to fit all four role options, matching
  // web's `grid grid-cols-2 gap-2` layout.
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  rolePill: { width: '48%', paddingVertical: Spacing.md, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: CustomerColors.steelBorder, alignItems: 'center' },
  rolePillActive: { backgroundColor: CustomerColors.mint, borderColor: CustomerColors.teal600 },
  rolePillText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, fontWeight: '600' },
  rolePillTextActive: { color: CustomerColors.teal700 },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base, color: CustomerColors.black },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: Spacing.xxl },
  eyeBtn: { position: 'absolute', right: Spacing.md },
  submitButton: { backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  forgotLink: { alignItems: 'flex-end', marginTop: Spacing.sm },
  forgotLinkText: { color: CustomerColors.teal700, fontWeight: '600', fontSize: FontSizes.sm },
  submitButtonText: { color: CustomerColors.white, fontWeight: '700', fontSize: FontSizes.base },
  googleButton: { borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.md, backgroundColor: CustomerColors.white },
  googleButtonText: { color: CustomerColors.black, fontWeight: '600', fontSize: FontSizes.base },
  toggleLink: { marginTop: Spacing.xl, alignItems: 'center' },
  toggleLinkText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm },
  toggleLinkAccent: { color: CustomerColors.teal700, fontWeight: '700' },
});