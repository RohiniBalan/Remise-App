import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  Upload,
  FileText,
  Trash2,
  Check,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/permissions';
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
    licenseNumber: '',
    address: '',
  });
  const [licenseAsset, setLicenseAsset] = useState<Asset | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const set = (key: string, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const pickLicenseImage = async (fromCamera: boolean) => {
    try {
      if (fromCamera) {
        const granted = await requestCameraPermission();
        if (!granted) return;
      }
      const res = fromCamera
        ? await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1600,
            includeBase64: true,
          })
        : await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1600,
            includeBase64: true,
          });
      if (res.didCancel || res.errorCode) return;
      const picked = res.assets?.[0];
      if (picked) {
        setLicenseAsset(picked);
        setError('');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e?.message || 'Could not select license document.');
    }
  };

  const removeLicense = () => {
    setLicenseAsset(null);
  };

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
    if (!form.licenseNumber.trim()) {
      setError('Driving license number is required.');
      return;
    }
    if (!licenseAsset?.uri) {
      setError('Please upload your driving license image or document.');
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
        licenseNumber: form.licenseNumber.trim(),
        licenseFile: licenseAsset.base64
          ? `data:${licenseAsset.type || 'image/jpeg'};base64,${licenseAsset.base64}`
          : licenseAsset.uri,
        licenseFileName: licenseAsset.fileName || 'license_document.jpg',
        address: form.address.trim(),
      });
      const data = response.data.data;
      await login(data, data.token);
      setSuccessMessage('Account created! Verification code sent to email & WhatsApp.');
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
          onChangeText={value => set('vehicleNumber', value.toUpperCase())}
          autoCapitalize="characters"
        />
        <Field
          label="Driving license number"
          value={form.licenseNumber}
          onChangeText={value => set('licenseNumber', value.toUpperCase())}
          autoCapitalize="characters"
          placeholder="e.g. DL-1420110012345"
        />

        {/* License Upload Section */}
        <Text style={styles.label}>Driving License Document (Image / PDF)</Text>
        {!licenseAsset ? (
          <View style={styles.uploadBox}>
            <View style={styles.uploadIconWrap}>
              <FileText size={22} color="#FF0000" />
            </View>
            <Text style={styles.uploadTitle}>Upload Driving License</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo or choose from gallery / files (Max 5MB)
            </Text>
            <View style={styles.uploadButtonsRow}>
              <TouchableOpacity
                style={styles.uploadActionBtn}
                onPress={() => pickLicenseImage(true)}
                activeOpacity={0.8}
              >
                <Camera size={14} color="#FFFFFF" />
                <Text style={styles.uploadActionBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadActionBtn, styles.uploadActionBtnSecondary]}
                onPress={() => pickLicenseImage(false)}
                activeOpacity={0.8}
              >
                <Upload size={14} color="#FFFFFF" />
                <Text style={styles.uploadActionBtnText}>Gallery / Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.attachedBox}>
            {licenseAsset.uri && (
              <Image
                source={{ uri: licenseAsset.uri }}
                style={styles.attachedThumb}
                resizeMode="cover"
              />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.attachedBadgeRow}>
                <Check size={12} color="#10B981" />
                <Text style={styles.attachedBadgeText}>Document Attached</Text>
              </View>
              <Text style={styles.attachedName} numberOfLines={1}>
                {licenseAsset.fileName || 'License_Document.jpg'}
              </Text>
              {licenseAsset.fileSize ? (
                <Text style={styles.attachedSize}>
                  {(licenseAsset.fileSize / 1024).toFixed(1)} KB
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={removeLicense}
              accessibilityLabel="Remove document"
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

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
  placeholder,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
  placeholder?: string;
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
        placeholder={placeholder || label}
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
  // License Upload Styles
  uploadBox: {
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: '#2E2E33',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: 2,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  uploadSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  uploadActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  uploadActionBtnSecondary: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  uploadActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  attachedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 2,
  },
  attachedThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#27272A',
  },
  attachedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachedBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  attachedName: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginTop: 1,
  },
  attachedSize: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
