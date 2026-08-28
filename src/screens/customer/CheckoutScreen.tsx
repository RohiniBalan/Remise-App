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
} from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  paymentApi,
  extractOrderId,
  PAYMENT_RETURN_SENTINEL,
  AddressData,
} from '../../api/paymentApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { storeApi } from '../../api/storeApi';
import AddressFormFields from '../../components/common/AddressFormFields';
import {
  GoldColors,
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { requireAuthForPurchase } from '../../utils/authGuard';

// Ported from client/app/checkout/page.tsx — same items-to-checkout logic
// (buyNowItem takes priority over the full cart, exactly like web), same
// validation rules (isShippingValid/isBillingValid/isFormValid), same
// payment methods (phonepe/cod), same qty +/- / remove handlers for the
// order-summary line items (including the buyNowItem-vs-cart branching),
// and the same POST /api/payment/initiate payload shape. The PhonePe
// redirect becomes an in-app WebView (see PhonePeWebViewScreen) since
// there's no browser `window.location.href` on mobile.
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
  const { user } = useAuth();
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
  const [shippingAddress, setShippingAddress] = useState<AddressData>(
    emptyAddress(),
  );
  const [billingAddress, setBillingAddress] = useState<AddressData>(
    emptyAddress(),
  );
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr' | 'cod'>(
    'razorpay',
  );
  const [storeUpiInfo, setStoreUpiInfo] = useState<{
    storeName: string;
    upiId: string;
    qrCodeImage: string | null;
  } | null>(null);
  const [storeQrLoading, setStoreQrLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
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
    shippingAddress.lastName.trim() !== '' &&
    shippingAddress.address.trim() !== '' &&
    shippingAddress.city.trim() !== '' &&
    shippingAddress.pinCode.trim() !== '' &&
    shippingAddress.phone.trim() !== '';

  const isBillingValid =
    billingSameAsShipping ||
    (billingAddress.firstName.trim() !== '' &&
      billingAddress.lastName.trim() !== '' &&
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

  const handleIncrease = (item: (typeof itemsToCheckout)[number]) => {
    if (item.totalStock && item.quantity >= item.totalStock) {
      setError('Out of stock');
      return;
    }
    if (buyNowItem)
      setBuyNowItem({ ...buyNowItem, quantity: buyNowItem.quantity + 1 });
    else addToCart(item);
  };

  const handleDecrease = (item: (typeof itemsToCheckout)[number]) => {
    if (buyNowItem) {
      if (buyNowItem.quantity > 1)
        setBuyNowItem({ ...buyNowItem, quantity: buyNowItem.quantity - 1 });
      else setBuyNowItem(null);
    } else {
      decreaseQuantity(item.id);
    }
  };

  const handleRemove = (item: (typeof itemsToCheckout)[number]) => {
    if (buyNowItem) setBuyNowItem(null);
    else removeFromCart(item.id);
  };

  const handlePayment = async () => {
    if (!isFormValid) return;
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(user?._id),
        message: 'Please sign in to complete your order.',
      })
    )
      return;
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

        if ((paymentMethod === 'cashfree' || paymentMethod === 'razorpay') && (data.paymentSessionId || data.cashfreeOrderId || data.razorpayOrderId)) {
          const options = {
            order_id: data.cashfreeOrderId || data.razorpayOrderId || data.orderId,
            paymentSessionId: data.paymentSessionId,
            cashfreeOrderId: data.cashfreeOrderId,
            amount: data.amount,
            amountInRupees: subtotal,
            currency: data.currency || 'INR',
            name: data.name || 'WOW Lifestyle Marketplace',
            description: data.description || `Order #${data.orderId}`,
            storeUpiId: storeUpiInfo?.upiId,
            isSandbox: Boolean(data.isSandbox || data.isMock),
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

      setError(
        data.message || 'Failed to initialize payment gateway.'
      );
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
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
    >
      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={CustomerColors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Order Summary {buyNowItem ? '(Buy Now)' : ''}
        </Text>
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
                    <Minus size={12} color={CustomerColors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(item)}
                  >
                    <Plus size={12} color={CustomerColors.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.linePrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={{ marginLeft: Spacing.sm }}
                >
                  <Trash2 size={15} color={CustomerColors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Shipping</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="Email address *"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ marginTop: Spacing.sm }}>
          <AddressFormFields
            data={shippingAddress}
            onChange={(field, v) =>
              setShippingAddress(prev => ({ ...prev, [field]: v }))
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        {/* 1. Cashfree Easy Split Gateway */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            (paymentMethod === 'cashfree' || paymentMethod === 'razorpay') && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('cashfree')}
        >
          <View
            style={[
              styles.radio,
              (paymentMethod === 'cashfree' || paymentMethod === 'razorpay') && styles.radioActive,
            ]}
          >
            {(paymentMethod === 'cashfree' || paymentMethod === 'razorpay') && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.paymentLabel}>
            Cashfree Gateway (Easy Split · UPI, Cards, NetBanking)
          </Text>
          <CreditCard
            size={18}
            color={GoldColors.gold}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>
        {(paymentMethod === 'cashfree' || paymentMethod === 'razorpay') && (
          <View style={styles.phonepeNote}>
            <ShieldCheck size={20} color={GoldColors.gold} />
            <Text style={styles.phonepeNoteText}>
              Dynamic UPI QR with real-time verification, Cards, and UPI Apps (GPay, PhonePe, Paytm).
            </Text>
          </View>
        )}

        {/* 2. Direct Store QR Code (Merchant UPI) */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'qr' && styles.paymentOptionActive,
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
          <Text style={styles.paymentLabel}>
            Direct Store QR Code (Merchant UPI)
          </Text>
          <QrCode
            size={18}
            color={GoldColors.gold}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {paymentMethod === 'qr' && (
          <View style={styles.qrContainer}>
            {storeQrLoading ? (
              <ActivityIndicator color={GoldColors.gold} />
            ) : (
              <>
                <View style={styles.qrHeader}>
                  <Text style={styles.qrStoreName}>
                    {storeUpiInfo?.storeName || 'Verified Store Merchant'}
                  </Text>
                  <Text style={styles.qrAmount}>
                    Pay ₹{subtotal.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.qrImageBox}>
                  <Image
                    source={{
                      uri:
                        storeUpiInfo?.qrCodeImage ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=${storeUpiInfo?.upiId || 'rohinibalan529@oksbi'}&pn=${encodeURIComponent(storeUpiInfo?.storeName || 'Store Merchant')}&am=${subtotal.toFixed(2)}&cu=INR&tn=Order_Checkout`
                        )}&margin=4`,
                    }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.vpaPill}>
                  <Text style={styles.vpaLabel}>Merchant UPI VPA:</Text>
                  <Text style={styles.vpaValue}>
                    {storeUpiInfo?.upiId || 'rohinibalan529@oksbi'}
                  </Text>
                </View>

                <Text style={styles.qrDesc}>
                  Scan using Google Pay, PhonePe, Paytm, CRED or BHIM on your phone to pay directly.
                </Text>

                <TextInput
                  style={styles.utrInput}
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  placeholder="UPI Reference / UTR Number (Optional)"
                  placeholderTextColor="#999"
                />
              </>
            )}
          </View>
        )}

        {/* 3. COD */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'cod' && styles.paymentOptionActive,
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
          <Text style={styles.paymentLabel}>Cash on Delivery (COD)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Address</Text>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            billingSameAsShipping && styles.paymentOptionActive,
          ]}
          onPress={() => setBillingSameAsShipping(true)}
        >
          <View
            style={[styles.radio, billingSameAsShipping && styles.radioActive]}
          >
            {billingSameAsShipping && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.paymentLabel}>Same as shipping address</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            !billingSameAsShipping && styles.paymentOptionActive,
          ]}
          onPress={() => setBillingSameAsShipping(false)}
        >
          <View
            style={[styles.radio, !billingSameAsShipping && styles.radioActive]}
          >
            {!billingSameAsShipping && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.paymentLabel}>
            Use a different billing address
          </Text>
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

      {!isFormValid && (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={CustomerColors.danger} />
          <Text style={styles.errorText}>
            Please fill in all mandatory details to proceed.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.payBtn,
          (!isFormValid || isProcessing) && styles.payBtnDisabled,
        ]}
        onPress={handlePayment}
        disabled={!isFormValid || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <CheckCircle size={18} color="#000" />
            <Text style={styles.payBtnText}>
              {paymentMethod === 'razorpay'
                ? 'Pay with Razorpay'
                : paymentMethod === 'qr'
                ? 'Place Order via Store QR'
                : 'Complete Order (COD)'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
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
    backgroundColor: GoldColors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyBtnText: { color: '#000', fontWeight: '800' },
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
  section: {
    backgroundColor: CustomerColors.white,
    margin: Spacing.md,
    marginBottom: 0,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
  },
  lineItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  lineImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F9F9F9',
  },
  lineInfo: { flex: 1, gap: 6 },
  lineTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  lineBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    width: 20,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  lineTotal: {
    marginLeft: 'auto',
    fontWeight: '700',
    color: CustomerColors.black,
    fontSize: FontSizes.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.border,
    marginTop: Spacing.xs,
  },
  summaryLabel: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  summaryValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  summaryValueMuted: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.border,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paymentOptionActive: {
    borderColor: GoldColors.gold,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: GoldColors.gold },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GoldColors.gold,
  },
  paymentLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  phonepeNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  phonepeNoteText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  qrContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.border,
  },
  qrStoreName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  qrAmount: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  qrImageBox: {
    padding: Spacing.xs,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  qrImage: {
    width: 160,
    height: 160,
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
    borderColor: CustomerColors.border,
  },
  vpaLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  vpaValue: {
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
    fontWeight: '700',
  },
  qrDesc: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
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
    fontFamily: 'monospace',
    color: CustomerColors.black,
  },
  payBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GoldColors.gold,
    margin: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
