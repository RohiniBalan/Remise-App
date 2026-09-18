import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, ShieldCheck, Mail, RefreshCw } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const handleVerify = async () => {
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setIsError(true);
      setMessage('Please enter the 6-digit verification code.');
      return;
    }
    setVerifying(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await authApi.verifyEmail(cleanCode, email.trim());
      await updateUser({ isEmailVerified: true });
      setSuccess(true);
      setIsError(false);
      setMessage('Your email has been verified successfully!');
      setTimeout(() => {
        navigation.popToTop();
      }, 1500);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setVerifying(false);
    }
  };

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
      setMessage('New 6-digit verification code sent to your email.');
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
          <View style={styles.iconWrap}>
            {success ? (
              <CheckCircle size={36} color={CustomerColors.success} />
            ) : (
              <ShieldCheck size={36} color={CustomerColors.primary} />
            )}
          </View>

          <Text style={styles.title}>
            {success ? 'Account Verified!' : 'Enter Verification Code'}
          </Text>
          <Text style={styles.subtitle}>
            {success
              ? 'Redirecting to your account...'
              : 'We sent a 6-digit verification code to your email. Enter it below to verify.'}
          </Text>

          {!success && (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>6-Digit Verification Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={(val) => setCode(val.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="••••••"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {message ? (
            <Text style={[styles.message, isError ? styles.messageError : styles.messageSuccess]}>
              {message}
            </Text>
          ) : null}

          {!success && (
            <>
              <TouchableOpacity
                style={[styles.button, (verifying || code.trim().length < 6) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={verifying || code.trim().length < 6}
              >
                {verifying ? (
                  <ActivityIndicator color={CustomerColors.white} />
                ) : (
                  <Text style={styles.buttonText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, (sending || countdown > 0) && styles.buttonDisabled]}
                onPress={handleResend}
                disabled={sending || countdown > 0}
              >
                <Text style={styles.secondaryButtonText}>
                  {countdown > 0 ? `Resend code in ${countdown}s` : sending ? 'Sending code…' : 'Resend Verification Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipLink} onPress={() => navigation.goBack()}>
                <Text style={styles.skipLinkText}>Continue without verifying</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  brand: { fontSize: 32, fontWeight: '800', color: CustomerColors.primary, marginBottom: Spacing.lg, letterSpacing: 0.5 },
  card: { width: '100%', maxWidth: 420, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.xl },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: CustomerColors.black, marginBottom: Spacing.xs, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center', lineHeight: 20 },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, color: CustomerColors.black, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base, marginBottom: Spacing.md },
  codeInput: { textAlign: 'center', fontSize: 22, fontWeight: '700', letterSpacing: 8 },
  message: { fontSize: FontSizes.sm, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  messageSuccess: { color: CustomerColors.success, backgroundColor: CustomerColors.successBg },
  messageError: { color: CustomerColors.danger, backgroundColor: CustomerColors.dangerBg },
  button: { backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: CustomerColors.white, fontWeight: '700', fontSize: FontSizes.base },
  secondaryButton: { borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.md, backgroundColor: CustomerColors.white },
  secondaryButtonText: { color: CustomerColors.teal700, fontWeight: '600', fontSize: FontSizes.base },
  skipLink: { marginTop: Spacing.lg, alignItems: 'center' },
  skipLinkText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm, textDecorationLine: 'underline' },
});