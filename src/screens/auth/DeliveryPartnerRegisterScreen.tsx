import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  validateSignupForm,
} from '../../utils/authValidation';

export default function DeliveryPartnerRegisterScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullname: '',
    mobilenumber: '',
    email: '',
    password: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const set = (key: string, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const submit = async () => {
    const errors = validateSignupForm(form);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }
    if (!form.vehicleNumber.trim()) {
      setError('Vehicle number is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await authApi.register({
        fullname: form.fullname.trim(),
        mobilenumber: form.mobilenumber.replace(/\D/g, ''),
        email: form.email.trim(),
        password: form.password,
        role: 'delivery_person',
        vehicleType: form.vehicleType.trim(),
        vehicleNumber: form.vehicleNumber.trim(),
        address: form.address.trim(),
      });
      const data = response.data.data;
      await login(data, data.token);
      setSuccessMessage('Account created! Opening verification...');
      setShowSuccess(true);
      setTimeout(() => {
        navigation.navigate('VerifyEmail');
      }, 1500);
    } catch (err: any) {
      setError(
        normalizeAuthErrorMessage(err.response?.data?.message || err.message) ||
          'Unable to register.',
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

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>REMISE DELIVERY NETWORK</Text>
        <Text style={styles.title}>Create delivery account</Text>
        <Text style={styles.subtitle}>
          Your application will remain pending until Remise approval.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Field
          label="Full name"
          value={form.fullname}
          onChangeText={value => set('fullname', value)}
        />
        <Field
          label="Mobile number"
          value={form.mobilenumber}
          onChangeText={value => set('mobilenumber', value)}
          keyboardType="phone-pad"
          numeric
        />
        <Field
          label="Email"
          value={form.email}
          onChangeText={value => set('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrap}>
          <TextInput
            value={form.password}
            onChangeText={value => set('password', value)}
            secureTextEntry={!showPassword}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(value => !value)}
            accessibilityLabel={
              showPassword ? 'Hide password' : 'Show password'
            }
          >
            {showPassword ? (
              <EyeOff size={18} color="#94A3B8" />
            ) : (
              <Eye size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>
        <Field
          label="Vehicle type"
          value={form.vehicleType}
          onChangeText={value => set('vehicleType', value)}
        />
        <Field
          label="Vehicle number"
          value={form.vehicleNumber}
          onChangeText={value => set('vehicleNumber', value)}
        />
        <Field
          label="Address"
          value={form.address}
          onChangeText={value => set('address', value)}
        />
        <TouchableOpacity
          style={styles.primary}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>
              Register and submit application
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryPartnerLogin')}
        >
          <Text style={styles.link}>Already registered? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  numeric = false,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
  [key: string]: unknown;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        value={value}
        onChangeText={value =>
          onChangeText(numeric ? value.replace(/\D/g, '') : value)
        }
        keyboardType={numeric ? 'number-pad' : (props.keyboardType as any)}
        maxLength={numeric ? 10 : (props.maxLength as any)}
        placeholder={label}
        placeholderTextColor="#64748B"
        style={styles.input}
      />
    </>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070707' },
  content: { padding: Spacing.xl, gap: 4 },
  eyebrow: {
    color: CustomerColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#94A3B8', marginTop: 6, marginBottom: Spacing.md },
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
    color: '#FFFFFF',
    padding: Spacing.md,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 14, top: 14 },
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
  primaryText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
  link: {
    color: CustomerColors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontWeight: '700',
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
