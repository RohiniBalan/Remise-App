import React, { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    ShieldCheck,
    Lock,
    User,
    MapPin,
    Store,
    Package,
    Smartphone,
    Mic,
    ScanLine,
    Settings2,
    Share2,
    Database,
    Clock,
    UserCheck,
    Baby,
    RefreshCw,
    Mail,
    ArrowRight,
    Eye,
    Pencil,
    RotateCcw,
    Trash2,
    Ban,
    CreditCard,
    QrCode,
    Fingerprint,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

// Ported from client/app/privacy/page.tsx — uses website brand red (#FF0000).

const BRAND_RED = CustomerColors.primary;
const LAST_UPDATED = '20 August 2026';

const SECTIONS = [
    { id: 'collect', navLabel: 'What we collect', title: 'Information We Collect', icon: Database },
    { id: 'voice-scan', navLabel: 'Voice & scanning', title: 'Voice and Scanning Features', icon: Mic },
    { id: 'use', navLabel: 'How we use it', title: 'How We Use Information', icon: Settings2 },
    { id: 'payments', navLabel: 'Payments', title: 'Payments', icon: CreditCard },
    { id: 'sharing', navLabel: 'Who we share with', title: 'Information Sharing', icon: Share2 },
    { id: 'security', navLabel: 'Security', title: 'Data Security', icon: Lock },
    { id: 'retention', navLabel: 'Retention', title: 'Data Retention', icon: Clock },
    { id: 'rights', navLabel: 'Your rights', title: 'Your Rights', icon: UserCheck },
    { id: 'children', navLabel: 'Children', title: "Children's Privacy", icon: Baby },
    { id: 'changes', navLabel: 'Policy changes', title: 'Policy Changes', icon: RefreshCw },
    { id: 'contact', navLabel: 'Contact', title: 'Contact', icon: Mail },
];

const DATA_CATEGORIES = [
    { title: 'Account information', icon: User, items: ['Name', 'Email address', 'Mobile number', 'Password / authentication information'] },
    { title: 'Profile information', icon: Fingerprint, items: ['Profile photo', 'Address', 'Location information', 'Account preferences'] },
    { title: 'Seller information', icon: Store, items: ['Store name & address', 'Business information', 'Product & pricing information', 'Stock information', 'Payment / UPI details'], note: 'Collected for Store Owners, Wholesalers, and Home Businesses.' },
    { title: 'Order information', icon: Package, items: ['Products ordered', 'Quantities & prices', 'Store selected', 'Delivery method', 'Order status', 'Transaction information'] },
    { title: 'Location information', icon: MapPin, items: ['Used to find nearby stores', 'Calculate store distance', 'Support delivery'], note: 'Only collected with your permission.' },
    { title: 'Device & technical information', icon: Smartphone, items: ['Device type & OS', 'IP address', 'App / browser information', 'Diagnostic information'] },
];

const USE_ITEMS = [
    'Create and manage accounts', 'Process orders', 'Compare nearby stores', 'Calculate prices',
    'Process payments', 'Facilitate delivery or pickup', 'Manage products and inventory',
    'Send order notifications', 'Prevent fraud and misuse', 'Provide customer support',
    'Improve our services', 'Maintain security', 'Comply with legal requirements',
];

const SHARE_WITH = [
    { title: 'Sellers', desc: 'To fulfil the order you place.', icon: Store },
    { title: 'Payment providers', desc: 'To process your payment securely.', icon: CreditCard },
    { title: 'Delivery partners', desc: 'To get your order to you.', icon: Package },
    { title: 'Hosting & technology providers', desc: 'To keep Remise running.', icon: Database },
    { title: 'Customer support providers', desc: 'To help resolve your queries.', icon: Mail },
    { title: 'Authorities', desc: 'Only when required by law.', icon: ShieldCheck },
];

const RIGHTS = [
    { title: 'Access', desc: 'Request a copy of what we hold about you.', icon: Eye },
    { title: 'Correction', desc: "Fix information that's inaccurate.", icon: Pencil },
    { title: 'Update', desc: 'Keep your details current.', icon: RotateCcw },
    { title: 'Deletion', desc: 'Ask us to remove your information.', icon: Trash2 },
    { title: 'Withdrawal', desc: "Withdraw certain permissions you've given.", icon: Ban },
];

const RETENTION_REASONS = [
    'Provide our services', 'Maintain account and transaction records', 'Resolve disputes',
    'Meet legal and regulatory requirements', 'Prevent fraud',
];

function SectionHeading({ title, Icon, textColor, iconBg }: { title: string; Icon: React.ElementType; textColor?: string; iconBg?: string }) {
    return (
        <View style={styles.sectionHeadingRow}>
            <View style={[styles.headingIcon, iconBg ? { backgroundColor: iconBg } : undefined]}>
                <Icon size={18} color={BRAND_RED} />
            </View>
            <Text style={[styles.sectionHeadingText, textColor ? { color: textColor } : undefined]}>{title}</Text>
        </View>
    );
}

function InfoCard({ title, icon: Icon, items, note, cardBg, borderColor, textPri, textSec, iconBg }: { title: string; icon: React.ElementType; items: string[]; note?: string; cardBg?: string; borderColor?: string; textPri?: string; textSec?: string; iconBg?: string }) {
    return (
        <View style={[styles.infoCard, cardBg ? { backgroundColor: cardBg, borderColor } : undefined]}>
            <View style={[styles.infoCardIcon, iconBg ? { backgroundColor: iconBg } : undefined]}>
                <Icon size={16} color={BRAND_RED} />
            </View>
            <Text style={[styles.infoCardTitle, textPri ? { color: textPri } : undefined]}>{title}</Text>
            {items.map((it) => (
                <View key={it} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={[styles.bulletText, textSec ? { color: textSec } : undefined]}>{it}</Text>
                </View>
            ))}
            {note && <Text style={[styles.infoCardNote, textSec ? { color: textSec, borderTopColor: borderColor } : undefined]}>{note}</Text>}
        </View>
    );
}

export default function PrivacyPolicyScreen() {
    const { isDark } = useTheme();
    const navigation = useNavigation<any>();
    const scrollRef = useRef<ScrollView>(null);
    const offsets = useRef<Record<string, number>>({});

    const cardBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1F2937' : '#e2e8f0';
    const textPri = isDark ? '#F9FAFB' : '#0f172a';
    const textSec = isDark ? '#9CA3AF' : '#64748b';
    const iconBg = isDark ? 'rgba(255, 0, 0, 0.15)' : '#fef2f2';
    const bg = isDark ? '#0b0f19' : '#f8fafc';

    const registerOffset = (id: string) => (e: any) => {
        offsets.current[id] = e.nativeEvent.layout.y;
    };

    const scrollTo = (id: string) => {
        const y = offsets.current[id];
        if (y != null && scrollRef.current) {
            scrollRef.current.scrollTo({ y: y - 12, animated: true });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* Sticky chip nav */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.chipNav, { backgroundColor: bg, borderBottomColor: borderColor }]}
                contentContainerStyle={styles.chipNavContent}
            >
                {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.chip, { backgroundColor: cardBg, borderColor }]}
                            onPress={() => scrollTo(s.id)}
                            activeOpacity={0.75}
                        >
                            <Icon size={13} color={BRAND_RED} />
                            <Text style={[styles.chipText, { color: textPri }]}>{s.navLabel}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
                {/* HERO */}
                <View style={styles.hero}>
                    <View style={[styles.badge, { backgroundColor: iconBg }]}>
                        <ShieldCheck size={13} color={BRAND_RED} />
                        <Text style={styles.badgeText}>Last updated {LAST_UPDATED}</Text>
                    </View>
                    <Text style={[styles.heroTitle, { color: textPri }]}>Privacy Policy</Text>
                    <Text style={[styles.heroSubtitle, { color: textSec }]}>
                        This explains what Remise collects, how it's used, who it's shared with, and the
                        choices you have regarding your information.
                    </Text>
                </View>

                {/* WHAT WE COLLECT */}
                <View style={styles.section} onLayout={registerOffset('collect')}>
                    <SectionHeading title="Information We Collect" Icon={Database} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        We collect information you provide directly to us, information collected
                        automatically when you use Remise, and information from third-party services.
                    </Text>
                    {DATA_CATEGORIES.map((c) => (
                        <InfoCard key={c.title} title={c.title} icon={c.icon} items={c.items} note={c.note} cardBg={cardBg} borderColor={borderColor} textPri={textPri} textSec={textSec} iconBg={iconBg} />
                    ))}
                </View>

                {/* VOICE & SCANNING */}
                <View style={styles.section} onLayout={registerOffset('voice-scan')}>
                    <SectionHeading title="Voice and Scanning Features" Icon={Mic} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            If you use voice search or product barcode/image scanning:
                        </Text>
                        <View style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <Text style={[styles.bulletText, { color: textPri }]}>
                                Voice data is processed to convert your speech to text for search queries.
                            </Text>
                        </View>
                        <View style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <Text style={[styles.bulletText, { color: textPri }]}>
                                Camera input is processed to identify products or barcodes you scan.
                            </Text>
                        </View>
                        <Text style={[styles.smallNote, { color: textSec }]}>
                            These features are optional and only used when you interact with them.
                        </Text>
                    </View>
                </View>

                {/* HOW WE USE */}
                <View style={styles.section} onLayout={registerOffset('use')}>
                    <SectionHeading title="How We Use Information" Icon={Settings2} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        {USE_ITEMS.map((u) => (
                            <View key={u} style={styles.bulletRow}>
                                <View style={styles.bulletDot} />
                                <Text style={[styles.bulletText, { color: textPri }]}>{u}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* PAYMENTS */}
                <View style={styles.section} onLayout={registerOffset('payments')}>
                    <SectionHeading title="Payments" Icon={CreditCard} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            Payment transactions on Remise are handled through authorized payment gateway
                            providers and banking channels. Remise does not store your full card numbers, CVVs,
                            or UPI PINs.
                        </Text>
                        <View style={styles.calloutRow}>
                            <Lock size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
                            <Text style={[styles.calloutText, { color: textPri }]}>
                                Payment details are encrypted and securely transmitted to regulated payment
                                aggregators.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* INFORMATION SHARING */}
                <View style={styles.section} onLayout={registerOffset('sharing')}>
                    <SectionHeading title="Information Sharing" Icon={Share2} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        We share information only as necessary to provide our services and operate the
                        platform:
                    </Text>
                    {SHARE_WITH.map((s) => {
                        const Icon = s.icon;
                        return (
                            <View key={s.title} style={[styles.shareRow, { backgroundColor: cardBg, borderColor }]}>
                                <View style={[styles.infoCardIcon, { backgroundColor: iconBg }]}>
                                    <Icon size={16} color={BRAND_RED} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.shareTitle, { color: textPri }]}>{s.title}</Text>
                                    <Text style={[styles.shareDesc, { color: textSec }]}>{s.desc}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* SECURITY */}
                <View style={styles.section} onLayout={registerOffset('security')}>
                    <SectionHeading title="Data Security" Icon={Lock} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            We implement appropriate technical and organisational measures designed to
                            protect your personal information against unauthorised access, alteration,
                            disclosure, or destruction.
                        </Text>
                    </View>
                </View>

                {/* RETENTION */}
                <View style={styles.section} onLayout={registerOffset('retention')}>
                    <SectionHeading title="Data Retention" Icon={Clock} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        We retain personal information for as long as necessary to:
                    </Text>
                    {RETENTION_REASONS.map((r) => (
                        <View key={r} style={[styles.retentionRow, { backgroundColor: cardBg, borderColor }]}>
                            <Text style={[styles.retentionText, { color: textPri }]}>{r}</Text>
                        </View>
                    ))}
                </View>

                {/* YOUR RIGHTS */}
                <View style={styles.section} onLayout={registerOffset('rights')}>
                    <SectionHeading title="Your Rights" Icon={UserCheck} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        Depending on applicable law, you may have rights regarding your personal
                        information, including requesting the following. Some information may need to be
                        retained where required by law.
                    </Text>
                    <View style={styles.rightsGrid}>
                        {RIGHTS.map((r) => {
                            const Icon = r.icon;
                            return (
                                <View key={r.title} style={[styles.rightCard, { backgroundColor: cardBg, borderColor }]}>
                                    <View style={[styles.infoCardIcon, { backgroundColor: iconBg }]}>
                                        <Icon size={16} color={BRAND_RED} />
                                    </View>
                                    <Text style={[styles.rightTitle, { color: textPri }]}>{r.title}</Text>
                                    <Text style={[styles.rightDesc, { color: textSec }]}>{r.desc}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* CHILDREN */}
                <View style={styles.section} onLayout={registerOffset('children')}>
                    <SectionHeading title="Children's Privacy" Icon={Baby} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        Remise is not intended for children who are not legally permitted to use the
                        service. We do not knowingly collect personal information from children in
                        violation of applicable law.
                    </Text>
                </View>

                {/* CHANGES */}
                <View style={styles.section} onLayout={registerOffset('changes')}>
                    <SectionHeading title="Policy Changes" Icon={RefreshCw} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        We may update this Privacy Policy from time to time. Changes will be published
                        through the application or website.
                    </Text>
                </View>

                {/* CONTACT CTA */}
                <View style={styles.section} onLayout={registerOffset('contact')}>
                    <View style={[styles.ctaCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
                        <View style={styles.ctaBadge}>
                            <Mail size={12} color="#FFFFFF" />
                            <Text style={styles.ctaBadgeText}>Questions about your data?</Text>
                        </View>
                        <Text style={[styles.ctaTitle, { color: textPri }]}>
                            Contact us for privacy-related questions or requests.
                        </Text>
                        <Text style={[styles.ctaSubtitle, { color: textSec }]}>
                            Reach Remise through our official Help Center inside the app.
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

    chipNav: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#0A0A0A' },
    chipNavContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1, borderColor: '#333', borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.md, paddingVertical: 8, marginRight: Spacing.sm,
    },
    chipText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB' },

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

    sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    headingIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
    sectionHeadingText: { fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF' },

    prose: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20, marginBottom: Spacing.sm },
    smallNote: { fontSize: FontSizes.xs, color: '#6B7280', marginTop: Spacing.xs },

    infoCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
    infoCardIcon: { width: 34, height: 34, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    infoCardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF', marginBottom: Spacing.xs },
    infoCardNote: { fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#222' },

    plainCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.md },

    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: 6 },
    bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND_RED, marginTop: 7 },
    bulletText: { flex: 1, fontSize: FontSizes.xs, color: '#D1D5DB', lineHeight: 17 },

    calloutRow: { flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderColor: 'rgba(255,0,0,0.3)', backgroundColor: 'rgba(255,0,0,0.05)', borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.sm },
    calloutText: { flex: 1, fontSize: FontSizes.xs, color: '#E5E7EB', lineHeight: 17 },

    shareRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
    shareTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF' },
    shareDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 2 },

    retentionRow: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.xs },
    retentionText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#D1D5DB' },

    rightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
    rightCard: { width: '31%', backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm },
    rightTitle: { fontSize: FontSizes.xs, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
    rightDesc: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 2, lineHeight: 13 },

    ctaCard: { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,0,0,0.4)', borderRadius: BorderRadius.lg, padding: Spacing.lg },
    ctaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: BRAND_RED, alignSelf: 'flex-start', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginBottom: Spacing.md },
    ctaBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
    ctaTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.xs, lineHeight: 22 },
    ctaSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', marginBottom: Spacing.lg, lineHeight: 19 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: BRAND_RED, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignSelf: 'flex-start', paddingHorizontal: Spacing.lg },
    ctaButtonText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF' },
});