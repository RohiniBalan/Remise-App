import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  MapPin,
  Store,
  Truck,
  QrCode,
  Wallet,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  PackageX,
  X,
} from 'lucide-react-native';
import {
  smartOrderApi,
  StoreResult,
  SmartOrderCartItem,
} from '../../api/smartOrderApi';
import { storeApi } from '../../api/storeApi';
import { useAuth } from '../../context/AuthContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { requireAuthForPurchase } from '../../utils/authGuard';

// Ported from client/app/(root)/bulk-purchase/CompareModal.tsx — same step
// machine (radius -> searching -> results -> confirming -> delivery ->
// payment -> placing -> success/error), same nearby-store matching call
// sequence, same delivery method (Self Pickup / Home Delivery) and payment
// method (QR / Cash) options, same QR-fetch-scoped-to-chosen-store
// behavior (storeApi.getById(chosen.storeId) — never any other store's
// QR), same optional payment-screenshot upload. `cod`/`qr` here never
// trigger any external redirect (see smartOrderApi.ts), so unlike the main
// Checkout flow this never needs a WebView.
const RADIUS_OPTIONS = [2, 5, 10, 15, 20];
type Step =
  | 'radius'
  | 'searching'
  | 'results'
  | 'confirming'
  | 'delivery'
  | 'payment'
  | 'placing'
  | 'success';

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function CompareStoresScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const items: SmartOrderCartItem[] = route.params.items;
  const { user, token } = useAuth();

  const [step, setStep] = useState<Step>('radius');
  const [radius, setRadius] = useState(5);
  const [customRadius, setCustomRadius] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState<StoreResult[]>([]);
  const [chosen, setChosen] = useState<StoreResult | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<
    'pickup' | 'delivery' | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr' | null>(null);
  const [storeQr, setStoreQr] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState<AddressForm>({
    firstName: user?.fullname?.split(' ')[0] || '',
    lastName: user?.fullname?.split(' ').slice(1).join(' ') || '',
    phone: user?.mobilenumber || '',
    contactEmail: user?.email || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const setField = (k: keyof AddressForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (paymentMethod !== 'qr' || !chosen) return;
    let cancelled = false;
    setQrLoading(true);
    storeApi
      .getById(chosen.storeId)
      .then(res => {
        if (!cancelled) setStoreQr(res.data?.data?.qrCodeImage || null);
      })
      .catch(() => {
        if (!cancelled) setStoreQr(null);
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paymentMethod, chosen]);

  const effectiveRadius = customRadius ? parseFloat(customRadius) : radius;

  const runSearch = async () => {
    if (!effectiveRadius || effectiveRadius <= 0) {
      setErrorMsg('Please choose a valid search radius.');
      return;
    }
    setStep('searching');
    setErrorMsg('');

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('[NearbySearch] location permission denied', {
        at: new Date().toISOString(),
        userId: user?._id,
      });
      setErrorMsg(
        'Location access denied. Enable location to compare nearby stores.',
      );
      setStep('radius');
      return;
    }

    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const requestMeta = {
          at: new Date().toISOString(),
          userId: user?._id ?? null,
          latitude,
          longitude,
          gpsAccuracyMeters: accuracy,
          gpsFixTimestamp: new Date(pos.timestamp).toISOString(),
          radiusKm: effectiveRadius,
        };
        console.log(
          '[NearbySearch] requesting /api/stores/nearby',
          requestMeta,
        );
        try {
          const storesRes = await smartOrderApi.getNearbyStores(
            latitude,
            longitude,
            effectiveRadius,
          );
          console.log('[NearbySearch] /api/stores/nearby response', {
            ...requestMeta,
            status: storesRes.status,
            rawResponse: storesRes.data,
          });
          const stores: any[] = storesRes.data.data || [];
          if (!stores.length) {
            console.log(
              '[NearbySearch] no stores in radius — stopping before matchCart',
              requestMeta,
            );
            setResults([]);
            setStep('results');
            return;
          }
          const storeIds = stores.map(s => s._id);
          console.log('[NearbySearch] requesting matchCart', {
            ...requestMeta,
            storeIds,
            items,
          });
          const matchRes = await smartOrderApi.matchCart(items, storeIds);
          console.log('[NearbySearch] matchCart response', {
            ...requestMeta,
            rawResponse: matchRes.data,
          });
          const ranked: any[] = matchRes.data.data || [];
          const byId: Record<string, any> = {};
          stores.forEach(s => (byId[s._id] = s));
          const merged: StoreResult[] = ranked.map(r => ({
            ...r,
            storeName: byId[r.storeId]?.name || 'Store',
            distanceKm: byId[r.storeId]?.distanceKm ?? 0,
          }));
          console.log('[NearbySearch] final merged results shown to UI', {
            ...requestMeta,
            nearbyStoreIds: storeIds,
            nearbyStoreNames: stores.map(s => s.name),
            matchedStoreIds: ranked.map(r => r.storeId),
            droppedByMatchCart: storeIds.filter(
              id => !ranked.some(r => r.storeId === id),
            ),
          });
          setResults(merged);
          setStep('results');
        } catch (err: any) {
          console.log('[NearbySearch] request failed', {
            ...requestMeta,
            error: err?.response?.data || err?.message,
          });
          setErrorMsg(
            err.response?.data?.message ||
              'Could not compare nearby stores. Please try again.',
          );
          setStep('radius');
        }
      },
      err => {
        console.log('[NearbySearch] Geolocation.getCurrentPosition failed', {
          at: new Date().toISOString(),
          userId: user?._id,
          error: err,
        });
        setErrorMsg(
          'Location access denied. Enable location to compare nearby stores.',
        );
        setStep('radius');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleConfirmDetails = () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to continue with this bulk purchase.',
      })
    )
      return;
    if (
      !chosen ||
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pinCode.trim()
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setStep('delivery');
  };

  const pickScreenshot = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (uri) setScreenshotUri(uri);
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
    if (!chosen || !deliveryMethod || !paymentMethod) return;
    setStep('placing');
    setErrorMsg('');
    try {
      const cartItems = chosen.matched.map(m => ({
        id: m.product.id,
        title: m.product.title,
        price: m.product.price,
        quantity: 1,
        image: m.product.image,
      }));
      const res = await smartOrderApi.placeOrder({
        amount: chosen.totalAmount,
        cartItems,
        contactEmail: form.contactEmail,
        shippingAddress: form,
        userId: user?._id || null,
        storeId: chosen.storeId,
        storeName: chosen.storeName,
        deliveryMethod,
        paymentMethod,
      });

      if (!res.data.success)
        throw new Error(res.data.message || 'Order failed.');

      const match = (res.data.url || '').match(/orderId=([^&]+)/);
      const placedOrderId = match ? match[1] : '';
      setOrderId(placedOrderId);

      if (paymentMethod === 'qr' && placedOrderId) {
        await smartOrderApi.confirmQrPayment(placedOrderId, screenshotUri);
      }

      setStep('success');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          'Order failed. Please try again.',
      );
      setStep('payment');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Find Cheapest Store</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} item{items.length !== 1 ? 's' : ''} on your list
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={22} color={CustomerColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={14} color={CustomerColors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {(step === 'radius' || step === 'searching') && (
            <View style={{ gap: Spacing.md }}>
              <Text style={styles.stepText}>
                Choose how far we should search for stores near you.
              </Text>
              <View style={styles.radiusRow}>
                {RADIUS_OPTIONS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.radiusChip,
                      radius === r && !customRadius && styles.radiusChipActive,
                    ]}
                    onPress={() => {
                      setRadius(r);
                      setCustomRadius('');
                    }}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        radius === r &&
                          !customRadius &&
                          styles.radiusChipTextActive,
                      ]}
                    >
                      {r} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Custom km"
                keyboardType="number-pad"
                value={customRadius}
                onChangeText={setCustomRadius}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={runSearch}
                disabled={step === 'searching'}
              >
                {step === 'searching' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MapPin size={16} color="#fff" />
                )}
                <Text style={styles.primaryBtnText}>
                  {step === 'searching'
                    ? 'Searching nearby stores…'
                    : `Search within ${customRadius || radius} km`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'results' && (
            <View style={{ gap: Spacing.md }}>
              {results.length === 0 && (
                <View style={styles.center}>
                  <PackageX size={40} color={CustomerColors.steelBorder} />
                  <Text style={styles.emptyTitle}>
                    No nearby stores carry these items
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Try a larger search radius.
                  </Text>
                  <TouchableOpacity onPress={() => setStep('radius')}>
                    <Text style={styles.linkText}>← Change radius</Text>
                  </TouchableOpacity>
                </View>
              )}
              {results.map((r, idx) => (
                <View
                  key={r.storeId}
                  style={[styles.storeCard, idx === 0 && styles.storeCardBest]}
                >
                  <View style={styles.storeCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.storeNameRow}>
                        <Text style={styles.storeName}>{r.storeName}</Text>
                        {idx === 0 && (
                          <View style={styles.bestBadge}>
                            <Text style={styles.bestBadgeText}>Best match</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.storeMeta}>
                        {r.distanceKm} km away · {r.matchedCount}/
                        {r.totalRequested} items available
                      </Text>
                    </View>
                    <Text style={styles.storeAmount}>
                      ₹{r.totalAmount.toFixed(0)}
                    </Text>
                  </View>
                  {r.matched.length > 0 && (
                    <View style={{ marginTop: Spacing.xs }}>
                      {r.matched.map(m => (
                        <View key={m.requestedName} style={styles.matchedRow}>
                          <PackageCheck
                            size={11}
                            color={CustomerColors.teal600}
                          />
                          <Text style={styles.matchedText}>
                            {m.product.title} — ₹{m.product.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {(r.insufficientStock.length > 0 ||
                    r.unmatched.length > 0) && (
                    <Text style={styles.unmatchedText}>
                      Not available:{' '}
                      {[
                        ...r.insufficientStock.map(i => i.requestedName),
                        ...r.unmatched,
                      ].join(', ')}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => {
                      setChosen(r);
                      setStep('confirming');
                    }}
                  >
                    <Text style={styles.selectBtnText}>Select this store</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {results.length > 0 && (
                <TouchableOpacity onPress={() => setStep('radius')}>
                  <Text style={styles.linkText}>
                    ← Search a different radius
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 'confirming' && chosen && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.chosenSummary}>
                <View>
                  <Text style={styles.storeName}>{chosen.storeName}</Text>
                  <Text style={styles.storeMeta}>
                    {chosen.matchedCount}/{chosen.totalRequested} items ·{' '}
                    {chosen.distanceKm} km away
                  </Text>
                </View>
                <Text style={styles.storeAmount}>
                  ₹{chosen.totalAmount.toFixed(0)}
                </Text>
              </View>

              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="First Name *"
                  placeholderTextColor="#9CA3AF"
                  value={form.firstName}
                  onChangeText={v => setField('firstName', v)}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                  value={form.lastName}
                  onChangeText={v => setField('lastName', v)}
                />
              </View>
              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Phone *"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={v => setField('phone', v)}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  value={form.contactEmail}
                  onChangeText={v => setField('contactEmail', v)}
                />
              </View>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Address *"
                placeholderTextColor="#9CA3AF"
                multiline
                value={form.address}
                onChangeText={v => setField('address', v)}
              />
              <View style={styles.row3}>
                <TextInput
                  style={[styles.input, styles.third]}
                  placeholder="City *"
                  placeholderTextColor="#9CA3AF"
                  value={form.city}
                  onChangeText={v => setField('city', v)}
                />
                <TextInput
                  style={[styles.input, styles.third]}
                  placeholder="State *"
                  placeholderTextColor="#9CA3AF"
                  value={form.state}
                  onChangeText={v => setField('state', v)}
                />
                <TextInput
                  style={[styles.input, styles.third]}
                  placeholder="Pin Code *"
                  placeholderTextColor="#9CA3AF"
                  value={form.pinCode}
                  onChangeText={v => setField('pinCode', v)}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep('results')}
                >
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={handleConfirmDetails}
                >
                  <Text style={styles.primaryBtnText}>
                    Continue — ₹{chosen.totalAmount.toFixed(0)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'delivery' && chosen && (
            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.stepText}>
                How would you like to receive your order from{' '}
                <Text style={{ fontWeight: '700' }}>{chosen.storeName}</Text>?
              </Text>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  setDeliveryMethod('pickup');
                  setStep('payment');
                }}
              >
                <Store size={20} color={CustomerColors.teal600} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Self Pickup</Text>
                  <Text style={styles.optionDesc}>
                    Visit the shop and collect your order yourself.
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  setDeliveryMethod('delivery');
                  setStep('payment');
                }}
              >
                <Truck size={20} color={CustomerColors.teal600} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Home Delivery</Text>
                  <Text style={styles.optionDesc}>
                    {chosen.storeName} will deliver the order to your address.
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('confirming')}>
                <Text style={styles.linkText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'payment' && chosen && (
            <View style={{ gap: Spacing.sm }}>
              {!paymentMethod && (
                <>
                  <Text style={styles.stepText}>
                    How would you like to pay?
                  </Text>
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => setPaymentMethod('qr')}
                  >
                    <QrCode size={20} color={CustomerColors.teal600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>QR Code Payment</Text>
                      <Text style={styles.optionDesc}>
                        Scan {chosen.storeName}'s QR code and pay instantly.
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => setPaymentMethod('cod')}
                  >
                    <Wallet size={20} color={CustomerColors.teal600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Cash</Text>
                      <Text style={styles.optionDesc}>
                        {deliveryMethod === 'pickup'
                          ? 'Pay at the shop when you collect your order.'
                          : 'Pay cash on delivery.'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep('delivery')}>
                    <Text style={styles.linkText}>← Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {paymentMethod === 'cod' && (
                <View style={{ gap: Spacing.md }}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>
                      {deliveryMethod === 'pickup'
                        ? 'You will pay in cash when you pick up your order at the shop.'
                        : 'You will pay in cash to the delivery person (Cash on Delivery).'}
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
                        Confirm & Order — ₹{chosen.totalAmount.toFixed(0)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {paymentMethod === 'qr' && (
                <View style={{ gap: Spacing.md }}>
                  {qrLoading && (
                    <Text style={styles.stepText}>
                      Loading {chosen.storeName}'s QR code…
                    </Text>
                  )}
                  {!qrLoading && storeQr && (
                    <View style={styles.qrBox}>
                      <Image source={{ uri: storeQr }} style={styles.qrImage} />
                      <Text style={styles.qrCaption}>
                        Scan with any UPI app to pay {chosen.storeName} ₹
                        {chosen.totalAmount.toFixed(0)}
                      </Text>
                    </View>
                  )}
                  {!qrLoading && !storeQr && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningBoxText}>
                        This shop hasn't set up QR payment yet. Please go back
                        and choose Cash instead.
                      </Text>
                    </View>
                  )}
                  {storeQr && (
                    <TouchableOpacity
                      style={styles.screenshotBtn}
                      onPress={pickScreenshot}
                    >
                      <Text style={styles.screenshotBtnText}>
                        {screenshotUri
                          ? 'Screenshot selected ✓'
                          : 'Upload payment screenshot (optional)'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => setPaymentMethod(null)}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        { flex: 1 },
                        !storeQr && styles.primaryBtnDisabled,
                      ]}
                      onPress={handlePlaceOrder}
                      disabled={!storeQr}
                    >
                      <CheckCircle2 size={16} color="#fff" />
                      <Text style={styles.primaryBtnText}>
                        I've Completed Payment
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 'placing' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={styles.stepText}>Placing your order…</Text>
            </View>
          )}

          {step === 'success' && chosen && (
            <View style={styles.center}>
              <CheckCircle2 size={48} color={CustomerColors.success} />
              <Text style={styles.successTitle}>Order Placed!</Text>
              <Text style={styles.successText}>
                Your order from{' '}
                <Text style={{ fontWeight: '700' }}>{chosen.storeName}</Text> is
                confirmed —{' '}
                {deliveryMethod === 'pickup'
                  ? 'ready for self pickup'
                  : 'out for home delivery'}
                , paying via {paymentMethod === 'qr' ? 'QR code' : 'cash'}. You
                and the store have been notified.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: CustomerColors.mint,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  errorBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, color: CustomerColors.danger, fontSize: FontSizes.xs },
  stepText: { fontSize: FontSizes.sm, color: '#4B5563' },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.bg,
  },
  radiusChipActive: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.teal600,
  },
  radiusChipText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: { color: CustomerColors.teal700 },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  secondaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  secondaryBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
  },
  linkText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal600,
    fontWeight: '600',
    textAlign: 'center',
  },
  storeCard: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: CustomerColors.white,
  },
  storeCardBest: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  storeCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  storeName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  bestBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  storeMeta: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  storeAmount: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  matchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  matchedText: { fontSize: FontSizes.xs, color: '#4B5563' },
  unmatchedText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.warning,
    marginTop: Spacing.xs,
  },
  selectBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  selectBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
  chosenSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  row3: { flexDirection: 'row', gap: Spacing.sm },
  half: { flex: 1 },
  third: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  optionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  optionDesc: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoBoxText: { fontSize: FontSizes.sm, color: '#4B5563' },
  warningBox: {
    backgroundColor: CustomerColors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningBoxText: { fontSize: FontSizes.sm, color: '#92400E' },
  qrBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.sm,
  },
  qrCaption: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },
  screenshotBtn: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  screenshotBtnText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  successText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  doneBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  doneBtnText: { color: '#fff', fontWeight: '700' },
});
