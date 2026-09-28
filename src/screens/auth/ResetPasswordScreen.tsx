import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { authApi } from '../../api/authApi';
import { validateResetPasswordForm } from '../../utils/authValidation';

export default function ResetPasswordScreen({ navigation }: any) {
  const route = useRoute<any>();
  const initialToken = route.params?.token || '';
  const role = route.params?.role;
  const returnTo = route.params?.returnTo;
  const isDelivery =
    role === 'delivery_partner' ||
    role === 'delivery_person' ||
    returnTo === 'DeliveryPartnerLogin';

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
    }
  }, [route.params?.token]);

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError('Please enter your reset token from the email.');
      return;
    }

    const validationErrors = validateResetPasswordForm({
      password,
      confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setError(
        validationErrors.password ||
          validationErrors.confirmPassword ||
          'Please verify password requirements.',
      );
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(token.trim(), password);
      setSuccess(
        isDelivery
          ? 'Password reset successfully! You can sign in with your new password.'
          : 'Your password has been reset. You can sign in now.',
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignInNavigation = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else if (isDelivery) {
      navigation.navigate('DeliveryPartnerLogin');
    } else {
      navigation.navigate('LoginRegister');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, isDelivery && styles.flexDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isDelivery && styles.containerDark,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={isDelivery ? styles.cardDark : styles.cardLight}>
          {isDelivery ? (
            <Text style={styles.eyebrowDark}>REMISE DELIVERY NETWORK</Text>
          ) : null}

          <Text style={[styles.title, isDelivery && styles.titleDark]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, isDelivery && styles.subtitleDark]}>
            {isDelivery
              ? 'Choose a strong password for your delivery partner account.'
              : 'Choose a strong password for your account.'}
          </Text>

          {error ? (
            <Text style={[styles.error, isDelivery && styles.errorDark]}>
              {error}
            </Text>
          ) : null}

          {success ? (
            <View style={[styles.successBox, isDelivery && styles.successBoxDark]}>
              <View style={styles.successRow}>
                <CheckCircle2
                  size={20}
                  color={isDelivery ? '#34D399' : CustomerColors.teal700}
                />
                <Text
                  style={[
                    styles.successText,
                    isDelivery && styles.successTextDark,
                  ]}
                >
                  {success}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignInNavigation}
              >
                <Text style={styles.signInButtonText}>
                  {isDelivery
                    ? 'Go to Delivery Partner Sign in'
                    : 'Back to Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {!route.params?.token && (
                <>
                  <Text style={[styles.label, isDelivery && styles.labelDark]}>
                    Reset Token
                  </Text>
                  <TextInput
                    style={[styles.input, isDelivery && styles.inputDark]}
                    value={token}
                    onChangeText={setToken}
                    placeholder="Paste reset token from email"
                    placeholderTextColor={
                      isDelivery ? '#94A3B8' : CustomerColors.textSecondary
                    }
                    autoCapitalize="none"
                  />
                </>
              )}

              <Text style={[styles.label, isDelivery && styles.labelDark]}>
                New Password
              </Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isDelivery && styles.inputDark,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 chars, 1 uppercase, 1 special"
                  placeholderTextColor={
                    isDelivery ? '#94A3B8' : CustomerColors.textSecondary
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowPassword(v => !v)}
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                      color={isDelivery ? '#94A3B8' : '#64748B'}
                    />
                  ) : (
                    <Eye
                      size={18}
                      color={isDelivery ? '#94A3B8' : '#64748B'}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, isDelivery && styles.labelDark]}>
                Confirm Password
              </Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isDelivery && styles.inputDark,
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={
                    isDelivery ? '#94A3B8' : CustomerColors.textSecondary
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={18}
                      color={isDelivery ? '#94A3B8' : '#64748B'}
                    />
                  ) : (
                    <Eye
                      size={18}
                      color={isDelivery ? '#94A3B8' : '#64748B'}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={CustomerColors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Reset password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSignInNavigation}
                style={styles.linkButton}
              >
                <Text
                  style={[
                    styles.linkText,
                    isDelivery && styles.linkTextDark,
                  ]}
                >
                  {isDelivery
                    ? 'Back to delivery partner sign in'
                    : 'Back to sign in'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CustomerColors.bg },
  flexDark: { backgroundColor: '#070707' },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  containerDark: { justifyContent: 'center' },
  cardLight: { width: '100%' },
  cardDark: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#262626',
    width: '100%',
  },
  eyebrowDark: {
    color: CustomerColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: CustomerColors.primary,
    marginBottom: Spacing.xs,
  },
  titleDark: {
    color: '#FFFFFF',
    fontSize: 26,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  subtitleDark: {
    color: '#94A3B8',
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  labelDark: {
    color: '#E2E8F0',
  },
  passwordRow: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: CustomerColors.white,
    color: CustomerColors.black,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    marginBottom: Spacing.md,
  },
  passwordInput: {
    paddingRight: 44,
    marginBottom: 0,
  },
  inputDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  submitButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: CustomerColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: CustomerColors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  linkButton: { marginTop: Spacing.lg, alignItems: 'center' },
  linkText: { color: CustomerColors.teal700, fontWeight: '600' },
  linkTextDark: { color: CustomerColors.primary, fontWeight: '700' },
  error: {
    color: CustomerColors.danger,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorDark: {
    color: '#FECACA',
    backgroundColor: '#7F1D1D',
  },
  successBox: {
    backgroundColor: CustomerColors.mint,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  successBoxDark: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.35)',
    borderRadius: 16,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  successText: {
    color: CustomerColors.teal700,
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flex: 1,
  },
  successTextDark: {
    color: '#34D399',
  },
  signInButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSizes.base,
  },
});
