import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight, Package } from 'lucide-react-native';
import { TitleGroup, ProductGroup } from '../../utils/supplierGrouping';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface Props {
  titleGroup: TitleGroup | null;
  visible: boolean;
  onClose: () => void;
  onCompareBrand: (group: ProductGroup) => void;
}

export default function BrandListSheet({ titleGroup, visible, onClose, onCompareBrand }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => { if (visible) setIndex(0); }, [visible, titleGroup?.titleKey]);

  if (!titleGroup) return null;
  const total = titleGroup.brands.length;
  const b = titleGroup.brands[index];
  const cheapest = b?.suppliers[0];

  const goPrev = () => setIndex(i => (i - 1 + total) % total);
  const goNext = () => setIndex(i => (i + 1) % total);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{titleGroup.title}</Text>
              <Text style={styles.subtitle}>
                {titleGroup.brandCount} brand{titleGroup.brandCount !== 1 ? 's' : ''} available
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}><X size={22} color={CustomerColors.textSecondary} /></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
            {total === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl }}>
                <Package size={36} color={CustomerColors.border} />
                <Text style={{ color: CustomerColors.textSecondary, marginTop: Spacing.sm }}>No brands available.</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <TouchableOpacity style={styles.navBtn} disabled={total <= 1} onPress={goPrev}>
                  <ChevronLeft size={18} color={total <= 1 ? CustomerColors.border : CustomerColors.teal700} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={[styles.card, index === 0 && styles.cardBest]}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.brandName}>{b.brand || 'Unbranded'}</Text>
                        {index === 0 && (
                          <View style={styles.bestPill}><Text style={styles.bestPillText}>Best price</Text></View>
                        )}
                        <Text style={styles.metaText}>
                          Stock: {cheapest?.totalStock ?? '—'} · Available from {b.supplierCount} supplier{b.supplierCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>₹{b.lowestPrice}</Text>
                    </View>
                    <TouchableOpacity style={styles.compareBtn} onPress={() => onCompareBrand(b)}>
                      <Text style={styles.compareBtnText}>Compare Suppliers</Text>
                    </TouchableOpacity>
                  </View>

                  {total > 1 && (
                    <View style={styles.dots}>
                      {titleGroup.brands.map((_, i) => (
                        <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                      ))}
                    </View>
                  )}
                  <Text style={styles.countText}>{index + 1} of {total}</Text>
                </View>

                <TouchableOpacity style={styles.navBtn} disabled={total <= 1} onPress={goNext}>
                  <ChevronRight size={18} color={total <= 1 ? CustomerColors.border : CustomerColors.teal700} />
                </TouchableOpacity>
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
  brandName: { fontSize: FontSizes.base, fontWeight: '700', color: CustomerColors.black },
  bestPill: { alignSelf: 'flex-start', backgroundColor: CustomerColors.mint, borderRadius: BorderRadius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  bestPillText: { fontSize: 10, fontWeight: '800', color: CustomerColors.teal700 },
  metaText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 4 },
  priceText: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.teal700 },
  compareBtn: { marginTop: Spacing.sm, backgroundColor: CustomerColors.teal600, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  compareBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CustomerColors.border },
  dotActive: { width: 16, backgroundColor: CustomerColors.teal600 },
  countText: { textAlign: 'center', fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 4 },
});