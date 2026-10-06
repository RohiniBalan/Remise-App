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
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getCustomerSupportData } from '../../i18n/customerSupportTranslations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAND = CustomerColors.primary;

const SUPPORT_CATEGORY_ICONS = [
  Truck,
  RotateCcw,
  CreditCard,
  Shield,
  Building2,
  Users,
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
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const supportData = getCustomerSupportData(language as any);

  const [showContact, setShowContact] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const contactInfo = OFFICIAL_CONTACT_INFO;

  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1F2937' : '#e2e8f0';
  const textPri = isDark ? '#F9FAFB' : '#0f172a';
  const textSec = isDark ? '#9CA3AF' : '#64748b';
  const iconBg = isDark ? 'rgba(255, 0, 0, 0.15)' : '#fef2f2';

  const toggleFaq = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === i ? null : i);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }]} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <Headphones size={15} color="#FFFFFF" />
          </View>
          <Text style={styles.eyebrowText}>{supportData.eyebrow}</Text>
        </View>
        <Text style={[styles.heroTitle, { color: textPri }]}>
          {supportData.heroTitlePart1}<Text style={styles.heroTitleAccent}>{supportData.heroTitlePart2}</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: textSec }]}>
          {supportData.heroSubtitle}
        </Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => setShowContact(true)} activeOpacity={0.85}>
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.contactBtnText}>{supportData.contactUsBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK CONTACT CARDS */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}>
            <Mail size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickLabel, { color: textSec }]}>{supportData.emailUs}</Text>
            <Text style={[styles.quickValue, { color: textPri }]} numberOfLines={1}>{contactInfo.email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => Linking.openURL(`tel:${contactInfo.phone}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}>
            <Phone size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickLabel, { color: textSec }]}>{supportData.callUs}</Text>
            <Text style={[styles.quickValue, { color: textPri }]} numberOfLines={1}>{contactInfo.phone}</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.quickCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.quickIconCircle, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}>
            <MapPin size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickLabel, { color: textSec }]}>{supportData.location}</Text>
            <Text style={[styles.quickValue, { color: textPri }]} numberOfLines={1}>{contactInfo.address}</Text>
          </View>
        </View>

        <View style={[styles.quickCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.quickIconCircle, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}>
            <Clock size={18} color={BRAND} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickLabel, { color: textSec }]}>{supportData.supportHours}</Text>
            <Text style={[styles.quickValue, { color: textPri }]}>{supportData.monFri} {contactInfo.hoursWeekday}</Text>
          </View>
        </View>
      </View>

      {/* SUPPORT CATEGORIES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingBar} />
          <Text style={styles.sectionHeadingText}>{supportData.howCanWeHelpHeading}</Text>
        </View>
        <View style={styles.grid}>
          {supportData.categories.map((cat, i) => {
            const Icon = SUPPORT_CATEGORY_ICONS[i] || Headphones;
            return (
              <View key={i} style={[styles.categoryCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.quickIconCircle, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}>
                  <Icon size={18} color={BRAND} />
                </View>
                <Text style={[styles.categoryTitle, { color: textPri }]}>{cat.title}</Text>
                <Text style={[styles.categoryDesc, { color: textSec }]}>{cat.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingBar} />
          <Text style={styles.sectionHeadingText}>{supportData.faqHeading}</Text>
        </View>
        <View style={[styles.faqCard, { backgroundColor: cardBg, borderColor }]}>
          {supportData.faqs.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <View key={i} style={i !== supportData.faqs.length - 1 ? [styles.faqDivider, { borderBottomColor: borderColor }] : undefined}>
                <TouchableOpacity style={styles.faqQuestionRow} onPress={() => toggleFaq(i)} activeOpacity={0.7}>
                  <Text style={[styles.faqQuestion, { color: textPri }]}>{item.q}</Text>
                  <ChevronDown
                    size={18}
                    color={BRAND}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {isOpen && <Text style={[styles.faqAnswer, { color: textSec }]}>{item.a}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* STILL NEED HELP CTA */}
      <View style={[styles.closingCta, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
        <Headphones size={28} color={BRAND} style={{ marginBottom: Spacing.sm }} />
        <Text style={[styles.closingCtaTitle, { color: textPri }]}>{supportData.stillNeedHelpTitle}</Text>
        <Text style={[styles.closingCtaSubtitle, { color: textSec }]}>
          {supportData.stillNeedHelpSubtitle}
        </Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => setShowContact(true)} activeOpacity={0.85}>
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.contactBtnText}>{supportData.contactUsBtn}</Text>
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
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  quickValue: { fontSize: FontSizes.sm, fontWeight: '700' },

  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionHeadingBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: BRAND },
  sectionHeadingText: { fontSize: FontSizes.lg, fontWeight: '900', color: '#fff' },

  grid: { gap: Spacing.sm },
  categoryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  categoryTitle: { fontSize: FontSizes.md, fontWeight: '800', marginTop: Spacing.sm, marginBottom: 4 },
  categoryDesc: { fontSize: FontSizes.xs, lineHeight: 18 },

  faqCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
  },
  faqDivider: { borderBottomWidth: 1 },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  faqQuestion: { fontSize: FontSizes.sm, fontWeight: '800', flex: 1 },
  faqAnswer: { fontSize: FontSizes.xs, lineHeight: 18, paddingBottom: Spacing.md },

  closingCta: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  closingCtaTitle: { fontSize: FontSizes.lg, fontWeight: '900', marginBottom: Spacing.xs, textAlign: 'center' },
  closingCtaSubtitle: { fontSize: FontSizes.xs, lineHeight: 18, textAlign: 'center', marginBottom: Spacing.md },
});