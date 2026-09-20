import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Edit2, Trash2, Package, Eye, ArrowLeft } from 'lucide-react-native';
import { GATEWAY_URL } from '../../api/endpoints';
import { useSellerDashboard } from '../../context/SellerDashboardContext';
import { useAuth } from '../../context/AuthContext';
import { storeProductApi } from '../../api/storeProductApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const AVAILABILITY_STYLE: Record<string, { bg: string; fg: string; darkBg: string; darkFg: string }> = {
  'In Stock': { bg: '#F0FDF4', fg: '#15803D', darkBg: 'rgba(22, 163, 74, 0.15)', darkFg: '#4ADE80' },
  'Out Of Stock': { bg: '#FEF2F2', fg: '#FF0000', darkBg: 'rgba(239, 68, 68, 0.15)', darkFg: '#F87171' },
  'Pre Order': { bg: '#FFFBEB', fg: '#B45309', darkBg: 'rgba(217, 119, 6, 0.15)', darkFg: '#FBBF24' },
};

export default function SellerManageBrandsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { title, category, items: initialItems, brandCount, totalStock } = route.params;
  const { refresh, products } = useSellerDashboard();
  const { token, user } = useAuth();
  const isStoreOwner = user?.role === 'store_owner';
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const typeKey = title.toLowerCase().trim().replace(/\s+/g, ' ');
  const items = products.filter((p: any) => (p.title || '').toLowerCase().trim().replace(/\s+/g, ' ') === typeKey);
  const list = items.length ? items : initialItems;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleting(id);
    try {
      await storeProductApi.delete(id);
      await refresh();
      setDeleteTarget(null);
    } catch {
      Alert.alert('Failed', 'Could not delete product.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
          <Text style={styles.backText}>Back to Products</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{brandCount} brand{brandCount !== 1 ? 's' : ''} · {totalStock} total stock</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('SellerProductForm', { initialTitle: title, initialCategory: category })}>
            <Plus size={14} color="#fff" />
            <Text style={styles.addBtnText}>Add Brand</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p: any) => p._id}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        renderItem={({ item: p }: { item: any }) => {
          const img = resolveImageUrl(p.images?.[0] || p.imageUrl);
          const avail = AVAILABILITY_STYLE[p.availability] || AVAILABILITY_STYLE['In Stock'];
          const badgeBg = isDark ? avail.darkBg : avail.bg;
          const badgeFg = isDark ? avail.darkFg : avail.fg;
          return (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.thumb}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                {img ? <Image source={{ uri: img }} style={styles.thumbImg} /> : <Package size={20} color={isDark ? '#4B5563' : '#E5E7EB'} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                activeOpacity={0.7}
              >
                <Text style={styles.brandName} numberOfLines={1}>{p.brand || 'Unbranded'}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{p.discountedPrice || p.price}</Text>
                  {p.discountedPrice && Number(p.discountedPrice) !== Number(p.price) ? (
                    <Text style={styles.originalPrice}>₹{p.price}</Text>
                  ) : null}
                </View>
                {!isStoreOwner && (
                  <Text style={styles.moqText}>MOQ: {p.moq || 1} · {p.bulkPricing?.length || 0} tier{p.bulkPricing?.length === 1 ? '' : 's'}</Text>
                )}
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeFg }]}>{p.availability}</Text>
                  </View>
                  <Text style={[styles.stockText, p.totalStock < 5 && { color: '#D97706', fontWeight: '700' }]}>
                    Stock {p.totalStock} {p.stockUnit || p.unit || 'Count'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.rowActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p._id, hideBack: true, from: 'preview' })}
                >
                  <Eye size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SellerProductForm', { product: p })}>
                  <Edit2 size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteTarget(p)} disabled={deleting === p._id}>
                  {deleting === p._id ? <ActivityIndicator size="small" /> : <Trash2 size={16} color="#FF0000" />}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={Boolean(deleteTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.deleteIconWrap}>
              <Trash2 size={26} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Delete this product?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to delete "{deleteTarget?.brand || deleteTarget?.title || 'this item'}"? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTarget(null)}
                disabled={Boolean(deleting)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={confirmDelete}
                disabled={Boolean(deleting)}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  header: {
    padding: Spacing.md,
    backgroundColor: isDark ? '#111827' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerTitle: { fontSize: FontSizes.md, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
  headerSub: { fontSize: 11, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 2 },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FF0000', paddingHorizontal: 14, paddingVertical: 9, borderRadius: BorderRadius.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: isDark ? '#111827' : '#fff',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },
  thumb: { width: 52, height: 52, borderRadius: BorderRadius.md, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  brandName: { fontSize: FontSizes.sm, fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  originalPrice: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  moqText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  stockText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF' },
  rowActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
  },
  deleteIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: isDark ? '#F9FAFB' : CustomerColors.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1F2937' : '#F1F5F9',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#E5E7EB' : '#475569',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
  },
  confirmDeleteBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
