import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, Package, ShoppingBag, ChevronDown, X } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { productApi } from '../../api/productApi';
import { storeApi } from '../../api/storeApi';
import { orderApi } from '../../api/orderApi';
import { groupByTitle, TitleGroup } from '../../utils/supplierTypes';
import { mergeCategories } from '../../utils/storeCategories';

// This was left as a literal placeholder string, which is a bug — it's used
// below to resolve relative product image paths, so those images would
// have been broken. Matches the pattern StoreOverviewScreen already uses.
const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Processing: { bg: '#FEF3C7', text: '#92400E' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
  Shipped: { bg: '#DBEAFE', text: '#1D4ED8' },
  'Out for Delivery': { bg: '#DBEAFE', text: '#1D4ED8' },
  Delivered: { bg: '#DCFCE7', text: '#15803D' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
};
const getStatusColors = (status: string) => STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#4B5563' };

// Ported from client/app/store/dashboard/page.tsx's SuppliersTab. Web's cart
// sidebar becomes a floating "Cart (n)" pill here since there's no persistent
// sidebar on mobile; tapping it opens StoreSupplierCart.
export default function StoreSuppliersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { store, categories } = useStoreDashboard();
  const { cartCount, cartTotal } = useSupplierCart();

  const [view, setView] = useState<'browse' | 'orders'>(route.params?.initialView || 'browse');

  // The dropdown's "My Orders" navigates here with { initialView: 'orders' }.
  // If this screen is already mounted (already on top of the stack) when
  // that happens, React Navigation updates params without remounting, so
  // this effect is what actually flips the toggle in that case.
  useEffect(() => {
    if (route.params?.initialView) setView(route.params.initialView);
  }, [route.params?.initialView]);
  const [supplierType, setSupplierType] = useState<'whole_saler' | 'home_business'>('whole_saler');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const loadGroups = useCallback(async () => {
  if (!categoryFilter) { setGroups([]); return; }
  setLoading(true);
  setError('');
  try {
    const res = await productApi.getGroupedSuppliers(supplierType, { search: search || undefined, category: categoryFilter });
    const data = res.data.data || [];
    const storeIds = Array.from(
  new Set(data.flatMap((g: any) => g.suppliers.map((s: any) => s.storeId).filter(Boolean)))
) as string[];
    let nameById: Record<string, string> = {};
    if (storeIds.length) {
      try {
        const sRes = await storeApi.getByIds(storeIds);
        (sRes.data.data || []).forEach((s: any) => { nameById[s._id] = s.name; });
      } catch { /* fallback names below */ }
    }
    setGroups(data.map((g: any) => ({ ...g, suppliers: g.suppliers.map((s: any) => ({ ...s, storeName: nameById[s.storeId] || 'Supplier' })) })));
  } catch (err) {
    // TODO: remove this once the underlying fetch issue is found — it was
    // being swallowed silently before, which is why the cause wasn't
    // visible anywhere.
    console.error('loadGroups failed:', err);
    setError('Could not load suppliers right now. Try again shortly.');
  } finally {
    setLoading(false);
  }
}, [supplierType, search, categoryFilter]);

  const loadMyOrders = useCallback(async () => {
    if (!store?.ownerId) return;
    try {
      const res = await orderApi.getMyWholesaleOrders(store.ownerId);
      setMyOrders(res.data.data || []);
    } catch (err) {
      console.error('loadMyOrders failed:', err); // TODO: remove once diagnosed
    }
  }, [store]);

  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => { if (view === 'orders') loadMyOrders(); }, [view, loadMyOrders]);

  const supplierCategories = Array.from(
  new Set([
    ...mergeCategories(categories || []).map(c => c.name),
    ...groups.map(g => g.category),
  ].filter(Boolean))
);
  const categoryOptions = supplierCategories.map(category => ({
  key: category,
  label: category,
}));
  const titleGroups: TitleGroup[] = groupByTitle(groups);
  // FlatList's numColumns=2 + flex:1 cards means an odd-length last row
  // stretches its single real card to fill the whole row width instead of
  // matching the width of every other card. Padding with an invisible
  // filler keeps every card the same size.
  const gridData: any[] = titleGroups.length % 2 !== 0 ? [...titleGroups, { titleKey: '__filler__', __filler: true }] : titleGroups;

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <TouchableOpacity style={[styles.toggleBtn, view === 'browse' && styles.toggleBtnActive]} onPress={() => setView('browse')}>
          <Text style={[styles.toggleText, view === 'browse' && styles.toggleTextActive]}>Browse Suppliers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, view === 'orders' && styles.toggleBtnActive]} onPress={() => setView('orders')}>
          <Text style={[styles.toggleText, view === 'orders' && styles.toggleTextActive]}>My Orders</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {view === 'browse' ? (
        <>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.typeBtn, supplierType === 'whole_saler' && styles.typeBtnActive]}
              onPress={() => { setSupplierType('whole_saler'); setCategoryFilter(''); }}
            >
              <Text style={[styles.typeBtnText, supplierType === 'whole_saler' && styles.typeBtnTextActive]}>📦 Wholesalers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, supplierType === 'home_business' && styles.typeBtnActive]}
              onPress={() => { setSupplierType('home_business'); setCategoryFilter(''); }}
            >
              <Text style={[styles.typeBtnText, supplierType === 'home_business' && styles.typeBtnTextActive]}>🏠 Home Business</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.sm }}>
  <SelectField
    label="Category"
    value={categoryFilter}
    placeholder="Select Category"
    options={categoryOptions}
    onSelect={(key) => setCategoryFilter(key)}
  />
</View>

          <View style={styles.searchBox}>
            <Search size={14} color={CustomerColors.textSecondary} />
            <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} onSubmitEditing={loadGroups} placeholder="Search products…" />
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: Spacing.xl }} size="large" color={CustomerColors.teal700} />
          ) : (
            <FlatList
              data={gridData}
              keyExtractor={tg => tg.titleKey}
              numColumns={2}
              columnWrapperStyle={{ gap: Spacing.sm }}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Package size={36} color="#E5E7EB" />
                  <Text style={styles.emptyText}>{categoryFilter ? 'No products in this category.' : 'Select a category to view products.'}</Text>
                </View>
              }
              renderItem={({ item: tg }) => {
                if (tg.__filler) return <View style={[styles.card, styles.cardFiller]} />;
                const img = tg.image ? (tg.image.startsWith('http') ? tg.image : `${API}${tg.image}`) : '';
                return (
                  <View style={styles.card}>
                    <View style={styles.imageWrap}>
                      {img ? <Image source={{ uri: img }} style={styles.image} /> : <Package size={24} color="#E5E7EB" />}
                    </View>
                    <View style={{ padding: Spacing.sm }}>
                      <Text style={styles.title} numberOfLines={1}>{tg.title}</Text>
                      <Text style={styles.subText}>Available Brands ({tg.brandCount})</Text>
                      <Text style={styles.startingFrom}>Starting from</Text>
                      <Text style={styles.price}>₹{tg.lowestPrice}</Text>
                      <TouchableOpacity style={styles.viewBrandsBtn} onPress={() => navigation.navigate('SupplierBrands', { titleGroup: tg })}>
                        <Text style={styles.viewBrandsBtnText}>View Brands →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </>
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={o => o._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ShoppingBag size={36} color="#E5E7EB" />
              <Text style={styles.emptyText}>No supplier orders yet.</Text>
            </View>
          }
          renderItem={({ item: o }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderStore}>{o.storeName || 'Supplier'}</Text>
                  <Text style={styles.orderId}>{o.orderId}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: getStatusColors(o.orderStatus).bg }]}>
                  <Text style={[styles.statusPillText, { color: getStatusColors(o.orderStatus).text }]}>{o.orderStatus}</Text>
                </View>
              </View>
              {o.items?.map((it: any, i: number) => (
                <Text key={i} style={styles.orderItem}>{it.quantity}× {it.title} {it.tierLabel ? `(${it.tierLabel})` : ''}</Text>
              ))}
              <Text style={styles.orderTotal}>₹{o.totalAmount?.toLocaleString('en-IN')}</Text>
            </View>
          )}
        />
      )}

      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartPill} onPress={() => navigation.navigate('SupplierCart')}>
          <ShoppingBag size={16} color="#fff" />
          <Text style={styles.cartPillText}>{cartCount} item{cartCount !== 1 ? 's' : ''} · ₹{cartTotal.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  disabled,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.selectLabel}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.selectInput,
          disabled && styles.selectDisabled,
        ]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text
          style={
            value
              ? styles.selectValue
              : styles.selectPlaceholder
          }
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <ChevronDown
          size={16}
          color={CustomerColors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>

              <TouchableOpacity onPress={() => setOpen(false)}>
                <X
                  size={20}
                  color={CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.key, item.label);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item.key === value &&
                        styles.modalItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  errorText: { color: CustomerColors.primary, backgroundColor: CustomerColors.dangerBg, margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, fontSize: FontSizes.sm },
  viewToggle: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  toggleBtn: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  toggleBtnActive: { backgroundColor: CustomerColors.primary, borderColor: CustomerColors.primary },
  toggleText: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.textSecondary },
  toggleTextActive: { color: '#fff' },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  typeBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, backgroundColor: CustomerColors.white, alignItems: 'center', justifyContent: 'center' },
  typeBtnActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  typeBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.textSecondary },
  typeBtnTextActive: { color: '#fff' },
  chipScroll: { marginBottom: Spacing.sm },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  catChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  catChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.textSecondary },
  catChipTextActive: { color: '#fff' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 90 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  card: { flex: 1, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, overflow: 'hidden', marginBottom: Spacing.sm },
  cardFiller: { backgroundColor: 'transparent', borderWidth: 0 },
  imageWrap: { aspectRatio: 4 / 3, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  title: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  subText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  startingFrom: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  price: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.teal700 },
  viewBrandsBtn: { marginTop: Spacing.sm, backgroundColor: CustomerColors.teal600, paddingVertical: 8, borderRadius: BorderRadius.sm, alignItems: 'center' },
  viewBrandsBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  orderCard: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: 6 },
  orderStore: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  orderId: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  statusPill: { alignSelf: 'flex-start', borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  orderItem: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  orderTotal: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.teal700, marginTop: 4 },
  cartPill: { position: 'absolute', bottom: Spacing.lg, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderRadius: BorderRadius.pill, elevation: 4 },
  cartPillText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  selectLabel: {
  fontSize: FontSizes.xs,
  fontWeight: '700',
  color: CustomerColors.textSecondary,
  textTransform: 'uppercase',
  marginBottom: Spacing.xs,
},

selectInput: {
  backgroundColor: CustomerColors.white,
  borderWidth: 1,
  borderColor: CustomerColors.steelBorder,
  borderRadius: BorderRadius.md,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.md,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

selectDisabled: {
  opacity: 0.5,
},

selectValue: {
  fontSize: FontSizes.sm,
  color: CustomerColors.black,
  flex: 1,
},

selectPlaceholder: {
  fontSize: FontSizes.sm,
  color: '#9CA3AF',
  flex: 1,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},

modalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: BorderRadius.lg,
  borderTopRightRadius: BorderRadius.lg,
  maxHeight: '70%',
  paddingBottom: Spacing.lg,
},

modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F5F5F5',
},

modalTitle: {
  fontSize: FontSizes.base,
  fontWeight: '800',
  color: CustomerColors.black,
},

modalItem: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F5F5F5',
},

modalItemText: {
  fontSize: FontSizes.sm,
  color: CustomerColors.black,
},

modalItemTextActive: {
  color: CustomerColors.teal700,
  fontWeight: '700',
},
});