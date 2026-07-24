import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Plus,
  Tag,
  Clock,
  Eye,
  ShoppingBag,
  Trash2,
} from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { offersApi } from '../../api/offersApi';
import { GATEWAY_URL } from '../../api/endpoints';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

// Ported from client/app/store/dashboard/page.tsx's OffersTab — same grid
// (discount badge, expired overlay, view/order counts), same delete
// confirm, same "New Offer" entry point (app/store/offers/new/page.tsx).
export default function StoreOffersScreen() {
  const navigation = useNavigation<any>();
  const { offers, loading, refresh } = useStoreDashboard();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    Alert.alert('Delete this offer?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(id);
          try {
            await offersApi.delete(id);
            refresh();
          } catch {
            Alert.alert('Error', 'Failed to delete offer.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.teal700} />
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
            <Tag size={40} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptySubtitle}>
              Publish location-based deals to attract nearby customers.
            </Text>
          </View>
        }
        renderItem={({ item: offer }) => {
          const expired = new Date(offer.validUntil) < new Date();
          const imageUri = offer.image?.startsWith('http')
            ? offer.image
            : `${GATEWAY_URL}${offer.image}`;
          return (
            <View style={[styles.card, expired && styles.cardExpired]}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                {offer.discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {offer.discountPercent}% OFF
                    </Text>
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
                  <Clock size={9} color={CustomerColors.textSecondary} />
                  <Text style={styles.validText}>
                    Until{' '}
                    {new Date(offer.validUntil).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.footerRow}>
                  <View style={styles.statsRow}>
                    <Eye size={10} color={CustomerColors.textSecondary} />
                    <Text style={styles.statsText}>{offer.viewCount ?? 0}</Text>
                    <ShoppingBag
                      size={10}
                      color={CustomerColors.textSecondary}
                    />
                    <Text style={styles.statsText}>
                      {offer.orderCount ?? 0}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(offer._id)}
                    disabled={deleting === offer._id}
                  >
                    <Trash2 size={13} color={CustomerColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  count: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
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
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  cardExpired: { opacity: 0.7 },
  imageWrap: { aspectRatio: 16 / 9, backgroundColor: '#F5F5F5' },
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    color: CustomerColors.black,
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
    color: CustomerColors.teal700,
  },
  originalPrice: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  validText: { fontSize: 10, color: CustomerColors.textSecondary },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsText: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginRight: 6,
  },
});
