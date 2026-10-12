import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AddressData } from '../../api/paymentApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { LocationSelectField, lookupPincode } from './LocationSelectField';
import { indianStates, getCities, translateState, translateCity } from '../../utils/indiaLocation';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

export default function AddressFormFields({ data, onChange }: Props) {
  const { isDark } = useTheme();
  const { language, t } = useTranslation();

  // Build state options
  const stateOptions = useMemo(
    () =>
      indianStates.map(s => ({
        key: s.isoCode,
        canonicalName: s.name,
        label: translateState(s.name, language),
      })),
    [language],
  );

  // Find currently selected state's isoCode
  const selectedStateObj = useMemo(
    () =>
      indianStates.find(
        s =>
          s.name.toLowerCase() === (data.state || '').toLowerCase() ||
          s.isoCode.toLowerCase() === (data.state || '').toLowerCase(),
      ),
    [data.state],
  );

  // Build city options for the selected state
  const cityOptions = useMemo(() => {
    if (!selectedStateObj) return [];
    return getCities(selectedStateObj.isoCode).map(c => ({
      key: c.name,
      canonicalName: c.name,
      label: translateCity(c.name, language),
    }));
  }, [selectedStateObj, language]);

  const handleStateSelect = (isoCode: string, _stateName: string) => {
    const matched = indianStates.find(s => s.isoCode === isoCode);
    const canonicalName = matched ? matched.name : isoCode;
    onChange('state', canonicalName);
    onChange('city', '');
    onChange('pinCode', '');
  };

  const handleCitySelect = async (key: string, label: string) => {
    const canonicalCity = key || label;
    onChange('city', canonicalCity);
    // Auto lookup pincode
    const pin = await lookupPincode(canonicalCity);
    if (pin) {
      onChange('pinCode', pin);
    }
  };

  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View style={{ gap: Spacing.md }}>
      {/* Country (Fixed India) */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
          {t('checkout.countryRegion') || 'Country / Region'}
        </Text>
        <View style={[styles.input, styles.disabledInput, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]}>
          <Text style={[styles.disabledText, isDark && { color: '#9CA3AF' }]}>
            {t('checkout.india') || 'India'}
          </Text>
        </View>
      </View>

      {/* Name row */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
            {t('checkout.firstNameLabel') || 'First Name *'}
          </Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.firstName}
            onChangeText={v => onChange('firstName', v)}
            placeholder={t('checkout.firstNamePlaceholder') || 'First name'}
            placeholderTextColor={placeholderColor}
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
            {t('checkout.lastNameLabel') || 'Last Name'}
          </Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.lastName}
            onChangeText={v => onChange('lastName', v)}
            placeholder={t('checkout.lastNamePlaceholder') || 'Last name'}
            placeholderTextColor={placeholderColor}
          />
        </View>
      </View>

      {/* Street Address */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
          {t('checkout.streetAddressLabel') || 'Street Address *'}
        </Text>
        <TextInput
          style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
          value={data.address}
          onChangeText={v => onChange('address', v)}
          placeholder={t('checkout.streetAddressPlaceholder') || 'House/Flat No., Building, Street Area'}
          placeholderTextColor={placeholderColor}
        />
      </View>

      {/* Apartment / Landmark */}
      <View>
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
          {t('checkout.apartmentLabel') || 'Apartment, Suite, Landmark (Optional)'}
        </Text>
        <TextInput
          style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
          value={data.apartment}
          onChangeText={v => onChange('apartment', v)}
          placeholder={t('checkout.apartmentPlaceholder') || 'e.g. Near City Center / 2nd Floor'}
          placeholderTextColor={placeholderColor}
        />
      </View>

      {/* State & City Dropdowns */}
      <View style={styles.row}>
        <View style={styles.half}>
          <LocationSelectField
            label={t('checkout.stateLabel') || 'State *'}
            value={data.state || ''}
            placeholder={t('checkout.selectState') || 'Select State'}
            options={stateOptions}
            onSelect={handleStateSelect}
          />
        </View>
        <View style={styles.half}>
          <LocationSelectField
            label={t('checkout.cityLabel') || 'City *'}
            value={data.city || ''}
            placeholder={selectedStateObj ? (t('checkout.selectCity') || 'Select City') : (t('checkout.selectState') || 'Select state first')}
            options={cityOptions}
            disabled={!selectedStateObj}
            onSelect={handleCitySelect}
          />
        </View>
      </View>

      {/* PIN Code & Phone row */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
            {t('checkout.pincodeLabel') || 'PIN Code *'}
          </Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.pinCode}
            onChangeText={v => onChange('pinCode', v)}
            placeholder={t('checkout.pincodePlaceholder') || 'PIN code'}
            placeholderTextColor={placeholderColor}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>
            {t('checkout.phoneLabel') || 'Phone *'}
          </Text>
          <TextInput
            style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
            value={data.phone}
            onChangeText={v => {
              const numeric = v.replace(/\D/g, '').slice(0, 10);
              onChange('phone', numeric);
            }}
            placeholder={t('checkout.phonePlaceholder') || '10-digit mobile'}
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
