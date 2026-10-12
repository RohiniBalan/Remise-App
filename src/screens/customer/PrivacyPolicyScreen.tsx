import React, { useRef, useEffect } from 'react';
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
import { useTranslation } from '../../i18n';
import { getPrivacyPolicyData } from '../../i18n/policyTranslations';

// Ported from client/app/privacy/page.tsx — uses website brand red (#FF0000).

const BRAND_RED = CustomerColors.primary;

const SECTION_ICONS: Record<string, React.ElementType> = {
    collect: Database,
    'voice-scan': Mic,
    use: Settings2,
    payments: CreditCard,
    sharing: Share2,
    security: Lock,
    retention: Clock,
    rights: UserCheck,
    children: Baby,
    changes: RefreshCw,
    contact: Mail,
};

const CATEGORY_ICONS: React.ElementType[] = [
    User,
    Fingerprint,
    Store,
    Package,
    MapPin,
    Smartphone,
];

const SHARE_ICONS: React.ElementType[] = [
    Store,
    CreditCard,
    Package,
    Database,
    Mail,
    ShieldCheck,
];

const RIGHTS_ICONS: React.ElementType[] = [
    Eye,
    Pencil,
    RotateCcw,
    Trash2,
    Ban,
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
    const { language } = useTranslation();
    const policy = getPrivacyPolicyData(language);
    const navigation = useNavigation<any>();
    const scrollRef = useRef<ScrollView>(null);
    const offsets = useRef<Record<string, number>>({});

    useEffect(() => {
        navigation.setOptions({ title: policy.title });
    }, [navigation, policy.title]);

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

    const getSectionTitle = (id: string, fallback: string) => {
        return policy.sections.find((s) => s.id === id)?.title || fallback;
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
                {policy.sections.map((s) => {
                    const Icon = SECTION_ICONS[s.id] || Database;
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
                        <Text style={styles.badgeText}>{policy.lastUpdatedLabel} {policy.lastUpdatedDate}</Text>
                    </View>
                    <Text style={[styles.heroTitle, { color: textPri }]}>{policy.title}</Text>
                    <Text style={[styles.heroSubtitle, { color: textSec }]}>
                        {policy.subtitle}
                    </Text>
                </View>

                {/* WHAT WE COLLECT */}
                <View style={styles.section} onLayout={registerOffset('collect')}>
                    <SectionHeading title={getSectionTitle('collect', 'Information We Collect')} Icon={Database} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {language === 'ta'
                            ? 'நாங்கள் நீங்கள் நேரடியாக வழங்கும் தகவல்கள், சேவையைப் பயன்படுத்தும்போது தானாக சேகரிக்கப்படும் தகவல்களைச் சேகரிக்கிறோம்.'
                            : language === 'te'
                            ? 'మీరు మాకు నేరుగా అందించే సమాచారం, రెమిస్‌ను ఉపయోగించినప్పుడు స్వయంచాలకంగా సేకరించబడే సమాచారాన్ని మేము సేకరిస్తాము.'
                            : language === 'ml'
                            ? 'നിങ്ങൾ ഞങ്ങൾക്ക് നേരിട്ട് നൽകുന്ന വിവരങ്ങളും സേവനം ഉപയോഗിക്കുമ്പോൾ ശേഖരിക്കുന്ന വിവരങ്ങളും ഞങ്ങൾ ശേഖരിക്കുന്നു.'
                            : language === 'kn'
                            ? 'ನೀವು ನಮಗೆ ನೇರವಾಗಿ ಒದಗಿಸುವ ಮಾಹಿತಿ ಮತ್ತು ಸೇವೆಯನ್ನು ಬಳಸುವಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾದ ಮಾಹಿತಿಯನ್ನು ನಾವು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.'
                            : language === 'hi'
                            ? 'हम आपके द्वारा प्रदान की गई जानकारी और सेवा का उपयोग करते समय स्वचालित रूप से एकत्रित जानकारी एकत्र करते हैं।'
                            : 'We collect information you provide directly to us, information collected automatically when you use Remise, and information from third-party services.'}
                    </Text>
                    {policy.dataCategories.map((c, idx) => (
                        <InfoCard key={c.title} title={c.title} icon={CATEGORY_ICONS[idx] || User} items={c.items} note={c.note} cardBg={cardBg} borderColor={borderColor} textPri={textPri} textSec={textSec} iconBg={iconBg} />
                    ))}
                </View>

                {/* VOICE & SCANNING */}
                <View style={styles.section} onLayout={registerOffset('voice-scan')}>
                    <SectionHeading title={policy.voiceScanTitle} Icon={Mic} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            {policy.voiceScanBlurb}
                        </Text>
                        <View style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <Text style={[styles.bulletText, { color: textPri }]}>
                                {policy.voiceFeatureTitle}: {policy.voiceFeatureDesc}
                            </Text>
                        </View>
                        <View style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <Text style={[styles.bulletText, { color: textPri }]}>
                                {policy.scanFeatureTitle}: {policy.scanFeatureDesc}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* HOW WE USE */}
                <View style={styles.section} onLayout={registerOffset('use')}>
                    <SectionHeading title={getSectionTitle('use', 'How We Use Information')} Icon={Settings2} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        {policy.useItems.map((u) => (
                            <View key={u} style={styles.bulletRow}>
                                <View style={styles.bulletDot} />
                                <Text style={[styles.bulletText, { color: textPri }]}>{u}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* PAYMENTS */}
                <View style={styles.section} onLayout={registerOffset('payments')}>
                    <SectionHeading title={policy.paymentsTitle} Icon={CreditCard} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            {policy.paymentsBlurb}
                        </Text>
                        <View style={styles.calloutRow}>
                            <Lock size={16} color={BRAND_RED} style={{ marginTop: 2 }} />
                            <Text style={[styles.calloutText, { color: textPri }]}>
                                {policy.razorpayTitle}: {policy.razorpayDesc} {policy.upiDesc}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* INFORMATION SHARING */}
                <View style={styles.section} onLayout={registerOffset('sharing')}>
                    <SectionHeading title={getSectionTitle('sharing', 'Information Sharing')} Icon={Share2} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {language === 'ta'
                            ? 'எங்கள் சேவைகளை வழங்கவும் தளத்தை இயக்கவும் தேவையான தகவல்களை மட்டுமே நாங்கள் பகிர்ந்து கொள்கிறோம்:'
                            : language === 'te'
                            ? 'మా సేవలను అందించడానికి మరియు ప్లాట్‌ఫారమ్‌ను నిర్వహించడానికి అవసరమైన సమాచారాన్ని మాత్రమే మేము పంచుకుంటాము:'
                            : language === 'ml'
                            ? 'ഞങ്ങളുടെ സേവനങ്ങൾ നൽകുന്നതിനും പ്ലാറ്റ്ഫോം പ്രവർത്തിപ്പിക്കുന്നതിനും ആവശ്യമായ വിവരങ്ങൾ മാത്രമേ ഞങ്ങൾ പങ്കിടൂ:'
                            : language === 'kn'
                            ? 'ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಮತ್ತು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅನ್ನು ನಿರ್ವಹಿಸಲು ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ನಾವು ಹಂಚಿಕೊಳ್ಳುತ್ತೇವೆ:'
                            : language === 'hi'
                            ? 'हम अपनी सेवाएं प्रदान करने और प्लेटफ़ॉर्म संचालित करने के लिए आवश्यक जानकारी ही साझा करते हैं:'
                            : 'We share information only as necessary to provide our services and operate the platform:'}
                    </Text>
                    {policy.shareWith.map((s, idx) => {
                        const Icon = SHARE_ICONS[idx] || Store;
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
                    <SectionHeading title={policy.securityTitle} Icon={Lock} textColor={textPri} iconBg={iconBg} />
                    <View style={[styles.plainCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.prose, { color: textSec }]}>
                            {policy.securityBlurb}
                        </Text>
                        {policy.securityPoints.map((pt, pi) => (
                            <View key={pi} style={styles.bulletRow}>
                                <View style={styles.bulletDot} />
                                <Text style={[styles.bulletText, { color: textPri }]}>{pt}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* RETENTION */}
                <View style={styles.section} onLayout={registerOffset('retention')}>
                    <SectionHeading title={policy.retentionTitle} Icon={Clock} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {policy.retentionBlurb}
                    </Text>
                    {policy.retentionReasons.map((r) => (
                        <View key={r} style={[styles.retentionRow, { backgroundColor: cardBg, borderColor }]}>
                            <Text style={[styles.retentionText, { color: textPri }]}>{r}</Text>
                        </View>
                    ))}
                </View>

                {/* YOUR RIGHTS */}
                <View style={styles.section} onLayout={registerOffset('rights')}>
                    <SectionHeading title={getSectionTitle('rights', 'Your Rights')} Icon={UserCheck} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {language === 'ta'
                            ? 'பொருந்தக்கூடிய சட்டத்தைப் பொறுத்து, உங்கள் தனிப்பட்ட தகவல்கள் தொடர்பாக உங்களுக்கு உரிமைகள் இருக்கலாம்:'
                            : language === 'te'
                            ? 'వర్తించే చట్టం ఆధారంగా, మీ వ్యక్తిగత సమాచారానికి సంబంధించి మీకు హక్కులు ఉండవచ్చు:'
                            : language === 'ml'
                            ? 'ബാധകമായ നിയമത്തെ ആശ്രയിച്ച്, നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങൾ സംബന്ധിച്ച് നിങ്ങൾക്ക് അവകാശങ്ങൾ ഉണ്ടായേക്കാം:'
                            : language === 'kn'
                            ? 'ಅನ್ವಯವಾಗುವ ಕಾನೂನನ್ನು ಆಧರಿಸಿ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ನೀವು ಹಕ್ಕುಗಳನ್ನು ಹೊಂದಿರಬಹುದು:'
                            : language === 'hi'
                            ? 'लागू कानून के आधार पर, आपके पास अपनी व्यक्तिगत जानकारी के संबंध में अधिकार हो सकते हैं:'
                            : 'Depending on applicable law, you may have rights regarding your personal information, including requesting the following. Some information may need to be retained where required by law.'}
                    </Text>
                    <View style={styles.rightsGrid}>
                        {policy.rights.map((r, idx) => {
                            const Icon = RIGHTS_ICONS[idx] || Eye;
                            const isLast = idx === policy.rights.length - 1;
                            return (
                                <View
                                    key={r.title}
                                    style={[
                                        styles.rightCard,
                                        isLast ? styles.rightCardFull : styles.rightCardHalf,
                                        { backgroundColor: cardBg, borderColor },
                                    ]}
                                >
                                    <View style={[styles.infoCardIcon, { backgroundColor: iconBg }, isLast && { marginBottom: 0 }]}>
                                        <Icon size={16} color={BRAND_RED} />
                                    </View>
                                    <View style={isLast ? styles.rightContentFull : styles.rightContentHalf}>
                                        <Text style={[styles.rightTitle, isLast && styles.rightTitleFull, { color: textPri }]}>
                                            {r.title}
                                        </Text>
                                        <Text style={[styles.rightDesc, isLast && styles.rightDescFull, { color: textSec }]}>
                                            {r.desc}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* CHILDREN */}
                <View style={styles.section} onLayout={registerOffset('children')}>
                    <SectionHeading title={policy.childrenTitle} Icon={Baby} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {policy.childrenBlurb}
                    </Text>
                </View>

                {/* CHANGES */}
                <View style={styles.section} onLayout={registerOffset('changes')}>
                    <SectionHeading title={policy.changesTitle} Icon={RefreshCw} textColor={textPri} iconBg={iconBg} />
                    <Text style={[styles.prose, { color: textSec }]}>
                        {policy.changesBlurb}
                    </Text>
                </View>

                {/* CONTACT CTA */}
                <View style={styles.section} onLayout={registerOffset('contact')}>
                    <View style={[styles.ctaCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
                        <View style={styles.ctaBadge}>
                            <Mail size={12} color="#FFFFFF" />
                            <Text style={styles.ctaBadgeText}>{language === 'ta' ? 'உங்கள் தரவு பற்றிய கேள்விகள் உள்ளதா?' : language === 'te' ? 'మీ డేటా గురించి ప్రశ్నలు ఉన్నాయా?' : language === 'ml' ? 'നിങ്ങളുടെ ഡാറ്റയെക്കുറിച്ച് ചോദ്യങ്ങളുണ്ടോ?' : language === 'kn' ? 'ನಿಮ್ಮ ಡೇಟಾ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?' : language === 'hi' ? 'क्या आपके डेटा के बारे में कोई प्रश्न हैं?' : 'Questions about your data?'}</Text>
                        </View>
                        <Text style={[styles.ctaTitle, { color: textPri }]}>
                            {policy.contactTitle}
                        </Text>
                        <Text style={[styles.ctaSubtitle, { color: textSec }]}>
                            {policy.contactBlurb}
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => navigation.navigate('HelpCenter')}
                            activeOpacity={0.85}
                        >
                            <Mail size={16} color="#FFFFFF" />
                            <Text style={styles.ctaButtonText}>{language === 'ta' ? 'தொடர்பு கொள்ள' : language === 'te' ? 'సంప్రదించండి' : language === 'ml' ? 'ബന്ധപ്പെടുക' : language === 'kn' ? 'ಸಂಪರ್ಕಿಸಿ' : language === 'hi' ? 'संपर्क करें' : 'Get in touch'}</Text>
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
        maxWidth: '100%',
        borderWidth: 1, borderColor: 'rgba(255,0,0,0.35)', borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.md, paddingVertical: 6, marginBottom: Spacing.md,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1 },
    heroTitle: { fontSize: FontSizes.xl ?? 28, fontWeight: '900', color: '#FFFFFF', marginBottom: Spacing.sm },
    heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20 },

    section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },

    sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    headingIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
    sectionHeadingText: { flex: 1, fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF' },

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
    rightCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
    rightCardHalf: { width: '48.5%', alignItems: 'center' },
    rightCardFull: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    rightContentHalf: { alignItems: 'center' },
    rightContentFull: { flex: 1 },
    rightTitle: { fontSize: FontSizes.xs, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
    rightTitleFull: { textAlign: 'left', marginTop: 0, fontSize: FontSizes.sm },
    rightDesc: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 3, lineHeight: 15 },
    rightDescFull: { textAlign: 'left', marginTop: 2 },

    ctaCard: { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,0,0,0.4)', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center' },
    ctaBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: BRAND_RED, alignSelf: 'center', maxWidth: '100%', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginBottom: Spacing.md },
    ctaBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', flexShrink: 1, textAlign: 'center' },
    ctaTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.xs, lineHeight: 22, textAlign: 'center' },
    ctaSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', marginBottom: Spacing.lg, lineHeight: 19, textAlign: 'center' },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: BRAND_RED, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignSelf: 'center', paddingHorizontal: Spacing.lg },
    ctaButtonText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
});