import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Search,
  Package,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
import { storeApi } from '../../api/storeApi';
import { orderApi } from '../../api/orderApi';
import BrandListSheet from '../../components/suppliers/BrandListSheet';
import CompareSheet from '../../components/suppliers/CompareSheet';
import CartCheckoutModal from '../../components/suppliers/CartCheckoutModal';
import {
  ProductGroup,
  TitleGroup,
  groupByTitle,
  GroupedSupplier,
  CartLine,
} from '../../utils/supplierGrouping';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requireAuthForPurchase } from '../../utils/authGuard';
import { mergeCategories } from '../../utils/storeCategories';

const API_BASE = 'YOUR_API_BASE_URL';

export default function SuppliersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [view, setView] = useState<'browse' | 'orders'>('browse');
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [customCategories, setCustomCategories] = useState<{ _id: string; name: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [placedMsg, setPlacedMsg] = useState('');
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [selectedTitleGroup, setSelectedTitleGroup] =
    useState<TitleGroup | null>(null);
  const [compareGroup, setCompareGroup] = useState<ProductGroup | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
  productApi
    .getGroupedSuppliers('home_business', {})
    .then(res => {
      const data = res.data.data || [];
      const names = Array.from(
        new Set(data.map((g: any) => g.category).filter(Boolean)),
      ) as string[];
      setCustomCategories(names.map(name => ({ _id: `cat-${name}`, name })));
    })
    .catch(() => {});
}, []);

  const loadGroups = useCallback(async () => {
    if (!categoryFilter) {
      setGroups([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Customer-facing screen only ever shows home-business suppliers —
      // unlike the store owner's version there's no wholesaler toggle.
      const res = await productApi.getGroupedSuppliers('home_business', {
        search: search || undefined,
        category: categoryFilter,
      });
      const data: ProductGroup[] = res.data.data || [];
      const storeIds = Array.from(
        new Set(
          data.flatMap(g => g.suppliers.map(s => s.storeId).filter(Boolean)),
        ),
      );
      let nameById: Record<string, string> = {};
      if (storeIds.length) {
        try {
          const sRes = await storeApi.getByIds(storeIds);
          (sRes.data.data || []).forEach((s: any) => {
            nameById[s._id] = s.name;
          });
        } catch {
          /* names stay as fallback below */
        }
      }
      setGroups(
        data.map(g => ({
          ...g,
          suppliers: g.suppliers.map(s => ({
            ...s,
            storeName: nameById[s.storeId] || 'Supplier',
          })),
        })),
      );
    } catch {
      setError('Could not load suppliers right now. Try again shortly.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, categoryFilter]);

  const loadMyOrders = useCallback(async () => {
    if (!(user as any)?._id) return;
    try {
      const res = await orderApi.getMyWholesaleOrders((user as any)._id);
      setMyOrders(res.data.data || []);
    } catch {
      /* non-fatal */
    }
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);
  useEffect(() => {
    if (view === 'orders') loadMyOrders();
  }, [view, loadMyOrders]);

  // Same merge (defaults + added) the store owner's dropdown uses, plus
  // any category actually present in the currently loaded groups —
  // matches StoreSuppliersScreen's supplierCategories derivation.
  const supplierCategories = Array.from(
  new Set(
    [
      ...mergeCategories(customCategories).map((c: any) => c.name),
      ...groups.map(g => g.category),
    ].filter(Boolean),
  ),
);
  const categoryOptions = supplierCategories.map(category => ({
    key: category,
    label: category,
  }));

  const titleGroups = groupByTitle(groups);
  const cartLines = Object.values(cart);
  const cartTotal = cartLines.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleAddToCart = (
    supplier: GroupedSupplier,
    qty: number,
    price: number,
    tierLabel: string | null,
    group: ProductGroup,
  ) => {
    if (
      !requireAuthForPurchase({
        navigation: undefined,
        isAuthenticated: Boolean(user?._id),
        message: 'Please sign in to add supplier items to your cart.',
      })
    )
      return;
    setCart(c => ({
      ...c,
      [supplier.productId]: {
        productId: supplier.productId,
        storeId: supplier.storeId,
        storeName: supplier.storeName,
        title: group.title,
        image: group.image,
        price,
        qty,
        moq: supplier.moq,
        tierLabel,
      },
    }));
  };

  const handleCheckoutComplete = () => {
    setCart({});
    setPlacedMsg('Order(s) placed successfully!');
    setTimeout(() => setPlacedMsg(''), 4000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (view === 'browse') loadGroups();
    else loadMyOrders();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buy from Suppliers</Text>
        <Text style={styles.headerSubtitle}>
          Bulk-buy directly from home businesses at wholesale prices.
        </Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, view === 'browse' && styles.tabActive]}
          onPress={() => setView('browse')}
        >
          <Text
            style={[styles.tabText, view === 'browse' && styles.tabTextActive]}
          >
            Browse Suppliers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'orders' && styles.tabActive]}
          onPress={() => setView('orders')}
        >
          <Text
            style={[styles.tabText, view === 'orders' && styles.tabTextActive]}
          >
            My Orders
          </Text>
        </TouchableOpacity>
      </View>

      {!!error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={CustomerColors.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
      {!!placedMsg && (
        <View style={styles.successBanner}>
          <CheckCircle size={14} color={CustomerColors.success} />
          <Text style={styles.successBannerText}>{placedMsg}</Text>
        </View>
      )}

      {view === 'browse' ? (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: cartLines.length ? 100 : Spacing.xl,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.sm }}
          >
            <SelectField
              label="Category"
              value={categoryFilter}
              placeholder="Select Category"
              options={categoryOptions}
              onSelect={key => setCategoryFilter(key)}
            />
          </View>

          <View style={styles.searchRow}>
            <Search size={15} color={CustomerColors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={loadGroups}
              placeholder="Search products…"
              placeholderTextColor={CustomerColors.textSecondary}
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={CustomerColors.teal} size="large" />
              <Text style={styles.helperText}>Loading catalog…</Text>
            </View>
          ) : titleGroups.length === 0 ? (
            <View style={styles.centerBox}>
              <Package size={36} color={CustomerColors.border} />
              <Text style={styles.helperText}>
                {categoryFilter
                  ? 'No products in this category.'
                  : 'Select a category to view products.'}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {titleGroups.map(tg => {
                const img = tg.image
                  ? tg.image.startsWith('http')
                    ? tg.image
                    : `${API_BASE}${tg.image}`
                  : '';
                return (
                  <TouchableOpacity
                    key={tg.titleKey}
                    style={styles.productCard}
                    onPress={() => setSelectedTitleGroup(tg)}
                  >
                    <View style={styles.productImageWrap}>
                      {img ? (
                        <Image
                          source={{ uri: img }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Package size={28} color={CustomerColors.border} />
                        </View>
                      )}
                    </View>
                    <View style={{ padding: Spacing.sm }}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {tg.title}
                      </Text>
                      <Text style={styles.brandCountText}>
                        Available Brands{' '}
                        <Text style={{ fontWeight: '700' }}>
                          ({tg.brandCount})
                        </Text>
                      </Text>
                      <Text style={styles.fromText}>Starting from</Text>
                      <Text style={styles.priceText}>₹{tg.lowestPrice}</Text>
                      <View style={styles.viewBrandsBtn}>
                        <Text style={styles.viewBrandsText}>View Brands →</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {myOrders.length === 0 ? (
            <View style={styles.centerBox}>
              <ShoppingBag size={36} color={CustomerColors.border} />
              <Text style={styles.helperText}>No supplier orders yet.</Text>
            </View>
          ) : (
            myOrders.map((o: any, idx: number) => (
  <View key={`${o._id}-${o.storeId ?? idx}`} style={styles.orderCard}>
                <View style={styles.orderTopRow}>
                  <View>
                    <Text style={styles.orderStore}>
                      {o.storeName || 'Supplier'}
                    </Text>
                    <Text style={styles.orderId}>{o.orderId}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{o.orderStatus}</Text>
                  </View>
                </View>
                {o.items?.map((it: any, i: number) => (
                  <Text key={i} style={styles.orderItemText}>
                    {it.quantity}× {it.title}{' '}
                    {it.tierLabel ? `(${it.tierLabel})` : ''}
                  </Text>
                ))}
                <Text style={styles.orderTotal}>
                  ₹{o.totalAmount?.toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {view === 'browse' && cartLines.length > 0 && (
        <View style={styles.cartFooter}>
          <View>
            <Text style={styles.cartFooterCount}>
              {cartLines.length} item{cartLines.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartFooterTotal}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={() => {
              if (
                !requireAuthForPurchase({
                  navigation: undefined,
                  isAuthenticated: Boolean(user?._id),
                  message: 'Please sign in to place this wholesale order.',
                })
              )
                return;
              setShowCheckout(true);
            }}
          >
            <ShoppingBag size={15} color="#fff" />
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <BrandListSheet
        titleGroup={selectedTitleGroup}
        visible={!!selectedTitleGroup}
        onClose={() => setSelectedTitleGroup(null)}
        onCompareBrand={brandGroup => {
          setCompareGroup(brandGroup);
          setSelectedTitleGroup(null);
        }}
      />

      <CompareSheet
        group={compareGroup}
        visible={!!compareGroup}
        onClose={() => setCompareGroup(null)}
        onAddToCart={handleAddToCart}
      />

      <CartCheckoutModal
        cartLines={cartLines}
        prefill={{
          firstName:
            (user as any)?.fullname?.split(' ')[0] ||
            (user as any)?.name?.split(' ')[0] ||
            '',
          lastName: ((user as any)?.fullname || (user as any)?.name || '')
            .split(' ')
            .slice(1)
            .join(' '),
          contactEmail: (user as any)?.email || '',
        }}
        visible={showCheckout}
        onClose={() => setShowCheckout(false)}
        onComplete={handleCheckoutComplete}
      />
    </View>
  );
}

// Same modal-dropdown pattern as StoreSuppliersScreen's SelectField.
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
        <ChevronDown size={16} color={CustomerColors.textSecondary} />
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
                <X size={20} color={CustomerColors.textSecondary} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  tabActive: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
  },
  tabTextActive: { color: '#fff' },
  errorBanner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: CustomerColors.dangerBg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  errorBannerText: {
    color: CustomerColors.danger,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: CustomerColors.successBg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  successBannerText: {
    color: CustomerColors.success,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  helperText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  productCard: {
    width: '47%',
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    overflow: 'hidden',
    ...Shadows.card,
  },
  productImageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: CustomerColors.bg,
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  brandCountText: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  fromText: { fontSize: 10, color: CustomerColors.textSecondary, marginTop: 2 },
  priceText: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.teal600,
  },
  viewBrandsBtn: {
    marginTop: 6,
    backgroundColor: CustomerColors.teal600,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  viewBrandsText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  orderCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  orderStore: {
    fontWeight: '800',
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  orderId: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  statusPill: {
    backgroundColor: CustomerColors.mint,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  orderItemText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  orderTotal: {
    fontWeight: '800',
    color: CustomerColors.teal700,
    marginTop: Spacing.xs,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CustomerColors.white,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.border,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cartFooterCount: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  cartFooterTotal: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
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
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.sm, color: CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#9CA3AF', flex: 1 },
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
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
});
