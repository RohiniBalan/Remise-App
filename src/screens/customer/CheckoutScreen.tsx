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
  ChevronLeft,
  Store,
  Lock,
  Truck,
  Check,
} from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  paymentApi,
  PAYMENT_RETURN_SENTINEL,
  AddressData,
} from '../../api/paymentApi';
import AddressFormFields from '../../components/common/AddressFormFields';
import BrandHeader from '../../components/common/BrandHeader';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
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
  const { isDark } = useTheme();
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

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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
  const [paymentMethod, setPaymentMethod] = useState<'razorpay'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const itemsToCheckout = buyNowItem ? [buyNowItem] : cart;
  const subtotal = useMemo(
    () => itemsToCheckout.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [itemsToCheckout],
  );

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  const isPhoneValid = (phone: string) => /^\d{10}$/.test((phone || '').trim());

  const isShippingValid =
    isEmailValid(contactEmail) &&
    shippingAddress.firstName.trim() !== '' &&
    shippingAddress.address.trim() !== '' &&
    shippingAddress.city.trim() !== '' &&
    shippingAddress.pinCode.trim() !== '' &&
    isPhoneValid(shippingAddress.phone);

  const isBillingValid =
    billingSameAsShipping ||
    (billingAddress.firstName.trim() !== '' &&
      billingAddress.address.trim() !== '' &&
      billingAddress.city.trim() !== '' &&
      billingAddress.pinCode.trim() !== '' &&
      isPhoneValid(billingAddress.phone));

  const isFormValid = isShippingValid && isBillingValid;

  const handlePayment = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place your order.',
      })
    )
      return;

    if (!isEmailValid(contactEmail)) {
      setError('Please enter a valid email address.');
      setCurrentStep(1);
      return;
    }

    if (!isPhoneValid(shippingAddress.phone)) {
      setError('Please enter a valid 10-digit phone number for shipping.');
      setCurrentStep(2);
      return;
    }

    if (!billingSameAsShipping && !isPhoneValid(billingAddress.phone)) {
      setError('Please enter a valid 10-digit phone number for billing.');
      setCurrentStep(2);
      return;
    }

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
        paymentMethod: 'razorpay',
      });

      const data = res.data;
      if (data.success && (data.razorpayOrderId || data.orderId)) {
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
          customer: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || data.customer?.name,
            email: contactEmail || data.customer?.email,
            contact: shippingAddress.phone || data.customer?.contact,
          },
        };
        navigation.navigate('RazorpayWebView', { options, orderId: data.orderId });
        return;
      }

      setError(data.message || 'Failed to initialize payment gateway.');
      setIsProcessing(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Payment initiation failed. Please try again.',
      );
      setIsProcessing(false);
    }
  };

  if (itemsToCheckout.length === 0) {
    return (
      <View style={[styles.container, isDark && { backgroundColor: '#0a0f1d' }]}>
        <BrandHeader />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>There is nothing to checkout.</Text>
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
    <View style={[styles.container, isDark && { backgroundColor: '#0a0f1d' }]}>
      <BrandHeader />

      {/* Header bar */}
      <View style={[styles.headerBar, isDark && { backgroundColor: '#111827', borderBottomColor: '#1F2937' }]}>
        <TouchableOpacity
          onPress={() => {
            setBuyNowItem(null);
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={20} color={isDark ? '#FFFFFF' : CustomerColors.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Secure Checkout</Text>
            {buyNowItem ? (
              <View style={[styles.buyNowPill, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)', borderColor: '#006D77' }]}>
                <Text style={[styles.buyNowPillText, isDark && { color: '#5EEAD4' }]}>BUY NOW</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.sslBadge, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.15)', borderColor: 'rgba(15, 163, 177, 0.3)' }]}>
          <ShieldCheck size={12} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
          <Text style={[styles.sslBadgeText, isDark && { color: '#5EEAD4' }]}>256-Bit SSL</Text>
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

        {/* 1. Order Items Summary (Kept Intact) */}
        <View style={[styles.card, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && { color: '#FFFFFF' }]}>Order Summary</Text>
            <Text style={[styles.itemCountText, isDark && { color: '#5EEAD4' }]}>
              {itemsToCheckout.length} item{itemsToCheckout.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {itemsToCheckout.map(item => (
            <View key={item.id} style={[styles.lineItem, isDark && { borderBottomColor: '#1F2937' }]}>
              <Image
                source={{ uri: item.image ?? undefined }}
                style={[styles.lineImage, isDark && { backgroundColor: '#1F2937' }]}
              />
              <View style={styles.lineInfo}>
                <Text style={[styles.lineTitle, isDark && { color: '#FFFFFF' }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.lineBottomRow}>
                  <View style={[styles.qtyStepper, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => decreaseQuantity(item.id)}
                    >
                      <Minus size={12} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyValue, isDark && { color: '#FFFFFF' }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => addToCart(item)}
                    >
                      <Plus size={12} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.linePrice, isDark && { color: '#2DD4BF' }]}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={{ marginLeft: Spacing.sm }}
                  >
                    <Trash2 size={15} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.priceStrip}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>Subtotal</Text>
              <Text style={[styles.priceValue, isDark && { color: '#FFFFFF' }]}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>Delivery</Text>
              <Text style={[styles.priceValue, { color: isDark ? '#4ADE80' : '#15803D' }]}>FREE</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow, isDark && { borderTopColor: '#1F2937' }]}>
              <Text style={[styles.totalLabel, isDark && { color: '#FFFFFF' }]}>Total Payable</Text>
              <Text style={[styles.totalValue, isDark && { color: '#2DD4BF' }]}>₹{subtotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* ── Stepper Navigation Header ── */}
        <View style={[styles.stepperCard, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
          <View style={styles.stepperContainer}>
            {/* Step 1 Tab */}
            <TouchableOpacity
              style={styles.stepTab}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepBadge,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                  currentStep === 1 && styles.stepBadgeActive,
                  currentStep > 1 && isEmailValid(contactEmail) && styles.stepBadgeDone,
                ]}
              >
                {currentStep > 1 && isEmailValid(contactEmail) ? (
                  <Check size={13} color="#fff" strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepBadgeText,
                      isDark && { color: '#9CA3AF' },
                      currentStep === 1 && styles.stepBadgeTextActive,
                    ]}
                  >
                    1
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  isDark && { color: '#9CA3AF' },
                  currentStep === 1 && styles.stepTabTextActive,
                ]}
              >
                Contact
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepConnector, isDark && { backgroundColor: '#1F2937' }]} />

            {/* Step 2 Tab */}
            <TouchableOpacity
              style={styles.stepTab}
              onPress={() => {
                if (isEmailValid(contactEmail)) {
                  setCurrentStep(2);
                  setError('');
                } else {
                  setError('Please enter a valid email address first.');
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepBadge,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                  currentStep === 2 && styles.stepBadgeActive,
                  currentStep > 2 && isShippingValid && styles.stepBadgeDone,
                ]}
              >
                {currentStep > 2 && isShippingValid ? (
                  <Check size={13} color="#fff" strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepBadgeText,
                      isDark && { color: '#9CA3AF' },
                      currentStep === 2 && styles.stepBadgeTextActive,
                    ]}
                  >
                    2
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  isDark && { color: '#9CA3AF' },
                  currentStep === 2 && styles.stepTabTextActive,
                ]}
              >
                Address
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepConnector, isDark && { backgroundColor: '#1F2937' }]} />

            {/* Step 3 Tab */}
            <TouchableOpacity
              style={styles.stepTab}
              onPress={() => {
                if (!isEmailValid(contactEmail)) {
                  setError('Please enter a valid email address first.');
                  setCurrentStep(1);
                } else if (!isShippingValid) {
                  setError('Please complete all delivery address fields first.');
                  setCurrentStep(2);
                } else {
                  setCurrentStep(3);
                  setError('');
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepBadge,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                  currentStep === 3 && styles.stepBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeText,
                    isDark && { color: '#9CA3AF' },
                    currentStep === 3 && styles.stepBadgeTextActive,
                  ]}
                >
                  3
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  isDark && { color: '#9CA3AF' },
                  currentStep === 3 && styles.stepTabTextActive,
                ]}
              >
                Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ──── STEP 1: Contact Information Card ──── */}
        {currentStep === 1 && (
          <View style={[styles.card, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
            <View style={styles.stepCardHeader}>
              <View>
                <Text style={[styles.cardTitle, isDark && { color: '#FFFFFF' }]}>1. Contact Information</Text>
                <Text style={[styles.cardSubTitle, isDark && { color: '#9CA3AF' }]}>
                  Where we'll send order receipts & tracking updates
                </Text>
              </View>
              <View style={[styles.stepNumberBadge, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}>
                <Text style={[styles.stepNumberBadgeText, isDark && { color: '#5EEAD4' }]}>Step 1/3</Text>
              </View>
            </View>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>Email Address *</Text>
              <TextInput
                style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFFFFF' }]}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="e.g. yourname@example.com"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.stepActionBtn, { marginTop: Spacing.md }]}
              onPress={() => {
                if (isEmailValid(contactEmail)) {
                  setError('');
                  setCurrentStep(2);
                } else {
                  setError('Please enter a valid email address.');
                }
              }}
            >
              <Text style={styles.stepActionBtnText}>Continue to Delivery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ──── STEP 2: Delivery Address Card ──── */}
        {currentStep === 2 && (
          <View style={[styles.card, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
            <View style={styles.stepCardHeader}>
              <View>
                <Text style={[styles.cardTitle, isDark && { color: '#FFFFFF' }]}>2. Delivery Address</Text>
                <Text style={[styles.cardSubTitle, isDark && { color: '#9CA3AF' }]}>
                  Enter complete shipping address with 10-digit phone
                </Text>
              </View>
              <View style={[styles.stepNumberBadge, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}>
                <Text style={[styles.stepNumberBadgeText, isDark && { color: '#5EEAD4' }]}>Step 2/3</Text>
              </View>
            </View>

            <AddressFormFields
              data={shippingAddress}
              onChange={(field, v) =>
                setShippingAddress(prev => ({ ...prev, [field]: v }))
              }
            />

            {/* Billing Address Toggle */}
            <View style={[styles.billingToggleSection, isDark && { borderTopColor: '#1F2937' }]}>
              <TouchableOpacity
                style={[styles.checkboxRow]}
                onPress={() => setBillingSameAsShipping(!billingSameAsShipping)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#4B5563' },
                    billingSameAsShipping && styles.checkboxActive,
                  ]}
                >
                  {billingSameAsShipping && <Check size={12} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={[styles.checkboxText, isDark && { color: '#E5E7EB' }]}>Billing address same as shipping</Text>
              </TouchableOpacity>

              {!billingSameAsShipping && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={[styles.subSectionTitle, isDark && { color: '#FFFFFF' }]}>Different Billing Address</Text>
                  <AddressFormFields
                    data={billingAddress}
                    onChange={(field, v) =>
                      setBillingAddress(prev => ({ ...prev, [field]: v }))
                    }
                  />
                </View>
              )}
            </View>

            {/* Step 2 Buttons */}
            <View style={styles.stepBtnRow}>
              <TouchableOpacity
                style={[styles.stepBackBtn, isDark && { borderColor: '#374151', backgroundColor: '#1F2937' }]}
                onPress={() => {
                  setError('');
                  setCurrentStep(1);
                }}
              >
                <ChevronLeft size={16} color={isDark ? '#E5E7EB' : CustomerColors.black} />
                <Text style={[styles.stepBackBtnText, isDark && { color: '#E5E7EB' }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stepActionBtn, { flex: 1 }]}
                onPress={() => {
                  if (!isShippingValid) {
                    if (!isPhoneValid(shippingAddress.phone)) {
                      setError('Please enter a valid 10-digit phone number.');
                    } else {
                      setError('Please fill in all required delivery address fields.');
                    }
                    return;
                  }
                  if (!billingSameAsShipping && !isBillingValid) {
                    setError('Please fill in all required billing address fields.');
                    return;
                  }
                  setError('');
                  setCurrentStep(3);
                }}
              >
                <Text style={styles.stepActionBtnText}>Continue to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ──── STEP 3: Payment Method Card ──── */}
        {currentStep === 3 && (
          <View style={{ gap: Spacing.md }}>
            {/* Delivery & Contact Review Chip */}
            <View style={[styles.card, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, isDark && { color: '#9CA3AF' }]}>DELIVERY & CONTACT DETAILS</Text>
                <TouchableOpacity onPress={() => setCurrentStep(2)}>
                  <Text style={[styles.summaryEditBtn, isDark && { color: '#2DD4BF' }]}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.summaryText, isDark && { color: '#FFFFFF' }]}>
                {shippingAddress.firstName} {shippingAddress.lastName}
              </Text>
              <Text style={[styles.summarySubText, isDark && { color: '#9CA3AF' }]}>
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}
              </Text>
              <Text style={[styles.summarySubText, isDark && { color: '#9CA3AF' }]}>
                📞 {shippingAddress.phone}  ·  ✉️ {contactEmail}
              </Text>
            </View>

            {/* Payment Method Selector */}
            <View style={[styles.card, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
              <View style={styles.stepCardHeader}>
                <View>
                  <Text style={[styles.cardTitle, isDark && { color: '#FFFFFF' }]}>3. Payment Method</Text>
                  <Text style={[styles.cardSubTitle, isDark && { color: '#9CA3AF' }]}>
                    All payments are 100% secure & encrypted
                  </Text>
                </View>
                <View style={[styles.stepNumberBadge, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}>
                  <Text style={[styles.stepNumberBadgeText, isDark && { color: '#5EEAD4' }]}>Step 3/3</Text>
                </View>
              </View>

              {/* Razorpay Option */}
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
                  paymentMethod === 'razorpay' &&
                    (isDark
                      ? { borderColor: '#0D9488', backgroundColor: 'rgba(15, 163, 177, 0.12)' }
                      : styles.paymentCardActive),
                ]}
                onPress={() => setPaymentMethod('razorpay')}
              >
                <View
                  style={[
                    styles.radio,
                    isDark && { borderColor: '#6B7280' },
                    paymentMethod === 'razorpay' && styles.radioActive,
                  ]}
                >
                  {paymentMethod === 'razorpay' && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <Text style={[styles.paymentTitle, isDark && { color: '#FFFFFF' }]}>Online Payment (Razorpay)</Text>
                    <View style={styles.instantTag}>
                      <Text style={styles.instantTagText}>INSTANT</Text>
                    </View>
                  </View>
                  <Text style={[styles.paymentSubtitle, isDark && { color: '#9CA3AF' }]}>
                    UPI, Debit/Credit Cards, Net Banking & Wallets
                  </Text>
                </View>
                <CreditCard size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
              </TouchableOpacity>

              {/* Step 3 Action Buttons */}
              <View style={styles.stepBtnRow}>
                <TouchableOpacity
                  style={[styles.stepBackBtn, isDark && { borderColor: '#374151', backgroundColor: '#1F2937' }]}
                  onPress={() => setCurrentStep(2)}
                >
                  <ChevronLeft size={16} color={isDark ? '#E5E7EB' : CustomerColors.black} />
                  <Text style={[styles.stepBackBtnText, isDark && { color: '#E5E7EB' }]}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stepActionBtn,
                    { flex: 1 },
                    (!isFormValid || isProcessing) && styles.payBtnDisabled,
                  ]}
                  onPress={handlePayment}
                  disabled={!isFormValid || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                      <Lock size={15} color="#fff" />
                      <Text style={styles.stepActionBtnText}>
                        Pay ₹{subtotal.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  stepperCard: {
    backgroundColor: CustomerColors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBadgeActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  stepBadgeDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepTabText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
  },
  stepTabTextActive: {
    color: CustomerColors.teal700,
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  cardSubTitle: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  stepNumberBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  stepNumberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  stepActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  stepActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSizes.xs + 1,
  },
  stepBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stepBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  stepBackBtnText: {
    fontSize: FontSizes.xs + 1,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  billingToggleSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  subSectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.xs,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.textSecondary,
    letterSpacing: 0.5,
  },
  summaryEditBtn: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal600,
  },
  summaryText: {
    fontSize: FontSizes.xs + 1,
    fontWeight: '700',
    color: CustomerColors.black,
    marginTop: 2,
  },
  summarySubText: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
});