import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Search,
  MapPin,
  Scale,
  ShoppingBag,
  Store,
  Package,
  IndianRupee,
  BarChart3,
  Users,
  Truck,
  CheckCircle2,
  Smartphone,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  FileText,
  Lock,
  ClipboardList,
  Building2,
  Headphones,
  Compass,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const BRAND_RED = CustomerColors.primary;

const WHAT_IS_REMISE = [
  { icon: Search, title: 'Discover', desc: 'Find products and businesses around you.' },
  { icon: Scale, title: 'Compare', desc: 'Compare available options before choosing where to buy.' },
  { icon: ShoppingBag, title: 'Shop', desc: 'Select a store and complete your purchase conveniently.' },
];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Search or Scan', desc: 'Search for products manually or use available scanning and voice features to find what you need.' },
  { icon: MapPin, title: 'Find Nearby Stores', desc: "Discover businesses that have the products you're looking for within your selected area." },
  { icon: Scale, title: 'Compare Options', desc: 'Compare product availability and total pricing across participating stores.' },
  { icon: Store, title: 'Choose Your Store', desc: 'Select the store that best matches your requirements.' },
  { icon: Truck, title: 'Pickup or Delivery', desc: 'Choose the available fulfillment option that works best for you.' },
  { icon: CheckCircle2, title: 'Complete Your Order', desc: 'Place your order using the available payment options.' },
];

const WHY_REMISE = [
  { icon: MapPin, title: 'Nearby Choices', desc: 'Discover businesses around you.' },
  { icon: IndianRupee, title: 'Compare Prices', desc: 'Compare available options before you decide.' },
  { icon: Search, title: 'Easy Discovery', desc: 'Find products using simple search and smart features.' },
  { icon: ShoppingCart, title: 'Convenient Shopping', desc: 'Choose pickup or delivery based on availability.' },
  { icon: Store, title: 'Support Local Businesses', desc: 'Every order helps a nearby business grow.' },
  { icon: Smartphone, title: 'Simple Digital Experience', desc: 'A clean, straightforward way to shop and manage orders.' },
];

const CUSTOMER_BENEFITS = [
  'Discover products available around them',
  'Search for products easily',
  'Use voice-based product search where available',
  'Scan products or product lists where supported',
  'Compare products and prices across nearby stores',
  'Choose a preferred store',
  'Select pickup or home delivery when available',
  'Manage and track orders',
  'Shop from local businesses through a single platform',
];

const BUSINESS_STEPS = [
  { icon: Store, label: 'Create Your Store' },
  { icon: Package, label: 'Add & Manage Products' },
  { icon: IndianRupee, label: 'Manage Pricing' },
  { icon: BarChart3, label: 'Manage Inventory' },
  { icon: ShoppingBag, label: 'Receive Orders' },
  { icon: Users, label: 'Reach More Customers' },
];

const TRUST_POINTS = [
  { icon: FileText, label: 'Clear Product Information' },
  { icon: IndianRupee, label: 'Transparent Pricing' },
  { icon: Lock, label: 'Secure Account Management' },
  { icon: ClipboardList, label: 'Reliable Order Information' },
  { icon: Building2, label: 'Business Accountability' },
  { icon: Headphones, label: 'Customer Support' },
];

const MISSION_POINTS = [
  'Simplify product discovery',
  'Make local shopping more convenient',
  'Give customers better visibility into their options',
  'Help businesses establish a digital presence',
  'Support meaningful connections between local businesses and customers',
  'Build a reliable and easy-to-use shopping experience',
];

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionHeadingBar} />
      <Text style={styles.sectionHeadingText}>{title}</Text>
    </View>
  );
}

function CTAButton({ label, onPress, filled = true }: { label: string; onPress: () => void; filled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.ctaButton, filled ? styles.ctaButtonFilled : styles.ctaButtonOutline]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={filled ? styles.ctaButtonTextFilled : styles.ctaButtonTextOutline}>{label}</Text>
      <ArrowRight size={16} color={filled ? '#ffffff' : BRAND_RED} />
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/*  ABOUT SCREEN                                                       */
/* ------------------------------------------------------------------ */

export default function AboutScreen({ navigation }: any) {
  const goTo = (route: string, params?: any) => {
    if (!navigation?.navigate) return;
    if (route === 'Home') {
      navigation.navigate('CustomerTabs', { screen: 'Home' });
    } else if (route === 'Categories' || route === 'CategoryAll') {
      navigation.navigate('CustomerTabs', { screen: 'Categories' });
    } else if (route === 'LoginRegister' || route === 'Signup') {
      navigation.navigate('LoginRegister');
    } else {
      navigation.navigate(route, params);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <Compass size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>About Remise</Text>
        </View>
        <Text style={styles.heroTitle}>
          Making local shopping <Text style={styles.heroTitleAccent}>smarter, simpler, and closer to home</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Remise connects customers with nearby stores and businesses, making it easier to discover
          products, compare prices, choose the right store, and shop with confidence.
        </Text>
        <CTAButton label="Explore Products" onPress={() => goTo('Categories')} />
      </View>

      {/* OUR STORY */}
      <View style={styles.card}>
        <SectionHeading title="Our Story" />
        <Text style={styles.bodyText}>
          Shopping for everyday products can sometimes be difficult. Customers may need to search
          across different stores, compare prices manually, and spend time finding the products they
          need.
        </Text>
        <Text style={styles.bodyText}>
          Remise was created to make this process simpler — bringing customers and local businesses
          together on one convenient platform, so customers can discover what's available around them
          while businesses get a digital way to showcase their products and reach more people.
        </Text>
        <Text style={styles.italicHighlight}>
          Find what you need. Compare your options. Choose where to shop.
        </Text>
      </View>

      {/* WHAT IS REMISE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleCentered}>What is Remise?</Text>
        <Text style={styles.sectionSubtitleCentered}>
          A local commerce and product discovery platform designed to connect customers with nearby
          businesses — and give store owners, wholesalers, and home businesses a place to reach them.
        </Text>
        <View style={styles.grid}>
          {WHAT_IS_REMISE.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.iconCard}>
                <View style={styles.iconCircle}>
                  <Icon size={22} color={BRAND_RED} />
                </View>
                <Text style={styles.iconCardTitle}>{item.title}</Text>
                <Text style={styles.iconCardDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* HOW REMISE WORKS */}
      <View style={styles.section}>
        <SectionHeading title="How Remise Works" />
        {HOW_IT_WORKS.map((step, i) => {
          const Icon = step.icon;
          return (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stepTitleRow}>
                  <Icon size={14} color={BRAND_RED} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* WHY CHOOSE REMISE */}
      <View style={styles.section}>
        <SectionHeading title="Why Choose Remise?" />
        <View style={styles.grid}>
          {WHY_REMISE.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.whyCard}>
                <View style={styles.iconCircleSm}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.iconCardTitle}>{item.title}</Text>
                <Text style={styles.iconCardDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FOR CUSTOMERS */}
      <View style={styles.card}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <ShoppingCart size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>For Customers</Text>
        </View>
        <Text style={styles.subheading}>A Better Way to Shop Locally</Text>
        {CUSTOMER_BENEFITS.map((b, i) => (
          <View key={i} style={styles.checkRow}>
            <CheckCircle2 size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={styles.checkText}>{b}</Text>
          </View>
        ))}
        <CTAButton label="Start Shopping" onPress={() => goTo('Home')} />
      </View>

      {/* FOR BUSINESSES */}
      <View style={styles.section}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <Building2 size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>For Businesses</Text>
        </View>
        <Text style={styles.subheading}>Helping Local Businesses Grow</Text>
        <Text style={styles.sectionSubtitleCentered}>
          Whether you're a store owner, wholesaler, or home business, Remise gives you a digital
          platform to showcase your products and connect with customers in your area.
        </Text>
        <View style={styles.gridThree}>
          {BUSINESS_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <View key={i} style={styles.miniCard}>
                <View style={styles.iconCircleSm}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.miniCardLabel}>{step.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ marginTop: Spacing.xs, marginBottom: Spacing.xs }}>
          <CTAButton label="Join Remise" onPress={() => goTo('StoreRegister')} />
        </View>
      </View>

      {/* VISION */}
      <View style={[styles.card, { marginTop: Spacing.sm }]}>
        <Text style={styles.subheading}>Our Vision</Text>
        <Text style={styles.italicHighlight}>
          To make local commerce more accessible, transparent, and convenient for everyone.
        </Text>
        <Text style={styles.bodyText}>
          We envision a shopping experience where customers can easily discover what's available
          around them, make informed purchasing decisions, and connect with businesses without
          unnecessary complexity.
        </Text>
      </View>

      {/* MISSION */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Our Mission</Text>
        <Text style={styles.bodyText}>
          Our mission is to build a digital platform that brings customers and local businesses
          closer together. We aim to:
        </Text>
        {MISSION_POINTS.map((m, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.checkText}>{m}</Text>
          </View>
        ))}
      </View>

      {/* TRUST & TRANSPARENCY */}
      <View style={styles.section}>
        <SectionHeading title="Built Around Trust" />
        <View style={styles.card}>
          {TRUST_POINTS.map((t, i) => {
            const Icon = t.icon;
            return (
              <View key={i} style={styles.trustRow}>
                <View style={styles.iconCircleSm}>
                  <Icon size={16} color={BRAND_RED} />
                </View>
                <Text style={styles.trustLabel}>{t.label}</Text>
              </View>
            );
          })}
          <View style={styles.trustDivider} />
          <View style={styles.trustQuoteRow}>
            <ShieldCheck size={18} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={styles.trustQuoteText}>
              We believe a good shopping experience starts with clear information and transparent
              interactions. Remise is designed to give customers and businesses the information they
              need to make better decisions.
            </Text>
          </View>
        </View>
      </View>

      {/* CLOSING CTA */}
      <View style={styles.closingCta}>
        <Text style={styles.closingCtaTitle}>Ready to discover what's around you?</Text>
        <Text style={styles.closingCtaSubtitle}>Find products. Compare options. Shop local.</Text>
        <View style={styles.closingCtaButtons}>
          <CTAButton label="Start Shopping" onPress={() => goTo('Home')} />
          <View style={{ height: Spacing.sm }} />
          <CTAButton label="Join Remise" onPress={() => goTo('LoginRegister')} filled={false} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  hero: {
    backgroundColor: '#ffffff',
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.lg,
    ...Shadows.card,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  eyebrowIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  eyebrowText: { fontSize: 11, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: { fontSize: FontSizes.xl ?? 24, fontWeight: '900', color: '#0f172a', lineHeight: 32, marginBottom: Spacing.sm },
  heroTitleAccent: { color: BRAND_RED },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#64748b', lineHeight: 22, marginBottom: Spacing.lg },

  card: {
    backgroundColor: '#ffffff',
    margin: Spacing.md,
    marginTop: 0,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.lg,
    ...Shadows.card,
  },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },

  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionHeadingBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: BRAND_RED },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 1 },

  sectionTitleCentered: { fontSize: FontSizes.lg, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: Spacing.xs },
  sectionSubtitleCentered: { fontSize: FontSizes.sm, color: '#64748b', textAlign: 'center', marginBottom: Spacing.md, lineHeight: 20 },
  subheading: { fontSize: FontSizes.lg, fontWeight: '800', color: '#0f172a', marginBottom: Spacing.md },

  bodyText: { fontSize: FontSizes.sm, color: '#475569', lineHeight: 22, marginBottom: Spacing.sm },
  italicHighlight: { fontSize: FontSizes.base, fontWeight: '700', fontStyle: 'italic', color: BRAND_RED, marginVertical: Spacing.sm },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  gridThree: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },

  iconCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    ...Shadows.card,
  },
  whyCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  miniCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    ...Shadows.card,
  },

  iconCircle: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  iconCircleSm: { width: 34, height: 34, borderRadius: BorderRadius.sm, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },

  iconCardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  iconCardDesc: { fontSize: FontSizes.xs, color: '#64748b', textAlign: 'center', lineHeight: 16 },
  miniCardLabel: { fontSize: 11, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginTop: 4 },

  stepRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  stepNumber: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: '800', color: BRAND_RED },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  stepTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#0f172a' },
  stepDesc: { fontSize: FontSizes.xs, color: '#64748b', lineHeight: 18 },

  checkRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  checkText: { flex: 1, fontSize: FontSizes.sm, color: '#334155', lineHeight: 20 },

  bulletRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.xs },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND_RED, marginTop: 7 },

  trustRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  trustLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: '#0f172a' },
  trustDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: Spacing.md },
  trustQuoteRow: { flexDirection: 'row', gap: Spacing.sm },
  trustQuoteText: { flex: 1, fontSize: FontSizes.sm, fontStyle: 'italic', color: '#475569', lineHeight: 20 },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
  },
  ctaButtonFilled: { backgroundColor: BRAND_RED, ...Shadows.card },
  ctaButtonOutline: { borderWidth: 1.5, borderColor: BRAND_RED, backgroundColor: '#ffffff' },
  ctaButtonTextFilled: { fontSize: FontSizes.sm, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 },
  ctaButtonTextOutline: { fontSize: FontSizes.sm, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },

  closingCta: {
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.card,
  },
  closingCtaTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: Spacing.xs },
  closingCtaSubtitle: { fontSize: FontSizes.sm, color: '#64748b', textAlign: 'center', marginBottom: Spacing.lg },
  closingCtaButtons: { width: '100%', alignItems: 'center' },
});