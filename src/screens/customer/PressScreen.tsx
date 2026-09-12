import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
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
  X,
  User,
  MapPin,
  Clock,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { pressApi } from '../../api/pressApi';

const BRAND_RED = CustomerColors.primary;
const STORAGE_KEY = 'remise_press_releases';
const DUMMY_IDS = ['smarter-local-discovery', 'product-scanning-launch', 'store-comparison-update'];

export interface PressRelease {
  id: string;
  title: string;
  slug?: string;
  date: string;
  excerpt: string;
  body?: string[];
  category?: string;
  featured?: boolean;
  published?: boolean;
  location?: string;
  contactName?: string;
  contactEmail?: string;
  createdAt?: string;
}

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
  const { isDark } = useTheme();
  const [releasesList, setReleasesList] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);
  const [readerModalVisible, setReaderModalVisible] = useState(false);

  // Dynamic theme colors
  const themeColors = {
    bg: isDark ? '#0B0F19' : '#F8FAFC',
    card: isDark ? '#131D31' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    inputBg: isDark ? '#141414' : '#FFFFFF',
    chipBg: isDark ? '#111111' : '#FFFFFF',
    chipBorder: isDark ? '#262626' : '#E2E8F0',
    highlightCardBg: isDark ? '#111111' : '#FFF1F2',
  };

  const loadReleases = async () => {
    try {
      setLoading(true);
      const res = await pressApi.getAll();
      if (res?.data && Array.isArray(res.data)) {
        const publishedOnly = res.data.filter(
          (r: any) => r && r.published !== false
        );
        setReleasesList(publishedOnly);
        return;
      }
      setReleasesList([]);
    } catch (e) {
      console.warn('Failed to load press releases from DB:', e);
      setReleasesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReleases();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReleases();
    }, [])
  );

  const featured = releasesList.find((r) => r.featured) ?? (releasesList.length > 0 ? releasesList[0] : null);
  const timelineReleases = featured ? releasesList.filter((r) => (r.slug || r.id) !== (featured.slug || featured.id)) : releasesList;

  const openReader = (release: PressRelease) => {
    setSelectedRelease(release);
    setReaderModalVisible(true);
  };

  const handleDownload = (itemTitle: string) => {
    Alert.alert(
      'Media Asset Request',
      `For official ${itemTitle} and media kits, please email porulontechnologies@gmail.com.`,
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
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.bg }]}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadReleases}
          tintColor={BRAND_RED}
          colors={[BRAND_RED]}
        />
      }
    >
      {/* HERO / HEADER */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Newspaper size={13} color={BRAND_RED} />
          <Text style={styles.badgeText}>Remise Newsroom</Text>
        </View>
        <Text style={[styles.heroTitle, { color: themeColors.textPrimary }]}>News, announcements & official info</Text>
        <Text style={[styles.heroSubtitle, { color: themeColors.textSecondary }]}>
          Everything a journalist, partner, or curious reader needs to know about what we're building.
        </Text>
      </View>

      {/* FEATURED ANNOUNCEMENT */}
      {featured ? (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: themeColors.card, borderColor: isDark ? 'rgba(255,0,0,0.35)' : '#FCA5A5' }]}
            activeOpacity={0.85}
            onPress={() => openReader(featured)}
          >
            <View style={styles.featuredHeader}>
              <View style={styles.featuredTag}>
                <Text style={styles.featuredTagText}>FEATURED ANNOUNCEMENT</Text>
              </View>
              {featured.category ? (
                <Text style={styles.featuredCategoryText}>{featured.category}</Text>
              ) : null}
            </View>
            <Text style={[styles.featuredDate, { color: themeColors.textSecondary }]}>{featured.date}</Text>
            <Text style={[styles.featuredTitle, { color: themeColors.textPrimary }]}>{featured.title}</Text>
            <Text style={[styles.featuredExcerpt, { color: themeColors.textSecondary }]}>{featured.excerpt}</Text>

            <View style={styles.readMoreRow}>
              <Text style={styles.readMoreText}>Read Announcement</Text>
              <ArrowRight size={12} color={BRAND_RED} />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={[styles.emptyHeroCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Sparkles size={28} color={BRAND_RED} style={{ marginBottom: Spacing.sm }} />
            <Text style={[styles.emptyHeroTitle, { color: themeColors.textPrimary }]}>Building Our Story</Text>
            <Text style={[styles.emptyHeroDesc, { color: themeColors.textSecondary }]}>
              Official announcements, product launches, and press releases will appear here once published from the newsroom.
            </Text>
          </View>
        </View>
      )}

      {/* TIMELINE RELEASES */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={[styles.sectionHeadingText, { color: themeColors.textPrimary }]}>Press Releases</Text>
        </View>

        {releasesList.length > 0 ? (
          <View style={styles.timelineContainer}>
            {(featured ? [{ ...featured }, ...timelineReleases] : releasesList).map((release, index, arr) => (
              <View key={release.id || release.slug || index} style={styles.timelineItem}>
                <View style={styles.timelineDotWrapper}>
                  <View style={styles.timelineDot} />
                  {index < arr.length - 1 && <View style={[styles.timelineLine, { backgroundColor: themeColors.border }]} />}
                </View>
                <TouchableOpacity
                  style={[styles.releaseCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                  activeOpacity={0.8}
                  onPress={() => openReader(release)}
                >
                  <View style={styles.dateRow}>
                    <Calendar size={12} color={BRAND_RED} />
                    <Text style={[styles.releaseDate, { color: themeColors.textSecondary }]}>{release.date}</Text>
                    {release.category ? (
                      <Text style={styles.releaseCategoryBadge}>• {release.category}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.releaseTitle, { color: themeColors.textPrimary }]}>{release.title}</Text>
                  <Text style={[styles.releaseExcerpt, { color: themeColors.textSecondary }]} numberOfLines={2}>
                    {release.excerpt}
                  </Text>
                  <View style={styles.readMoreRow}>
                    <Text style={styles.readMoreTextSmall}>Read Full Release</Text>
                    <ArrowRight size={11} color={BRAND_RED} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.emptyBoxText, { color: themeColors.textSecondary }]}>No press releases published yet.</Text>
          </View>
        )}
      </View>

      {/* REMISE AT A GLANCE */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={[styles.sectionHeadingText, { color: themeColors.textPrimary }]}>Remise at a Glance</Text>
        </View>

        <View style={styles.glanceRow}>
          {AT_A_GLANCE.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={[styles.glanceCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.glanceIconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={[styles.glanceLabel, { color: themeColors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.glanceSub, { color: themeColors.textSecondary }]}>{item.sub}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* IN THE NEWS */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={[styles.sectionHeadingText, { color: themeColors.textPrimary }]}>In the News</Text>
        </View>

        <View style={[styles.newsEmptyCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Sparkles size={24} color={BRAND_RED} style={{ marginBottom: Spacing.sm }} />
          <Text style={[styles.newsEmptyTitle, { color: themeColors.textPrimary }]}>Building Our Story</Text>
          <Text style={[styles.newsEmptyDesc, { color: themeColors.textSecondary }]}>
            Remise is continuously growing. Media coverage and articles will appear here as we expand.
          </Text>
        </View>
      </View>

      {/* MEDIA KIT */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={[styles.sectionHeadingText, { color: themeColors.textPrimary }]}>Media Resources</Text>
        </View>

        <View style={{ gap: Spacing.sm }}>
          {MEDIA_KIT.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={[styles.mediaKitCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.mediaKitIconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.mediaKitTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.mediaKitDesc, { color: themeColors.textSecondary }]}>{item.desc}</Text>
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
        <View style={[styles.aboutCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={styles.aboutTag}>About Remise</Text>
          <Text style={[styles.aboutText, { color: themeColors.textSecondary }]}>
            Remise is a local commerce and product discovery platform that connects customers with
            nearby businesses. Customers can discover products, compare available options, choose
            stores, and place orders directly through the platform.
          </Text>
        </View>
      </View>

      {/* PRESS CONTACT CTA */}
      <View style={[styles.contactCard, { backgroundColor: themeColors.card, borderColor: isDark ? 'rgba(255,0,0,0.4)' : '#FCA5A5' }]}>
        <View style={styles.contactIconCircle}>
          <Mail size={22} color="#FFFFFF" />
        </View>
        <Text style={[styles.contactTitle, { color: themeColors.textPrimary }]}>Media & Press Contact</Text>
        <Text style={[styles.contactSubtitle, { color: themeColors.textSecondary }]}>
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

      {/* PRESS RELEASE READER MODAL */}
      <Modal
        visible={readerModalVisible}
        animationType="slide"
        onRequestClose={() => setReaderModalVisible(false)}
      >
        <View style={[styles.readerModal, { backgroundColor: themeColors.bg }]}>
          <View style={[styles.readerHeader, { borderBottomColor: themeColors.border, backgroundColor: themeColors.card }]}>
            <TouchableOpacity
              style={styles.readerCloseBtn}
              onPress={() => setReaderModalVisible(false)}
            >
              <X size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.readerHeaderCategory, { color: themeColors.textPrimary }]}>
              {selectedRelease?.category || 'Press Release'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedRelease && (
            <ScrollView
              style={styles.readerBody}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              <View style={styles.readerTagRow}>
                <Text style={styles.readerCategoryTag}>{selectedRelease.category || 'Official Release'}</Text>
                <Text style={styles.readerDot}>•</Text>
                <Text style={[styles.readerMetaText, { color: themeColors.textSecondary }]}>{selectedRelease.date}</Text>
                {selectedRelease.location ? (
                  <>
                    <Text style={styles.readerDot}>•</Text>
                    <Text style={[styles.readerMetaText, { color: themeColors.textSecondary }]}>{selectedRelease.location}</Text>
                  </>
                ) : null}
              </View>

              <Text style={[styles.readerTitle, { color: themeColors.textPrimary }]}>{selectedRelease.title}</Text>
              <Text style={[styles.readerExcerpt, { color: themeColors.textSecondary }]}>{selectedRelease.excerpt}</Text>

              {selectedRelease.contactName ? (
                <View style={styles.readerAuthorRow}>
                  <User size={13} color={themeColors.textSecondary} />
                  <Text style={[styles.readerAuthorText, { color: themeColors.textSecondary }]}>
                    Contact: {selectedRelease.contactName} ({selectedRelease.contactEmail || 'porulontechnologies@gmail.com'})
                  </Text>
                </View>
              ) : null}

              <View style={styles.readerParagraphs}>
                {(selectedRelease.body && selectedRelease.body.length > 0
                  ? selectedRelease.body
                  : [selectedRelease.excerpt]
                ).map((para, i) => (
                  <Text key={i} style={[styles.readerParagraph, { color: themeColors.textPrimary }]}>
                    {para}
                  </Text>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  heroSubtitle: { fontSize: FontSizes.sm, lineHeight: 21 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  headingBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: BRAND_RED },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  featuredCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  featuredTagText: { fontSize: 10, fontWeight: '800', color: BRAND_RED, letterSpacing: 0.5 },
  featuredCategoryText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredDate: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  featuredTitle: { fontSize: FontSizes.lg, fontWeight: '900', marginBottom: Spacing.xs, lineHeight: 24 },
  featuredExcerpt: { fontSize: FontSizes.sm, lineHeight: 20, marginBottom: Spacing.sm },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  readMoreText: { fontSize: 11, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase' },
  readMoreTextSmall: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase' },

  emptyHeroCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyHeroTitle: { fontSize: FontSizes.base, fontWeight: '800', marginBottom: 4 },
  emptyHeroDesc: { fontSize: FontSizes.xs, textAlign: 'center', lineHeight: 18 },

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
    marginTop: 4,
  },
  releaseCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  releaseDate: { fontSize: 11, fontWeight: '700' },
  releaseCategoryBadge: { fontSize: 10, fontWeight: '700', color: BRAND_RED },
  releaseTitle: { fontSize: FontSizes.sm, fontWeight: '800', marginBottom: 4, lineHeight: 19 },
  releaseExcerpt: { fontSize: FontSizes.xs, lineHeight: 16, marginBottom: Spacing.xs },

  emptyBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyBoxText: { fontSize: FontSizes.sm },

  glanceRow: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'space-between' },
  glanceCard: {
    flex: 1,
    borderWidth: 1,
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
  glanceLabel: { fontSize: FontSizes.xs, fontWeight: '800', textAlign: 'center' },
  glanceSub: { fontSize: 10, textAlign: 'center', marginTop: 2 },

  newsEmptyCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  newsEmptyTitle: { fontSize: FontSizes.base, fontWeight: '800', marginBottom: Spacing.xs },
  newsEmptyDesc: { fontSize: FontSizes.xs, textAlign: 'center', lineHeight: 18 },

  mediaKitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
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
  mediaKitTitle: { fontSize: FontSizes.sm, fontWeight: '800', marginBottom: 2 },
  mediaKitDesc: { fontSize: FontSizes.xs },
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
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  aboutTag: { fontSize: 10, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs },
  aboutText: { fontSize: FontSizes.xs, lineHeight: 18 },

  contactCard: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    borderWidth: 1,
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
  contactTitle: { fontSize: FontSizes.base, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.xs },
  contactSubtitle: { fontSize: FontSizes.xs, textAlign: 'center', lineHeight: 18, marginBottom: Spacing.sm },
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

  // Reader Modal Styles
  readerModal: { flex: 1 },
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  readerCloseBtn: { padding: Spacing.xs },
  readerHeaderCategory: { fontSize: FontSizes.sm, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  readerBody: { padding: Spacing.lg },
  readerTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  readerCategoryTag: { fontSize: 11, fontWeight: '800', color: BRAND_RED, textTransform: 'uppercase', letterSpacing: 0.5 },
  readerDot: { fontSize: 12, color: '#9CA3AF' },
  readerMetaText: { fontSize: 11 },
  readerTitle: { fontSize: FontSizes.xl ?? 24, fontWeight: '900', marginBottom: Spacing.sm, lineHeight: 30 },
  readerExcerpt: { fontSize: FontSizes.sm, lineHeight: 22, marginBottom: Spacing.md },
  readerAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.lg },
  readerAuthorText: { fontSize: 11, fontWeight: '600' },
  readerParagraphs: { gap: Spacing.md },
  readerParagraph: { fontSize: FontSizes.sm, lineHeight: 24 },
});
