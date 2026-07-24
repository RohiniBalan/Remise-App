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
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSuccess('We sent password reset instructions to your email.');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Unable to send reset instructions right now.',
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter the email address linked to your account and we’ll send a reset
          link.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
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

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Back to sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CustomerColors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: CustomerColors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
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
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    marginBottom: Spacing.md,
  },
  submitButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: CustomerColors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  linkButton: { marginTop: Spacing.md, alignItems: 'center' },
  linkText: { color: CustomerColors.teal700, fontWeight: '600' },
  error: {
    color: CustomerColors.danger,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  success: {
    color: CustomerColors.teal700,
    backgroundColor: CustomerColors.mint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
});
