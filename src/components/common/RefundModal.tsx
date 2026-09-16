import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CustomerColors,
  BorderRadius,
  FontSizes,
  Spacing,
} from '../../styles/theme';

interface RefundModalProps {
  visible: boolean;
  totalAmount: number;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => void;
}

export default function RefundModal({
  visible,
  totalAmount,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: RefundModalProps) {
  const [amount, setAmount] = useState(totalAmount.toFixed(2));
  const [note, setNote] = useState('Customer requested refund');
  const numericAmount = Number(amount);
  const amountError =
    !Number.isFinite(numericAmount) || numericAmount <= 0
      ? 'Enter an amount greater than zero.'
      : numericAmount > totalAmount
      ? `The refund cannot exceed Rs ${totalAmount.toLocaleString()}.`
      : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View>
            <Text style={styles.title}>Request Razorpay refund</Text>
            <Text style={styles.subtitle}>
              Normal refunds usually reach the original payment method within
              5-7 working days.
            </Text>
          </View>

          <Text style={styles.label}>Amount (Rs)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.input}
          />
          <Text style={styles.hint}>
            Paid amount available: Rs {totalAmount.toLocaleString()}
          </Text>

          <Text style={styles.label}>Reason</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            maxLength={200}
            multiline
            style={[styles.input, styles.noteInput]}
          />

          {amountError || error ? (
            <Text style={styles.error}>{amountError || error}</Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onSubmit(Math.round(numericAmount * 100) / 100, note.trim())
              }
              disabled={!!amountError || isSubmitting}
              style={[
                styles.submitButton,
                (!!amountError || isSubmitting) && styles.disabledButton,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={CustomerColors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>Start refund</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  title: {
    color: CustomerColors.black,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    lineHeight: 17,
    marginTop: Spacing.xs,
  },
  label: {
    color: CustomerColors.black,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: CustomerColors.border,
    borderRadius: BorderRadius.sm,
    color: CustomerColors.black,
    fontSize: FontSizes.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  hint: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  error: {
    color: CustomerColors.danger,
    fontSize: FontSizes.xs,
    marginTop: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: CustomerColors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelText: { color: CustomerColors.black, fontSize: FontSizes.sm },
  submitButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.sm,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  submitText: {
    color: CustomerColors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  disabledButton: { opacity: 0.5 },
});
