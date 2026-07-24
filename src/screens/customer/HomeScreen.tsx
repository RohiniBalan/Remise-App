import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  LayoutGrid,
  ClipboardList,
  MapPin,
  Package,
  ChevronRight,
  ShoppingBag,
  Settings as SettingsIcon,
  Bell,
  User as UserIcon,
} from 'lucide-react-native';
import { productApi, Product, productId } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import ProductCard from '../../components/common/ProductCard';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';

// Mobile-first landing screen — web's home page (app/(root)/page.tsx) is a
// desktop marketing page built from many section components (Hero,
// DealStrip, ShopByOffersNearby, ShopByCategory, BestSellers) most of which
// are large animated carousels with no direct mobile equivalent. Per the
// plan's UI rule ("redesign the UI, keep the functionality identical"),
// this reproduces the same *destinations* web's DealStrip/quick-links point
// to (Categories, Nearby Offers, Bulk Purchase, Orders) as a mobile quick-
// action grid, plus a real product preview pulled from the same catalog
// endpoint the Category screen uses (BestSellersSection's actual data
// source isn't a separate admin-curated list on the customer-facing site
// today — see PARITY_CHECKLIST.md).
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { addToCart, setBuyNowItem, cartCount } = useCart();
  const { unreadCount } = useUnreadNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    productApi
      .getAll()
      .then(res => {
        const data = res.data;
        const arr: Product[] = Array.isArray(data)
          ? data
          : data.products || data.data || [];
        setProducts(arr.slice(0, 8));
      })
      .catch(() => setProducts([]));
  }, []);

  const goToCategories = () => navigation.navigate('Categories');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
    >
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.brand}>Remise</Text>
          <View style={styles.heroIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={18} color={CustomerColors.primary} />
              {unreadCount > 0 && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Cart')}
            >
              <ShoppingBag size={18} color={CustomerColors.primary} />
              {cartCount > 0 && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <UserIcon size={18} color={CustomerColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <SettingsIcon size={18} color={CustomerColors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.heroTitle}>
          Hi{user?.fullname ? `, ${user.fullname.split(' ')[0]}` : ''} 👋
        </Text>
        <Text style={styles.heroSubtitle}>
          Find the best deals from shops near you.
        </Text>
      </View>

      <View style={styles.quickGrid}>
        <QuickAction
          icon={<LayoutGrid size={20} color={CustomerColors.primary} />}
          label="Categories"
          onPress={goToCategories}
        />
        <QuickAction
          icon={<ClipboardList size={20} color={CustomerColors.teal700} />}
          label="Bulk Purchase"
          onPress={() => navigation.navigate('BulkPurchase')}
        />
        <QuickAction
          icon={<MapPin size={20} color={CustomerColors.teal700} />}
          label="Nearby Offers"
          onPress={() => navigation.navigate('Nearby')}
        />
        <QuickAction
          icon={<Package size={20} color={CustomerColors.primary} />}
          label="My Orders"
          onPress={() => navigation.navigate('Orders')}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Products</Text>
        <TouchableOpacity style={styles.seeAllBtn} onPress={goToCategories}>
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight size={14} color={GoldColors.goldDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={p => productId(p)}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
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
              setWishlist(w =>
                w.includes(productId(item))
                  ? w.filter(id => id !== productId(item))
                  : [...w, productId(item)],
              )
            }
            onAddToCart={() =>
              addToCart({
                id: productId(item),
                title: item.title,
                price: item.price,
                quantity: 1,
                image: item.images?.[0] ?? item.imageUrl,
                totalStock: item.totalStock,
              })
            }
            onBuyNow={() => {
              setBuyNowItem({
                id: productId(item),
                title: item.title,
                price: item.price,
                quantity: 1,
                image: item.images?.[0] ?? item.imageUrl,
                totalStock: item.totalStock,
              });
              navigation.navigate('Checkout');
            }}
          />
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>More</Text>
      </View>
      <View style={styles.linksRow}>
        <TouchableOpacity
          style={styles.linkChip}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.linkChipText}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkChip}
          onPress={() => navigation.navigate('Services')}
        >
          <Text style={styles.linkChipText}>Our Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkChip}
          onPress={() => navigation.navigate('Testimonials')}
        >
          <Text style={styles.linkChipText}>Testimonials</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkChip}
          onPress={() => navigation.navigate('StoreRegister')}
        >
          <Text style={styles.linkChipText}>Register Your Store</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress}>
      <View style={styles.quickIconWrap}>{icon}</View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  hero: {
    backgroundColor: CustomerColors.mint,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CustomerColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: CustomerColors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  iconBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  brand: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.primary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
    marginTop: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quickCard: {
    width: '47%',
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: Spacing.sm,
    ...Shadows.card,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: CustomerColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: GoldColors.goldDark,
  },
  grid: { paddingHorizontal: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  linkChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  linkChipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: CustomerColors.teal700,
  },
});
