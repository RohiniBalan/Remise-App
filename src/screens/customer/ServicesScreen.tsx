import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronDown,
  Truck,
  RotateCcw,
  CreditCard,
  Shield,
  Building2,
  Users,
  Headphones,
  ArrowRight,
} from 'lucide-react-native';
import ContactModal from '../../components/common/ContactModal';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/services/page.tsx -> CustomerSupportPage.
// The public Services/Support route uses the website's brand red palette (#FF0000).

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAND = CustomerColors.primary;

const SUPPORT_CATEGORIES = [
  { icon: Truck, title: 'Orders & Shipping', desc: 'Track your order, check delivery timelines, and see coverage areas.' },
  { icon: RotateCcw, title: 'Returns & Refunds', desc: 'Learn how exchanges, returns, and refunds work.' },
  { icon: CreditCard, title: 'Payments & Billing', desc: 'Accepted payment methods, invoices, and discount codes.' },
  { icon: Shield, title: 'Product & Warranty', desc: 'Authenticity, warranty coverage, and product care tips.' },
  { icon: Building2, title: 'Wholesale & Bulk Orders', desc: 'Business partnerships, bulk pricing, and volume discounts.' },
  { icon: Users, title: 'Account & Seller Help', desc: 'Login issues, profile settings, and Home Seller support.' },
];

const FAQS = [
  { q: 'How can I track my order?', a: "Once your order ships, you'll receive a tracking link by email and SMS. You can also view live order status anytime from the Orders section of your account." },
  { q: 'What is your return & refund policy?', a: 'Most items can be returned within 7 days of delivery if unused and in original packaging. Refunds are processed to your original payment method within 5-7 business days after we receive the item.' },
  { q: 'Do you offer wholesale or bulk pricing?', a: 'Yes. Business partners get volume discounts on bulk orders. Use the Wholesale tab when contacting us, or reach out directly and our team will share a custom quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets. Prepaid orders above ₹499 qualify for free delivery, and code REMISE10 gives 10% off.' },
  { q: 'How long does delivery take?', a: 'Standard delivery typically takes 3-7 business days depending on your location. Bulk/wholesale orders may take longer and will be confirmed at the time of order.' },
  { q: 'How do I become a Home Seller?', a: 'Visit the Home Seller section from the main menu to apply. Our team will review your application and get in touch with onboarding details.' },
  { q: 'How do I reach a real person for help?', a: 'Use the Contact Us button on this page to send us a message, or reach out directly using the phone number and email listed below. Our team typically responds within 24 hours.' },
];

const OFFICIAL_CONTACT_INFO = {
  email: 'porulontechnologies@gmail.com',
  phone: '+91 90470 99277',
  address: 'Coimbatore, Tamil Nadu, India',
  hoursWeekday: '9:00 AM - 8:00 PM',
  hoursSaturday: '10:00 AM - 6:00 PM',
  hoursSunday: 'Opened',
};

export default function ServicesScreen() {
  const [showContact, setShowContact] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const contactInfo = OFFICIAL_CONTACT_INFO;

  const toggleFaq = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === i ? null : i);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <Headphones size={15} color="#FFFFFF" />
          </View>
          <Text style={styles.eyebrowText}>We're Here to Help</Text>
        </View>
        <Text style={styles.heroTitle}>
          Customer <Text style={styles.heroTitleAccent}>Support</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Questions about an order, a return, or a bulk purchase? Browse our help topics and FAQs
          below, or reach our team directly.
        </Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => setShowContact(true)} activeOpacity={0.85}>
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.contactBtnText}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK CONTACT CARDS */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)}
          activeOpacity={0.7}
        >
          <View style={styles.quickIconCircle}>
            <Mail size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickLabel}>Email Us</Text>
            <Text style={styles.quickValue} numberOfLines={1}>{contactInfo.email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => Linking.openURL(`tel:${contactInfo.phone}`)}
          activeOpacity={0.7}
        >
          <View style={styles.quickIconCircle}>
            <Phone size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickLabel}>Call Us</Text>
            <Text style={styles.quickValue} numberOfLines={1}>{contactInfo.phone}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.quickCard}>
          <View style={styles.quickIconCircle}>
            <MapPin size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickLabel}>Location</Text>
            <Text style={styles.quickValue} numberOfLines={1}>{contactInfo.address}</Text>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={styles.quickIconCircle}>
            <Clock size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickLabel}>Support Hours</Text>
            <Text style={styles.quickValue}>Mon-Fri: {contactInfo.hoursWeekday}</Text>
          </View>
        </View>
      </View>

      {/* SUPPORT CATEGORIES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingBar} />
          <Text style={styles.sectionHeadingText}>How Can We Help?</Text>
        </View>
        <View style={styles.grid}>
          {SUPPORT_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <View key={i} style={styles.categoryCard}>
                <View style={styles.quickIconCircle}>
                  <Icon size={18} color={BRAND} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryDesc}>{cat.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingBar} />
          <Text style={styles.sectionHeadingText}>Frequently Asked Questions</Text>
        </View>
        <View style={styles.faqCard}>
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <View key={i} style={i !== FAQS.length - 1 ? styles.faqDivider : undefined}>
                <TouchableOpacity style={styles.faqQuestionRow} onPress={() => toggleFaq(i)} activeOpacity={0.7}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <ChevronDown
                    size={18}
                    color={BRAND}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* STILL NEED HELP CTA */}
      <View style={styles.closingCta}>
        <Headphones size={28} color={BRAND} style={{ marginBottom: Spacing.sm }} />
        <Text style={styles.closingCtaTitle}>Still Need Help?</Text>
        <Text style={styles.closingCtaSubtitle}>
          Send us a message and our concierge team will get back to you within 24 hours.
        </Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => setShowContact(true)} activeOpacity={0.85}>
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.contactBtnText}>Contact Us</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ContactModal visible={showContact} onClose={() => setShowContact(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'flex-start' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  eyebrowIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  eyebrowText: { fontSize: 11, fontWeight: '800', color: BRAND, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: { fontSize: FontSizes.xl ?? 26, fontWeight: '900', color: '#fff', marginBottom: Spacing.sm },
  heroTitleAccent: { color: BRAND },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20, marginBottom: Spacing.lg },

  contactBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  contactBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: FontSizes.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },

  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionHeadingBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: BRAND },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', color: BRAND, textTransform: 'uppercase', letterSpacing: 1 },

  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  quickIconCircle: { width: 40, height: 40, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  quickValue: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  grid: { gap: Spacing.sm },
  categoryCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff', marginTop: Spacing.xs, marginBottom: 2 },
  categoryDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 16 },

  faqCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  faqDivider: { borderBottomWidth: 1, borderBottomColor: '#222' },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, padding: Spacing.md },
  faqQuestion: { flex: 1, fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },
  faqAnswer: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 19, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },

  closingCta: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.4)',
    backgroundColor: '#111',
    padding: Spacing.xl,
    alignItems: 'center',
  },
  closingCtaTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: Spacing.xs },
  closingCtaSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 19 },
});