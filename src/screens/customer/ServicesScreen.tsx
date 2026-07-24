import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Phone, Gift } from 'lucide-react-native';
import { servicesApi } from '../../api/contentApi';
import ContactModal from '../../components/common/ContactModal';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

// Ported from client/app/services/page.tsx — same Retail/Wholesale toggle,
// same GET /services shape (retailProducts/wholesaleProducts/retailOffer/
// wholesaleOffer), same default offer fallbacks if the admin hasn't
// customized them yet. "Contact Us" opens the same ContactModal used
// elsewhere (POST /contact/messages).
const DEFAULT_RETAIL_OFFER = {
  badgeText: 'EXCLUSIVE OFFER',
  discountPercentage: '25',
  title: 'OFF FOR RETAIL CUSTOMERS',
  description: 'Special discount on all retail purchases',
  perk1: { title: 'Minimum Purchase', desc: '₹5,000' },
  perk2: { title: 'Valid Until', desc: 'Dec 31, 2024' },
  perk3: { title: 'Free Gift', desc: 'Premium Wrapping Included' },
  buttonText: 'APPLY 25% DISCOUNT',
  terms: '*Terms & Conditions apply. Valid on select products.',
};
const DEFAULT_WHOLESALE_OFFER = {
  badgeText: 'VOLUME DISCOUNT',
  discountPercentage: '50',
  title: 'OFF FOR BUSINESS PARTNERS',
  description: 'Maximum discount on bulk purchases',
  perk1: { title: 'Minimum Order', desc: '200+ Units' },
  perk2: { title: 'Free Shipping', desc: 'Pan India Delivery' },
  perk3: { title: 'Dedicated Support', desc: 'Account Manager Included' },
  buttonText: 'APPLY 50% DISCOUNT',
  terms: '*Valid on orders above ₹5,00,000. Limited time offer.',
};

export default function ServicesScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 640;
  const [viewMode, setViewMode] = useState<'retail' | 'wholesale'>('retail');
  const [retailProducts, setRetailProducts] = useState<any[]>([]);
  const [wholesaleProducts, setWholesaleProducts] = useState<any[]>([]);
  const [retailOffer, setRetailOffer] = useState(DEFAULT_RETAIL_OFFER);
  const [wholesaleOffer, setWholesaleOffer] = useState(DEFAULT_WHOLESALE_OFFER);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    servicesApi
      .get()
      .then(res => {
        const data = res.data?.data;
        if (data) {
          setRetailProducts(data.retailProducts || []);
          setWholesaleProducts(data.wholesaleProducts || []);
          if (data.retailOffer) setRetailOffer(data.retailOffer);
          if (data.wholesaleOffer) setWholesaleOffer(data.wholesaleOffer);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const products = viewMode === 'retail' ? retailProducts : wholesaleProducts;
  const offer = viewMode === 'retail' ? retailOffer : wholesaleOffer;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GoldColors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'retail' && styles.toggleBtnActive,
          ]}
          onPress={() => setViewMode('retail')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'retail' && styles.toggleTextActive,
            ]}
          >
            Retail
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'wholesale' && styles.toggleBtnActive,
          ]}
          onPress={() => setViewMode('wholesale')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'wholesale' && styles.toggleTextActive,
            ]}
          >
            Wholesale
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(_, i) => String(i)}
        numColumns={isCompact ? 1 : 2}
        columnWrapperStyle={!isCompact ? { gap: Spacing.sm } : undefined}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.offerCard}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>{offer.badgeText}</Text>
            </View>
            <Text style={styles.offerDiscount}>
              {offer.discountPercentage}% {offer.title}
            </Text>
            <Text style={styles.offerDesc}>{offer.description}</Text>
            <View style={[styles.perkRow, isCompact && styles.perkRowStacked]}>
              {[offer.perk1, offer.perk2, offer.perk3].map((p, i) => (
                <View key={i} style={styles.perk}>
                  <Gift size={13} color={GoldColors.gold} />
                  <Text style={styles.perkTitle}>{p.title}</Text>
                  <Text style={styles.perkDesc}>{p.desc}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.offerTerms}>{offer.terms}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.productCard,
              isCompact && styles.productCardFullWidth,
            ]}
          >
            <Text style={styles.productIcon}>{item.icon || '🛍️'}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            {viewMode === 'wholesale' && item.moq ? (
              <Text style={styles.productMeta}>MOQ: {item.moq}</Text>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => setShowContact(true)}
          >
            <Phone size={16} color="#000" />
            <Text style={styles.contactBtnText}>Contact Us</Text>
          </TouchableOpacity>
        }
      />

      <ContactModal
        visible={showContact}
        onClose={() => setShowContact(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleBtnActive: {
    backgroundColor: GoldColors.gold,
    borderColor: GoldColors.gold,
  },
  toggleText: { color: '#9CA3AF', fontWeight: '700', fontSize: FontSizes.sm },
  toggleTextActive: { color: '#000' },
  list: { padding: Spacing.md },
  offerCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: GoldColors.gold,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  perkRowStacked: { flexDirection: 'column' },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GoldColors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
  },
  offerBadgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  offerDiscount: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff' },
  offerDesc: {
    fontSize: FontSizes.sm,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  perkRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  perk: { flex: 1, gap: 2 },
  perkTitle: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 2,
  },
  perkDesc: { fontSize: FontSizes.xs, color: '#fff', fontWeight: '600' },
  offerTerms: { fontSize: 10, color: '#6B7280' },
  productCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#333',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  productCardFullWidth: { marginHorizontal: 0 },
  productIcon: { fontSize: 28, marginBottom: Spacing.xs },
  productName: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  productCategory: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  productPrice: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: GoldColors.gold,
    marginTop: Spacing.xs,
  },
  productMeta: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  contactBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GoldColors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  contactBtnText: { color: '#000', fontWeight: '800', fontSize: FontSizes.sm },
});
