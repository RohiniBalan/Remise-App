import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Sun, Moon, Bell, Globe } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { useTranslation } from '../../i18n';
import LanguageSelectorModal from './LanguageSelectorModal';
import { CustomerColors, Spacing } from '../../styles/theme';

export default function BrandHeader() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { toggleTheme, isDark } = useTheme();
  const { unreadCount } = useUnreadNotifications();
  const { currentLanguage } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + Spacing.xs,
          backgroundColor: isDark ? '#0f172a' : '#FFFFFF',
          borderBottomColor: isDark ? '#1e293b' : '#F1F5F9',
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
        accessibilityLabel="Go to Home"
      >
        <Text style={styles.logo}>
          <Text style={styles.logoRed}>RE</Text>
          <Text style={{ color: isDark ? '#FFFFFF' : CustomerColors.black }}>mise</Text>
        </Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => setLangModalVisible(true)}
          style={[
            styles.headerBtn,
            styles.langBtn,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Change Language"
        >
          <Globe size={16} color={CustomerColors.primary} />
          <Text
            style={[
              styles.langCodeText,
              { color: isDark ? '#FFFFFF' : CustomerColors.black },
            ]}
          >
            {currentLanguage.code.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.headerBtn,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Theme"
        >
          {isDark ? (
            <Sun size={18} color={CustomerColors.primary} />
          ) : (
            <Moon size={18} color="#4B5563" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={[
            styles.headerBtn,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
        >
          <Bell size={18} color={isDark ? '#FFFFFF' : '#4B5563'} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  logoRed: {
    color: CustomerColors.primary,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  langCodeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: CustomerColors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});



