import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerColors, Spacing } from '../../styles/theme';

export default function BrandHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
      <Text style={styles.logo}>
        <Text style={styles.logoRed}>RE</Text>mise
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: CustomerColors.primary,
    letterSpacing: -0.3,
  },
  logoRed: {
    color: CustomerColors.primary,
    fontWeight: '900',
  },
});
