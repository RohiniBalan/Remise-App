import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {
  Sparkles,
  ShoppingBag,
  Building2,
  Cpu,
  Newspaper,
  Megaphone,
  Search,
  Clock,
  ArrowRight,
  Bell,
  Lightbulb,
  Mail,
  Check,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

const BRAND_RED = CustomerColors.primary;

type Category =
  | 'All'
  | 'Shopping Tips'
  | 'Business'
  | 'Technology'
  | 'Remise News'
  | 'Offers';

const CATEGORIES: Category[] = [
  'All',
  'Shopping Tips',
  'Business',
  'Technology',
  'Remise News',
  'Offers',
];

const CATEGORY_ICON: Record<Category, any> = {
  All: Sparkles,
  'Shopping Tips': ShoppingBag,
  Business: Building2,
  Technology: Cpu,
  'Remise News': Newspaper,
  Offers: Megaphone,
};

type Article = {
  id: string;
  category: Category;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  featured?: boolean;
};

const ARTICLES: Article[] = [
  {
    id: 'making-local-shopping-smarter',
    category: 'Remise News',
    title: 'Making Local Shopping Smarter',
    excerpt:
      'Discover how Remise brings customers and local businesses together, helping shoppers find products, compare options, and choose where to buy.',
    readTime: '5 min read',
    date: 'September 2026',
    featured: true,
  },
  {
    id: 'compare-prices-before-you-buy',
    category: 'Shopping Tips',
    title: 'How to Compare Prices Before You Buy',
    excerpt: 'Five practical habits that make it easier to spot a genuinely good deal nearby.',
    readTime: '4 min read',
    date: 'August 2026',
  },
  {
    id: 'ai-modern-shopping',
    category: 'Technology',
    title: 'How Technology Is Changing Local Shopping',
    excerpt: 'A look at scanning, search, and discovery tools quietly reshaping how people shop nearby.',
    readTime: '6 min read',
    date: 'August 2026',
  },
  {
    id: 'grow-your-business-online',
    category: 'Business',
    title: 'Growing Your Local Business Online',
    excerpt: 'Simple, practical steps for store owners and home businesses building a digital presence.',
    readTime: '5 min read',
    date: 'July 2026',
  },
  {
    id: 'whats-new-in-remise',
    category: 'Remise News',
    title: "What's New in Remise",
    excerpt: 'Recent additions to the platform, in plain language, with no changelog jargon.',
    readTime: '3 min read',
    date: 'July 2026',
  },
  {
    id: 'product-scanning-explained',
    category: 'Technology',
    title: 'Product Scanning, Explained',
    excerpt: 'How scanning a product or list helps you find it at nearby stores in seconds.',
    readTime: '4 min read',
    date: 'June 2026',
  },
  {
    id: 'managing-inventory-digitally',
    category: 'Business',
    title: 'Managing Products and Inventory Digitally',
    excerpt: 'Why keeping stock and pricing current online matters more than it seems.',
    readTime: '5 min read',
    date: 'June 2026',
  },
  {
    id: 'finding-products-near-you',
    category: 'Shopping Tips',
    title: 'Tips for Finding Products Near You',
    excerpt: 'Search habits that narrow results fast when you know roughly what you want.',
    readTime: '3 min read',
    date: 'May 2026',
  },
];

const UPDATES = [
  {
    icon: Sparkles,
    tag: 'New feature',
    text: 'Product list scanning is now available.',
  },
  {
    icon: Bell,
    tag: 'Update',
    text: 'Store comparison now shows total pricing at a glance.',
  },
  {
    icon: Megaphone,
    tag: 'Announcement',
    text: 'New businesses are joining Remise every week.',
  },
];

const BUSINESS_TOPICS = [
  { icon: Building2, title: 'Grow Your Business', desc: 'Reach more customers with a clear digital storefront.' },
  { icon: Cpu, title: 'Manage Your Products', desc: 'Keep listings, pricing, and stock accurate with less effort.' },
  { icon: Megaphone, title: 'Reach Local Customers', desc: 'Show up for the shoppers already searching nearby.' },
];

export default function BlogScreen({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featured = useMemo(() => ARTICLES.find((a) => a.featured) ?? ARTICLES[0], []);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (a.id === featured.id) return false;
      const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
      const matchesQuery =
        query.trim() === '' ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, featured]);

  const handleSubscribe = () => {
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    Alert.alert('Subscribed!', 'Thank you for subscribing to Remise stories & updates.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO / TITLE */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Newspaper size={13} color={BRAND_RED} />
          <Text style={styles.badgeText}>Blogs & News</Text>
        </View>
        <Text style={styles.heroTitle}>Stories from Remise</Text>
        <Text style={styles.heroSubtitle}>
          Shopping tips, product updates, and news from the local businesses building on Remise.
        </Text>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Search size={16} color={BRAND_RED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* CATEGORY SELECTOR */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON[cat];
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Icon size={14} color={active ? '#000000' : '#D1D5DB'} />
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FEATURED STORY */}
      <View style={styles.section}>
        <View style={styles.featuredCard}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>FEATURED</Text>
            </View>
            <Text style={styles.featuredCategoryText}>{featured.category}</Text>
          </View>

          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>

          <View style={styles.featuredMetaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.metaText}>{featured.readTime}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{featured.date}</Text>
          </View>
        </View>
      </View>

      {/* LATEST ARTICLES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Latest from Remise</Text>
        </View>

        {filteredArticles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No articles match that search yet.</Text>
          </View>
        ) : (
          <View style={{ gap: Spacing.md }}>
            {filteredArticles.map((article) => {
              const Icon = CATEGORY_ICON[article.category] || Newspaper;
              return (
                <View key={article.id} style={styles.articleCard}>
                  <View style={styles.articleHeader}>
                    <View style={styles.articleTagRow}>
                      <Icon size={12} color={BRAND_RED} />
                      <Text style={styles.articleCategory}>{article.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={11} color="#6B7280" />
                      <Text style={styles.metaTextSmall}>{article.readTime}</Text>
                    </View>
                  </View>

                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleExcerpt}>{article.excerpt}</Text>

                  <View style={styles.articleFooter}>
                    <Text style={styles.metaTextSmall}>{article.date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* REMISE UPDATES STRIP */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Remise Updates</Text>
        </View>

        <View style={styles.updatesCard}>
          {UPDATES.map((u, i) => {
            const Icon = u.icon;
            return (
              <View
                key={i}
                style={[
                  styles.updateItem,
                  i < UPDATES.length - 1 && styles.updateItemBorder,
                ]}
              >
                <View style={styles.updateIconCircle}>
                  <Icon size={16} color={BRAND_RED} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.updateTag}>{u.tag}</Text>
                  <Text style={styles.updateText}>{u.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* SMART SHOPPING HIGHLIGHT */}
      <View style={styles.section}>
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Lightbulb size={16} color={BRAND_RED} />
            <Text style={styles.highlightTag}>Smart Shopping Tips</Text>
          </View>
          <Text style={styles.highlightTitle}>How to Compare Prices Before You Buy</Text>
          <Text style={styles.highlightDesc}>
            Five practical habits that make it easier to spot a genuinely good deal nearby.
            Check store listings, verify stock, and look for bundled nearby promotions.
          </Text>
        </View>
      </View>

      {/* FOR LOCAL BUSINESSES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>For Local Businesses</Text>
        </View>

        <View style={{ gap: Spacing.sm }}>
          {BUSINESS_TOPICS.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <View key={i} style={styles.businessCard}>
                <View style={styles.iconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.businessTitle}>{topic.title}</Text>
                  <Text style={styles.businessDesc}>{topic.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* STAY UPDATED / NEWSLETTER */}
      <View style={styles.newsletterCard}>
        <Mail size={24} color={BRAND_RED} style={{ marginBottom: Spacing.xs }} />
        <Text style={styles.newsletterTitle}>Stay Updated</Text>
        <Text style={styles.newsletterSubtitle}>
          Get the latest Remise news, shopping tips, and business insights sent directly to you.
        </Text>

        {subscribed ? (
          <View style={styles.subscribedBox}>
            <Check size={16} color="#22C55E" />
            <Text style={styles.subscribedText}>You are subscribed to Remise updates!</Text>
          </View>
        ) : (
          <View style={styles.subscribeRow}>
            <TextInput
              style={styles.subscribeInput}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newsletterEmail}
              onChangeText={setNewsletterEmail}
            />
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
              activeOpacity={0.85}
            >
              <Text style={styles.subscribeBtnText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.35)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND_RED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: FontSizes.xl ?? 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 21, marginBottom: Spacing.md },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    padding: 0,
  },

  categoryScrollWrapper: { marginTop: Spacing.xs, marginBottom: Spacing.sm },
  categoryList: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#111111',
  },
  categoryChipActive: {
    backgroundColor: BRAND_RED,
    borderColor: BRAND_RED,
  },
  categoryChipText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  headingBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: BRAND_RED },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  featuredCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  featuredTag: {
    backgroundColor: 'rgba(255,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  featuredTagText: { fontSize: 10, fontWeight: '800', color: BRAND_RED, letterSpacing: 0.5 },
  featuredCategoryText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredTitle: { fontSize: FontSizes.lg, fontWeight: '900', color: '#FFFFFF', marginBottom: Spacing.xs, lineHeight: 24 },
  featuredExcerpt: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20, marginBottom: Spacing.md },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  metaTextSmall: { fontSize: 11, color: '#6B7280' },

  emptyCard: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: { fontSize: FontSizes.sm, color: '#6B7280' },

  articleCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  articleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  articleTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  articleCategory: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },
  articleTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, lineHeight: 20 },
  articleExcerpt: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 17, marginBottom: Spacing.sm },
  articleFooter: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },

  updatesCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  updateItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  updateItemBorder: { borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  updateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateTag: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  updateText: { fontSize: FontSizes.xs, color: '#D1D5DB', fontWeight: '500' },

  highlightCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.35)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  highlightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
  highlightTag: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },
  highlightTitle: { fontSize: FontSizes.base, fontWeight: '900', color: '#FFFFFF', marginBottom: Spacing.xs },
  highlightDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 18 },

  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  businessDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 16 },

  newsletterCard: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.4)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  newsletterTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.xs },
  newsletterSubtitle: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginBottom: Spacing.lg },
  subscribeRow: { flexDirection: 'row', width: '100%', gap: Spacing.sm },
  subscribeInput: {
    flex: 1,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
  },
  subscribeBtn: {
    backgroundColor: BRAND_RED,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  subscribedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  subscribedText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#22C55E' },
});
