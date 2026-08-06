import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
  PermissionsAndroid,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  Mic,
  LayoutGrid,
  CarFront,
  Trophy,
  Gift,
  Brain,
  Palette,
  Gamepad2,
  Sparkles,
  Zap,
  ShoppingBasket,
  Shirt,
  Home as HomeIcon,
  Smartphone,
  Heart,
  Star,
} from 'lucide-react-native';
import Voice from '@dev-amirzubair/react-native-voice';
import { productApi, Product, productImage } from '../../api/productApi';
import { GoldColors, CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

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

const ICON_MAP: Record<string, any> = {
  CarFront, Trophy, Gift, Brain, Palette, Gamepad2, Sparkles, Zap,
  ShoppingBasket, Star, Shirt, Home: HomeIcon, Smartphone, Heart,
};

const CARD_TINTS = ['#10B981', '#EC4899', '#F97316', '#8B5CF6', '#0FA3B1', '#3B82F6', GoldColors.gold, CustomerColors.primary];

interface NormalizedCategory {
  id: string;
  name: string;
  image?: string;
  icon?: string;
}

function normalizeCategory(raw: any): NormalizedCategory | null {
  const name = raw?.name || raw?.title || raw?.category || raw?.label;
  if (!name) return null;
  return {
    id: String(raw?._id || raw?.id || name),
    name: String(name),
    image: raw?.image || raw?.img || raw?.imageUrl || raw?.icon_url,
    icon: raw?.icon,
  };
}

export default function CategoryGridScreen() {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<NormalizedCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([productApi.getCategories(), productApi.getAll()]).then(
  ([catResult, prodResult]) => {
    if (cancelled) return;

    const prodArr: Product[] =
      prodResult.status === 'fulfilled'
        ? (() => {
            const d = prodResult.value.data;
            return Array.isArray(d) ? d : d?.products || d?.data || [];
          })()
        : [];
    setProducts(prodArr);

    if (prodResult.status !== 'fulfilled' && __DEV__) {
      console.warn('[CategoryGridScreen] getAll() failed:', prodResult.reason?.message);
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
          if (!byName.has(c.name)) byName.set(c.name, c);
        });
    } else if (__DEV__) {
      console.warn('[CategoryGridScreen] getCategories() failed:', catResult.reason?.message);
    }

    if (byName.size === 0) {
      Array.from(new Set(prodArr.map(p => p.category).filter(Boolean))).forEach(name => {
        byName.set(name as string, { id: name as string, name: name as string });
      });
    }

    setCategories(Array.from(byName.values()));
    setLoading(false);
  },
);

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Voice search ──────────────────────────────────────────────────────
  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      const text = e?.value?.[0];
      if (text) setQuery(text);
    };
    Voice.onSpeechEnd = () => setListening(false);
    Voice.onSpeechError = () => setListening(false);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  const startVoiceSearch = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    try {
      setListening(true);
      await Voice.start('en-US');
    } catch {
      setListening(false);
    }
  };

  const stopVoiceSearch = async () => {
    try {
      await Voice.stop();
    } catch {
      // no-op — mic may already be stopped
    }
    setListening(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const countsByName = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      if (!p.category) return;
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return map;
  }, [products]);

  const imageByName = useMemo(() => {
    const map = new Map<string, string | undefined>();
    products.forEach(p => {
      if (p.category && !map.has(p.category)) map.set(p.category, productImage(p));
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const goToCategory = (name: string) => {
    navigation.navigate('CategoryProducts', { category: name });
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={GoldColors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Shop by Category</Text>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search categories"
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.micBtn, listening && styles.micBtnActive]}
            onPress={listening ? stopVoiceSearch : startVoiceSearch}
          >
            <Mic size={16} color={listening ? '#000' : GoldColors.goldDark} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        key="category-grid-2"
        numColumns={2}
        keyExtractor={c => c.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No categories found.
          </Text>
        }
        renderItem={({ item, index }) => {
          const Icon = ICON_MAP[item.icon || ''] || LayoutGrid;
          const tint = CARD_TINTS[index % CARD_TINTS.length];
          const count = countsByName.get(item.name);
          const image = item.image || imageByName.get(item.name);

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, Shadows.card]}
              onPress={() => goToCategory(item.name)}
              activeOpacity={0.85}
            >
              <View style={styles.imageWrap}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <View style={[styles.iconFallback, { backgroundColor: tint }]}>
                    <Icon size={26} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              {typeof count === 'number' && (
                <Text style={[styles.cardCount, { color: theme.textSecondary }]}>
                  {count} {count === 1 ? 'product' : 'products'}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const lightTheme = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: CustomerColors.textSecondary,
  border: '#EAEAEA',
};

const darkTheme = {
  bg: '#0D0D0D',
  surface: '#161616',
  text: '#F0EAD6',
  textSecondary: '#9A8E7A',
  border: '#262626',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 4,
  },
  searchInput: { flex: 1, fontSize: FontSizes.sm, padding: 0 },
  micBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  micBtnActive: { backgroundColor: GoldColors.gold },
  grid: { padding: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  card: { flex: 1, borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.sm, alignItems: 'center' },
  imageWrap: { width: '100%', aspectRatio: 1.4, borderRadius: BorderRadius.sm, overflow: 'hidden', marginBottom: Spacing.xs },
  image: { width: '100%', height: '100%' },
  iconFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: FontSizes.sm, fontWeight: '700', alignSelf: 'flex-start' },
  cardCount: { fontSize: FontSizes.xs, marginTop: 2, alignSelf: 'flex-start' },
  empty: { textAlign: 'center', marginTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
});