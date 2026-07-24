import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { testimonialsApi } from '../../api/contentApi';
import { GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/testimonials/page.tsx — same GET
// /enhanced-testimonials shape (hero/spotlight/cta page-settings + a
// reviews array), admin-managed via admin/testimonials. Reproduced as a
// simple vertical feed (hero banner + spotlight quote + review cards)
// rather than the desktop's marquee-scroll animation.
export default function TestimonialsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testimonialsApi
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

  const hero = data?.hero;
  const spotlight = data?.spotlight;
  const reviews: any[] = data?.reviews ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
      {hero && (
        <View style={styles.heroCard}>
          {hero.badge ? <Text style={styles.heroBadge}>{hero.badge}</Text> : null}
          <Text style={styles.heroTitle}>
            {hero.title}{hero.titleHighlight ? <Text style={styles.heroTitleHighlight}> {hero.titleHighlight}</Text> : null}
          </Text>
          {hero.subtitle ? <Text style={styles.heroSubtitle}>{hero.subtitle}</Text> : null}
        </View>
      )}

      {spotlight && (
        <View style={styles.spotlightCard}>
          {spotlight.image ? <Image source={{ uri: spotlight.image }} style={styles.spotlightImage} /> : null}
          <Text style={styles.spotlightQuote}>&ldquo;{spotlight.quote}&rdquo;</Text>
          <Text style={styles.spotlightName}>{spotlight.name}</Text>
          <Text style={styles.spotlightRole}>{spotlight.role}</Text>
        </View>
      )}

      {reviews.map((r, i) => (
        <View key={i} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {r.image ? <Image source={{ uri: r.image }} style={styles.reviewAvatar} /> : <View style={styles.reviewAvatarFallback} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewName}>{r.name}</Text>
              {r.role ? <Text style={styles.reviewRole}>{r.role}</Text> : null}
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={12} color={GoldColors.gold} fill={s < (r.rating ?? 5) ? GoldColors.gold : 'none'} />
              ))}
            </View>
          </View>
          <Text style={styles.reviewText}>{r.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  heroCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  heroBadge: { fontSize: 10, fontWeight: '800', color: GoldColors.goldDark, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.xs },
  heroTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  heroTitleHighlight: { color: GoldColors.goldDark },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#6B7280', textAlign: 'center', marginTop: Spacing.xs },
  spotlightCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#EAEAEA', padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg },
  spotlightImage: { width: 56, height: 56, borderRadius: 28, marginBottom: Spacing.sm },
  spotlightQuote: { fontSize: FontSizes.base, fontStyle: 'italic', color: '#374151', textAlign: 'center', marginBottom: Spacing.sm },
  spotlightName: { fontSize: FontSizes.sm, fontWeight: '800', color: '#1F2937' },
  spotlightRole: { fontSize: FontSizes.xs, color: '#6B7280' },
  reviewCard: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#EAEAEA', padding: Spacing.md, marginBottom: Spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EAD6' },
  reviewName: { fontSize: FontSizes.sm, fontWeight: '700', color: '#1F2937' },
  reviewRole: { fontSize: FontSizes.xs, color: '#6B7280' },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: FontSizes.sm, color: '#4B5563' },
});
