import React, { useState, useEffect } from 'react';
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
import { useTranslation } from '../../i18n';
import { getTermsData, ArticleItem, ArticleBlock } from '../../i18n/termsTranslations';

// Ported from client/app/terms/page.tsx — uses website brand red (#FF0000).

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAND_RED = CustomerColors.primary;

const ARTICLE_ICONS: Record<number, React.ElementType> = {
    1: Info,
    2: UserCog,
    3: ShoppingBag,
    4: Store,
    5: ClipboardList,
    6: IndianRupee,
    7: Package,
    8: Truck,
    9: CreditCard,
    10: RotateCcw,
    11: Ban,
    12: Copyright,
    13: Plug,
    14: UserX,
    15: ShieldAlert,
    16: Settings2,
    17: FileEdit,
    18: Scale,
    19: Mail,
};

const HIGHLIGHT_ICONS: React.ElementType[] = [
    UserCog,
    Store,
    IndianRupee,
    Truck,
    Scale,
];function ArticleBlocks({ blocks, textPri, textSec }: { blocks: ArticleBlock[]; textPri?: string; textSec?: string }) {
    return (
        <>
            {blocks.map((b, i) => {
                if (b.type === 'ul' && b.items) {
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
    article: ArticleItem;
    isOpen: boolean;
    onToggle: () => void;
    borderColor?: string;
    textPri?: string;
    textSec?: string;
    iconBg?: string;
}) {
    const Icon = ARTICLE_ICONS[article.n] || Info;
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
    const { language } = useTranslation();
    const terms = getTermsData(language);
    const navigation = useNavigation<any>();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set([1]));

    useEffect(() => {
        navigation.setOptions({ title: terms.heroTitle });
    }, [navigation, terms.heroTitle]);

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
        setOpenSet(new Set(terms.articles.map((a) => a.n)));
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
                    <Text style={styles.badgeText}>{terms.lastUpdatedLabel} {terms.lastUpdatedDate}</Text>
                </View>
                <Text style={[styles.heroTitle, { color: textPri }]}>{terms.heroTitle}</Text>
                <Text style={[styles.heroSubtitle, { color: textSec }]}>
                    {terms.heroSubtitle}
                </Text>
            </View>

            {/* THE GIST */}
            <View style={styles.section}>
                <Text style={[styles.h2, { color: textPri }]}>{terms.highlightsTitle}</Text>
                <Text style={[styles.h2Sub, { color: textSec }]}>{terms.highlightsSubtitle}</Text>
                {terms.highlights.map((h, idx) => {
                    const Icon = HIGHLIGHT_ICONS[idx] || UserCog;
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
                    <Text style={[styles.h2, { color: textPri }]}>{language === 'ta' ? 'பொருளடக்கம்' : language === 'te' ? 'విషయ సూచిక' : language === 'ml' ? 'സൂചിക' : language === 'kn' ? 'ಪರಿವಿಡಿ' : language === 'hi' ? 'विषय - सूची' : 'Index'}</Text>
                    <View style={styles.indexBtnRow}>
                        <TouchableOpacity style={[styles.pillBtn, { backgroundColor: cardBg, borderColor }]} onPress={expandAll} activeOpacity={0.75}>
                            <Text style={[styles.pillBtnText, { color: textPri }]}>{language === 'ta' ? 'அனைத்தும் விரிவாக்கு' : language === 'te' ? 'అన్నీ విస్తరించండి' : language === 'ml' ? 'എല്ലാം വികസിപ്പിക്കുക' : language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ವಿಸ್ತರಿಸಿ' : language === 'hi' ? 'सभी विस्तृत करें' : 'Expand all'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.pillBtn, { backgroundColor: cardBg, borderColor }]} onPress={collapseAll} activeOpacity={0.75}>
                            <Text style={[styles.pillBtnText, { color: textPri }]}>{language === 'ta' ? 'அனைத்தும் சுருக்கு' : language === 'te' ? 'అన్నీ కుదించండి' : language === 'ml' ? 'എല്ലാം ചുരുക്കുക' : language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ಕುಗ್ಗಿಸಿ' : language === 'hi' ? 'सभी संक्षिप्त करें' : 'Collapse all'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.indexGrid, { borderColor }]}>
                    {terms.articles.map((a) => (
                        <TouchableOpacity
                            key={a.n}
                            style={[styles.indexItem, { backgroundColor: cardBg, borderBottomColor: borderColor }]}
                            onPress={() => openArticle(a.n)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.indexNumber}>{a.n}</Text>
                            <Text style={[styles.indexTitle, { color: textPri }]}>{a.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* FULL TERMS */}
            <View style={styles.section}>
                <Text style={[styles.h2, styles.fullTermsHeading, { color: textPri }]}>{language === 'ta' ? 'முழு விதிமுறைகள்' : language === 'te' ? 'పూర్తి నిబంధనలు' : language === 'ml' ? 'പൂർണ്ണ നിബന്ധനകൾ' : language === 'kn' ? 'ಸಂಪೂರ್ಣ ನಿಯಮಗಳು' : language === 'hi' ? 'पूर्ण शर्तें' : 'Full terms'}</Text>
                <View style={[styles.articlesCard, { backgroundColor: cardBg, borderColor }]}>
                    {terms.articles.map((a) => (
                        <ArticleRow key={a.n} article={a} isOpen={openSet.has(a.n)} onToggle={() => toggle(a.n)} borderColor={borderColor} textPri={textPri} textSec={textSec} iconBg={iconBg} />
                    ))}
                </View>
            </View>

            {/* CONTACT CTA */}
            <View style={styles.section}>
                <View style={[styles.ctaCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#fee2e2' }]}>
                    <View style={styles.ctaBadge}>
                        <Mail size={12} color="#FFFFFF" />
                        <Text style={styles.ctaBadgeText}>{terms.contactTag}</Text>
                    </View>
                    <Text style={[styles.ctaTitle, { color: textPri }]}>{terms.contactTitle}</Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => navigation.navigate('HelpCenter')}
                        activeOpacity={0.85}
                    >
                        <Mail size={16} color="#FFFFFF" />
                        <Text style={styles.ctaButtonText}>{terms.contactButton}</Text>
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
        maxWidth: '100%',
        borderWidth: 1, borderColor: 'rgba(255,0,0,0.35)', borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.md, paddingVertical: 6, marginBottom: Spacing.md,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1 },
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

    indexHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    indexBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        flexWrap: 'wrap',
    },
    pillBtn: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: BorderRadius.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    pillBtnText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB' },

    fullTermsHeading: {
        marginBottom: Spacing.md,
    },

    indexGrid: { borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.md, overflow: 'hidden' },
    indexItem: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#111',
    },
    indexNumber: { fontSize: 12, fontWeight: '800', color: BRAND_RED, minWidth: 22 },
    indexTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', color: '#D1D5DB' },

    articlesCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md },
    articleRow: { borderBottomWidth: 1, borderBottomColor: '#222' },
    articleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.md },
    articleNumber: { fontSize: 22, fontWeight: '300', color: '#374151', width: 34 },
    articleNumberActive: { color: BRAND_RED },
    articleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    articleTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF' },
    articleSummary: { fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 2 },
    toggleCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginTop: 2 },

    articleBody: { paddingLeft: 34, paddingBottom: Spacing.md },
    articleParagraph: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 19, marginBottom: Spacing.sm },
    boldInline: { fontWeight: '800', color: '#E5E7EB' },

    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: 6 },
    bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND_RED, marginTop: 7 },
    bulletText: { flex: 1, fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 19 },

    ctaCard: { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,0,0,0.4)', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center' },
    ctaBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: BRAND_RED, alignSelf: 'center', maxWidth: '100%', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginBottom: Spacing.md },
    ctaBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', flexShrink: 1, textAlign: 'center' },
    ctaTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.lg, lineHeight: 22, textAlign: 'center' },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: BRAND_RED, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignSelf: 'center', paddingHorizontal: Spacing.lg },
    ctaButtonText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
});