import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, CreditCard, ShieldCheck, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { paymentApi, extractOrderId, PAYMENT_RETURN_SENTINEL, AddressData } from '../../api/paymentApi';
import AddressFormFields from '../../components/common/AddressFormFields';
import { GoldColors, CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/checkout/page.tsx — same items-to-checkout logic
// (buyNowItem takes priority over the full cart, exactly like web), same
// validation rules (isShippingValid/isBillingValid/isFormValid), same
// payment methods (phonepe/cod), same qty +/- / remove handlers for the
// order-summary line items (including the buyNowItem-vs-cart branching),
// and the same POST /api/payment/initiate payload shape. The PhonePe
// redirect becomes an in-app WebView (see PhonePeWebViewScreen) since
// there's no browser `window.location.href` on mobile.
const emptyAddress = (): AddressData => ({ country: 'India', firstName: '', lastName: '', address: '', apartment: '', city: '', state: 'Tamil Nadu', pinCode: '', phone: '' });

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { cart, buyNowItem, setBuyNowItem, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();

  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [shippingAddress, setShippingAddress] = useState<AddressData>(emptyAddress());
  const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress());
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'cod'>('phonepe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const itemsToCheckout = buyNowItem ? [buyNowItem] : cart;
  const subtotal = useMemo(() => itemsToCheckout.reduce((sum, i) => sum + i.price * i.quantity, 0), [itemsToCheckout]);

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

  const handleIncrease = (item: typeof itemsToCheckout[number]) => {
    if (item.totalStock && item.quantity >= item.totalStock) {
      setError('Out of stock');
      return;
    }
    if (buyNowItem) setBuyNowItem({ ...buyNowItem, quantity: buyNowItem.quantity + 1 });
    else addToCart(item);
  };

  const handleDecrease = (item: typeof itemsToCheckout[number]) => {
    if (buyNowItem) {
      if (buyNowItem.quantity > 1) setBuyNowItem({ ...buyNowItem, quantity: buyNowItem.quantity - 1 });
      else setBuyNowItem(null);
    } else {
      decreaseQuantity(item.id);
    }
  };

  const handleRemove = (item: typeof itemsToCheckout[number]) => {
    if (buyNowItem) setBuyNowItem(null);
    else removeFromCart(item.id);
  };

  const handlePayment = async () => {
    if (!isFormValid) return;
    setIsProcessing(true);
    setError('');
    try {
      const res = await paymentApi.initiate({
        amount: subtotal,
        userId: user?._id ?? null,
        redirectUrl: PAYMENT_RETURN_SENTINEL,
        cartItems: itemsToCheckout,
        contactEmail,
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
      });

      const data = res.data;
      if (data.success && data.url) {
        if (!buyNowItem) clearCart();

        if (paymentMethod === 'cod') {
          // Backend never actually redirects for COD — the returned url
          // already carries the order id, same as web just reads it off
          // the query string instead of navigating the browser there.
          navigation.replace('PaymentStatus', { orderId: extractOrderId(data.url) });
        } else {
          navigation.navigate('PhonePeWebView', { payUrl: data.url });
        }
      } else {
        setError(`Payment Error: ${data.message || 'Failed to initialize payment gateway.'}`);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server unreachable. Please check your connection.');
      setIsProcessing(false);
    }
  };

  if (itemsToCheckout.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>There is nothing to checkout.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Categories' })}>
          <Text style={styles.emptyBtnText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={CustomerColors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary {buyNowItem ? '(Buy Now)' : ''}</Text>
        {itemsToCheckout.map(item => (
          <View key={item.id} style={styles.lineItem}>
            <Image source={{ uri: item.image ?? undefined }} style={styles.lineImage} />
            <View style={styles.lineInfo}>
              <Text style={styles.lineTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.lineBottomRow}>
                <View style={styles.qtyStepper}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrease(item)}><Minus size={13} color={CustomerColors.textSecondary} /></TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => handleIncrease(item)}><Plus size={13} color={CustomerColors.textSecondary} /></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item)}><Trash2 size={15} color={CustomerColors.danger} /></TouchableOpacity>
                <Text style={styles.lineTotal}>₹{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValueMuted}>Calculated at checkout</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="Email or mobile phone number" autoCapitalize="none" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <AddressFormFields data={shippingAddress} onChange={(field, v) => setShippingAddress(prev => ({ ...prev, [field]: v }))} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <Text style={styles.sectionSubtitle}>All transactions are secure and encrypted.</Text>
        <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'phonepe' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('phonepe')}>
          <View style={[styles.radio, paymentMethod === 'phonepe' && styles.radioActive]}>{paymentMethod === 'phonepe' && <View style={styles.radioDot} />}</View>
          <Text style={styles.paymentLabel}>Secure Online Payment (PhonePe)</Text>
          <CreditCard size={18} color={GoldColors.gold} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('cod')}>
          <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>{paymentMethod === 'cod' && <View style={styles.radioDot} />}</View>
          <Text style={styles.paymentLabel}>Cash on Delivery (COD)</Text>
        </TouchableOpacity>
        {paymentMethod === 'phonepe' && (
          <View style={styles.phonepeNote}>
            <ShieldCheck size={20} color={GoldColors.gold} />
            <Text style={styles.phonepeNoteText}>You will be redirected securely to complete your purchase via UPI, Cards, or Netbanking.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Address</Text>
        <TouchableOpacity style={[styles.paymentOption, billingSameAsShipping && styles.paymentOptionActive]} onPress={() => setBillingSameAsShipping(true)}>
          <View style={[styles.radio, billingSameAsShipping && styles.radioActive]}>{billingSameAsShipping && <View style={styles.radioDot} />}</View>
          <Text style={styles.paymentLabel}>Same as shipping address</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentOption, !billingSameAsShipping && styles.paymentOptionActive]} onPress={() => setBillingSameAsShipping(false)}>
          <View style={[styles.radio, !billingSameAsShipping && styles.radioActive]}>{!billingSameAsShipping && <View style={styles.radioDot} />}</View>
          <Text style={styles.paymentLabel}>Use a different billing address</Text>
        </TouchableOpacity>
        {!billingSameAsShipping && (
          <View style={{ marginTop: Spacing.md }}>
            <AddressFormFields data={billingAddress} onChange={(field, v) => setBillingAddress(prev => ({ ...prev, [field]: v }))} />
          </View>
        )}
      </View>

      {!isFormValid && (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={CustomerColors.danger} />
          <Text style={styles.errorText}>Please fill in all mandatory details to proceed.</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.payBtn, (!isFormValid || isProcessing) && styles.payBtnDisabled]} onPress={handlePayment} disabled={!isFormValid || isProcessing}>
        {isProcessing ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <CheckCircle size={18} color="#000" />
            <Text style={styles.payBtnText}>{paymentMethod === 'phonepe' ? 'Pay Now' : 'Complete Order'}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg, padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: CustomerColors.black, textAlign: 'center' },
  emptyBtn: { backgroundColor: GoldColors.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  emptyBtnText: { color: '#000', fontWeight: '800' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.dangerBg, marginHorizontal: Spacing.md, marginTop: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md },
  errorText: { flex: 1, color: CustomerColors.danger, fontSize: FontSizes.xs },
  section: { backgroundColor: CustomerColors.white, margin: Spacing.md, marginBottom: 0, marginTop: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '700', color: CustomerColors.black, marginBottom: Spacing.sm },
  sectionSubtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginBottom: Spacing.md },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.base },
  lineItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  lineImage: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: '#F9F9F9' },
  lineInfo: { flex: 1, gap: 6 },
  lineTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: CustomerColors.black },
  lineBottomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyStepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.sm },
  qtyBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { width: 20, textAlign: 'center', fontWeight: '700', fontSize: FontSizes.xs },
  lineTotal: { marginLeft: 'auto', fontWeight: '700', color: CustomerColors.black, fontSize: FontSizes.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: CustomerColors.border, marginTop: Spacing.xs },
  summaryLabel: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  summaryValue: { fontSize: FontSizes.sm, fontWeight: '600', color: CustomerColors.black },
  summaryValueMuted: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: CustomerColors.border },
  totalLabel: { fontSize: FontSizes.md, fontWeight: '700', color: CustomerColors.black },
  totalValue: { fontSize: FontSizes.xl, fontWeight: '800', color: CustomerColors.black },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: CustomerColors.border, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  paymentOptionActive: { borderColor: GoldColors.gold, backgroundColor: 'rgba(201,168,76,0.06)' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: GoldColors.gold },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GoldColors.gold },
  paymentLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: CustomerColors.black },
  phonepeNote: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: BorderRadius.md, padding: Spacing.md },
  phonepeNoteText: { flex: 1, fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  payBtn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: GoldColors.gold, margin: Spacing.md, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: 0.5 },
});
