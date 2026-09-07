import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing } from '../../styles/theme';

export default function BrandHeader() {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();

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
      <Text style={styles.logo}>
        <Text style={styles.logoRed}>RE</Text>
        <Text style={{ color: isDark ? '#FFFFFF' : CustomerColors.black }}>mise</Text>
      </Text>

      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.themeToggleBtn,
          { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' },
        ]}
        activeOpacity={0.7}
        accessibilityLabel="Toggle Theme"
      >
        {isDark ? (
          <Sun size={18} color="#FBBF24" />
        ) : (
          <Moon size={18} color="#4B5563" />
        )}
      </TouchableOpacity>
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
  themeToggleBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

