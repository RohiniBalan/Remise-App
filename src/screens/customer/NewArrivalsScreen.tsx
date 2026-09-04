import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Filter, X, Sparkles } from 'lucide-react-native';
import { productApi, Product, productId } from '../../api/productApi';
import { NEW_ARRIVAL_WINDOW_DAYS } from '../../api/homeSectionsApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { requireAuthForPurchase } from '../../utils/authGuard';
import ProductCard from '../../components/common/ProductCard';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

// Ported 1:1 from client/app/new-arrivals/page.tsx — same 14-day cutoff window,
// same category / brand / availability / price presets / sort filtering, and
// store-owner role pricing support.

const PRICE_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–1000', min: 500, max: 1000 },
  { label: '₹1000–2500', min: 1000, max: 2500 },
  { label: '₹2500+', min: 2500, max: Infinity },
];

const SORT_OPTIONS = [
  'Newest',
  'Price: Low to High',
  'Price: High to Low',
] as const;

const STORE_OWNER_ROLES = ['store_owner', 'whole_saler', 'home_business'];

export default function NewArrivalsScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [pricePreset, setPricePreset] = useState(PRICE_PRESETS[0]);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('Newest');

  useEffect(() => {
    productApi
      .getProductsViaGateway({
        t: Date.now(),
        ownerRole: 'store_owner',
        limit: 10000,
      })
      .then(res => {
        const data = res.data;
        const arr: Product[] = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];
        setAllProducts(arr);
      })
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const isStoreOwner = STORE_OWNER_ROLES.includes(user?.role || '');

  // 14-day cutoff window — products created/updated within NEW_ARRIVAL_WINDOW_DAYS
  const newArrivalProducts = useMemo(() => {
    const cutoff = Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return allProducts.filter(p => {
      const created = new Date((p as any).createdAt || (p as any).updatedAt || 0).getTime();
      return created >= cutoff;
    });
  }, [allProducts]);

  const displayProducts = useMemo(() => {
    if (!isStoreOwner) return newArrivalProducts;
    return newArrivalProducts.map(p => ({
      ...p,
      price: p.storePrice ?? p.price,
      discountedPrice: p.storeDiscountedPrice ?? p.discountedPrice,
    }));
  }, [newArrivalProducts, isStoreOwner]);

  const getUnique = (key: keyof Product, dataset: Product[]) =>
    Array.from(new Set(dataset.map(p => p[key]).filter(Boolean))) as string[];

  const categories = useMemo(() => getUnique('category', displayProducts), [displayProducts]);

  const categoryScopedProducts = useMemo(() => {
    return activeCategory
      ? displayProducts.filter(p => p.category === activeCategory)
      : displayProducts;
  }, [displayProducts, activeCategory]);

  const brands = useMemo(() => getUnique('brand', categoryScopedProducts), [categoryScopedProducts]);
  const availabilities = useMemo(() => getUnique('availability', categoryScopedProducts), [categoryScopedProducts]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    return displayProducts
      .filter(p => {
        if (activeCategory && p.category !== activeCategory) return false;
        if (p.price < pricePreset.min || p.price > pricePreset.max) return false;
        if (selectedBrands.length && !selectedBrands.includes(p.brand || '')) return false;
        if (selectedAvailabilities.length && !selectedAvailabilities.includes(p.availability || ''))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        return (
          new Date((b as any).createdAt || 0).getTime() -
          new Date((a as any).createdAt || 0).getTime()
        );
      });
  }, [
    displayProducts,
    activeCategory,
    pricePreset,
    selectedBrands,
    selectedAvailabilities,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(activeCategory) ||
    selectedBrands.length > 0 ||
    selectedAvailabilities.length > 0 ||
    pricePreset.label !== 'All';

  const clearFilters = () => {
    setActiveCategory(null);
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setPricePreset(PRICE_PRESETS[0]);
  };

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  };

  const handleAddToCart = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to add items to your cart.',
      })
    )
      return;
    addToCart({
      id: productId(p),
      title: p.title,
      price: p.discountedPrice ?? p.price,
      quantity: 1,
      image: p.images?.[0] ?? p.imageUrl,
      totalStock: p.totalStock,
    });
    showToast('Added to cart ✓');
  };

  const handleBuyNow = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to complete this purchase.',
      })
    )
      return;
    setBuyNowItem({
      id: productId(p),
      title: p.title,
      price: p.discountedPrice ?? p.price,
      quantity: 1,
      image: p.images?.[0] ?? p.imageUrl,
      totalStock: p.totalStock,
    });
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Eyebrow & Filter Bar */}
      <View style={styles.headerBar}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={13} color={GoldColors.gold} />
          <Text style={styles.eyebrowText}>Just In</Text>
        </View>
        <Text style={styles.pageTitle}>
          {activeCategory ? activeCategory : 'New Arrivals'}
        </Text>
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFiltersOpen(o => !o)}
        >
          <Filter size={13} color={CustomerColors.primary} />
          <Text style={styles.filterToggleText}>
            Filters{hasActiveFilters ? ' •' : ''}
          </Text>
        </TouchableOpacity>
        <Text style={styles.count}>{filtered.length} products</Text>
      </View>

      {filtersOpen && (
        <View style={styles.filtersPanel}>
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {categories.map(cat => (
                <Chip
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
                />
              ))}
            </ScrollView>
          )}

          {brands.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {brands.map(b => (
                <Chip
                  key={b}
                  label={b}
                  active={selectedBrands.includes(b)}
                  onPress={() => toggle(selectedBrands, setSelectedBrands, b)}
                />
              ))}
            </ScrollView>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {PRICE_PRESETS.map(preset => (
              <Chip
                key={preset.label}
                label={preset.label}
                active={pricePreset.label === preset.label}
                onPress={() => setPricePreset(preset)}
              />
            ))}
          </ScrollView>

          {availabilities.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {availabilities.map(a => (
                <Chip
                  key={a}
                  label={a}
                  active={selectedAvailabilities.includes(a)}
                  onPress={() => toggle(selectedAvailabilities, setSelectedAvailabilities, a)}
                />
              ))}
            </ScrollView>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {SORT_OPTIONS.map(s => (
              <Chip
                key={s}
                label={s}
                active={sortBy === s}
                onPress={() => setSortBy(s)}
              />
            ))}
          </ScrollView>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <X size={12} color={CustomerColors.primary} />
              <Text style={styles.clearBtnText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        key="grid-2"
        numColumns={2}
        keyExtractor={p => productId(p)}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Sparkles size={32} color={GoldColors.gold} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No new arrivals</Text>
            <Text style={styles.emptySubtitle}>
              Check back soon for latest arrivals or adjust your active filters.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={{
              ...item,
              badge: item.badge || 'NEW',
            }}
            isWished={isWishlisted(productId(item))}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: productId(item),
              })
            }
            onToggleWishlist={() => toggleWishlist(item)}
            onAddToCart={() => handleAddToCart(item)}
            onBuyNow={() => handleBuyNow(item)}
          />
        )}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: GoldColors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    color: CustomerColors.black,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterToggleText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  count: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  filtersPanel: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
  },
  chipRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: Spacing.xs,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  chipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: { color: '#FFF' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  clearBtnText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.primary,
    fontWeight: '700',
  },
  grid: { padding: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
