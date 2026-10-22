import React, { useMemo, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
    Animated,
    Easing,
    Linking,
    Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "../../i18n";
import { getHelpCenterData } from "../../i18n/helpCenterTranslations";
import Svg, {
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
    Ellipse,
    Rect,
    Circle,
    Path,
} from "react-native-svg";
import {
    Search,
    ChevronDown,
    Rocket,
    ScanLine,
    Store,
    Package,
    Truck,
    Home as HomeIcon,
    CreditCard,
    ShieldCheck,
    Headphones,
    Mic,
    QrCode,
    Banknote,
    Landmark,
    ShoppingBag,
    MapPin,
    Lock,
    Mail,
    ArrowRight,
    CheckCircle2,
    SearchX,
    ArrowLeft,
    Sun,
    Moon,
} from "lucide-react-native";

// ─────────────────────────────────────────────────────────────────────────
// Brand tokens — same palette as the web Help Center / NavbarHome
// ─────────────────────────────────────────────────────────────────────────
const COLORS = {
    red: "#FF0000",
    redHover: "#e00000",
    redDeep: "#b30000",
    redTint: "#FFE5E5",
    redBorder: "#FFD1D1",
    redAccentDark: "#FF6B6B",
    navy: "#0f172a",
    navyBorder: "#2d3748",
    lightSurface: "#F5F5F5",
};

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FAQItem = { q: string; a: string };
type FAQSection = {
    id: string;
    title: string;
    blurb: string;
    icon: React.ComponentType<any>;
    items: FAQItem[];
};

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
    "getting-started": Rocket,
    "finding-products": ShoppingBag,
    "comparing-stores": Store,
    "orders": Package,
    "delivery": Truck,
    "payments": CreditCard,
    "sellers": Landmark,
    "account-security": ShieldCheck,
    "support": Headphones,
};

const FAQ_ICONS: Record<string, React.ComponentType<any>> = {
    "getting-started": Rocket,
    "finding-products": ShoppingBag,
    "comparing-stores": Store,
    "orders": Package,
    "account-security": ShieldCheck,
};

const ORDER_STEP_ICONS = [
    ScanLine,
    MapPin,
    Store,
    CheckCircle2,
    Truck,
    CreditCard,
    Package,
];

const DELIVERY_ICONS = [Store, Truck];

const PAYMENT_ICONS = [QrCode, CreditCard, Banknote];

// ─────────────────────────────────────────────────────────────────────────
// Small building blocks
// ─────────────────────────────────────────────────────────────────────────

function AccordionRow({
    item,
    isOpen,
    onToggle,
    isLight,
    isLast,
}: {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
    isLight: boolean;
    isLast: boolean;
}) {
    const rotate = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Animated.timing(rotate, {
            toValue: isOpen ? 0 : 1,
            duration: 220,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
        onToggle();
    };

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <View
            style={[
                styles.accordionRow,
                !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: isLight ? "rgba(255,209,209,0.6)" : "rgba(255,255,255,0.1)",
                },
            ]}
        >
            <TouchableOpacity
                onPress={handleToggle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                style={styles.accordionHeader}
            >
                <Text
                    style={[
                        styles.accordionQuestion,
                        { color: isLight ? "#1f2937" : "#e5e7eb" },
                    ]}
                >
                    {item.q}
                </Text>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <ChevronDown size={18} color={isOpen ? COLORS.red : isLight ? "#1f2937" : "#e5e7eb"} />
                </Animated.View>
            </TouchableOpacity>
            {isOpen && (
                <Text
                    style={[
                        styles.accordionAnswer,
                        { color: isLight ? "#4b5563" : "#9ca3af" },
                    ]}
                >
                    {item.a}
                </Text>
            )}
        </View>
    );
}

function SectionShell({
    title,
    blurb,
    icon: Icon,
    isLight,
    children,
    onLayout,
}: {
    title: string;
    blurb: string;
    icon: React.ComponentType<any>;
    isLight: boolean;
    children: React.ReactNode;
    onLayout?: (y: number) => void;
}) {
    return (
        <View
            onLayout={(e) => onLayout && onLayout(e.nativeEvent.layout.y)}
            style={styles.sectionShell}
        >
            <View style={styles.sectionHeaderRow}>
                <View
                    style={[
                        styles.sectionIconWrap,
                        { backgroundColor: isLight ? COLORS.redTint : "rgba(255,255,255,0.05)" },
                    ]}
                >
                    <Icon size={20} color={isLight ? COLORS.red : COLORS.redAccentDark} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: isLight ? "#111827" : "#ffffff" }]}>
                        {title}
                    </Text>
                    <Text style={[styles.sectionBlurb, { color: isLight ? "#6b7280" : "#9ca3af" }]}>
                        {blurb}
                    </Text>
                </View>
            </View>
            {children}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Hero illustration
// ─────────────────────────────────────────────────────────────────────────
function HeroIllustration() {
    const groundScale = useRef(new Animated.Value(0)).current;
    const storeIn = useRef(new Animated.Value(0)).current;
    const phoneIn = useRef(new Animated.Value(0)).current;
    const scooterIn = useRef(new Animated.Value(0)).current;
    const scooterFloat = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(groundScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
        Animated.timing(storeIn, {
            toValue: 1,
            duration: 500,
            delay: 50,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
        Animated.timing(phoneIn, {
            toValue: 1,
            duration: 500,
            delay: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
        Animated.timing(scooterIn, {
            toValue: 1,
            duration: 500,
            delay: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scooterFloat, {
                        toValue: 1,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scooterFloat, {
                        toValue: 0,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        });
    }, []);

    return (
        <View style={styles.heroIllustrationWrap}>
            <Svg width="100%" height="100%" viewBox="0 0 480 360">
                <Defs>
                    <SvgLinearGradient id="hc-red" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={COLORS.red} />
                        <Stop offset="100%" stopColor={COLORS.redDeep} />
                    </SvgLinearGradient>
                </Defs>
                <Ellipse cx={240} cy={300} rx={190} ry={16} fill="#ffffff" opacity={0.06} />
                <Rect x={60} y={150} width={150} height={110} rx={8} fill="url(#hc-red)" />
                <Rect x={60} y={150} width={150} height={26} rx={8} fill={COLORS.red} />
                <Rect x={90} y={196} width={34} height={34} rx={4} fill="#ffffff" opacity={0.9} />
                <Rect x={146} y={196} width={34} height={34} rx={4} fill="#ffffff" opacity={0.9} />
                <Rect x={118} y={240} width={34} height={20} rx={2} fill={COLORS.navy} opacity={0.4} />

                <Rect x={250} y={90} width={90} height={150} rx={16} fill="#ffffff" opacity={0.08} />
                <Rect x={262} y={106} width={66} height={118} rx={6} fill={COLORS.navy} opacity={0.5} />
                <Circle cx={295} cy={150} r={16} fill={COLORS.red} />
                <Path
                    d="M295 138 a12 12 0 0 1 12 12 c0 8 -12 22 -12 22 s-12 -14 -12 -22 a12 12 0 0 1 12 -12z"
                    fill={COLORS.red}
                />
                <Circle cx={295} cy={150} r={5} fill="#ffffff" />

                <Rect x={330} y={210} width={70} height={30} rx={10} fill="#ffffff" opacity={0.9} />
                <Rect x={345} y={188} width={26} height={26} rx={6} fill={COLORS.red} />
                <Circle cx={345} cy={252} r={12} fill={COLORS.navy} opacity={0.6} />
                <Circle cx={405} cy={252} r={12} fill={COLORS.navy} opacity={0.6} />
            </Svg>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────
export default function HelpCenterScreen() {
    const navigation = useNavigation<any>();
    const { theme, toggleTheme, isLight } = useTheme();
    const { language } = useTranslation();

    const helpData = useMemo(() => getHelpCenterData(language as any), [language]);

    const categories = useMemo(() => {
        return helpData.categories.map((c) => ({
            ...c,
            icon: CATEGORY_ICONS[c.id] || Package,
        }));
    }, [helpData]);

    const faqSections = useMemo<FAQSection[]>(() => {
        return helpData.faqSections.map((s) => ({
            ...s,
            icon: FAQ_ICONS[s.id] || Package,
        }));
    }, [helpData]);

    const orderSteps = useMemo(() => {
        return helpData.orderSteps.map((title, i) => ({
            title,
            icon: ORDER_STEP_ICONS[i] || Package,
        }));
    }, [helpData]);

    const deliveryOptions = useMemo(() => {
        return helpData.deliveryOptions.map((opt, i) => ({
            ...opt,
            icon: DELIVERY_ICONS[i] || Truck,
        }));
    }, [helpData]);

    const paymentMethods = useMemo(() => {
        return helpData.paymentMethods.map((title, i) => ({
            title,
            icon: PAYMENT_ICONS[i] || CreditCard,
        }));
    }, [helpData]);

    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState<string | null>("getting-started-0");

    const searchInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const sectionOffsets = useRef<Record<string, number>>({});

    const normalizedQuery = query.trim().toLowerCase();
    const matches = (texts: string[]) =>
        !normalizedQuery || texts.some((t) => t.toLowerCase().includes(normalizedQuery));

    const filteredFaqSections = useMemo(() => {
        if (!normalizedQuery) return faqSections;
        return faqSections.map((section) => ({
            ...section,
            items: section.items.filter((item) => matches([item.q, item.a])),
        })).filter((section) => section.items.length > 0);
    }, [normalizedQuery, faqSections]);

    const deliveryFiltered = useMemo(
        () => deliveryOptions.filter((o) => matches([o.title, o.desc])),
        [normalizedQuery, deliveryOptions],
    );
    const paymentMethodsFiltered = useMemo(
        () => paymentMethods.filter((m) => matches([m.title])),
        [normalizedQuery, paymentMethods],
    );
    const paymentNoteVisible = matches([helpData.paymentNote]);
    const sellerFeaturesFiltered = useMemo(
        () => helpData.sellerFeatures.filter((f) => matches([f])),
        [normalizedQuery, helpData.sellerFeatures],
    );
    const orderStepsFiltered = useMemo(
        () => orderSteps.filter((s) => matches([s.title])),
        [normalizedQuery, orderSteps],
    );

    const gettingStartedSection = filteredFaqSections.find((s) => s.id === "getting-started");
    const findingProductsSection = filteredFaqSections.find((s) => s.id === "finding-products");
    const comparingStoresSection = filteredFaqSections.find((s) => s.id === "comparing-stores");
    const ordersFaqSection = filteredFaqSections.find((s) => s.id === "orders");
    const accountSection = filteredFaqSections.find((s) => s.id === "account-security");

    const ordersVisible = orderStepsFiltered.length > 0 || Boolean(ordersFaqSection);
    const deliveryVisible = deliveryFiltered.length > 0;
    const paymentsVisible = paymentMethodsFiltered.length > 0 || paymentNoteVisible;
    const sellersVisible = sellerFeaturesFiltered.length > 0;

    const anyVisible =
        Boolean(gettingStartedSection) ||
        Boolean(findingProductsSection) ||
        Boolean(comparingStoresSection) ||
        ordersVisible ||
        deliveryVisible ||
        paymentsVisible ||
        sellersVisible ||
        Boolean(accountSection);

    const noResults = normalizedQuery.length > 0 && !anyVisible;

    const registerOffset = useCallback((id: string, y: number) => {
        sectionOffsets.current[id] = y;
    }, []);

    const scrollTo = (id: string) => {
        const y = sectionOffsets.current[id];
        if (y !== undefined) {
            scrollViewRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
        }
    };

    const bg = isLight ? "#ffffff" : COLORS.navy;
    const cardBg = isLight ? "#ffffff" : "rgba(255,255,255,0.03)";
    const cardBorder = isLight ? COLORS.redBorder : "rgba(255,255,255,0.1)";
    const tileBg = isLight ? COLORS.lightSurface : "rgba(255,255,255,0.05)";

    const handleContactSupport = () => {
        if (navigation?.navigate) {
            try {
                navigation.navigate("Services");
                return;
            } catch (e) {
                // fall through to a generic support link if the app has no
                // "Services" route registered
            }
        }
        Linking.openURL("mailto:support@remise.app").catch(() => { });
    };

    const handleSearch = () => {
        Keyboard.dismiss();
        const q = query.trim().toLowerCase();
        if (!q) return;

        for (const sec of filteredFaqSections) {
            if (sec.items.length > 0) {
                setOpenId(`${sec.id}-0`);
                break;
            }
        }

        const targetSectionId =
            gettingStartedSection ? "getting-started" :
            findingProductsSection ? "finding-products" :
            comparingStoresSection ? "comparing-stores" :
            ordersVisible ? "orders" :
            deliveryVisible ? "delivery" :
            paymentsVisible ? "payments" :
            sellersVisible ? "sellers" :
            accountSection ? "account-security" : null;

        if (targetSectionId && sectionOffsets.current[targetSectionId] !== undefined) {
            scrollTo(targetSectionId);
        } else {
            scrollViewRef.current?.scrollTo({ y: 350, animated: true });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
            <StatusBar
                barStyle={isLight ? "dark-content" : "light-content"}
                backgroundColor={isLight ? "#ffffff" : COLORS.navy}
            />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <View
                style={[
                    styles.header,
                    { backgroundColor: isLight ? "#ffffff" : COLORS.navy, borderBottomColor: cardBorder },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation?.goBack && navigation.goBack()}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <ArrowLeft size={20} color={isLight ? "#111827" : "#ffffff"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isLight ? "#111827" : "#ffffff" }]}>
                    {helpData.heroTitle}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => {
                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                            setTimeout(() => searchInputRef.current?.focus(), 250);
                        }}
                        style={styles.headerIconBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Search size={19} color={isLight ? "#111827" : "#ffffff"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={styles.headerIconBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        {isLight ? <Moon size={19} color="#111827" /> : <Sun size={19} color="#FF0000" />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Category chips (persistent, tap to jump) ──────────────── */}
            <View
                style={[
                    styles.chipBar,
                    { backgroundColor: isLight ? "#ffffff" : COLORS.navy, borderBottomColor: cardBorder },
                ]}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipBarContent}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => scrollTo(cat.id)}
                            style={[
                                styles.chip,
                                {
                                    borderColor: isLight ? COLORS.redBorder : "rgba(255,255,255,0.1)",
                                    backgroundColor: isLight ? "#ffffff" : "transparent",
                                },
                            ]}
                            activeOpacity={0.7}
                        >
                            <cat.icon size={13} color={isLight ? "#4b5563" : "#d1d5db"} />
                            <Text style={[styles.chipLabel, { color: isLight ? "#4b5563" : "#d1d5db" }]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 48 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Hero ─────────────────────────────────────────────────── */}
                <View style={styles.hero}>
                    <View style={styles.heroBadge}>
                        <Headphones size={13} color={COLORS.redAccentDark} />
                        <Text style={styles.heroBadgeText}>{helpData.eyebrow}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{helpData.heroTitle}</Text>
                    <Text style={styles.heroSubtitle}>
                        {helpData.heroSubtitle}
                    </Text>

                    <View style={styles.searchBar}>
                        <View style={{ paddingLeft: 12 }}>
                            <Search size={18} color="#94a3b8" />
                        </View>
                        <TextInput
                            ref={searchInputRef}
                            value={query}
                            onChangeText={setQuery}
                            placeholder={helpData.searchPlaceholder}
                            placeholderTextColor="rgba(255,255,255,0.65)"
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                            style={styles.searchInput}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={styles.clearBtnText}>{helpData.clearBtn}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
                            <Search size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    {normalizedQuery.length > 0 && !noResults && (
                        <Text style={styles.searchHint}>{helpData.showingResultsFor} "{query.trim()}"</Text>
                    )}

                    <HeroIllustration />
                </View>

                {/* ── Body ───────────────────────────────────────────────────── */}
                <View style={styles.body}>
                    {noResults && (
                        <View style={styles.noResults}>
                            <SearchX size={34} color={isLight ? "#d1d5db" : "#4b5563"} />
                            <Text style={[styles.noResultsTitle, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                {helpData.noResultsFor} "{query}"
                            </Text>
                            <Text style={styles.noResultsSubtitle}>
                                {helpData.noResultsHint}
                            </Text>
                        </View>
                    )}

                    {/* Getting Started */}
                    {gettingStartedSection && (
                        <SectionShell
                            title={gettingStartedSection.title}
                            blurb={gettingStartedSection.blurb}
                            icon={Rocket}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("getting-started", y)}
                        >
                            {!normalizedQuery && (
                                <View style={styles.accountTypeGrid}>
                                    <View style={styles.accountTypeRow}>
                                        <View
                                            style={[styles.accountTypeTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                        >
                                            <ShoppingBag size={20} color={COLORS.red} />
                                            <Text style={[styles.accountTypeLabel, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {helpData.accountTypes.customer}
                                            </Text>
                                        </View>
                                        <View
                                            style={[styles.accountTypeTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                        >
                                            <Store size={20} color={COLORS.red} />
                                            <Text style={[styles.accountTypeLabel, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {helpData.accountTypes.storeOwner}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.accountTypeRow}>
                                        <View
                                            style={[styles.accountTypeTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                        >
                                            <Landmark size={20} color={COLORS.red} />
                                            <Text style={[styles.accountTypeLabel, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {helpData.accountTypes.wholesaler}
                                            </Text>
                                        </View>
                                        <View
                                            style={[styles.accountTypeTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                        >
                                            <HomeIcon size={20} color={COLORS.red} />
                                            <Text style={[styles.accountTypeLabel, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {helpData.accountTypes.homeBusiness}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            <View style={[styles.accordionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                {gettingStartedSection.items.map((item, i) => (
                                    <AccordionRow
                                        key={item.q}
                                        item={item}
                                        isLight={isLight}
                                        isLast={i === gettingStartedSection.items.length - 1}
                                        isOpen={openId === `getting-started-${i}`}
                                        onToggle={() =>
                                            setOpenId((cur) => (cur === `getting-started-${i}` ? null : `getting-started-${i}`))
                                        }
                                    />
                                ))}
                            </View>
                        </SectionShell>
                    )}

                    {/* Finding Products */}
                    {findingProductsSection && (
                        <SectionShell
                            title={findingProductsSection.title}
                            blurb={findingProductsSection.blurb}
                            icon={Search}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("finding-products", y)}
                        >
                            {!normalizedQuery && (
                                <View style={styles.tipRow}>
                                    <View style={[styles.tipTile, { borderColor: cardBorder, backgroundColor: tileBg }]}>
                                        <Mic size={17} color={COLORS.red} />
                                        <Text style={[styles.tipText, { color: isLight ? "#4b5563" : "#d1d5db" }]}>
                                            {helpData.productSearchTips.voiceSearch}
                                        </Text>
                                    </View>
                                    <View style={[styles.tipTile, { borderColor: cardBorder, backgroundColor: tileBg }]}>
                                        <ScanLine size={17} color={COLORS.red} />
                                        <Text style={[styles.tipText, { color: isLight ? "#4b5563" : "#d1d5db" }]}>
                                            {helpData.productSearchTips.scanList}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            <View style={[styles.accordionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                {findingProductsSection.items.map((item, i) => (
                                    <AccordionRow
                                        key={item.q}
                                        item={item}
                                        isLight={isLight}
                                        isLast={i === findingProductsSection.items.length - 1}
                                        isOpen={openId === `finding-products-${i}`}
                                        onToggle={() =>
                                            setOpenId((cur) => (cur === `finding-products-${i}` ? null : `finding-products-${i}`))
                                        }
                                    />
                                ))}
                            </View>
                        </SectionShell>
                    )}

                    {/* Comparing Nearby Stores */}
                    {comparingStoresSection && (
                        <SectionShell
                            title={comparingStoresSection.title}
                            blurb={comparingStoresSection.blurb}
                            icon={Store}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("comparing-stores", y)}
                        >
                            <View style={[styles.accordionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                {comparingStoresSection.items.map((item, i) => (
                                    <AccordionRow
                                        key={item.q}
                                        item={item}
                                        isLight={isLight}
                                        isLast={i === comparingStoresSection.items.length - 1}
                                        isOpen={openId === `comparing-stores-${i}`}
                                        onToggle={() =>
                                            setOpenId((cur) => (cur === `comparing-stores-${i}` ? null : `comparing-stores-${i}`))
                                        }
                                    />
                                ))}
                            </View>
                        </SectionShell>
                    )}

                    {/* Orders */}
                    {ordersVisible && (
                        <SectionShell
                            title={ordersFaqSection?.title || helpData.categories.find((c) => c.id === "orders")?.label || "Orders"}
                            blurb={ordersFaqSection?.blurb || ""}
                            icon={Package}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("orders", y)}
                        >
                            {orderStepsFiltered.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={[styles.kicker, { color: isLight ? "#6b7280" : "#6b7280" }]}>
                                        {helpData.orderStepsKicker}
                                    </Text>
                                    <View style={styles.stepGrid}>
                                        {orderStepsFiltered.map((step) => {
                                            const stepNumber = orderSteps.indexOf(step) + 1;
                                            return (
                                                <View
                                                    key={step.title}
                                                    style={[styles.stepTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                                >
                                                    <View style={styles.stepNumberBadge}>
                                                        <Text style={styles.stepNumberText}>{stepNumber}</Text>
                                                    </View>
                                                    <Text
                                                        style={[styles.stepTitle, { color: isLight ? "#374151" : "#d1d5db" }]}
                                                        numberOfLines={2}
                                                    >
                                                        {step.title}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                            {ordersFaqSection && (
                                <View style={[styles.accordionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                    {ordersFaqSection.items.map((item, i) => (
                                        <AccordionRow
                                            key={item.q}
                                            item={item}
                                            isLight={isLight}
                                            isLast={i === ordersFaqSection.items.length - 1}
                                            isOpen={openId === `orders-${i}`}
                                            onToggle={() => setOpenId((cur) => (cur === `orders-${i}` ? null : `orders-${i}`))}
                                        />
                                    ))}
                                </View>
                            )}
                        </SectionShell>
                    )}

                    {/* Delivery */}
                    {deliveryVisible && (
                        <SectionShell
                            title={helpData.deliveryTitle}
                            blurb={helpData.deliverySubtitle}
                            icon={Truck}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("delivery", y)}
                        >
                            <View style={styles.deliveryGrid}>
                                {deliveryFiltered.map((opt) => (
                                    <View
                                        key={opt.title}
                                        style={[styles.deliveryCard, { borderColor: cardBorder, backgroundColor: cardBg }]}
                                    >
                                        <View
                                            style={[
                                                styles.deliveryIconWrap,
                                                { backgroundColor: isLight ? COLORS.redTint : "rgba(255,255,255,0.05)" },
                                            ]}
                                        >
                                            <opt.icon size={18} color={isLight ? COLORS.red : COLORS.redAccentDark} />
                                        </View>
                                        <Text style={[styles.deliveryTitle, { color: isLight ? "#111827" : "#ffffff" }]}>
                                            {opt.title}
                                        </Text>
                                        <Text style={[styles.deliveryDesc, { color: isLight ? "#6b7280" : "#9ca3af" }]}>
                                            {opt.desc}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            {!normalizedQuery && (
                                <Text style={styles.deliveryFootnote}>
                                    {helpData.deliveryFootnote}
                                </Text>
                            )}
                        </SectionShell>
                    )}

                    {/* Payments */}
                    {paymentsVisible && (
                        <SectionShell
                            title={helpData.paymentsTitle}
                            blurb={helpData.paymentsSubtitle}
                            icon={CreditCard}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("payments", y)}
                        >
                            {paymentMethodsFiltered.length > 0 && (
                                <View style={styles.paymentGrid}>
                                    {paymentMethodsFiltered.map((m) => (
                                        <View
                                            key={m.title}
                                            style={[styles.paymentTile, { borderColor: cardBorder, backgroundColor: cardBg }]}
                                        >
                                            <View
                                                style={[
                                                    styles.deliveryIconWrap,
                                                    { backgroundColor: isLight ? COLORS.redTint : "rgba(255,255,255,0.05)" },
                                                ]}
                                            >
                                                <m.icon size={18} color={isLight ? COLORS.red : COLORS.redAccentDark} />
                                            </View>
                                            <Text style={[styles.paymentTitle, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {m.title}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {paymentNoteVisible && (
                                <View style={styles.paymentNote}>
                                    <Lock size={15} color={COLORS.red} />
                                    <Text style={[styles.paymentNoteText, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                        <Text style={{ fontWeight: "700" }}>{helpData.importantNoteLabel} </Text>
                                        {helpData.paymentNote}
                                    </Text>
                                </View>
                            )}
                        </SectionShell>
                    )}

                    {/* For Sellers */}
                    {sellersVisible && (
                        <SectionShell
                            title={helpData.sellersSectionTitle}
                            blurb={helpData.sellersSectionBlurb}
                            icon={Landmark}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("sellers", y)}
                        >
                            <View style={[styles.sellerCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                {sellerFeaturesFiltered.map((f) => (
                                    <View key={f} style={styles.sellerFeatureRow}>
                                        <CheckCircle2 size={15} color={COLORS.red} style={{ marginTop: 2 }} />
                                        <Text style={[styles.sellerFeatureText, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                            {f}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </SectionShell>
                    )}

                    {/* Account & Security */}
                    {accountSection && (
                        <SectionShell
                            title={accountSection.title}
                            blurb={accountSection.blurb}
                            icon={ShieldCheck}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("account-security", y)}
                        >
                            <View style={[styles.accordionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                {accountSection.items.map((item, i) => (
                                    <AccordionRow
                                        key={item.q}
                                        item={item}
                                        isLight={isLight}
                                        isLast={i === accountSection.items.length - 1}
                                        isOpen={openId === `account-security-${i}`}
                                        onToggle={() =>
                                            setOpenId((cur) => (cur === `account-security-${i}` ? null : `account-security-${i}`))
                                        }
                                    />
                                ))}
                            </View>
                        </SectionShell>
                    )}

                    {/* Contact Support CTA — always shown, even mid-search */}
                    <View
                        onLayout={(e) => registerOffset("support", e.nativeEvent.layout.y)}
                        style={styles.ctaCard}
                    >
                        <View style={styles.ctaBadge}>
                            <Headphones size={13} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.ctaBadgeText}>{helpData.supportCtaBadge}</Text>
                        </View>
                        <Text style={styles.ctaTitle}>
                            {helpData.supportCtaTitle}
                        </Text>
                        <Text style={styles.ctaSubtitle}>
                            {helpData.supportCtaSubtitle}
                        </Text>
                        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={handleContactSupport}>
                            <Mail size={16} color={COLORS.navy} />
                            <Text style={styles.ctaButtonText}>{helpData.getInTouchBtn}</Text>
                            <ArrowRight size={15} color={COLORS.navy} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerIconBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: "800" },

    chipBar: { borderBottomWidth: 1 },
    chipBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexShrink: 0,
    },
    chipLabel: { fontSize: 12, fontWeight: "600" },

    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 28,
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 14,
    },
    heroBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.redAccentDark,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#ffffff",
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: "#d1d5db",
        marginBottom: 20,
    },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        minHeight: 52,
    },
    searchInput: {
        flex: 1,
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "android" ? 6 : 10,
        fontSize: 14,
        color: "#ffffff",
        textAlignVertical: "center",
    },
    clearBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    clearBtnText: { fontSize: 12, color: "#cbd5e1", fontWeight: "600" },
    searchBtn: {
        backgroundColor: COLORS.red,
        minHeight: 48,
        paddingHorizontal: 16,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    searchHint: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 8,
    },

    heroIllustrationWrap: {
        width: "100%",
        height: 200,
        marginTop: 18,
        alignItems: "center",
        justifyContent: "center",
    },

    body: {
        paddingHorizontal: 16,
        paddingTop: 24,
        gap: 28,
    },

    noResults: {
        alignItems: "center",
        paddingVertical: 32,
        gap: 6,
    },
    noResultsTitle: { fontSize: 15, fontWeight: "700" },
    noResultsSubtitle: { fontSize: 13, color: "#6b7280" },

    sectionShell: { gap: 14 },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sectionIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
    sectionBlurb: { fontSize: 12, marginTop: 2 },

    accordionCard: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        overflow: "hidden",
    },
    accordionRow: {
        paddingVertical: 4,
    },
    accordionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 12,
    },
    accordionQuestion: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 18,
    },
    accordionAnswer: {
        fontSize: 13,
        lineHeight: 19,
        paddingBottom: 14,
    },

    accountTypeGrid: {
        gap: 10,
        marginBottom: 8,
    },
    accountTypeRow: {
        flexDirection: "row",
        gap: 10,
    },
    accountTypeTile: {
        flex: 1,
        minHeight: 78,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    accountTypeLabel: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 16,
    },

    tipRow: { gap: 8 },
    tipTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    tipText: { fontSize: 13, fontWeight: "500", flex: 1 },

    kicker: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    stepGrid: { gap: 8 },
    stepTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    stepNumberBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: COLORS.red,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumberText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
    stepTitle: { fontSize: 13, fontWeight: "600", flex: 1 },

    deliveryGrid: { gap: 10 },
    deliveryCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
    deliveryIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    deliveryTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
    deliveryDesc: { fontSize: 12, lineHeight: 17 },
    deliveryFootnote: { fontSize: 11, color: "#6b7280", marginTop: 4 },

    paymentGrid: { gap: 8 },
    paymentTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    paymentTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
    paymentNote: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255,0,0,0.25)",
        backgroundColor: "rgba(255,0,0,0.06)",
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
    },
    paymentNoteText: { fontSize: 12, lineHeight: 17, flex: 1 },

    sellerCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    sellerFeatureRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    sellerFeatureText: { fontSize: 13, flex: 1, lineHeight: 18 },

    ctaCard: {
        backgroundColor: COLORS.red,
        borderRadius: 22,
        padding: 22,
        gap: 10,
    },
    ctaBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    ctaBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.85)",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#ffffff",
        letterSpacing: -0.3,
        lineHeight: 24,
    },
    ctaSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: "rgba(255,255,255,0.85)",
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    ctaButtonText: {
        color: COLORS.navy,
        fontSize: 13,
        fontWeight: "800",
    },
});