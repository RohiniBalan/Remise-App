import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Layers, Plus, Trash2 } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { mergeCategories } from '../../utils/storeCategories';
import { useTranslation, translateCategory } from '../../i18n';

export default function StoreCategoriesScreen() {
  const { categories, products, loading, refresh } = useStoreDashboard();
  const { isDark } = useTheme();
  const { t, language } = useTranslation();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const countByCategory: Record<string, number> = (products || []).reduce(
    (acc: Record<string, number>, p: any) => {
      if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {},
  );

  const mergedCategories = mergeCategories(categories || []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await storeProductApi.createCategory(name.trim());
      setName('');
      refresh();
    } catch (err: any) {
      const status = err?.response?.status;
      if (!err.response) setError('Product service is not reachable. Make sure it is running.');
      else if (status === 403) setError(err.response.data?.message || 'Access denied. Try signing out and back in.');
      else setError(err.response.data?.message || `Failed to create category (HTTP ${status}).`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, catName: string) => {
    const title = t('store.deleteCategoryTitle');
    const msg = t('store.deleteCategoryMsg').replace('{category}', catName);
    Alert.alert(title, msg, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        try { await storeProductApi.deleteCategory(id); refresh(); } catch { Alert.alert(t('common.error'), 'Failed to delete category.'); }
      } },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>{t('store.addNewCategory')}</Text>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={name}
            onChangeText={setName}
            placeholder={t('store.categoryPlaceholder')}
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={saving || !name.trim()}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Plus size={15} color="#fff" />}
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <Text style={styles.listHeader}>{t('store.allCategoriesCount').replace('{count}', String(mergedCategories.length))}</Text>

      <FlatList
        data={mergedCategories}
        keyExtractor={c => c._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('store.noCategoriesYet')}</Text>}
        renderItem={({ item: c }) => {
          const count = countByCategory[c.name] || 0;
          return (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Layers size={15} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowName} numberOfLines={2}>
                  {translateCategory(c.name, language)}
                </Text>
                <View style={styles.badgesRow}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {count} {count === 1 ? t('store.productCountLabel') : t('store.productsCountLabel')}
                    </Text>
                  </View>
                  {c.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>{t('store.defaultBadge')}</Text>
                    </View>
                  )}
                </View>
              </View>
              {!c.isDefault && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(c._id, c.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={15} color={isDark ? '#F87171' : CustomerColors.primary} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    addForm: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      margin: Spacing.md,
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    formTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, marginBottom: Spacing.md },
    addRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    input: {
      backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      minHeight: 46,
      paddingVertical: 0,
      textAlignVertical: 'center',
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    addBtn: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CustomerColors.primary,
      borderRadius: BorderRadius.md,
    },
    errorText: { color: isDark ? '#F87171' : CustomerColors.primary, fontSize: FontSizes.xs, marginTop: Spacing.sm },
    listHeader: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.xs,
      marginTop: Spacing.xs,
    },
    list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
    emptyText: { textAlign: 'center', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, paddingVertical: Spacing.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#F1F5F9',
      paddingHorizontal: Spacing.md,
      paddingVertical: 12,
      marginBottom: Spacing.sm,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowContent: {
      flex: 1,
      minWidth: 0,
    },
    rowName: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      lineHeight: 18,
    },
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 4,
    },
    defaultBadge: {
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    countBadge: {
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : CustomerColors.steelBorder,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    countBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    deleteBtn: {
      padding: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
  });