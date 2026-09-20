import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttonText?: string;
  onPressButton?: () => void;
  onClose?: () => void;
}

export default function SuccessModal({
  visible,
  title,
  message,
  buttonText,
  onPressButton,
  onClose,
}: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <CheckCircle size={48} color={CustomerColors.teal600} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {buttonText ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onPressButton || onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, minWidth: 260, maxWidth: 340, width: '90%' },
  title: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black, textAlign: 'center' },
  message: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, textAlign: 'center', marginBottom: Spacing.xs },
  actionButton: {
    backgroundColor: CustomerColors.teal600,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});