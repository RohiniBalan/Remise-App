import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Layers, Plus, Trash2 } from 'lucide-react-native';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { mergeCategories } from '../../utils/storeCategories';

export default function SellerCategoriesScreen() {
  const { categories, products, loading, refresh } = useSellerDashboard();
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
    Alert.alert(`Delete category "${catName}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await storeProductApi.deleteCategory(id); refresh(); } catch { Alert.alert('Error', 'Failed to delete category.'); }
      } },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={CustomerColors.teal700} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>Add New Category</Text>
        <View style={styles.addRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={name} onChangeText={setName} placeholder="e.g. Skincare" />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={saving || !name.trim()}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Plus size={15} color="#fff" />}
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <Text style={styles.listHeader}>ALL CATEGORIES ({mergedCategories.length})</Text>

      <FlatList
        data={mergedCategories}
        keyExtractor={c => c._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No categories yet. Add one above.</Text>}
        renderItem={({ item: c }) => {
          const count = countByCategory[c.name] || 0;
          return (
            <View style={styles.row}>
              <View style={styles.rowIcon}><Layers size={14} color={CustomerColors.teal600} /></View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowNameRow}>
                  <Text style={styles.rowName}>{c.name}</Text>
                  {c.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{count} product{count !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              {!c.isDefault && (
                <TouchableOpacity onPress={() => handleDelete(c._id, c.name)}>
                  <Trash2 size={14} color={CustomerColors.primary} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  addForm: { backgroundColor: CustomerColors.white, margin: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  formTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.md },
  addRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  addBtn: { width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md },
  errorText: { color: CustomerColors.primary, fontSize: FontSizes.xs, marginTop: Spacing.sm },
  listHeader: { fontSize: FontSizes.xs, fontWeight: '800', color: CustomerColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: Spacing.md, marginBottom: Spacing.xs },
  list: { paddingHorizontal: Spacing.md },
  emptyText: { textAlign: 'center', color: CustomerColors.textSecondary, paddingVertical: Spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: '#F5F5F5', padding: Spacing.md, marginBottom: Spacing.xs },
  rowIcon: { width: 28, height: 28, borderRadius: BorderRadius.sm, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center' },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowName: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  defaultBadge: { backgroundColor: '#F5F5F5', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  defaultBadgeText: { fontSize: 9, fontWeight: '700', color: CustomerColors.textSecondary },
  countBadge: { alignSelf: 'flex-start', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, marginTop: 2 },
  countBadgeText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
})