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
  const discount = discountPercent(product);
  const isOutOfStock = product.totalStock <= 0;
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
        <Image source={{ uri: image }} style={[styles.image, isOutOfStock && styles.imageDimmed]} />
        <TouchableOpacity style={[styles.wishBtn, isWished && styles.wishBtnActive]} onPress={onToggleWishlist}>
          <Heart size={13} color={isWished ? '#FF0000' : CustomerColors.textSecondary} fill={isWished ? '#FF0000' : 'none'} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price?.toLocaleString()}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</Text>
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
  card: { flex: 1, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, overflow: 'hidden', ...Shadows.card },
  imageWrap: { aspectRatio: 1, backgroundColor: '#F9F9F9' },
  image: { width: '100%', height: '100%' },
  imageDimmed: { opacity: 0.5 },
  badgeContainer: { position: 'absolute', top: 8, left: 8, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  productBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: CustomerColors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  productBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', textTransform: 'uppercase' },
  discountBadge: { backgroundColor: GoldColors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  discountBadgeText: { fontSize: 9, fontWeight: '800', color: '#000' },
  wishBtn: { position: 'absolute', top: 8, right: 8, zIndex: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  wishBtnActive: { backgroundColor: '#FFE5E5' },
  info: { padding: Spacing.sm, gap: 2 },
  brand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: CustomerColors.primary },
  title: { fontSize: FontSizes.sm, fontWeight: '500', color: '#111827', minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { fontSize: FontSizes.md, fontWeight: '700', color: '#111827' },
  originalPrice: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  ctaRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: CustomerColors.border },
  cartBtn: { width: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, borderRightWidth: 1, borderRightColor: CustomerColors.border },
  cartBtnFull: { flex: 1, width: undefined, flexDirection: 'row', gap: 5, borderRightWidth: 0 },
  cartBtnText: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  buyBtn: { flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, backgroundColor: CustomerColors.primary },
  buyBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#FFF', textTransform: 'uppercase' },
  outOfStockRow: { borderTopWidth: 1, borderTopColor: CustomerColors.border, paddingVertical: Spacing.sm, alignItems: 'center' },
  outOfStockText: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
});
