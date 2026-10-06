import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, MapPin, Shield, CreditCard, Truck, Mail, Send } from 'lucide-react-native';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { newsletterApi } from '../../api/newsletterApi';
import { useAuth } from '../../context/AuthContext';
import AuthRequiredModal from '../common/AuthRequiredModal';
import { useTranslation } from '../../i18n';
import { getFooterData } from '../../i18n/footerTranslations';

// Compact mobile counterpart of client/app/components-sections/Footer.tsx.
// Web's link columns (Company/Support/Shop) mostly point at '#' (no real
// page behind them even on web), so those are kept as static text here
// rather than fake-navigating; the handful of web footer links that DO have
// a real destination (About Us, Our Services, Help Center, Nearby Offers,
// My Orders) are wired to the matching registered screens. The legal links
// (Privacy Policy, Terms of Use, Sitemap) are also wired to their screens
// in screens/customer/.

const PAYMENT_ICONS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'];

export default function HomeFooter() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { t, language } = useTranslation();
  const footerData = getFooterData(language as any);

  const quickLinks = [
    { label: t('products.newArrivals'), route: 'NewArrivals', isHomeSeller: false },
    { label: t('products.bestSellers'), route: 'BestSellers', isHomeSeller: false },
    { label: footerData.homeSeller, route: 'Suppliers', isHomeSeller: true },
    { label: t('common.aboutUs'), route: 'About', isHomeSeller: false },
    { label: t('common.ourServices'), route: 'Services', isHomeSeller: false },
    { label: t('common.helpCenter'), route: 'HelpCenter', isHomeSeller: false },
    { label: t('common.nearbyOffers'), route: 'Nearby', isHomeSeller: false },
    { label: t('common.myOrders'), route: 'Orders', isHomeSeller: false },
  ];

  const legalLinks = [
    { label: footerData.privacyPolicy, route: 'PrivacyPolicy' },
    { label: footerData.termsOfUse, route: 'TermsOfUse' },
    { label: footerData.sitemap, route: 'Sitemap' },
  ];

  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [hasInputError, setHasInputError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'duplicate';
    text: string;
  } | null>(null);

  const validateEmail = (val: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(val.trim());
  };

  const handleSubscribe = async () => {
    if (isSubscribing) return;

    if (!user && !token) {
      setHasInputError(true);
      setStatusMessage({ type: 'error', text: footerData.loginFirstToSubscribe });
      setShowAuthModal(true);
      return;
    }

    if (!email.trim()) {
      setHasInputError(true);
      setStatusMessage({ type: 'error', text: footerData.enterYourEmail });
      return;
    }

    if (!validateEmail(email)) {
      setHasInputError(true);
      setStatusMessage({ type: 'error', text: footerData.enterValidEmail });
      return;
    }

    setHasInputError(false);
    setStatusMessage(null);
    setIsSubscribing(true);

    try {
      const res = await newsletterApi.subscribe(email, 'mobile_footer');
      const data = res?.data;

      if (data?.success) {
        if (data.isDuplicate) {
          setHasInputError(true);
          setStatusMessage({ type: 'duplicate', text: footerData.alreadySubscribed });
        } else {
          setHasInputError(false);
          setStatusMessage({ type: 'success', text: footerData.thanksForSubscribing });
          setEmail('');
        }
      } else {
        setHasInputError(true);
        setStatusMessage({ type: 'error', text: data?.message || 'Something went wrong. Please try again.' });
      }
    } catch (err: any) {
      console.warn('Newsletter subscribe error:', err?.response?.data || err?.message || err);
      let msg = err?.response?.data?.message || err?.message || 'Unable to subscribe right now. Please try again later.';
      if (
        typeof msg === 'string' &&
        (msg.includes('http://') ||
          msg.includes('503') ||
          msg.includes('502') ||
          msg.includes('content-service') ||
          msg.includes('Service temporarily unavailable'))
      ) {
        msg = 'Unable to subscribe right now. Please try again later.';
      }
      setHasInputError(true);
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.newsletterStrip}>
        <Text style={styles.newsletterTitle}>{footerData.newsletterHeading}</Text>
        <Text style={styles.newsletterSubtitle}>{footerData.newsletterSubtitle}</Text>
        <View style={styles.newsletterInputRow}>
          <View style={[styles.newsletterInputWrap, hasInputError && styles.newsletterInputWrapError]}>
            <Mail size={15} color="#FFFFFF" />
            <TextInput
              style={styles.newsletterInput}
              placeholder={footerData.enterEmailPlaceholder}
              placeholderTextColor="#FFFFFF"
              value={email}
              editable={!isSubscribing}
              onChangeText={(text) => {
                setEmail(text);
                if (hasInputError) {
                  setHasInputError(false);
                  setStatusMessage(null);
                }
              }}
              onSubmitEditing={handleSubscribe}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[styles.subscribeButton, isSubscribing && { opacity: 0.7 }]}
            onPress={handleSubscribe}
            disabled={isSubscribing}
          >
            <Send size={14} color="#fff" />
            <Text style={styles.subscribeButtonText}>{isSubscribing ? footerData.subscribingBtn : footerData.subscribeBtn}</Text>
          </TouchableOpacity>
        </View>

        {statusMessage && (
          <View
            style={[
              styles.statusBanner,
              statusMessage.type === 'success'
                ? styles.statusSuccess
                : statusMessage.type === 'duplicate'
                  ? styles.statusDuplicate
                  : styles.statusError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusMessage.type === 'success'
                  ? styles.statusTextSuccess
                  : statusMessage.type === 'duplicate'
                    ? styles.statusTextDuplicate
                    : styles.statusTextError,
              ]}
            >
              {statusMessage.text}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Text style={styles.logo}>R<Text style={styles.logoAccent}>E</Text>mise</Text>
        </View>
        <Text style={styles.tagline}>
          {footerData.description}
        </Text>

        <Text style={styles.companyName}>{footerData.companyName}</Text>

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
          <Text style={styles.contactText}>{footerData.location}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>{footerData.quickLinksHeading}</Text>
        <View style={styles.linksGrid}>
          {quickLinks.filter(link => {
            if (link.isHomeSeller || link.route === 'Suppliers') {
              const role = user?.role ? String(user.role).toLowerCase().trim() : '';
              if (['store_owner', 'whole_saler', 'wholesaler', 'home_business', 'admin', 'home_seller'].includes(role)) {
                return false;
              }
            }
            return true;
          }).map(link => (
            <TouchableOpacity key={link.route} style={styles.linkChip} onPress={() => navigation.navigate(link.route)}>
              <Text style={styles.linkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Shield size={13} color="#22C55E" />
            <Text style={styles.trustText}>{footerData.trustSecure}</Text>
          </View>
          <View style={styles.trustItem}>
            <Truck size={13} color={GoldColors.gold} />
            <Text style={styles.trustText}>{footerData.trustDelivery}</Text>
          </View>
          <View style={styles.trustItem}>
            <CreditCard size={13} color="#60A5FA" />
            <Text style={styles.trustText}>{footerData.trustPayments}</Text>
          </View>
        </View>

        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>{footerData.weAccept}</Text>
          {PAYMENT_ICONS.map(p => (
            <View key={p} style={styles.paymentPill}>
              <Text style={styles.paymentText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.legalRow}>
          {legalLinks.map(link => (
            <TouchableOpacity key={link.label} onPress={() => navigation.navigate(link.route)}>
              <Text style={styles.legalText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>© 2026 Remise. {footerData.allRightsReserved}</Text>
      </View>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Subscribe"
        subtitle="Please sign in or register to subscribe to the newsletter updates."
        onLogin={() => navigation.navigate('LoginRegister')}
      />
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
  newsletterInputWrapError: { borderColor: '#FCA5A5', borderWidth: 1.5 },
  newsletterInput: { flex: 1, paddingVertical: 10, fontSize: FontSizes.xs, color: '#fff' },
  subscribeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF0000', paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, justifyContent: 'center' },
  subscribeButtonText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#fff' },
  statusBanner: { marginTop: Spacing.xs, paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1 },
  statusSuccess: { backgroundColor: 'rgba(15, 118, 110, 0.4)', borderColor: 'rgba(204, 251, 241, 0.4)' },
  statusDuplicate: { backgroundColor: 'rgba(120, 53, 15, 0.4)', borderColor: 'rgba(254, 240, 138, 0.4)' },
  statusError: { backgroundColor: 'rgba(136, 19, 55, 0.4)', borderColor: 'rgba(254, 205, 211, 0.4)' },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700' },
  statusTextSuccess: { color: '#CCFBF1' },
  statusTextDuplicate: { color: '#FEF08A' },
  statusTextError: { color: '#FECDD3' },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  brandRow: { marginBottom: Spacing.sm },
  logo: { fontSize: FontSizes.lg, fontWeight: '900', color: '#fff' },
  logoAccent: { color: CustomerColors.primary },
  tagline: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 18, marginBottom: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  contactText: { fontSize: FontSizes.xs, color: '#9CA3AF' },
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