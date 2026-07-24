import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function AdminField({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm, color: AdminColors.textPrimary },
});
