import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Check, X, Globe } from 'lucide-react-native';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from '../../i18n';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function LanguageSelectorModal({
  visible,
  onClose,
  isDark,
}: LanguageSelectorModalProps) {
  const { language, setLanguage, t } = useTranslation();

  const handleSelect = async (code: LanguageCode) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1e293b' : '#FFFFFF' },
          ]}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Globe size={20} color={CustomerColors.primary} />
              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#FFFFFF' : CustomerColors.black },
                ]}
              >
                {t('common.selectLanguage')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' },
              ]}
              accessibilityLabel="Close language selector"
            >
              <X size={18} color={isDark ? '#FFFFFF' : '#4B5563'} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {SUPPORTED_LANGUAGES.map(item => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langItem,
                    {
                      borderColor: isSelected
                        ? CustomerColors.primary
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.15)'
                          : '#FEF2F2'
                        : isDark
                        ? '#0f172a'
                        : '#F8FAFC',
                    },
                  ]}
                  onPress={() => handleSelect(item.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langInfo}>
                    <Text
                      style={[
                        styles.nativeName,
                        {
                          color: isSelected
                            ? CustomerColors.primary
                            : isDark
                            ? '#FFFFFF'
                            : '#0F172A',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {item.nativeLabel}
                    </Text>
                    <Text
                      style={[
                        styles.englishName,
                        { color: isDark ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkWrap}>
                      <Check size={18} color={CustomerColors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: 8,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  langInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nativeName: {
    fontSize: 16,
  },
  englishName: {
    fontSize: 13,
  },
  checkWrap: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
