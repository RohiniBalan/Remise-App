import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Search,
  Package,
  ShoppingBag,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { GATEWAY_URL } from '../../api/endpoints';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { productApi } from '../../api/productApi';
import { storeApi } from '../../api/storeApi';
import { orderApi } from '../../api/orderApi';
import { groupByTitle, TitleGroup } from '../../utils/supplierTypes';
import { mergeCategories } from '../../utils/storeCategories';

const API = process.env.EXPO_PUBLIC_API_URL || GATEWAY_URL;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Processing: { bg: '#FEF3C7', text: '#92400E' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
  Shipped: { bg: '#DBEAFE', text: '#1D4ED8' },
  'Out for Delivery': { bg: '#DBEAFE', text: '#1D4ED8' },
  Delivered: { bg: '#DCFCE7', text: '#15803D' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
};
const getStatusColors = (status: string) =>
  STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#4B5563' };

export default function StoreSuppliersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { store, categories } = useStoreDashboard();
  const { cartCount, cartTotal } = useSupplierCart();

  const [view, setView] = useState<'browse' | 'orders'>(
    route.params?.initialView || 'browse',
  );

  useEffect(() => {
    if (route.params?.initialView) setView(route.params.initialView);
  }, [route.params?.initialView]);
  const [supplierType, setSupplierType] = useState<
    'whole_saler' | 'home_business'
  >('whole_saler');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const loadGroups = useCallback(async () => {
    if (!categoryFilter) {
      setGroups([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await productApi.getGroupedSuppliers(supplierType, {
        search: search || undefined,
        category: categoryFilter,
      });
      const data = res.data.data || [];
      const storeIds = Array.from(
        new Set(
          data.flatMap((g: any) =>
            g.suppliers.map((s: any) => s.storeId).filter(Boolean),
          ),
        ),
      ) as string[];
      let nameById: Record<string, string> = {};
      if (storeIds.length) {
        try {
          const sRes = await storeApi.getByIds(storeIds);
          (sRes.data.data || []).forEach((s: any) => {
            nameById[s._id] = s.name;
          });
        } catch {
          /* fallback names below */
        }
      }
      setGroups(
        data.map((g: any) => ({
          ...g,
          suppliers: g.suppliers.map((s: any) => ({
            ...s,
            storeName: nameById[s.storeId] || 'Supplier',
          })),
        })),
      );
    } catch (err) {
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
      console.error('loadMyOrders failed:', err);
    }
  }, [store]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);
  useEffect(() => {
    if (view === 'orders') loadMyOrders();
  }, [view, loadMyOrders]);

  const supplierCategories = Array.from(
    new Set(
      [
        ...mergeCategories(categories || []).map(c => c.name),
        ...groups.map(g => g.category),
      ].filter(Boolean),
    ),
  );
  const categoryOptions = supplierCategories.map(category => ({
    key: category,
    label: category,
  }));
  const titleGroups: TitleGroup[] = groupByTitle(groups);

  const gridData: any[] =
    titleGroups.length % 2 !== 0
      ? [...titleGroups, { titleKey: '__filler__', __filler: true }]
      : titleGroups;

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            view === 'browse' && styles.toggleBtnActive,
          ]}
          onPress={() => setView('browse')}
        >
          <Text
            style={[
              styles.toggleText,
              view === 'browse' && styles.toggleTextActive,
            ]}
          >
            Browse Suppliers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            view === 'orders' && styles.toggleBtnActive,
          ]}
          onPress={() => setView('orders')}
        >
          <Text
            style={[
              styles.toggleText,
              view === 'orders' && styles.toggleTextActive,
            ]}
          >
            My Orders
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {view === 'browse' ? (
        <>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                supplierType === 'whole_saler' && styles.typeBtnActive,
              ]}
              onPress={() => {
                setSupplierType('whole_saler');
                setCategoryFilter('');
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  supplierType === 'whole_saler' && styles.typeBtnTextActive,
                ]}
              >
                📦 Wholesalers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                supplierType === 'home_business' && styles.typeBtnActive,
              ]}
              onPress={() => {
                setSupplierType('home_business');
                setCategoryFilter('');
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  supplierType === 'home_business' && styles.typeBtnTextActive,
                ]}
              >
                🏠 Home Business
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.sm }}
          >
            <SelectField
              label="Category"
              value={categoryFilter}
              placeholder="Select Category"
              options={categoryOptions}
              onSelect={key => setCategoryFilter(key)}
              isDark={isDark}
              styles={styles}
            />
          </View>

          <View style={styles.searchBox}>
            <Search size={14} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={loadGroups}
              placeholder="Search products…"
              placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
            />
          </View>

          {loading ? (
            <ActivityIndicator
              style={{ marginTop: Spacing.xl }}
              size="large"
              color={isDark ? '#2DD4BF' : CustomerColors.teal700}
            />
          ) : (
            <FlatList
              data={gridData}
              keyExtractor={tg => tg.titleKey}
              numColumns={2}
              columnWrapperStyle={{ gap: Spacing.sm }}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Package size={36} color={isDark ? '#374151' : '#E5E7EB'} />
                  <Text style={styles.emptyText}>
                    {categoryFilter
                      ? 'No products in this category.'
                      : 'Select a category to view products.'}
                  </Text>
                </View>
              }
              renderItem={({ item: tg }) => {
                if (tg.__filler)
                  return <View style={[styles.card, styles.cardFiller]} />;
                const img = tg.image
                  ? tg.image.startsWith('http')
                    ? tg.image
                    : `${API}${tg.image}`
                  : '';
                return (
                  <View style={styles.card}>
                    <View style={styles.imageWrap}>
                      {img ? (
                        <Image source={{ uri: img }} style={styles.image} />
                      ) : (
                        <Package size={24} color={isDark ? '#4B5563' : '#E5E7EB'} />
                      )}
                    </View>
                    <View style={{ padding: Spacing.sm }}>
                      <Text style={styles.title} numberOfLines={1}>
                        {tg.title}
                      </Text>
                      <Text style={styles.subText}>
                        Available Brands ({tg.brandCount})
                      </Text>
                      <Text style={styles.startingFrom}>Starting from</Text>
                      <Text style={styles.price}>₹{tg.lowestPrice}</Text>
                      <TouchableOpacity
                        style={styles.viewBrandsBtn}
                        onPress={() =>
                          navigation.navigate('SupplierBrands', {
                            titleGroup: tg,
                          })
                        }
                      >
                        <Text style={styles.viewBrandsBtnText}>
                          View Brands →
                        </Text>
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
          keyExtractor={(o, idx) => `${o._id}-${o.storeId ?? idx}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ShoppingBag size={36} color={isDark ? '#374151' : '#E5E7EB'} />
              <Text style={styles.emptyText}>No supplier orders yet.</Text>
            </View>
          }
          renderItem={({ item: o }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderStore}>
                    {o.storeName || 'Supplier'}
                  </Text>
                  <Text style={styles.orderId}>{o.orderId}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: getStatusColors(o.orderStatus).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: getStatusColors(o.orderStatus).text },
                    ]}
                  >
                    {o.orderStatus}
                  </Text>
                </View>
              </View>
              {o.items?.map((it: any, i: number) => (
                <Text key={i} style={styles.orderItem}>
                  {it.quantity}× {it.title}{' '}
                  {it.tierLabel ? `(${it.tierLabel})` : ''}
                </Text>
              ))}
              <Text style={styles.orderTotal}>
                ₹{o.totalAmount?.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        />
      )}

      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartPill}
          onPress={() => navigation.navigate('SupplierCart')}
        >
          <ShoppingBag size={16} color="#fff" />
          <Text style={styles.cartPillText}>
            {cartCount} item{cartCount !== 1 ? 's' : ''} · ₹
            {cartTotal.toLocaleString('en-IN')}
          </Text>
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
  isDark,
  styles,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
  isDark: boolean;
  styles: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.selectLabel}>{label}</Text>

      <TouchableOpacity
        style={[styles.selectInput, disabled && styles.selectDisabled]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text
          style={value ? styles.selectValue : styles.selectPlaceholder}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
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
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.key}
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
                      item.key === value && styles.modalItemTextActive,
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

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  errorText: {
    color: CustomerColors.primary,
    backgroundColor: isDark ? '#7F1D1D' : CustomerColors.dangerBg,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: FontSizes.sm,
  },
  viewToggle: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  toggleBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
  },
  toggleBtnActive: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  toggleText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  toggleTextActive: { color: '#fff' },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
    borderColor: isDark ? '#0f766e' : CustomerColors.teal600,
  },
  typeBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  typeBtnTextActive: { color: '#fff' },
  chipScroll: { marginBottom: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
  },
  catChipActive: {
    backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
    borderColor: isDark ? '#0f766e' : CustomerColors.teal600,
  },
  catChipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  catChipTextActive: { color: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 90 },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
  card: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  cardFiller: { backgroundColor: 'transparent', borderWidth: 0 },
  imageWrap: {
    aspectRatio: 4 / 3,
    backgroundColor: isDark ? '#1F2937' : '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },
  subText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    marginTop: 2,
  },
  startingFrom: { fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 4 },
  price: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  viewBrandsBtn: {
    marginTop: Spacing.sm,
    backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  viewBrandsBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  orderCard: {
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  orderStore: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },
  orderId: { fontSize: FontSizes.xs, color: isDark ? '#6B7280' : '#9CA3AF' },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  orderItem: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
  orderTotal: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    marginTop: 4,
  },
  cartPill: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    elevation: 4,
  },
  cartPillText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  selectLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  selectInput: {
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
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
    color: isDark ? '#FFFFFF' : CustomerColors.black,
    flex: 1,
  },

  selectPlaceholder: {
    fontSize: FontSizes.sm,
    color: isDark ? '#94A3B8' : '#6B7280',
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  modalSheet: {
    backgroundColor: isDark ? '#111827' : '#fff',
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
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },

  modalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },

  modalItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
  },

  modalItemText: {
    fontSize: FontSizes.sm,
    color: isDark ? '#FFFFFF' : CustomerColors.black,
  },

  modalItemTextActive: {
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    fontWeight: '700',
  },
});
