import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCircle, AlertTriangle, X } from 'lucide-react-native';
import {
  BorderRadius,
  CustomerColors,
  FontSizes,
  Spacing,
} from '../../styles/theme';

export function isPendingCodOrder(order: any): boolean {
  if (!order) return false;

  const paymentStatus = (order.paymentStatus || '').toUpperCase().trim();
  if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
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

  const isCodOrCash =
    method === 'cod' || method === 'cash' || method === 'cash on delivery';
  if (!isCodOrCash) {
    return false;
  }

  const codStatus = (order.codDetails?.status || '').toLowerCase().trim();
  if (codStatus === 'collected' || order.codDetails?.isCollected === true) {
    return false;
  }

  return true;
}

interface CodCancelConfirmModalProps {
  visible: boolean;
  order: any;
  isCancelling: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDark?: boolean;
}

export function CodCancelConfirmModal({
  visible,
  order,
  isCancelling,
  error,
  onClose,
  onConfirm,
  isDark = false,
}: CodCancelConfirmModalProps) {
  if (!visible || !order) return null;

  const orderDisplayId = order?.orderId || order?._id ? `#${(order?.orderId || order?._id).slice(-8)}` : '';
  const totalAmount = Number(order?.totalAmount || 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isCancelling) onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, isDark && styles.dialogDark]}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <AlertTriangle size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, isDark && styles.textWhite]}>
                Cancel Order {orderDisplayId}
              </Text>
              <Text style={[styles.subTitle, isDark && styles.textMuted]}>
                Cash on Delivery • ₹{totalAmount.toLocaleString()}
              </Text>
            </View>
            {!isCancelling && (
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            <Text style={[styles.messageText, isDark && styles.textWhite]}>
              Are you sure you want to cancel this order?
            </Text>
            <Text style={[styles.descText, isDark && styles.textMuted]}>
              This will cancel the order immediately. Your reserved items will be released back to the store.
            </Text>

            {Boolean(error) && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.keepBtn, isDark && styles.keepBtnDark]}
              onPress={onClose}
              disabled={isCancelling}
            >
              <Text style={[styles.keepBtnText, isDark && styles.textWhite]}>
                Keep Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, isCancelling && styles.disabledBtn]}
              onPress={onConfirm}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface DeliveryNotPendingModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  isDark?: boolean;
}

export function DeliveryNotPendingModal({
  visible,
  message,
  onClose,
  isDark = false,
}: DeliveryNotPendingModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, isDark && styles.dialogDark]}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <AlertCircle size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, isDark && styles.textWhite]}>
                Cannot Cancel Order
              </Text>
              <Text style={[styles.subTitle, isDark && styles.textMuted]}>
                Order Status Notice
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.messageText, isDark && styles.textWhite]}>
              {message}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.understoodBtn]}
              onPress={onClose}
            >
              <Text style={styles.understoodBtnText}>Understood</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg || 16,
    padding: Spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  dialogDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  subTitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#94A3B8',
  },
  content: {
    paddingVertical: Spacing.md,
  },
  messageText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
  },
  descText: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorText: {
    color: '#DC2626',
    fontSize: FontSizes.xs,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  keepBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  keepBtnDark: {
    borderColor: '#475569',
  },
  keepBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#374151',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  cancelBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  understoodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.sm,
    backgroundColor: CustomerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  understoodBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
