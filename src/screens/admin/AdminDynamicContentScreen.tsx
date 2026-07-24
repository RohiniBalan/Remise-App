import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Layers, Plus, Trash2 } from 'lucide-react-native';
import { adminCategoryApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/dynamic-content/page.tsx — the global
// product-categories manager shared with the Product admin page (same
// GET/POST/DELETE /admin/categories calls).
export default function AdminDynamicContentScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminCategoryApi.getAll().then(res => setCategories(res.data.data || res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminCategoryApi.create(name.trim());
      setName('');
      load();
    } catch {
      Alert.alert('Error', 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, catName: string) => {
    Alert.alert(`Delete category "${catName}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminCategoryApi.delete(id); load(); } catch { Alert.alert('Error', 'Failed to delete category.'); }
      } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <TextInput style={[styles.input, { flex: 1 }]} value={name} onChangeText={setName} placeholder="New category name" />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={saving || !name.trim()}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Plus size={15} color="#fff" />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={c => c._id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.list}
        renderItem={({ item: c }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}><Layers size={16} color={AdminColors.primary} /></View>
            <Text style={styles.cardName} numberOfLines={1}>{c.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(c._id, c.name)}><Trash2 size={14} color="#DC2626" /></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  addForm: { flexDirection: 'row', gap: Spacing.sm, margin: Spacing.md },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  addBtn: { width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.primary, borderRadius: BorderRadius.md },
  list: { paddingHorizontal: Spacing.md },
  card: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  cardIcon: { width: 28, height: 28, borderRadius: BorderRadius.sm, backgroundColor: AdminColors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardName: { flex: 1, fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
});
