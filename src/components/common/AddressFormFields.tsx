import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AddressData } from '../../api/paymentApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { LocationSelectField, lookupPincode } from './LocationSelectField';
import { indianStates, getCities } from '../../utils/indiaLocation';

interface Props {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

export default function AddressFormFields({ data, onChange }: Props) {
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

  return (
    <View style={{ gap: Spacing.md }}>
      {/* Country (Fixed India) */}
      <View>
        <Text style={styles.label}>Country / Region</Text>
        <View style={[styles.input, styles.disabledInput]}>
          <Text style={styles.disabledText}>India</Text>
        </View>
      </View>

      {/* Name row */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={data.firstName}
            onChangeText={v => onChange('firstName', v)}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={data.lastName}
            onChangeText={v => onChange('lastName', v)}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Street Address */}
      <View>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={data.address}
          onChangeText={v => onChange('address', v)}
          placeholder="House/Flat No., Building, Street Area"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Apartment / Landmark */}
      <View>
        <Text style={styles.label}>Apartment, Suite, Landmark (Optional)</Text>
        <TextInput
          style={styles.input}
          value={data.apartment}
          onChangeText={v => onChange('apartment', v)}
          placeholder="e.g. Near City Center / 2nd Floor"
          placeholderTextColor="#9CA3AF"
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
          <Text style={styles.label}>PIN Code *</Text>
          <TextInput
            style={styles.input}
            value={data.pinCode}
            onChangeText={v => onChange('pinCode', v)}
            placeholder="PIN code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={data.phone}
            onChangeText={v => onChange('phone', v)}
            placeholder="Phone number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
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
