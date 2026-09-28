import React, { useState } from 'react';
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
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { authApi } from '../../api/authApi';
import { isValidEmail } from '../../utils/authValidation';

export default function ForgotPasswordScreen({ navigation }: any) {
  const route = useRoute<any>();
  const role = route.params?.role;
  const returnTo = route.params?.returnTo;
  const isDelivery =
    role === 'delivery_partner' ||
    role === 'delivery_person' ||
    returnTo === 'DeliveryPartnerLogin';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSuccess(
        isDelivery
          ? 'Password reset instructions sent. Please check your inbox.'
          : 'We sent password reset instructions to your email.',
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Unable to send reset instructions right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else if (isDelivery) {
      navigation.navigate('DeliveryPartnerLogin');
    } else {
      navigation.goBack();
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
            Forgot Password
          </Text>
          <Text style={[styles.subtitle, isDelivery && styles.subtitleDark]}>
            {isDelivery
              ? 'Enter the email address registered with your delivery partner account.'
              : 'Enter the email address linked to your account and we’ll send a reset link.'}
          </Text>

          {error ? (
            <Text style={[styles.error, isDelivery && styles.errorDark]}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text style={[styles.success, isDelivery && styles.successDark]}>
              {success}
            </Text>
          ) : null}

          <Text style={[styles.label, isDelivery && styles.labelDark]}>
            Email Address
          </Text>
          <TextInput
            style={[styles.input, isDelivery && styles.inputDark]}
            value={email}
            onChangeText={setEmail}
            placeholder={
              isDelivery ? 'partner@example.com' : 'you@example.com'
            }
            placeholderTextColor={
              isDelivery ? '#94A3B8' : CustomerColors.textSecondary
            }
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={CustomerColors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Send reset link</Text>
            )}
          </TouchableOpacity>

          {success ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ResetPassword', {
                  role: isDelivery ? 'delivery_partner' : role,
                  returnTo: isDelivery ? 'DeliveryPartnerLogin' : returnTo,
                })
              }
              style={styles.tokenButton}
            >
              <Text
                style={[
                  styles.tokenButtonText,
                  isDelivery && styles.tokenButtonTextDark,
                ]}
              >
                Already have a reset token? Enter token &rarr;
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={handleBack} style={styles.linkButton}>
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
  inputDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
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
  tokenButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  tokenButtonText: {
    color: CustomerColors.teal700,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  tokenButtonTextDark: {
    color: '#34D399',
  },
  linkButton: { marginTop: Spacing.md, alignItems: 'center' },
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
  success: {
    color: CustomerColors.teal700,
    backgroundColor: CustomerColors.mint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  successDark: {
    color: '#6EE7B7',
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: 'rgba(5, 150, 105, 0.4)',
    borderWidth: 1,
  },
});
