import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function VerifyEmailTokenScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { updateUser } = useAuth();

  const [token, setToken] = useState(route.params?.token ?? '');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    if (!token.trim()) {
      setStatus('error');
      setMessage('Enter the verification code from your email.');
      return;
    }
    setStatus('verifying');
    try {
      await authApi.verifyEmail(token.trim());
      await updateUser({ isEmailVerified: true });
      setStatus('success');
      setMessage('Your email has been verified!');
      // Pop all the way back to RoleGate (not just one level) so the
      // already-updated role/store state actually becomes visible —
      // goBack() alone would only return to VerifyEmailScreen, still
      // stacked above RoleGate.
      setTimeout(() => navigation.popToTop(), 1500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.brand}>Remise</Text>

        <View style={styles.card}>
          {status !== 'success' && (
            <>
              <Text style={styles.title}>Enter verification code</Text>

              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                placeholder="Paste the code from your email"
                placeholderTextColor="#9CA3AF"
              />

              {message ? <Text style={styles.errorText}>{message}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={status === 'verifying'}>
                {status === 'verifying' ? <ActivityIndicator color={CustomerColors.white} /> : <Text style={styles.buttonText}>Verify Email</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('VerifyEmail')}>
                <Text style={styles.linkText}>Request a new link</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'success' && (
            <View style={styles.successWrap}>
              <CheckCircle size={40} color={CustomerColors.success} />
              <Text style={styles.successText}>{message}</Text>
            </View>
          )}
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
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: CustomerColors.black, marginBottom: Spacing.lg, textAlign: 'center' },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base, marginBottom: Spacing.md },
  errorText: { color: CustomerColors.danger, backgroundColor: CustomerColors.dangerBg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, fontSize: FontSizes.sm },
  button: { backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  buttonText: { color: CustomerColors.white, fontWeight: '700', fontSize: FontSizes.base },
  linkButton: { marginTop: Spacing.lg, alignItems: 'center' },
  linkText: { color: CustomerColors.teal700, fontWeight: '600', fontSize: FontSizes.sm },
  successWrap: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  successText: { color: CustomerColors.success, fontSize: FontSizes.base, fontWeight: '600', textAlign: 'center' },
});