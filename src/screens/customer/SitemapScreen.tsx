import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
    Map,
    ShoppingBag,
    Building2,
    Info,
    LifeBuoy,
    UserCircle,
    Scale,
    ArrowRight,
    ChevronRight,
    HelpCircle,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getSitemapData, SitemapData } from '../../i18n/sitemapTranslations';

// Ported from client/app/sitemap/page.tsx — uses website brand red (#FF0000).

const BRAND_RED = CustomerColors.primary;

type SitemapLink = {
    label: string;
    route?: string;
};

type SitemapSection = {
    icon: any;
    title: string;
    desc: string;
    isStatic?: boolean;
    links: SitemapLink[];
};

type QuickNavGroup = {
    title: string;
    isStatic?: boolean;
    links: SitemapLink[];
};

function getSitemapSections(data: SitemapData): SitemapSection[] {
    return [
        {
            icon: ShoppingBag,
            title: data.shopTitle,
            desc: data.shopDesc,
            links: [
                { label: data.linkLabels.home, route: 'Home' },
                { label: data.linkLabels.allProducts, route: 'Categories' },
                { label: data.linkLabels.categories, route: 'Categories' },
                { label: data.linkLabels.newArrivals, route: 'NewArrivals' },
                { label: data.linkLabels.bestSellers, route: 'BestSellers' },
                { label: data.linkLabels.offers, route: 'Nearby' },
                { label: data.linkLabels.searchProducts, route: 'Home' },
            ],
        },
        {
            icon: Building2,
            title: data.businessTitle,
            desc: data.businessDesc,
            isStatic: true,
            links: [
                { label: data.linkLabels.storeOwner },
                { label: data.linkLabels.wholesaler },
                { label: data.linkLabels.homeBusiness },
                { label: data.linkLabels.businessRegistration },
                { label: data.linkLabels.businessLogin },
                { label: data.linkLabels.storeDashboard },
            ],
        },
        {
            icon: Info,
            title: data.companyTitle,
            desc: data.companyDesc,
            links: [
                { label: data.linkLabels.aboutUs, route: 'About' },
                { label: data.linkLabels.careers, route: 'Careers' },
                { label: data.linkLabels.blogsNews, route: 'Blog' },
                { label: data.linkLabels.press, route: 'Press' },
                { label: data.linkLabels.contactUs, route: 'Services' },
            ],
        },
        {
            icon: LifeBuoy,
            title: data.supportTitle,
            desc: data.supportDesc,
            links: [
                { label: data.linkLabels.helpCenter, route: 'HelpCenter' },
                { label: data.linkLabels.faq, route: 'HelpCenter' },
                { label: data.linkLabels.returnsRefunds, route: 'Returns' },
                { label: data.linkLabels.orderSupport, route: 'Services' },
                { label: data.linkLabels.paymentSupport, route: 'Services' },
                { label: data.linkLabels.contactSupport, route: 'Services' },
            ],
        },
        {
            icon: UserCircle,
            title: data.accountTitle,
            desc: data.accountDesc,
            links: [
                { label: data.linkLabels.login, route: 'LoginRegister' },
                { label: data.linkLabels.register, route: 'LoginRegister' },
                { label: data.linkLabels.myAccount, route: 'Profile' },
                { label: data.linkLabels.myOrders, route: 'Orders' },
                { label: data.linkLabels.savedAddresses, route: 'Profile' },
                { label: data.linkLabels.wishlist, route: 'Wishlist' },
                { label: data.linkLabels.cart, route: 'Cart' },
            ],
        },
        {
            icon: Scale,
            title: data.legalTitle,
            desc: data.legalDesc,
            links: [
                { label: data.linkLabels.privacyPolicy, route: 'PrivacyPolicy' },
                { label: data.linkLabels.termsOfService, route: 'TermsOfUse' },
                { label: data.linkLabels.returnsPolicy, route: 'Returns' },
            ],
        },
    ];
}

function getQuickNav(data: SitemapData): QuickNavGroup[] {
    return [
        {
            title: data.quickNavGroups.main,
            links: [
                { label: data.linkLabels.home, route: 'Home' },
                { label: data.linkLabels.categories, route: 'Categories' },
                { label: data.linkLabels.bulkPurchase, route: 'BulkPurchase' },
                { label: data.linkLabels.offers, route: 'Nearby' },
            ],
        },
        {
            title: data.quickNavGroups.discover,
            links: [
                { label: data.linkLabels.newArrivals, route: 'NewArrivals' },
                { label: data.linkLabels.bestSellers, route: 'BestSellers' },
                { label: data.linkLabels.blogsNews, route: 'Blog' },
            ],
        },
        {
            title: data.quickNavGroups.business,
            isStatic: true,
            links: [
                { label: data.linkLabels.becomeSeller },
                { label: data.linkLabels.businessLogin },
                { label: data.linkLabels.storeManagement },
            ],
        },
        {
            title: data.quickNavGroups.help,
            links: [
                { label: data.linkLabels.helpCenter, route: 'HelpCenter' },
                { label: data.linkLabels.returnsRefunds, route: 'Returns' },
                { label: data.linkLabels.contactUs, route: 'Services' },
            ],
        },
    ];
}

export default function SitemapScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { language } = useTranslation();
    const data = useMemo(() => getSitemapData(language as any), [language]);

    useEffect(() => {
        navigation.setOptions({ title: data.heroTitle });
    }, [navigation, data.heroTitle]);

    const sections = useMemo(() => getSitemapSections(data), [data]);
    const quickNav = useMemo(() => getQuickNav(data), [data]);

    const cardBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1F2937' : '#e2e8f0';
    const textPri = isDark ? '#F9FAFB' : '#0f172a';
    const textSec = isDark ? '#9CA3AF' : '#64748b';
    const iconBg = isDark ? 'rgba(255, 0, 0, 0.15)' : '#fef2f2';
    const bg = isDark ? '#0b0f19' : '#f8fafc';

    const goTo = (route?: string) => {
        if (!navigation || !route) return;
        if (route === 'BestSellers' || route === 'NewArrivals') {
            navigation.navigate('CustomerTabs', { screen: 'Home', params: { screen: route } });
            return;
        }
        const tabRoutes = ['Home', 'Categories', 'BulkPurchase', 'Suppliers', 'Nearby', 'Orders', 'Wishlist', 'Cart', 'Profile'];
        if (tabRoutes.includes(route)) {
            navigation.navigate('CustomerTabs', { screen: route });
            return;
        }
        navigation.navigate(route);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.eyebrowRow}>
                    <View style={styles.eyebrowIcon}>
                        <Map size={15} color="#FFFFFF" />
                    </View>
                    <Text style={styles.eyebrowText}>{data.eyebrow}</Text>
                </View>
                <Text style={[styles.headerTitle, { color: textPri }]}>
                    {data.heroTitleLead}
                    <Text style={styles.headerTitleAccent}>{data.heroTitleAccent}</Text>
                </Text>
                <Text style={[styles.headerSubtitle, { color: textSec }]}>
                    {data.heroSubtitle}
                </Text>
            </View>

            {/* DIRECTORY GRID */}
            <View style={styles.section}>
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <View key={section.title} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            <View style={styles.cardHeaderRow}>
                                <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
                                    <Icon size={18} color={BRAND_RED} />
                                </View>
                                <Text style={[styles.cardTitle, { color: textPri }]}>{section.title}</Text>
                            </View>
                            <Text style={[styles.cardDesc, { color: textSec }]}>{section.desc}</Text>
                            {section.links.map((link) => {
                                if (section.isStatic || !link.route) {
                                    return (
                                        <View key={link.label} style={styles.linkRow}>
                                            <ChevronRight size={14} color={BRAND_RED} />
                                            <Text style={[styles.linkTextActive, { color: textSec }]}>{link.label}</Text>
                                        </View>
                                    );
                                }
                                return (
                                    <TouchableOpacity
                                        key={link.label}
                                        style={styles.linkRow}
                                        onPress={() => goTo(link.route)}
                                        activeOpacity={0.6}
                                    >
                                        <ChevronRight size={14} color={BRAND_RED} />
                                        <Text style={[styles.linkTextActive, { color: textPri }]}>{link.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </View>

            {/* QUICK NAVIGATION */}
            <View style={styles.section}>
                <View style={styles.quickNavHeader}>
                    <Text style={[styles.quickNavTitle, { color: textPri }]}>{data.quickNavTitle}</Text>
                    <Text style={[styles.quickNavSubtitle, { color: textSec }]}>{data.quickNavSubtitle}</Text>
                </View>
                <View style={[styles.quickNavCard, { backgroundColor: cardBg, borderColor }]}>
                    {quickNav.map((col) => (
                        <View key={col.title} style={styles.quickNavCol}>
                            <Text style={styles.quickNavColTitle}>{col.title}</Text>
                            {col.links.map((link) => {
                                if (col.isStatic || !link.route) {
                                    return (
                                        <Text key={link.label} style={[styles.quickNavLinkText, { color: textSec }]}>
                                            {link.label}
                                        </Text>
                                    );
                                }
                                return (
                                    <TouchableOpacity key={link.label} onPress={() => goTo(link.route)} activeOpacity={0.6}>
                                        <Text style={[styles.quickNavLinkText, { color: textPri }]}>{link.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {/* NEED HELP CTA */}
            <View style={styles.section}>
                <View style={[styles.ctaCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
                    <HelpCircle size={28} color={BRAND_RED} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />
                    <Text style={[styles.ctaTitle, { color: textPri }]}>{data.ctaTitle}</Text>
                    <Text style={[styles.ctaSubtitle, { color: textSec }]}>
                        {data.ctaSubtitle}
                    </Text>
                    <TouchableOpacity style={styles.ctaButtonFilled} onPress={() => goTo('HelpCenter')} activeOpacity={0.85}>
                        <Text style={styles.ctaButtonFilledText}>{data.ctaVisitHelp}</Text>
                        <ArrowRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctaButtonOutline, { backgroundColor: cardBg }]} onPress={() => goTo('Services')} activeOpacity={0.85}>
                        <Text style={styles.ctaButtonOutlineText}>{data.ctaContactUs}</Text>
                        <ArrowRight size={16} color={BRAND_RED} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },

    header: { padding: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'center' },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    eyebrowIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: BRAND_RED, alignItems: 'center', justifyContent: 'center' },
    eyebrowText: { fontSize: 11, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 1.5 },
    headerTitle: { fontSize: FontSizes.xl ?? 24, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 30, marginBottom: Spacing.sm },
    headerTitleAccent: { color: BRAND_RED },
    headerSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

    section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },

    card: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
    cardIconWrap: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', marginBottom: Spacing.sm, lineHeight: 16 },

    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
    linkText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#6B7280' },
    linkTextActive: { fontSize: FontSizes.sm, fontWeight: '600', color: '#D1D5DB' },

    quickNavHeader: { alignItems: 'center', marginBottom: Spacing.md },
    quickNavTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
    quickNavSubtitle: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },

    quickNavCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.lg, padding: Spacing.lg },
    quickNavCol: { marginBottom: Spacing.md },
    quickNavColTitle: { fontSize: 11, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
    quickNavLinkText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#D1D5DB', paddingVertical: 4 },
    quickNavLinkTextInactive: { fontSize: FontSizes.sm, fontWeight: '600', color: '#6B7280', paddingVertical: 4 },

    ctaCard: { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,0,0,0.4)', borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center' },
    ctaTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
    ctaSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', textAlign: 'center', lineHeight: 19, marginBottom: Spacing.lg },
    ctaButtonFilled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: BRAND_RED, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, width: '100%', marginBottom: Spacing.sm },
    ctaButtonFilledText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', flexShrink: 1 },
    ctaButtonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: BRAND_RED, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, width: '100%' },
    ctaButtonOutlineText: { fontSize: FontSizes.sm, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', flexShrink: 1 },
});