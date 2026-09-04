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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    FileText,
    Info,
    UserCog,
    ShoppingBag,
    Store,
    ClipboardList,
    IndianRupee,
    Package,
    Truck,
    CreditCard,
    RotateCcw,
    Ban,
    Copyright,
    Plug,
    UserX,
    ShieldAlert,
    Settings2,
    FileEdit,
    Scale,
    Mail,
    ArrowRight,
    Plus,
    Minus,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/terms/page.tsx — uses website brand red (#FF0000).

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAND_RED = CustomerColors.primary;
const LAST_UPDATED = '20 August 2026';

type Block =
    | { type: 'p'; text: string; bold?: string }
    | { type: 'ul'; items: string[] };

type Article = {
    n: number;
    title: string;
    icon: React.ElementType;
    summary: string;
    blocks: Block[];
};

const ARTICLES: Article[] = [
    {
        n: 1,
        title: 'About Remise',
        icon: Info,
        summary: 'What Remise connects customers and sellers to do.',
        blocks: [
            { type: 'p', text: 'Remise is an e-commerce and local commerce platform that facilitates interactions between customers and sellers, including Store Owners, Wholesalers, and Home Businesses.' },
            { type: 'p', text: 'Depending on the service, Remise may facilitate:' },
            { type: 'ul', items: ['Product discovery', 'Store comparison', 'Product ordering', 'Payment processing', 'Pickup', 'Delivery', 'Seller-customer communication'] },
        ],
    },
    {
        n: 2,
        title: 'User Accounts',
        icon: UserCog,
        summary: 'Keep your details accurate and your login secure.',
        blocks: [
            { type: 'p', text: 'You must provide accurate information when creating an account. You are responsible for:' },
            { type: 'ul', items: ['Maintaining the confidentiality of your account.', 'Keeping your login credentials secure.', 'Providing accurate information.', 'All activities performed through your account.'] },
            { type: 'p', text: 'Do not share your password or OTP with others.' },
        ],
    },
    {
        n: 3,
        title: 'Customer Responsibilities',
        icon: ShoppingBag,
        summary: 'Accurate details, correct orders, and required payment.',
        blocks: [
            { type: 'ul', items: ['Provide accurate delivery information.', 'Select the correct store and products.', 'Verify order details before confirmation.', 'Make required payments.', 'Follow applicable store policies.'] },
        ],
    },
    {
        n: 4,
        title: 'Seller Responsibilities',
        icon: Store,
        summary: 'Accurate listings, lawful products, and honoring orders.',
        blocks: [
            { type: 'ul', items: ['Providing accurate product information.', 'Maintaining correct prices.', 'Maintaining accurate stock information.', 'Fulfilling accepted orders.', 'Providing genuine and lawful products.', 'Following applicable laws and regulations.', 'Honoring applicable return/refund policies.'] },
        ],
    },
    {
        n: 5,
        title: 'Product Information',
        icon: ClipboardList,
        summary: "What a listing includes, and who's responsible for it.",
        blocks: [
            { type: 'p', text: 'Product information may include:' },
            { type: 'ul', items: ['Product name', 'Description', 'Images', 'Price', 'Stock availability', 'Seller information'] },
            { type: 'p', text: 'Product images generated or assisted by technology may be illustrative. Sellers are responsible for ensuring that product information accurately represents the products they sell.' },
        ],
    },
    {
        n: 6,
        title: 'Pricing',
        icon: IndianRupee,
        summary: 'Price can vary by account type and quantity.',
        blocks: [
            { type: 'p', text: 'Prices may differ depending on the customer type and seller pricing configuration. For example, a seller may offer:' },
            { type: 'ul', items: ['Customer price', 'Store Owner/Business price', 'Bulk pricing'] },
            { type: 'p', text: "The applicable price will be displayed based on the user's account type and applicable quantity/pricing rules." },
        ],
    },
    {
        n: 7,
        title: 'Orders',
        icon: Package,
        summary: 'When an order is submitted, and what affects fulfillment.',
        blocks: [
            { type: 'p', text: 'An order is submitted when the customer confirms the purchase through the applicable checkout process.' },
            { type: 'p', text: 'Order acceptance and fulfillment may depend on:' },
            { type: 'ul', items: ['Product availability', 'Seller acceptance', 'Payment status', 'Delivery availability', 'Other operational conditions'] },
        ],
    },
    {
        n: 8,
        title: 'Delivery and Pickup',
        icon: Truck,
        summary: 'Self pickup or home delivery — availability may vary.',
        blocks: [
            { type: 'p', bold: 'Self Pickup:', text: 'the customer collects the order from the selected store.' },
            { type: 'p', bold: 'Home Delivery:', text: "the seller or applicable delivery service delivers the order to the customer's selected address." },
            { type: 'p', text: 'Delivery availability, fees, and estimated times may vary.' },
        ],
    },
    {
        n: 9,
        title: 'Payments',
        icon: CreditCard,
        summary: 'UPI, gateways, or cash — provide accurate payment info.',
        blocks: [
            { type: 'p', text: 'Remise may support payment methods including:' },
            { type: 'ul', items: ['UPI/QR payments', 'Online payment gateways', 'Cash'] },
            { type: 'p', text: 'Online payments may be processed through third-party providers such as Razorpay or Cashfree.' },
            { type: 'p', text: 'Users must provide accurate payment information and must not attempt fraudulent transactions.' },
        ],
    },
    {
        n: 10,
        title: 'Cancellations, Returns and Refunds',
        icon: RotateCcw,
        summary: "Governed by order status, seller policy, and our Returns Policy.",
        blocks: [
            { type: 'p', text: "Orders may be cancelled, returned, replaced, or refunded according to the applicable order status, seller policy, and Remise's Returns & Refund Policy." },
        ],
    },
    {
        n: 11,
        title: 'Prohibited Activities',
        icon: Ban,
        summary: 'What you must not do on Remise.',
        blocks: [
            { type: 'ul', items: ['Provide false information.', 'Create fraudulent accounts.', 'Use the platform for illegal activities.', 'Upload malicious or unlawful content.', 'Manipulate prices or orders fraudulently.', 'Attempt to gain unauthorized access.', 'Interfere with the operation of the platform.', 'Abuse payment or refund systems.'] },
        ],
    },
    {
        n: 12,
        title: 'Intellectual Property',
        icon: Copyright,
        summary: "Remise's name, logo, and materials are protected.",
        blocks: [
            { type: 'p', text: 'The Remise name, logo, software, design, content, and other platform materials are protected by applicable intellectual-property laws. Users may not copy, modify, distribute, or commercially exploit Remise materials without appropriate authorization.' },
        ],
    },
    {
        n: 13,
        title: 'Third-Party Services',
        icon: Plug,
        summary: 'Payments, hosting, maps, AI, and more — each with its own terms.',
        blocks: [
            { type: 'p', text: 'Remise may use third-party services for:' },
            { type: 'ul', items: ['Payment processing', 'Authentication', 'Hosting', 'Maps/location', 'Notifications', 'AI services', 'Image generation', 'Analytics'] },
            { type: 'p', text: 'Third-party services may have their own terms and privacy policies.' },
        ],
    },
    {
        n: 14,
        title: 'Account Suspension',
        icon: UserX,
        summary: 'When Remise may suspend or terminate an account.',
        blocks: [
            { type: 'ul', items: ['Fraudulent activity', 'Violation of these Terms', 'Illegal activity', 'Abuse of the platform', 'Security risk', 'Other circumstances permitted by law'] },
        ],
    },
    {
        n: 15,
        title: 'Limitation of Liability',
        icon: ShieldAlert,
        summary: "What's outside Remise's reasonable control.",
        blocks: [
            { type: 'p', text: 'To the extent permitted by applicable law, Remise will not be responsible for losses arising from circumstances outside its reasonable control, including seller actions, delivery delays, payment-provider failures, network failures, or inaccurate information provided by users or sellers.' },
        ],
    },
    {
        n: 16,
        title: 'Changes to the Service',
        icon: Settings2,
        summary: 'We may modify or discontinue parts of the service.',
        blocks: [
            { type: 'p', text: 'We may modify, update, suspend, or discontinue parts of the service when necessary.' },
        ],
    },
    {
        n: 17,
        title: 'Changes to These Terms',
        icon: FileEdit,
        summary: 'Updates are published through the app or website.',
        blocks: [
            { type: 'p', text: 'We may update these Terms from time to time. Updated Terms will be published through the Remise application or website.' },
        ],
    },
    {
        n: 18,
        title: 'Governing Law',
        icon: Scale,
        summary: 'Governed by the laws of India.',
        blocks: [
            { type: 'p', text: 'These Terms shall be governed by the applicable laws of India. Any disputes shall be subject to the jurisdiction of the appropriate courts, subject to applicable law.' },
        ],
    },
    {
        n: 19,
        title: 'Contact',
        icon: Mail,
        summary: 'Questions about these Terms.',
        blocks: [
            { type: 'p', text: 'For questions regarding these Terms, contact Remise through the official support/contact channel.' },
        ],
    },
];

const HIGHLIGHTS = [
    { title: 'One account, your responsibility', icon: UserCog, desc: 'Keep your login and OTP private — every action on your account is yours.' },
    { title: 'Sellers vouch for listings', icon: Store, desc: 'Store Owners, Wholesalers, and Home Businesses must keep prices, stock, and product info accurate.' },
    { title: 'Pricing can vary by account', icon: IndianRupee, desc: 'You may see a different price than a Store Owner or bulk buyer for the same item.' },
    { title: 'Pickup or delivery, your choice', icon: Truck, desc: 'Availability, fees, and timing can vary by store and location.' },
    { title: 'India-governed', icon: Scale, desc: 'These Terms are governed by Indian law, with disputes subject to the appropriate courts.' },
];

function ArticleBlocks({ blocks }: { blocks: Block[] }) {
    return (
        <>
            {blocks.map((b, i) => {
                if (b.type === 'ul') {
                    return (
                        <View key={i} style={{ marginTop: Spacing.xs }}>
                            {b.items.map((it) => (
                                <View key={it} style={styles.bulletRow}>
                                    <View style={styles.bulletDot} />
                                    <Text style={styles.bulletText}>{it}</Text>
                                </View>
                            ))}
                        </View>
                    );
                }
                return (
                    <Text key={i} style={styles.articleParagraph}>
                        {b.bold ? <Text style={styles.boldInline}>{b.bold} </Text> : null}
                        {b.text}
                    </Text>
                );
            })}
        </>
    );
}

function ArticleRow({
    article,
    isOpen,
    onToggle,
}: {
    article: Article;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const Icon = article.icon;
    return (
        <View style={styles.articleRow}>
            <TouchableOpacity style={styles.articleHeader} onPress={onToggle} activeOpacity={0.75}>
                <Text style={[styles.articleNumber, isOpen && styles.articleNumberActive]}>
                    {String(article.n).padStart(2, '0')}
                </Text>
                <View style={{ flex: 1 }}>
                    <View style={styles.articleTitleRow}>
                        <Icon size={14} color={BRAND_RED} />
                        <Text style={styles.articleTitle}>{article.title}</Text>
                    </View>
                    <Text style={styles.articleSummary}>{article.summary}</Text>
                </View>
                <View style={styles.toggleCircle}>
                    {isOpen ? <Minus size={13} color="#9CA3AF" /> : <Plus size={13} color="#9CA3AF" />}
                </View>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.articleBody}>
                    <ArticleBlocks blocks={article.blocks} />
                </View>
            )}
        </View>
    );
}

export default function TermsOfServiceScreen() {
    const navigation = useNavigation<any>();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set([1]));

    const toggle = (n: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSet((cur) => {
            const next = new Set(cur);
            if (next.has(n)) next.delete(n);
            else next.add(n);
            return next;
        });
    };

    const expandAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSet(new Set(ARTICLES.map((a) => a.n)));
    };
    const collapseAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSet(new Set());
    };

    const openArticle = (n: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSet((cur) => new Set(cur).add(n));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            {/* HERO */}
            <View style={styles.hero}>
                <View style={styles.badge}>
                    <FileText size={13} color={BRAND_RED} />
                    <Text style={styles.badgeText}>Last updated {LAST_UPDATED}</Text>
                </View>
                <Text style={styles.heroTitle}>Terms of Service</Text>
                <Text style={styles.heroSubtitle}>
                    19 short clauses covering accounts, orders, pricing, payments, and what happens if
                    something goes wrong. By using Remise, you agree to these Terms.
                </Text>
            </View>

            {/* THE GIST */}
            <View style={styles.section}>
                <Text style={styles.h2}>The gist</Text>
                <Text style={styles.h2Sub}>Not a substitute for the full Terms below — just the shape of them.</Text>
                {HIGHLIGHTS.map((h) => {
                    const Icon = h.icon;
                    return (
                        <View key={h.title} style={styles.highlightCard}>
                            <View style={styles.highlightIcon}>
                                <Icon size={16} color={BRAND_RED} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.highlightTitle}>{h.title}</Text>
                                <Text style={styles.highlightDesc}>{h.desc}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* INDEX */}
            <View style={styles.section}>
                <View style={styles.indexHeaderRow}>
                    <Text style={styles.h2}>Index</Text>
                    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                        <TouchableOpacity style={styles.pillBtn} onPress={expandAll}>
                            <Text style={styles.pillBtnText}>Expand all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pillBtn} onPress={collapseAll}>
                            <Text style={styles.pillBtnText}>Collapse all</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.indexGrid}>
                    {ARTICLES.map((a) => (
                        <TouchableOpacity
                            key={a.n}
                            style={styles.indexItem}
                            onPress={() => openArticle(a.n)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.indexNumber}>{a.n}</Text>
                            <Text style={styles.indexTitle} numberOfLines={1}>{a.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* FULL TERMS */}
            <View style={styles.section}>
                <Text style={styles.h2}>Full terms</Text>
                <View style={styles.articlesCard}>
                    {ARTICLES.map((a) => (
                        <ArticleRow key={a.n} article={a} isOpen={openSet.has(a.n)} onToggle={() => toggle(a.n)} />
                    ))}
                </View>
            </View>

            {/* CONTACT CTA */}
            <View style={styles.section}>
                <View style={styles.ctaCard}>
                    <View style={styles.ctaBadge}>
                        <Mail size={12} color="#FFFFFF" />
                        <Text style={styles.ctaBadgeText}>Questions about these Terms?</Text>
                    </View>
                    <Text style={styles.ctaTitle}>Contact Remise through the official support channel.</Text>
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },

    hero: { padding: Spacing.lg, paddingTop: Spacing.xl },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
        borderWidth: 1, borderColor: 'rgba(255,0,0,0.35)', borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.md, paddingVertical: 6, marginBottom: Spacing.md,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },
    heroTitle: { fontSize: FontSizes.xl ?? 28, fontWeight: '900', color: '#FFFFFF', marginBottom: Spacing.sm },
    heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20 },

    section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
    h2: { fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF' },
    h2Sub: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: 2, marginBottom: Spacing.md },

    highlightCard: {
        flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#111', borderWidth: 1,
        borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    },
    highlightIcon: { width: 34, height: 34, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
    highlightTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF' },
    highlightDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 2, lineHeight: 16 },

    indexHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    pillBtn: { borderWidth: 1, borderColor: '#333', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
    pillBtnText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB' },

    indexGrid: { borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, overflow: 'hidden' },
    indexItem: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#111',
    },
    indexNumber: { fontSize: 12, fontWeight: '800', color: BRAND_RED, width: 18 },
    indexTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', color: '#D1D5DB' },

    articlesCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md },
    articleRow: { borderBottomWidth: 1, borderBottomColor: '#222' },
    articleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.md },
    articleNumber: { fontSize: 22, fontWeight: '300', color: '#374151', width: 34 },
    articleNumberActive: { color: BRAND_RED },
    articleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    articleTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF' },
    articleSummary: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 2 },
    toggleCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginTop: 2 },

    articleBody: { paddingLeft: 34, paddingBottom: Spacing.md },
    articleParagraph: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 19, marginBottom: Spacing.sm },
    boldInline: { fontWeight: '800', color: '#E5E7EB' },

    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: 6 },
    bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND_RED, marginTop: 7 },
    bulletText: { flex: 1, fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 19 },

    ctaCard: { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,0,0,0.4)', borderRadius: BorderRadius.lg, padding: Spacing.lg },
    ctaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: BRAND_RED, alignSelf: 'flex-start', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginBottom: Spacing.md },
    ctaBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
    ctaTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.lg, lineHeight: 22 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: BRAND_RED, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignSelf: 'flex-start', paddingHorizontal: Spacing.lg },
    ctaButtonText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF' },
});