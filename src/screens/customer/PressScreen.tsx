import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import {
  Newspaper,
  Calendar,
  Sparkles,
  Globe,
  Building2,
  Users,
  Image as ImageIcon,
  Palette,
  Compass,
  Download,
  Mail,
  ArrowRight,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

const BRAND_RED = CustomerColors.primary;

type PressRelease = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  featured?: boolean;
};

const PRESS_RELEASES: PressRelease[] = [
  {
    id: 'smarter-local-discovery',
    date: 'September 2026',
    title: 'Remise introduces a smarter way to discover local products',
    excerpt:
      'Remise continues to improve product discovery and local shopping by connecting customers with nearby businesses.',
    featured: true,
  },
  {
    id: 'product-scanning-launch',
    date: 'August 2026',
    title: 'Remise launches product list scanning',
    excerpt: 'A faster way to compare an entire shopping list across nearby stores in one pass.',
  },
  {
    id: 'store-comparison-update',
    date: 'July 2026',
    title: 'Remise improves store comparison with total pricing',
    excerpt: 'Customers can now see full pricing across stores at a glance, before choosing where to buy.',
  },
];

const AT_A_GLANCE = [
  { icon: Globe, label: 'Web & Mobile', sub: 'Platform' },
  { icon: Building2, label: 'Local Commerce', sub: 'Platform' },
  { icon: Users, label: 'Business', sub: 'Partners' },
];

const MEDIA_KIT = [
  { icon: ImageIcon, title: 'Logo Assets', desc: 'PNG / SVG Vector formats' },
  { icon: Palette, title: 'Screenshots', desc: 'High-res product images' },
  { icon: Compass, title: 'Brand Kit', desc: 'Color palettes & guidelines' },
];

export default function PressScreen({ navigation }: any) {
  const featured = PRESS_RELEASES.find((r) => r.featured) ?? PRESS_RELEASES[0];
  const timelineReleases = PRESS_RELEASES.filter((r) => r.id !== featured.id);

  const handleDownload = (itemTitle: string) => {
    Alert.alert(
      'Media Asset Request',
      `For official ${itemTitle} and media kits, please email press@remise.com or porulontechnologies@gmail.com.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email Us',
          onPress: () =>
            Linking.openURL('mailto:porulontechnologies@gmail.com?subject=Media%20Asset%20Request%20-%20' + encodeURIComponent(itemTitle)),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO / HEADER */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Newspaper size={13} color={BRAND_RED} />
          <Text style={styles.badgeText}>Remise Newsroom</Text>
        </View>
        <Text style={styles.heroTitle}>News, announcements & official info</Text>
        <Text style={styles.heroSubtitle}>
          Everything a journalist, partner, or curious reader needs to know about what we're building.
        </Text>
      </View>

      {/* FEATURED ANNOUNCEMENT */}
      <View style={styles.section}>
        <View style={styles.featuredCard}>
          <View style={styles.featuredTag}>
            <Text style={styles.featuredTagText}>FEATURED ANNOUNCEMENT</Text>
          </View>
          <Text style={styles.featuredDate}>{featured.date}</Text>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
        </View>
      </View>

      {/* TIMELINE RELEASES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Press Releases</Text>
        </View>

        <View style={styles.timelineContainer}>
          {PRESS_RELEASES.map((release, index) => (
            <View key={release.id} style={styles.timelineItem}>
              <View style={styles.timelineDotWrapper}>
                <View style={styles.timelineDot} />
                {index < PRESS_RELEASES.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.releaseCard}>
                <View style={styles.dateRow}>
                  <Calendar size={12} color={BRAND_RED} />
                  <Text style={styles.releaseDate}>{release.date}</Text>
                </View>
                <Text style={styles.releaseTitle}>{release.title}</Text>
                <Text style={styles.releaseExcerpt}>{release.excerpt}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* REMISE AT A GLANCE */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Remise at a Glance</Text>
        </View>

        <View style={styles.glanceRow}>
          {AT_A_GLANCE.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.glanceCard}>
                <View style={styles.glanceIconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.glanceLabel}>{item.label}</Text>
                <Text style={styles.glanceSub}>{item.sub}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* IN THE NEWS */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>In the News</Text>
        </View>

        <View style={styles.newsEmptyCard}>
          <Sparkles size={24} color={BRAND_RED} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.newsEmptyTitle}>Building Our Story</Text>
          <Text style={styles.newsEmptyDesc}>
            Remise is continuously growing. Media coverage and articles will appear here as we expand.
          </Text>
        </View>
      </View>

      {/* MEDIA KIT */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Media Resources</Text>
        </View>

        <View style={{ gap: Spacing.sm }}>
          {MEDIA_KIT.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.mediaKitCard}>
                <View style={styles.mediaKitIconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mediaKitTitle}>{item.title}</Text>
                  <Text style={styles.mediaKitDesc}>{item.desc}</Text>
                </View>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => handleDownload(item.title)}
                  activeOpacity={0.7}
                >
                  <Download size={14} color={BRAND_RED} />
                  <Text style={styles.downloadBtnText}>Request</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* ABOUT REMISE */}
      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTag}>About Remise</Text>
          <Text style={styles.aboutText}>
            Remise is a local commerce and product discovery platform that connects customers with
            nearby businesses. Customers can discover products, compare available options, choose
            stores, and place orders directly through the platform.
          </Text>
        </View>
      </View>

      {/* PRESS CONTACT CTA */}
      <View style={styles.contactCard}>
        <View style={styles.contactIconCircle}>
          <Mail size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.contactTitle}>Media & Press Contact</Text>
        <Text style={styles.contactSubtitle}>
          Are you a journalist or publication interested in learning more about Remise?
        </Text>
        <Text style={styles.contactEmail}>porulontechnologies@gmail.com</Text>

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() =>
            Linking.openURL('mailto:porulontechnologies@gmail.com?subject=Press%20Inquiry%20-%20Remise')
          }
          activeOpacity={0.85}
        >
          <Text style={styles.contactBtnText}>Contact Press Team</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>
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
  heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 21 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  headingBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: BRAND_RED },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  featuredCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.35)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  featuredTagText: { fontSize: 10, fontWeight: '800', color: BRAND_RED, letterSpacing: 0.5 },
  featuredDate: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 6 },
  featuredTitle: { fontSize: FontSizes.lg, fontWeight: '900', color: '#FFFFFF', marginBottom: Spacing.xs, lineHeight: 24 },
  featuredExcerpt: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 20 },

  timelineContainer: { paddingLeft: Spacing.xs },
  timelineItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  timelineDotWrapper: { alignItems: 'center', width: 16 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_RED,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#262626',
    marginTop: 4,
  },
  releaseCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  releaseDate: { fontSize: 11, color: '#9CA3AF', fontWeight: '700' },
  releaseTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, lineHeight: 19 },
  releaseExcerpt: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 16 },

  glanceRow: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'space-between' },
  glanceCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  glanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  glanceLabel: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  glanceSub: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 2 },

  newsEmptyCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  newsEmptyTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.xs },
  newsEmptyDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },

  mediaKitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  mediaKitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaKitTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  mediaKitDesc: { fontSize: FontSizes.xs, color: '#9CA3AF' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
  },
  downloadBtnText: { fontSize: 11, fontWeight: '800', color: BRAND_RED },

  aboutCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  aboutTag: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs },
  aboutText: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 18 },

  contactCard: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.4)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  contactTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.xs },
  contactSubtitle: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginBottom: Spacing.sm },
  contactEmail: { fontSize: FontSizes.sm, fontWeight: '800', color: BRAND_RED, marginBottom: Spacing.lg },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BRAND_RED,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  contactBtnText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
});
