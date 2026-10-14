import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layers, Truck, Users, Settings as SettingsIcon, ChevronRight, LucideIcon, Tag, Star, CreditCard } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, getCreditTranslations, getStoreReviewsTranslations } from '../../i18n';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

type MoreItem = {
  key: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  route: string;
};

export default function StoreMoreScreen() {
  const navigation = useNavigation<any>();
  const { store } = useStoreDashboard();
  const { isDark } = useTheme();
  const { t, language } = useTranslation();
  const cr = useMemo(() => getCreditTranslations(language), [language]);
  const srt = useMemo(() => getStoreReviewsTranslations(language), [language]);
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const items: MoreItem[] = useMemo(
    () => [
      {
        key: 'reviews',
        label: srt.reviewsAndRatings,
        subtitle: srt.reviewsAndRatingsSubtitle,
        icon: Star,
        route: 'StoreReviews',
      },
      {
        key: 'credit',
        label: cr.creditManagement,
        subtitle: cr.creditManagementSubtitle,
        icon: CreditCard,
        route: 'StoreCredit',
      },
      {
        key: 'offers',
        label: t('store.moreOffersTitle'),
        subtitle: t('store.moreOffersSubtitle'),
        icon: Tag,
        route: 'MyOffers',
      },
      {
        key: 'deliveries',
        label: t('store.deliveriesLogTitle'),
        subtitle: t('store.deliveriesLogSubtitle'),
        icon: Truck,
        route: 'StoreDeliveries',
      },
      {
        key: 'categories',
        label: t('store.categoriesTitle'),
        subtitle: t('store.categoriesSubtitle'),
        icon: Layers,
        route: 'StoreOwnerCategories',
      },
      {
        key: 'suppliers',
        label: t('store.orderStockTitle'),
        subtitle: t('store.orderStockSubtitle'),
        icon: Truck,
        route: 'Suppliers',
      },
      {
        key: 'customers',
        label: t('store.customersTitle'),
        subtitle: t('store.customersSubtitle'),
        icon: Users,
        route: 'StoreOwnerCustomers',
      },
      {
        key: 'settings',
        label: t('store.settingsTitle'),
        subtitle: t('store.settingsSubtitle'),
        icon: SettingsIcon,
        route: 'StoreSettings',
      },
    ],
    [t]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md }}>
      <Text style={styles.header}>{store?.name || t('store.myStore') || 'My Store'}</Text>
      <View style={styles.card}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, idx === items.length - 1 && { borderBottomWidth: 0 }]}
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