import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Layers, Plus, Trash2 } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's CategoriesTab — same
// add-form + list-with-delete, same detailed error messages for the three
// failure modes (service unreachable / 403 role issue / generic).
export default function StoreCategoriesScreen() {
  const { categories, loading, refresh } = useStoreDashboard();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

      <FlatList
        data={categories}
        keyExtractor={c => c._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No categories yet. Add one above.</Text>}
        renderItem={({ item: c }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}><Layers size={14} color={CustomerColors.teal600} /></View>
            <Text style={styles.rowName}>{c.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(c._id, c.name)}><Trash2 size={14} color={CustomerColors.primary} /></TouchableOpacity>
          </View>
        )}
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
  list: { paddingHorizontal: Spacing.md },
  emptyText: { textAlign: 'center', color: CustomerColors.textSecondary, paddingVertical: Spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: '#F5F5F5', padding: Spacing.md, marginBottom: Spacing.xs },
  rowIcon: { width: 28, height: 28, borderRadius: BorderRadius.sm, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center' },
  rowName: { flex: 1, fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
});
