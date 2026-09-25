import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Filter, X, Search, ArrowLeft, Sun, Moon } from 'lucide-react-native';
import { productApi, Product, productId, productImage } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../../components/common/ProductCard';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

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

// Roles that see store-owner pricing instead of the direct-customer price
const STORE_OWNER_ROLES = ['store_owner', 'whole_saler', 'home_business'];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ CategoryProducts: { category?: string; search?: string } }, 'CategoryProducts'>>();
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { theme, toggleTheme, isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const isFetchingRef = React.useRef(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(route.params?.category ?? null);
  const [searchQuery, setSearchQuery] = useState<string>(route.params?.search ?? '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<
    string[]
  >([]);
  const [pricePreset, setPricePreset] = useState(PRICE_PRESETS[0]);

  // Fetch category list for chip selection
  useEffect(() => {
    productApi
      .getCategoriesViaGateway()
      .then(res => {
        const data = res.data;
        const cats = Array.isArray(data)
          ? data.map((c: any) => (typeof c === 'string' ? c : c.name || c.title)).filter(Boolean)
          : [];
        if (cats.length > 0) setCategoriesList(cats);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async (
    pageNum: number,
    isInitial: boolean = false,
    catOverride?: string | null,
    searchOverride?: string,
  ) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const cat = catOverride !== undefined ? catOverride : activeCategory;
      const q = searchOverride !== undefined ? searchOverride : searchQuery;

      const params: Record<string, any> = {
        limit: 20,
        page: pageNum,
        excludeOwnerRole: 'whole_saler,wholesaler',
      };
      if (cat && cat !== 'all' && cat !== 'All') {
        params.category = cat;
      }
      if (q && q.trim()) {
        params.search = q.trim();
      }

      const res = await productApi.getProductsViaGateway(params);
      const data = res.data;
      const rawArr = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : data?.products || [];

      const filteredArr = rawArr.filter(
        (p: any) => p.ownerRole !== 'whole_saler' && p.ownerRole !== 'wholesaler',
      );

      if (isInitial) {
        setProducts(filteredArr);
      } else {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => productId(p)));
          const newItems = filteredArr.filter((p: any) => !existingIds.has(productId(p)));
          return [...prev, ...newItems];
        });
      }

      setHasNextPage(Boolean(data?.hasNextPage));
      if (typeof data?.total === 'number') {
        setTotalCount(data.total);
      }
      setPage(pageNum);
    } catch {
      if (isInitial) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
  }, [activeCategory]);

  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore && !isFetchingRef.current) {
      fetchProducts(page + 1, false);
    }
  };

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
  const categories = useMemo(() => {
    return Array.from(new Set([...categoriesList, ...getUnique('category')]));
  }, [categoriesList, displayProducts]);
  const brands = useMemo(() => getUnique('brand'), [displayProducts]);
  const availabilities = useMemo(() => ['In Stock', 'Out of Stock'], []);

  const getEffectivePrice = (p: Product) => {
    return p.discountedPrice != null &&
      p.discountedPrice > 0 &&
      p.discountedPrice < p.price
      ? p.discountedPrice
      : p.price || 0;
  };

  useEffect(() => {
    const rawCategory = route.params?.category ?? null;
    if (!rawCategory || rawCategory === 'all') {
      setActiveCategory(null);
    } else {
      const slug = rawCategory.trim().toLowerCase();
      const match = categories.find(
        c =>
          c.toLowerCase() === slug ||
          c.toLowerCase().includes(slug) ||
          slug.includes(c.toLowerCase()),
      );
      setActiveCategory(match ?? rawCategory);
    }
    // Refresh / reset search and sub-filters when switching to a new category
    setSearchQuery(route.params?.search ?? '');
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setPricePreset(PRICE_PRESETS[0]);
  }, [route.params?.category, categories]);

  const handleSelectCategory = (cat: string | null) => {
    setActiveCategory(cat);
    // Reset search query and sub-filters for a fresh category view
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setPricePreset(PRICE_PRESETS[0]);
  };

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return displayProducts
      .filter(p => {
        if (
          q &&
          !`${p.title || ''} ${p.brand || ''} ${p.category || ''}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }
        if (
          activeCategory &&
          (p.category || '').toLowerCase() !== activeCategory.toLowerCase()
        )
          return false;
        const effPrice = getEffectivePrice(p);
        if (effPrice < pricePreset.min || effPrice > pricePreset.max)
          return false;
        if (selectedBrands.length && !selectedBrands.includes(p.brand || ''))
          return false;
        if (selectedAvailabilities.length) {
          const isOutOfStock =
            p.totalStock <= 0 || p.availability === 'Out of Stock';
          const status = isOutOfStock ? 'Out of Stock' : 'In Stock';
          if (!selectedAvailabilities.includes(status)) return false;
        }
        return true;
      });
  }, [
    displayProducts,
    activeCategory,
    searchQuery,
    pricePreset,
    selectedBrands,
    selectedAvailabilities,
  ]);

  const hasActiveFilters =
    Boolean(activeCategory) ||
    Boolean(searchQuery) ||
    selectedBrands.length > 0 ||
    selectedAvailabilities.length > 0 ||
    pricePreset.label !== 'All';

  const clearFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setPricePreset(PRICE_PRESETS[0]);
  };

  const handleAddToCart = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    const effectivePrice = getEffectivePrice(p);
    addToCart({
      id: productId(p),
      title: p.title,
      price: effectivePrice,
      quantity: 1,
      image: productImage(p) || '',
      totalStock: p.totalStock,
    });
  };

  const handleBuyNow = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    const effectivePrice = getEffectivePrice(p);
    setBuyNowItem({
      id: productId(p),
      title: p.title,
      price: effectivePrice,
      quantity: 1,
      image: productImage(p) || '',
      totalStock: p.totalStock,
    });
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#0b0f19' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : '#FFFFFF' }]}>
      {/* Search & Top Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: isDark ? '#0f172a' : '#FFFFFF', borderBottomColor: isDark ? '#1e293b' : '#F1F5F9' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}
            style={styles.backHomeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color={isDark ? '#FFFFFF' : CustomerColors.black} />
          </TouchableOpacity>
          <View style={[styles.searchBar, { flex: 1, backgroundColor: isDark ? '#1e293b' : '#F3F4F6', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <Search size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={activeCategory ? `Search in ${activeCategory}…` : "Search all products…"}
              placeholderTextColor={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              style={[styles.searchInput, { color: isDark ? '#FFFFFF' : CustomerColors.black }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.themeToggleBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            {isDark ? (
              <Sun size={18} color="#FBBF24" />
            ) : (
              <Moon size={18} color="#4B5563" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.topBar, { borderBottomColor: isDark ? '#1e293b' : '#EAEAEA', backgroundColor: isDark ? '#0f172a' : '#FFFFFF' }]}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFiltersOpen(o => !o)}
        >
          <Filter size={13} color={CustomerColors.primary} />
          <Text style={styles.filterToggleText}>
            Filters{hasActiveFilters ? ' •' : ''}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.count, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}>{filtered.length} products</Text>
      </View>

      {filtersOpen && (
        <View style={[styles.filtersPanel, { backgroundColor: isDark ? '#111827' : '#FAFAFA', borderBottomColor: isDark ? '#1e293b' : '#EAEAEA' }]}>
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
                isDark={isDark}
                onPress={() =>
                  handleSelectCategory(activeCategory === cat ? null : cat)
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
                isDark={isDark}
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
                isDark={isDark}
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
                  isDark={isDark}
                  onPress={() =>
                    toggle(selectedAvailabilities, setSelectedAvailabilities, a)
                  }
                />
              ))}
            </ScrollView>
          )}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}>
            No products found. Try adjusting your filters.
          </Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
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
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={CustomerColors.primary} />
            </View>
          ) : !hasNextPage && filtered.length > 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8', fontWeight: '600' }}>
                ✦ End of product list ✦
              </Text>
            </View>
          ) : null
        }
      />

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Purchase"
        subtitle="Please sign in or register to complete this purchase."
        onLogin={() => navigation.navigate('LoginRegister')}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  isDark,
  onPress,
}: {
  label: string;
  active: boolean;
  isDark?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderColor: isDark ? '#374151' : '#D1D5DB',
        },
        active && styles.chipActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary },
          active && styles.chipTextActive,
        ]}
      >
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
  searchBarContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backHomeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
    paddingVertical: 0,
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
  empty: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});