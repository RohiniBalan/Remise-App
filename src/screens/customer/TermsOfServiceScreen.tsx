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
import { useTheme } from '../../context/ThemeContext';

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
        title: 'Ordering & Acceptance',
        icon: ClipboardList,
        summary: 'Orders are offers subject to seller acceptance.',
        blocks: [
            { type: 'p', text: 'Orders placed on Remise are offers to purchase products from sellers. Orders are subject to seller acceptance, product availability, and confirmation of pricing and delivery terms.' },
        ],
    },
    {
        n: 6,
        title: 'Pricing & Availability',
        icon: IndianRupee,
        summary: 'Prices set by sellers, subject to change before confirmation.',
        blocks: [
            { type: 'p', text: 'Product prices and availability are managed by sellers and are subject to change. Prices may vary depending on customer type, bulk quantities, or promotional offers.' },
        ],
    },
    {
        n: 7,
        title: 'Bulk & Wholesale Orders',
        icon: Package,
        summary: 'Special terms for high-volume transactions.',
        blocks: [
            { type: 'p', text: 'Bulk and wholesale orders may be subject to minimum order quantities, custom pricing, and specific delivery schedules agreed upon between the buyer and seller.' },
        ],
    },
    {
        n: 8,
        title: 'Fulfillment & Delivery',
        icon: Truck,
        summary: 'Delivery timelines, pickup options, and shipping terms.',
        blocks: [
            { type: 'p', text: 'Fulfillment options include store pickup and home delivery where supported. Delivery timelines and charges are determined based on store location and fulfillment method.' },
        ],
    },
    {
        n: 9,
        title: 'Payment Terms',
        icon: CreditCard,
        summary: 'Authorized gateways, pre-paid and COD terms.',
        blocks: [
            { type: 'p', text: 'Payments are processed through secure payment gateways. Remise supports accepted payment methods including UPI, cards, and net banking. Cash on delivery is subject to seller policy.' },
        ],
    },
    {
        n: 10,
        title: 'Returns & Refunds',
        icon: RotateCcw,
        summary: 'Return eligibility, inspection, and refund processing.',
        blocks: [
            { type: 'p', text: 'Returns and refunds are governed by the platform Return Policy and individual seller terms. Eligible returns must meet condition requirements within the return window.' },
        ],
    },
    {
        n: 11,
        title: 'Prohibited Activities',
        icon: Ban,
        summary: 'Misuse, fraudulent orders, and scraping restrictions.',
        blocks: [
            { type: 'p', text: 'Users may not misuse the platform, engage in fraudulent transactions, attempt unauthorised access, or disrupt the service operations.' },
        ],
    },
    {
        n: 12,
        title: 'Intellectual Property',
        icon: Copyright,
        summary: 'Trademarks, content rights, and brand assets.',
        blocks: [
            { type: 'p', text: 'All branding, platform content, designs, and logos belong to Remise or its licensors and may not be reproduced without written permission.' },
        ],
    },
    {
        n: 13,
        title: 'Third-Party Services',
        icon: Plug,
        summary: 'Gateways, maps, and logistics integrations.',
        blocks: [
            { type: 'p', text: 'Remise integrates third-party tools such as mapping and payment providers. Use of these tools is subject to their respective terms.' },
        ],
    },
    {
        n: 14,
        title: 'Termination',
        icon: UserX,
        summary: 'Account suspension and termination grounds.',
        blocks: [
            { type: 'p', text: 'Remise reserves the right to suspend or terminate accounts that violate these Terms or engage in unlawful or fraudulent behavior.' },
        ],
    },
    {
        n: 15,
        title: 'Limitation of Liability',
        icon: ShieldAlert,
        summary: 'Platform intermediary liability scope.',
        blocks: [
            { type: 'p', text: 'Remise operates as an intermediary marketplace and is not directly liable for seller product defects, delivery delays caused by third parties, or consequential damages.' },
        ],
    },
    {
        n: 16,
        title: 'Platform Modifications',
        icon: Settings2,
        summary: 'Features and service updates.',
        blocks: [
            { type: 'p', text: 'We may modify, suspend, or improve platform features at any time to enhance the user experience.' },
        ],
    },
    {
        n: 17,
        title: 'Changes to Terms',
        icon: FileEdit,
        summary: 'Notice and acceptance of updated Terms.',
        blocks: [
            { type: 'p', text: 'We may revise these Terms periodically. Continued use of Remise following updates constitutes acceptance.' },
        ],
    },
    {
        n: 18,
        title: 'Governing Law',
        icon: Scale,
        summary: 'Applicable jurisdiction and dispute resolution.',
        blocks: [
            { type: 'p', text: 'These Terms are governed by the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in India.' },
        ],
    },
    {
        n: 19,
        title: 'Contact Information',
        icon: Mail,
        summary: 'How to reach our legal and support teams.',
        blocks: [
            { type: 'p', text: 'For questions regarding these Terms, contact us at porulontechnologies@gmail.com or via the Help Center.' },
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

function ArticleBlocks({ blocks, textPri, textSec }: { blocks: Block[]; textPri?: string; textSec?: string }) {
    return (
        <>
            {blocks.map((b, i) => {
                if (b.type === 'ul') {
                    return (
                        <View key={i} style={{ marginTop: Spacing.xs }}>
                            {b.items.map((it) => (
                                <View key={it} style={styles.bulletRow}>
                                    <View style={styles.bulletDot} />
                                    <Text style={[styles.bulletText, textSec ? { color: textSec } : undefined]}>{it}</Text>
                                </View>
                            ))}
                        </View>
                    );
                }
                return (
                    <Text key={i} style={[styles.articleParagraph, textSec ? { color: textSec } : undefined]}>
                        {b.bold ? <Text style={[styles.boldInline, textPri ? { color: textPri } : undefined]}>{b.bold} </Text> : null}
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
    borderColor,
    textPri,
    textSec,
    iconBg,
}: {
    article: Article;
    isOpen: boolean;
    onToggle: () => void;
    borderColor?: string;
    textPri?: string;
    textSec?: string;
    iconBg?: string;
}) {
    const Icon = article.icon;
    return (
        <View style={[styles.articleRow, borderColor ? { borderBottomColor: borderColor } : undefined]}>
            <TouchableOpacity style={styles.articleHeader} onPress={onToggle} activeOpacity={0.75}>
                <Text style={[styles.articleNumber, isOpen && styles.articleNumberActive]}>
                    {String(article.n).padStart(2, '0')}
                </Text>
                <View style={{ flex: 1 }}>
                    <View style={styles.articleTitleRow}>
                        <Icon size={14} color={BRAND_RED} />
                        <Text style={[styles.articleTitle, textPri ? { color: textPri } : undefined]}>{article.title}</Text>
                    </View>
                    <Text style={[styles.articleSummary, textSec ? { color: textSec } : undefined]}>{article.summary}</Text>
                </View>
                <View style={[styles.toggleCircle, borderColor ? { borderColor } : undefined]}>
                    {isOpen ? <Minus size={13} color={textSec || '#9CA3AF'} /> : <Plus size={13} color={textSec || '#9CA3AF'} />}
                </View>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.articleBody}>
                    <ArticleBlocks blocks={article.blocks} textPri={textPri} textSec={textSec} />
                </View>
            )}
        </View>
    );
}

export default function TermsOfServiceScreen() {
    const { isDark } = useTheme();
    const navigation = useNavigation<any>();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set([1]));

    const cardBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1F2937' : '#e2e8f0';
    const textPri = isDark ? '#F9FAFB' : '#0f172a';
    const textSec = isDark ? '#9CA3AF' : '#64748b';
    const iconBg = isDark ? 'rgba(255, 0, 0, 0.15)' : '#fef2f2';
    const bg = isDark ? '#0b0f19' : '#f8fafc';

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
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            {/* HERO */}
            <View style={styles.hero}>
                <View style={[styles.badge, { backgroundColor: iconBg }]}>
                    <FileText size={13} color={BRAND_RED} />
                    <Text style={styles.badgeText}>Last updated {LAST_UPDATED}</Text>
                </View>
                <Text style={[styles.heroTitle, { color: textPri }]}>Terms of Service</Text>
                <Text style={[styles.heroSubtitle, { color: textSec }]}>
                    19 short clauses covering accounts, orders, pricing, payments, and what happens if
                    something goes wrong. By using Remise, you agree to these Terms.
                </Text>
            </View>

            {/* THE GIST */}
            <View style={styles.section}>
                <Text style={[styles.h2, { color: textPri }]}>The gist</Text>
                <Text style={[styles.h2Sub, { color: textSec }]}>Not a substitute for the full Terms below — just the shape of them.</Text>
                {HIGHLIGHTS.map((h) => {
                    const Icon = h.icon;
                    return (
                        <View key={h.title} style={[styles.highlightCard, { backgroundColor: cardBg, borderColor }]}>
                            <View style={[styles.highlightIcon, { backgroundColor: iconBg }]}>
                                <Icon size={16} color={BRAND_RED} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.highlightTitle, { color: textPri }]}>{h.title}</Text>
                                <Text style={[styles.highlightDesc, { color: textSec }]}>{h.desc}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* INDEX */}
            <View style={styles.section}>
                <View style={styles.indexHeaderRow}>
                    <Text style={[styles.h2, { color: textPri }]}>Index</Text>
                    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                        <TouchableOpacity style={[styles.pillBtn, { backgroundColor: cardBg, borderColor }]} onPress={expandAll}>
                            <Text style={[styles.pillBtnText, { color: textPri }]}>Expand all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.pillBtn, { backgroundColor: cardBg, borderColor }]} onPress={collapseAll}>
                            <Text style={[styles.pillBtnText, { color: textPri }]}>Collapse all</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.indexGrid, { borderColor }]}>
                    {ARTICLES.map((a) => (
                        <TouchableOpacity
                            key={a.n}
                            style={[styles.indexItem, { backgroundColor: cardBg, borderBottomColor: borderColor }]}
                            onPress={() => openArticle(a.n)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.indexNumber}>{a.n}</Text>
                            <Text style={[styles.indexTitle, { color: textPri }]} numberOfLines={1}>{a.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* FULL TERMS */}
            <View style={styles.section}>
                <Text style={[styles.h2, { color: textPri }]}>Full terms</Text>
                <View style={[styles.articlesCard, { backgroundColor: cardBg, borderColor }]}>
                    {ARTICLES.map((a) => (
                        <ArticleRow key={a.n} article={a} isOpen={openSet.has(a.n)} onToggle={() => toggle(a.n)} borderColor={borderColor} textPri={textPri} textSec={textSec} iconBg={iconBg} />
                    ))}
                </View>
            </View>

            {/* CONTACT CTA */}
            <View style={styles.section}>
                <View style={[styles.ctaCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
                    <View style={styles.ctaBadge}>
                        <Mail size={12} color="#FFFFFF" />
                        <Text style={styles.ctaBadgeText}>Questions about these Terms?</Text>
                    </View>
                    <Text style={[styles.ctaTitle, { color: textPri }]}>Contact Remise through the official support channel.</Text>
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