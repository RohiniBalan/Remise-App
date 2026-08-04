import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { ProductGroup, GroupedSupplier, tierFor } from '../../utils/supplierGrouping';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface Props {
  group: ProductGroup | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (supplier: GroupedSupplier, qty: number, price: number, tierLabel: string | null, group: ProductGroup) => void;
}

export default function CompareSheet({ group, visible, onClose, onAddToCart }: Props) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selected, setSelected] = useState<GroupedSupplier | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (visible) { setCarouselIndex(0); setSelected(null); setQty(1); setAdded(false); }
  }, [visible, group?.groupKey]);

  if (!group) return null;
  const total = group.suppliers.length;
  const s = group.suppliers[carouselIndex];

  const goPrev = () => setCarouselIndex(i => (i - 1 + total) % total);
  const goNext = () => setCarouselIndex(i => (i + 1) % total);

  const handleSelect = (supplier: GroupedSupplier) => { setSelected(supplier); setQty(supplier.moq || 1); };

  const { price, label } = selected ? tierFor(selected, qty) : { price: 0, label: null };
  const subtotal = price * qty;

  const handleAdd = () => {
    if (!selected) return;
    onAddToCart(selected, qty, price, label, group);
    setAdded(true);
    setTimeout(onClose, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{group.title}</Text>
              <Text style={styles.subtitle}>
                {selected ? `Ordering from ${selected.storeName}` : `${group.supplierCount} suppliers available`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}><X size={22} color={CustomerColors.textSecondary} /></TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ padding: Spacing.lg }}>
            {!selected && !added && total > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <TouchableOpacity style={styles.navBtn} disabled={total <= 1} onPress={goPrev}>
                  <ChevronLeft size={18} color={total <= 1 ? CustomerColors.border : CustomerColors.teal700} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={[styles.card, carouselIndex === 0 && styles.cardBest]}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.storeName}>{s.storeName}</Text>
                        {carouselIndex === 0 && (
                          <View style={styles.bestPill}><Text style={styles.bestPillText}>Best price</Text></View>
                        )}
                        <Text style={styles.metaText}>MOQ: {s.moq} units · Stock: {s.totalStock}</Text>
                      </View>
                      <Text style={styles.priceText}>₹{s.price}</Text>
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
                    <View style={styles.dots}>
                      {group.suppliers.map((_, i) => (
                        <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
                      ))}
                    </View>
                  )}
                  <Text style={styles.countText}>{carouselIndex + 1} of {total}</Text>
                </View>

                <TouchableOpacity style={styles.navBtn} disabled={total <= 1} onPress={goNext}>
                  <ChevronRight size={18} color={total <= 1 ? CustomerColors.border : CustomerColors.teal700} />
                </TouchableOpacity>
              </View>
            )}

            {selected && !added && (
              <View style={{ gap: Spacing.md }}>
                <View style={styles.selectedBox}>
                  <Text style={styles.storeName}>{selected.storeName}</Text>
                  <Text style={styles.metaText}>MOQ: {selected.moq} units · Stock: {selected.totalStock}</Text>
                </View>

                <View>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(q => Math.max(selected.moq, q - 1))}>
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{qty}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(q => q + 1)}>
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {label && <Text style={styles.tierLabel}>{label}</Text>}
                </View>

                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setSelected(null)}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {added && (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm }}>
                <CheckCircle2 size={36} color={CustomerColors.success} />
                <Text style={{ fontWeight: '700', color: CustomerColors.black }}>Added to cart</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: CustomerColors.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '90%' },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: Spacing.lg, backgroundColor: CustomerColors.mint,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
  },
  title: { fontSize: FontSizes.md, fontWeight: '800', color: CustomerColors.black },
  subtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  navBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: CustomerColors.steelBorder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.white,
  },
  card: { borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.lg, padding: Spacing.md },
  cardBest: { borderColor: CustomerColors.teal, backgroundColor: '#f0fbfb' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  storeName: { fontSize: FontSizes.base, fontWeight: '700', color: CustomerColors.black },
  bestPill: { alignSelf: 'flex-start', backgroundColor: CustomerColors.mint, borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  bestPillText: { fontSize: 10, fontWeight: '800', color: CustomerColors.teal700 },
  metaText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 4 },
  priceText: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.teal700 },
  tierText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  selectBtn: { marginTop: Spacing.sm, backgroundColor: CustomerColors.teal600, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  selectBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CustomerColors.border },
  dotActive: { width: 16, backgroundColor: CustomerColors.teal600 },
  countText: { textAlign: 'center', fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 4 },
  selectedBox: { backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, padding: Spacing.md },
  fieldLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  stepperRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, alignSelf: 'flex-start' },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: FontSizes.lg, color: CustomerColors.textSecondary },
  stepValue: { width: 48, textAlign: 'center', fontWeight: '700', fontSize: FontSizes.base },
  tierLabel: { fontSize: FontSizes.xs, color: CustomerColors.teal600, fontWeight: '600', marginTop: 6 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: CustomerColors.border, paddingTop: Spacing.sm },
  subtotalLabel: { fontWeight: '700', fontSize: FontSizes.sm, color: CustomerColors.black },
  subtotalValue: { fontWeight: '800', fontSize: FontSizes.lg, color: CustomerColors.teal700 },
  backBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  backBtnText: { fontWeight: '700', fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  addBtn: { flex: 1, backgroundColor: CustomerColors.primary, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.base },
});