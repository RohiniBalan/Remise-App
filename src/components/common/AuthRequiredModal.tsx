import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Lock, X } from 'lucide-react-native';
import { CustomerColors, Spacing, BorderRadius, FontSizes } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

export interface AuthRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerTitle?: string;
  actionText?: string;
  icon?: React.ReactNode;
  onLogin: () => void;
}

export default function AuthRequiredModal({
  visible,
  onClose,
  title = 'Login to Continue',
  subtitle = 'Please sign in or register to continue with your purchase.',
  headerTitle = 'Login Required',
  actionText = 'Log In / Register',
  icon,
  onLogin,
}: AuthRequiredModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
          ]}
          onPress={e => e.stopPropagation?.()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <Lock size={18} color={CustomerColors.teal600} />
              <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>
                {headerTitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.authModalBody}>
            <View
              style={[
                styles.authIconCircle,
                isDark && { backgroundColor: 'rgba(15, 163, 177, 0.18)' },
              ]}
            >
              {icon || <Lock size={28} color={CustomerColors.teal600} />}
            </View>
            <Text style={[styles.authModalTitle, isDark && { color: '#FFFFFF' }]}>
              {title}
            </Text>
            <Text style={[styles.authModalSub, isDark && { color: '#9CA3AF' }]}>
              {subtitle}
            </Text>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.loginActionBtn}
            onPress={() => {
              onClose();
              onLogin();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.loginActionBtnText}>{actionText}</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.cancelBtn,
              isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, isDark && { color: '#D1D5DB' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  authModalBody: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  authIconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: CustomerColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  authModalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  authModalSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.xs,
  },
  loginActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
  },
  loginActionBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  cancelBtnText: {
    color: CustomerColors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
