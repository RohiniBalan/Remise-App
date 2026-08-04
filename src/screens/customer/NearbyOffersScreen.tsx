import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { MapPin, Clock, ShoppingBag, Bell, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { offersApi } from '../../api/offersApi';
import { requireAuthForPurchase } from '../../utils/authGuard';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

// Ported from client/app/nearby/page.tsx — same geolocation-driven nearby
// search, same radius presets, same offer-card fields (discount badge,
// distance, hours-left countdown), and the same OrderModal fields
// (Name*/Phone*/Email/Delivery Address*/Quantity, computed total). Web's
// "Enable Alerts" Web Push banner has no working mobile equivalent (see
// notificationApi.ts) — the banner is kept for parity of intent but tapping
// it explains push isn't available yet, rather than silently vanishing or
// silently pretending to subscribe.
const RADIUS_OPTIONS = [2, 5, 10, 20];

interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  storeName: string;
  storeId: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  validUntil: string;
  distanceKm: number;
}

async function requestLocationPermission(): Promise<
  'granted' | 'denied' | 'blocked'
> {
  if (Platform.OS !== 'android') return 'granted';
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}

export default function NearbyOffersScreen() {
  const { token } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(10);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState('');
  const [permBlocked, setPermBlocked] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Was a one-shot effect that, on denial, left the screen permanently
  // blank with just a static banner (see the app's report — screenshot
  // showed nothing but "Location access denied", no way to retry). Now a
  // standalone function so both the initial mount AND a manual "Enable
  // Location" tap can call it, same pattern CompareStoresScreen already
  // uses (its radius screen re-asks every time "Search" is pressed).
  const requestLocation = useCallback(async () => {
    setLocError('');
    setLocLoading(true);
    const result = await requestLocationPermission();
    if (result !== 'granted') {
      setPermBlocked(result === 'blocked');
      setLocError(
        'Location access denied. Enable location to see nearby offers.',
      );
      setLocLoading(false);
      return;
    }
    setPermBlocked(false);
    Geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocError(
          'Location access denied. Enable location to see nearby offers.',
        );
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleEnableLocation = () => {
    // Android stops showing its own permission dialog once the user has
    // denied twice ("never ask again") — re-requesting silently no-ops in
    // that state, so send them to the app's OS settings screen instead.
    if (permBlocked) {
      Linking.openSettings();
      return;
    }
    requestLocation();
  };

  const loadOffers = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await offersApi.getNearby(location.lat, location.lng, radius);
      setOffers(res.data.data);
    } catch {
      // ignore, matches web's silent-fail-to-empty-list behavior
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleEnableAlerts = () => {
    Alert.alert(
      'Nearby Offer Alerts',
      "Push notifications for nearby offers aren't available in the mobile app yet — check back here for new deals in the meantime.",
    );
  };

  return (
    <View style={styles.container}>
      {!location ? (
        <View style={styles.center}>
          {locLoading ? (
            <>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={styles.emptySubtitle}>Getting your location…</Text>
            </>
          ) : (
            <>
              <MapPin size={40} color={CustomerColors.steelBorder} />
              <Text style={styles.emptyTitle}>
                {locError || 'Location needed'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {permBlocked
                  ? "Location is turned off for this app in your phone's settings."
                  : 'We use your location to find offers from stores near you.'}
              </Text>
              <TouchableOpacity
                style={styles.enableLocationBtn}
                onPress={handleEnableLocation}
              >
                <MapPin size={14} color="#fff" />
                <Text style={styles.enableLocationBtnText}>
                  {permBlocked ? 'Open Settings' : 'Enable Location'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <>
          {token && (
            <TouchableOpacity
              style={styles.alertBanner}
              onPress={handleEnableAlerts}
            >
              <Bell size={16} color={CustomerColors.teal600} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>
                  Get notified about new nearby offers
                </Text>
                <Text style={styles.alertSubtitle}>
                  We'll alert you when stores near you post deals.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.radiusRow}>
            <Text style={styles.radiusLabel}>Radius:</Text>
            {RADIUS_OPTIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.radiusChip,
                  radius === r && styles.radiusChipActive,
                ]}
                onPress={() => setRadius(r)}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    radius === r && styles.radiusChipTextActive,
                  ]}
                >
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
            </View>
          ) : (
            <FlatList
              data={offers}
              keyExtractor={o => o._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>
                    No offers found within {radius} km
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Try increasing the radius or check back later.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const hoursLeft = Math.max(
                  0,
                  Math.floor(
                    (new Date(item.validUntil).getTime() - Date.now()) /
                      3_600_000,
                  ),
                );
                return (
                  <View style={styles.card}>
                    <View style={styles.imageWrap}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                      />
                      {item.discountPercent > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            {item.discountPercent}% OFF
                          </Text>
                        </View>
                      )}
                      <View style={styles.distanceBadge}>
                        <MapPin size={9} color="#fff" />
                        <Text style={styles.distanceBadgeText}>
                          {item.distanceKm} km
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.storeName}>{item.storeName}</Text>
                      <Text style={styles.offerTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.offerPrice}>
                          ₹{item.offerPrice}
                        </Text>
                        {item.originalPrice !== item.offerPrice && (
                          <Text style={styles.originalPrice}>
                            ₹{item.originalPrice}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.timeBadge,
                          hoursLeft < 24 && styles.timeBadgeUrgent,
                        ]}
                      >
                        <Clock
                          size={9}
                          color={
                            hoursLeft < 24
                              ? CustomerColors.primary
                              : CustomerColors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.timeBadgeText,
                            hoursLeft < 24 && styles.timeBadgeTextUrgent,
                          ]}
                        >
                          {hoursLeft < 1
                            ? '< 1h left'
                            : hoursLeft < 24
                            ? `${hoursLeft}h left`
                            : `${Math.floor(hoursLeft / 24)}d left`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.orderBtn}
                        onPress={() => {
                          setSelectedOffer(item);
                          setOrderSuccess(false);
                        }}
                      >
                        <ShoppingBag size={13} color="#fff" />
                        <Text style={styles.orderBtnText}>Order Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </>
      )}

      <Modal
        visible={Boolean(selectedOffer) && !orderSuccess}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        {selectedOffer && (
          <OrderModal
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onSuccess={() => setOrderSuccess(true)}
          />
        )}
      </Modal>

      <Modal visible={orderSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
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

function OrderModal({
  offer,
  onClose,
  onSuccess,
}: {
  offer: Offer;
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleOrder = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place this offer order.',
      })
    )
      return;
    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.deliveryAddress.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await offersApi.placeOrder(offer._id, {
        ...form,
        quantity: parseInt(form.quantity, 10) || 1,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>{offer.title}</Text>
            <Text style={styles.modalSubtitle}>{offer.storeName}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={CustomerColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceStrip}>
          <Text style={styles.priceStripLabel}>Price per unit</Text>
          <View
            style={{
              flexDirection: 'row',
              gap: Spacing.sm,
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.priceStripValue}>₹{offer.offerPrice}</Text>
            {offer.originalPrice !== offer.offerPrice && (
              <Text style={styles.priceStripOriginal}>
                ₹{offer.originalPrice}
              </Text>
            )}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Your Name *"
          value={form.customerName}
          onChangeText={v => set('customerName', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone *"
          keyboardType="phone-pad"
          value={form.customerPhone}
          onChangeText={v => set('customerPhone', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={form.customerEmail}
          onChangeText={v => set('customerEmail', v)}
        />
        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="Delivery Address *"
          multiline
          value={form.deliveryAddress}
          onChangeText={v => set('deliveryAddress', v)}
        />

        <View style={styles.qtyTotalRow}>
          <View>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={[styles.input, { width: 80 }]}
              keyboardType="number-pad"
              value={form.quantity}
              onChangeText={v => set('quantity', v)}
            />
          </View>
          <Text style={styles.totalText}>
            Total:{' '}
            <Text style={{ fontWeight: '800', color: CustomerColors.teal700 }}>
              ₹
              {(offer.offerPrice * (parseInt(form.quantity, 10) || 1)).toFixed(
                0,
              )}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ShoppingBag size={16} color="#fff" />
              <Text style={styles.placeOrderBtnText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    flex: 1,
  },
  enableLocationBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  enableLocationBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    padding: Spacing.md,
  },
  alertTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#374151' },
  alertSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  radiusLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginRight: 4,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  radiusChipActive: {
    backgroundColor: CustomerColors.mint,
    borderColor: CustomerColors.teal600,
  },
  radiusChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: { color: CustomerColors.teal700 },
  list: { padding: Spacing.sm },
  row: { gap: Spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
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
    borderColor: CustomerColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imageWrap: { aspectRatio: 16 / 9, backgroundColor: '#F5F5F5' },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  distanceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceBadgeText: { color: '#fff', fontSize: 9 },
  cardBody: { padding: Spacing.sm },
  storeName: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal600 },
  offerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  offerPrice: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  originalPrice: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 6,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  timeBadgeUrgent: {
    backgroundColor: CustomerColors.dangerBg,
    borderColor: '#FECACA',
  },
  timeBadgeText: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  timeBadgeTextUrgent: { color: CustomerColors.primary },
  orderBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  priceStripLabel: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
  },
  priceStripValue: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  priceStripOriginal: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  errorText: { color: CustomerColors.primary, fontSize: FontSizes.sm },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
  },
  qtyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  placeOrderBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  placeOrderBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  successEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  successSubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  successBtn: {
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  successBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});
