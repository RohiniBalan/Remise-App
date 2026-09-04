import React from 'react';
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

const SITEMAP_SECTIONS: SitemapSection[] = [
    {
        icon: ShoppingBag,
        title: 'Shop',
        desc: 'Discover and shop products on Remise.',
        links: [
            { label: 'Home', route: 'Home' },
            { label: 'All Products', route: 'Categories' },
            { label: 'Categories', route: 'Categories' },
            { label: 'New Arrivals', route: 'NewArrivals' },
            { label: 'Best Sellers', route: 'BestSellers' },
            { label: 'Offers', route: 'Nearby' },
            { label: 'Search Products', route: 'Home' },
        ],
    },
    {
        icon: Building2,
        title: 'For Businesses',
        desc: 'Grow your business with Remise.',
        isStatic: true,
        links: [
            { label: 'Store Owner' },
            { label: 'Wholesaler' },
            { label: 'Home Business' },
            { label: 'Business Registration' },
            { label: 'Business Login' },
            { label: 'Store Dashboard' },
        ],
    },
    {
        icon: Info,
        title: 'Company',
        desc: 'Learn more about Remise and our journey.',
        links: [
            { label: 'About Us', route: 'About' },
            { label: 'Careers', route: 'Careers' },
            { label: 'Blogs & News', route: 'Blog' },
            { label: 'Press', route: 'Press' },
            { label: 'Contact Us', route: 'Services' },
        ],
    },
    {
        icon: LifeBuoy,
        title: 'Support',
        desc: 'Need help? Find answers and useful resources.',
        links: [
            { label: 'Help Center', route: 'HelpCenter' },
            { label: 'Frequently Asked Questions', route: 'HelpCenter' },
            { label: 'Returns & Refunds', route: 'Returns' },
            { label: 'Order Support', route: 'Services' },
            { label: 'Payment Support', route: 'Services' },
            { label: 'Contact Support', route: 'Services' },
        ],
    },
    {
        icon: UserCircle,
        title: 'Account',
        desc: 'Manage your Remise account.',
        links: [
            { label: 'Login', route: 'LoginRegister' },
            { label: 'Register', route: 'LoginRegister' },
            { label: 'My Profile', route: 'Profile' },
            { label: 'My Orders', route: 'Orders' },
            { label: 'Wishlist', route: 'Wishlist' },
            { label: 'Saved Cart', route: 'Cart' },
            { label: 'Addresses', route: 'Profile' },
        ],
    },
    {
        icon: Scale,
        title: 'Legal',
        desc: 'Important information about using Remise.',
        links: [
            { label: 'Privacy Policy', route: 'PrivacyPolicy' },
            { label: 'Terms of Service', route: 'TermsOfService' },
            { label: 'Returns & Refunds', route: 'Returns' },
        ],
    },
];

const QUICK_NAV: QuickNavGroup[] = [
    {
        title: 'Shop',
        links: [
            { label: 'All Products', route: 'Categories' },
            { label: 'Categories', route: 'Categories' },
            { label: 'Offers', route: 'Nearby' },
        ],
    },
    {
        title: 'Discover',
        links: [
            { label: 'New Arrivals', route: 'NewArrivals' },
            { label: 'Best Sellers', route: 'BestSellers' },
            { label: 'Blogs & News', route: 'Blog' },
        ],
    },
    {
        title: 'Business',
        isStatic: true,
        links: [
            { label: 'Become a Seller' },
            { label: 'Business Login' },
            { label: 'Store Management' },
        ],
    },
    {
        title: 'Help',
        links: [
            { label: 'Help Center', route: 'HelpCenter' },
            { label: 'Returns & Refunds', route: 'Returns' },
            { label: 'Contact Us', route: 'Services' },
        ],
    },
];

export default function SitemapScreen({ navigation }: any) {
    const goTo = (route?: string) => {
        if (!navigation || !route) return;
        const tabRoutes = ['Home', 'Categories', 'BulkPurchase', 'Suppliers', 'Nearby', 'Orders'];
        if (tabRoutes.includes(route)) {
            navigation.navigate('CustomerTabs', { screen: route });
            return;
        }
        navigation.navigate(route);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.eyebrowRow}>
                    <View style={styles.eyebrowIcon}>
                        <Map size={15} color="#FFFFFF" />
                    </View>
                    <Text style={styles.eyebrowText}>Sitemap</Text>
                </View>
                <Text style={styles.headerTitle}>
                    Everything on Remise, <Text style={styles.headerTitleAccent}>all in one place</Text>
                </Text>
                <Text style={styles.headerSubtitle}>
                    Explore the main sections, shopping features, business services, support resources, and
                    company information available on Remise.
                </Text>
            </View>

            {/* DIRECTORY GRID */}
            <View style={styles.section}>
                {SITEMAP_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <View key={section.title} style={styles.card}>
                            <View style={styles.cardHeaderRow}>
                                <View style={styles.cardIconWrap}>
                                    <Icon size={18} color={BRAND_RED} />
                                </View>
                                <Text style={styles.cardTitle}>{section.title}</Text>
                            </View>
                            <Text style={styles.cardDesc}>{section.desc}</Text>
                            {section.links.map((link) => {
                                if (section.isStatic || !link.route) {
                                    return (
                                        <View key={link.label} style={styles.linkRow}>
                                            <ChevronRight size={14} color={BRAND_RED} />
                                            <Text style={styles.linkTextActive}>{link.label}</Text>
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
                                        <Text style={styles.linkTextActive}>{link.label}</Text>
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
                    <Text style={styles.quickNavTitle}>Looking for something specific?</Text>
                    <Text style={styles.quickNavSubtitle}>A quick shortcut to the most-used pages.</Text>
                </View>
                <View style={styles.quickNavCard}>
                    {QUICK_NAV.map((col) => (
                        <View key={col.title} style={styles.quickNavCol}>
                            <Text style={styles.quickNavColTitle}>{col.title}</Text>
                            {col.links.map((link) => {
                                if (col.isStatic || !link.route) {
                                    return (
                                        <Text key={link.label} style={styles.quickNavLinkText}>
                                            {link.label}
                                        </Text>
                                    );
                                }
                                return (
                                    <TouchableOpacity key={link.label} onPress={() => goTo(link.route)} activeOpacity={0.6}>
                                        <Text style={styles.quickNavLinkText}>{link.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {/* NEED HELP CTA */}
            <View style={styles.section}>
                <View style={styles.ctaCard}>
                    <HelpCircle size={28} color={BRAND_RED} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />
                    <Text style={styles.ctaTitle}>Can't find what you're looking for?</Text>
                    <Text style={styles.ctaSubtitle}>
                        Our Help Center has answers to common questions about shopping, orders, payments,
                        returns, and using Remise.
                    </Text>
                    <TouchableOpacity style={styles.ctaButtonFilled} onPress={() => goTo('HelpCenter')} activeOpacity={0.85}>
                        <Text style={styles.ctaButtonFilledText}>Visit Help Center</Text>
                        <ArrowRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctaButtonOutline} onPress={() => goTo('Services')} activeOpacity={0.85}>
                        <Text style={styles.ctaButtonOutlineText}>Contact Us</Text>
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
    ctaButtonFilledText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
    ctaButtonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: BRAND_RED, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, width: '100%' },
    ctaButtonOutlineText: { fontSize: FontSizes.sm, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },
});