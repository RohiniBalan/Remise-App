import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Ellipse,
  Rect,
  Path,
} from 'react-native-svg';
import {
  RotateCcw,
  PackageSearch,
  Ban,
  ClipboardList,
  Wallet,
  Banknote,
  XCircle,
  AlertTriangle,
  Building2,
  Headphones,
  Mail,
  ArrowRight,
  CheckCircle2,
  Snowflake,
  Droplets,
  PackageOpen,
  Wrench,
  Tag,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const BRAND_RED = CustomerColors.primary;
const LAST_UPDATED = '1 September 2026';

const CATEGORIES = [
  { id: 'about', label: 'About Returns', icon: PackageSearch },
  { id: 'eligible', label: 'Eligible Reasons', icon: CheckCircle2 },
  { id: 'non-returnable', label: 'Non-Returnable', icon: Ban },
  { id: 'how-to', label: 'Request Return', icon: ClipboardList },
  { id: 'refunds', label: 'Refunds', icon: Wallet },
  { id: 'cash', label: 'Cash Payments', icon: Banknote },
  { id: 'cancellation', label: 'Cancellation', icon: XCircle },
  { id: 'damaged', label: 'Damaged Items', icon: AlertTriangle },
  { id: 'sellers', label: 'Seller Role', icon: Building2 },
  { id: 'contact', label: 'Contact Us', icon: Headphones },
];

const RETURN_DEPENDENCIES = [
  'Product type',
  'Product condition',
  "Seller's return policy",
  'Reason for return',
  'Time since delivery/pickup',
  'Applicable laws and regulations',
];

const ELIGIBLE_REASONS = [
  'The product is damaged.',
  'The wrong product was delivered.',
  'The product is defective.',
  'The product is significantly different from description.',
  'Items are missing from the order.',
  "Eligible under the seller's return policy.",
];

const NON_RETURNABLE = [
  { title: 'Perishable products', icon: Snowflake },
  { title: 'Personal-care & hygiene', icon: Droplets },
  { title: 'Opened/unsealed products', icon: PackageOpen },
  { title: 'Customized products', icon: Wrench },
  { title: 'Marked non-returnable', icon: Tag },
];

const RETURN_STEPS = [
  { title: 'Open My Orders', detail: 'Go to the My Orders section of your account.' },
  { title: 'Select the relevant order', detail: "Find the order you'd like to return or replace." },
  { title: 'Select Return/Replace', detail: "Choose this option if it's available for the order." },
  { title: 'Select the reason', detail: 'Pick the reason that best matches your situation.' },
  { title: 'Provide details', detail: 'Add any requested information or images.' },
  { title: 'Submit the request', detail: 'The seller or Remise support will review and approve.' },
];

const REFUND_FACTORS = [
  'Payment method',
  'Order status',
  'Seller approval',
  'Return status',
  'Applicable fees',
];

const CANCELLATION_SOURCES = [
  {
    title: 'By the customer',
    desc: "Subject to the order's current status and seller processing.",
    icon: ClipboardList,
  },
  {
    title: 'By the seller',
    desc: 'Due to product availability, stock changes, or operational reasons.',
    icon: Building2,
  },
  {
    title: 'By Remise',
    desc: 'Where necessary to protect users or resolve platform issues.',
    icon: ShieldAlert,
  },
];

const SELLER_RESPONSIBILITIES =
  'Store Owners, Wholesalers, and Home Businesses are responsible for fulfilling orders accurately and complying with applicable return, refund, consumer-protection, and product regulations.';

function HeroIllustration() {
  return (
    <View style={styles.illustrationWrap}>
      <Svg width="100%" height={180} viewBox="0 0 480 360">
        <Defs>
          <SvgLinearGradient id="rf-red" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF0000" />
            <Stop offset="100%" stopColor="#b30000" />
          </SvgLinearGradient>
        </Defs>

        <Ellipse cx={240} cy={300} rx={190} ry={16} fill="#ffffff" opacity={0.06} />

        {/* Store */}
        <Rect x={270} y={150} width={150} height={110} rx={8} fill="url(#rf-red)" />
        <Rect x={270} y={150} width={150} height={26} rx={8} fill="#FF0000" />
        <Rect x={300} y={196} width={34} height={34} rx={4} fill="#ffffff" opacity={0.9} />
        <Rect x={356} y={196} width={34} height={34} rx={4} fill="#ffffff" opacity={0.9} />
        <Rect x={328} y={240} width={34} height={20} rx={2} fill="#0f172a" opacity={0.4} />

        {/* Parcel */}
        <Rect x={60} y={190} width={86} height={70} rx={8} fill="#ffffff" opacity={0.9} />
        <Path d="M60 212 L146 212" stroke="#FF0000" strokeWidth={6} />
        <Path d="M103 190 L103 260" stroke="#FF0000" strokeWidth={6} />

        {/* Return curve */}
        <Path
          d="M 260 140 C 210 90, 130 90, 90 150"
          stroke="#FF6B6B"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="8 10"
        />
        <Path d="M90 150 L78 140 L94 134 Z" fill="#FF6B6B" />
      </Svg>
    </View>
  );
}

export default function ReturnsRefundsScreen({ navigation }: any) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const registerOffset = (id: string) => (e: any) => {
    sectionOffsets.current[id] = e.nativeEvent.layout.y;
  };

  const scrollTo = (id: string) => {
    const y = sectionOffsets.current[id];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(y - 12, 0), animated: true });
    }
  };

  return (
    <View style={styles.container}>
      {/* STICKY CATEGORY CHIPS */}
      <View style={styles.chipNav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipNavContent}
        >
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.chip}
                onPress={() => scrollTo(cat.id)}
                activeOpacity={0.75}
              >
                <Icon size={13} color={BRAND_RED} />
                <Text style={styles.chipText}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <RotateCcw size={13} color={BRAND_RED} />
            <Text style={styles.badgeText}>Returns & Refunds</Text>
          </View>
          <Text style={styles.heroTitle}>Returns & Refund Policy</Text>
          <Text style={styles.heroSubtitle}>
            How returns, cancellations, replacements, and refunds work on Remise — for every order,
            store, and payment method.
          </Text>
          <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

          <HeroIllustration />
        </View>

        {/* 1. ABOUT RETURNS */}
        <View style={styles.section} onLayout={registerOffset('about')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <PackageSearch size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>About Returns</Text>
          </View>
          <Text style={styles.prose}>
            Return and replacement availability may depend on:
          </Text>
          <View style={styles.chipsGrid}>
            {RETURN_DEPENDENCIES.map(d => (
              <View key={d} style={styles.depChip}>
                <CheckCircle2 size={14} color={BRAND_RED} />
                <Text style={styles.depChipText}>{d}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.noteText}>
            Certain products may not be eligible for return due to hygiene, safety, perishability, or
            other restrictions.
          </Text>
        </View>

        {/* 2. ELIGIBLE REASONS */}
        <View style={styles.section} onLayout={registerOffset('eligible')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <CheckCircle2 size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Eligible Return Reasons</Text>
          </View>
          <Text style={styles.prose}>
            Depending on the product and seller policy, a return or replacement may be considered
            when:
          </Text>
          <View style={styles.card}>
            {ELIGIBLE_REASONS.map((r, i) => (
              <View key={i} style={styles.checkRow}>
                <CheckCircle2 size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
                <Text style={styles.checkText}>{r}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.noteText}>
            Products should generally be returned in their original condition and packaging where
            applicable.
          </Text>
        </View>

        {/* 3. NON-RETURNABLE */}
        <View style={styles.section} onLayout={registerOffset('non-returnable')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <Ban size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Non-Returnable Products</Text>
          </View>
          <Text style={styles.prose}>
            Some products may not be eligible for return, including certain:
          </Text>
          <View style={styles.gridTwo}>
            {NON_RETURNABLE.map(item => {
              const Icon = item.icon;
              return (
                <View key={item.title} style={styles.nonReturnCard}>
                  <View style={styles.nonReturnIconCircle}>
                    <Icon size={18} color={BRAND_RED} />
                  </View>
                  <Text style={styles.nonReturnTitle}>{item.title}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.noteText}>
            The applicable return conditions may be displayed on the product page before purchase.
          </Text>
        </View>

        {/* 4. HOW TO REQUEST A RETURN */}
        <View style={styles.section} onLayout={registerOffset('how-to')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <ClipboardList size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>How to Request a Return</Text>
          </View>
          <Text style={styles.prose}>If your order is eligible:</Text>
          <View style={styles.stepsList}>
            {RETURN_STEPS.map((step, i) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.noteText}>
            The seller or Remise support team may review the request before approving it.
          </Text>
        </View>

        {/* 5. REFUNDS */}
        <View style={styles.section} onLayout={registerOffset('refunds')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <Wallet size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Refunds</Text>
          </View>
          <Text style={styles.prose}>
            If a refund is approved, the refund amount and method may depend on:
          </Text>
          <View style={styles.chipsGrid}>
            {REFUND_FACTORS.map(f => (
              <View key={f} style={styles.depChip}>
                <CheckCircle2 size={14} color={BRAND_RED} />
                <Text style={styles.depChipText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.calloutCard}>
            <Wallet size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={styles.calloutText}>
              For online payments, approved refunds will generally be processed through the
              applicable payment method or payment gateway.
            </Text>
          </View>
        </View>

        {/* 6. CASH PAYMENTS */}
        <View style={styles.section} onLayout={registerOffset('cash')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <Banknote size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Cash Payments</Text>
          </View>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
              <View style={styles.nonReturnIconCircle}>
                <Banknote size={18} color={BRAND_RED} />
              </View>
              <Text style={styles.proseFlex}>
                For orders paid in cash, refund arrangements may differ from online payments. Remise
                or the applicable seller will provide instructions for the approved refund.
              </Text>
            </View>
          </View>
        </View>

        {/* 7. ORDER CANCELLATION */}
        <View style={styles.section} onLayout={registerOffset('cancellation')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <XCircle size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Order Cancellation</Text>
          </View>
          <Text style={styles.prose}>An order may be cancelled:</Text>
          <View style={{ gap: Spacing.sm }}>
            {CANCELLATION_SOURCES.map(src => {
              const Icon = src.icon;
              return (
                <View key={src.title} style={styles.cancelCard}>
                  <View style={styles.nonReturnIconCircle}>
                    <Icon size={18} color={BRAND_RED} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cancelTitle}>{src.title}</Text>
                    <Text style={styles.cancelDesc}>{src.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={styles.noteText}>
            If payment has already been made, eligible refunds will be processed according to this
            policy.
          </Text>
        </View>

        {/* 8. DAMAGED OR INCORRECT PRODUCTS */}
        <View style={styles.section} onLayout={registerOffset('damaged')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <AlertTriangle size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Damaged or Incorrect Products</Text>
          </View>
          <View style={styles.calloutCard}>
            <AlertTriangle size={18} color={BRAND_RED} style={{ marginTop: 2 }} />
            <Text style={styles.calloutText}>
              If you receive a damaged or incorrect product, report it as soon as possible after
              receiving the order. Keep the product, packaging, and relevant proof until the issue
              has been resolved.
            </Text>
          </View>
        </View>

        {/* 9. SELLER RESPONSIBILITY */}
        <View style={styles.section} onLayout={registerOffset('sellers')}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingIcon}>
              <Building2 size={18} color={BRAND_RED} />
            </View>
            <Text style={styles.sectionHeadingText}>Seller Responsibility</Text>
          </View>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
              <View style={styles.nonReturnIconCircle}>
                <Building2 size={18} color={BRAND_RED} />
              </View>
              <Text style={styles.proseFlex}>{SELLER_RESPONSIBILITIES}</Text>
            </View>
          </View>
        </View>

        {/* 10. CONTACT CTA */}
        <View style={styles.section} onLayout={registerOffset('contact')}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaBadge}>
              <Headphones size={12} color="#FFFFFF" />
              <Text style={styles.ctaBadgeText}>Questions about a return or refund?</Text>
            </View>
            <Text style={styles.ctaTitle}>
              Contact Remise support through the app and we'll take it from there.
            </Text>
            <Text style={styles.ctaSubtitle}>
              Reach us through the Help Center or Customer Services — include your order ID whenever
              possible.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('HelpCenter')}
              activeOpacity={0.85}
            >
              <Mail size={16} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>Get in touch</Text>
              <ArrowRight size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flex: 1 },

  chipNav: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#0A0A0A',
  },
  chipNavContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginRight: Spacing.sm,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB' },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.35)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND_RED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: FontSizes.xl ?? 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20 },
  lastUpdated: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: Spacing.xs },
  illustrationWrap: { marginTop: Spacing.md, alignItems: 'center' },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeadingText: { fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF' },

  prose: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20, marginBottom: Spacing.sm },
  proseFlex: { flex: 1, fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20 },
  noteText: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: Spacing.xs, lineHeight: 17 },

  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  depChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  depChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: '#D1D5DB' },

  card: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  checkText: { flex: 1, fontSize: FontSizes.sm, color: '#D1D5DB', lineHeight: 20 },

  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  nonReturnCard: {
    width: '48%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nonReturnIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  nonReturnTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },

  stepsList: { gap: Spacing.sm },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  stepTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  stepDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 17 },

  calloutCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    backgroundColor: 'rgba(255,0,0,0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  calloutText: { flex: 1, fontSize: FontSizes.xs, color: '#E5E7EB', lineHeight: 18 },

  cancelCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  cancelTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  cancelDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 17 },

  ctaCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.4)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND_RED,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  ctaBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  ctaTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  ctaSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', marginBottom: Spacing.lg, lineHeight: 19 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: BRAND_RED,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
  },
  ctaButtonText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF' },
});
