import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { blogLifestyleApi } from '../../api/contentApi';
import { GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/about/ToyBlogLifestyle.tsx — same GET
// /blog-lifestyle content shape (featuredArticle, articles, timeline,
// testimonials, admin-managed via admin/blog-lifestyle). Reproduced as a
// simple vertical content feed rather than the desktop's parallax hero +
// multi-section scroll animation, per the plan's "redesign the UI" rule.
export default function AboutScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogLifestyleApi
      .get()
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GoldColors.gold} />
      </View>
    );
  }

  const featured = data?.featuredArticle;
  const articles: any[] = data?.articles ?? [];
  const timeline: any[] = data?.timeline ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {featured && (
        <View style={styles.featuredCard}>
          {featured.image ? <Image source={{ uri: featured.image }} style={styles.featuredImage} /> : null}
          <View style={{ padding: Spacing.lg }}>
            <Text style={styles.featuredCategory}>{featured.category}</Text>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
          </View>
        </View>
      )}

      {articles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stories</Text>
          {articles.map((a, i) => (
            <View key={i} style={styles.articleCard}>
              {a.image ? <Image source={{ uri: a.image }} style={styles.articleImage} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.articleCategory}>{a.category}</Text>
                <Text style={styles.articleTitle} numberOfLines={2}>{a.title}</Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>{a.excerpt}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          {timeline.map((t, i) => (
            <View key={i} style={styles.timelineRow}>
              <Text style={[styles.timelineYear, t.highlight && styles.timelineYearHighlight]}>{t.year}</Text>
              <Text style={styles.timelineEvent}>{t.event}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A' },
  featuredCard: { backgroundColor: '#111', margin: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  featuredImage: { width: '100%', height: 180, backgroundColor: '#1a1a1a' },
  featuredCategory: { fontSize: 10, fontWeight: '800', color: GoldColors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  featuredTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#F0EAD6', marginTop: Spacing.xs },
  featuredExcerpt: { fontSize: FontSizes.sm, color: '#9A8E7A', marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '800', color: GoldColors.gold, marginBottom: Spacing.sm },
  articleCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#111', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#222', padding: Spacing.md, marginBottom: Spacing.sm },
  articleImage: { width: 64, height: 64, borderRadius: BorderRadius.sm, backgroundColor: '#1a1a1a' },
  articleCategory: { fontSize: 9, fontWeight: '800', color: GoldColors.gold, textTransform: 'uppercase' },
  articleTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#F0EAD6', marginTop: 2 },
  articleExcerpt: { fontSize: FontSizes.xs, color: '#7A7060', marginTop: 2 },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#1C1C1C' },
  timelineYear: { width: 56, fontSize: FontSizes.sm, fontWeight: '800', color: '#7A7060' },
  timelineYearHighlight: { color: GoldColors.gold },
  timelineEvent: { flex: 1, fontSize: FontSizes.sm, color: '#C8BCA8' },
});
