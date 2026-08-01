import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { GroupedSupplier, ProductGroup, tierFor } from '../../utils/supplierTypes';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Full-screen port of SupplierCompareDrawer.tsx — carousel of suppliers for
// ONE brand (index 0 = best price, suppliers pre-sorted ascending), then a
// select → quantity stepper → subtotal → Add to Cart flow, same as web.
export default function StoreSupplierCompareScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const group: ProductGroup = route.params.group;
  const { addToCart } = useSupplierCart();

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selected, setSelected] = useState<GroupedSupplier | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const total = group.suppliers.length;
  const goPrev = () => setCarouselIndex(i => (i - 1 + total) % total);
  const goNext = () => setCarouselIndex(i => (i + 1) % total);

  const handleSelect = (s: GroupedSupplier) => {
    setSelected(s);
    setQty(s.moq || 1);
  };

  const { price, label } = selected ? tierFor(selected, qty) : { price: 0, label: null };
  const subtotal = price * qty;

  const handleAdd = () => {
    if (!selected) return;
    addToCart(selected, qty, price, label, group);
    setAdded(true);
    setTimeout(() => navigation.navigate('SupplierCart'), 900);
  };

  const s = group.suppliers[carouselIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={CustomerColors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.title}</Text>
        <Text style={styles.headerSub}>
          {selected ? `Ordering from ${selected.storeName}` : `${group.supplierCount} suppliers available`}
        </Text>
      </View>

      <View style={styles.body}>
        {!selected && total > 0 && (
          <View style={styles.carouselRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={goPrev} disabled={total <= 1}>
              <ChevronLeft size={18} color={total <= 1 ? '#D1D5DB' : CustomerColors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.cardWrap}>
              <View style={[styles.card, carouselIndex === 0 && styles.cardBest]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storeName}>{s.storeName}</Text>
                    {carouselIndex === 0 && (
                      <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>Best price</Text></View>
                    )}
                    <Text style={styles.metaText}>MOQ: {s.moq} units · Stock: {s.totalStock}</Text>
                  </View>
                  <Text style={styles.price}>₹{s.price}</Text>
                </View>

                {s.bulkPricing?.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    {s.bulkPricing.map((t, i) => (
                      <Text key={i} style={styles.tierText}>{t.minQty}+ units — ₹{t.price}</Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelect(s)}>
                  <Text style={styles.selectBtnText}>Select Supplier</Text>
                </TouchableOpacity>
              </View>

              {total > 1 && (
                <View style={styles.dotsRow}>
                  {group.suppliers.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setCarouselIndex(i)}>
                      <View style={[styles.dot, i === carouselIndex && styles.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.counter}>{carouselIndex + 1} of {total}</Text>
            </View>

            <TouchableOpacity style={styles.arrowBtn} onPress={goNext} disabled={total <= 1}>
              <ChevronRight size={18} color={total <= 1 ? '#D1D5DB' : CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {selected && !added && (
          <View>
            <View style={styles.selectedBox}>
              <Text style={styles.storeName}>{selected.storeName}</Text>
              <Text style={styles.metaText}>MOQ: {selected.moq} units · Stock: {selected.totalStock}</Text>
            </View>

            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(selected.moq, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {label && <Text style={styles.tierLabel}>{label}</Text>}

            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.backSmallBtn} onPress={() => setSelected(null)}>
                <Text style={styles.backSmallBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {added && (
          <View style={styles.addedBox}>
            <CheckCircle2 size={36} color="#16A34A" />
            <Text style={styles.addedText}>Added to cart</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: { backgroundColor: '#DFF1F1', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, fontWeight: '600' },
  headerTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  headerSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  body: { padding: Spacing.lg },
  carouselRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  arrowBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: CustomerColors.steelBorder, backgroundColor: CustomerColors.white, alignItems: 'center', justifyContent: 'center' },
  cardWrap: { flex: 1 },
  card: { borderWidth: 1, borderColor: CustomerColors.steelBorder, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, padding: Spacing.md },
  cardBest: { borderColor: CustomerColors.teal600, backgroundColor: '#F0FDFA' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  storeName: { fontSize: FontSizes.base, fontWeight: '700', color: CustomerColors.black },
  bestBadge: { alignSelf: 'flex-start', backgroundColor: '#CCFBF1', borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  bestBadgeText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
  metaText: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 6 },
  price: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.teal700 },
  tierText: { fontSize: 11, color: '#9CA3AF' },
  selectBtn: { marginTop: Spacing.md, backgroundColor: CustomerColors.teal600, paddingVertical: 10, borderRadius: BorderRadius.sm, alignItems: 'center' },
  selectBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CustomerColors.steelBorder },
  dotActive: { width: 20, backgroundColor: CustomerColors.teal600 },
  counter: { textAlign: 'center', fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 6 },
  selectedBox: { backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, padding: Spacing.md },
  qtyLabel: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  qtyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: FontSizes.lg, color: CustomerColors.textSecondary },
  qtyValue: { width: 50, textAlign: 'center', fontWeight: '700', fontSize: FontSizes.sm },
  tierLabel: { fontSize: FontSizes.xs, color: CustomerColors.teal600, fontWeight: '600', marginTop: 6 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: Spacing.sm, marginTop: Spacing.md },
  subtotalLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  subtotalValue: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.teal700 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  backSmallBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  backSmallBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.textSecondary },
  addBtn: { flex: 1, backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.base },
  addedBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  addedText: { fontWeight: '700', fontSize: FontSizes.base, color: '#374151' },
});