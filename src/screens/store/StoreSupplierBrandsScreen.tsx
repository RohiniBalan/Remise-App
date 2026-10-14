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
  Package,
  Eye,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TitleGroup } from '../../utils/supplierTypes';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTranslation, translateProductName, getSupplierTranslations } from '../../i18n';

export default function StoreSupplierBrandsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const st = useMemo(() => getSupplierTranslations(language), [language]);
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const titleGroup: TitleGroup = route.params.titleGroup;
  const [index, setIndex] = useState(0);
  const total = titleGroup.brands.length;

  const goPrev = () => setIndex(i => (i - 1 + total) % total);
  const goNext = () => setIndex(i => (i + 1) % total);

  const b = titleGroup.brands[index];
  const cheapest = b?.suppliers[0]; // suppliers pre-sorted ascending by price

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
              {translateProductName(titleGroup.title, language)}
            </Text>
            <Text style={styles.sheetSub}>
              {titleGroup.brandCount === 1
                ? st.brandAvailableSingle
                : `${titleGroup.brandCount} ${st.brandsAvailable}`}
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
          {total === 0 ? (
            <View style={styles.empty}>
              <Package size={36} color={isDark ? '#374151' : CustomerColors.steelBorder} />
              <Text style={styles.emptyText}>{st.noBrandsAvailable}</Text>
            </View>
          ) : (
            <View style={styles.carouselContainer}>
              {/* Context Pill */}
              <View style={styles.contextPill}>
                <Sparkles size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                <Text style={styles.contextPillText}>{st.availableBrands}</Text>
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
                  <View style={[styles.card, index === 0 && styles.cardBest]}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1, paddingRight: Spacing.xs }}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {translateProductName(titleGroup.title, language)}
                        </Text>
                        <Text style={styles.brandName} numberOfLines={1}>
                          {b.brand || st.unbranded}
                        </Text>
                        {index === 0 && (
                          <View style={styles.bestBadge}>
                            <Text style={styles.bestBadgeText}>{st.bestPrice}</Text>
                          </View>
                        )}
                        <Text style={styles.stockText}>
                          {st.stock}: {cheapest?.totalStock ?? '—'} · {st.availableFrom} {b.supplierCount} {st.suppliersCount}
                        </Text>
                      </View>
                      <Text style={styles.price}>₹{b.lowestPrice}</Text>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.compareBtn}
                        onPress={() => navigation.navigate('SupplierCompare', { group: b })}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={styles.compareBtnText}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {st.compareSuppliers}
                        </Text>
                      </TouchableOpacity>
                      {cheapest?.productId && (
                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => navigation.navigate('ProductDetail', { productId: cheapest.productId })}
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
                      {titleGroup.brands.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => setIndex(i)}>
                          <View style={[styles.dot, i === index && styles.dotActive]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <Text style={styles.counter}>{index + 1} {st.ofTotal} {total}</Text>
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
    color: isDark ? '#F9FAFB' : CustomerColors.black,
    marginBottom: 2,
  },
  brandName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
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
  stockText: {
    fontSize: FontSizes.xs,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginTop: 6,
    lineHeight: 16,
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
  compareBtn: {
    flex: 1,
    backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: {
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
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
  },
});