import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Tag, Clock, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { offersApi } from '../../api/offersApi';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

import { GATEWAY_URL } from '../../api/endpoints';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';

interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  storeName: string;
  storeId: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  validUntil: string;
}

function hoursLeftLabel(validUntil: string) {
  const ms = new Date(validUntil).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  if (hours < 1) return '< 1h left';
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

interface ClaimOfferModalProps {
  offer: Offer | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ClaimOfferModal({
  offer,
  visible,
  onClose,
  onSuccess,
}: ClaimOfferModalProps) {
  const { isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    customerName: user?.fullname || user?.name || '',
    customerPhone: user?.mobilenumber || '',
    customerEmail: user?.email || '',
    deliveryAddress: '',
    quantity: '1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1F2937' : '#e2e8f0';
  const textPri = isDark ? '#F9FAFB' : '#0f172a';
  const textSec = isDark ? '#9CA3AF' : '#64748b';
  const rowBg = isDark ? '#1f2937' : CustomerColors.bg;

  if (!offer) return null;
  const qty = parseInt(form.quantity || '1', 10);
  const total = (offer.offerPrice * qty).toFixed(0);

  const handleOrder = async () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await offersApi.placeOrder(offer._id, { ...form, quantity: qty });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: textPri }]}>{offer.title}</Text>
              <Text style={[styles.modalStore, { color: textSec }]}>{offer.storeName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={textSec} />
            </TouchableOpacity>
          </View>

          <View style={[styles.priceRow, { backgroundColor: rowBg }]}>
            <Text style={[styles.priceLabel, { color: textSec }]}>Price per unit</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}
            >
              <Text style={styles.priceValue}>₹{offer.offerPrice}</Text>
              {offer.originalPrice !== offer.offerPrice && (
                <Text style={[styles.priceStrike, { color: textSec }]}>₹{offer.originalPrice}</Text>
              )}
            </View>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <FormField
              label="Your Name *"
              value={form.customerName}
              onChangeText={v => set('customerName', v)}
              cardBg={cardBg}
              borderColor={borderColor}
              textPri={textPri}
              textSec={textSec}
            />
            <FormField
              label="Phone *"
              value={form.customerPhone}
              onChangeText={v => set('customerPhone', v)}
              keyboardType="phone-pad"
              cardBg={cardBg}
              borderColor={borderColor}
              textPri={textPri}
              textSec={textSec}
            />
            <FormField
              label="Email"
              value={form.customerEmail}
              onChangeText={v => set('customerEmail', v)}
              keyboardType="email-address"
              cardBg={cardBg}
              borderColor={borderColor}
              textPri={textPri}
              textSec={textSec}
            />
            <FormField
              label="Delivery Address *"
              value={form.deliveryAddress}
              onChangeText={v => set('deliveryAddress', v)}
              multiline
              numberOfLines={2}
              cardBg={cardBg}
              borderColor={borderColor}
              textPri={textPri}
              textSec={textSec}
            />
            <FormField
              label="Quantity"
              value={form.quantity}
              onChangeText={v => set('quantity', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              cardBg={cardBg}
              borderColor={borderColor}
              textPri={textPri}
              textSec={textSec}
            />
            <Text style={[styles.totalText, { color: textSec }]}>
              Total: <Text style={{ fontWeight: '800', color: textPri }}>₹{total}</Text>
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.orderBtn}
            onPress={handleOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <ShoppingBag size={16} color="#fff" />
                <Text style={styles.orderBtnText}>Place Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Place Offer Order"
        subtitle="Please sign in or register to place this offer order."
        onLogin={() => {
          onClose();
          navigation.navigate('LoginRegister');
        }}
      />
    </Modal>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'number-pad';
  cardBg?: string;
  borderColor?: string;
  textPri?: string;
  textSec?: string;
}

function FormField({ label, cardBg, borderColor, textPri, textSec, ...rest }: FormFieldProps) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={[styles.fieldLabel, textSec ? { color: textSec } : undefined]}>{label}</Text>
      <TextInput
        {...rest}
        style={[
          styles.fieldInput,
          borderColor ? { borderColor, color: textPri } : undefined,
          rest.multiline && { height: 64, textAlignVertical: 'top' },
        ]}
        placeholderTextColor={textSec || CustomerColors.textSecondary}
      />
    </View>
  );
}

export default function MyOffersScreen() {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1F2937' : '#e2e8f0';
  const textPri = isDark ? '#F9FAFB' : '#0f172a';
  const textSec = isDark ? '#9CA3AF' : '#64748b';
  const bg = isDark ? '#0b0f19' : CustomerColors.bg;

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await offersApi.getMyOffers(token);
      setOffers(res.data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textPri }]}>🏷️ My Offers</Text>
        <Text style={[styles.headerSubtitle, { color: textSec }]}>
          Deals a store has sent you personally
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={CustomerColors.teal} size="large" />
        </View>
      ) : offers.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerBox}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🏷️</Text>
          <Text style={[styles.emptyTitle, { color: textPri }]}>No private offers yet</Text>
          <Text style={[styles.emptySubtitle, { color: textSec }]}>
            When a store sends you a personal deal, it'll show up here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.grid}>
            {offers.map(offer => (
              <View key={offer._id} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.imageWrap}>
                  <Image
                    source={{
                      uri: offer.image?.startsWith('http')
                        ? offer.image
                        : `${GATEWAY_URL}${offer.image}`,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {offer.discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {offer.discountPercent}% OFF
                      </Text>
                    </View>
                  )}
                  <View style={styles.justForYouBadge}>
                    <Tag size={9} color="#fff" />
                    <Text style={styles.justForYouText}>Just for you</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.storeName, { color: textSec }]} numberOfLines={1}>{offer.storeName}</Text>
                  <Text style={[styles.offerTitle, { color: textPri }]} numberOfLines={1}>
                    {offer.title}
                  </Text>
                  {!!offer.description && (
                    <Text style={[styles.offerDesc, { color: textSec }]} numberOfLines={2}>
                      {offer.description}
                    </Text>
                  )}

                  <View style={styles.priceTimeRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text style={styles.offerPrice}>₹{offer.offerPrice}</Text>
                      {offer.originalPrice !== offer.offerPrice && (
                        <Text style={[styles.offerPriceStrike, { color: textSec }]}>
                          ₹{offer.originalPrice}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.timeChip, { backgroundColor: isDark ? '#1f2937' : CustomerColors.bg, borderColor }]}>
                    <Clock size={10} color={textSec} />
                    <Text style={[styles.timeChipText, { color: textSec }]}>
                      {hoursLeftLabel(offer.validUntil)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.orderNowBtn}
                    onPress={() => {
                      setSelectedOffer(offer);
                      setOrderSuccess(false);
                    }}
                  >
                    <ShoppingBag size={13} color="#fff" />
                    <Text style={styles.orderNowText}>Order Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <ClaimOfferModal
        offer={selectedOffer}
        visible={!!selectedOffer && !orderSuccess}
        onClose={() => setSelectedOffer(null)}
        onSuccess={() => setOrderSuccess(true)}
      />

      <Modal visible={orderSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🎉</Text>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={[styles.successSubtitle, { color: textSec }]}>
              The store will confirm your order shortly.
            </Text>
            <TouchableOpacity
              style={[styles.successBtn, { backgroundColor: isDark ? '#1f2937' : CustomerColors.bg, borderColor }]}
              onPress={() => {
                setSelectedOffer(null);
                setOrderSuccess(false);
              }}
            >
              <Text style={[styles.successBtnText, { color: textPri }]}>Back to Offers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  centerBox: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: CustomerColors.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },

  // 2-cards-per-row grid — cards are ~48% wide with `space-between` on the
  // row so a small gap sits between the pair without needing a `gap` prop
  // (kept for RN versions where flexbox `gap` on a wrapping row is
  // inconsistent). `card` no longer needs its own marginBottom collapsed
  // against the grid, so it gets one here instead.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: CustomerColors.bg,
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  justForYouBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  justForYouText: { color: '#fff', fontSize: 9 },
  cardBody: { padding: Spacing.sm },
  storeName: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal600,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  offerDesc: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  priceTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  offerPrice: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  offerPriceStrike: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
  },
  timeChipText: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  orderNowBtn: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  orderNowText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  modalStore: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  priceLabel: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  priceValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  priceStrike: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  errorText: {
    color: CustomerColors.danger,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  totalText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xs,
  },
  orderBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.base },

  successCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    alignSelf: 'center',
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  successBtn: {
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  successBtnText: {
    color: CustomerColors.black,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});