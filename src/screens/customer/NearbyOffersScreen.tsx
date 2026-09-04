import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  MapPin,
  Clock,
  ShoppingBag,
  Bell,
  X,
  Truck,
  Store,
  Wallet,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  ChevronRight,
  Upload,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { offersApi } from '../../api/offersApi';
import { storeApi } from '../../api/storeApi';
import { requireAuthForPurchase } from '../../utils/authGuard';
import { requestCameraPermission } from '../../utils/permissions';
import { LocationSelectField, lookupPincode } from '../../components/common/LocationSelectField';
import { indianStates, getCities } from '../../utils/indiaLocation';
import { GATEWAY_URL } from '../../api/endpoints';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';

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

const resolveImage = (img?: string) => {
  if (!img) return 'https://via.placeholder.com/300x200?text=Offer';
  if (img.startsWith('http')) return img;
  return `${GATEWAY_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

export default function NearbyOffersScreen() {
  const { token } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(10);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState('');
  const [permBlocked, setPermBlocked] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const loadOffers = useCallback(async (loc?: { lat: number; lng: number } | null, r = radius) => {
    setLoading(true);
    try {
      if (loc) {
        const res = await offersApi.getNearby(loc.lat, loc.lng, r);
        const data = res.data?.data || [];
        if (data.length > 0) {
          setOffers(data);
          setLoading(false);
          return;
        }
      }
      const activeRes = await offersApi.getActive(20);
      setOffers(activeRes.data?.data || []);
    } catch {
      try {
        const activeRes = await offersApi.getActive(20);
        setOffers(activeRes.data?.data || []);
      } catch {
        setOffers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [radius]);

  const requestLocation = useCallback(async () => {
    setLocError('');
    setLocLoading(true);
    const result = await requestLocationPermission();
    if (result !== 'granted') {
      setPermBlocked(result === 'blocked');
      setLocError(
        'Location access denied. Showing all active offers.',
      );
      setLocLoading(false);
      loadOffers(null);
      return;
    }
    setPermBlocked(false);
    Geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocLoading(false);
        loadOffers(loc);
      },
      () => {
        setLocError(
          'Could not detect precise location. Showing all active offers.',
        );
        setLocLoading(false);
        loadOffers(null);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [loadOffers]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleEnableLocation = () => {
    if (permBlocked) {
      Linking.openSettings();
      return;
    }
    requestLocation();
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    loadOffers(location, newRadius);
  };

  const handleEnableAlerts = () => {
    Alert.alert(
      'Nearby Offer Alerts',
      "Push notifications for nearby offers aren't available in the mobile app yet — check back here for new deals in the meantime.",
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BrandHeader />
      {/* Location warning banner if location is not granted */}
      {!location && !locLoading && (
        <View style={styles.locationBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationBannerTitle}>Location not enabled</Text>
            <Text style={styles.locationBannerSubtitle}>
              Enable location to sort and discover offers closest to you.
            </Text>
          </View>
          <TouchableOpacity style={styles.locationBannerBtn} onPress={handleEnableLocation}>
            <MapPin size={12} color="#fff" />
            <Text style={styles.locationBannerBtnText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Radius:</Text>
        {RADIUS_OPTIONS.map(r => (
          <TouchableOpacity
            key={r}
            style={[
              styles.radiusChip,
              radius === r && styles.radiusChipActive,
            ]}
            onPress={() => handleRadiusChange(r)}
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
          <Text style={styles.emptySubtitle}>Loading offers…</Text>
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
                No offers found right now
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
                    source={{ uri: resolveImage(item.image) }}
                    style={styles.image}
                  />
                  {item.discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {item.discountPercent}% OFF
                      </Text>
                    </View>
                  )}
                  {item.distanceKm !== undefined && item.distanceKm !== null ? (
                    <View style={styles.distanceBadge}>
                      <MapPin size={9} color="#fff" />
                      <Text style={styles.distanceBadgeText}>
                        {item.distanceKm} km
                      </Text>
                    </View>
                  ) : null}
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
                    onPress={() => setSelectedOffer(item)}
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

      <Modal
        visible={Boolean(selectedOffer)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        {selectedOffer && (
          <OrderModal
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
          />
        )}
      </Modal>
    </View>
  );
}

type Step = 'details' | 'delivery' | 'payment' | 'placing' | 'success';

function OrderModal({
  offer,
  onClose,
}: {
  offer: Offer;
  onClose: () => void;
}) {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr' | 'razorpay' | null>(null);
  const [selectedSubMethod, setSelectedSubMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [storeQr, setStoreQr] = useState<string | null>(null);
  const [storeUpiId, setStoreUpiId] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const [form, setForm] = useState({
    firstName: user?.fullname?.split(' ')[0] || user?.name || '',
    lastName: user?.fullname?.split(' ').slice(1).join(' ') || '',
    phone: user?.mobilenumber || '',
    contactEmail: user?.email || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    quantity: '1',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Cities for selected state
  const cities = useMemo(() => {
    if (!selectedStateCode) return [];
    return getCities(selectedStateCode) || [];
  }, [selectedStateCode]);

  // Load store QR code and UPI when QR payment is selected
  useEffect(() => {
    if (paymentMethod !== 'qr' || !offer.storeId) return;
    let cancelled = false;
    setQrLoading(true);
    storeApi
      .getById(offer.storeId)
      .then(res => {
        if (!cancelled) {
          const s = res.data?.data;
          setStoreQr(s?.qrCodeImage || null);
          setStoreUpiId(s?.upiId || s?.phone ? `${s?.phone || ''}@upi` : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStoreQr(null);
          setStoreUpiId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paymentMethod, offer.storeId]);

  const total = (offer.offerPrice * (parseInt(form.quantity, 10) || 1)).toFixed(0);

  const handleNextToDelivery = () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place this offer order.',
      })
    )
      return;

    if (!form.firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!form.address.trim()) {
      setError('Please enter your address.');
      return;
    }
    if (!form.state.trim()) {
      setError('Please select your state.');
      return;
    }
    if (!form.city.trim()) {
      setError('Please select your city.');
      return;
    }
    if (!form.pinCode.trim()) {
      setError('Please enter your pin code.');
      return;
    }

    setError('');
    setStep('delivery');
  };

  const handleNextToPayment = () => {
    if (!deliveryMethod) {
      setError('Please select a delivery method.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const pickScreenshot = () => {
    Alert.alert('Payment Proof', 'Take a photo of your payment or choose from gallery.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take Photo',
        onPress: async () => {
          const granted = await requestCameraPermission();
          if (!granted) return;
          const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          const uri = res.assets?.[0]?.uri;
          if (uri) setScreenshotUri(uri);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          const uri = res.assets?.[0]?.uri;
          if (uri) setScreenshotUri(uri);
        },
      },
    ]);
  };

  const handlePlaceOrder = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place this order.',
      })
    )
      return;

    if (!deliveryMethod || !paymentMethod) return;

    setStep('placing');
    setError('');
    try {
      const res = await offersApi.placeOrder(offer._id, {
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerPhone: form.phone,
        customerEmail: form.contactEmail,
        deliveryAddress: form.address,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        deliveryMethod,
        paymentMethod: paymentMethod === 'razorpay' ? 'razorpay' : paymentMethod === 'qr' ? 'qr' : 'cod',
        paymentStatus: paymentMethod === 'razorpay' ? 'Completed' : 'Pending',
        utrNumber: utrNumber.trim() || undefined,
        screenshot: screenshotUri || undefined,
        quantity: parseInt(form.quantity, 10) || 1,
      });

      const placedOrderId = res.data?.data?._id || res.data?.data?.orderId || 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setOrderId(placedOrderId);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
      setStep('payment');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalSheet, { maxHeight: '94%' }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={{ flex: 1, paddingRight: Spacing.sm }}>
            <View style={styles.offerBadgePill}>
              <Text style={styles.offerBadgePillText}>Nearby Deal</Text>
            </View>
            <Text style={styles.modalTitle} numberOfLines={1}>{offer.title}</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>{offer.storeName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <X size={20} color={CustomerColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        {step !== 'placing' && step !== 'success' && (
          <View style={styles.stepTrack}>
            <View style={[styles.stepItem, (step === 'details' || step === 'delivery' || step === 'payment') && styles.stepItemActive]}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>{step === 'delivery' || step === 'payment' ? '✓' : '1'}</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>Details</Text>
            </View>
            <View style={[styles.stepLine, (step === 'delivery' || step === 'payment') && styles.stepLineActive]} />
            <View style={[styles.stepItem, (step === 'delivery' || step === 'payment') && styles.stepItemActive]}>
              <View style={[styles.stepDot, (step === 'delivery' || step === 'payment') && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, (step === 'delivery' || step === 'payment') && styles.stepDotTextActive]}>
                  {step === 'payment' ? '✓' : '2'}
                </Text>
              </View>
              <Text style={[styles.stepLabel, (step === 'delivery' || step === 'payment') && styles.stepLabelActive]}>Delivery</Text>
            </View>
            <View style={[styles.stepLine, step === 'payment' && styles.stepLineActive]} />
            <View style={[styles.stepItem, step === 'payment' && styles.stepItemActive]}>
              <View style={[styles.stepDot, step === 'payment' && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, step === 'payment' && styles.stepDotTextActive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, step === 'payment' && styles.stepLabelActive]}>Payment</Text>
            </View>
          </View>
        )}

        {/* Price Strip */}
        <View style={styles.priceStrip}>
          <Text style={styles.priceStripLabel}>Offer Price</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'baseline' }}>
            <Text style={styles.priceStripValue}>₹{offer.offerPrice}</Text>
            {offer.originalPrice !== offer.offerPrice && (
              <Text style={styles.priceStripOriginal}>₹{offer.originalPrice}</Text>
            )}
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{offer.discountPercent}% OFF</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
          {/* ══════════════ STEP 1: CONTACT DETAILS & ADDRESS ══════════════ */}
          {step === 'details' && (
            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.fieldSectionLabel}>1. Contact & Address Details</Text>

              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="First Name *"
                  placeholderTextColor="#9CA3AF"
                  value={form.firstName}
                  onChangeText={v => set('firstName', v)}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                  value={form.lastName}
                  onChangeText={v => set('lastName', v)}
                />
              </View>

              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Phone *"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={v => set('phone', v)}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Email (optional)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  value={form.contactEmail}
                  onChangeText={v => set('contactEmail', v)}
                />
              </View>

              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Street Address *"
                placeholderTextColor="#9CA3AF"
                multiline
                value={form.address}
                onChangeText={v => set('address', v)}
              />

              {/* State Dropdown */}
              <LocationSelectField
                label="State *"
                value={form.state}
                placeholder="Select State"
                options={indianStates.map(s => ({ key: s.isoCode, label: s.name }))}
                onSelect={(stateCode, stateName) => {
                  setSelectedStateCode(stateCode);
                  set('state', stateName);
                  set('city', '');
                  set('pinCode', '');
                }}
              />

              {/* City Dropdown */}
              <LocationSelectField
                label="City *"
                value={form.city}
                placeholder={selectedStateCode ? 'Select City' : 'Select State First'}
                disabled={!selectedStateCode}
                options={cities.map(c => ({ key: c.name, label: c.name }))}
                onSelect={async (_, cityName) => {
                  set('city', cityName);
                  const pin = await lookupPincode(cityName);
                  if (pin) {
                    set('pinCode', pin);
                  }
                }}
              />

              {/* Pin Code Input (Auto-entered with manual override) */}
              <View>
                <Text style={styles.inputLabel}>Pin Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pin Code *"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={form.pinCode}
                  onChangeText={v => set('pinCode', v)}
                />
              </View>

              {/* Quantity Selector & Total */}
              <View style={styles.qtyTotalRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text style={styles.label}>Quantity:</Text>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const current = parseInt(form.quantity, 10) || 1;
                        if (current > 1) set('quantity', String(current - 1));
                      }}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      placeholderTextColor={CustomerColors.textSecondary}
                      keyboardType="number-pad"
                      value={form.quantity}
                      onChangeText={v => set('quantity', v)}
                    />
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const current = parseInt(form.quantity, 10) || 1;
                        set('quantity', String(current + 1));
                      }}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.totalText}>
                  Total Amount:{' '}
                  <Text style={{ fontWeight: '800', color: CustomerColors.teal700, fontSize: FontSizes.base }}>
                    ₹{total}
                  </Text>
                </Text>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleNextToDelivery}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Next: Delivery Method</Text>
                <ChevronRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════ STEP 2: DELIVERY METHOD ══════════════ */}
          {step === 'delivery' && (
            <View style={{ gap: Spacing.md }}>
              <View>
                <Text style={styles.fieldSectionLabel}>2. Delivery Method</Text>
                <Text style={styles.stepSubtitle}>
                  How would you like to receive your offer order from{' '}
                  <Text style={{ fontWeight: '700', color: CustomerColors.black }}>{offer.storeName}</Text>?
                </Text>
              </View>

              <View style={{ gap: Spacing.sm }}>
                {/* Self Pickup */}
                <TouchableOpacity
                  style={[
                    styles.methodCardLarge,
                    deliveryMethod === 'pickup' && styles.methodCardLargeActive,
                  ]}
                  onPress={() => {
                    setDeliveryMethod('pickup');
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconLargeWrap, deliveryMethod === 'pickup' && styles.methodIconLargeWrapActive]}>
                    <Store size={22} color={deliveryMethod === 'pickup' ? '#fff' : CustomerColors.teal700} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLargeTitle, deliveryMethod === 'pickup' && styles.methodLargeTitleActive]}>
                      Self Pickup
                    </Text>
                    <Text style={styles.methodLargeSubtitle}>
                      Visit {offer.storeName} and collect your order yourself.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Home Delivery */}
                <TouchableOpacity
                  style={[
                    styles.methodCardLarge,
                    deliveryMethod === 'delivery' && styles.methodCardLargeActive,
                  ]}
                  onPress={() => {
                    setDeliveryMethod('delivery');
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconLargeWrap, deliveryMethod === 'delivery' && styles.methodIconLargeWrapActive]}>
                    <Truck size={22} color={deliveryMethod === 'delivery' ? '#fff' : CustomerColors.teal700} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLargeTitle, deliveryMethod === 'delivery' && styles.methodLargeTitleActive]}>
                      Home Delivery
                    </Text>
                    <Text style={styles.methodLargeSubtitle}>
                      {offer.storeName} will deliver to: {form.address}, {form.city}, {form.state} - {form.pinCode}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep('details')}
                >
                  <Text style={styles.secondaryBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={handleNextToPayment}
                >
                  <Text style={styles.primaryBtnText}>Next: Payment Method</Text>
                  <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════ STEP 3: PAYMENT METHOD ══════════════ */}
          {step === 'payment' && (
            <View style={{ gap: Spacing.md }}>
              <View>
                <Text style={styles.fieldSectionLabel}>3. Payment Method</Text>
                <Text style={styles.stepSubtitle}>
                  Choose how you'd like to pay for your order:
                </Text>
              </View>

              {/* No specific payment method selected yet */}
              {!paymentMethod && (
                <View style={{ gap: Spacing.sm }}>
                  {/* 1. Razorpay Online Payment */}
                  <TouchableOpacity
                    style={[styles.optionCard, styles.razorpayOptionCard]}
                    onPress={() => {
                      setPaymentMethod('razorpay');
                      setSelectedSubMethod('upi');
                    }}
                  >
                    <View style={styles.razorpayIconBox}>
                      <CreditCard size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
                        <Text style={styles.optionTitle}>Online Payment (Razorpay)</Text>
                        <View style={styles.instantBadge}>
                          <Text style={styles.instantBadgeText}>INSTANT · SECURE</Text>
                        </View>
                      </View>
                      <Text style={styles.optionDesc}>
                        UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking & Wallets.
                      </Text>
                      <View style={styles.pillRow}>
                        <View style={styles.pill}><Text style={styles.pillText}>⚡ UPI</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>💳 Cards</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>🏦 NetBanking</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>👛 Wallets</Text></View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* 2. QR Code Payment */}
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => setPaymentMethod('qr')}
                  >
                    <QrCode size={20} color={CustomerColors.teal600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Store QR Code Payment</Text>
                      <Text style={styles.optionDesc}>
                        Scan {offer.storeName}'s QR code and pay directly via UPI.
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* 3. Cash Payment */}
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => setPaymentMethod('cod')}
                  >
                    <Wallet size={20} color={CustomerColors.teal600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>
                        {deliveryMethod === 'pickup' ? 'Pay at Store' : 'Cash on Delivery'}
                      </Text>
                      <Text style={styles.optionDesc}>
                        {deliveryMethod === 'pickup'
                          ? 'Pay in cash when you pick up at the shop.'
                          : 'Pay cash to delivery agent upon arrival.'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setStep('delivery')} style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }}>
                    <Text style={styles.linkText}>← Back to Delivery</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Sub-view: Razorpay Online Payment ── */}
              {paymentMethod === 'razorpay' && (
                <View style={{ gap: Spacing.md }}>
                  <View>
                    <Text style={[styles.stepSubtitle, { fontWeight: '700', color: CustomerColors.black }]}>
                      Available Payment Methods
                    </Text>
                    <Text style={styles.optionDesc}>
                      Select payment mode to complete payment of ₹{total} via Razorpay:
                    </Text>
                  </View>

                  {/* Sub-method: UPI */}
                  <TouchableOpacity
                    style={[styles.subMethodCard, selectedSubMethod === 'upi' && styles.subMethodCardActive]}
                    onPress={() => setSelectedSubMethod('upi')}
                  >
                    <View style={[styles.subMethodIcon, selectedSubMethod === 'upi' && styles.subMethodIconActive]}>
                      <Smartphone size={18} color={selectedSubMethod === 'upi' ? CustomerColors.teal700 : '#4B5563'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.subMethodTitle}>UPI (GPay, PhonePe, Paytm, BHIM)</Text>
                        <Text style={styles.feeTag}>0% Fee</Text>
                      </View>
                      <Text style={styles.subMethodDesc}>Instant checkout with any UPI App</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Sub-method: Cards */}
                  <TouchableOpacity
                    style={[styles.subMethodCard, selectedSubMethod === 'card' && styles.subMethodCardActive]}
                    onPress={() => setSelectedSubMethod('card')}
                  >
                    <View style={[styles.subMethodIcon, selectedSubMethod === 'card' && styles.subMethodIconActive]}>
                      <CreditCard size={18} color={selectedSubMethod === 'card' ? CustomerColors.teal700 : '#4B5563'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.subMethodTitle}>Credit / Debit Cards</Text>
                        <Text style={styles.cardTag}>All Cards</Text>
                      </View>
                      <Text style={styles.subMethodDesc}>Visa, MasterCard, RuPay, Maestro</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Sub-method: Net Banking */}
                  <TouchableOpacity
                    style={[styles.subMethodCard, selectedSubMethod === 'netbanking' && styles.subMethodCardActive]}
                    onPress={() => setSelectedSubMethod('netbanking')}
                  >
                    <View style={[styles.subMethodIcon, selectedSubMethod === 'netbanking' && styles.subMethodIconActive]}>
                      <Building2 size={18} color={selectedSubMethod === 'netbanking' ? CustomerColors.teal700 : '#4B5563'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.subMethodTitle}>Net Banking</Text>
                        <Text style={styles.bankTag}>50+ Banks</Text>
                      </View>
                      <Text style={styles.subMethodDesc}>SBI, HDFC, ICICI, Axis & all Indian banks</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Sub-method: Wallets */}
                  <TouchableOpacity
                    style={[styles.subMethodCard, selectedSubMethod === 'wallet' && styles.subMethodCardActive]}
                    onPress={() => setSelectedSubMethod('wallet')}
                  >
                    <View style={[styles.subMethodIcon, selectedSubMethod === 'wallet' && styles.subMethodIconActive]}>
                      <Wallet size={18} color={selectedSubMethod === 'wallet' ? CustomerColors.teal700 : '#4B5563'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.subMethodTitle}>Wallets</Text>
                        <Text style={styles.walletTag}>1-Click</Text>
                      </View>
                      <Text style={styles.subMethodDesc}>Paytm, PhonePe, Mobikwik, Amazon Pay</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Trust badge */}
                  <View style={styles.trustBanner}>
                    <ShieldCheck size={16} color={CustomerColors.teal600} />
                    <Text style={styles.trustBannerText}>
                      256-bit SSL encrypted · Verified by Razorpay
                    </Text>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => setPaymentMethod(null)}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { flex: 1 }]}
                      onPress={handlePlaceOrder}
                    >
                      <Lock size={15} color="#fff" />
                      <Text style={styles.primaryBtnText}>
                        Pay ₹{total} via Razorpay
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Sub-view: QR Code Payment ── */}
              {paymentMethod === 'qr' && (
                <View style={{ gap: Spacing.md }}>
                  {qrLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
                      <ActivityIndicator size="small" color={CustomerColors.teal600} />
                      <Text style={[styles.stepSubtitle, { marginTop: Spacing.xs }]}>
                        Loading {offer.storeName}'s QR code…
                      </Text>
                    </View>
                  ) : null}

                  {!qrLoading && storeQr ? (
                    <View style={styles.qrBox}>
                      <Image source={{ uri: storeQr }} style={styles.qrImage} />
                      <Text style={styles.qrCaption}>
                        Scan with any UPI app to pay {offer.storeName} ₹{total}
                      </Text>
                    </View>
                  ) : null}

                  {!qrLoading && !storeQr && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningBoxText}>
                        This shop hasn't set up QR payment image yet. You can use their UPI ID below, or choose Cash / Razorpay instead.
                      </Text>
                    </View>
                  )}

                  {storeUpiId ? (
                    <View style={styles.upiCopyCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.upiCopyLabel}>Store UPI ID</Text>
                        <Text style={styles.upiCopyValue}>{storeUpiId}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => {
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2500);
                        }}
                      >
                        {copiedUpi ? (
                          <Check size={14} color={CustomerColors.teal700} />
                        ) : (
                          <Text style={styles.copyBtnText}>Copy</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* UTR / Ref Number Input */}
                  <View>
                    <Text style={styles.inputLabel}>UTR / Transaction Reference (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 423891238910"
                      placeholderTextColor="#9CA3AF"
                      value={utrNumber}
                      onChangeText={setUtrNumber}
                    />
                  </View>

                  {/* Screenshot upload */}
                  <TouchableOpacity
                    style={styles.screenshotBtn}
                    onPress={pickScreenshot}
                  >
                    <Upload size={16} color={CustomerColors.teal700} />
                    <Text style={styles.screenshotBtnText}>
                      {screenshotUri
                        ? 'Screenshot selected ✓'
                        : 'Upload payment screenshot (optional)'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => setPaymentMethod(null)}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { flex: 1 }]}
                      onPress={handlePlaceOrder}
                    >
                      <CheckCircle2 size={16} color="#fff" />
                      <Text style={styles.primaryBtnText}>
                        I've Completed Payment
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Sub-view: Cash on Delivery / Pay at Store ── */}
              {paymentMethod === 'cod' && (
                <View style={{ gap: Spacing.md }}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>
                      {deliveryMethod === 'pickup'
                        ? `You will pay in cash (₹${total}) when you pick up your order directly from ${offer.storeName}.`
                        : `You will pay in cash (₹${total}) to the delivery agent upon receiving your order.`}
                    </Text>
                  </View>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => setPaymentMethod(null)}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { flex: 1 }]}
                      onPress={handlePlaceOrder}
                    >
                      <Text style={styles.primaryBtnText}>
                        Confirm & Order — ₹{total}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ══════════════ PLACING STATE ══════════════ */}
          {step === 'placing' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={styles.stepSubtitle}>Placing your order…</Text>
            </View>
          )}

          {/* ══════════════ SUCCESS STATE ══════════════ */}
          {step === 'success' && (
            <View style={[styles.center, { gap: Spacing.md, paddingVertical: Spacing.lg }]}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={40} color={CustomerColors.success} />
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={styles.successTitle}>Order & Payment Confirmed!</Text>
                <Text style={styles.successSubtitle}>
                  Your order from <Text style={{ fontWeight: '700' }}>{offer.storeName}</Text> has been placed via{' '}
                  {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay - Verified)' : paymentMethod === 'qr' ? 'Store UPI / QR Code' : 'Cash on Delivery'} (
                  {deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home Delivery'}).
                </Text>
              </View>

              {/* Verified Bill Card */}
              <View style={styles.billCard}>
                <View style={styles.billHeader}>
                  <View>
                    <Text style={styles.billBadge}>VERIFIED OFFER ORDER</Text>
                    <Text style={styles.billStoreName}>{offer.storeName}</Text>
                  </View>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>● CONFIRMED</Text>
                    {orderId ? <Text style={styles.billOrderId}>#{orderId.slice(-8)}</Text> : null}
                  </View>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Customer:</Text>
                  <Text style={styles.billValue}>
                    {[form.firstName, form.lastName].filter(Boolean).join(' ') || 'Customer'}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item:</Text>
                  <Text style={styles.billValue}>{offer.title} × {form.quantity}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Payment Mode:</Text>
                  <Text style={[styles.billValue, { color: CustomerColors.teal700 }]}>
                    {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : paymentMethod === 'qr' ? 'UPI / QR Payment' : 'Cash on Delivery'}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Mode:</Text>
                  <Text style={styles.billValue}>
                    {deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home Delivery'}
                  </Text>
                </View>

                <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: CustomerColors.steelBorder, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={styles.billLabel}>Total Amount</Text>
                  <Text style={styles.billTotal}>₹{total}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={onClose}
              >
                <Text style={styles.doneBtnText}>Back to Offers</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    marginBottom: Spacing.xs,
    padding: Spacing.md,
  },
  locationBannerTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: '#92400E' },
  locationBannerSubtitle: { fontSize: 11, color: '#B45309', marginTop: 1 },
  locationBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  locationBannerBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
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
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
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
  modalCloseBtn: {
    padding: 4,
  },
  offerBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.mint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  offerBadgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  stepTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    marginVertical: 2,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    opacity: 0.5,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: CustomerColors.teal600,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepLabelActive: {
    color: CustomerColors.teal700,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: CustomerColors.teal600,
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  errorText: { color: '#B91C1C', fontSize: FontSizes.xs, fontWeight: '600' },
  fieldSectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
  },
  row2: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  qtyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  qtyInput: {
    width: 36,
    textAlign: 'center',
    fontWeight: '800',
    color: CustomerColors.black,
    paddingVertical: 2,
    fontSize: FontSizes.sm,
  },
  totalText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  primaryBtn: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: CustomerColors.textSecondary,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  methodCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  methodCardLargeActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  methodIconLargeWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconLargeWrapActive: {
    backgroundColor: CustomerColors.teal600,
  },
  methodLargeTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  methodLargeTitleActive: {
    color: CustomerColors.teal700,
  },
  methodLargeSubtitle: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  razorpayOptionCard: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  razorpayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantBadge: {
    backgroundColor: '#0D9488',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  instantBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  optionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  optionDesc: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  pill: {
    backgroundColor: '#E0F2FE',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
  },
  linkText: {
    color: CustomerColors.teal700,
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  subMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  subMethodCardActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  subMethodIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subMethodIconActive: {
    backgroundColor: '#CCFBF1',
  },
  subMethodTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  subMethodDesc: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  feeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bankTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6D28D9',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  walletTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  trustBannerText: {
    fontSize: 10,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  qrBox: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 170,
    height: 170,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  qrCaption: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningBoxText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  upiCopyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  upiCopyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  upiCopyValue: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  copyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  screenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  screenshotBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  infoBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoBoxText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    lineHeight: 18,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CustomerColors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
    lineHeight: 16,
  },
  billCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    gap: 6,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 2,
  },
  billBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  billStoreName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  paidBadge: {
    alignItems: 'flex-end',
  },
  paidBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  billOrderId: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },
  billValue: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  billTotal: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSizes.sm,
  },
});