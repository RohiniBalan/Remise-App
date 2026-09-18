import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AddressData } from '../../api/paymentApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { LocationSelectField, lookupPincode } from './LocationSelectField';
import { indianStates, getCities } from '../../utils/indiaLocation';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

export default function AddressFormFields({ data, onChange }: Props) {
  const { isDark } = useTheme();

  // Build state options
  const stateOptions = useMemo(
    () => indianStates.map(s => ({ key: s.isoCode, label: s.name })),
    [],
  );

  // Find currently selected state's isoCode
  const selectedStateObj = useMemo(
    () => indianStates.find(s => s.name.toLowerCase() === (data.state || '').toLowerCase() || s.isoCode === data.state),
    [data.state],
  );

  // Build city options for the selected state
  const cityOptions = useMemo(() => {
    if (!selectedStateObj) return [];
    return getCities(selectedStateObj.isoCode).map(c => ({
      key: c.name,
      label: c.name,
    }));
  }, [selectedStateObj]);

  const handleStateSelect = (isoCode: string, stateName: string) => {
    onChange('state', stateName);
    onChange('city', '');
  };

  const handleCitySelect = async (_key: string, cityName: string) => {
    onChange('city', cityName);
    // Auto lookup pincode
    const pin = await lookupPincode(cityName);
    if (pin) {
      onChange('pinCode', pin);
    }
  };

  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View style={{ gap: Spacing.md }}>
      {/* Country (Fixed India) */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Country / Region</Text>
        <View style={[styles.input, styles.disabledInput, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]}>
          <Text style={[styles.disabledText, isDark && { color: '#9CA3AF' }]}>India</Text>
        </View>
      </View>

      {/* Name row */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>First Name *</Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.firstName}
            onChangeText={v => onChange('firstName', v)}
            placeholder="First name"
            placeholderTextColor={placeholderColor}
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Last Name</Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.lastName}
            onChangeText={v => onChange('lastName', v)}
            placeholder="Last name"
            placeholderTextColor={placeholderColor}
          />
        </View>
      </View>

      {/* Street Address */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Street Address *</Text>
        <TextInput
          style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
          value={data.address}
          onChangeText={v => onChange('address', v)}
          placeholder="House/Flat No., Building, Street Area"
          placeholderTextColor={placeholderColor}
        />
      </View>

      {/* Apartment / Landmark */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Apartment, Suite, Landmark (Optional)</Text>
        <TextInput
          style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
          value={data.apartment}
          onChangeText={v => onChange('apartment', v)}
          placeholder="e.g. Near City Center / 2nd Floor"
          placeholderTextColor={placeholderColor}
        />
      </View>

      {/* State & City Dropdowns */}
      <View style={styles.row}>
        <View style={styles.half}>
          <LocationSelectField
            label="State *"
            value={data.state || ''}
            placeholder="Select State"
            options={stateOptions}
            onSelect={handleStateSelect}
          />
        </View>
        <View style={styles.half}>
          <LocationSelectField
            label="City *"
            value={data.city || ''}
            placeholder={selectedStateObj ? 'Select City' : 'Select state first'}
            options={cityOptions}
            disabled={!selectedStateObj}
            onSelect={handleCitySelect}
          />
        </View>
      </View>

      {/* PIN Code & Phone row */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>PIN Code *</Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.pinCode}
            onChangeText={v => onChange('pinCode', v)}
            placeholder="PIN code"
            placeholderTextColor={placeholderColor}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Phone *</Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.phone}
            onChangeText={v => {
              const numeric = v.replace(/\D/g, '').slice(0, 10);
              onChange('phone', numeric);
            }}
            placeholder="10-digit mobile"
            placeholderTextColor={placeholderColor}
            keyboardType="number-pad"
            maxLength={10}
          />
          {data.phone && data.phone.length < 10 ? (
            <Text style={{ fontSize: 10, color: '#EF4444', marginTop: 2 }}>
              Must be 10 digits ({data.phone.length}/10)
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  disabledText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
