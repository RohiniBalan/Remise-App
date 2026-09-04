import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, MapPin, Shield, CreditCard, Truck, Mail, Send } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// lucide-react-native 1.0 dropped all brand/logo icons (Twitter, Instagram,
// Facebook, Youtube, etc.), so the social icons below are small inline SVGs
// built on react-native-svg (already a dependency of lucide-react-native) —
// no extra icon package needed.
const TwitterXIcon = ({ size = 15, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Svg>
);

const InstagramIcon = ({ size = 15, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Path d="M17.5 6.5h.01" />
  </Svg>
);

const FacebookIcon = ({ size = 15, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </Svg>
);

const YoutubeIcon = ({ size = 15, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <Path d="m10 15 5-3-5-3z" fill={color} />
  </Svg>
);

// Compact mobile counterpart of client/app/components-sections/Footer.tsx.
// Web's link columns (Company/Support/Shop) mostly point at '#' (no real
// page behind them even on web), so those are kept as static text here
// rather than fake-navigating; the handful of web footer links that DO have
// a real destination (About Us, Our Services, Help Center, Nearby Offers,
// My Orders) are wired to the matching registered screens. The legal links
// (Privacy Policy, Terms of Use, Sitemap) are also wired to their screens
// in screens/customer/. Social icons are decorative (no real destination).

const QUICK_LINKS = [
  { label: 'New Arrivals', route: 'NewArrivals' },
  { label: 'Best Sellers', route: 'BestSellers' },
  { label: 'About Us', route: 'About' },
  { label: 'Our Services', route: 'Services' },
  { label: 'Help Center', route: 'HelpCenter' },
  { label: 'Nearby Offers', route: 'Nearby' },
  { label: 'My Orders', route: 'Orders' },
];

const PAYMENT_ICONS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', route: 'PrivacyPolicy' },
  { label: 'Terms of Use', route: 'TermsOfUse' },
  { label: 'Sitemap', route: 'Sitemap' },
];

const SOCIAL_ICONS = [
  { key: 'X', Icon: TwitterXIcon },
  { key: 'IG', Icon: InstagramIcon },
  { key: 'FB', Icon: FacebookIcon },
  { key: 'YT', Icon: YoutubeIcon },
];

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

        <Text style={styles.companyName}>PORULON TECHNOLOGIES PRIVATE LIMITED</Text>

        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+919047099277')}>
          <Phone size={13} color={GoldColors.gold} />
          <Text style={styles.contactText}>+91 90470 99277</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:porulontechnologies@gmail.com')}>
          <Mail size={13} color={GoldColors.gold} />
          <Text style={styles.contactText}>porulontechnologies@gmail.com</Text>
        </TouchableOpacity>
        <View style={styles.contactRow}>
          <MapPin size={13} color={GoldColors.gold} />
          <Text style={styles.contactText}>Coimbatore, Tamil Nadu, India</Text>
        </View>

        <View style={styles.socialRow}>
          {SOCIAL_ICONS.map(({ key, Icon }) => (
            <View key={key} style={styles.socialIcon}>
              <Icon size={15} color="#9CA3AF" />
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
          {LEGAL_LINKS.map(link => (
            <TouchableOpacity key={link.label} onPress={() => navigation.navigate(link.route)}>
              <Text style={styles.legalText}>{link.label}</Text>
            </TouchableOpacity>
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
  companyName: { fontSize: FontSizes.xs, fontWeight: '800', color: '#fff', marginBottom: 6 },
});