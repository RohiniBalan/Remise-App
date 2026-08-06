import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tag, Clock } from 'lucide-react-native';
import { HERO_FALLBACK, HeroContent } from '../../api/heroApi';
import { offersApi } from '../../api/offersApi';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_SLIDES = 5;
const MAX_OFFER_SLIDES = MAX_SLIDES - 1; // slot 0 reserved for the default banner

interface ActiveOffer {
  _id: string;
  title: string;
  description: string;
  image: string;
  storeName: string;
  discountPercent: number;
  validUntil: string;
}

interface Slide {
  key: string;
  kind: 'default' | 'offer' | 'promo';
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  discountLabel?: string;
  validUntilLabel?: string;
  ctaText: string;
  ctaRoute: string;
  ctaParams?: Record<string, any>;
}

const FALLBACK_PROMO: Omit<Slide, 'key'>[] = [
  {
    kind: 'promo',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=800&auto=format&fit=crop&q=80',
    eyebrow: 'REMISE DEALS',
    title: 'Up to 50% Off',
    description: 'On select products across every category — no code needed.',
    ctaText: 'Shop Now',
    ctaRoute: 'Categories',
  },
  {
    kind: 'promo',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&auto=format&fit=crop&q=80',
    eyebrow: 'AROUND YOU',
    title: 'Nearby Offers',
    description: 'Discover deals from stores near you, updated in real time.',
    ctaText: 'View Offers',
    ctaRoute: 'Nearby',
  },
  {
    kind: 'promo',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&auto=format&fit=crop&q=80',
    eyebrow: 'SAVE MORE',
    title: 'Monthly / Bulk Buy',
    description: 'Scan your shopping list and find the cheapest nearby store.',
    ctaText: 'Get Started',
    ctaRoute: 'BulkPurchase',
  },
  {
    kind: 'promo',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&auto=format&fit=crop&q=80',
    eyebrow: 'LIMITED TIME',
    title: 'Flash Sales',
    description: "Don't miss out — deals that disappear fast.",
    ctaText: 'Browse Now',
    ctaRoute: 'Categories',
  },
];

export default function HeroCarousel() {
  const navigation = useNavigation<any>();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [content, setContent] = useState<HeroContent | null>(null);
  const [offers, setOffers] = useState<ActiveOffer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let offersDone = false;
    const maybeReady = () => offersDone && setReady(true);

    // NOTE: same issue as Shop by Category — /hero's live data is real but
    // unrelated content (an F1/racing collector theme) seeded on the
    // backend, not the "Everything You Need, Delivered." lifestyle-store
    // banner web actually displays. Web's fetch to that endpoint reliably
    // fails in practice and falls back to its hardcoded content, which is
    // why web consistently shows the lifestyle banner. Mobile renders the
    // same fixed HERO_FALLBACK directly here for guaranteed parity, rather
    // than racing the same flaky endpoint. Revisit once the backend's hero
    // content is reseeded to match what web is actually meant to show.
    setContent(HERO_FALLBACK);

    offersApi
      .getActive(MAX_OFFER_SLIDES)
      .then(res => setOffers(res.data?.success ? res.data.data || [] : []))
      .catch(() => setOffers([]))
      .finally(() => { offersDone = true; maybeReady(); });
  }, []);

  const defaultSlide: Slide[] = content?.carImages?.[1]
    ? [{
        key: 'default-1',
        kind: 'default',
        image: content.carImages[1],
        eyebrow: content.badgeText,
        title: `${content.title} ${content.titleGradient}`,
        description: content.description,
        ctaText: content.primaryButtonText,
        ctaRoute: 'Categories',
      }]
    : [];

  const offerSlides: Slide[] = offers.map(o => ({
    key: `offer-${o._id}`,
    kind: 'offer',
    image: o.image,
    eyebrow: o.storeName,
    title: o.title,
    description: o.description || `Special offer from ${o.storeName}`,
    discountLabel: o.discountPercent > 0 ? `${o.discountPercent}% OFF` : undefined,
    validUntilLabel: `Valid until ${new Date(o.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    ctaText: 'Shop Now',
    ctaRoute: 'Nearby',
    ctaParams: { offer: o._id },
  }));

  const fillCount = Math.max(0, MAX_OFFER_SLIDES - offerSlides.length);
  const promoSlides: Slide[] = FALLBACK_PROMO.slice(0, fillCount).map((p, i) => ({ ...p, key: `promo-${i}` }));

  const slides = [...defaultSlide, ...offerSlides, ...promoSlides];

  // autoplay
  useEffect(() => {
    if (!ready || slides.length < 2) return;
    const id = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % slides.length;
        listRef.current?.scrollToOffset({ offset: next * SCREEN_W, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [ready, slides.length]);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setIndex(i);
  }, []);

  if (!ready || slides.length === 0) {
    return <View style={styles.loadingBox} />;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_W }]}>
            <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
            <View style={styles.slideOverlay}>
              <View style={styles.badgeRow}>
                <View style={styles.eyebrowPill}>
                  <Text style={styles.eyebrowText}>{item.eyebrow}</Text>
                </View>
                {item.discountLabel && (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountText}>{item.discountLabel}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.slideDesc} numberOfLines={2}>{item.description}</Text>
              {item.validUntilLabel && (
                <View style={styles.validRow}>
                  <Clock size={11} color={CustomerColors.white} />
                  <Text style={styles.validText}>{item.validUntilLabel}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => navigation.navigate(item.ctaRoute, item.ctaParams)}
              >
                <Text style={styles.ctaText}>{item.ctaText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { height: 220, backgroundColor: CustomerColors.bg },
  slide: { height: 220 },
  slideImage: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
  slideOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badgeRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xs },
  eyebrowPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(212,175,55,0.85)',
  },
  eyebrowText: { fontSize: FontSizes.xs, fontWeight: '800', color: CustomerColors.black },
  discountPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.primary,
  },
  discountText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#fff' },
  slideTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff' },
  slideDesc: { fontSize: FontSizes.sm, color: '#f0f0f0', marginTop: 2 },
  validRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  validText: { fontSize: FontSizes.xs, color: '#f0f0f0', fontWeight: '600' },
  ctaBtn: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.primary,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CustomerColors.border },
  dotActive: { width: 16, backgroundColor: GoldColors.gold },
});