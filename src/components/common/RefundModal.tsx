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
  AlertCircle,
  Banknote,
  Clock,
  MapPin,
  Store,
  X,
} from 'lucide-react-native';
import {
  CustomerColors,
  BorderRadius,
  FontSizes,
  Spacing,
} from '../../styles/theme';

export function isCashPaidOrder(order: any): boolean {
  if (!order) return false;

  const paymentStatus = (order.paymentStatus || '').toUpperCase().trim();
  if (paymentStatus !== 'SUCCESS' && paymentStatus !== 'PAID') {
    return false;
  }

  const hasOnlinePaymentIdentifiers = Boolean(
    order.razorpayPaymentId ||
    order.razorpayOrderId ||
    order.cashfreeOrderId ||
    order.paymentId ||
    order.onlineTransactionId ||
    (order.paymentLinkDetails && order.paymentLinkDetails.status === 'paid')
  );
  if (hasOnlinePaymentIdentifiers) {
    return false;
  }

  const method = (order.paymentMethod || '').toLowerCase().trim();
  const onlineMethods = [
    'razorpay',
    'qr',
    'phonepe',
    'cashfree',
    'online',
    'card',
    'upi',
    'netbanking',
    'wallet',
  ];
  if (onlineMethods.includes(method)) {
    return false;
  }

  const isCodOrCash = method === 'cod' || method === 'cash' || method === 'cash on delivery';
  if (!isCodOrCash) {
    return false;
  }

  const codStatus = (order.codDetails?.status || '').toLowerCase().trim();
  const hasCashCollectedFields =
    codStatus === 'collected' ||
    Boolean(order.codDetails?.collectedAt) ||
    order.codDetails?.isCollected === true ||
    Number(order.codDetails?.collectedAmount) > 0 ||
    order.paymentPreference === 'CASH';

  return hasCashCollectedFields;
}

export function isRefundPeriodExpired(order: any, error?: string): boolean {
  if (error && typeof error === 'string') {
    const errLower = error.toLowerCase();
    if (
      errLower.includes('refund period for this order has expired') ||
      errLower.includes('refund_window_expired') ||
      errLower.includes('refund window ended')
    ) {
      return true;
    }
  }

  if (!order) return false;

  const paymentStatus = (order.paymentStatus || '').toUpperCase().trim();
  if (paymentStatus !== 'SUCCESS' && paymentStatus !== 'PAID' && paymentStatus !== 'REFUNDED') {
    return false;
  }

  if (paymentStatus === 'REFUNDED' || order.refundStatus === 'refunded') {
    return false;
  }

  const now = Date.now();

  if (order.refundWindowEndAt) {
    const expiry = new Date(order.refundWindowEndAt).getTime();
    if (!isNaN(expiry) && now >= expiry) {
      return true;
    }
  }

  if (order.paymentCapturedAt) {
    const captured = new Date(order.paymentCapturedAt).getTime();
    if (!isNaN(captured)) {
      const expiry = captured + 5 * 24 * 60 * 60 * 1000;
      if (now >= expiry) {
        return true;
      }
    }
  }

  return false;
}

interface RefundModalProps {
  visible: boolean;
  order?: any;
  totalAmount: number;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => void;
}

export default function RefundModal({
  visible,
  order,
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
      ? `The refund cannot exceed the available balance of Rs ${totalAmount.toLocaleString()}.`
      : '';

  const isExpired = isRefundPeriodExpired(order, error);
  const isCashPaid = isCashPaidOrder(order);

  if (isExpired) {
    const storeName = order?.store?.name || order?.storeName || 'the store where you purchased the products';
    const storeAddress = order?.store?.address || order?.storeAddress || '';
    const orderDisplayId = order?.orderId || order?._id ? `#${(order?.orderId || order?._id).slice(-8)}` : '';

    const expiredMessage = isCashPaid
      ? 'The refund period for this order has expired. You paid for this order by cash. If you wish to cancel or return the order and request your refund, please visit the store where you purchased the products with your item. The store can assist you with the return and cash refund process, subject to its applicable policy.'
      : 'The refund period for this order has expired. If you wish to cancel or return the order and receive your money back, please visit the store where you purchased the products. The store can assist you with the return and refund process, subject to its applicable policy.';

    const paymentLabel = isCashPaid
      ? 'Cash on Delivery (Paid)'
      : (order?.paymentMethod ? `${order.paymentMethod.toUpperCase()} (Online)` : 'Online Payment');

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.cashDialog}>
            {/* Header */}
            <View style={styles.cashHeader}>
              <View style={[styles.cashIconWrap, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                <Clock size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cashTitle}>Refund Period Expired</Text>
                {orderDisplayId ? (
                  <Text style={styles.cashOrderSub}>Order {orderDisplayId}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <X size={18} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Expired Notice Box */}
            <View style={styles.cashNoticeBox}>
              <View style={styles.cashNoticeRow}>
                <AlertCircle size={20} color="#D97706" style={{ marginTop: 2 }} />
                <Text style={styles.cashNoticeText}>
                  {expiredMessage}
                </Text>
              </View>
            </View>

            {/* Store Information */}
            {(storeName || storeAddress) ? (
              <View style={styles.storeCard}>
                <View style={styles.storeRow}>
                  <Store size={14} color={CustomerColors.primary} />
                  <Text style={styles.storeNameText} numberOfLines={1}>
                    Store: {storeName}
                  </Text>
                </View>
                {storeAddress ? (
                  <View style={[styles.storeRow, { marginTop: 4 }]}>
                    <MapPin size={14} color={CustomerColors.textSecondary} />
                    <Text style={styles.storeAddressText} numberOfLines={2}>
                      {storeAddress}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Payment Summary */}
            <View style={styles.paymentSummaryRow}>
              <Text style={styles.summaryLabel}>Payment Mode</Text>
              <Text style={styles.summaryValueBold}>{paymentLabel}</Text>
            </View>
            <View style={[styles.paymentSummaryRow, { marginTop: 6 }]}>
              <Text style={styles.summaryLabel}>Amount Paid</Text>
              <Text style={styles.summaryAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              style={styles.cashDismissButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cashDismissText}>OK, Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (isCashPaid) {
    const storeName = order?.store?.name || order?.storeName || 'the store where you purchased it';
    const storeAddress = order?.store?.address || order?.storeAddress || '';
    const orderDisplayId = order?.orderId || order?._id ? `#${(order?.orderId || order?._id).slice(-8)}` : '';

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.cashDialog}>
            {/* Header */}
            <View style={styles.cashHeader}>
              <View style={styles.cashIconWrap}>
                <Store size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cashTitle}>Store Return & Refund</Text>
                {orderDisplayId ? (
                  <Text style={styles.cashOrderSub}>Order {orderDisplayId}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <X size={18} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Cash Instruction Notice Box */}
            <View style={styles.cashNoticeBox}>
              <View style={styles.cashNoticeRow}>
                <Banknote size={20} color="#D97706" style={{ marginTop: 2 }} />
                <Text style={styles.cashNoticeText}>
                  You paid for this order by cash. To return the product and receive your refund, please visit the store where you purchased it. Bring the product with you so the store can process your return and refund.
                </Text>
              </View>
            </View>

            {/* Store Information */}
            {(storeName || storeAddress) ? (
              <View style={styles.storeCard}>
                <View style={styles.storeRow}>
                  <Store size={14} color={CustomerColors.primary} />
                  <Text style={styles.storeNameText} numberOfLines={1}>
                    Store: {storeName}
                  </Text>
                </View>
                {storeAddress ? (
                  <View style={[styles.storeRow, { marginTop: 4 }]}>
                    <MapPin size={14} color={CustomerColors.textSecondary} />
                    <Text style={styles.storeAddressText} numberOfLines={2}>
                      {storeAddress}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Payment Summary */}
            <View style={styles.paymentSummaryRow}>
              <Text style={styles.summaryLabel}>Payment Mode</Text>
              <Text style={styles.summaryValueBold}>Cash on Delivery (Paid)</Text>
            </View>
            <View style={[styles.paymentSummaryRow, { marginTop: 6 }]}>
              <Text style={styles.summaryLabel}>Amount Paid</Text>
              <Text style={styles.summaryAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              style={styles.cashDismissButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cashDismissText}>OK, Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

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
              Razorpay Route processes the refund to the customer's original payment method and adjusts vendor transfers accordingly.
            </Text>
          </View>

          <Text style={styles.label}>Amount (Rs)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            editable={!isSubmitting}
            style={styles.input}
          />
          <Text style={styles.hint}>
            Refundable balance available: Rs {totalAmount.toLocaleString()}
          </Text>

          <Text style={styles.label}>Reason</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            maxLength={200}
            multiline
            editable={!isSubmitting}
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
  cashDialog: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg || 16,
    padding: Spacing.lg,
  },
  cashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: Spacing.md,
  },
  cashIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashTitle: {
    color: CustomerColors.black,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  cashOrderSub: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  cashNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  cashNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cashNoticeText: {
    flex: 1,
    color: '#78350F',
    fontSize: FontSizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  storeCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    marginTop: Spacing.md,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeNameText: {
    flex: 1,
    fontSize: FontSizes.xs + 1,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  storeAddressText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    lineHeight: 16,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  summaryValueBold: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  summaryAmount: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  cashDismissButton: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  cashDismissText: {
    color: CustomerColors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});

