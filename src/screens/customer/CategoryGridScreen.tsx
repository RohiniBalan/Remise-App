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
import { Search, Package, Tag, ArrowLeft } from 'lucide-react-native';
import { productApi, Product, productImage } from '../../api/productApi';
import { resolveImageUrl } from '../../utils/imageUrl';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import BrandHeader from '../../components/common/BrandHeader';
import { useTranslation, translateCategory } from '../../i18n';

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
  const { isDark } = useTheme();
  const { t, language } = useTranslation();

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
        limit: 10000,
      }),
    ]).then(([catResult, prodResult]) => {
      if (cancelled) return;

      const rawProdArr: Product[] =
        prodResult.status === 'fulfilled'
          ? (() => {
              const data = prodResult.value.data;
              return Array.isArray(data)
                ? data
                : data?.products || data?.data || [];
            })()
          : [];
      const prodArr = rawProdArr.filter(
        (p: any) => p.ownerRole !== 'whole_saler' && p.ownerRole !== 'wholesaler',
      );
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
      .filter(item => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        const translatedName = translateCategory(item.name, language).toLowerCase();
        return item.name.toLowerCase().includes(q) || translatedName.includes(q);
      });
  }, [categoryCards, products, uniqueProductCategories, searchQuery, language]);

  const goToCategory = (name: string) => {
    navigation.navigate('CategoryProducts', { category: name });
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
      <BrandHeader />
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderColor: isDark ? '#1F2937' : CustomerColors.border }]}>
          <Search size={18} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.searchCategories')}
            placeholderTextColor={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : CustomerColors.black }]}
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
            <View style={styles.pageHeadingRow}>
              <View style={styles.headerTitleContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}
                  style={styles.backHomeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ArrowLeft size={22} color={isDark ? '#FFFFFF' : CustomerColors.black} />
                </TouchableOpacity>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.eyebrow}>{t('common.browse')}</Text>
                  <Text
                    style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : CustomerColors.black }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t('products.shopByCategory')}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.headerCount, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}
                numberOfLines={1}
              >
                {products.length === 1
                  ? t('common.productCount', { count: products.length })
                  : t('common.productsCount', { count: products.length })}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBlock}>
              <View style={styles.loadingIcon}>
                <Package size={18} color={CustomerColors.primary} />
              </View>
              <ActivityIndicator size="small" color={CustomerColors.primary} />
              <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}>
                {t('common.loadingCategories')}
              </Text>
            </View>
          ) : (
            <Text style={[styles.empty, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}>
              {t('common.noCategoriesFound')}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#111827' : CustomerColors.white,
                borderColor: isDark ? '#1F2937' : CustomerColors.border,
              },
            ]}
            onPress={() => goToCategory(item.name)}
            activeOpacity={0.86}
          >
            <View style={[styles.imageWrap, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.15)' }]}>
              {item.img ? (
                <Image source={{ uri: resolveImageUrl(item.img) }} style={styles.image} />
              ) : (
                <View style={[styles.iconFallback, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.15)' }]}>
                  <Tag size={22} color={isDark ? '#FFFFFF' : CustomerColors.black} />
                </View>
              )}
            </View>
            <Text
              style={[styles.cardName, { color: isDark ? '#FFFFFF' : CustomerColors.black }]}
              numberOfLines={2}
            >
              {translateCategory(item.name, language)}
            </Text>
            <Text style={[styles.cardCount, { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }]}>
              {item.count === 1
                ? t('common.productCount', { count: item.count })
                : t('common.productsCount', { count: item.count })}
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
  pageHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  backHomeBtn: {
    padding: 4,
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCount: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    flexShrink: 0,
    textAlign: 'right',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: CustomerColors.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    color: CustomerColors.black,
    flexShrink: 1,
  },
  card: {
    width: '48%',
    minHeight: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    backgroundColor: CustomerColors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
    lineHeight: 18,
    minHeight: 36,
  },
  cardCount: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 4,
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
