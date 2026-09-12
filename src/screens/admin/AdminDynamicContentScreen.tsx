import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Layers, Plus, Trash2, Search, Lock, Tag, ShieldCheck } from 'lucide-react-native';
import { adminCategoryApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export const DEFAULT_STORE_CATEGORIES = [
  'Food & Beverages',
  'Grocery',
  'Fashion',
  'Electronics',
  'Pharmacy',
  'Toys',
  'Home & Living',
  'Beauty',
  'Sports',
  'Household Items',
  'Flowers',
  'Fruits',
  'Vegetables',
  'Stationery',
  'Other',
];

export type MergedCategory = {
  _id: string;
  name: string;
  isDefault: boolean;
};

export default function AdminDynamicContentScreen() {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DEFAULT' | 'CUSTOM'>('ALL');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminCategoryApi
      .getAll()
      .then(res => setCategories(res.data.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const mergedCategories: MergedCategory[] = useMemo(() => {
    const customNames = new Set((categories || []).map(c => c.name.trim().toLowerCase()));

    const defaults: MergedCategory[] = DEFAULT_STORE_CATEGORIES
      .filter(n => !customNames.has(n.trim().toLowerCase()))
      .map(n => ({ _id: `default-${n}`, name: n, isDefault: true }));

    const custom: MergedCategory[] = (categories || []).map(c => ({
      _id: c._id,
      name: c.name,
      isDefault: false,
    }));

    return [...defaults, ...custom];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return mergedCategories.filter(cat => {
      const matches = cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!matches) return false;

      if (activeFilter === 'DEFAULT') return cat.isDefault;
      if (activeFilter === 'CUSTOM') return !cat.isDefault;
      return true;
    });
  }, [mergedCategories, searchQuery, activeFilter]);

  const defaultCount = useMemo(() => mergedCategories.filter(c => c.isDefault).length, [mergedCategories]);
  const customCount = useMemo(() => mergedCategories.filter(c => !c.isDefault).length, [mergedCategories]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check if category already exists in default or custom
    const exists = mergedCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Duplicate Category', `"${trimmed}" already exists.`);
      return;
    }

    setSaving(true);
    try {
      await adminCategoryApi.create(trimmed);
      setName('');
      load();
    } catch {
      Alert.alert('Error', 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, catName: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Protected', 'System default categories cannot be deleted.');
      return;
    }
    Alert.alert(`Delete category "${catName}"?`, 'This will remove the category from the catalog.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminCategoryApi.delete(id);
            load();
          } catch {
            Alert.alert('Error', 'Failed to delete category.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AdminColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Form */}
      <View style={styles.addCard}>
        <Text style={styles.sectionTitle}>Add New Category</Text>
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Pet Supplies, Books..."
            placeholderTextColor={AdminColors.textMuted}
          />
          <TouchableOpacity
            style={[styles.addBtn, (!name.trim() || saving) && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={saving || !name.trim()}
          >
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Plus size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.controlsSection}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color={AdminColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={AdminColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
              All ({mergedCategories.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'DEFAULT' && styles.filterChipActive]}
            onPress={() => setActiveFilter('DEFAULT')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'DEFAULT' && styles.filterChipTextActive]}>
              Default ({defaultCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'CUSTOM' && styles.filterChipActive]}
            onPress={() => setActiveFilter('CUSTOM')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'CUSTOM' && styles.filterChipTextActive]}>
              Custom ({customCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={filteredCategories}
        keyExtractor={c => c._id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Layers size={36} color={AdminColors.textMuted} />
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
        renderItem={({ item: c }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, c.isDefault ? styles.cardIconDefault : styles.cardIconCustom]}>
                <Layers size={16} color={AdminColors.primary} />
              </View>
              {c.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Lock size={10} color="#64748b" />
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              ) : (
                <View style={styles.customBadge}>
                  <Tag size={10} color={AdminColors.primary} />
                  <Text style={styles.customBadgeText}>Custom</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardName} numberOfLines={2}>
              {c.name}
            </Text>

            <View style={styles.cardFooter}>
              {!c.isDefault ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(c._id, c.name, false)}
                >
                  <Trash2 size={13} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.systemBadge}>
                  <ShieldCheck size={12} color="#94a3b8" />
                  <Text style={styles.systemText}>Protected</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  addCard: {
    backgroundColor: '#fff',
    margin: Spacing.md,
    marginBottom: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  addForm: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: AdminColors.textPrimary,
  },
  addBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primary,
    borderRadius: BorderRadius.md,
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  controlsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: AdminColors.textPrimary,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: AdminColors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: { padding: Spacing.md, paddingTop: Spacing.xs },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconDefault: {
    backgroundColor: '#FEE2E2',
  },
  cardIconCustom: {
    backgroundColor: '#FEE2E2',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  cardName: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    marginVertical: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  systemText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: AdminColors.textMuted,
    fontWeight: '600',
  },
});
