import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Filter, X } from 'lucide-react-native';
import { productApi, Product, productId } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { requireAuthForPurchase } from '../../utils/authGuard';

// Ported from client/app/category/[categoryId]/page.tsx — same single
// full-catalog fetch, same client-side filter/sort logic (category
// single-select, brand multi-select, availability multi-select, a max-price
// filter, and 3 sort modes). The price *slider* is replaced with preset
// range buttons (Under 500 / 500-1000 / 1000-2500 / 2500+ / All) to avoid
// pulling in a native slider dependency for one control — same filtering
// behavior, different input widget, per the plan's "redesign UI, keep
// functionality identical" rule. Wishlist is local-only state, matching web
// (never persisted there either).

const PRICE_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–1000', min: 500, max: 1000 },
  { label: '₹1000–2500', min: 1000, max: 2500 },
  { label: '₹2500+', min: 2500, max: Infinity },
];

const SORT_OPTIONS = [
  'Best selling',
  'Price: Low to High',
  'Price: High to Low',
] as const;

// Roles that see store-owner pricing instead of the direct-customer price
const STORE_OWNER_ROLES = ['store_owner', 'whole_saler', 'home_business'];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ CategoryProducts: { category?: string } }, 'CategoryProducts'>>();
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(route.params?.category ?? null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<
    string[]
  >([]);
  const [pricePreset, setPricePreset] = useState(PRICE_PRESETS[0]);
  const [sortBy, setSortBy] =
    useState<(typeof SORT_OPTIONS)[number]>('Best selling');
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    productApi
      .getAll()
      .then(res => {
        const data = res.data;
        const arr = Array.isArray(data)
          ? data
          : data.products || data.data || [];
        setProducts(arr);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setActiveCategory(route.params?.category ?? null);
  }, [route.params?.category]);
  
  const isStoreOwner = STORE_OWNER_ROLES.includes(user?.role || '');
  // Store-owner buyers see storePrice/storeDiscountedPrice (falling back to
  // the regular customer price if the seller didn't set a store price).
  // Recomputes whenever isStoreOwner changes (e.g. AuthContext finishes
  // loading the user from storage after this screen's initial render).
  const displayProducts = useMemo(() => {
    if (!isStoreOwner) return products;
    return products.map(p => ({
      ...p,
      price: p.storePrice ?? p.price,
      discountedPrice: p.storeDiscountedPrice ?? p.discountedPrice,
    }));
  }, [products, isStoreOwner]);

  const getUnique = (key: keyof Product) =>
    Array.from(new Set(displayProducts.map(p => p[key]).filter(Boolean))) as string[];
  const categories = useMemo(() => getUnique('category'), [displayProducts]);
  const brands = useMemo(() => getUnique('brand'), [displayProducts]);
  const availabilities = useMemo(() => getUnique('availability'), [displayProducts]);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    );

  const filtered = useMemo(() => {
    return displayProducts
      .filter(p => {
        if (activeCategory && p.category !== activeCategory) return false;
        if (p.price < pricePreset.min || p.price > pricePreset.max)
          return false;
        if (selectedBrands.length && !selectedBrands.includes(p.brand || ''))
          return false;
        if (
          selectedAvailabilities.length &&
          !selectedAvailabilities.includes(p.availability || '')
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        return 0;
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
      price: p.price,
      quantity: 1,
      image: p.images?.[0] ?? p.imageUrl,
      totalStock: p.totalStock,
    });
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
      price: p.price,
      quantity: 1,
      image: p.images?.[0] ?? p.imageUrl,
      totalStock: p.totalStock,
    });
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GoldColors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFiltersOpen(o => !o)}
        >
          <Filter size={13} color={GoldColors.goldDark} />
          <Text style={styles.filterToggleText}>
            Filters{hasActiveFilters ? ' •' : ''}
          </Text>
        </TouchableOpacity>
        <Text style={styles.count}>{filtered.length} products</Text>
      </View>

      {filtersOpen && (
        <View style={styles.filtersPanel}>
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
                onPress={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
              />
            ))}
          </ScrollView>
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
                  onPress={() =>
                    toggle(selectedAvailabilities, setSelectedAvailabilities, a)
                  }
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
              <X size={12} color={GoldColors.goldDark} />
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
          <Text style={styles.empty}>
            No products found. Try adjusting your filters.
          </Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isWished={wishlist.includes(productId(item))}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: productId(item),
              })
            }
            onToggleWishlist={() =>
              toggle(wishlist, setWishlist, productId(item))
            }
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
    color: GoldColors.goldDark,
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
    backgroundColor: GoldColors.gold,
    borderColor: GoldColors.gold,
  },
  chipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: { color: '#000' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  clearBtnText: {
    fontSize: FontSizes.xs,
    color: GoldColors.goldDark,
    fontWeight: '700',
  },
  grid: { padding: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  empty: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});