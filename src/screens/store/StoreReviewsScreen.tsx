import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Star,
  ShieldCheck,
  PackageCheck,
  ChevronRight,
  ChevronDown,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import { storeApi } from '../../api/storeApi';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { resolveImageUrl } from '../../utils/imageUrl';

const CRITERIA_LABELS: Record<string, string> = {
  price: 'Affordable / Fair Price',
  distance: 'Distance / Accessibility',
  deliveryTime: 'Speed / Delivery Time',
  stockAvailability: 'Stock / Item Availability',
  shopRating: 'Shop Ambiance / Cleanliness',
  sellerReliability: 'Seller Reliability',
  serviceQuality: 'Service Quality / Behavior',
  offers: 'Offers & Discounts',
  repeatPreference: 'Repeat Shopping Preference',
  returnResolution: 'Return & Issue Resolution',
};

export default function StoreReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { store } = useStoreDashboard();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async (isPull = false) => {
    try {
      if (isPull) setRefreshing(true);
      else setLoading(true);

      const res = await storeApi.getMyStoreReviews();
      if (res.data?.success) {
        setReviews(res.data.data?.reviews || []);
        setSummary(res.data.data?.summary || null);
      }
    } catch (err) {
      console.error('Failed to load store reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(false);
  }, [fetchReviews]);

  const totalReviews = summary?.reviewCount ?? reviews.length;
  const overallAvg = summary?.overallRating ?? store?.rating ?? 0;

  // Star distribution breakdown (5 to 1)
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.overallRating || 0))) as 1 | 2 | 3 | 4 | 5;
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
          <Text style={styles.loadingText}>Loading store reviews...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReviews(true)}
              colors={[CustomerColors.teal600]}
              tintColor={CustomerColors.teal600}
            />
          }
        >
          {/* ── Summary Overview Card ── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreNumber}>
                  {overallAvg ? Number(overallAvg).toFixed(1) : '0.0'}
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={18}
                      color="#D97706"
                      fill={star <= Math.round(overallAvg) ? '#D97706' : 'transparent'}
                    />
                  ))}
                </View>
                <Text style={styles.scoreCount}>
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </Text>
              </View>

              {/* Star Distribution Progress Bars */}
              <View style={styles.distCol}>
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = (starCounts as any)[stars] || 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <View key={stars} style={styles.distRow}>
                      <Text style={styles.distStarLabel}>{stars}★</Text>
                      <View style={styles.distTrack}>
                        <View style={[styles.distFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.distCountText}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 10 Criteria Performance Averages */}
            {summary?.criteriaAverages && Object.keys(summary.criteriaAverages).length > 0 && (
              <View style={styles.criteriaSection}>
                <View style={styles.criteriaHeaderRow}>
                  <Sparkles size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={styles.criteriaSectionTitle}>10 Criteria Performance Averages</Text>
                </View>
                <View style={styles.criteriaGrid}>
                  {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                    const val = summary.criteriaAverages[key] || 0;
                    return (
                      <View key={key} style={styles.criterionItem}>
                        <View style={styles.criterionTop}>
                          <Text style={styles.criterionLabel} numberOfLines={1}>{label}</Text>
                          <View style={styles.criterionScore}>
                            <Star size={10} color="#D97706" fill="#D97706" />
                            <Text style={styles.criterionScoreText}>{Number(val).toFixed(1)}</Text>
                          </View>
                        </View>
                        <View style={styles.criterionTrack}>
                          <View style={[styles.criterionFill, { width: `${(val / 5) * 100}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* ── Customer Reviews List ── */}
          <View style={styles.reviewsListHeader}>
            <Text style={styles.reviewsListTitle}>Customer Reviews</Text>
            <Text style={styles.reviewsListSubtitle}>
              Verified fulfillment & OTP confirmed
            </Text>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <MessageSquare size={36} color={isDark ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>
                Customer reviews and ratings will show here once orders are picked up or delivered and OTP verified.
              </Text>
            </View>
          ) : (
            reviews.map(item => {
              const isExpanded = expandedReviewId === item._id;
              return (
                <View key={item._id} style={styles.reviewCard}>
                  {/* Review Header: User Info & Score */}
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(item.customerName || 'Customer').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName}>{item.customerName || 'Verified Customer'}</Text>
                      <View style={styles.badgesRow}>
                        <View style={styles.verifiedBadge}>
                          <ShieldCheck size={10} color="#059669" />
                          <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                          <PackageCheck size={10} color="#2563EB" />
                          <Text style={[styles.verifiedBadgeText, { color: '#2563EB' }]}>OTP Verified</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.reviewScoreBadge}>
                      <Star size={13} color="#D97706" fill="#D97706" />
                      <Text style={styles.reviewScoreText}>
                        {Number(item.overallRating).toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Review Text */}
                  {item.reviewText ? (
                    <Text style={styles.reviewBody}>{item.reviewText}</Text>
                  ) : null}

                  {/* Customer Review Photos */}
                  {item.images && item.images.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.photosRow}
                    >
                      {item.images.map((img: string, idx: number) => {
                        const url = resolveImageUrl(img);
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => setSelectedImage(url || null)}
                            activeOpacity={0.8}
                          >
                            <Image source={{ uri: url }} style={styles.reviewPhoto} />
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  ) : null}

                  {/* Criteria Accordion */}
                  <TouchableOpacity
                    style={styles.expandRow}
                    onPress={() => setExpandedReviewId(isExpanded ? null : item._id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.expandText}>
                      {isExpanded ? 'Hide 10 criteria breakdown' : 'View 10 criteria breakdown'}
                    </Text>
                    {isExpanded ? (
                      <ChevronDown size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    ) : (
                      <ChevronRight size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && item.ratings && (
                    <View style={styles.breakdownGrid}>
                      {Object.entries(CRITERIA_LABELS).map(([k, label]) => {
                        const score = item.ratings[k] || 0;
                        return (
                          <View key={k} style={styles.breakdownItem}>
                            <Text style={styles.breakdownLabel} numberOfLines={1}>{label}</Text>
                            <View style={styles.breakdownStars}>
                              <Star size={10} color="#D97706" fill="#D97706" />
                              <Text style={styles.breakdownScore}>{score}/5</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Footer Date & Order Id */}
                  <View style={styles.reviewFooter}>
                    <Text style={styles.reviewDate}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : ''}
                    </Text>
                    {item.orderId ? (
                      <Text style={styles.reviewOrderId}>Order #{String(item.orderId).slice(-6)}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={Boolean(selectedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setSelectedImage(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.imageModalFull}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0B0F17' : '#F4F7F9',
    },
    content: {
      padding: Spacing.md,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    loadingText: {
      marginTop: 10,
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    summaryCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      ...Shadows.card,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#F3F4F6',
    },
    scoreBlock: {
      alignItems: 'center',
      minWidth: 90,
    },
    scoreNumber: {
      fontSize: 36,
      fontWeight: '900',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      lineHeight: 40,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 2,
      marginVertical: 4,
    },
    scoreCount: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    distCol: {
      flex: 1,
      gap: 4,
    },
    distRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    distStarLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
      width: 20,
    },
    distTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      overflow: 'hidden',
    },
    distFill: {
      height: '100%',
      backgroundColor: '#D97706',
      borderRadius: 3,
    },
    distCountText: {
      fontSize: 10,
      fontWeight: '600',
      color: isDark ? '#9CA3AF' : '#9CA3AF',
      width: 18,
      textAlign: 'right',
    },
    criteriaSection: {
      marginTop: Spacing.md,
    },
    criteriaHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.sm,
    },
    criteriaSectionTitle: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    criteriaGrid: {
      gap: 8,
    },
    criterionItem: {
      gap: 3,
    },
    criterionTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    criterionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#D1D5DB' : '#4B5563',
      flex: 1,
    },
    criterionScore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    criterionScoreText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#D97706',
    },
    criterionTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      overflow: 'hidden',
    },
    criterionFill: {
      height: '100%',
      backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal600,
      borderRadius: 2,
    },
    reviewsListHeader: {
      marginBottom: Spacing.sm,
    },
    reviewsListTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    reviewsListSubtitle: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    emptyCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      ...Shadows.card,
    },
    emptyTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginTop: 10,
    },
    emptySub: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 16,
    },
    reviewCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      ...Shadows.card,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? '#115E59' : '#CCFBF1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '800',
      color: isDark ? '#5EEAD4' : CustomerColors.teal700,
    },
    customerName: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5',
      paddingHorizontal: 5,
      paddingVertical: 1.5,
      borderRadius: 4,
    },
    verifiedBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#059669',
    },
    reviewScoreBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.pill,
    },
    reviewScoreText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#D97706',
    },
    reviewBody: {
      fontSize: 12,
      color: isDark ? '#D1D5DB' : '#374151',
      lineHeight: 18,
      marginTop: 10,
    },
    photosRow: {
      gap: 8,
      marginTop: 10,
    },
    reviewPhoto: {
      width: 64,
      height: 64,
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    expandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 10,
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#F3F4F6',
    },
    expandText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    breakdownGrid: {
      backgroundColor: isDark ? '#111827' : '#F9FAFB',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginTop: 8,
      gap: 6,
    },
    breakdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    breakdownLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: isDark ? '#9CA3AF' : '#6B7280',
      flex: 1,
    },
    breakdownStars: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    breakdownScore: {
      fontSize: 10,
      fontWeight: '800',
      color: '#D97706',
    },
    reviewFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    reviewDate: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#9CA3AF',
    },
    reviewOrderId: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#9CA3AF',
      fontFamily: 'monospace',
    },
    imageModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageModalClose: {
      position: 'absolute',
      top: 40,
      right: 20,
      padding: 8,
      zIndex: 10,
    },
    imageModalFull: {
      width: '90%',
      height: '80%',
    },
  });
