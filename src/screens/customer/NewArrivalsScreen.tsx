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
import { Filter, X, Sparkles, ArrowLeft } from 'lucide-react-native';
import { productApi, Product, productId, productImage } from '../../api/productApi';
import { NEW_ARRIVAL_WINDOW_DAYS, fetchNewArrivals } from '../../api/homeSectionsApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, translateCategory } from '../../i18n';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

const NEW_ARRIVALS_I18N: Record<string, Record<string, string>> = {
  en: {
    justIn: 'Just In',
    newArrivals: 'New Arrivals',
    filters: 'Filters',
    productsCount: '{count} products',
    noNewArrivals: 'No new arrivals',
    noNewArrivalsDesc: 'Check back soon for latest arrivals or adjust your active filters.',
    clearAllFilters: 'Clear all filters',
    all: 'All',
    under500: 'Under ₹500',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'Newest',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    endOfNewArrivals: '✦ End of new arrivals ✦',
    addedToCart: 'Added to cart ✓',
    loginToPurchase: 'Login to Purchase',
    loginToPurchaseDesc: 'Please sign in or register to complete this purchase.',
  },
  ta: {
    justIn: 'புதிய வரவு',
    newArrivals: 'புதிய வரவுகள்',
    filters: 'வடிகட்டிகள்',
    productsCount: '{count} பொருட்கள்',
    noNewArrivals: 'புதிய வரவுகள் எதுவும் இல்லை',
    noNewArrivalsDesc: 'சமீபத்திய வரவுகளுக்கு விரைவில் மீண்டும் சரிபார்க்கவும் அல்லது வடிகட்டிகளை மாற்றவும்.',
    clearAllFilters: 'அனைத்து வடிகட்டிகளையும் நீக்கு',
    all: 'அனைத்தும்',
    under500: '₹500க்கு கீழ்',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'புதியவை',
    priceLowToHigh: 'விலை: குறைவு முதல் அதிகம்',
    priceHighToLow: 'விலை: அதிகம் முதல் குறைவு',
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'இருப்பில் இல்லை',
    endOfNewArrivals: '✦ புதிய வரவுகளின் முடிவு ✦',
    addedToCart: 'கூடையில் சேர்க்கப்பட்டது ✓',
    loginToPurchase: 'வாங்க உள்நுழையவும்',
    loginToPurchaseDesc: 'இந்த வாங்குதலை முடிக்க உள்நுழையவும் அல்லது பதிவு செய்யவும்.',
  },
  te: {
    justIn: 'కొత్తగా వచ్చినవి',
    newArrivals: 'కొత్తగా వచ్చినవి',
    filters: 'ఫిల్టర్లు',
    productsCount: '{count} ఉత్పత్తులు',
    noNewArrivals: 'కొత్తగా వచ్చినవి ఏవీ లేవు',
    noNewArrivalsDesc: 'తాజా రాకల కోసం త్వరలో మళ్లీ తనిఖీ చేయండి లేదా మీ ఫిల్టర్‌లను సర్దుబాటు చేయండి.',
    clearAllFilters: 'అన్ని ఫిల్టర్‌లను క్లియర్ చేయండి',
    all: 'అన్నీ',
    under500: '₹500 లోపు',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'సరికొత్తవి',
    priceLowToHigh: 'ధర: తక్కువ నుండి ఎక్కువ',
    priceHighToLow: 'ధర: ఎక్కువ నుండి తక్కువ',
    inStock: 'స్టాక్‌లో ఉంది',
    outOfStock: 'స్టాక్ అయిపోయింది',
    endOfNewArrivals: '✦ కొత్తగా వచ్చిన వాటి ముగింపు ✦',
    addedToCart: 'కార్ట్‌కు జోడించబడింది ✓',
    loginToPurchase: 'కొనుగోలు చేయడానికి లాగిన్ చేయండి',
    loginToPurchaseDesc: 'ఈ కొనుగోలును పూర్తి చేయడానికి దయచేసి లాగిన్ అవ్వండి లేదా నమోదు చేసుకోండి.',
  },
  kn: {
    justIn: 'ಹೊಸ ಆಗಮನ',
    newArrivals: 'ಹೊಸ ಆಗಮನಗಳು',
    filters: 'ಫಿಲ್ಟರ್‌ಗಳು',
    productsCount: '{count} ಉತ್ಪನ್ನಗಳು',
    noNewArrivals: 'ಯಾವುದೇ ಹೊಸ ಆಗಮನಗಳಿಲ್ಲ',
    noNewArrivalsDesc: 'ಇತ್ತೀಚಿನ ಆಗಮನಗಳಿಗಾಗಿ ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ.',
    clearAllFilters: 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
    all: 'ಎಲ್ಲವೂ',
    under500: '₹500 ಒಳಗೆ',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'ಹೊಸದು',
    priceLowToHigh: 'ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು',
    priceHighToLow: 'ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ',
    inStock: 'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ',
    outOfStock: 'ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ',
    endOfNewArrivals: '✦ ಹೊಸ ಆಗಮನಗಳ ಅಂತ್ಯ ✦',
    addedToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ ✓',
    loginToPurchase: 'ಖರೀದಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ',
    loginToPurchaseDesc: 'ಈ ಖರೀದಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ ಅಥವಾ ನೋಂದಾಯಿಸಿ.',
  },
  ml: {
    justIn: 'പുതിയ വരവുകൾ',
    newArrivals: 'പുതിയ വരവുകൾ',
    filters: 'ഫിൽട്ടറുകൾ',
    productsCount: '{count} ഉൽപ്പന്നങ്ങൾ',
    noNewArrivals: 'പുതിയ വരവുകളൊന്നുമില്ല',
    noNewArrivalsDesc: 'ഏറ്റവും പുതിയ വരവുകൾക്കായി ഉടൻ വീണ്ടും പരിശോധിക്കുക അല്ലെങ്കിൽ ഫിൽട്ടറുകൾ ക്രമീകരിക്കുക.',
    clearAllFilters: 'എല്ലാ ഫിൽട്ടറുകളും മായ്‌ക്കുക',
    all: 'എല്ലാം',
    under500: '₹500 ന് താഴെ',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'ഏറ്റവും പുതിയത്',
    priceLowToHigh: 'വില: കുറഞ്ഞതിൽ നിന്ന് കൂടിയതിലേക്ക്',
    priceHighToLow: 'വില: കൂടിയതിൽ നിന്ന് കുറഞ്ഞതിലേക്ക്',
    inStock: 'സ്റ്റോക്കുണ്ട്',
    outOfStock: 'സ്റ്റോക്ക് തീർന്നു',
    endOfNewArrivals: '✦ പുതിയ വരവുകളുടെ അവസാനം ✦',
    addedToCart: 'കാർട്ടിലേക്ക് ചേർത്തു ✓',
    loginToPurchase: 'വാങ്ങാൻ ലോഗിൻ ചെയ്യുക',
    loginToPurchaseDesc: 'ഈ വാങ്ങൽ പൂർത്തിയാക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക അല്ലെങ്കിൽ രജിസ്റ്റർ ചെയ്യുക.',
  },
  hi: {
    justIn: 'अभी आया',
    newArrivals: 'नए आगमन',
    filters: 'फ़िल्टर',
    productsCount: '{count} उत्पाद',
    noNewArrivals: 'कोई नया आगमन नहीं है',
    noNewArrivalsDesc: 'नवीनतम आगमन के लिए जल्द ही दोबारा जांचें या अपने फ़िल्टर समायोजित करें।',
    clearAllFilters: 'सभी फ़िल्टर साफ़ करें',
    all: 'सभी',
    under500: '₹500 से कम',
    from500to1000: '₹500–1000',
    from1000to2500: '₹1000–2500',
    above2500: '₹2500+',
    newest: 'नवीनतम',
    priceLowToHigh: 'कीमत: कम से ज्यादा',
    priceHighToLow: 'कीमत: ज्यादा से कम',
    inStock: 'स्टॉक में है',
    outOfStock: 'स्टॉक समाप्त',
    endOfNewArrivals: '✦ नए आगमन समाप्त ✦',
    addedToCart: 'कार्ट में जोड़ा गया ✓',
    loginToPurchase: 'खरीदने के लिए लॉगिन करें',
    loginToPurchaseDesc: 'इस खरीदारी को पूरा करने के लिए कृपया लॉगिन करें या पंजीकरण करें।',
  },
};

const PRICE_PRESET_DEFS = [
  { key: 'all', min: 0, max: Infinity },
  { key: 'under500', min: 0, max: 500 },
  { key: 'from500to1000', min: 500, max: 1000 },
  { key: 'from1000to2500', min: 1000, max: 2500 },
  { key: 'above2500', min: 2500, max: Infinity },
] as const;

type SortKey = 'newest' | 'priceLowToHigh' | 'priceHighToLow';
const SORT_KEY_LIST: SortKey[] = ['newest', 'priceLowToHigh', 'priceHighToLow'];

const STORE_OWNER_ROLES = ['store_owner', 'whole_saler', 'home_business'];

export default function NewArrivalsScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const txt = NEW_ARRIVALS_I18N[language] || NEW_ARRIVALS_I18N.en;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const isFetchingRef = React.useRef(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  const pricePreset = useMemo(
    () => PRICE_PRESET_DEFS.find(p => p.key === selectedPresetKey) || PRICE_PRESET_DEFS[0],
    [selectedPresetKey],
  );

  const fetchProducts = async (pageNum: number, isInitial: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let filteredArr: Product[] = [];
      let next = false;
      let total = 0;

      const res = await productApi.getProductsViaGateway({
        sort: 'newest',
        limit: 50,
        page: pageNum,
        excludeOwnerRole: 'whole_saler,wholesaler',
      });
      const data = res.data;
      const rawArr: Product[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : data?.products || [];

      filteredArr = rawArr.filter(
        (p: any) => p.ownerRole !== 'whole_saler' && p.ownerRole !== 'wholesaler',
      );
      next = Boolean(data?.hasNextPage);
      if (typeof data?.total === 'number') total = data.total;

      // Fallback: If gateway returned empty array on initial load, try homeSectionsApi
      if (filteredArr.length === 0 && isInitial) {
        const fallbackItems = await fetchNewArrivals(true);
        if (fallbackItems && fallbackItems.length > 0) {
          filteredArr = fallbackItems;
          total = fallbackItems.length;
        }
      }

      if (isInitial) {
        setAllProducts(filteredArr);
      } else {
        setAllProducts(prev => {
          const existingIds = new Set(prev.map(p => productId(p)));
          const newItems = filteredArr.filter((p: any) => !existingIds.has(productId(p)));
          return [...prev, ...newItems];
        });
      }

      setHasNextPage(next);
      setTotalCount(total);
      setPage(pageNum);
    } catch {
      if (isInitial) {
        try {
          const fallbackItems = await fetchNewArrivals(true);
          if (fallbackItems && fallbackItems.length > 0) {
            setAllProducts(fallbackItems);
            setTotalCount(fallbackItems.length);
            setHasNextPage(false);
          } else {
            setAllProducts([]);
          }
        } catch {
          setAllProducts([]);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore && !isFetchingRef.current) {
      fetchProducts(page + 1, false);
    }
  };

  const isStoreOwner = STORE_OWNER_ROLES.includes(user?.role || '');

  // 14-day cutoff window — products created/updated within NEW_ARRIVAL_WINDOW_DAYS
  // If no products were added strictly within the 14-day window, graceful fallback to newest available products
  const newArrivalProducts = useMemo(() => {
    const cutoff = Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const fresh = allProducts.filter(p => {
      const created = new Date((p as any).createdAt || (p as any).updatedAt || 0).getTime();
      return created >= cutoff;
    });
    return fresh.length > 0 ? fresh : allProducts;
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
        if (sortBy === 'priceLowToHigh') return a.price - b.price;
        if (sortBy === 'priceHighToLow') return b.price - a.price;
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
    selectedPresetKey !== 'all';

  const clearFilters = () => {
    setActiveCategory(null);
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setSelectedPresetKey('all');
  };

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  };

  const handleAddToCart = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    addToCart({
      id: productId(p),
      title: p.title,
      price: p.discountedPrice ?? p.price,
      quantity: 1,
      image: productImage(p) || '',
      totalStock: p.totalStock,
    });
    showToast(txt.addedToCart);
  };

  const handleBuyNow = (p: Product) => {
    if (p.totalStock <= 0) return;
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    setBuyNowItem({
      id: productId(p),
      title: p.title,
      price: p.discountedPrice ?? p.price,
      quantity: 1,
      image: productImage(p) || '',
      totalStock: p.totalStock,
    });
    navigation.navigate('Checkout');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerTabs', { screen: 'Home' });
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, isDark && { backgroundColor: '#0B1120' }]}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#0B1120' }]}>
      {/* Header Eyebrow & Filter Bar */}
      <View style={[styles.headerBar, isDark && { backgroundColor: '#0F172A', borderBottomColor: '#1E293B' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backHomeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color={isDark ? '#FFFFFF' : CustomerColors.black} />
          </TouchableOpacity>
          <View>
            <View style={styles.eyebrowRow}>
              <Sparkles size={13} color={CustomerColors.primary} />
              <Text style={styles.eyebrowText}>{txt.justIn}</Text>
            </View>
            <Text style={[styles.pageTitle, isDark && { color: '#FFFFFF' }]}>
              {activeCategory ? translateCategory(activeCategory, language) : txt.newArrivals}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.topBar, isDark && { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }]}>
        <TouchableOpacity
          style={[styles.filterToggle, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          onPress={() => setFiltersOpen(o => !o)}
        >
          <Filter size={13} color={CustomerColors.primary} />
          <Text style={[styles.filterToggleText, isDark && { color: '#F1F5F9' }]}>
            {txt.filters}{hasActiveFilters ? ' •' : ''}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.count, isDark && { color: '#94A3B8' }]}>
          {txt.productsCount.replace('{count}', String(filtered.length))}
        </Text>
      </View>

      {filtersOpen && (
        <View style={[styles.filtersPanel, isDark && { backgroundColor: '#0F172A', borderBottomColor: '#1E293B' }]}>
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {categories.map(cat => (
                <Chip
                  key={cat}
                  label={translateCategory(cat, language)}
                  active={activeCategory === cat}
                  isDark={isDark}
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
                  isDark={isDark}
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
            {PRICE_PRESET_DEFS.map(preset => (
              <Chip
                key={preset.key}
                label={txt[preset.key] || preset.key}
                active={selectedPresetKey === preset.key}
                isDark={isDark}
                onPress={() => setSelectedPresetKey(preset.key)}
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
                  label={a === 'In Stock' ? txt.inStock : a === 'Out of Stock' ? txt.outOfStock : a}
                  active={selectedAvailabilities.includes(a)}
                  isDark={isDark}
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
            {SORT_KEY_LIST.map(s => (
              <Chip
                key={s}
                label={txt[s] || s}
                active={sortBy === s}
                isDark={isDark}
                onPress={() => setSortBy(s)}
              />
            ))}
          </ScrollView>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <X size={12} color={CustomerColors.primary} />
              <Text style={styles.clearBtnText}>{txt.clearAllFilters}</Text>
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
          <View style={styles.emptyWrap}>
            <Sparkles size={32} color={CustomerColors.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>{txt.noNewArrivals}</Text>
            <Text style={[styles.emptySubtitle, isDark && { color: '#94A3B8' }]}>
              {txt.noNewArrivalsDesc}
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
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={CustomerColors.primary} />
            </View>
          ) : !hasNextPage && filtered.length > 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8', fontWeight: '600' }}>
                {txt.endOfNewArrivals}
              </Text>
            </View>
          ) : null
        }
      />

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={txt.loginToPurchase}
        subtitle={txt.loginToPurchaseDesc}
        onLogin={() => navigation.navigate('LoginRegister')}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  isDark = false,
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
        isDark && { backgroundColor: '#1E293B', borderColor: '#334155' },
        active && styles.chipActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          isDark && { color: '#CBD5E1' },
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
  headerBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  backHomeBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.primary,
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
