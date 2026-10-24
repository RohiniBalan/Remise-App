import React, { useRef, useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Phone } from 'lucide-react-native';
import { numberMaskingApi } from '../../api/numberMaskingApi';

interface Props {
  orderId: string;
  label: string;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

/**
 * Starts a privacy-preserving masked call. The backend resolves both phone
 * numbers; the app never sees or sends them.
 */
export default function MaskedCallButton({ orderId, label, style, color = '#0F766E' }: Props) {
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);

  const onPress = async () => {
    if (busy.current || !orderId) return;
    busy.current = true;
    setLoading(true);
    try {
      const res = await numberMaskingApi.initiateCall(orderId);
      Alert.alert('Call started', res.data?.message || 'You will receive a call shortly. Please answer to be connected.');
    } catch (err: any) {
      Alert.alert('Call failed', err?.response?.data?.message || 'Could not start the call. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => { busy.current = false; }, 3000);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, { borderColor: color }, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator size="small" color={color} /> : <Phone size={12} color={color} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
