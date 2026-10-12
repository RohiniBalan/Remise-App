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
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getAboutData } from '../../i18n/aboutTranslations';

const BRAND_RED = CustomerColors.primary;

const WHAT_IS_ICONS = [Search, Scale, ShoppingBag];
const HOW_IT_WORKS_ICONS = [Search, MapPin, Scale, Store, Truck, CheckCircle2];
const WHY_REMISE_ICONS = [MapPin, IndianRupee, Search, ShoppingCart, Store, Smartphone];
const BUSINESS_ICONS = [Store, Package, IndianRupee, BarChart3, ShoppingBag, Users];
const TRUST_ICONS = [FileText, IndianRupee, Lock, ClipboardList, Building2, Headphones];


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

function CTAButton({
  label,
  onPress,
  filled = true,
  centered = false,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  centered?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.ctaButton,
        filled ? styles.ctaButtonFilled : styles.ctaButtonOutline,
        centered && styles.ctaButtonCentered,
      ]}
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
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const data = getAboutData(language as any);

  React.useEffect(() => {
    navigation?.setOptions?.({
      title: data.eyebrow || 'About Us',
    });
  }, [navigation, data.eyebrow]);

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

  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1F2937' : '#e2e8f0';
  const textPri = isDark ? '#F9FAFB' : '#0f172a';
  const textSec = isDark ? '#9CA3AF' : '#64748b';
  const iconBg = isDark ? 'rgba(255, 0, 0, 0.15)' : '#fef2f2';

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }]} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO */}
      <View style={[styles.hero, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowIcon, { backgroundColor: iconBg }]}>
            <Compass size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>{data.eyebrow}</Text>
        </View>
        <Text style={[styles.heroTitle, { color: textPri }]}>
          {data.heroTitlePart1}{' '}
          <Text style={{ color: BRAND_RED }}>{data.heroTitleHighlight}</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: textSec }]}>
          {data.heroSubtitle}
        </Text>
        <CTAButton label={data.exploreProductsBtn} onPress={() => goTo('Categories')} />
      </View>

      {/* OUR STORY */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <SectionHeading title={data.storyTitle} />
        <Text style={[styles.bodyText, { color: textSec }]}>
          {data.storyP1}
        </Text>
        <Text style={[styles.bodyText, { color: textSec }]}>
          {data.storyP2}
        </Text>
        <Text style={styles.italicHighlight}>
          {data.storyQuote}
        </Text>
      </View>

      {/* WHAT IS REMISE */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitleCentered, { color: textPri }]}>{data.whatIsTitle}</Text>
        <Text style={[styles.sectionSubtitleCentered, { color: textSec }]}>
          {data.whatIsSubtitle}
        </Text>
        <View style={styles.grid}>
          {(data.whatIsItems || WHAT_IS_REMISE).map((item, i) => {
            const Icon = WHAT_IS_ICONS[i % WHAT_IS_ICONS.length] || Search;
            return (
              <View key={i} style={[styles.iconCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                  <Icon size={22} color={BRAND_RED} />
                </View>
                <Text style={[styles.iconCardTitle, { color: textPri }]}>{item.title}</Text>
                <Text style={[styles.iconCardDesc, { color: textSec }]}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* HOW REMISE WORKS */}
      <View style={styles.section}>
        <SectionHeading title={data.howItWorksTitle} />
        {(data.howItWorksSteps || HOW_IT_WORKS).map((step, i) => {
          const Icon = HOW_IT_WORKS_ICONS[i % HOW_IT_WORKS_ICONS.length] || Search;
          return (
            <View key={i} style={[styles.stepRow, { backgroundColor: cardBg, borderColor }]}>
              <View style={[styles.stepNumber, { backgroundColor: iconBg }]}>
                <Text style={styles.stepNumberText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stepTitleRow}>
                  <Icon size={14} color={BRAND_RED} />
                  <Text style={[styles.stepTitle, { color: textPri }]}>{step.title}</Text>
                </View>
                <Text style={[styles.stepDesc, { color: textSec }]}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* WHY CHOOSE REMISE */}
      <View style={styles.section}>
        <SectionHeading title={data.whyRemiseTitle} />
        <View style={styles.grid}>
          {(data.whyRemiseItems || WHY_REMISE).map((item, i) => {
            const Icon = WHY_REMISE_ICONS[i % WHY_REMISE_ICONS.length] || MapPin;
            return (
              <View key={i} style={[styles.whyCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.iconCircleSm, { backgroundColor: iconBg }]}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={[styles.iconCardTitle, { color: textPri }]}>{item.title}</Text>
                <Text style={[styles.iconCardDesc, { color: textSec }]}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FOR CUSTOMERS */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowIcon, { backgroundColor: iconBg }]}>
            <ShoppingCart size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>{data.forCustomersEyebrow}</Text>
        </View>
        <Text style={[styles.subheading, { color: textPri }]}>{data.forCustomersTitle}</Text>
        {(data.customerBenefits || CUSTOMER_BENEFITS).map((b, i) => (
          <View key={i} style={styles.checkRow}>
            <CheckCircle2 size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={[styles.checkText, { color: textPri }]}>{b}</Text>
          </View>
        ))}
        <CTAButton label={data.startShoppingBtn} onPress={() => goTo('Home')} />
      </View>

      {/* FOR BUSINESSES */}
      <View style={styles.section}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowIcon, { backgroundColor: iconBg }]}>
            <Building2 size={16} color={BRAND_RED} />
          </View>
          <Text style={styles.eyebrowText}>{data.forBusinessesEyebrow}</Text>
        </View>
        <Text style={[styles.subheading, { color: textPri }]}>{data.forBusinessesTitle}</Text>
        <Text style={[styles.sectionSubtitleCentered, { color: textSec }]}>
          {data.forBusinessesSubtitle}
        </Text>
        <View style={styles.gridThree}>
          {(data.businessSteps || BUSINESS_STEPS.map(s => s.label)).map((label, i) => {
            const Icon = BUSINESS_ICONS[i % BUSINESS_ICONS.length] || Store;
            return (
              <View key={i} style={[styles.miniCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.iconCircleSm, { backgroundColor: iconBg }]}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={[styles.miniCardLabel, { color: textPri }]}>{label}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ marginTop: Spacing.xs, marginBottom: Spacing.xs }}>
          <CTAButton label={data.joinRemiseBtn} onPress={() => goTo('StoreRegister')} />
        </View>
      </View>

      {/* VISION */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: Spacing.sm }]}>
        <Text style={[styles.subheading, { color: textPri }]}>{data.visionTitle}</Text>
        <Text style={styles.italicHighlight}>
          {data.visionQuote}
        </Text>
        <Text style={[styles.bodyText, { color: textSec }]}>
          {data.visionDesc}
        </Text>
      </View>

      {/* MISSION */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.subheading, { color: textPri }]}>{data.missionTitle}</Text>
        <Text style={[styles.bodyText, { color: textSec }]}>
          {data.missionIntro}
        </Text>
        {(data.missionPoints || MISSION_POINTS).map((m, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={[styles.checkText, { color: textPri }]}>{m}</Text>
          </View>
        ))}
      </View>

      {/* TRUST & TRANSPARENCY */}
      <View style={styles.section}>
        <SectionHeading title={data.trustTitle} />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor, margin: 0 }]}>
          {(data.trustPoints || TRUST_POINTS.map(t => t.label)).map((label, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length] || FileText;
            return (
              <View key={i} style={styles.trustRow}>
                <View style={[styles.iconCircleSm, { backgroundColor: iconBg }]}>
                  <Icon size={16} color={BRAND_RED} />
                </View>
                <Text style={[styles.trustLabel, { color: textPri }]}>{label}</Text>
              </View>
            );
          })}
          <View style={[styles.trustDivider, { backgroundColor: borderColor }]} />
          <View style={styles.trustQuoteRow}>
            <ShieldCheck size={18} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={[styles.trustQuoteText, { color: textSec }]}>
              {data.trustQuote}
            </Text>
          </View>
        </View>
      </View>

      {/* CLOSING CTA */}
      <View style={[styles.closingCta, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.closingCtaTitle, { color: textPri }]}>{data.ctaTitle}</Text>
        <Text style={[styles.closingCtaSubtitle, { color: textSec }]}>{data.ctaSubtitle}</Text>
        <View style={styles.closingCtaButtons}>
          <CTAButton label={data.startShoppingBtn} onPress={() => goTo('Home')} centered />
          <View style={{ height: Spacing.sm }} />
          <CTAButton label={data.joinRemiseBtn} onPress={() => goTo('LoginRegister')} filled={false} centered />
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
  heroTitle: { fontSize: FontSizes.xl ?? 24, fontWeight: '900', color: '#0f172a', lineHeight: 36, paddingTop: 4, marginBottom: Spacing.sm },
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
  ctaButtonCentered: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 280,
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