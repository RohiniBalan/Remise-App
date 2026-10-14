import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupedSupplier, ProductGroup, tierFor } from '../../utils/supplierTypes';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, translateProductName, getSupplierTranslations } from '../../i18n';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function StoreSupplierCompareScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const st = useMemo(() => getSupplierTranslations(language), [language]);
  const styles = useMemo(() => getStyles(isDark), [isDark]);
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
  const model = s?.attributes?.model || s?.attributes?.modelName || s?.attributes?.modelNumber || s?.attributes?.Model || s?.specifications?.find((sp: any) => sp.label?.toLowerCase().includes('model'))?.value || '';
  const desc = s?.description || group.description || '';
  const brand = s?.brand || group.brand || '';
  const subcategory = s?.subcategory || group.subcategory || '';
  const specs = (s?.specifications && s.specifications.length > 0) ? s.specifications : (group.specifications || []);

  const addedDescText = useMemo(() => {
    const prodName = translateProductName(group.title, language);
    const storeName = selected?.storeName || 'Supplier';
    return (st.addedToSupplierCartDesc || '{{product}} from {{supplier}} has been added to your order requisition.')
      .replace('{{product}}', prodName)
      .replace('{{supplier}}', storeName);
  }, [st.addedToSupplierCartDesc, group.title, language, selected?.storeName]);

  return (
    <View style={styles.overlay}>
      {/* Tap backdrop to dismiss */}
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      {/* Slide-up Bottom Sheet Modal */}
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Drag handle bar */}
        <View style={styles.dragHandle} />

        {/* Sheet Header */}
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1, paddingRight: Spacing.sm }}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {translateProductName(group.title, language)}
            </Text>
            <Text style={styles.sheetSub}>
              {selected
                ? `${st.orderingFrom} ${selected.storeName}`
                : (group.supplierCount === 1
                    ? st.supplierAvailableSingle
                    : `${group.supplierCount} ${st.suppliersAvailable}`)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={18} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sheet Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.sheetBody}
        >
          {!selected && total > 0 && s && (
            <View style={styles.carouselContainer}>
              {/* Context Pill */}
              <View style={styles.contextPill}>
                <Sparkles size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                <Text style={styles.contextPillText}>{st.compareSuppliers}</Text>
              </View>

              <View style={styles.carouselRow}>
                <TouchableOpacity
                  style={[styles.arrowBtn, total <= 1 && styles.arrowBtnDisabled]}
                  onPress={goPrev}
                  disabled={total <= 1}
                  activeOpacity={0.7}
                >
                  <ChevronLeft
                    size={20}
                    color={total <= 1 ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : CustomerColors.textSecondary)}
                  />
                </TouchableOpacity>

                <View style={styles.cardWrap}>
                  <View style={[styles.card, carouselIndex === 0 && styles.cardBest]}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1, paddingRight: Spacing.xs }}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {translateProductName(group.title, language)}
                        </Text>
                        <Text style={styles.storeName} numberOfLines={1}>{s.storeName}</Text>
                        {carouselIndex === 0 && (
                          <View style={styles.bestBadge}>
                            <Text style={styles.bestBadgeText}>{st.bestPrice}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.price}>₹{s.price}</Text>
                    </View>

                    {/* Details Grid: uses flex and wrapping so no text ever overflows */}
                    <View style={styles.detailsGrid}>
                      {brand ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel} numberOfLines={1}>{st.brand}</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{brand}</Text>
                        </View>
                      ) : null}
                      {model ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel} numberOfLines={1}>{st.model}</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{model}</Text>
                        </View>
                      ) : null}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel} numberOfLines={1}>{st.categoryCaps}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                          {group.category}{subcategory ? ` • ${subcategory}` : ''}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel} numberOfLines={2}>{st.stockMoqCaps}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                          {st.stock}: {s.totalStock} · {st.moq}: {s.moq}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    {desc ? (
                      <View style={styles.descBox}>
                        <Text style={styles.boxTitle}>{st.description}</Text>
                        <Text style={styles.descText} numberOfLines={3}>{desc}</Text>
                      </View>
                    ) : null}

                    {/* Specifications */}
                    {specs && specs.length > 0 && (
                      <View style={styles.descBox}>
                        <Text style={styles.boxTitle}>{st.specifications}</Text>
                        {specs.slice(0, 3).map((sp: any, i: number) => (
                          <View key={i} style={styles.specRow}>
                            <Text style={styles.specLabel} numberOfLines={1}>{sp.label}:</Text>
                            <Text style={styles.specValue} numberOfLines={1}>{sp.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Bulk Pricing */}
                    {s.bulkPricing?.length > 0 && (
                      <View style={styles.bulkBox}>
                        <Text style={styles.bulkTitle}>{st.wholesaleBulkTiers}</Text>
                        {s.bulkPricing.map((t, i) => (
                          <Text key={i} style={styles.bulkRow}>
                            {t.minQty}+ {st.units} — ₹{t.price}
                          </Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => handleSelect(s)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={styles.selectBtnText}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {st.selectSupplier}
                        </Text>
                      </TouchableOpacity>
                      {s.productId && (
                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => navigation.navigate('ProductDetail', { productId: s.productId })}
                          activeOpacity={0.8}
                        >
                          <Eye size={15} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                          <Text
                            style={styles.detailsBtnText}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {st.details}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
                  <Text style={styles.counter}>{carouselIndex + 1} {st.ofTotal} {total}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.arrowBtn, total <= 1 && styles.arrowBtnDisabled]}
                  onPress={goNext}
                  disabled={total <= 1}
                  activeOpacity={0.7}
                >
                  <ChevronRight
                    size={20}
                    color={total <= 1 ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : CustomerColors.textSecondary)}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {selected && !added && (
            <View style={styles.selectedBox}>
              <Text style={styles.storeNameLg}>{selected.storeName}</Text>
              <Text style={styles.metaText}>{st.moq}: {selected.moq} · {st.stock}: {selected.totalStock}</Text>

              <Text style={styles.qtyLabel}>{st.quantity} ({st.moq}: {selected.moq})</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQty(q => Math.max(selected.moq || 1, q - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQty(q => Math.min(selected.totalStock || 9999, q + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              {label && <Text style={styles.tierLabel}>{label}</Text>}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>{st.subtotal}</Text>
                <Text style={styles.subtotalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.backSmallBtn}
                  onPress={() => setSelected(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backSmallBtnText}>{st.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addBtnText}>{st.addToCart}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {added && (
            <View style={styles.addedBox}>
              <View style={styles.tickCircle}>
                <CheckCircle2 size={56} color="#10B981" />
              </View>
              <Text style={styles.addedText}>{st.addedToSupplierCart}</Text>
              <Text style={styles.addedSubText}>{addedDescText}</Text>
              <Text style={styles.addedRedirectText}>{st.redirectingToCart}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: isDark ? '#111827' : CustomerColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: isDark ? 'rgba(45, 212, 191, 0.3)' : 'rgba(13, 148, 136, 0.2)',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : CustomerColors.steelBorder,
  },
  sheetTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  sheetSub: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    backgroundColor: isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(13, 148, 136, 0.1)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(45, 212, 191, 0.25)' : 'rgba(13, 148, 136, 0.2)',
    marginBottom: Spacing.sm,
    alignSelf: 'center',
  },
  contextPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  carouselContainer: {
    width: '100%',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowBtnDisabled: {
    opacity: 0.35,
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: 2,
  },
  card: {
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBest: {
    borderColor: isDark ? 'rgba(45, 212, 191, 0.6)' : CustomerColors.teal600,
    backgroundColor: isDark ? 'rgba(19, 78, 74, 0.45)' : '#F0FDFA',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  productTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: isDark ? '#ffffff' : '#000000',
    marginBottom: 2,
  },
  storeName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  storeNameLg: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#115e59' : '#CCFBF1',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  detailsGrid: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : CustomerColors.steelBorder,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    fontWeight: '700',
    flexShrink: 1,
    maxWidth: '48%',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#000000',
    flex: 1,
    textAlign: 'right',
  },
  descBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.6)' : '#F9FAFB',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.6)' : CustomerColors.steelBorder,
  },
  boxTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  descText: {
    fontSize: 11,
    color: isDark ? '#ffffff' : '#000000',
    lineHeight: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  specLabel: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#000000',
  },
  bulkBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: isDark ? 'rgba(19, 78, 74, 0.5)' : '#F0FDFA',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(45, 212, 191, 0.2)' : '#CCFBF1',
  },
  bulkTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  bulkRow: {
    fontSize: 11,
    color: isDark ? '#ffffff' : '#000000',
    fontWeight: '600',
    marginTop: 2,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginTop: 4,
  },
  price: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  selectBtn: {
    flex: 1,
    backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.85)' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  detailsBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: isDark ? '#374151' : CustomerColors.steelBorder,
  },
  dotActive: {
    width: 20,
    backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal600,
  },
  counter: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginTop: 6,
  },
  selectedBox: {
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(45, 212, 191, 0.3)' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  qtyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: FontSizes.lg,
    color: isDark ? '#F9FAFB' : CustomerColors.textSecondary,
  },
  qtyValue: {
    width: 50,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    color: isDark ? '#ffffff' : '#000000',
  },
  tierLabel: {
    fontSize: FontSizes.xs,
    color: isDark ? '#2DD4BF' : CustomerColors.teal600,
    fontWeight: '600',
    marginTop: 6,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F5F5F5',
    paddingTop: Spacing.sm,
    marginTop: Spacing.md,
  },
  subtotalLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#000000',
  },
  subtotalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  backSmallBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
  },
  backSmallBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
  addBtn: {
    flex: 1,
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  addedBox: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xxl,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0',
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  tickCircle: {
    marginBottom: Spacing.xs,
  },
  addedText: {
    fontWeight: '800',
    fontSize: FontSizes.lg,
    color: isDark ? '#F9FAFB' : '#111827',
    textAlign: 'center',
  },
  addedSubText: {
    fontSize: FontSizes.sm,
    color: isDark ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    maxWidth: 290,
    marginTop: 4,
    lineHeight: 20,
  },
  addedRedirectText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
});