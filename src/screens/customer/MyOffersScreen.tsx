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

import { GATEWAY_URL } from '../../api/endpoints';
import { requireAuthForPurchase } from '../../utils/authGuard';

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

function OrderModal({
  offer,
  visible,
  onClose,
  onSuccess,
}: {
  offer: Offer | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    quantity: '1',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (!offer) return null;
  const qty = parseInt(form.quantity || '1', 10);
  const total = (offer.offerPrice * qty).toFixed(0);

  const handleOrder = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place this offer order.',
      })
    )
      return;
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
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{offer.title}</Text>
              <Text style={styles.modalStore}>{offer.storeName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per unit</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}
            >
              <Text style={styles.priceValue}>₹{offer.offerPrice}</Text>
              {offer.originalPrice !== offer.offerPrice && (
                <Text style={styles.priceStrike}>₹{offer.originalPrice}</Text>
              )}
            </View>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <FormField
              label="Your Name *"
              value={form.customerName}
              onChangeText={v => set('customerName', v)}
            />
            <FormField
              label="Phone *"
              value={form.customerPhone}
              onChangeText={v => set('customerPhone', v)}
              keyboardType="phone-pad"
            />
            <FormField
              label="Email"
              value={form.customerEmail}
              onChangeText={v => set('customerEmail', v)}
              keyboardType="email-address"
            />
            <FormField
              label="Delivery Address *"
              value={form.deliveryAddress}
              onChangeText={v => set('deliveryAddress', v)}
              multiline
              numberOfLines={2}
            />
            <FormField
              label="Quantity"
              value={form.quantity}
              onChangeText={v => set('quantity', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />
            <Text style={styles.totalText}>
              Total: <Text style={{ fontWeight: '800' }}>₹{total}</Text>
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
}

function FormField({ label, ...rest }: FormFieldProps) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...rest}
        style={[
          styles.fieldInput,
          rest.multiline && { height: 64, textAlignVertical: 'top' },
        ]}
        placeholderTextColor={CustomerColors.textSecondary}
      />
    </View>
  );
}

export default function MyOffersScreen() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏷️ My Offers</Text>
        <Text style={styles.headerSubtitle}>
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
          <Text style={styles.emptyTitle}>No private offers yet</Text>
          <Text style={styles.emptySubtitle}>
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
          {offers.map(offer => (
            <View key={offer._id} style={styles.card}>
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
                  <Tag size={10} color="#fff" />
                  <Text style={styles.justForYouText}>Just for you</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.storeName}>{offer.storeName}</Text>
                <Text style={styles.offerTitle} numberOfLines={1}>
                  {offer.title}
                </Text>
                {!!offer.description && (
                  <Text style={styles.offerDesc} numberOfLines={2}>
                    {offer.description}
                  </Text>
                )}

                <View style={styles.priceTimeRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'baseline',
                      gap: 8,
                    }}
                  >
                    <Text style={styles.offerPrice}>₹{offer.offerPrice}</Text>
                    {offer.originalPrice !== offer.offerPrice && (
                      <Text style={styles.offerPriceStrike}>
                        ₹{offer.originalPrice}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeChip}>
                    <Clock size={10} color={CustomerColors.textSecondary} />
                    <Text style={styles.timeChipText}>
                      {hoursLeftLabel(offer.validUntil)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.orderNowBtn}
                  onPress={() => {
                    setSelectedOffer(offer);
                    setOrderSuccess(false);
                  }}
                >
                  <ShoppingBag size={14} color="#fff" />
                  <Text style={styles.orderNowText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <OrderModal
        offer={selectedOffer}
        visible={!!selectedOffer && !orderSuccess}
        onClose={() => setSelectedOffer(null)}
        onSuccess={() => setOrderSuccess(true)}
      />

      <Modal visible={orderSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🎉</Text>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSubtitle}>
              The store will confirm your order shortly.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setSelectedOffer(null);
                setOrderSuccess(false);
              }}
            >
              <Text style={styles.successBtnText}>Back to Offers</Text>
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

  card: {
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
    aspectRatio: 16 / 9,
    backgroundColor: CustomerColors.bg,
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: FontSizes.xs,
    fontWeight: '800',
  },
  justForYouBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  justForYouText: { color: '#fff', fontSize: FontSizes.xs },
  cardBody: { padding: Spacing.md },
  storeName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal600,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  offerDesc: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  priceTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  offerPrice: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  offerPriceStrike: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  timeChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  orderNowBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  orderNowText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },

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
