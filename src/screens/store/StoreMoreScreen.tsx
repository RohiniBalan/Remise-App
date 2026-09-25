import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layers, Truck, Users, Settings as SettingsIcon, ChevronRight, LucideIcon, Tag } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

type MoreItem = {
  key: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  route: string;
};

const ITEMS: MoreItem[] = [
  { key: 'offers', label: 'My Offers', subtitle: 'View private offers & special discounts for your store', icon: Tag, route: 'MyOffers' },
  { key: 'deliveries', label: 'Deliveries Log', subtitle: 'See who delivered products to whom', icon: Truck, route: 'StoreDeliveries' },
  { key: 'categories', label: 'Categories', subtitle: 'Manage product categories', icon: Layers, route: 'StoreOwnerCategories' },
  { key: 'suppliers', label: 'Order Stock', subtitle: 'Browse suppliers & place stock orders', icon: Truck, route: 'Suppliers' },
  { key: 'customers', label: 'Customers', subtitle: 'View your customer list', icon: Users, route: 'StoreOwnerCustomers' },
  { key: 'settings', label: 'Settings', subtitle: 'Store details, target revenue & more', icon: SettingsIcon, route: 'StoreSettings' },
];

export default function StoreMoreScreen() {
  const navigation = useNavigation<any>();
  const { store } = useStoreDashboard();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md }}>
      <Text style={styles.header}>{store?.name || 'My Store'}</Text>
      <View style={styles.card}>
        {ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, idx === ITEMS.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.6}
          >
            <View style={styles.rowIcon}>
              <item.icon size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={18} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    header: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      overflow: 'hidden',
      ...Shadows.card,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? '#1F2937' : '#F0FDFA', alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
    rowSubtitle: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
  });