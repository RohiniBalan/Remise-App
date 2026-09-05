import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Tag,
  Bell,
  ShoppingCart,
  ChevronRight,
  User,
  Package,
  Percent,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
  MapPin,
  Clock,
  Navigation,
  WifiOff,
  Star,
  Heart,
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
  Apple,
  Carrot,
  Flower2,
  Pill,
  Dumbbell,
} from 'lucide-react-native';
import HeroCarousel from '../../components/home/HeroCarousel';
import HomeFooter from '../../components/home/HomeFooter';
import BrandHeader from '../../components/common/BrandHeader';
import { offersApi } from '../../api/offersApi';
import {
  CategoryItem,
  BestSellerItem,
  CATEGORY_FALLBACK,
  BEST_SELLER_FALLBACK,
  buildCategoryItems,
  fetchBestSellers,
  fetchNewArrivals,
} from '../../api/homeSectionsApi';
import { Product, productId, productImage } from '../../api/productApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { GATEWAY_URL } from '../../api/endpoints';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The actual Home screen — previously this file was an accidental duplicate
// of components/home/HeroCarousel.tsx (the carousel only). Rebuilt to match
// client/app/(root)/page.tsx section-for-section: Hero → Deals/Info strip →
// Shop by Offers Nearby (location-gated, offersApi.getNearby) → Shop by
// Category (real /shopbycategory endpoint + icons) → Best Sellers (real
// /bestsellers endpoint) → Footer. Category/Best Sellers previously derived
// from the generic product list, which isn't how web actually sources them —
// swapped for the same dedicated endpoints + fallback data web uses.

interface NearbyOffer {
  _id: string;
  title: string;
  image: string;
  storeName: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  validUntil: string;
  distanceKm: number;
}

type NearbyStatus = 'idle' | 'locating' | 'loading' | 'done' | 'denied' | 'error';

const DEAL_STRIP = [
  { icon: Percent, title: 'Up to 50% Off', subtitle: 'On select products', color: '#FF0000', route: 'Categories' },
  { icon: MapPin, title: 'Nearby Offers', subtitle: 'Deals around you', color: '#0FA3B1', route: 'Nearby' },
  { icon: ShoppingBasket, title: 'Monthly / Bulk Buy', subtitle: 'Scan your purchase list', color: '#0d9488', route: 'BulkPurchase' },
  { icon: Clock, title: 'Flash Sales', subtitle: 'Limited time deals', color: '#9333ea', route: 'Categories' },
];

const INFO_STRIP = [
  { icon: Truck, title: 'Free Delivery', subtitle: 'On orders ₹499+' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: '100% protected' },
  { icon: RefreshCw, title: 'Easy Returns', subtitle: '7-day return policy' },
  { icon: Tag, title: 'Best Prices', subtitle: 'Lowest guaranteed' },
];

// Same icon set client/app/components-sections/ShopByCategorySection.tsx
// maps `item.icon` (a string from the API) against.
const ICON_MAP: Record<string, any> = {
  CarFront, Trophy, Gift, Brain, Palette, Gamepad2, Sparkles, Zap,
  ShoppingBasket, Star, Shirt, Home: HomeIcon, Smartphone, Heart,
  Apple, Carrot, Flower2, Pill, Dumbbell, Package,
};

// Web colors these via arbitrary Tailwind gradient classes per category
// (`item.color`, e.g. 'from-green-400 to-emerald-600') which don't translate
// to React Native styles — cycling a fixed palette by index gives the same
// "each category has its own color" feel without parsing Tailwind classes.
const CATEGORY_TINTS = ['#10B981', '#EC4899', '#F97316', '#8B5CF6', '#0FA3B1', '#3B82F6'];

export default function HomeScreen() {
  console.log('HOME SCREEN MOUNTED');
  
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { cart, cartCount, addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { unreadCount } = useUnreadNotifications();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  // ── Shop by Offers Nearby — mirrors ShopByOffersNearbySection.tsx's
  // status machine exactly (idle → locating → loading → done/denied/error),
  // including only auto-detecting when the OS already has permission
  // granted (never force-prompting on page load the way NearbyOffersScreen
  // does), same as web's `navigator.permissions.query` check.
  const [nearbyStatus, setNearbyStatus] = useState<NearbyStatus>('idle');
  const [nearbyOffers, setNearbyOffers] = useState<NearbyOffer[]>([]);

  useEffect(() => {
    // Fetch real data from the product-service via the gateway — same
    // approach the web's ShopByCategorySection.tsx and BestSellersSection.tsx
    // use (fetches /api/categories + /api/products from product-service).
    buildCategoryItems()
      .then(items => setCategories(items))
      .catch(() => setCategories(CATEGORY_FALLBACK));

    fetchBestSellers()
      .then(items => setBestSellers(items))
      .catch(() => setBestSellers(BEST_SELLER_FALLBACK));

    fetchNewArrivals()
      .then(items => setNewArrivals(items.slice(0, 10)))
      .catch(() => setNewArrivals([]));
  }, []);

  const fetchNearbyOffers = useCallback(async (lat?: number, lng?: number) => {
    setNearbyStatus('loading');
    try {
      if (lat !== undefined && lng !== undefined) {
        const res = await offersApi.getNearby(lat, lng, 10);
        const data = res.data?.data || [];
        if (data.length > 0) {
          setNearbyOffers(data);
          setNearbyStatus('done');
          return;
        }
      }
      // If no specific nearby data or coordinates not provided, fetch active offers
      const activeRes = await offersApi.getActive(10);
      const activeData = activeRes.data?.data || [];
      setNearbyOffers(activeData);
      setNearbyStatus('done');
    } catch {
      try {
        const activeRes = await offersApi.getActive(10);
        const activeData = activeRes.data?.data || [];
        setNearbyOffers(activeData);
        setNearbyStatus('done');
      } catch {
        setNearbyStatus('error');
      }
    }
  }, []);

  const detectLocation = useCallback(() => {
    setNearbyStatus('locating');
    Geolocation.getCurrentPosition(
      pos => fetchNearbyOffers(pos.coords.latitude, pos.coords.longitude),
      () => {
        // If location is denied or unavailable, fallback to active offers seamlessly
        fetchNearbyOffers();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, [fetchNearbyOffers]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
        if (granted) {
          detectLocation();
        } else {
          fetchNearbyOffers();
        }
      });
    } else {
      fetchNearbyOffers();
    }
  }, [detectLocation, fetchNearbyOffers]);

  const handleEnableLocation = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        fetchNearbyOffers();
        return;
      }
    }
    detectLocation();
  };

  const initial = useMemo(() => (user?.fullname || user?.name || user?.email || '?').trim().charAt(0).toUpperCase(), [user]);

  const goToMenuItem = (route: string) => {
    setMenuOpen(false);
    navigation.navigate(route);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    // AppNavigator's RoleGate switches to AuthNavigator automatically once
    // token/user are cleared — no explicit navigation needed here.
  };

  const resolveImage = (img?: string) => {
    if (!img) return 'https://via.placeholder.com/300x200?text=Offer';
    return img.startsWith('http') ? img : `${GATEWAY_URL}${img}`;
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BrandHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        {!user && (
          <View style={styles.guestLoginCard}>
            <View style={styles.guestLoginIconBg}>
              <LogIn size={18} color={CustomerColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestLoginTitle}>Welcome to REmise</Text>
              <Text style={styles.guestLoginSubtitle}>Sign in for offers, wishlist & faster checkout</Text>
            </View>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => navigation.navigate('LoginRegister')}
              activeOpacity={0.85}
            >
              <Text style={styles.guestLoginBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
        <HeroCarousel />

        {/* ── Deal Strip ── */}
        <View style={styles.dealStrip}>
          {DEAL_STRIP.map(deal => (
            <TouchableOpacity
              key={deal.title}
              style={styles.dealCard}
              onPress={() => navigation.navigate(deal.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.dealIconBox, { backgroundColor: deal.color }]}>
                <deal.icon size={15} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dealTitle} numberOfLines={1}>{deal.title}</Text>
                <Text style={styles.dealSubtitle} numberOfLines={1}>{deal.subtitle}</Text>
              </View>
              <ChevronRight size={13} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoStrip}>
          {INFO_STRIP.map(item => (
            <View key={item.title} style={styles.infoItem}>
              <item.icon size={16} color={CustomerColors.teal600} />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>{item.title}</Text>
                <Text style={styles.infoSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Shop by Offers Nearby ─────────────────────────────────────── */}
        <Section title="Shop by Offers Nearby" onViewAll={() => navigation.navigate('Nearby')}>
          {nearbyStatus === 'idle' && (
            <View style={styles.locationPrompt}>
              <View style={styles.locationPromptIcon}>
                <Navigation size={22} color={CustomerColors.teal600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationPromptTitle}>Discover deals near you</Text>
                <Text style={styles.locationPromptSubtitle}>Allow location access to see exclusive offers from nearby stores.</Text>
              </View>
              <TouchableOpacity style={styles.enableLocationBtn} onPress={handleEnableLocation}>
                <MapPin size={13} color="#fff" />
                <Text style={styles.enableLocationBtnText}>Enable</Text>
              </TouchableOpacity>
            </View>
          )}

          {(nearbyStatus === 'locating' || nearbyStatus === 'loading') && (
            <View style={styles.nearbyCenter}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={styles.nearbyCenterText}>{nearbyStatus === 'locating' ? 'Getting your location…' : 'Finding nearby deals…'}</Text>
            </View>
          )}

          {nearbyStatus === 'denied' && (
            <View style={[styles.locationPrompt, styles.deniedPrompt]}>
              <View style={[styles.locationPromptIcon, styles.deniedIcon]}>
                <WifiOff size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationPromptTitle}>Location access denied</Text>
                <Text style={styles.locationPromptSubtitle}>Enable location in settings to see nearby offers.</Text>
              </View>
              <TouchableOpacity style={styles.browseAllBtn} onPress={() => navigation.navigate('Nearby')}>
                <Text style={styles.browseAllBtnText}>Browse All</Text>
              </TouchableOpacity>
            </View>
          )}

          {nearbyStatus === 'error' && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>Couldn't load nearby offers.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={detectLocation}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {nearbyStatus === 'done' && nearbyOffers.length === 0 && (
            <View style={styles.nearbyEmpty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.locationPromptTitle}>No offers found nearby</Text>
              <TouchableOpacity style={styles.enableLocationBtn} onPress={() => navigation.navigate('Nearby')}>
                <Text style={styles.enableLocationBtnText}>Explore All Offers</Text>
              </TouchableOpacity>
            </View>
          )}

          {nearbyStatus === 'done' && nearbyOffers.length > 0 && (
            <FlatList
              data={nearbyOffers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={o => o._id}
              contentContainerStyle={styles.offerList}
              renderItem={({ item }) => {
                const hoursLeft = Math.max(0, Math.floor((new Date(item.validUntil).getTime() - Date.now()) / 3_600_000));
                return (
                  <TouchableOpacity style={styles.offerCard} onPress={() => navigation.navigate('Nearby')}>
                    <View style={styles.offerImageWrap}>
                      <Image source={{ uri: resolveImage(item.image) }} style={styles.offerImage} />
                      {item.discountPercent > 0 && (
                        <View style={styles.offerDiscountBadge}>
                          <Text style={styles.offerDiscountText}>{item.discountPercent}% OFF</Text>
                        </View>
                      )}
                      {item.distanceKm ? (
                        <View style={styles.offerDistancePill}>
                          <MapPin size={8} color="#fff" />
                          <Text style={styles.offerDistanceText}>{item.distanceKm} km</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.offerStore} numberOfLines={1}>{item.storeName}</Text>
                    <Text style={styles.offerTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.offerFooterRow}>
                      <Text style={styles.offerPrice}>₹{item.offerPrice}</Text>
                      <View style={styles.offerTimeBadge}>
                        <Clock size={8} color={hoursLeft < 24 ? CustomerColors.primary : CustomerColors.textSecondary} />
                        <Text style={styles.offerTimeText}>{hoursLeft < 1 ? '<1h' : hoursLeft < 24 ? `${hoursLeft}h` : `${Math.floor(hoursLeft / 24)}d`}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </Section>

        {/* ── Shop by Category ─────────────────────────────────────────── */}
        <Section title="Shop by Category" onViewAll={() => navigation.navigate('Categories')}>
          <View style={styles.categoryGrid}>
            {categories.slice(0, 6).map((cat, i) => {
              const IconComp = ICON_MAP[cat.icon] || Sparkles;
              const tint = CATEGORY_TINTS[i % CATEGORY_TINTS.length];
              return (
                <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => navigation.navigate('Categories', { screen: 'CategoryProducts', params: { category: cat.title } })}>
                  <View style={styles.categoryImageWrap}>
                    <Image source={{ uri: resolveImage(cat.img) }} style={styles.categoryImage} />
                    <View style={styles.categoryOverlay} />
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                    </View>
                    <View style={[styles.categoryIconWrap, { backgroundColor: tint }]}>
                      <IconComp size={14} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.categoryTitle} numberOfLines={1}>{cat.title}</Text>
                  <Text style={styles.categoryDesc} numberOfLines={1}>{cat.description}</Text>
                  <View style={styles.categoryFooterRow}>
                    <Text style={styles.categoryCount}>{cat.count} items</Text>
                    <View style={styles.exploreRow}>
                      <Text style={styles.exploreText}>Explore</Text>
                      <ChevronRight size={10} color={CustomerColors.teal600} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* ── Best Sellers ─────────────────────────────────────────────── */}
        <Section title="Best Sellers" onViewAll={() => navigation.navigate('BestSellers')}>
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => String(p.id)}
            contentContainerStyle={styles.bestSellerList}
            renderItem={({ item }) => {
              const price = item.price ?? 999;
              const original = item.originalPrice ?? price;
              const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;
              const rating = item.rating ?? 4.0;
              return (
                <TouchableOpacity style={styles.sellerCard} onPress={() => navigation.navigate('ProductDetail', { productId: String(item.id) })}>
                  <View style={styles.sellerImageWrap}>
                    <Image source={{ uri: resolveImage(item.img) }} style={styles.sellerImage} />
                    {item.badge && (
                      <View style={styles.sellerBadge}><Text style={styles.sellerBadgeText}>{item.badge}</Text></View>
                    )}
                    {discount > 0 && (
                      <View style={styles.sellerDiscount}><Text style={styles.sellerDiscountText}>-{discount}%</Text></View>
                    )}
                  </View>
                  <View style={styles.sellerBody}>
                    <Text style={styles.sellerBrand}>Remise</Text>
                    <Text style={styles.sellerName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.ratingRow}>
                      <View style={styles.ratingPill}>
                        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                        <Star size={8} color="#fff" fill="#fff" />
                      </View>
                    </View>
                    <View style={styles.sellerPriceRow}>
                      <Text style={styles.sellerPrice}>₹{price.toLocaleString()}</Text>
                      {discount > 0 && <Text style={styles.sellerOriginal}>₹{original.toLocaleString()}</Text>}
                    </View>
                    <TouchableOpacity
                      style={styles.sellerCartBtn}
                      onPress={() => {
                        addToCart({
                          id: String(item.id),
                          title: item.name,
                          price: price,
                          quantity: 1,
                          image: item.img,
                        });
                        if (Platform.OS === 'android') {
                          ToastAndroid.show('Added to cart ✓', ToastAndroid.SHORT);
                        }
                      }}
                    >
                      <ShoppingCart size={12} color={CustomerColors.teal700} />
                      <Text style={styles.sellerCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Section>

        {/* ── New Arrivals ─────────────────────────────────────────────── */}
        {newArrivals.length > 0 && (
          <Section title="New Arrivals" onViewAll={() => navigation.navigate('NewArrivals')}>
            <FlatList
              data={newArrivals}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => productId(p)}
              contentContainerStyle={styles.newArrivalList}
              renderItem={({ item }) => {
                const price = item.discountedPrice ?? item.price;
                const original = item.originalPrice && item.originalPrice > price ? item.originalPrice : undefined;
                const discount = original ? Math.round(((original - price) / original) * 100) : 0;
                const img = productImage(item);
                const isWished = isWishlisted(productId(item));

                return (
                  <TouchableOpacity
                    style={styles.newArrivalCard}
                    onPress={() => navigation.navigate('ProductDetail', { productId: productId(item) })}
                  >
                    <View style={styles.newArrivalImageWrap}>
                      <Image source={{ uri: img ? resolveImage(img) : undefined }} style={styles.newArrivalImage} />
                      <View style={styles.newArrivalNewBadge}>
                        <Sparkles size={8} color="#fff" />
                        <Text style={styles.newArrivalNewBadgeText}>NEW</Text>
                      </View>
                      {discount > 0 && (
                        <View style={styles.newArrivalDiscount}>
                          <Text style={styles.newArrivalDiscountText}>-{discount}%</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.newArrivalWishBtn, isWished && styles.newArrivalWishBtnActive]}
                        onPress={() => toggleWishlist(item)}
                      >
                        <Heart
                          size={11}
                          color={isWished ? '#FF0000' : CustomerColors.textSecondary}
                          fill={isWished ? '#FF0000' : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.newArrivalBody}>
                      {item.category && (
                        <Text style={styles.newArrivalCategory} numberOfLines={1}>
                          {item.category}
                        </Text>
                      )}
                      <Text style={styles.newArrivalTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View style={styles.newArrivalPriceRow}>
                        <Text style={styles.newArrivalPrice}>₹{price?.toLocaleString()}</Text>
                        {original && (
                          <Text style={styles.newArrivalOriginal}>₹{original.toLocaleString()}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.newArrivalCartBtn}
                        onPress={() => {
                          addToCart({
                            id: productId(item),
                            title: item.title,
                            price: price,
                            quantity: 1,
                            image: img,
                            totalStock: item.totalStock,
                          });
                          if (Platform.OS === 'android') {
                            ToastAndroid.show('Added to cart ✓', ToastAndroid.SHORT);
                          }
                        }}
                      >
                        <ShoppingCart size={12} color={CustomerColors.teal700} />
                        <Text style={styles.newArrivalCartText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Section>
        )}

        <View style={{ height: Spacing.xl }} />
        <HomeFooter />
      </ScrollView>
    </View>
  );
}

function Section({ title, onViewAll, children }: { title: string; onViewAll: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color={CustomerColors.teal600} />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function MenuItem({ icon: Icon, label, onPress, destructive }: { icon: any; label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={17} color={destructive ? CustomerColors.primary : CustomerColors.textSecondary} />
      <Text style={[styles.menuItemText, destructive && styles.menuItemTextDestructive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.border,
  },
  logo: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8,
    paddingHorizontal: 3, backgroundColor: CustomerColors.primary, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: CustomerColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.sm },

  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'flex-end' },
  menuSheet: { marginTop: 60, marginRight: Spacing.md, width: 220, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, ...Shadows.card },
  menuHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: CustomerColors.border, marginBottom: Spacing.xs },
  menuName: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  menuEmail: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  menuItemText: { fontSize: FontSizes.sm, color: '#374151', fontWeight: '600' },
  menuItemTextDestructive: { color: CustomerColors.primary },
  menuDivider: { height: 1, backgroundColor: CustomerColors.border, marginVertical: Spacing.xs },

  dealStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.border,
  },
  dealCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: '#F9FAFB',
  },
  dealIconBox: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  dealSubtitle: {
    fontSize: 9.5,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },

  infoStrip: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: CustomerColors.white,
    marginTop: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: CustomerColors.border,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '50%', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
  infoTextWrap: {},
  infoTitle: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.black },
  infoSubtitle: { fontSize: 10, color: CustomerColors.textSecondary },

  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal600 },

  // Shop by Offers Nearby states
  locationPrompt: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.border, borderRadius: BorderRadius.md, padding: Spacing.md },
  locationPromptIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.white, alignItems: 'center', justifyContent: 'center' },
  locationPromptTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  locationPromptSubtitle: { fontSize: 10, color: CustomerColors.textSecondary, marginTop: 2 },
  enableLocationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CustomerColors.teal600, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  enableLocationBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  deniedPrompt: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  deniedIcon: { backgroundColor: '#FEF3C7' },
  browseAllBtn: { backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  browseAllBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
  nearbyCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  nearbyCenterText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  nearbyEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm, marginHorizontal: Spacing.lg, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border },
  emptyEmoji: { fontSize: 28 },
  errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: Spacing.lg, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: BorderRadius.md, padding: Spacing.md },
  errorText: { fontSize: FontSizes.xs, color: '#374151' },
  retryBtn: { backgroundColor: CustomerColors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.sm },
  retryBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  offerList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  offerCard: { width: 150, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, overflow: 'hidden', padding: Spacing.xs, ...Shadows.card },
  offerImageWrap: { position: 'relative' },
  offerImage: { width: '100%', height: 90, borderRadius: BorderRadius.sm, backgroundColor: '#F5F5F5' },
  offerDiscountBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: CustomerColors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  offerDiscountText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  offerDistancePill: { position: 'absolute', bottom: 6, right: 6, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  offerDistanceText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  offerStore: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal600, marginTop: 6, paddingHorizontal: 2 },
  offerTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.black, marginTop: 2, paddingHorizontal: 2 },
  offerFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingHorizontal: 2 },
  offerPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  offerTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.border, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  offerTimeText: { fontSize: 9, color: CustomerColors.textSecondary, fontWeight: '600' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm, justifyContent: 'space-between' },
  categoryCard: { width: '31%', marginBottom: Spacing.md },
  categoryImageWrap: { aspectRatio: 4 / 3, borderRadius: BorderRadius.md, overflow: 'hidden', backgroundColor: CustomerColors.bg, position: 'relative' },
  categoryImage: { width: '100%', height: '100%' },
  categoryOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%', backgroundColor: 'rgba(0,0,0,0.35)' },
  categoryBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: GoldColors.gold, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  categoryBadgeText: { fontSize: 8, fontWeight: '800', color: '#000' },
  categoryIconWrap: { position: 'absolute', bottom: 4, left: 4, width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  categoryTitle: { fontSize: 11, fontWeight: '800', color: CustomerColors.black, marginTop: 5 },
  categoryDesc: { fontSize: 9, color: CustomerColors.textSecondary, marginTop: 1 },
  categoryFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  categoryCount: { fontSize: 9, color: CustomerColors.teal600, fontWeight: '600' },
  exploreRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  exploreText: { fontSize: 9, color: CustomerColors.teal600, fontWeight: '700' },

  bestSellerList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sellerCard: { width: 140, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, overflow: 'hidden', ...Shadows.card },
  sellerImageWrap: { aspectRatio: 1, backgroundColor: CustomerColors.bg, position: 'relative' },
  sellerImage: { width: '100%', height: '100%' },
  sellerBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: CustomerColors.primary, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  sellerBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  sellerDiscount: { position: 'absolute', top: 6, right: 6, backgroundColor: GoldColors.gold, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  sellerDiscountText: { fontSize: 8, fontWeight: '800', color: '#000' },
  sellerBody: { padding: Spacing.xs },
  sellerBrand: { fontSize: 9, color: CustomerColors.textSecondary, fontWeight: '600' },
  sellerName: { fontSize: 11, fontWeight: '700', color: CustomerColors.black, marginTop: 1, minHeight: 28 },
  ratingRow: { flexDirection: 'row', marginTop: 4 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#16A34A', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  ratingText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  sellerPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 5 },
  sellerPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  sellerOriginal: { fontSize: 9, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  sellerCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.border, borderRadius: BorderRadius.sm, paddingVertical: 6, marginTop: Spacing.xs },
  sellerCartText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },

  // New Arrivals styles
  newArrivalList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  newArrivalCard: { width: 140, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, overflow: 'hidden', ...Shadows.card },
  newArrivalImageWrap: { aspectRatio: 1, backgroundColor: CustomerColors.bg, position: 'relative' },
  newArrivalImage: { width: '100%', height: '100%' },
  newArrivalNewBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: CustomerColors.primary, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, zIndex: 2 },
  newArrivalNewBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  newArrivalDiscount: { position: 'absolute', top: 6, right: 36, backgroundColor: GoldColors.gold, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, zIndex: 2 },
  newArrivalDiscountText: { fontSize: 8, fontWeight: '800', color: '#000' },
  newArrivalWishBtn: { position: 'absolute', top: 6, right: 6, zIndex: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  newArrivalWishBtnActive: { backgroundColor: '#FFE5E5' },
  newArrivalBody: { padding: Spacing.xs },
  newArrivalCategory: { fontSize: 9, color: CustomerColors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  newArrivalTitle: { fontSize: 11, fontWeight: '700', color: CustomerColors.black, marginTop: 1, minHeight: 28 },
  newArrivalPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 5 },
  newArrivalPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  newArrivalOriginal: { fontSize: 9, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  newArrivalCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.border, borderRadius: BorderRadius.sm, paddingVertical: 6, marginTop: Spacing.xs },
  newArrivalCartText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
  guestLoginCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guestLoginIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLoginTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  guestLoginSubtitle: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  guestLoginBtn: {
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    shadowColor: CustomerColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  topLogoHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    justifyContent: 'center',
  },
  topLogoText: {
    fontSize: 22,
    fontWeight: '800',
    color: CustomerColors.primary,
    letterSpacing: -0.3,
  },
  topLogoRed: {
    color: CustomerColors.primary,
    fontWeight: '900',
  },
});