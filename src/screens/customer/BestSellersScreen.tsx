import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Flame } from 'lucide-react-native';
import { productApi, Product, productId, productImage } from '../../api/productApi';
import ProductCard from '../../components/common/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import { CustomerColors, Spacing, FontSizes } from '../../styles/theme';

// Mirrors web's /bestsellers page — fetches all products sorted by
// bestselling from the product-service via the gateway.

export default function BestSellersScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    productApi
      .getProductsViaGateway({
        sort: 'bestselling',
        limit: 10000,
      })
      .then(res => {
        const data = res.data;
        const rawArr = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];
        const arr = rawArr.filter(
          (p: any) => p.ownerRole !== 'whole_saler' && p.ownerRole !== 'wholesaler',
        );
        setProducts(arr);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
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
      {/* Header Eyebrow & Title Bar */}
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
              <Flame size={13} color={CustomerColors.primary} />
              <Text style={styles.eyebrowText}>Popular Picks</Text>
            </View>
            <Text style={[styles.pageTitle, isDark && { color: '#FFFFFF' }]}>
              Best Sellers
            </Text>
          </View>
        </View>
        <Text style={[styles.count, isDark && { color: '#94A3B8' }]}>
          {products.length} products
        </Text>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => productId(item)}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
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
            onAddToCart={() => {
              if (!user || !token) {
                setShowAuthModal(true);
                return;
              }
              addToCart({
                id: productId(item),
                title: item.title,
                price: item.discountedPrice ?? item.price,
                quantity: 1,
                image: productImage(item),
                totalStock: item.totalStock,
              });
              showToast('Added to cart ✓');
            }}
            onBuyNow={() => {
              if (!user || !token) {
                setShowAuthModal(true);
                return;
              }
              setBuyNowItem({
                id: productId(item),
                title: item.title,
                price: item.discountedPrice ?? item.price,
                quantity: 1,
                image: productImage(item),
                totalStock: item.totalStock,
              });
              navigation.navigate('Checkout');
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, isDark && { color: '#94A3B8' }]}>
            No best sellers found.
          </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
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
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  count: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  grid: { padding: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  empty: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});
