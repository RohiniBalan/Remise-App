import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  CheckCircle,
  ArrowLeft,
  Store,
  ShieldCheck,
  Star,
  Tag,
  Sparkles,
  Package,
} from 'lucide-react-native';
import { productApi, Product, productImage } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { requireAuthForPurchase } from '../../utils/authGuard';
import { normalizeSpecifications } from '../../utils/categoryAttributes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['About', 'Specifications', 'Highlights', 'Shipping'] as const;

// Roles that see store-owner pricing instead of the direct-customer price
const STORE_OWNER_ROLES = ['store_owner', 'whole_saler', 'home_business'];

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId: routeProductId } = route.params;
  const { user, token } = useAuth();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>('About');

  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      let found: Product | null = null;
      let allItems: Product[] = [];

      // 1. Try Gateway Products list first
      try {
        const res = await productApi.getProductsViaGateway({ limit: 10000 });
        const data = res.data;
        const arr: Product[] = Array.isArray(data)
          ? data
          : data.products || data.data || [];
        if (arr.length > 0) {
          allItems = arr;
          const match = arr.find(
            p =>
              String(p._id) === String(routeProductId) ||
              String(p.id) === String(routeProductId),
          );
          if (match) found = match;
        }
      } catch (err) {
        // Fallback to next
      }

      // 2. If not found, try direct single product by ID
      if (!found) {
        try {
          const res = await productApi.getById(routeProductId);
          const data = res.data;
          const item: Product = data.product || data.data || data;
          if (item && (String(item._id) === String(routeProductId) || String(item.id) === String(routeProductId))) {
            found = item;
          }
        } catch (err) {
          // Fallback to next
        }
      }

      // 3. If still not found, try legacy products endpoint
      if (!found) {
        try {
          const res = await productApi.getAll();
          const data = res.data;
          const arr: Product[] = Array.isArray(data)
            ? data
            : data.products || data.data || [];
          if (arr.length > 0) {
            if (allItems.length === 0) allItems = arr;
            const match = arr.find(
              p =>
                String(p._id) === String(routeProductId) ||
                String(p.id) === String(routeProductId),
            );
            if (match) found = match;
          }
        } catch (err) {
          // Both failed
        }
      }

      if (isMounted) {
        if (allItems.length > 0) setAllProducts(allItems);
        if (found) {
          setProduct(found);
          setActiveImage(productImage(found));
        }
        setLoading(false);
      }
    };

    fetchProductData();
    return () => {
      isMounted = false;
    };
  }, [routeProductId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0)
      return product.images.filter(Boolean);
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  // Dynamic specifications normalization (filtering out empty fields)
  const normalizedSpecs = useMemo(() => {
    if (!product) return [];
    const specs = normalizeSpecifications(
      product.attributes,
      product.specifications,
      product.category,
      product.subcategory,
    );
    if (product.totalStock !== undefined) {
      specs.push({ label: 'Total Stock', value: `${product.totalStock} Units` });
    }
    if (product.moq && Number(product.moq) > 1) {
      specs.push({ label: 'Min Order Qty', value: `${product.moq} Units` });
    }
    return specs;
  }, [product]);

  // Similar products
  const similarProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(
        p =>
          (p._id || p.id) !== (product._id || product.id) &&
          (p.category?.toLowerCase() === product.category?.toLowerCase() ||
            p.subcategory?.toLowerCase() === product.subcategory?.toLowerCase()),
      )
      .slice(0, 4);
  }, [product, allProducts]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GoldColors.gold} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundSubtitle}>This item no longer exists.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isStoreOwner = STORE_OWNER_ROLES.includes(user?.role || '');
  const displayProduct: Product = isStoreOwner
    ? {
        ...product,
        price: product.storePrice ?? product.price,
        discountedPrice: product.storeDiscountedPrice ?? product.discountedPrice,
      }
    : product;

  const isOutOfStock = product.totalStock <= 0;
  const originalPriceVal = displayProduct.originalPrice || displayProduct.price * 1.25;
  const currentPriceVal = displayProduct.price;
  const discount =
    originalPriceVal > currentPriceVal
      ? Math.round(((originalPriceVal - currentPriceVal) / originalPriceVal) * 100)
      : 0;

  const pId = product._id || product.id || '';
  const isItemWishlisted = checkWishlisted(pId);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!requireAuthForPurchase(navigation)) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: pId,
        title: product.title,
        price: displayProduct.price,
        quantity: 1,
        image: productImage(product) || '',
        totalStock: product.totalStock,
      });
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!requireAuthForPurchase(navigation)) return;

    setBuyNowItem({
      id: pId,
      title: product.title,
      price: displayProduct.price,
      quantity,
      image: productImage(product) || '',
      totalStock: product.totalStock,
    });
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={CustomerColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingCart size={20} color={CustomerColors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Image View */}
        <View style={styles.imageStage}>
          {activeImage ? (
            <Image source={{ uri: activeImage }} style={styles.mainImage} />
          ) : (
            <Package size={48} color={CustomerColors.textSecondary} />
          )}

          {/* Stock status badge */}
          <View style={styles.stockBadgeContainer}>
            <View
              style={[
                styles.stockBadge,
                isOutOfStock
                  ? styles.stockBadgeOut
                  : product.totalStock < 5
                  ? styles.stockBadgeLow
                  : styles.stockBadgeIn,
              ]}
            >
              <Text style={styles.stockBadgeText}>
                {isOutOfStock
                  ? 'Out of Stock'
                  : product.totalStock < 5
                  ? `Only ${product.totalStock} Left`
                  : 'In Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailRow}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {gallery.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveImage(img)}
                style={[
                  styles.thumbnailBox,
                  activeImage === img && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Core Product Info */}
        <View style={styles.infoCard}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            {product.brand && (
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>{product.brand}</Text>
              </View>
            )}
            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
            )}
            {product.subcategory && (
              <View style={styles.subcategoryBadge}>
                <Text style={styles.subcategoryBadgeText}>
                  {product.subcategory}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating Summary */}
          <View style={styles.ratingBar}>
            <View style={styles.ratingChip}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
            <Text style={styles.ratingCount}>128 Ratings</Text>
            <Text style={styles.dotSeparator}>·</Text>
            <ShieldCheck size={14} color={CustomerColors.teal700} />
            <Text style={styles.verifiedText}>Verified Genuine</Text>
          </View>

          {/* Price Box */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₹{currentPriceVal?.toLocaleString('en-IN')}
            </Text>
            {originalPriceVal > currentPriceVal && (
              <>
                <Text style={styles.originalPrice}>
                  ₹{originalPriceVal?.toLocaleString('en-IN')}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Store Info Card */}
          <View style={styles.storeCard}>
            <View style={styles.storeIconBox}>
              <Store size={18} color={GoldColors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>
                Sold by {product.storeId ? 'Verified Partner Store' : 'Remise Direct Official'}
              </Text>
              <Text style={styles.storeSub}>Fast Dispatch · 100% Quality Checked</Text>
            </View>
          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <Tag size={16} color={CustomerColors.teal700} />
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>
                Use Code <Text style={{ textDecorationLine: 'underline', fontWeight: '800' }}>REMISE10</Text> for 10% Extra Off
              </Text>
              <Text style={styles.offerSubtitle}>
                Free delivery on prepaid orders above ₹499
              </Text>
            </View>
          </View>

          {/* Quantity and Wishlist Selector */}
          <View style={styles.qtyWishlistRow}>
            <View style={styles.qtySelector}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{isOutOfStock ? 0 : quantity}</Text>
              <TouchableOpacity
                onPress={() =>
                  setQuantity(Math.min(product.totalStock || 99, quantity + 1))
                }
                disabled={isOutOfStock || quantity >= (product.totalStock || 99)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={[
                styles.wishlistBtn,
                isItemWishlisted && styles.wishlistBtnActive,
              ]}
            >
              <Heart
                size={20}
                color={isItemWishlisted ? '#DC2626' : CustomerColors.textSecondary}
                fill={isItemWishlisted ? '#DC2626' : 'none'}
              />
            </TouchableOpacity>
          </View>

          {/* Delivery Note */}
          <View style={styles.deliveryNote}>
            <Truck size={14} color={GoldColors.gold} />
            <Text style={styles.deliveryText}>
              Est. delivery in {product.deliveryTime || '3–7 Business Days'}
            </Text>
          </View>
        </View>

        {/* Tabbed Specifications & Details */}
        <View style={styles.tabsCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsHeader}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {TABS.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    tab === t && styles.tabBtnTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.tabBody}>
            {tab === 'About' && (
              <View>
                <Text style={styles.tabHeading}>Description</Text>
                <Text style={styles.descriptionText}>
                  {product.aboutDescription ||
                    product.description ||
                    'No detailed description available for this product.'}
                </Text>
              </View>
            )}

            {/* DYNAMIC SPECIFICATIONS TABLE (ONLY DISPLAY FIELDS WITH VALUES) */}
            {tab === 'Specifications' && (
              <View>
                {normalizedSpecs.length > 0 ? (
                  <View style={styles.specsTable}>
                    {normalizedSpecs.map((spec, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.specRow,
                          idx % 2 === 0 && styles.specRowAlt,
                        ]}
                      >
                        <Text style={styles.specLabel}>{spec.label}</Text>
                        <Text style={styles.specValue}>{spec.value}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyTabText}>
                    No specifications available.
                  </Text>
                )}
              </View>
            )}

            {tab === 'Highlights' && (
              <View>
                {Array.isArray(product.idealFor) && product.idealFor.length > 0 ? (
                  product.idealFor.map((item, idx) => (
                    <View key={idx} style={styles.highlightItem}>
                      <Sparkles size={14} color={GoldColors.gold} />
                      <Text style={styles.highlightText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyTabText}>
                    Standard item highlights apply.
                  </Text>
                )}
              </View>
            )}

            {tab === 'Shipping' && (
              <View style={{ gap: Spacing.sm }}>
                <View style={styles.policyCard}>
                  <Text style={styles.policyTitle}>Delivery Policy</Text>
                  <Text style={styles.policyBody}>
                    Dispatched within 24 hours of order confirmation. Track live updates directly from your orders tab.
                  </Text>
                </View>
                <View style={styles.policyCard}>
                  <Text style={styles.policyTitle}>7 Days Replacement</Text>
                  <Text style={styles.policyBody}>
                    Hassle-free pickup and replacement for damaged or incorrect items within 7 days of delivery.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>
              Similar Products in {product.subcategory || product.category}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.md }}
            >
              {similarProducts.map(p => {
                const img = productImage(p);
                return (
                  <TouchableOpacity
                    key={p._id || p.id}
                    style={styles.similarCard}
                    onPress={() =>
                      navigation.push('ProductDetail', {
                        productId: p._id || p.id,
                      })
                    }
                  >
                    <View style={styles.similarImgBox}>
                      {img ? (
                        <Image source={{ uri: img }} style={styles.similarImg} />
                      ) : (
                        <Package size={24} color={CustomerColors.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.similarBrand} numberOfLines={1}>
                      {p.brand || p.category}
                    </Text>
                    <Text style={styles.similarName} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <Text style={styles.similarPrice}>
                      ₹{p.price?.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cartBtn, isOutOfStock && styles.btnDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart size={18} color={GoldColors.gold} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyBtn, isOutOfStock && styles.btnDisabled]}
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Zap size={18} color="#000" />
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070707' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  scrollContent: { paddingBottom: 100 },
  center: {
    flex: 1,
    backgroundColor: '#070707',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  notFoundTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff', marginBottom: Spacing.xs },
  notFoundSubtitle: { fontSize: FontSizes.sm, color: '#888', marginBottom: Spacing.lg },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    backgroundColor: GoldColors.gold,
    borderRadius: BorderRadius.md,
  },
  backBtnText: { color: '#000', fontSize: FontSizes.xs, fontWeight: '800', textTransform: 'uppercase' },
  imageStage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainImage: { width: '85%', height: '85%', resizeMode: 'contain' },
  stockBadgeContainer: { position: 'absolute', top: Spacing.md, left: Spacing.md },
  stockBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.pill },
  stockBadgeIn: { backgroundColor: '#15803D' },
  stockBadgeLow: { backgroundColor: '#B45309' },
  stockBadgeOut: { backgroundColor: '#B91C1C' },
  stockBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  thumbnailRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#0D0D0D' },
  thumbnailBox: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailActive: { borderColor: GoldColors.gold, borderWidth: 2 },
  thumbnailImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    margin: Spacing.md,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  brandBadge: { backgroundColor: '#222', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  brandBadgeText: { color: GoldColors.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  categoryBadge: { borderWidth: 1, borderColor: '#333', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  categoryBadgeText: { color: '#9CA3AF', fontSize: 10, fontWeight: '600' },
  subcategoryBadge: { borderWidth: 1, borderColor: GoldColors.gold, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  subcategoryBadgeText: { color: GoldColors.goldLight, fontSize: 10, fontWeight: '700' },
  title: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff', lineHeight: 26, marginBottom: Spacing.xs },
  ratingBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  ratingText: { color: '#F59E0B', fontSize: 11, fontWeight: '800' },
  ratingCount: { color: '#888', fontSize: 11 },
  dotSeparator: { color: '#444' },
  verifiedText: { color: CustomerColors.teal700, fontSize: 11, fontWeight: '700' },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  price: { fontSize: 28, fontWeight: '900', color: GoldColors.gold },
  originalPrice: { fontSize: FontSizes.sm, color: '#777', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  discountText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  storeIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: { fontSize: FontSizes.xs, fontWeight: '800', color: '#fff' },
  storeSub: { fontSize: 10, color: '#888' },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  offerTitle: { fontSize: FontSizes.xs, fontWeight: '700', color: '#2DD4BF' },
  offerSubtitle: { fontSize: 10, color: '#99F6E4' },
  qtyWishlistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  qtyBtnText: { color: '#fff', fontSize: FontSizes.base, fontWeight: '800' },
  qtyText: { color: GoldColors.gold, fontSize: FontSizes.sm, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  wishlistBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBtnActive: { borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' },
  deliveryNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  deliveryText: { fontSize: 11, color: '#888' },
  tabsCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tabsHeader: { borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: Spacing.xs },
  tabBtn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: GoldColors.gold },
  tabBtnText: { color: '#888', fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase' },
  tabBtnTextActive: { color: GoldColors.gold },
  tabBody: { paddingTop: Spacing.md },
  tabHeading: { fontSize: FontSizes.sm, fontWeight: '800', color: GoldColors.gold, marginBottom: Spacing.xs },
  descriptionText: { fontSize: FontSizes.xs, color: '#BBB', lineHeight: 20 },
  specsTable: { borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, overflow: 'hidden' },
  specRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  specRowAlt: { backgroundColor: '#161616' },
  specLabel: { width: '45%', fontSize: FontSizes.xs, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  specValue: { flex: 1, fontSize: FontSizes.xs, fontWeight: '600', color: '#fff' },
  emptyTabText: { color: '#666', fontSize: FontSizes.xs, textAlign: 'center', paddingVertical: Spacing.md },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  highlightText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '600' },
  policyCard: { backgroundColor: '#161616', padding: Spacing.sm, borderRadius: BorderRadius.md },
  policyTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: GoldColors.gold, marginBottom: 2 },
  policyBody: { fontSize: 10, color: '#AAA', lineHeight: 15 },
  similarSection: { marginHorizontal: Spacing.md, marginBottom: Spacing.xl },
  similarTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#fff', marginBottom: Spacing.md },
  similarCard: {
    width: 140,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  similarImgBox: { width: '100%', height: 100, backgroundColor: '#161616', borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: Spacing.xs },
  similarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  similarBrand: { fontSize: 9, fontWeight: '700', color: GoldColors.gold, textTransform: 'uppercase' },
  similarName: { fontSize: 11, fontWeight: '700', color: '#fff', marginTop: 2, marginBottom: 4, height: 28 },
  similarPrice: { fontSize: FontSizes.xs, fontWeight: '900', color: '#fff' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: GoldColors.gold,
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
  },
  cartBtnText: { color: GoldColors.gold, fontSize: FontSizes.xs, fontWeight: '800', textTransform: 'uppercase' },
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: GoldColors.gold,
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
  },
  buyBtnText: { color: '#000', fontSize: FontSizes.xs, fontWeight: '800', textTransform: 'uppercase' },
  btnDisabled: { opacity: 0.5 },
});