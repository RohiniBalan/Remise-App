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
  Linking,
  Alert,
} from 'react-native';
import {
  Search,
  Package,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  X,
  MapPin,
  FileText,
  Download,
  RotateCcw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
import { storeApi } from '../../api/storeApi';
import { orderApi } from '../../api/orderApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { isValidPlacedOrder } from '../../utils/orderValidation';
import BrandListSheet from '../../components/suppliers/BrandListSheet';
import CompareSheet from '../../components/suppliers/CompareSheet';
import CartCheckoutModal from '../../components/suppliers/CartCheckoutModal';
import InvoiceModal from '../../components/common/InvoiceModal';
import RefundModal from '../../components/common/RefundModal';
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
import { navigateToAuthFlow } from '../../utils/authGuard';
import { mergeCategories } from '../../utils/storeCategories';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Processing: { bg: '#FEF3C7', text: '#92400E' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
  Shipped: { bg: '#DBEAFE', text: '#1D4ED8' },
  'Out for Delivery': { bg: '#DBEAFE', text: '#1D4ED8' },
  Delivered: { bg: '#DCFCE7', text: '#15803D' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
  SUCCESS: { bg: '#DCFCE7', text: '#15803D' },
  REFUNDED: { bg: '#FEE2E2', text: '#B91C1C' },
};
const getStatusColors = (status: string) =>
  STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#4B5563' };

export default function SuppliersScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<
    string | null
  >(null);
  const [selectedRefund, setSelectedRefund] = useState<{
    orderId: string;
    totalAmount: number;
  } | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState('');

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
    const userId = (user as any)?._id || (user as any)?.id;
    const email = (user as any)?.email || '';
    if (!userId) return;
    try {
      const [wholesaleRes, smartRes, legacyRes] = await Promise.allSettled([
        orderApi.getMyWholesaleOrders(userId),
        smartOrderApi.getMyOrders(userId, email),
        orderApi.getMyOrders(userId, email),
      ]);

      const wholesaleOrders =
        wholesaleRes.status === 'fulfilled' && wholesaleRes.value.data?.data
          ? wholesaleRes.value.data.data
          : [];
      const smartOrders =
        smartRes.status === 'fulfilled' && smartRes.value.data?.data
          ? smartRes.value.data.data
          : [];
      const legacyOrders =
        legacyRes.status === 'fulfilled' && legacyRes.value.data?.data
          ? legacyRes.value.data.data
          : [];

      const seen = new Set<string>();
      const combined: any[] = [];

      [...wholesaleOrders, ...smartOrders, ...legacyOrders].forEach(o => {
        if (!isValidPlacedOrder(o)) return;
        const id = o.orderId || o._id;
        if (id && !seen.has(id)) {
          seen.add(id);
          combined.push({
            ...o,
            orderId: o.orderId || o._id,
            storeName: o.storeName || o.items?.[0]?.storeName || 'Supplier',
            orderStatus:
              o.orderStatus ||
              o.deliveryStatus ||
              o.paymentStatus ||
              'Processing',
            totalAmount: o.totalAmount ?? o.amount ?? 0,
            items: (o.items || []).map((it: any) => ({
              ...it,
              title: it.title || it.name || 'Product',
              quantity: it.quantity || it.qty || 1,
              price: it.price || 0,
            })),
          });
        }
      });

      combined.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );

      setMyOrders(combined);
    } catch {
      /* non-fatal */
    }
  }, [user]);

  const handleRefund = async (amount: number, note: string) => {
    if (!selectedRefund) return;
    setIsRefunding(true);
    setRefundError('');
    try {
      const response = await smartOrderApi.createRefund({
        orderId: selectedRefund.orderId,
        refundAmount: amount,
        refundNote: note,
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Refund could not be initiated.',
        );
      }
      setMyOrders(prev =>
        prev.map(order =>
          (order.orderId || order._id) === selectedRefund.orderId
            ? { ...order, paymentStatus: 'REFUNDED', refundStatus: 'refunded' }
            : order,
        ),
      );
      setSelectedRefund(null);
      loadMyOrders();
    } catch (err: any) {
      setRefundError(
        err?.response?.data?.message ||
          err?.message ||
          'Refund could not be initiated.',
      );
    } finally {
      setIsRefunding(false);
    }
  };

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
  ): boolean => {
    if (!user?._id) {
      setShowAuthModal(true);
      return false;
    }
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
    setShowPlaceOrderModal(true);
    return true;
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
                const img = resolveImageUrl(tg.image) || '';
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
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {!user?._id ? (
            <View style={styles.centerBox}>
              <ShoppingBag size={36} color={CustomerColors.teal600} />
              <Text style={[styles.helperText, { fontWeight: '700', color: CustomerColors.black, fontSize: 14 }]}>
                Please log in to view your orders
              </Text>
              <Text style={[styles.helperText, { marginTop: 4, marginBottom: 12 }]}>
                Sign in to track your orders placed with Home Sellers.
              </Text>
              <TouchableOpacity
                style={styles.loginPromptBtn}
                onPress={() => navigation.navigate('LoginRegister')}
              >
                <Text style={styles.loginPromptBtnText}>Log In / Register</Text>
              </TouchableOpacity>
            </View>
          ) : myOrders.length === 0 ? (
            <View style={styles.centerBox}>
              <ShoppingBag size={36} color={CustomerColors.border} />
              <Text style={styles.helperText}>No supplier orders yet.</Text>
            </View>
          ) : (
            myOrders.map((o: any, idx: number) => {
              const statusColor = getStatusColors(o.orderStatus);
              const isDelivered = o.orderStatus === 'Delivered';
              const canAct =
                o.orderStatus !== 'Cancelled' &&
                o.paymentStatus !== 'REFUNDED' &&
                o.refundStatus !== 'refunded';

              return (
                <View
                  key={`${o._id || o.orderId}-${idx}`}
                  style={[
                    styles.orderCard,
                    isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
                  ]}
                >
                  <View style={styles.orderTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.orderStore,
                          isDark && { color: '#FFFFFF' },
                        ]}
                        numberOfLines={1}
                      >
                        {o.storeName || 'Supplier'}
                      </Text>
                      <Text style={[styles.orderId, isDark && { color: '#9CA3AF' }]}>
                        {o.orderId}
                        {o.createdAt ? ` · ${new Date(o.createdAt).toLocaleDateString('en-IN')}` : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusColor.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: statusColor.text },
                        ]}
                      >
                        {o.orderStatus}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginVertical: 6 }}>
                    {o.items?.map((it: any, i: number) => (
                      <Text
                        key={i}
                        style={[
                          styles.orderItemText,
                          isDark && { color: '#D1D5DB' },
                        ]}
                      >
                        {it.quantity}× {it.title}{' '}
                        {it.tierLabel ? `(${it.tierLabel})` : ''}
                        {it.price ? ` — ₹${(it.price * it.quantity).toLocaleString('en-IN')}` : ''}
                      </Text>
                    ))}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: Spacing.xs,
                      paddingTop: Spacing.xs,
                      borderTopWidth: 1,
                      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    <Text style={styles.orderTotal}>
                      ₹{o.totalAmount?.toLocaleString('en-IN')}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() =>
                          navigation.navigate('OrderTracking', {
                            orderId: o.orderId || o._id,
                          })
                        }
                      >
                        <MapPin size={11} color="#2563EB" />
                        <Text style={styles.trackBtnText}>Track</Text>
                      </TouchableOpacity>

                      {(o.paymentStatus === 'SUCCESS' ||
                        o.paymentMethod === 'cod' ||
                        o.paymentMethod === 'cash' ||
                        o.paymentMethod === 'razorpay') && (
                        <View style={styles.invoiceRow}>
                          <TouchableOpacity
                            style={styles.invoiceBtn}
                            onPress={() =>
                              setSelectedInvoiceOrderId(o.orderId || o._id)
                            }
                          >
                            <FileText size={12} color={CustomerColors.teal700} />
                            <Text style={styles.invoiceBtnText}>View Bill</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.pdfBtn}
                            onPress={async () => {
                              const url = smartOrderApi.getInvoicePdfUrl(
                                o.orderId || o._id,
                              );
                              try {
                                await Linking.openURL(url);
                              } catch {
                                Alert.alert(
                                  'Download',
                                  'Could not open invoice download.',
                                );
                              }
                            }}
                          >
                            <Download size={11} color="#FFFFFF" />
                            <Text style={styles.pdfBtnText}>PDF</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {canAct ? (
                        <TouchableOpacity
                          style={styles.refundBtn}
                          onPress={() => {
                            setRefundError('');
                            setSelectedRefund({
                              orderId: o.orderId || o._id,
                              totalAmount: o.totalAmount,
                            });
                          }}
                        >
                          <RotateCcw size={12} color="#C2410C" />
                          <Text style={styles.refundBtnText}>
                            {isDelivered ? 'Return & Refund' : 'Cancel Order'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}

      {/* Centered Place Order Card Modal (exact same centered style as compare supplier card) */}
      <Modal
        visible={showPlaceOrderModal && cartLines.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlaceOrderModal(false)}
        statusBarTranslucent
      >
        <View style={styles.placeOrderOverlay}>
          <View style={[styles.placeOrderModalCard, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
            {/* Header */}
            <View style={[styles.placeOrderHeader, isDark && { backgroundColor: '#1F2937', borderBottomColor: '#374151' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.placeOrderModalTitle, isDark && { color: '#FFFFFF' }]}>Place Order</Text>
                <Text style={[styles.placeOrderModalSub, isDark && { color: '#9CA3AF' }]}>
                  {cartLines.length} item{cartLines.length !== 1 ? 's' : ''} ready for checkout
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPlaceOrderModal(false)} style={{ padding: 4 }}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Cart Items List */}
            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ padding: Spacing.md }}>
              {cartLines.map((line, idx) => (
                <View
                  key={`${line.productId}-${idx}`}
                  style={[styles.placeOrderItemRow, isDark && { borderBottomColor: '#1F2937' }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.placeOrderItemTitle, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                      {line.title}
                    </Text>
                    <Text style={[styles.placeOrderItemSub, isDark && { color: '#9CA3AF' }]}>
                      {line.storeName} · {line.qty} units @ ₹{line.price}
                    </Text>
                  </View>
                  <Text style={[styles.placeOrderItemPrice, isDark && { color: '#2DD4BF' }]}>
                    ₹{(line.price * line.qty).toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Footer Summary & Action */}
            <View style={[styles.placeOrderFooter, isDark && { backgroundColor: '#1F2937', borderTopColor: '#374151' }]}>
              <View style={styles.placeOrderSummaryRow}>
                <Text style={[styles.placeOrderTotalLabel, isDark && { color: '#9CA3AF' }]}>Total Amount</Text>
                <Text style={[styles.placeOrderTotalValue, isDark && { color: '#2DD4BF' }]}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.placeOrderModalBtn}
                onPress={() => {
                  setShowPlaceOrderModal(false);
                  if (!user?._id) {
                    setShowAuthModal(true);
                    return;
                  }
                  setShowCheckout(true);
                }}
              >
                <ShoppingBag size={18} color="#fff" />
                <Text style={styles.placeOrderModalBtnText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating pill when place order modal is closed */}
      {view === 'browse' && cartLines.length > 0 && !showPlaceOrderModal && !showCheckout && (
        <TouchableOpacity
          style={styles.floatingCartPill}
          onPress={() => setShowPlaceOrderModal(true)}
        >
          <ShoppingBag size={16} color="#fff" />
          <Text style={styles.floatingCartPillText}>
            View Order ({cartLines.length}) · ₹{cartTotal.toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>
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

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login Required"
        subtitle="Please sign in or register to buy products from Home Sellers."
        onLogin={() => navigateToAuthFlow(navigation)}
      />

      <InvoiceModal
        visible={Boolean(selectedInvoiceOrderId)}
        orderId={selectedInvoiceOrderId || ''}
        onClose={() => setSelectedInvoiceOrderId(null)}
      />

      <RefundModal
        visible={Boolean(selectedRefund)}
        totalAmount={selectedRefund?.totalAmount || 0}
        isSubmitting={isRefunding}
        error={refundError}
        onClose={() => {
          setSelectedRefund(null);
          setRefundError('');
        }}
        onSubmit={handleRefund}
      />
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
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.selectLabel}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.selectInput,
          { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
          disabled && styles.selectDisabled,
        ]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            value ? styles.selectValue : styles.selectPlaceholder,
            { color: value ? '#111827' : '#6B7280' },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color="#4B5563" />
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
            style={[styles.modalSheet, isDark && { backgroundColor: '#111827' }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHeader, isDark && { borderBottomColor: '#1F2937' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, isDark && { borderBottomColor: '#1F2937' }]}
                  onPress={() => {
                    onSelect(item.key, item.label);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: isDark ? '#ffffff' : '#000000' },
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
    marginBottom: Spacing.md,
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
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2563EB',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  pdfBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  refundBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  placeOrderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  placeOrderModalCard: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  placeOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomerColors.mint,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
  },
  placeOrderModalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  placeOrderModalSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  placeOrderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: Spacing.sm,
  },
  placeOrderItemTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  placeOrderItemSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  placeOrderItemPrice: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  placeOrderFooter: {
    padding: Spacing.lg,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: CustomerColors.steelBorder,
    gap: Spacing.md,
  },
  placeOrderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeOrderTotalLabel: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  placeOrderTotalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  placeOrderModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CustomerColors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    elevation: 2,
  },
  placeOrderModalBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSizes.base,
  },
  floatingCartPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  floatingCartPillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  selectLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.sm, color: '#111827', flex: 1, fontWeight: '600' },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#6B7280', flex: 1 },
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
  loginPromptBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  loginPromptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});
