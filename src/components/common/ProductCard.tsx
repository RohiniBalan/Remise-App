import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, ShoppingCart, Zap, Sparkles } from 'lucide-react-native';
import { Product, productImage, productId, discountPercent } from '../../api/productApi';
import { CustomerColors, GoldColors, Spacing, BorderRadius, FontSizes, Shadows } from '../../styles/theme';

// Shared between CategoryScreen, NewArrivalsScreen and (later) HomeScreen — reproduces the
// same card fields/actions as web's product-card markup: discount badge, NEW badge, wishlist
// toggle (local-only, not persisted — matches web), Add to Cart / Buy Now
// (disabled + "Out of Stock" when totalStock <= 0).

interface Props {
  product: Product;
  isWished: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  hideBuyNow?: boolean;
}

export default function ProductCard({ product, isWished, onPress, onToggleWishlist, onAddToCart, onBuyNow, hideBuyNow = false }: Props) {
  const effectivePrice =
    product.discountedPrice != null &&
    product.discountedPrice > 0 &&
    product.discountedPrice < product.price
      ? product.discountedPrice
      : product.price;

  const originalPrice =
    product.originalPrice && product.originalPrice > effectivePrice
      ? product.originalPrice
      : product.discountedPrice != null &&
        product.discountedPrice > 0 &&
        product.discountedPrice < product.price
      ? product.price
      : undefined;

  const discount =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock =
    product.totalStock <= 0 || product.availability === 'Out of Stock';
  const image = productImage(product);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <View style={styles.badgeContainer}>
          {product.badge && (
            <View style={styles.productBadge}>
              {product.badge.toUpperCase() === 'NEW' && <Sparkles size={8} color="#FFF" />}
              <Text style={styles.productBadgeText}>{product.badge}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discount}%</Text>
            </View>
          )}
        </View>
        <Image source={{ uri: image }} style={[styles.image, isOutOfStock && styles.imageDimmed]} resizeMode="cover" />
        <TouchableOpacity style={[styles.wishBtn, isWished && styles.wishBtnActive]} onPress={onToggleWishlist}>
          <Heart size={13} color={isWished ? '#FF0000' : CustomerColors.textSecondary} fill={isWished ? '#FF0000' : 'none'} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand || ' '}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{effectivePrice?.toLocaleString()}</Text>
          {originalPrice != null && (
            <Text style={styles.originalPrice}>₹{originalPrice.toLocaleString()}</Text>
          )}
        </View>
      </View>

      {isOutOfStock ? (
        <View style={styles.outOfStockRow}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      ) : (
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.cartBtn, hideBuyNow && styles.cartBtnFull]}
            onPress={onAddToCart}
          >
            <ShoppingCart size={12} color={CustomerColors.textSecondary} />
            {hideBuyNow && (
              <Text style={styles.cartBtnText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
          {!hideBuyNow && (
            <TouchableOpacity style={styles.buyBtn} onPress={onBuyNow}>
              <Zap size={12} color="#FFF" />
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, overflow: 'hidden', ...Shadows.card, justifyContent: 'space-between' },
  imageWrap: { aspectRatio: 1.15, backgroundColor: '#F9F9F9' },
  image: { width: '100%', height: '100%' },
  imageDimmed: { opacity: 0.5 },
  badgeContainer: { position: 'absolute', top: 8, left: 8, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  productBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: CustomerColors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  productBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', textTransform: 'uppercase' },
  discountBadge: { backgroundColor: CustomerColors.teal, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  discountBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  wishBtn: { position: 'absolute', top: 8, right: 8, zIndex: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  wishBtnActive: { backgroundColor: '#FFE5E5' },
  info: { padding: Spacing.xs, paddingHorizontal: Spacing.sm, gap: 1, flex: 1, justifyContent: 'space-between' },
  brand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: CustomerColors.textSecondary, minHeight: 13 },
  title: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.primary, height: 32, minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 'auto', paddingTop: 2 },
  price: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  originalPrice: { fontSize: 10, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  ctaRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: CustomerColors.border, marginTop: 'auto' },
  cartBtn: { width: 38, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xs + 2, borderRightWidth: 1, borderRightColor: CustomerColors.border },
  cartBtnFull: { flex: 1, width: undefined, flexDirection: 'row', gap: 5, borderRightWidth: 0 },
  cartBtnText: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  buyBtn: { flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xs + 2, backgroundColor: CustomerColors.primary },
  buyBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#FFF', textTransform: 'uppercase' },
  outOfStockRow: { borderTopWidth: 1, borderTopColor: CustomerColors.border, paddingVertical: Spacing.xs + 2, alignItems: 'center', marginTop: 'auto' },
  outOfStockText: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
});
