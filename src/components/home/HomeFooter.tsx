import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, MapPin, Shield, CreditCard, Truck } from 'lucide-react-native';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Compact mobile counterpart of client/app/components-sections/Footer.tsx.
// Web's link columns (Company/Support/Shop) mostly point at '#' (no real
// page behind them even on web), so those are kept as static text here
// rather than fake-navigating; the handful of web footer links that DO have
// a real destination (About Us, Our Services, Testimonials, Nearby Offers,
// My Orders) are wired to the matching registered screens. Social icons
// mirror web's non-functional '#' links — decorative, not fake buttons that
// silently do nothing when tapped is what the buttons signal.

const QUICK_LINKS = [
  { label: 'About Us', route: 'About' },
  { label: 'Our Services', route: 'Services' },
  { label: 'Testimonials', route: 'Testimonials' },
  { label: 'Nearby Offers', route: 'Nearby' },
  { label: 'My Orders', route: 'Orders' },
];

const PAYMENT_ICONS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'];

export default function HomeFooter() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.logo}>R<Text style={styles.logoAccent}>E</Text>mise</Text>
      </View>
      <Text style={styles.tagline}>
        India's favourite lifestyle destination. Groceries, cosmetics, toys & more — delivered to your door.
      </Text>

      <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+919677710045')}>
        <Phone size={13} color={GoldColors.gold} />
        <Text style={styles.contactText}>+91 96777 10045</Text>
      </TouchableOpacity>
      <View style={styles.contactRow}>
        <MapPin size={13} color={GoldColors.gold} />
        <Text style={styles.contactText}>Chennai, Tamil Nadu, India</Text>
      </View>

      <View style={styles.socialRow}>
        {['X', 'IG', 'FB', 'YT'].map((label) => (
          <View key={label} style={styles.socialIcon}>
            <Text style={styles.socialIconText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Quick Links</Text>
      <View style={styles.linksGrid}>
        {QUICK_LINKS.map(link => (
          <TouchableOpacity key={link.label} style={styles.linkChip} onPress={() => navigation.navigate(link.route)}>
            <Text style={styles.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Shield size={13} color="#22C55E" />
          <Text style={styles.trustText}>Secure Checkout</Text>
        </View>
        <View style={styles.trustItem}>
          <Truck size={13} color={GoldColors.gold} />
          <Text style={styles.trustText}>Fast Delivery</Text>
        </View>
        <View style={styles.trustItem}>
          <CreditCard size={13} color="#60A5FA" />
          <Text style={styles.trustText}>Easy Payments</Text>
        </View>
      </View>

      <View style={styles.paymentRow}>
        {PAYMENT_ICONS.map(p => (
          <View key={p} style={styles.paymentPill}>
            <Text style={styles.paymentText}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.copyright}>© 2025 Remise. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111827', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  brandRow: { marginBottom: Spacing.sm },
  logo: { fontSize: FontSizes.lg, fontWeight: '900', color: '#fff' },
  logoAccent: { color: CustomerColors.primary },
  tagline: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 18, marginBottom: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  contactText: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  socialRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  socialIcon: { width: 30, height: 30, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  socialIconText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: Spacing.lg },
  sectionLabel: { fontSize: FontSizes.sm, fontWeight: '800', color: '#fff', marginBottom: Spacing.sm },
  linksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  linkChip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  linkText: { fontSize: FontSizes.xs, color: '#D1D5DB', fontWeight: '600' },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.md },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  paymentPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  paymentText: { fontSize: 9, color: '#D1D5DB', fontWeight: '600' },
  copyright: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
});