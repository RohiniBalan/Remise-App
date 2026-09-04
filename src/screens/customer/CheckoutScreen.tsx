import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CheckCircle,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  QrCode,
  ChevronLeft,
  Store,
  Lock,
  Truck,
  Check,
  Wallet,
} from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  paymentApi,
  PAYMENT_RETURN_SENTINEL,
  AddressData,
} from '../../api/paymentApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { storeApi } from '../../api/storeApi';
import AddressFormFields from '../../components/common/AddressFormFields';
import BrandHeader from '../../components/common/BrandHeader';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { requireAuthForPurchase } from '../../utils/authGuard';

const emptyAddress = (): AddressData => ({
  country: 'India',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: 'Tamil Nadu',
  pinCode: '',
  phone: '',
});

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const {
    cart,
    buyNowItem,
    setBuyNowItem,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [shippingAddress, setShippingAddress] = useState<AddressData>(() => {
    const base = emptyAddress();
    if (user?.fullname || user?.name) {
      const parts = (user?.fullname || user?.name || '').split(' ');
      base.firstName = parts[0] || '';
      base.lastName = parts.slice(1).join(' ') || '';
    }
    if (user?.mobilenumber) {
      base.phone = user.mobilenumber;
    }
    return base;
  });
  const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress());
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr' | 'cod'>('razorpay');
  const [storeUpiInfo, setStoreUpiInfo] = useState<{
    storeName: string;
    upiId: string;
    qrCodeImage: string | null;
  } | null>(null);
  const [storeQrLoading, setStoreQrLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const itemsToCheckout = buyNowItem ? [buyNowItem] : cart;
  const subtotal = useMemo(
    () => itemsToCheckout.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [itemsToCheckout],
  );

  const isShippingValid =
    contactEmail.trim() !== '' &&
    shippingAddress.firstName.trim() !== '' &&
    shippingAddress.address.trim() !== '' &&
    shippingAddress.city.trim() !== '' &&
    shippingAddress.pinCode.trim() !== '' &&
    shippingAddress.phone.trim() !== '';

  const isBillingValid =
    billingSameAsShipping ||
    (billingAddress.firstName.trim() !== '' &&
      billingAddress.address.trim() !== '' &&
      billingAddress.city.trim() !== '' &&
      billingAddress.pinCode.trim() !== '' &&
      billingAddress.phone.trim() !== '');

  const isFormValid = isShippingValid && isBillingValid;

  useEffect(() => {
    if (paymentMethod !== 'qr') return;
    const firstItem: any = itemsToCheckout[0];
    const storeId = firstItem?.storeId || null;
    if (!storeId) {
      setStoreUpiInfo({
        storeName: 'Verified Store Merchant',
        upiId: 'rohinibalan529@oksbi',
        qrCodeImage: null,
      });
      return;
    }
    let cancelled = false;
    setStoreQrLoading(true);
    storeApi
      .getById(storeId)
      .then(res => {
        if (!cancelled && res.data?.data) {
          setStoreUpiInfo({
            storeName: res.data.data.name || 'Merchant Store',
            upiId: res.data.data.upiId || 'rohinibalan529@oksbi',
            qrCodeImage: res.data.data.qrCodeImage || null,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStoreUpiInfo({
            storeName: 'Verified Store Merchant',
            upiId: 'rohinibalan529@oksbi',
            qrCodeImage: null,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setStoreQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paymentMethod, itemsToCheckout]);

  const handlePayment = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place your order.',
      })
    )
      return;

    if (!isFormValid) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await paymentApi.initiate({
        amount: subtotal,
        userId: user?._id ?? null,
        redirectUrl: PAYMENT_RETURN_SENTINEL,
        cartItems: itemsToCheckout.map(i => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image ?? null,
          storeId: (i as any).storeId || null,
        })),
        contactEmail,
        shippingAddress,
        billingAddress: billingSameAsShipping
          ? shippingAddress
          : billingAddress,
        paymentMethod,
      });

      const data = res.data;
      if (data.success) {
        if (paymentMethod === 'cod' || paymentMethod === 'qr' || data.isCod || data.isQr) {
          if ((paymentMethod === 'qr' || data.isQr) && utrNumber) {
            try {
              await smartOrderApi.confirmQrPayment(data.orderId, null, utrNumber);
            } catch (qrErr) {
              console.warn('QR proof upload note:', qrErr);
            }
          }
          if (!buyNowItem) clearCart();
          navigation.replace('PaymentStatus', {
            orderId: data.orderId,
            status: 'SUCCESS',
          });
          return;
        }

        if (paymentMethod === 'razorpay' && (data.razorpayOrderId || data.orderId)) {
          const options = {
            provider: 'razorpay',
            order_id: data.razorpayOrderId || data.orderId,
            razorpayOrderId: data.razorpayOrderId,
            keyId: data.keyId,
            amount: data.amount,
            amountPaise: data.amountPaise || Math.round(subtotal * 100),
            currency: data.currency || 'INR',
            name: data.name || 'Remise Marketplace',
            description: data.description || `Order #${data.orderId}`,
            storeUpiId: storeUpiInfo?.upiId,
            customer: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || data.customer?.name,
              email: contactEmail || data.customer?.email,
              contact: shippingAddress.phone || data.customer?.contact,
            },
          };
          navigation.navigate('RazorpayWebView', { options, orderId: data.orderId });
          return;
        }
      }

      setError(data.message || 'Failed to initialize payment gateway.');
      setIsProcessing(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Server unreachable. Please check your connection.'
      );
      setIsProcessing(false);
    }
  };

  if (itemsToCheckout.length === 0) {
    return (
      <View style={styles.container}>
        <BrandHeader />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>There is nothing to checkout.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() =>
              navigation.navigate('CustomerTabs', { screen: 'Categories' })
            }
          >
            <Text style={styles.emptyBtnText}>Return to Shop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => {
            setBuyNowItem(null);
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={20} color={CustomerColors.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <Text style={styles.headerTitle}>Secure Checkout</Text>
            {buyNowItem ? (
              <View style={styles.buyNowPill}>
                <Text style={styles.buyNowPillText}>BUY NOW</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.sslBadge}>
          <ShieldCheck size={12} color={CustomerColors.teal700} />
          <Text style={styles.sslBadgeText}>256-Bit SSL</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={CustomerColors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 1. Order Items Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <Text style={styles.itemCountText}>
              {itemsToCheckout.length} item{itemsToCheckout.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {itemsToCheckout.map(item => (
            <View key={item.id} style={styles.lineItem}>
              <Image
                source={{ uri: item.image ?? undefined }}
                style={styles.lineImage}
              />
              <View style={styles.lineInfo}>
                <Text style={styles.lineTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.lineBottomRow}>
                  <View style={styles.qtyStepper}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => decreaseQuantity(item.id)}
                    >
                      <Minus size={12} color={CustomerColors.teal700} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => addToCart(item)}
                    >
                      <Plus size={12} color={CustomerColors.teal700} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.linePrice}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={{ marginLeft: Spacing.sm }}
                  >
                    <Trash2 size={15} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.priceStrip}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text style={[styles.priceValue, { color: '#15803D' }]}>FREE</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 2. Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Contact Information</Text>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="e.g. yourname@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* 3. Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Delivery Address</Text>
          <AddressFormFields
            data={shippingAddress}
            onChange={(field, v) =>
              setShippingAddress(prev => ({ ...prev, [field]: v }))
            }
          />
        </View>

        {/* 4. Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Payment Method</Text>

          {/* 1. Razorpay */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'razorpay' && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod('razorpay')}
          >
            <View
              style={[
                styles.radio,
                paymentMethod === 'razorpay' && styles.radioActive,
              ]}
            >
              {paymentMethod === 'razorpay' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <Text style={styles.paymentTitle}>Online Payment (Razorpay)</Text>
                <View style={styles.instantTag}>
                  <Text style={styles.instantTagText}>INSTANT</Text>
                </View>
              </View>
              <Text style={styles.paymentSubtitle}>
                UPI, Debit/Credit Cards, Net Banking & Wallets
              </Text>
            </View>
            <CreditCard size={18} color={CustomerColors.teal600} />
          </TouchableOpacity>

          {/* 2. Store QR */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'qr' && styles.paymentCardActive,
              { marginTop: Spacing.sm },
            ]}
            onPress={() => setPaymentMethod('qr')}
          >
            <View
              style={[
                styles.radio,
                paymentMethod === 'qr' && styles.radioActive,
              ]}
            >
              {paymentMethod === 'qr' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Direct Store QR Code</Text>
              <Text style={styles.paymentSubtitle}>
                Scan merchant's QR and pay via any UPI app
              </Text>
            </View>
            <QrCode size={18} color={CustomerColors.teal600} />
          </TouchableOpacity>

          {paymentMethod === 'qr' && (
            <View style={styles.qrContainer}>
              {storeQrLoading ? (
                <ActivityIndicator color={CustomerColors.teal600} />
              ) : (
                <>
                  <View style={styles.qrHeader}>
                    <Text style={styles.qrStoreName}>
                      {storeUpiInfo?.storeName || 'Verified Store Merchant'}
                    </Text>
                    <Text style={styles.qrAmount}>
                      ₹{subtotal.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.qrImageBox}>
                    <Image
                      source={{
                        uri:
                          storeUpiInfo?.qrCodeImage ||
                          `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${storeUpiInfo?.upiId || 'rohinibalan529@oksbi'}&pn=${encodeURIComponent(storeUpiInfo?.storeName || 'Store Merchant')}&am=${subtotal.toFixed(2)}&cu=INR&tn=Remise_Order`
                          )}&margin=4`,
                      }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.vpaPill}>
                    <Text style={styles.vpaLabel}>UPI ID:</Text>
                    <Text style={styles.vpaValue}>
                      {storeUpiInfo?.upiId || 'rohinibalan529@oksbi'}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.utrInput}
                    value={utrNumber}
                    onChangeText={setUtrNumber}
                    placeholder="UPI Reference / UTR Number (Optional)"
                    placeholderTextColor="#9CA3AF"
                  />
                </>
              )}
            </View>
          )}

          {/* 3. Cash on Delivery */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'cod' && styles.paymentCardActive,
              { marginTop: Spacing.sm },
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View
              style={[
                styles.radio,
                paymentMethod === 'cod' && styles.radioActive,
              ]}
            >
              {paymentMethod === 'cod' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtitle}>
                Pay cash to delivery person upon arrival
              </Text>
            </View>
            <Wallet size={18} color={CustomerColors.teal600} />
          </TouchableOpacity>
        </View>

        {/* 5. Billing Address */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.checkboxRow]}
            onPress={() => setBillingSameAsShipping(!billingSameAsShipping)}
          >
            <View style={[styles.checkbox, billingSameAsShipping && styles.checkboxActive]}>
              {billingSameAsShipping && <Check size={12} color="#fff" strokeWidth={3} />}
            </View>
            <Text style={styles.checkboxText}>Billing address same as shipping</Text>
          </TouchableOpacity>

          {!billingSameAsShipping && (
            <View style={{ marginTop: Spacing.md }}>
              <AddressFormFields
                data={billingAddress}
                onChange={(field, v) =>
                  setBillingAddress(prev => ({ ...prev, [field]: v }))
                }
              />
            </View>
          )}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!isFormValid || isProcessing) && styles.payBtnDisabled,
          ]}
          onPress={handlePayment}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Lock size={16} color="#fff" />
              <Text style={styles.payBtnText}>
                {paymentMethod === 'razorpay'
                  ? `Pay ₹${subtotal.toLocaleString()} via Razorpay`
                  : paymentMethod === 'qr'
                  ? `Place Order via Store QR · ₹${subtotal.toLocaleString()}`
                  : `Confirm Order (COD) · ₹${subtotal.toLocaleString()}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  buyNowPill: {
    backgroundColor: CustomerColors.mint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  buyNowPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  sslBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.dangerBg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorText: { flex: 1, color: CustomerColors.danger, fontSize: FontSizes.xs },
  card: {
    backgroundColor: CustomerColors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.xs,
  },
  itemCountText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    fontWeight: '700',
  },
  inputLabel: {
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
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  lineItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
  },
  lineInfo: { flex: 1, gap: 4 },
  lineTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  lineBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
  },
  qtyBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyValue: {
    width: 18,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 10,
    color: CustomerColors.black,
  },
  linePrice: {
    fontWeight: '800',
    color: CustomerColors.teal700,
    fontSize: FontSizes.xs,
  },
  priceStrip: {
    paddingTop: Spacing.sm,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  priceValue: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  totalRow: {
    paddingTop: Spacing.xs,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  totalValue: {
    fontSize: FontSizes.md,
    fontWeight: '900',
    color: CustomerColors.teal700,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  paymentCardActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: CustomerColors.teal600 },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CustomerColors.teal600,
  },
  paymentTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  paymentSubtitle: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  instantTag: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  instantTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  qrContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  qrStoreName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  qrAmount: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  qrImageBox: {
    padding: Spacing.xs,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  vpaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vpaLabel: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  vpaValue: {
    fontSize: 10,
    color: CustomerColors.black,
    fontWeight: '700',
  },
  utrInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  checkboxText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  payBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    margin: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: CustomerColors.teal600,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: '#fff',
  },
});