import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart, ShoppingCart, Zap, Truck, CheckCircle } from 'lucide-react-native';
import { productApi, Product, productImage } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { GoldColors, CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/product/[productId]/page.tsx — same single
// full-catalog fetch + client-side find-by-id (the web page doesn't use a
// dedicated /:id endpoint either), same 4 tabs (About/Specs/Ideal For/
// Shipping), same quantity bounds (1..totalStock), same Add to Cart / Buy
// Now behavior. Zoom-on-hover and the noise texture overlay are desktop-only
// affordances with no mobile equivalent and are intentionally not ported —
// everything else (fields, business logic, gold theme) carries over.

const TABS = ['About', 'Specs', 'Ideal For', 'Shipping'] as const;

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId: routeProductId } = route.params;
  const { addToCart, setBuyNowItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>('About');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    productApi
      .getAll()
      .then(res => {
        const data = res.data;
        const arr: Product[] = Array.isArray(data) ? data : data.products || data.data || [];
        const found = arr.find(p => String(p._id) === String(routeProductId) || String(p.id) === String(routeProductId));
        if (found) {
          setProduct(found);
          setActiveImage(productImage(found));
        }
      })
      .finally(() => setLoading(false));
  }, [routeProductId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  const specs = useMemo(() => {
    if (!product) return [];
    const base = Array.isArray(product.specifications) ? [...product.specifications] : [];
    if (product.totalStock !== undefined) base.push({ label: 'Total Stock', value: `${product.totalStock} Units` });
    return base;
  }, [product]);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOutOfStock = product.totalStock <= 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({ id: product._id || product.id!, title: product.title, price: product.price, quantity, image: activeImage, totalStock: product.totalStock });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setBuyNowItem({ id: product._id || product.id!, title: product.title, price: product.price, quantity, image: activeImage, totalStock: product.totalStock });
    navigation.navigate('Checkout');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      <View style={styles.imageWrap}>
        {discount > 0 && !isOutOfStock && (
          <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>-{discount}% OFF</Text></View>
        )}
        <Image source={{ uri: activeImage }} style={[styles.image, isOutOfStock && styles.imageDimmed]} />
        <TouchableOpacity style={[styles.wishBtn, wishlisted && styles.wishBtnActive]} onPress={() => setWishlisted(w => !w)}>
          <Heart size={16} color={wishlisted ? '#000' : CustomerColors.textSecondary} fill={wishlisted ? '#000' : 'none'} />
        </TouchableOpacity>
      </View>

      {gallery.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {gallery.map((img, idx) => (
            <TouchableOpacity key={idx} onPress={() => setActiveImage(img)} style={[styles.thumb, activeImage === img && styles.thumbActive]}>
              <Image source={{ uri: img }} style={styles.thumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.brand}>{product.brand}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.category}>{product.category}</Text>
          {product.badge && !isOutOfStock && (
            <View style={styles.badgePill}><Text style={styles.badgePillText}>{product.badge}</Text></View>
          )}
        </View>

        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price?.toLocaleString()}</Text>
          {product.originalPrice && product.originalPrice > product.price && !isOutOfStock && (
            <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.stockRow}>
          <View>
            <Text style={styles.stockLabel}>Stock</Text>
            <Text style={[styles.stockValue, isOutOfStock && styles.stockValueOut]}>
              {isOutOfStock ? 'Out of Stock' : `${product.totalStock} units`}
            </Text>
          </View>
          <View>
            <Text style={styles.stockLabel}>Delivery</Text>
            <Text style={styles.stockValue}>{product.deliveryTime || '3–8 days'}</Text>
          </View>
        </View>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Qty</Text>
          <View style={styles.qtyStepper}>
            <TouchableOpacity style={styles.qtyBtn} disabled={isOutOfStock} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{isOutOfStock ? 0 : quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} disabled={isOutOfStock || quantity >= product.totalStock} onPress={() => setQuantity(q => Math.min(product.totalStock, q + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isOutOfStock ? (
          <View style={styles.outOfStockCta}><Text style={styles.outOfStockCtaText}>Out of Stock</Text></View>
        ) : (
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.cartCta} onPress={handleAddToCart}>
              <ShoppingCart size={14} color={GoldColors.goldDark} />
              <Text style={styles.cartCtaText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyCta} onPress={handleBuyNow}>
              <Zap size={14} color="#000" />
              <Text style={styles.buyCtaText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.shippingNote}>
          <Truck size={13} color={GoldColors.gold} />
          <Text style={styles.shippingNoteText}>
            Free shipping on prepaid orders · Est. delivery <Text style={styles.shippingNoteBold}>{product.deliveryTime || '3–8 days'}</Text>
          </Text>
        </View>

        <View style={styles.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={styles.tabItem} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {tab === 'About' && (
            <View style={{ gap: Spacing.lg }}>
              {product.aboutFeatures && product.aboutFeatures.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Key Features</Text>
                  {product.aboutFeatures.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <View style={styles.featureDot} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.paragraph}>{product.aboutDescription || product.description || 'No description available.'}</Text>
              </View>
            </View>
          )}

          {tab === 'Specs' && (
            specs.length > 0 ? (
              <View style={styles.specTable}>
                {specs.map((s, idx) => (
                  <View key={idx} style={[styles.specRow, idx % 2 === 0 && styles.specRowAlt]}>
                    <Text style={styles.specLabel}>{s.label}</Text>
                    <Text style={styles.specValue}>{s.value || '—'}</Text>
                  </View>
                ))}
              </View>
            ) : <Text style={styles.emptyText}>No specifications available.</Text>
          )}

          {tab === 'Ideal For' && (
            product.idealFor && product.idealFor.length > 0 ? (
              <View style={styles.idealGrid}>
                {product.idealFor.map((item, idx) => (
                  <View key={idx} style={styles.idealCard}>
                    <CheckCircle size={13} color={GoldColors.gold} />
                    <Text style={styles.idealCardText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : <Text style={styles.emptyText}>No tags available.</Text>
          )}

          {tab === 'Shipping' && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.policyCard}>
                <Text style={styles.policyTitle}>Incorrect Product</Text>
                <Text style={styles.paragraph}>If the delivered item does not match your order confirmation, you are eligible for a full return or replacement at no additional cost.</Text>
              </View>
              <View style={styles.policyCard}>
                <Text style={styles.policyTitle}>Manufacturing Defect</Text>
                <Text style={styles.paragraph}>Photograph the defect immediately after unboxing and share with our support team. We will arrange a replacement or full refund promptly.</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: Spacing.xl },
  notFoundTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: '#111827' },
  notFoundSubtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  backBtn: { backgroundColor: GoldColors.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  backBtnText: { color: '#000', fontWeight: '800', fontSize: FontSizes.sm },
  imageWrap: { aspectRatio: 1, backgroundColor: '#F9F9F9' },
  image: { width: '100%', height: '100%' },
  imageDimmed: { opacity: 0.5 },
  discountBadge: { position: 'absolute', top: 12, left: 12, zIndex: 2, backgroundColor: GoldColors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3 },
  discountBadgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  wishBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  wishBtnActive: { backgroundColor: GoldColors.gold },
  thumbRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  thumb: { width: 60, height: 60, borderRadius: BorderRadius.sm, marginRight: Spacing.sm, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden' },
  thumbActive: { borderColor: GoldColors.gold, borderWidth: 2 },
  thumbImage: { width: '100%', height: '100%' },
  content: { padding: Spacing.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  brand: { fontSize: FontSizes.xs, fontWeight: '800', color: GoldColors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  metaDivider: { width: 1, height: 12, backgroundColor: '#EAEAEA' },
  category: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  badgePill: { marginLeft: 'auto', backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 1, borderColor: GoldColors.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3 },
  badgePillText: { fontSize: 9, fontWeight: '800', color: GoldColors.goldDark },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: Spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: Spacing.md },
  price: { fontSize: 28, fontWeight: '700', color: '#111827' },
  originalPrice: { fontSize: FontSizes.base, color: CustomerColors.textSecondary, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', gap: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#EAEAEA', marginBottom: Spacing.md },
  stockLabel: { fontSize: 9, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 2 },
  stockValue: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  stockValueOut: { color: CustomerColors.danger },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  qtyLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  qtyStepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: BorderRadius.sm, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: CustomerColors.textSecondary },
  qtyValue: { width: 36, textAlign: 'center', fontWeight: '700', color: GoldColors.goldDark },
  ctaRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  cartCta: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: GoldColors.gold },
  cartCtaText: { fontSize: FontSizes.xs, fontWeight: '800', color: GoldColors.goldDark, textTransform: 'uppercase' },
  buyCta: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: BorderRadius.md, backgroundColor: GoldColors.gold },
  buyCtaText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#000', textTransform: 'uppercase' },
  outOfStockCta: { height: 46, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#EAEAEA', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  outOfStockCtaText: { fontSize: FontSizes.xs, fontWeight: '800', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  shippingNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: '#EAEAEA', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  shippingNoteText: { flex: 1, fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  shippingNoteBold: { fontWeight: '700', color: '#111827' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EAEAEA', marginBottom: Spacing.lg },
  tabItem: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, marginRight: Spacing.sm },
  tabText: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  tabTextActive: { color: GoldColors.goldDark },
  tabIndicator: { height: 2, backgroundColor: GoldColors.gold, marginTop: 6, borderRadius: 1 },
  tabContent: { minHeight: 150 },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '700', color: GoldColors.goldDark, marginBottom: Spacing.sm, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.xs },
  featureDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GoldColors.gold, marginTop: 6 },
  featureText: { flex: 1, fontSize: FontSizes.sm, color: '#111827' },
  paragraph: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, lineHeight: 20 },
  specTable: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: BorderRadius.md, overflow: 'hidden' },
  specRow: { flexDirection: 'row', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  specRowAlt: { backgroundColor: '#F9F9F9' },
  specLabel: { width: '40%', fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  specValue: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', color: '#111827' },
  idealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  idealCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  idealCardText: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.textSecondary },
  emptyText: { textAlign: 'center', color: CustomerColors.textSecondary, paddingVertical: Spacing.xl },
  policyCard: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: BorderRadius.md, padding: Spacing.md },
  policyTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: GoldColors.goldDark, textTransform: 'uppercase', marginBottom: Spacing.xs },
});
