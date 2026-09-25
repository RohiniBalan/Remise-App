import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import {
  CustomerColors,
  Spacing,
  BorderRadius,
  FontSizes,
} from '../../styles/theme';
import {
  normalizeAuthErrorMessage,
  validateLoginForm,
} from '../../utils/authValidation';

export default function DeliveryPartnerLoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const submit = async () => {
    const errors = validateLoginForm({ email, password });
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await authApi.login(email.trim(), password);
      const data = response.data.data;
      if (data.role !== 'delivery_person')
        throw new Error('This login is for Remise delivery partners.');
      await login(data, data.token);
      setSuccessMessage('Signed in successfully! Opening dashboard...');
      setShowSuccess(true);
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'RoleGate' }] });
      }, 1200);
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Unable to sign in.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
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

      <View style={styles.card}>
        <Text style={styles.eyebrow}>REMISE DELIVERY NETWORK</Text>
        <Text style={styles.title}>Delivery partner login</Text>
        <Text style={styles.subtitle}>
          Sign in to receive nearby delivery requests.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94A3B8"
        />
        <Text style={styles.label}>Password</Text>
        <View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setShowPassword(value => !value)}
          >
            {showPassword ? (
              <EyeOff size={18} color="#64748B" />
            ) : (
              <Eye size={18} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.primary}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Sign in</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryPartnerRegister')}
        >
          <Text style={styles.link}>New partner? Register here</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginRegister')}>
          <Text style={styles.secondaryLink}>Customer login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070707',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#262626',
  },
  eyebrow: {
    color: CustomerColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: {
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  error: {
    color: '#FECACA',
    backgroundColor: '#7F1D1D',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  label: {
    color: '#E2E8F0',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: BorderRadius.md,
    color: '#fff',
    padding: Spacing.md,
    paddingRight: 44,
  },
  eye: { position: 'absolute', right: 14, top: 14 },
  primary: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: CustomerColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  link: {
    color: CustomerColors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontWeight: '700',
  },
  secondaryLink: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: Spacing.md,
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
