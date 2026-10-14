import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageStyle,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Star,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Store,
  Sparkles,
} from 'lucide-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { storeApi } from '../../api/storeApi';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, getStoreReviewModalTranslations } from '../../i18n';
import { CustomerColors } from '../../styles/theme';

export interface StoreReviewCriteria {
  price: number;
  distance: number;
  deliveryTime: number;
  stockAvailability: number;
  shopRating: number;
  sellerReliability: number;
  serviceQuality: number;
  offers: number;
  repeatPreference: number;
  returnResolution: number;
}

export const CRITERIA_DEFINITIONS: {
  key: keyof StoreReviewCriteria;
  label: string;
  description: string;
}[] = [
  { key: 'price', label: 'Price', description: 'Fair pricing, competitiveness & overall value for money' },
  { key: 'distance', label: 'Distance', description: 'Convenience, proximity & location accessibility' },
  { key: 'deliveryTime', label: 'Delivery Time', description: 'Speed, timeliness and promptness of fulfillment' },
  { key: 'stockAvailability', label: 'Stock Availability', description: 'In-stock items and accurate product availability' },
  { key: 'shopRating', label: 'Shop Rating', description: 'Overall satisfaction with store presentation & service' },
  { key: 'sellerReliability', label: 'Seller Reliability', description: 'Trustworthiness, order accuracy & clear communication' },
  { key: 'serviceQuality', label: 'Delivery / Service Quality', description: 'Careful packaging, item condition & polite service' },
  { key: 'offers', label: 'Offers', description: 'Attractive discounts, promotional deals & rewards' },
  { key: 'repeatPreference', label: 'Repeat Customer Preference', description: 'Likelihood to purchase from this store again' },
  { key: 'returnResolution', label: 'Exchange / Problem Resolution', description: 'Efficiency in handling issues, queries or returns' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

interface StoreReviewModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  storeId?: string;
  storeName?: string;
  onSuccess?: (reviewData?: any) => void;
  onSubmitted?: (reviewData?: any) => void;
}

export default function StoreReviewModal({
  visible,
  onClose,
  orderId,
  storeId,
  storeName,
  onSuccess,
  onSubmitted,
}: StoreReviewModalProps) {
  const { isDark } = useTheme();
  const { language, t } = useTranslation();
  const tr = useMemo(() => getStoreReviewModalTranslations(language), [language]);
  const criteriaList = tr.criteriaList || CRITERIA_DEFINITIONS;

  const [ratings, setRatings] = useState<Partial<StoreReviewCriteria>>({});
  const [reviewText, setReviewText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!visible || !orderId) return;

    setErrorMsg('');
    setIsSuccess(false);
    setCheckingEligibility(true);

    Promise.allSettled([
      storeApi.checkReviewEligibility(orderId, storeId),
      storeApi.getMyReviews(),
    ])
      .then(([eligibilityRes, myReviewsRes]) => {
        let data =
          eligibilityRes.status === 'fulfilled' ? eligibilityRes.value?.data : null;
        const myReviews: any[] =
          myReviewsRes.status === 'fulfilled' && myReviewsRes.value?.data?.data
            ? myReviewsRes.value.data.data
            : [];

        // Check if customer already reviewed this store across ANY past review
        const currentStoreName = (storeName || data?.storeName || '').trim().toLowerCase();
        const currentStoreId = String(storeId || data?.storeId || '').trim();

        const priorReview = myReviews.find((r: any) => {
          if (!r) return false;
          // Match by same order
          if (r.orderId && String(r.orderId).trim() === String(orderId).trim()) return true;
          // Match by store ID
          if (currentStoreId && r.storeId && String(r.storeId).trim() === currentStoreId) return true;
          // Match by store Name (e.g. "Rohinishop")
          if (
            currentStoreName &&
            r.storeName &&
            r.storeName.trim().toLowerCase() === currentStoreName
          ) {
            return true;
          }
          return false;
        });

        if (priorReview) {
          data = {
            ...(data || {}),
            eligible: false,
            alreadyReviewed: true,
            existingReview: {
              reviewId: priorReview._id || priorReview.reviewId,
              overallRating: priorReview.overallRating,
              submittedAt: priorReview.createdAt,
            },
            message: tr.errors.alreadyReviewed,
          };
        }

        setEligibilityData(data);
        if (!data?.eligible) {
          if (data?.alreadyReviewed) {
            setErrorMsg(tr.errors.alreadyReviewed);
          } else {
            setErrorMsg(data?.message || tr.errors.notEligible);
          }
        }
      })
      .catch((err: any) => {
        const msg =
          err.response?.data?.message ||
          tr.errors.verifyFailed;
        setErrorMsg(msg);
      })
      .finally(() => {
        setCheckingEligibility(false);
      });
  }, [visible, orderId, storeId, storeName, tr]);

  // Live average calculation
  const { overallScore, ratedCount } = useMemo(() => {
    const keys = criteriaList.map(c => c.key);
    let sum = 0;
    let count = 0;
    keys.forEach(k => {
      if (typeof ratings[k] === 'number' && ratings[k]! >= 1 && ratings[k]! <= 5) {
        sum += ratings[k]!;
        count++;
      }
    });
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    return { overallScore: avg, ratedCount: count };
  }, [ratings, criteriaList]);

  const handleStarSelect = (key: keyof StoreReviewCriteria, star: number) => {
    setRatings(prev => ({ ...prev, [key]: star }));
    setErrorMsg('');
  };

  const handlePickImage = async () => {
    if (selectedPhotos.length >= 5) {
      Alert.alert(tr.addPhotosTitle, 'Maximum 5 images allowed.');
      return;
    }

    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
        selectionLimit: 5 - selectedPhotos.length,
      });

      if (res.assets && res.assets.length > 0) {
        const validAssets = res.assets.filter(a => !!a.uri);
        setSelectedPhotos(prev => [...prev, ...validAssets].slice(0, 5));
      }
    } catch {
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (eligibilityData?.alreadyReviewed) {
      setErrorMsg(tr.errors.alreadyReviewed);
      return;
    }

    const missingCriteria = criteriaList.filter(
      c => typeof ratings[c.key] !== 'number' || ratings[c.key]! < 1,
    );

    if (missingCriteria.length > 0) {
      setErrorMsg(
        `${tr.errors.allRequiredAlert} (${10 - missingCriteria.length}/10)`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const targetStoreId = storeId || eligibilityData?.storeId || '';

      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('storeId', targetStoreId);
      formData.append('criterionRatings', JSON.stringify(ratings));
      formData.append('reviewText', reviewText.trim());

      selectedPhotos.forEach((photo, idx) => {
        if (photo.uri) {
          const filename = photo.fileName || `review-photo-${idx}.jpg`;
          const type = photo.type || 'image/jpeg';
          formData.append('images', {
            uri: photo.uri,
            name: filename,
            type,
          } as any);
        }
      });

      const res: any = await storeApi.submitReview(formData);
      setIsSuccess(true);
      if (onSuccess) onSuccess(res.data?.data);
      if (onSubmitted) onSubmitted(res.data?.data);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        tr.errors.reviewFailedDesc;
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayStoreName =
    storeName || eligibilityData?.storeName || 'Partner Store';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E5E7EB' },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? '#1F2937' : '#E5E7EB' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, marginRight: 8 }}>
              <View style={styles.storeAvatar}>
                <Store size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}
                  numberOfLines={1}
                >
                  {t('orders.rateYourStore')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                  <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
                    {displayStoreName} · #{orderId.slice(-8).toUpperCase()}
                  </Text>
                  <View style={styles.verifiedPill}>
                    <Text style={styles.verifiedPillText}>{tr.verifiedBadge}</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {checkingEligibility ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={CustomerColors.teal700} />
              <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {tr.verifyingEligibility}
              </Text>
            </View>
          ) : isSuccess ? (
            <View style={styles.centerContainer}>
              <CheckCircle2 size={56} color="#16A34A" />
              <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {tr.reviewSubmittedTitle}
              </Text>
              <Text style={styles.successSub}>
                {tr.reviewSubmittedDesc.replace('{{name}}', displayStoreName)}
              </Text>
            </View>
          ) : eligibilityData && !eligibilityData.eligible && eligibilityData.alreadyReviewed ? (
            <View style={styles.centerContainer}>
              <View style={[styles.statusIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <CheckCircle2 size={40} color="#16A34A" />
              </View>
              <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {tr.alreadyReviewedTitle}
              </Text>
              <Text style={styles.successSub}>
                {tr.alreadyReviewedDesc}
              </Text>

              {eligibilityData.existingReview?.overallRating ? (
                <View style={[styles.existingRatingBadge, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                  <Text style={[styles.existingRatingLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {tr.yourSubmittedRating}:
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.existingRatingScore, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {Number(eligibilityData.existingReview.overallRating).toFixed(1)} / 5.0
                    </Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.fullWidthCloseBtn, { backgroundColor: CustomerColors.teal700 }]}
                onPress={onClose}
              >
                <Text style={styles.fullWidthCloseBtnText}>{tr.closeBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : eligibilityData && !eligibilityData.eligible ? (
            <View style={styles.centerContainer}>
              <View style={[styles.statusIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <AlertCircle size={40} color="#DC2626" />
              </View>
              <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {tr.notEligibleTitle}
              </Text>
              <Text style={styles.successSub}>
                {eligibilityData.message || tr.errors.notEligible}
              </Text>
              <TouchableOpacity
                style={[styles.fullWidthCloseBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB', marginTop: 20 }]}
                onPress={onClose}
              >
                <Text style={[styles.fullWidthCloseBtnText, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>{tr.closeBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Overall Rating Score Banner */}
              <View
                style={[
                  styles.overallBanner,
                  { backgroundColor: isDark ? '#1E293B' : '#F0FDFA', borderColor: isDark ? '#334155' : '#CCFBF1' },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, marginRight: 8 }}>
                  <View style={styles.bigStarBadge}>
                    <Text style={styles.bigStarBadgeText}>★</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                      <Text style={[styles.scoreNumber, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        {overallScore > 0 ? overallScore.toFixed(1) : '—'}
                      </Text>
                      <Text
                        style={[styles.scoreScale, { color: isDark ? '#9CA3AF' : '#64748B' }]}
                        numberOfLines={1}
                      >
                        {tr.overallScoreSuffix}
                      </Text>
                    </View>
                    <Text
                      style={[styles.ratedCountText, { color: isDark ? '#94A3B8' : '#64748B' }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {ratedCount === 10
                        ? tr.allCriteriaRated
                        : tr.criteriaRatedCount.replace('{{count}}', String(ratedCount))}
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeCol}>
                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor:
                          overallScore >= 4
                            ? '#DCFCE7'
                            : overallScore >= 3
                            ? '#FEF3C7'
                            : overallScore > 0
                            ? '#FFE4E6'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        {
                          color:
                            overallScore >= 4
                              ? '#166534'
                              : overallScore >= 3
                              ? '#92400E'
                              : overallScore > 0
                              ? '#9F1239'
                              : '#64748B',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {overallScore >= 4.5
                        ? tr.tiers.outstanding
                        : overallScore >= 3.5
                        ? tr.tiers.veryGood
                        : overallScore >= 2.5
                        ? tr.tiers.average
                        : overallScore > 0
                        ? tr.tiers.fair
                        : tr.tiers.pending}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Error Message */}
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <AlertCircle size={15} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* 10 Criteria List */}
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}
                  numberOfLines={2}
                >
                  {tr.ratingCriteriaTitle}
                </Text>
                <Text style={[styles.sectionSub, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}>
                  {tr.allRequired}
                </Text>
              </View>

              <View style={styles.criteriaList}>
                {criteriaList.map((crit, idx) => {
                  const currentRating = ratings[crit.key] || 0;

                  return (
                    <View
                      key={crit.key}
                      style={[
                        styles.criteriaCard,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                          borderColor: currentRating > 0 ? CustomerColors.teal700 : isDark ? '#334155' : '#E5E7EB',
                        },
                      ]}
                    >
                      <View style={styles.critHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.critLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                            {idx + 1}. {crit.label}
                          </Text>
                          <Text style={[styles.critDesc, { color: isDark ? '#CBD5E1' : '#6B7280' }]}>
                            {crit.description}
                          </Text>
                        </View>
                        {currentRating > 0 ? (
                          <Text style={styles.critScoreLabel}>
                            {tr.ratingLabels[currentRating] || RATING_LABELS[currentRating]}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const isFilled = star <= currentRating;
                          return (
                            <TouchableOpacity
                              key={star}
                              onPress={() => handleStarSelect(crit.key, star)}
                              style={styles.starTouchTarget}
                            >
                              <Star
                                size={26}
                                color={isFilled ? '#F59E0B' : isDark ? '#4B5563' : '#D1D5DB'}
                                fill={isFilled ? '#F59E0B' : 'transparent'}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Review Description */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}>
                  {tr.reviewTextTitle}
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: isDark ? '#FFFFFF' : '#111827',
                      borderColor: isDark ? '#374151' : '#E5E7EB',
                    },
                  ]}
                  placeholder={tr.reviewPlaceholder}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  multiline
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                  maxLength={1000}
                />
              </View>

              {/* Upload Photos */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}>
                  {tr.addPhotosTitle}
                </Text>
                <View style={styles.photosRow}>
                  {selectedPhotos.map((photo, idx) => (
                    <View key={idx} style={styles.photoThumb}>
                      {photo.uri ? (
                        <Image source={{ uri: photo.uri }} style={styles.photoImg} />
                      ) : null}
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => handleRemovePhoto(idx)}
                      >
                        <Trash2 size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {selectedPhotos.length < 5 && (
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage}>
                      <Camera size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text style={styles.addPhotoText}>{tr.addPhotoBtn}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (isSubmitting || ratedCount < 10) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || ratedCount < 10}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Sparkles size={16} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>{tr.submitBtn}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.cancelBtnText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                    {tr.cancelBtn}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  storeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: CustomerColors.teal700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  verifiedPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  centerContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  successSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  overallBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigStarBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigStarBadgeText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  scoreScale: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  ratedCountText: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    minWidth: 0,
  },
  sectionSub: {
    fontSize: 11,
    color: CustomerColors.teal700,
    fontWeight: '700',
    flexShrink: 0,
  },
  criteriaList: {
    gap: 10,
  },
  criteriaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  critHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  critLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  critDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  critScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  starTouchTarget: {
    padding: 4,
  },
  section: {
    gap: 6,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  removePhotoBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 72,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  addPhotoText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 11,
  },
  buttonRow: {
    gap: 10,
    marginTop: 8,
    paddingBottom: 24,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CustomerColors.teal700,
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  existingRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  existingRatingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  existingRatingScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  fullWidthCloseBtn: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 20,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
