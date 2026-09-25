import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Plus,
  Tag,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import { useOptionalStoreDashboard } from '../../context/StoreDashboardContext';
import { useOptionalSellerDashboard } from '../../context/SellerDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { offersApi } from '../../api/offersApi';
import { GATEWAY_URL } from '../../api/endpoints';
import { resolveImageUrl } from '../../utils/imageUrl';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

export default function StoreOffersScreen() {
  const navigation = useNavigation<any>();
  const storeDash = useOptionalStoreDashboard();
  const sellerDash = useOptionalSellerDashboard();
  const dash = (storeDash && storeDash.store) ? storeDash : ((sellerDash && sellerDash.store) ? sellerDash : (storeDash || sellerDash || {}));
  const { offers = [], loading = false, refresh = () => {} } = dash as any;
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const [deleteTargetOffer, setDeleteTargetOffer] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTargetOffer) return;
    setDeleting(deleteTargetOffer._id);
    try {
      await offersApi.delete(deleteTargetOffer._id);
      refresh();
      setDeleteTargetOffer(null);
    } catch {
      Alert.alert('Error', 'Failed to delete offer.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>
          {offers.length} offer{offers.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('NewOffer')}
        >
          <Plus size={14} color="#fff" />
          <Text style={styles.newBtnText}>New Offer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        keyExtractor={o => o._id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Tag size={40} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptySubtitle}>
              Publish location-based deals to attract nearby customers.
            </Text>
          </View>
        }
        renderItem={({ item: offer }) => {
          const expired = new Date(offer.validUntil) < new Date();
          const imageUri = resolveImageUrl(offer.image);
          return (
            <View style={[styles.card, expired && styles.cardExpired]}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                {offer.discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{offer.discountPercent}% OFF</Text>
                  </View>
                )}
                {offer.targetCustomerId && (
                  <View style={styles.privateBadge}>
                    <Text style={styles.privateBadgeText} numberOfLines={1}>Private · {offer.targetCustomerName}</Text>
                  </View>
                )}
                {expired && (
                  <View style={styles.expiredOverlay}>
                    <Text style={styles.expiredText}>EXPIRED</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.title} numberOfLines={1}>
                  {offer.title}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{offer.offerPrice}</Text>
                  <Text style={styles.originalPrice}>
                    ₹{offer.originalPrice}
                  </Text>
                </View>
                <View style={styles.validRow}>
                  <Clock size={9} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
                  <Text style={styles.validText}>
                    Until{' '}
                    {new Date(offer.validUntil).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('NewOffer', { offer })}
                  >
                    <Edit2 size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setDeleteTargetOffer(offer)}
                    disabled={deleting === offer._id}
                  >
                    <Trash2 size={12} color={isDark ? '#F87171' : CustomerColors.primary} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={Boolean(deleteTargetOffer)}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTargetOffer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.deleteIconWrap}>
              <Trash2 size={26} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Delete this offer?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to delete "{deleteTargetOffer?.title}"? This offer will be removed from customer feeds.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTargetOffer(null)}
                disabled={Boolean(deleting)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={confirmDelete}
                disabled={Boolean(deleting)}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
    },
    count: { fontSize: FontSizes.sm, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
    newBtn: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      backgroundColor: CustomerColors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    newBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
    list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
    empty: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
      gap: Spacing.xs,
    },
    emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: isDark ? '#9CA3AF' : '#374151' },
    emptySubtitle: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
    },
    card: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      overflow: 'hidden',
      marginBottom: Spacing.sm,
    },
    cardExpired: { opacity: 0.7 },
    imageWrap: { width: '100%', height: 120, backgroundColor: isDark ? '#1F2937' : '#F5F5F5', overflow: 'hidden', position: 'relative' },
    image: { width: '100%', height: '100%' },
    discountBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: CustomerColors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    discountBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    expiredOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    expiredText: {
      backgroundColor: '#1F2937',
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
    },
    cardBody: { padding: Spacing.sm },
    title: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
      marginTop: 4,
    },
    price: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    originalPrice: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textDecorationLine: 'line-through',
    },
    validRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    validText: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? 'rgba(45,212,191,0.1)' : '#DFF1F1',
    },
    editBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEE2E2',
    },
    deleteBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#F87171' : CustomerColors.primary,
    },
    privateBadge: { position: 'absolute', top: 6, right: 6, maxWidth: '70%', backgroundColor: '#7C3AED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    privateBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    deleteIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    modalTitle: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginBottom: 6,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: Spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F2937' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E2E8F0',
    },
    cancelBtnText: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#E5E7EB' : '#475569',
    },
    confirmDeleteBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#DC2626',
    },
    confirmDeleteBtnText: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
