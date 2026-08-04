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
} from 'lucide-react-native';
import HeroCarousel from '../../components/home/HeroCarousel';
import HomeFooter from '../../components/home/HomeFooter';
import { offersApi } from '../../api/offersApi';
import { homeSectionsApi, CategoryItem, BestSellerItem, CATEGORY_FALLBACK, BEST_SELLER_FALLBACK } from '../../api/homeSectionsApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { GATEWAY_URL } from '../../api/endpoints';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

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
};

// Web colors these via arbitrary Tailwind gradient classes per category
// (`item.color`, e.g. 'from-green-400 to-emerald-600') which don't translate
// to React Native styles — cycling a fixed palette by index gives the same
// "each category has its own color" feel without parsing Tailwind classes.
const CATEGORY_TINTS = ['#10B981', '#EC4899', '#F97316', '#8B5CF6', '#0FA3B1', '#3B82F6'];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useUnreadNotifications();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);

  // ── Shop by Offers Nearby — mirrors ShopByOffersNearbySection.tsx's
  // status machine exactly (idle → locating → loading → done/denied/error),
  // including only auto-detecting when the OS already has permission
  // granted (never force-prompting on page load the way NearbyOffersScreen
  // does), same as web's `navigator.permissions.query` check.
  const [nearbyStatus, setNearbyStatus] = useState<NearbyStatus>('idle');
  const [nearbyOffers, setNearbyOffers] = useState<NearbyOffer[]>([]);

  useEffect(() => {
    homeSectionsApi
      .getShopByCategory()
      .then(res => setCategories(res.data?.success && res.data.data?.length > 0 ? res.data.data : CATEGORY_FALLBACK))
      .catch(() => setCategories(CATEGORY_FALLBACK));

    homeSectionsApi
      .getBestSellers()
      .then(res => setBestSellers(res.data?.success && res.data.data?.length > 0 ? res.data.data : BEST_SELLER_FALLBACK))
      .catch(() => setBestSellers(BEST_SELLER_FALLBACK));
  }, []);

  const fetchNearbyOffers = useCallback((lat: number, lng: number) => {
    setNearbyStatus('loading');
    offersApi
      .getNearby(lat, lng, 10)
      .then(res => {
        setNearbyOffers(res.data?.data || []);
        setNearbyStatus('done');
      })
      .catch(() => setNearbyStatus('error'));
  }, []);

  const detectLocation = useCallback(() => {
    setNearbyStatus('locating');
    Geolocation.getCurrentPosition(
      pos => fetchNearbyOffers(pos.coords.latitude, pos.coords.longitude),
      () => setNearbyStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [fetchNearbyOffers]);

  useEffect(() => {
    // Auto-detect only if location permission is ALREADY granted — never
    // prompt on load. On iOS, Geolocation.getCurrentPosition itself triggers
    // the OS prompt on first call, so there's no non-prompting "check" to do
    // there the way Android's PermissionsAndroid.check() provides.
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
        if (granted) detectLocation();
      });
    }
  }, [detectLocation]);

  const handleEnableLocation = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        setNearbyStatus('denied');
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

  const resolveImage = (img: string) => (img?.startsWith('http') ? img : `${GATEWAY_URL}${img}`);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>REmise</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={CustomerColors.black} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={20} color={CustomerColors.black} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {user && (
            <TouchableOpacity style={styles.avatar} onPress={() => setMenuOpen(true)}>
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuSheet} onPress={() => {}}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuName} numberOfLines={1}>{user?.fullname || user?.name || 'Account'}</Text>
              <Text style={styles.menuEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
            <MenuItem icon={User} label="My Profile" onPress={() => goToMenuItem('Profile')} />
            <MenuItem icon={Package} label="My Orders" onPress={() => goToMenuItem('Orders')} />
            <MenuItem icon={Percent} label="My Offers" onPress={() => goToMenuItem('MyOffers')} />
            <MenuItem icon={SettingsIcon} label="Settings" onPress={() => goToMenuItem('Settings')} />
            <View style={styles.menuDivider} />
            <MenuItem icon={LogOut} label="Sign Out" onPress={handleSignOut} destructive />
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroCarousel />

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
                      <View style={styles.offerDistancePill}>
                        <MapPin size={8} color="#fff" />
                        <Text style={styles.offerDistanceText}>{item.distanceKm} km</Text>
                      </View>
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
                <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => navigation.navigate('Categories')}>
                  <View style={styles.categoryImageWrap}>
                    <Image source={{ uri: cat.img }} style={styles.categoryImage} />
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
        <Section title="Best Sellers" onViewAll={() => navigation.navigate('Categories')}>
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
                    <Image source={{ uri: item.img }} style={styles.sellerImage} />
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
                    {/* Matches web parity — Best Sellers' "Add to Cart" is a
                        display-only button there too (see ProductCard in
                        BestSellersSection.tsx: the onClick is a no-op with a
                        comment that cart logic lives on the product page). */}
                    <View style={styles.sellerCartBtn}>
                      <ShoppingCart size={12} color={CustomerColors.teal700} />
                      <Text style={styles.sellerCartText}>Add to Cart</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Section>

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

  infoStrip: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: CustomerColors.white,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: CustomerColors.border,
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
});
