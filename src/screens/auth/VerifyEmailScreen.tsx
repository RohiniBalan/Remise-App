import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const handleResend = async () => {
    if (!email.trim()) {
      setIsError(true);
      setMessage('Enter your email address first.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      await authApi.resendVerification(email.trim());
      setIsError(false);
      setMessage('Verification email sent — check your inbox.');
      setCountdown(60);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Could not send verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.brand}>Remise</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to your email address. Click the link, then enter the code here to confirm.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
          />

          {message ? <Text style={[styles.message, isError ? styles.messageError : styles.messageSuccess]}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (sending || countdown > 0) && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={sending || countdown > 0}>
            <Text style={styles.buttonText}>
              {countdown > 0 ? `Resend available in ${countdown}s` : sending ? 'Sending…' : 'Resend Verification Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('VerifyEmailToken')}>
            <Text style={styles.secondaryButtonText}>I have my verification code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipLink} onPress={() => navigation.goBack()}>
            <Text style={styles.skipLinkText}>Continue without verifying</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  brand: { fontSize: 32, fontWeight: '800', color: CustomerColors.primary, marginBottom: Spacing.xl, letterSpacing: 0.5 },
  card: { width: '100%', maxWidth: 420, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.xl },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: CustomerColors.black, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center', lineHeight: 20 },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base, marginBottom: Spacing.md },
  message: { fontSize: FontSizes.sm, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  messageSuccess: { color: CustomerColors.success, backgroundColor: CustomerColors.successBg },
  messageError: { color: CustomerColors.danger, backgroundColor: CustomerColors.dangerBg },
  button: { backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: CustomerColors.white, fontWeight: '700', fontSize: FontSizes.base },
  secondaryButton: { borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.md, backgroundColor: CustomerColors.white },
  secondaryButtonText: { color: CustomerColors.teal700, fontWeight: '600', fontSize: FontSizes.base },
  skipLink: { marginTop: Spacing.lg, alignItems: 'center' },
  skipLinkText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm, textDecorationLine: 'underline' },
});