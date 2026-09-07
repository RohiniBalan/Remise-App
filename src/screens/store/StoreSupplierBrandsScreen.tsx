import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronLeft, ChevronRight, Package } from 'lucide-react-native';
import { TitleGroup } from '../../utils/supplierTypes';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

export default function StoreSupplierBrandsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const titleGroup: TitleGroup = route.params.titleGroup;
  const [index, setIndex] = useState(0);
  const total = titleGroup.brands.length;

  const goPrev = () => setIndex(i => (i - 1 + total) % total);
  const goNext = () => setIndex(i => (i + 1) % total);

  const b = titleGroup.brands[index];
  const cheapest = b?.suppliers[0]; // suppliers pre-sorted ascending by price

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleGroup.title}</Text>
        <Text style={styles.headerSub}>{titleGroup.brandCount} brand{titleGroup.brandCount !== 1 ? 's' : ''} available</Text>
      </View>

      <View style={styles.body}>
        {total === 0 ? (
          <View style={styles.empty}>
            <Package size={36} color={isDark ? '#374151' : CustomerColors.steelBorder} />
            <Text style={styles.emptyText}>No brands available.</Text>
          </View>
        ) : (
          <View style={styles.carouselRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={goPrev} disabled={total <= 1}>
              <ChevronLeft size={18} color={total <= 1 ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : CustomerColors.textSecondary)} />
            </TouchableOpacity>

            <View style={styles.cardWrap}>
              <View style={[styles.card, index === 0 && styles.cardBest]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.brandName}>{b.brand || 'Unbranded'}</Text>
                    {index === 0 && (
                      <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>Best price</Text></View>
                    )}
                    <Text style={styles.stockText}>
                      Stock: {cheapest?.totalStock ?? '—'} · Available from {b.supplierCount} supplier{b.supplierCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.price}>₹{b.lowestPrice}</Text>
                </View>

                <TouchableOpacity style={styles.compareBtn} onPress={() => navigation.navigate('SupplierCompare', { group: b })}>
                  <Text style={styles.compareBtnText}>Compare Suppliers</Text>
                </TouchableOpacity>
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
              <Text style={styles.counter}>{index + 1} of {total}</Text>
            </View>

            <TouchableOpacity style={styles.arrowBtn} onPress={goNext} disabled={total <= 1}>
              <ChevronRight size={18} color={total <= 1 ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : CustomerColors.textSecondary)} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
  header: { backgroundColor: isDark ? '#111827' : '#DFF1F1', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
  headerSub: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
  body: { padding: Spacing.lg },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
  carouselRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  arrowBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: isDark ? '#374151' : CustomerColors.steelBorder, backgroundColor: isDark ? '#1F2937' : CustomerColors.white, alignItems: 'center', justifyContent: 'center' },
  cardWrap: { flex: 1 },
  card: { borderWidth: 1, borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder, backgroundColor: isDark ? '#111827' : CustomerColors.white, borderRadius: BorderRadius.md, padding: Spacing.md },
  cardBest: { borderColor: isDark ? '#0f766e' : CustomerColors.teal600, backgroundColor: isDark ? '#134e4a' : '#F0FDFA' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  brandName: { fontSize: FontSizes.base, fontWeight: '700', color: isDark ? '#F9FAFB' : CustomerColors.black },
  bestBadge: { alignSelf: 'flex-start', backgroundColor: isDark ? '#115e59' : '#CCFBF1', borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  bestBadgeText: { fontSize: 10, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  stockText: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : '#9CA3AF', marginTop: 6 },
  price: { fontSize: FontSizes.lg, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
  compareBtn: { marginTop: Spacing.md, backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600, paddingVertical: 10, borderRadius: BorderRadius.sm, alignItems: 'center' },
  compareBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? '#374151' : CustomerColors.steelBorder },
  dotActive: { width: 20, backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal600 },
  counter: { textAlign: 'center', fontSize: FontSizes.xs, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 6 },
});