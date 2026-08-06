import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layers, Truck, Users, Settings as SettingsIcon, ChevronRight, LucideIcon } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Holds the tabs that used to live on the bottom bar directly. With 9 tabs
// crammed into one row the labels were getting truncated ("Cate...",
// "Orde...") and the icons had almost no breathing room. Keeping the 5
// highest-traffic tabs (Overview, Analytics, Products, Orders, Offers) on
// the bar and moving the rest here — same screens, same route names, just
// reached via this menu instead of a tab — mirrors the pattern most
// shopping/seller apps use once they outgrow ~5 tabs.

type MoreItem = {
  key: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  route: string;
};

const ITEMS: MoreItem[] = [
  { key: 'categories', label: 'Categories', subtitle: 'Manage product categories', icon: Layers, route: 'StoreOwnerCategories' },
  { key: 'suppliers', label: 'Order Stock', subtitle: 'Browse suppliers & place stock orders', icon: Truck, route: 'Suppliers' },
  { key: 'customers', label: 'Customers', subtitle: 'View your customer list', icon: Users, route: 'StoreOwnerCustomers' },
  { key: 'settings', label: 'Settings', subtitle: 'Store details, target revenue & more', icon: SettingsIcon, route: 'StoreSettings' },
];

export default function StoreMoreScreen() {
  const navigation = useNavigation<any>();
  const { store } = useStoreDashboard();

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
              <item.icon size={18} color={CustomerColors.teal700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={18} color={CustomerColors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, overflow: 'hidden', ...Shadows.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  rowSubtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
});