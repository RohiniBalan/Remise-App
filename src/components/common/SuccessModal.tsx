import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message?: string;
}

// Reusable success confirmation modal. Shows a checkmark + message,
// no buttons — intended to auto-dismiss via a timeout in the caller
// right before navigating away (see StoreRegisterScreen for the pattern).
export default function SuccessModal({ visible, title, message }: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <CheckCircle size={48} color={CustomerColors.teal600} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, minWidth: 240 },
  title: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black, textAlign: 'center' },
  message: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, textAlign: 'center' },
});