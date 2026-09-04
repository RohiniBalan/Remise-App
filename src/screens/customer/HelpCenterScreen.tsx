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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

const FAQ_SECTIONS: FAQSection[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        blurb: "Create your account and find your way around.",
        icon: Rocket,
        items: [
            {
                q: "What is Remise?",
                a: "Remise is an e-commerce and local shopping platform that connects customers with nearby stores, wholesalers, and home businesses. Search for products, compare prices from nearby sellers, choose a store, select a delivery method, and place an order.",
            },
            {
                q: "How do I create an account?",
                a: "Select Sign Up, enter your required details, verify your email or mobile number if requested, and complete your profile.",
            },
            {
                q: "What types of accounts are available?",
                a: "Customer, Store Owner, Wholesaler, and Home Business. Each account type has different features and pricing options.",
            },
        ],
    },
    {
        id: "finding-products",
        title: "Finding Products",
        blurb: "Search, speak, or scan — however you shop.",
        icon: Search,
        items: [
            {
                q: "How can I find a product?",
                a: "You can search for products using the search bar or browse categories.",
            },
            {
                q: "Can I search using my voice?",
                a: "Yes. Where voice search is available, tap the microphone icon and speak the product name or your requirements.",
            },
            {
                q: "Can I scan a product list?",
                a: "Yes. The product scanning feature allows you to scan or upload a list containing multiple products. Remise identifies the products and helps you add them to your order.",
            },
        ],
    },
    {
        id: "comparing-stores",
        title: "Comparing Nearby Stores",
        blurb: "Let Remise find the best price close to you.",
        icon: Store,
        items: [
            {
                q: "How does store comparison work?",
                a: "You provide your required products and select the distance within which Remise should search for stores. Remise then compares available nearby stores based on product availability and total price. You can select the store that best suits your requirements.",
            },
            {
                q: "Can I choose how far Remise searches?",
                a: "Yes. You can select the preferred search distance in kilometres before comparing stores.",
            },
        ],
    },
    {
        id: "orders",
        title: "Orders",
        blurb: "From cart to confirmation.",
        icon: Package,
        items: [
            {
                q: "Can I cancel an order?",
                a: "Cancellation depends on the order status and the applicable store cancellation policy. If cancellation is available, the option will be displayed in your order details.",
            },
        ],
    },
    {
        id: "account-security",
        title: "Account & Security",
        blurb: "Keep your details up to date and protected.",
        icon: ShieldCheck,
        items: [
            {
                q: "What can I manage in my account?",
                a: "Profile information, addresses, password, email or mobile information, and account settings.",
            },
            {
                q: "Is it safe to share my password or OTP?",
                a: "Never share your password, OTP, or authentication credentials with anyone.",
            },
        ],
    },
];

const ORDER_STEPS = [
    { title: "Enter or scan your product list", icon: ScanLine },
    { title: "Select the search distance", icon: MapPin },
    { title: "Compare nearby stores", icon: Store },
    { title: "Select a store", icon: CheckCircle2 },
    { title: "Select your delivery method", icon: Truck },
    { title: "Select your payment method", icon: CreditCard },
    { title: "Confirm your order", icon: Package },
];

const DELIVERY_OPTIONS = [
    {
        title: "Self Pickup",
        icon: Store,
        desc: "Visit the selected store and collect your order.",
    },
    {
        title: "Home Delivery",
        icon: Truck,
        desc: "The selected store prepares and delivers the order to your specified address.",
    },
];

const PAYMENT_METHODS = [
    { title: "UPI / QR payment", icon: QrCode },
    { title: "Online payment gateway", icon: CreditCard },
    { title: "Cash", icon: Banknote },
];

const PAYMENT_NOTE =
    "Always verify the payment amount and recipient details before completing a payment. For QR payments, the applicable store's payment QR code may be displayed during checkout.";

const SELLER_FEATURES = [
    "Create and manage their store",
    "Add products manually",
    "Scan products",
    "Bulk scan product lists",
    "Manage stock",
    "Set product prices",
    "Manage customer / store-owner pricing where applicable",
    "Manage UPI / payment details",
    "Receive customer orders",
    "Manage order status",
];

const CATEGORIES = [
    { id: "getting-started", label: "Getting Started", icon: Rocket },
    { id: "finding-products", label: "Finding Products", icon: Search },
    { id: "comparing-stores", label: "Comparing Stores", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "sellers", label: "For Sellers", icon: Landmark },
    { id: "account-security", label: "Account & Security", icon: ShieldCheck },
    { id: "support", label: "Contact Support", icon: Headphones },
];

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
// Hero illustration — store, phone + pin, delivery scooter.
// Built from primitive SVG shapes so no external image assets are needed.
// One orchestrated fade/slide-in, then a single gentle idle loop on the
// scooter — not a fade-up-everything effect.
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

    const storeTranslate = storeIn.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
    const phoneTranslate = phoneIn.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
    const scooterTranslate = scooterIn.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
    const scooterFloatY = scooterFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

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

    const [theme, setTheme] = useState<"dark" | "light">("light");
    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
    const isLight = theme === "light";

    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState<string | null>("getting-started-0");

    const scrollViewRef = useRef<ScrollView>(null);
    const sectionOffsets = useRef<Record<string, number>>({});

    const normalizedQuery = query.trim().toLowerCase();
    const matches = (texts: string[]) =>
        !normalizedQuery || texts.some((t) => t.toLowerCase().includes(normalizedQuery));

    const filteredFaqSections = useMemo(() => {
        if (!normalizedQuery) return FAQ_SECTIONS;
        return FAQ_SECTIONS.map((section) => ({
            ...section,
            items: section.items.filter((item) => matches([item.q, item.a])),
        })).filter((section) => section.items.length > 0);
    }, [normalizedQuery]);

    const deliveryFiltered = useMemo(
        () => DELIVERY_OPTIONS.filter((o) => matches([o.title, o.desc])),
        [normalizedQuery],
    );
    const paymentMethodsFiltered = useMemo(
        () => PAYMENT_METHODS.filter((m) => matches([m.title])),
        [normalizedQuery],
    );
    const paymentNoteVisible = matches([PAYMENT_NOTE]);
    const sellerFeaturesFiltered = useMemo(
        () => SELLER_FEATURES.filter((f) => matches([f])),
        [normalizedQuery],
    );
    const orderStepsFiltered = useMemo(
        () => ORDER_STEPS.filter((s) => matches([s.title])),
        [normalizedQuery],
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
                    Help Center
                </Text>
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    {isLight ? <Moon size={19} color="#111827" /> : <Sun size={19} color="#ffffff" />}
                </TouchableOpacity>
            </View>

            {/* ── Category chips (persistent, tap to jump) ──────────────── */}
            <View
                style={[
                    styles.chipBar,
                    { backgroundColor: isLight ? "#ffffff" : COLORS.navy, borderBottomColor: cardBorder },
                ]}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipBarContent}>
                    {CATEGORIES.map((cat) => (
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
                        <Text style={styles.heroBadgeText}>We're here to help</Text>
                    </View>
                    <Text style={styles.heroTitle}>Help Center</Text>
                    <Text style={styles.heroSubtitle}>
                        Answers on shopping, stores, products, orders, payments, delivery, and your account —
                        all in one place.
                    </Text>

                    <View style={styles.searchBar}>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder='Search for a topic, e.g. "cancel order"'
                            placeholderTextColor="#6b7280"
                            style={styles.searchInput}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
                                <Text style={styles.clearBtnText}>Clear</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85}>
                            <Search size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    {normalizedQuery.length > 0 && !noResults && (
                        <Text style={styles.searchHint}>Showing results for "{query.trim()}"</Text>
                    )}

                    <HeroIllustration />
                </View>

                {/* ── Body ───────────────────────────────────────────────────── */}
                <View style={styles.body}>
                    {noResults && (
                        <View style={styles.noResults}>
                            <SearchX size={34} color={isLight ? "#d1d5db" : "#4b5563"} />
                            <Text style={[styles.noResultsTitle, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                No results for "{query}"
                            </Text>
                            <Text style={styles.noResultsSubtitle}>
                                Try a different word, or browse a topic below.
                            </Text>
                        </View>
                    )}

                    {/* Getting Started */}
                    {gettingStartedSection && (
                        <SectionShell
                            title="Getting Started"
                            blurb="Create your account and find your way around."
                            icon={Rocket}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("getting-started", y)}
                        >
                            {!normalizedQuery && (
                                <View style={styles.accountTypeGrid}>
                                    {[
                                        { label: "Customer", icon: ShoppingBag },
                                        { label: "Store Owner", icon: Store },
                                        { label: "Wholesaler", icon: Landmark },
                                        { label: "Home Business", icon: HomeIcon },
                                    ].map((t) => (
                                        <View
                                            key={t.label}
                                            style={[styles.accountTypeTile, { borderColor: cardBorder, backgroundColor: tileBg }]}
                                        >
                                            <t.icon size={18} color={COLORS.red} />
                                            <Text style={[styles.accountTypeLabel, { color: isLight ? "#374151" : "#d1d5db" }]}>
                                                {t.label}
                                            </Text>
                                        </View>
                                    ))}
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
                            title="Finding Products"
                            blurb="Search, speak, or scan — however you shop."
                            icon={Search}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("finding-products", y)}
                        >
                            {!normalizedQuery && (
                                <View style={styles.tipRow}>
                                    <View style={[styles.tipTile, { borderColor: cardBorder, backgroundColor: tileBg }]}>
                                        <Mic size={17} color={COLORS.red} />
                                        <Text style={[styles.tipText, { color: isLight ? "#4b5563" : "#d1d5db" }]}>
                                            Tap the mic to search by voice
                                        </Text>
                                    </View>
                                    <View style={[styles.tipTile, { borderColor: cardBorder, backgroundColor: tileBg }]}>
                                        <ScanLine size={17} color={COLORS.red} />
                                        <Text style={[styles.tipText, { color: isLight ? "#4b5563" : "#d1d5db" }]}>
                                            Scan or upload a product list
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
                            title="Comparing Nearby Stores"
                            blurb="Let Remise find the best price close to you."
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
                            title="Orders"
                            blurb="From cart to confirmation."
                            icon={Package}
                            isLight={isLight}
                            onLayout={(y) => registerOffset("orders", y)}
                        >
                            {orderStepsFiltered.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={[styles.kicker, { color: isLight ? "#6b7280" : "#6b7280" }]}>
                                        How do I place an order?
                                    </Text>
                                    <View style={styles.stepGrid}>
                                        {orderStepsFiltered.map((step) => {
                                            const stepNumber = ORDER_STEPS.indexOf(step) + 1;
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
                            title="Delivery"
                            blurb="Pick up yourself, or have it brought to you."
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
                                    Delivery availability, charges, and estimated delivery time may vary by store and location.
                                </Text>
                            )}
                        </SectionShell>
                    )}

                    {/* Payments */}
                    {paymentsVisible && (
                        <SectionShell
                            title="Payments"
                            blurb="Pay the way that suits you."
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
                                        <Text style={{ fontWeight: "700" }}>Important: </Text>
                                        {PAYMENT_NOTE}
                                    </Text>
                                </View>
                            )}
                        </SectionShell>
                    )}

                    {/* For Sellers */}
                    {sellersVisible && (
                        <SectionShell
                            title="Store Owner / Seller Help"
                            blurb="Everything store owners, wholesalers, and home businesses can do."
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
                            title="Account & Security"
                            blurb="Keep your details up to date and protected."
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
                            <Text style={styles.ctaBadgeText}>Still need help?</Text>
                        </View>
                        <Text style={styles.ctaTitle}>
                            Contact support with your order ID and we'll take it from there.
                        </Text>
                        <Text style={styles.ctaSubtitle}>
                            Reach us through the support channel inside the app — include your order ID or
                            relevant details whenever possible.
                        </Text>
                        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={handleContactSupport}>
                            <Mail size={16} color={COLORS.navy} />
                            <Text style={styles.ctaButtonText}>Get in touch</Text>
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
        marginRight: 8,
    },
    chipLabel: { fontSize: 12, fontWeight: "600" },

    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 32,
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 16,
    },
    heroBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.redAccentDark,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    heroTitle: { fontSize: 32, fontWeight: "900", color: "#ffffff", lineHeight: 36 },
    heroSubtitle: { fontSize: 14, color: "#d1d5db", marginTop: 12, lineHeight: 20 },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 22,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        overflow: "hidden",
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: "#ffffff",
    },
    clearBtn: { paddingHorizontal: 10 },
    clearBtnText: { fontSize: 12, fontWeight: "600", color: "#9ca3af" },
    searchBtn: { backgroundColor: COLORS.red, paddingHorizontal: 16, paddingVertical: 12 },
    searchHint: { fontSize: 12, color: "#9ca3af", marginTop: 8 },

    heroIllustrationWrap: { width: "100%", aspectRatio: 480 / 300, marginTop: 24 },

    body: { paddingHorizontal: 20, paddingTop: 28, gap: 40 },

    noResults: { alignItems: "center", paddingVertical: 32 },
    noResultsTitle: { fontWeight: "700", marginTop: 10 },
    noResultsSubtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },

    sectionShell: { marginBottom: 4 },
    sectionHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
    sectionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: { fontSize: 18, fontWeight: "900" },
    sectionBlurb: { fontSize: 12, marginTop: 2 },

    accordionCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
    accordionRow: { paddingVertical: 4 },
    accordionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 14,
    },
    accordionQuestion: { flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 19 },
    accordionAnswer: { fontSize: 13, lineHeight: 19, paddingBottom: 14 },

    accountTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    accountTypeTile: {
        width: "47.5%",
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        gap: 6,
    },
    accountTypeLabel: { fontSize: 12, fontWeight: "600" },

    tipRow: { gap: 10, marginBottom: 16 },
    tipTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    tipText: { fontSize: 12, fontWeight: "500", flex: 1 },

    kicker: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
    stepGrid: { gap: 8 },
    stepTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    stepNumberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.red,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumberText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
    stepTitle: { fontSize: 13, fontWeight: "500", flex: 1 },

    deliveryGrid: { gap: 10 },
    deliveryCard: { borderWidth: 1, borderRadius: 16, padding: 18 },
    deliveryIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    deliveryTitle: { fontWeight: "700", fontSize: 14, marginBottom: 4 },
    deliveryDesc: { fontSize: 12, lineHeight: 17 },
    deliveryFootnote: { fontSize: 11, color: "#9ca3af", marginTop: 10 },

    paymentGrid: { gap: 10, marginBottom: 14 },
    paymentTile: { borderWidth: 1, borderRadius: 16, padding: 18, alignItems: "center", gap: 8 },
    paymentTitle: { fontSize: 12, fontWeight: "600" },
    paymentNote: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(255,0,0,0.25)",
        backgroundColor: "rgba(255,0,0,0.06)",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    paymentNoteText: { fontSize: 12, lineHeight: 18, flex: 1 },

    sellerCard: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 12 },
    sellerFeatureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    sellerFeatureText: { fontSize: 13, flex: 1, lineHeight: 18 },

    ctaCard: {
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: COLORS.redDeep,
        padding: 24,
    },
    ctaBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    ctaBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.8)",
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    ctaTitle: { fontSize: 19, fontWeight: "900", color: "#ffffff", lineHeight: 25, marginBottom: 8 },
    ctaSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19, marginBottom: 18 },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },
    ctaButtonText: { color: COLORS.navy, fontWeight: "800", fontSize: 13 },
});