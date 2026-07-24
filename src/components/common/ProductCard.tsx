import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, ShoppingCart, Zap } from 'lucide-react-native';
import { Product, productImage, productId, discountPercent } from '../../api/productApi';
import { GoldColors, CustomerColors, Spacing, BorderRadius, FontSizes, Shadows } from '../../styles/theme';

// Shared between CategoryScreen and (later) HomeScreen — reproduces the
// same card fields/actions as web's product-card markup in
// category/[categoryId]/page.tsx: discount badge, product badge, wishlist
// toggle (local-only, not persisted — matches web), Add to Cart / Buy Now
// (disabled + "Out of Stock" when totalStock <= 0). Gold accent palette
// matches the web product/category pages' distinct theme (not the red/teal
// used elsewhere in the app).

interface Props {
  product: Product;
  isWished: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductCard({ product, isWished, onPress, onToggleWishlist, onAddToCart, onBuyNow }: Props) {
  const discount = discountPercent(product);
  const isOutOfStock = product.totalStock <= 0;
  const image = productImage(product);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{discount}%</Text>
          </View>
        )}
        {product.badge && !isWished && (
          <View style={styles.productBadge}>
            <Text style={styles.productBadgeText}>{product.badge}</Text>
          </View>
        )}
        <Image source={{ uri: image }} style={[styles.image, isOutOfStock && styles.imageDimmed]} />
        <TouchableOpacity style={[styles.wishBtn, isWished && styles.wishBtnActive]} onPress={onToggleWishlist}>
          <Heart size={13} color={isWished ? '#000' : GoldColors.goldMuted} fill={isWished ? '#000' : 'none'} />
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
          <TouchableOpacity style={styles.cartBtn} onPress={onAddToCart}>
            <ShoppingCart size={12} color={CustomerColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn} onPress={onBuyNow}>
            <Zap size={12} color="#000" />
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
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
  discountBadge: { position: 'absolute', top: 8, left: 8, zIndex: 2, backgroundColor: GoldColors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  discountBadgeText: { fontSize: 9, fontWeight: '800', color: '#000' },
  productBadge: { position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 1, borderColor: GoldColors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  productBadgeText: { fontSize: 9, fontWeight: '700', color: GoldColors.goldDark },
  wishBtn: { position: 'absolute', top: 8, right: 8, zIndex: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  wishBtnActive: { backgroundColor: GoldColors.gold },
  info: { padding: Spacing.sm, gap: 2 },
  brand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: GoldColors.goldDark },
  title: { fontSize: FontSizes.sm, fontWeight: '500', color: '#111827', minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { fontSize: FontSizes.md, fontWeight: '700', color: '#111827' },
  originalPrice: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  ctaRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: CustomerColors.border },
  cartBtn: { width: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, borderRightWidth: 1, borderRightColor: CustomerColors.border },
  buyBtn: { flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, backgroundColor: GoldColors.gold },
  buyBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#000', textTransform: 'uppercase' },
  outOfStockRow: { borderTopWidth: 1, borderTopColor: CustomerColors.border, paddingVertical: Spacing.sm, alignItems: 'center' },
  outOfStockText: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
});
