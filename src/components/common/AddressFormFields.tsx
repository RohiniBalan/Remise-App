import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AddressData } from '../../api/paymentApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Shared shipping/billing address fields — same field set as web's
// AddressForm in checkout/page.tsx (country fixed to India, state limited
// to the same 4-option list). Used twice on CheckoutScreen (shipping +
// optional separate billing), same as web.
const STATES = ['Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra'];

interface Props {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

export default function AddressFormFields({ data, onChange }: Props) {
  return (
    <View style={{ gap: Spacing.md }}>
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} value={data.firstName} onChangeText={v => onChange('firstName', v)} placeholder="First name *" />
        <TextInput style={[styles.input, styles.half]} value={data.lastName} onChangeText={v => onChange('lastName', v)} placeholder="Last name *" />
      </View>
      <TextInput style={styles.input} value={data.address} onChangeText={v => onChange('address', v)} placeholder="Address *" />
      <TextInput style={styles.input} value={data.apartment} onChangeText={v => onChange('apartment', v)} placeholder="Apartment, suite, etc. (optional)" />
      <TextInput style={styles.input} value={data.city} onChangeText={v => onChange('city', v)} placeholder="City *" />
      <View style={styles.stateRow}>
        {STATES.map(s => (
          <TouchableOpacity key={s} style={[styles.stateChip, data.state === s && styles.stateChipActive]} onPress={() => onChange('state', s)}>
            <Text style={[styles.stateChipText, data.state === s && styles.stateChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.input} value={data.pinCode} onChangeText={v => onChange('pinCode', v)} placeholder="PIN code *" keyboardType="number-pad" />
      <TextInput style={styles.input} value={data.phone} onChangeText={v => onChange('phone', v)} placeholder="Phone *" keyboardType="phone-pad" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base },
  stateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  stateChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  stateChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  stateChipText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  stateChipTextActive: { color: CustomerColors.white },
});
