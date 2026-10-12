import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  ShoppingBag,
  Truck,
  Store,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Search,
  Check,
  CreditCard,
} from 'lucide-react-native';
import {
  orderApi,
  WholesaleOrderGroup,
  WholesaleContactInfo,
} from '../../api/orderApi';
import {
  paymentApi,
  PAYMENT_RETURN_SENTINEL,
  CheckoutCartItem,
  AddressData,
} from '../../api/paymentApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { CartLine } from '../../utils/supplierGrouping';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { navigateToAuthFlow } from '../../utils/authGuard';
import AuthRequiredModal from '../common/AuthRequiredModal';
import { indianStates, getCities, translateState, translateCity } from '../../utils/indiaLocation';
import { useTranslation, translateProductName, getSupplierTranslations } from '../../i18n';
import { usePlatformFee } from '../../utils/platformFee';
import { useDeliveryFee } from '../../utils/deliveryFee';

type Step = 'contact' | 'deliveryMethod' | 'confirm' | 'placing' | 'success';

interface Props {
  cartLines: CartLine[];
  prefill?: { firstName?: string; lastName?: string; contactEmail?: string };
  initialDeliveryMethod?: 'delivery' | 'pickup';
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function CartCheckoutModal({
  cartLines,
  prefill,
  initialDeliveryMethod = 'delivery',
  visible,
  onClose,
  onComplete,
}: Props) {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const tSupplier = useMemo(
    () => getSupplierTranslations(language) || getSupplierTranslations('en'),
    [language]
  );
  const { user, token } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const maxScrollHeight = Math.min(windowHeight * 0.70, 520);

  const groups = useMemo(() => {
    const byStore: Record<string, CartLine[]> = {};
    cartLines.forEach(i => {
      (byStore[i.storeId] = byStore[i.storeId] || []).push(i);
    });
    return Object.entries(byStore).map(([storeId, items]) => ({
      storeId,
      storeName: items[0].storeName,
      items,
      totalAmount: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }));
  }, [cartLines]);

  const totalAmount = useMemo(
    () => cartLines.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cartLines],
  );
  const [step, setStep] = useState<Step>('contact');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>(initialDeliveryMethod);
  const platformFee = usePlatformFee(totalAmount);
  const { deliveryFee } = useDeliveryFee(totalAmount, deliveryMethod);
  const totalPayable = totalAmount + platformFee + deliveryFee;
  const [groupIndex, setGroupIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  // Dropdown modal states
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [form, setForm] = useState({
    firstName: prefill?.firstName || '',
    lastName: prefill?.lastName || '',
    phone: '',
    contactEmail: prefill?.contactEmail || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });

  useEffect(() => {
    if (visible) {
      setStep('contact');
      setDeliveryMethod(initialDeliveryMethod);
      setGroupIndex(0);
      setErrorMsg('');
      if (prefill) {
        setForm(f => ({
          ...f,
          firstName: prefill.firstName || f.firstName,
          lastName: prefill.lastName || f.lastName,
          contactEmail: prefill.contactEmail || f.contactEmail,
        }));
      }
    }
  }, [visible, prefill, initialDeliveryMethod]);

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onSelectState = (st: any) => {
    setForm(f => ({ ...f, state: st.name || '', city: '', pinCode: '' }));
    setCities(getCities(st.isoCode));
    setStateModalOpen(false);
    setStateSearch('');
  };

  const onSelectCity = async (cityName: string) => {
    setField('city', cityName);
    setCityModalOpen(false);
    setCitySearch('');
    if (!cityName) return;

    setIsFetchingPin(true);
    try {
      const res = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`,
      );
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        setField('pinCode', data[0].PostOffice[0].Pincode);
      }
    } catch {
      /* best-effort */
    } finally {
      setIsFetchingPin(false);
    }
  };

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return indianStates;
    const q = stateSearch.toLowerCase().trim();
    return indianStates.filter(s =>
      s.name.toLowerCase().includes(q) ||
      translateState(s.name, language).toLowerCase().includes(q),
    );
  }, [stateSearch, language]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase().trim();
    return cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      translateCity(c.name, language).toLowerCase().includes(q),
    );
  }, [cities, citySearch, language]);

  const handleConfirmContact = () => {
    if (
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.state ||
      !form.city ||
      !form.pinCode.trim()
    ) {
      setErrorMsg(tSupplier.errFillRequired);
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErrorMsg(tSupplier.errValidPhone);
      return;
    }
    setErrorMsg('');
    setStep('deliveryMethod');
  };

  const handleConfirmDeliveryMethod = () => {
    if (!deliveryMethod) {
      setErrorMsg(tSupplier.errSelectDeliveryMethod);
      return;
    }
    setErrorMsg('');
    setStep('confirm');
  };

  const handleContinueOrSubmit = async () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex(i => i + 1);
      return;
    }

    setStep('placing');
    setErrorMsg('');

    try {
      const allCartItems: CheckoutCartItem[] = cartLines.map(i => ({
        id: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.qty,
        image: i.image ?? null,
        storeId: i.storeId,
      }));

      const addressData: AddressData = {
        country: 'India',
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        apartment: '',
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        phone: form.phone,
      };

      const res = await paymentApi.initiate({
        amount: totalPayable,
        platformFee,
        deliveryFee,
        userId: user?._id ?? null,
        redirectUrl: PAYMENT_RETURN_SENTINEL,
        cartItems: allCartItems,
        contactEmail: form.contactEmail || user?.email || '',
        shippingAddress: addressData,
        billingAddress: addressData,
        deliveryMethod: deliveryMethod,
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
          amountPaise: data.amountPaise || Math.round(totalPayable * 100),
          currency: data.currency || 'INR',
          name: data.name || 'Remise Wholesale',
          description: data.description || `Wholesale Order #${data.orderId}`,
          customer: {
            name:
              `${form.firstName} ${form.lastName}`.trim() ||
              data.customer?.name,
            email: form.contactEmail || data.customer?.email || user?.email,
            contact: form.phone || data.customer?.contact || user?.mobilenumber,
          },
        };
        onClose();
        navigation.navigate('RazorpayWebView', {
          options,
          orderId: data.orderId,
        });
        return;
      }

      // Fallback direct placement
      const orderGroups: WholesaleOrderGroup[] = groups.map(g => ({
        storeId: g.storeId,
        storeName: g.storeName,
        items: g.items.map(i => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.qty,
          image: i.image,
          moq: i.moq,
          tierLabel: i.tierLabel,
        })),
        totalAmount: g.totalAmount,
      }));
      const contact: WholesaleContactInfo = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        contactEmail: form.contactEmail,
        address: form.address,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
      };
      await orderApi.placeWholesaleOrders(orderGroups, contact);
      setStep('success');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          'Payment initiation failed. Please try again.',
      );
      setStep('confirm');
    }
  };

  if (!visible || groups.length === 0) return null;
  const chosen = groups[groupIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
          ]}
        >
          <View
            style={[
              styles.header,
              isDark && {
                backgroundColor: '#1F2937',
                borderBottomColor: '#374151',
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#ffffff' : '#000000' },
                ]}
              >
                {step === 'contact'
                  ? tSupplier.stepDeliveryDetails
                  : step === 'deliveryMethod'
                  ? tSupplier.stepDeliveryMethod
                  : groups.length > 1
                  ? tSupplier.stepOrderCount.replace('{{current}}', String(groupIndex + 1)).replace('{{total}}', String(groups.length))
                  : tSupplier.stepConfirmOrder}
              </Text>
              {step !== 'contact' && (
                <Text style={[styles.subtitle, isDark && { color: '#9CA3AF' }]}>
                  {chosen.storeName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X
                size={20}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: maxScrollHeight }}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 45 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {!!errorMsg && (
              <View style={[styles.errorBox, isDark && { backgroundColor: '#3b1212', borderColor: '#7f1d1d' }]}>
                <AlertCircle size={15} color={CustomerColors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* STEP 1: Contact Details & Address */}
            {step === 'contact' && (
              <View style={{ gap: Spacing.xs }}>

                <Field
                  label={tSupplier.firstName}
                  value={form.firstName}
                  onChangeText={(v: string) => setField('firstName', v)}
                  isDark={isDark}
                />
                <Field
                  label={tSupplier.lastName}
                  value={form.lastName}
                  onChangeText={(v: string) => setField('lastName', v)}
                  isDark={isDark}
                />
                <Field
                  label={tSupplier.phone}
                  value={form.phone}
                  onChangeText={(v: string) =>
                    setField('phone', v.replace(/\D/g, '').slice(0, 10))
                  }
                  keyboardType="number-pad"
                  maxLength={10}
                  isDark={isDark}
                />
                <Field
                  label={tSupplier.email}
                  value={form.contactEmail}
                  onChangeText={(v: string) => setField('contactEmail', v)}
                  keyboardType="email-address"
                  isDark={isDark}
                />
                <Field
                  label={tSupplier.address}
                  value={form.address}
                  onChangeText={(v: string) => setField('address', v)}
                  multiline
                  numberOfLines={2}
                  isDark={isDark}
                />

                {/* State Dropdown */}
                <View style={{ marginTop: 4 }}>
                  <Text
                    style={[styles.fieldLabel, isDark && { color: '#9CA3AF' }]}
                  >
                    {tSupplier.state}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      isDark && {
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                      },
                    ]}
                    onPress={() => setStateModalOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownValue,
                        {
                          color: form.state
                            ? isDark
                              ? '#FFFFFF'
                              : '#111827'
                            : isDark
                            ? '#94A3B8'
                            : '#9CA3AF',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {form.state ? translateState(form.state, language) : tSupplier.selectState}
                    </Text>
                    <ChevronDown
                      size={16}
                      color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* City Dropdown */}
                <View style={{ marginTop: 4 }}>
                  <Text
                    style={[styles.fieldLabel, isDark && { color: '#9CA3AF' }]}
                  >
                    {tSupplier.city}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      !form.state && { opacity: 0.6 },
                      isDark && {
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                      },
                    ]}
                    onPress={() => {
                      if (!form.state) {
                        setErrorMsg(tSupplier.errSelectStateFirst);
                        return;
                      }
                      setCityModalOpen(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownValue,
                        {
                          color: form.city
                            ? isDark
                              ? '#FFFFFF'
                              : '#111827'
                            : isDark
                            ? '#94A3B8'
                            : '#9CA3AF',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {form.city
                        ? translateCity(form.city, language)
                        : (form.state ? tSupplier.selectCity : tSupplier.selectStateFirst)}
                    </Text>
                    <ChevronDown
                      size={16}
                      color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Pin Code Field */}
                <View style={{ marginTop: 4 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        styles.fieldLabel,
                        isDark && { color: '#9CA3AF' },
                      ]}
                    >
                      {tSupplier.pinCode}
                    </Text>
                    {isFetchingPin && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <ActivityIndicator
                          size="small"
                          color={CustomerColors.teal600}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            color: CustomerColors.teal600,
                          }}
                        >
                          {tSupplier.autoFilling}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && {
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#FFFFFF',
                      },
                    ]}
                    value={form.pinCode}
                    onChangeText={(v: string) =>
                      setField('pinCode', v.replace(/[^0-9]/g, ''))
                    }
                    keyboardType="number-pad"
                    placeholder="e.g. 600001"
                    placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleConfirmContact}
                >
                  <ShoppingBag size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>{tSupplier.continueToDeliveryMethod}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Delivery Method Selection (Before Confirming Order!) */}
            {step === 'deliveryMethod' && (
              <View style={{ gap: Spacing.md }}>
                <View>
                  <Text style={[styles.sectionTitle, isDark && { color: '#FFFFFF' }]}>
                    {tSupplier.deliveryMethod}
                  </Text>
                  <Text style={[styles.helperText, { marginTop: 2 }, isDark && { color: '#9CA3AF' }]}>
                    {tSupplier.deliveryMethodSubtitle}
                  </Text>
                </View>

                {/* Option 1: Home / Store Delivery */}
                <TouchableOpacity
                  style={[
                    styles.methodOptionCard,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                    deliveryMethod === 'delivery' && [
                      styles.methodOptionCardActive,
                      isDark && { backgroundColor: '#0f2f2c', borderColor: CustomerColors.teal600 },
                    ],
                  ]}
                  onPress={() => setDeliveryMethod('delivery')}
                  activeOpacity={0.8}
                >
                  <View style={styles.methodOptionHeader}>
                    <View
                      style={[
                        styles.radioCircle,
                        deliveryMethod === 'delivery' && styles.radioCircleActive,
                        isDark && { borderColor: deliveryMethod === 'delivery' ? CustomerColors.teal600 : '#4B5563' },
                      ]}
                    >
                      {deliveryMethod === 'delivery' && <View style={styles.radioDot} />}
                    </View>

                    <View
                      style={[
                        styles.methodIconBox,
                        isDark && { backgroundColor: '#111827' },
                        deliveryMethod === 'delivery' && { backgroundColor: CustomerColors.teal600 },
                      ]}
                    >
                      <Truck
                        size={20}
                        color={deliveryMethod === 'delivery' ? '#fff' : (isDark ? '#2DD4BF' : CustomerColors.teal700)}
                      />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.methodTitleRow}>
                        <Text
                          style={[
                            styles.methodOptionTitle,
                            isDark && { color: '#FFFFFF' },
                            deliveryMethod === 'delivery' && { color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
                          ]}
                          numberOfLines={1}
                        >
                          {tSupplier.homeDelivery}
                        </Text>
                        {deliveryMethod === 'delivery' && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>{tSupplier.selected}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.methodOptionDesc, isDark && { color: '#9CA3AF' }]}>
                        {tSupplier.homeDeliveryDesc}
                      </Text>
                    </View>
                  </View>

                  {deliveryMethod === 'delivery' && (
                    <View
                      style={[
                        styles.addressPreviewBox,
                        isDark && { backgroundColor: '#111827', borderColor: '#374151' },
                      ]}
                    >
                      <Text style={[styles.addressPreviewLabel, isDark && { color: '#2DD4BF' }]}>
                        {tSupplier.deliveringTo}
                      </Text>
                      <Text style={[styles.addressPreviewText, isDark && { color: '#D1D5DB' }]}>
                        {form.firstName} {form.lastName} ({form.phone}) · {form.address}, {form.city}, {form.state} - {form.pinCode}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Option 2: Store / Self Pickup */}
                <TouchableOpacity
                  style={[
                    styles.methodOptionCard,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                    deliveryMethod === 'pickup' && [
                      styles.methodOptionCardActive,
                      isDark && { backgroundColor: '#0f2f2c', borderColor: CustomerColors.teal600 },
                    ],
                  ]}
                  onPress={() => setDeliveryMethod('pickup')}
                  activeOpacity={0.8}
                >
                  <View style={styles.methodOptionHeader}>
                    <View
                      style={[
                        styles.radioCircle,
                        deliveryMethod === 'pickup' && styles.radioCircleActive,
                        isDark && { borderColor: deliveryMethod === 'pickup' ? CustomerColors.teal600 : '#4B5563' },
                      ]}
                    >
                      {deliveryMethod === 'pickup' && <View style={styles.radioDot} />}
                    </View>

                    <View
                      style={[
                        styles.methodIconBox,
                        isDark && { backgroundColor: '#111827' },
                        deliveryMethod === 'pickup' && { backgroundColor: CustomerColors.teal600 },
                      ]}
                    >
                      <Store
                        size={20}
                        color={deliveryMethod === 'pickup' ? '#fff' : (isDark ? '#2DD4BF' : CustomerColors.teal700)}
                      />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.methodTitleRow}>
                        <Text
                          style={[
                            styles.methodOptionTitle,
                            isDark && { color: '#FFFFFF' },
                            deliveryMethod === 'pickup' && { color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
                          ]}
                          numberOfLines={1}
                        >
                          {tSupplier.selfPickup}
                        </Text>
                        {deliveryMethod === 'pickup' && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>{tSupplier.selected}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.methodOptionDesc, isDark && { color: '#9CA3AF' }]}>
                        {tSupplier.selfPickupDesc}
                      </Text>
                    </View>
                  </View>

                  {deliveryMethod === 'pickup' && (
                    <View
                      style={[
                        styles.addressPreviewBox,
                        isDark && { backgroundColor: '#111827', borderColor: '#374151' },
                      ]}
                    >
                      <Text style={[styles.addressPreviewLabel, isDark && { color: '#2DD4BF' }]}>
                        {tSupplier.pickupFrom}
                      </Text>
                      <Text style={[styles.addressPreviewText, isDark && { color: '#D1D5DB' }]}>
                        {chosen.storeName}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Step Action Buttons */}
                <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleConfirmDeliveryMethod}
                  >
                    <Text style={styles.primaryBtnText}>{tSupplier.continueToPayment}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setStep('contact')}>
                    <Text
                      style={[styles.backLink, isDark && { color: '#2DD4BF' }]}
                    >
                      {tSupplier.backToDeliveryDetails}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: Confirm Your Order & Razorpay Payment */}
            {step === 'confirm' && (
              <View style={{ gap: Spacing.md }}>
                <Text
                  style={[styles.helperText, isDark && { color: '#9CA3AF' }]}
                >
                  {tSupplier.orderProcessedVia.replace(
                    '{{amount}}',
                    totalPayable.toLocaleString('en-IN'),
                  )}
                </Text>

                {/* Price Breakdown Card */}
                <View
                  style={{
                    padding: Spacing.sm,
                    borderRadius: BorderRadius.md,
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#4B5563' }}>
                      {tSupplier.subtotal || 'Products Total'}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' }}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#4B5563' }}>
                      {(tSupplier as any).platformFee || 'Platform Fee'}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' }}>
                      {platformFee === 0 ? 'FREE' : `₹${platformFee.toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#4B5563' }}>
                      {(tSupplier as any).deliveryFee || 'Delivery Fee'}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: deliveryFee === 0 ? '#15803D' : (isDark ? '#FFFFFF' : '#111827') }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      borderTopWidth: 1,
                      borderTopColor: isDark ? '#374151' : '#E5E7EB',
                      paddingTop: 6,
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827' }}>
                      {tSupplier.totalAmount}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#2DD4BF' : CustomerColors.teal700 }}>
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Delivery Method Summary Pill */}
                <View
                  style={[
                    styles.methodSummaryBadge,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {deliveryMethod === 'delivery' ? (
                      <Truck size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    ) : (
                      <Store size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    )}
                    <Text style={[styles.methodSummaryTitle, isDark && { color: '#FFFFFF' }]}>
                      {deliveryMethod === 'delivery' ? tSupplier.homeDelivery : tSupplier.selfPickup}
                    </Text>
                  </View>
                  <Text style={[styles.methodSummarySub, isDark && { color: '#9CA3AF' }]} numberOfLines={1}>
                    {deliveryMethod === 'delivery'
                      ? `${form.city}, ${form.pinCode}`
                      : chosen.storeName}
                  </Text>
                </View>

                {/* Pay with Razorpay Trigger */}
                <TouchableOpacity
                  style={[
                    styles.deliveryCard,
                    isDark && {
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                    },
                  ]}
                  onPress={handleContinueOrSubmit}
                >
                  <CreditCard
                    size={22}
                    color={isDark ? '#2DD4BF' : CustomerColors.teal600}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.deliveryTitle,
                        isDark && { color: '#FFFFFF' },
                      ]}
                    >
                      {tSupplier.payWithRazorpay}
                    </Text>
                    <Text
                      style={[
                        styles.helperText,
                        isDark && { color: '#9CA3AF' },
                      ]}
                    >
                      {tSupplier.paymentSubtext}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep('deliveryMethod')}>
                  <Text
                    style={[styles.backLink, isDark && { color: '#2DD4BF' }]}
                  >
                    {tSupplier.backToDeliveryMethod}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4: Placing Order / Connecting to Gateway */}
            {step === 'placing' && (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: Spacing.xxl,
                  gap: Spacing.sm,
                }}
              >
                <RefreshCw size={32} color={CustomerColors.teal600} />
                <Text
                  style={[styles.helperText, isDark && { color: '#9CA3AF' }]}
                >
                  {tSupplier.connectingRazorpay}
                </Text>
              </View>
            )}

            {/* STEP 5: Order Placed Success */}
            {step === 'success' && (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: Spacing.xl,
                  gap: Spacing.sm,
                }}
              >
                <CheckCircle size={48} color={CustomerColors.success} />
                <Text
                  style={[styles.successTitle, isDark && { color: '#FFFFFF' }]}
                >
                  {tSupplier.orderPlacedTitle}
                </Text>
                <Text
                  style={[
                    styles.helperText,
                    { textAlign: 'center' },
                    isDark && { color: '#9CA3AF' },
                  ]}
                >
                  {groups.length > 1
                    ? tSupplier.ordersConfirmedDesc
                    : tSupplier.orderConfirmedDesc}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: Spacing.sm }]}
                  onPress={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryBtnText}>{tSupplier.done}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* State Selector Modal */}
      <Modal
        visible={stateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalOpen(false)}
      >
        <View style={styles.dropdownModalOverlay}>
          <View
            style={[
              styles.dropdownModalCard,
              isDark && { backgroundColor: '#1F2937' },
            ]}
          >
            <View style={[styles.dropdownModalHeader, isDark && { borderBottomColor: '#374151' }]}>
              <Text
                style={[
                  styles.dropdownModalTitle,
                  isDark && { color: '#FFFFFF' },
                ]}
              >
                {tSupplier.selectState}
              </Text>
              <TouchableOpacity
                onPress={() => setStateModalOpen(false)}
                style={{ padding: 4 }}
              >
                <X
                  size={18}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.dropdownSearchRow,
                isDark && {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                },
              ]}
            >
              <Search
                size={14}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={[
                  styles.dropdownSearchInput,
                  isDark && { color: '#FFFFFF' },
                ]}
                placeholder={tSupplier.searchState}
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                value={stateSearch}
                onChangeText={setStateSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={item => item.isoCode}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = form.state === item.name;
                const translatedName = translateState(item.name, language);
                return (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      isDark && isSelected && { backgroundColor: '#111827' },
                      isDark && { borderBottomColor: '#374151' },
                    ]}
                    onPress={() => onSelectState(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                        isDark && { color: isSelected ? '#2DD4BF' : '#FFFFFF' },
                      ]}
                    >
                      {translatedName}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={CustomerColors.teal600} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* City Selector Modal */}
      <Modal
        visible={cityModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalOpen(false)}
      >
        <View style={styles.dropdownModalOverlay}>
          <View
            style={[
              styles.dropdownModalCard,
              isDark && { backgroundColor: '#1F2937' },
            ]}
          >
            <View style={[styles.dropdownModalHeader, isDark && { borderBottomColor: '#374151' }]}>
              <Text
                style={[
                  styles.dropdownModalTitle,
                  isDark && { color: '#FFFFFF' },
                ]}
              >
                {tSupplier.selectCity}
              </Text>
              <TouchableOpacity
                onPress={() => setCityModalOpen(false)}
                style={{ padding: 4 }}
              >
                <X
                  size={18}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.dropdownSearchRow,
                isDark && {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                },
              ]}
            >
              <Search
                size={14}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={[
                  styles.dropdownSearchInput,
                  isDark && { color: '#FFFFFF' },
                ]}
                placeholder={tSupplier.searchCity}
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item, idx) => `${item.name}-${idx}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = form.city === item.name;
                const translatedName = translateCity(item.name, language);
                return (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      isDark && isSelected && { backgroundColor: '#111827' },
                      isDark && { borderBottomColor: '#374151' },
                    ]}
                    onPress={() => onSelectCity(item.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                        isDark && { color: isSelected ? '#2DD4BF' : '#FFFFFF' },
                      ]}
                    >
                      {translatedName}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={CustomerColors.teal600} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login Required"
        subtitle="Please sign in to place your wholesale order."
        onLogin={() => {
          setShowAuthModal(false);
          onClose();
          navigateToAuthFlow(navigation);
        }}
      />
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  multiline,
  numberOfLines,
  isDark,
}: any) {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={[styles.fieldLabel, isDark && { color: '#9CA3AF' }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && { height: 60, textAlignVertical: 'top' },
          isDark && {
            backgroundColor: '#1F2937',
            borderColor: '#374151',
            color: '#FFFFFF',
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomerColors.mint,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  cartSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryStore: {
    fontWeight: '700',
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
  },
  summaryAmount: {
    fontWeight: '800',
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
  },
  summaryItem: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
    backgroundColor: CustomerColors.white,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: CustomerColors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownValue: {
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
  },
  primaryBtn: {
    marginTop: Spacing.sm,
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  deliveryTitle: {
    fontWeight: '700',
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  backLink: {
    color: CustomerColors.teal700,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CustomerColors.dangerBg,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  errorText: {
    color: CustomerColors.danger,
    fontSize: FontSizes.xs,
    flex: 1,
  },

  // Delivery Method Step Styles
  methodOptionCard: {
    borderWidth: 1.5,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  methodOptionCardActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  methodOptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: CustomerColors.steelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: CustomerColors.teal600,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CustomerColors.teal600,
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  methodOptionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
    flex: 1,
  },
  methodOptionDesc: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  selectedBadge: {
    backgroundColor: CustomerColors.teal700,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
    alignSelf: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  addressPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  addressPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  addressPreviewText: {
    fontSize: 11,
    color: CustomerColors.black,
    lineHeight: 16,
  },
  methodSummaryBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: CustomerColors.teal600,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  methodSummaryTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  methodSummarySub: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    maxWidth: 160,
  },

  // Dropdown Selector Modal Styles
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dropdownModalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '75%',
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownModalTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  dropdownSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
    paddingVertical: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemActive: {
    backgroundColor: '#F0FDFA',
  },
  dropdownItemText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
});
