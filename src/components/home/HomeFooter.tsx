import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, MapPin, Shield, CreditCard, Truck, Mail, Send } from 'lucide-react-native';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Compact mobile counterpart of client/app/components-sections/Footer.tsx.
// Web's link columns (Company/Support/Shop) mostly point at '#' (no real
// page behind them even on web), so those are kept as static text here
// rather than fake-navigating; the handful of web footer links that DO have
// a real destination (About Us, Our Services, Testimonials, Nearby Offers,
// My Orders) are wired to the matching registered screens. Social icons
// and the legal links (Privacy Policy, Terms of Use, Cookie Policy, Sitemap)
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

const LEGAL_LINKS = ['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Sitemap'];

export default function HomeFooter() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email.trim()) return;
    // TODO: wire to actual newsletter signup endpoint once available.
    Alert.alert('Subscribed', "You'll now receive our latest deals & offers.");
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.newsletterStrip}>
        <Text style={styles.newsletterTitle}>Stay in the Loop!</Text>
        <Text style={styles.newsletterSubtitle}>Get exclusive deals, new arrivals & offers in your inbox.</Text>
        <View style={styles.newsletterInputRow}>
          <View style={styles.newsletterInputWrap}>
            <Mail size={15} color="#CFF3F6" />
            <TextInput
              style={styles.newsletterInput}
              placeholder="Enter your email"
              placeholderTextColor="#CFF3F6"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Send size={14} color="#fff" />
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
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
          <Text style={styles.paymentLabel}>We accept:</Text>
          {PAYMENT_ICONS.map(p => (
            <View key={p} style={styles.paymentPill}>
              <Text style={styles.paymentText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.legalRow}>
          {LEGAL_LINKS.map(label => (
            <Text key={label} style={styles.legalText}>{label}</Text>
          ))}
        </View>

        <Text style={styles.copyright}>© 2025 Remise. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111827', paddingBottom: Spacing.xl },
  newsletterStrip: { backgroundColor: '#0FA3B1', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, marginBottom: Spacing.xl },
  newsletterTitle: { fontSize: FontSizes.md, fontWeight: '800', color: '#fff', marginBottom: 2 },
  newsletterSubtitle: { fontSize: FontSizes.xs, color: '#E0F7FA', marginBottom: Spacing.md },
  newsletterInputRow: { flexDirection: 'row', gap: Spacing.sm },
  newsletterInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm },
  newsletterInput: { flex: 1, paddingVertical: 10, fontSize: FontSizes.xs, color: '#fff' },
  subscribeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF0000', paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, justifyContent: 'center' },
  subscribeButtonText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
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
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  paymentLabel: { fontSize: FontSizes.xs, color: '#6B7280', marginRight: 2 },
  paymentPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  paymentText: { fontSize: 9, color: '#D1D5DB', fontWeight: '600' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  legalText: { fontSize: 11, color: '#6B7280' },
  copyright: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
});