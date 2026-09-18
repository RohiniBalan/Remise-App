import React, { useState, useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Plus, Edit2, Trash2, Package, Eye } from 'lucide-react-native';
import { storeProductApi } from '../../api/storeProductApi';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function StoreManageBrandsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { title, category, items: initialItems, brandCount, totalStock, typeKey } = route.params;
  const { refresh } = useStoreDashboard();
  const [items, setItems] = useState(initialItems);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    Alert.alert('Delete this product?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(id);
          try {
            await storeProductApi.delete(id);
            setItems((rows: any[]) => rows.filter(r => r._id !== id));
            refresh();
          } catch {
            Alert.alert('Error', 'Failed to delete product.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{brandCount} brand{brandCount !== 1 ? 's' : ''} · {totalStock} total stock</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('ProductForm', { initialTitle: title, initialCategory: category })}
          >
            <Plus size={15} color="#fff" />
            <Text style={styles.addBtnText}>Add Brand</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={p => p._id}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item: p }) => {
          const img = p.imageUrl || p.images?.[0];
          return (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.imageWrap}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                {img ? <Image source={{ uri: img }} style={styles.image} /> : <Package size={20} color={isDark ? '#4B5563' : '#E5E7EB'} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                <Text style={styles.brandName} numberOfLines={1}>{p.brand || 'Unbranded'}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{p.discountedPrice || p.price}</Text>
                  {p.discountedPrice ? <Text style={styles.originalPrice}>₹{p.price}</Text> : null}
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.availability}>{p.availability}</Text>
                  <Text style={[styles.stock, p.totalStock < 5 && styles.stockLow]}>Stock {p.totalStock}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p._id, hideBack: true, from: 'preview' })}
                >
                  <Eye size={15} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ProductForm', { product: p })}>
                  <Edit2 size={15} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p._id)} disabled={deleting === p._id}>
                  <Trash2 size={15} color={CustomerColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  header: { backgroundColor: isDark ? '#111827' : CustomerColors.white, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
  headerSub: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: isDark ? '#111827' : CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  imageWrap: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  brandName: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  originalPrice: { fontSize: FontSizes.xs, color: isDark ? '#6B7280' : CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  availability: { fontSize: 10, fontWeight: '700', color: CustomerColors.success },
  stock: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
  stockLow: { color: '#D97706', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { padding: 8, backgroundColor: isDark ? '#1F2937' : CustomerColors.bg, borderRadius: BorderRadius.sm },
});