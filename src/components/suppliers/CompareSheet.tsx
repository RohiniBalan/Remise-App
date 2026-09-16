import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { ProductGroup, GroupedSupplier, tierFor } from '../../utils/supplierGrouping';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface Props {
  group: ProductGroup | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (supplier: GroupedSupplier, qty: number, price: number, tierLabel: string | null, group: ProductGroup) => void;
}

export default function CompareSheet({ group, visible, onClose, onAddToCart }: Props) {
  const { isDark } = useTheme();
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
  const model = s?.attributes?.model || s?.attributes?.modelName || s?.attributes?.modelNumber || s?.attributes?.Model || s?.specifications?.find((sp: any) => sp.label?.toLowerCase().includes('model'))?.value || '';
  const desc = s?.description || group.description || '';
  const brand = s?.brand || group.brand || '';
  const subcategory = s?.subcategory || group.subcategory || '';
  const specs = (s?.specifications && s.specifications.length > 0) ? s.specifications : (group.specifications || []);

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
        <View style={[styles.sheet, isDark && { backgroundColor: '#111827' }]}>
          <View style={[styles.header, isDark && { backgroundColor: '#1F2937' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>{group.title}</Text>
              <Text style={styles.subtitle}>
                {selected ? `Ordering from ${selected.storeName}` : `${group.supplierCount} suppliers available`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}><X size={22} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} /></TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ padding: Spacing.lg }}>
            {!selected && !added && total > 0 && s && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <TouchableOpacity style={[styles.navBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]} disabled={total <= 1} onPress={goPrev}>
                  <ChevronLeft size={18} color={total <= 1 ? (isDark ? '#4B5563' : CustomerColors.border) : (isDark ? '#2DD4BF' : CustomerColors.teal700)} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={[styles.card, carouselIndex === 0 && styles.cardBest, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.storeName, { color: isDark ? '#ffffff' : '#000000' }]}>{s.storeName}</Text>
                        {carouselIndex === 0 && (
                          <View style={styles.bestPill}><Text style={styles.bestPillText}>Best price</Text></View>
                        )}
                      </View>
                      <Text style={styles.priceText}>₹{s.price}</Text>
                    </View>

                    {/* Product Details Grid */}
                    <View style={{ marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : CustomerColors.steelBorder, gap: 6 }}>
                      {brand ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '700' }}>BRAND</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#ffffff' : '#000000' }}>{brand}</Text>
                        </View>
                      ) : null}
                      {model ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '700' }}>MODEL</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#ffffff' : '#000000' }}>{model}</Text>
                        </View>
                      ) : null}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '700' }}>CATEGORY</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#ffffff' : '#000000' }}>{group.category}{subcategory ? ` • ${subcategory}` : ''}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '700' }}>STOCK / MOQ</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#ffffff' : '#000000' }}>Stock: {s.totalStock} · MOQ: {s.moq}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    {desc ? (
                      <View style={{ marginTop: 8, padding: 8, borderRadius: BorderRadius.sm, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 2 }}>Description</Text>
                        <Text style={{ fontSize: 11, color: isDark ? '#ffffff' : '#000000', lineHeight: 16 }} numberOfLines={3}>{desc}</Text>
                      </View>
                    ) : null}

                    {/* Specifications */}
                    {specs && specs.length > 0 && (
                      <View style={{ marginTop: 6, padding: 8, borderRadius: BorderRadius.sm, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>Specifications</Text>
                        {specs.slice(0, 3).map((sp: any, i: number) => (
                          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary }}>{sp.label}:</Text>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#ffffff' : '#000000' }}>{sp.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Bulk Pricing */}
                    {s.bulkPricing?.length > 0 && (
                      <View style={{ marginTop: 6, padding: 6, borderRadius: BorderRadius.sm, backgroundColor: isDark ? '#134e4a' : '#F0FDFA' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, textTransform: 'uppercase' }}>Wholesale Bulk Tiers</Text>
                        {s.bulkPricing.map((t, i) => (
                          <Text key={i} style={{ fontSize: 11, color: isDark ? '#ffffff' : '#000000', fontWeight: '600', marginTop: 2 }}>
                            {t.minQty}+ units — ₹{t.price}
                          </Text>
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

                <TouchableOpacity style={[styles.navBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]} disabled={total <= 1} onPress={goNext}>
                  <ChevronRight size={18} color={total <= 1 ? (isDark ? '#4B5563' : CustomerColors.border) : (isDark ? '#2DD4BF' : CustomerColors.teal700)} />
                </TouchableOpacity>
              </View>
            )}

            {selected && !added && (
              <View style={{ gap: Spacing.md }}>
                <View style={[styles.selectedBox, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                  <Text style={[styles.storeName, { color: isDark ? '#ffffff' : '#000000' }]}>{selected.storeName}</Text>
                  <Text style={styles.metaText}>MOQ: {selected.moq} units · Stock: {selected.totalStock}</Text>
                  {(selected.brand || group.brand) && (
                    <Text style={{ fontSize: 12, color: isDark ? '#ffffff' : '#000000', marginTop: 4 }}>
                      Brand: <Text style={{ fontWeight: '700' }}>{selected.brand || group.brand}</Text>
                    </Text>
                  )}
                  {(selected.description || group.description) && (
                    <Text style={{ fontSize: 12, color: isDark ? '#ffffff' : '#000000', marginTop: 4 }} numberOfLines={2}>
                      {selected.description || group.description}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <View style={[styles.stepperRow, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(q => Math.max(selected.moq, q - 1))}>
                      <Text style={[styles.stepBtnText, isDark && { color: '#9CA3AF' }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepValue, { color: isDark ? '#ffffff' : '#000000' }]}>{qty}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(q => q + 1)}>
                      <Text style={[styles.stepBtnText, isDark && { color: '#9CA3AF' }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {label && <Text style={styles.tierLabel}>{label}</Text>}
                </View>

                <View style={styles.subtotalRow}>
                  <Text style={[styles.subtotalLabel, { color: isDark ? '#ffffff' : '#000000' }]}>Subtotal</Text>
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