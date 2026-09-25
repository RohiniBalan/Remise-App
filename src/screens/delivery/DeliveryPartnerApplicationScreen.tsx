import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors } from '../../styles/theme';

export default function DeliveryPartnerApplicationScreen() {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!vehicleType.trim() || !vehicleNumber.trim()) {
      Alert.alert(
        'Missing details',
        'Vehicle type and vehicle number are required.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await smartOrderApi.applyAsDeliveryPartner({
        vehicleType,
        vehicleNumber,
        address,
      });
      Alert.alert(
        'Application submitted',
        'Remise will review your delivery partner application.',
      );
    } catch (error: any) {
      Alert.alert(
        'Application failed',
        error?.response?.data?.message || 'Unable to submit application.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>REMISE DELIVERY NETWORK</Text>
      <Text style={styles.title}>Become a delivery partner</Text>
      <Text style={styles.subtitle}>
        Submit your details for approval. Approved partners can go available and
        receive nearby requests.
      </Text>
      <Field
        label="Vehicle type"
        value={vehicleType}
        onChangeText={setVehicleType}
        styles={styles}
      />
      <Field
        label="Vehicle number"
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
        styles={styles}
      />
      <Field
        label="Address"
        value={address}
        onChangeText={setAddress}
        styles={styles}
      />
      <Pressable onPress={submit} disabled={submitting} style={styles.button}>
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, styles }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: isDark ? '#070707' : '#F5F8F7' },
    content: { padding: 20, gap: 14 },
    eyebrow: {
      color: CustomerColors.primary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    title: {
      color: isDark ? '#F9FAFB' : '#111827',
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: { color: isDark ? '#9CA3AF' : '#6B7280', lineHeight: 20 },
    field: { gap: 6 },
    label: {
      color: isDark ? '#E5E7EB' : '#374151',
      fontSize: 13,
      fontWeight: '700',
    },
    input: {
      backgroundColor: isDark ? '#18181B' : '#fff',
      color: isDark ? '#F9FAFB' : '#111827',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#27272A' : '#D1D5DB',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    button: {
      backgroundColor: CustomerColors.primary,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      marginTop: 6,
      shadowColor: CustomerColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: { color: '#fff', fontWeight: '800' },
  });
