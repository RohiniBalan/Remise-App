import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Package, Tag } from 'lucide-react-native';
import { productApi, Product, productImage } from '../../api/productApi';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';

// Landing/grid screen for the "Categories" tab. Previously this tab went
// straight to the filter+product-list screen (now moved to the
// "CategoryProducts" stack route — see CustomerNavigator.tsx). This screen
// only browses/searches categories and hands off to that existing screen;
// none of its filter/sort/cart logic is touched.
//
// Category source: productApi.getCategories() hits the shared /categories
// collection that createCategory() (used by every role — admin defaults,
// store owners, wholesalers, home businesses) writes to, so no per-role
// fetching or filtering is needed to show all of them together. Falls back
// to deriving categories from the product catalog itself if that endpoint
// is ever empty, same technique CategoryScreen already uses via getUnique().

const DEFAULT_STORE_CATEGORIES = [
  'Food & Beverages',
  'Grocery',
  'Fashion',
  'Electronics',
  'Pharmacy',
  'Toys',
  'Home & Living',
  'Beauty',
  'Sports',
  'Other',
];

interface NormalizedCategory {
  id: string;
  name: string;
}

interface CategoryBrowseItem {
  _id: string;
  name: string;
  count: number;
  img?: string;
}

function normalizeCategory(raw: any): NormalizedCategory | null {
  const name = raw?.name || raw?.title || raw?.category || raw?.label;
  if (!name) return null;
  return {
    id: String(raw?._id || raw?.id || name),
    name: String(name),
  };
}

export default function CategoryGridScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [categoryCards, setCategoryCards] = useState<NormalizedCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      productApi.getCategoriesViaGateway(),
      productApi.getProductsViaGateway({
        t: Date.now(),
        ownerRole: 'store_owner',
        limit: 10000,
      }),
    ]).then(([catResult, prodResult]) => {
      if (cancelled) return;

      const prodArr: Product[] =
        prodResult.status === 'fulfilled'
          ? (() => {
              const data = prodResult.value.data;
              return Array.isArray(data)
                ? data
                : data?.products || data?.data || [];
            })()
          : [];
      setProducts(prodArr);

      if (prodResult.status !== 'fulfilled' && __DEV__) {
        console.warn(
          '[CategoryGridScreen] getAll() failed:',
          prodResult.reason?.message,
        );
      }

      const byName = new Map<string, NormalizedCategory>();

      if (catResult.status === 'fulfilled') {
        const rawCats =
          catResult.value.data?.categories ||
          catResult.value.data?.data ||
          catResult.value.data ||
          [];
        (Array.isArray(rawCats) ? rawCats : [])
          .map(normalizeCategory)
          .filter((c): c is NormalizedCategory => c !== null)
          .forEach(c => {
            const key = c.name.toLowerCase();
            if (!byName.has(key)) byName.set(key, c);
          });
      } else if (__DEV__) {
        console.warn(
          '[CategoryGridScreen] getCategories() failed:',
          catResult.reason?.message,
        );
      }

      setCategoryCards(Array.from(byName.values()));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Voice search ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {};
  }, []);

  const startVoiceSearch = async () => {
    if (false) {
      const granted = 'denied';
      if (granted) return;
    }
    try {
      return;
    } catch {}
  };

  const stopVoiceSearch = async () => {
    try {
    } catch {
      // no-op — mic may already be stopped
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const uniqueProductCategories = useMemo(
    () =>
      Array.from(
        new Set(products.map(p => p.category).filter(Boolean)),
      ) as string[],
    [products],
  );

  const visibleCategoryCards = useMemo<CategoryBrowseItem[]>(() => {
    const seen = new Set<string>();
    const names: { name: string; id: string }[] = [];

    const addIfNew = (name: string, id: string) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      names.push({ name, id });
    };

    categoryCards.forEach(c => addIfNew(c.name, c.id));
    DEFAULT_STORE_CATEGORIES.forEach(name => addIfNew(name, `default-${name}`));
    uniqueProductCategories.forEach(name => addIfNew(name, `derived-${name}`));

    return names
      .map(({ name, id }) => {
        const catProducts = products.filter(
          p => (p.category || '').toLowerCase() === name.toLowerCase(),
        );
        const withImage = catProducts.find(p => productImage(p));
        return {
          _id: id,
          name,
          count: catProducts.length,
          img: withImage ? productImage(withImage) : undefined,
        };
      })
      .filter(c => c.count > 0)
      .filter(item =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );
  }, [categoryCards, products, uniqueProductCategories, searchQuery]);

  const goToCategory = (name: string) => {
    navigation.navigate('CategoryProducts', { category: name });
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BrandHeader />
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={18} color={CustomerColors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search categories"
            placeholderTextColor={CustomerColors.textSecondary}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <FlatList
        data={visibleCategoryCards}
        key="category-browse-grid-2"
        numColumns={2}
        keyExtractor={c => c._id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <View style={styles.pageHeading}>
            <Text style={styles.eyebrow}>Browse</Text>
            <Text style={styles.headerTitle}>Shop by Category</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBlock}>
              <View style={styles.loadingIcon}>
                <Package size={18} color={CustomerColors.primary} />
              </View>
              <ActivityIndicator size="small" color={CustomerColors.primary} />
              <Text style={styles.loadingText}>Loading Categories</Text>
            </View>
          ) : (
            <Text style={styles.empty}>No categories found.</Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => goToCategory(item.name)}
            activeOpacity={0.86}
          >
            <View style={styles.imageWrap}>
              {item.img ? (
                <Image source={{ uri: item.img }} style={styles.image} />
              ) : (
                <View style={styles.iconFallback}>
                  <Tag size={22} color={CustomerColors.black} />
                </View>
              )}
            </View>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardCount}>
              {item.count} product{item.count === 1 ? '' : 's'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    height: 46,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  pageHeading: { marginBottom: Spacing.lg },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: CustomerColors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: CustomerColors.black,
  },
  card: {
    width: '48%',
    minHeight: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    backgroundColor: CustomerColors.white,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(15, 163, 177, 0.08)',
  },
  image: { width: '100%', height: '100%' },
  iconFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 163, 177, 0.08)',
  },
  cardName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  cardCount: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  loadingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
  },
  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 10,
    color: CustomerColors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  empty: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});
