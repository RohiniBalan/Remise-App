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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Search,
  Check,
  CreditCard,
} from 'lucide-react-native';
import { State, City } from 'country-state-city';
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

const indianStates = State.getStatesOfCountry('IN');
const getCities = (stateCode: string) => City.getCitiesOfState('IN', stateCode);

type Step = 'contact' | 'delivery' | 'placing' | 'success';

interface Props {
  cartLines: CartLine[];
  prefill?: { firstName?: string; lastName?: string; contactEmail?: string };
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function CartCheckoutModal({
  cartLines,
  prefill,
  visible,
  onClose,
  onComplete,
}: Props) {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { user, token } = useAuth();

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
  }, [visible, prefill]);

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
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(
          cityName,
        )}`,
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
    return indianStates.filter(s =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase().trim()),
    );
  }, [stateSearch]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    return cities.filter(c =>
      c.name.toLowerCase().includes(citySearch.toLowerCase().trim()),
    );
  }, [cities, citySearch]);

  const handleConfirmContact = () => {
    if (
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.state ||
      !form.city ||
      !form.pinCode.trim()
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    setErrorMsg('');
    setStep('delivery');
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
        amount: totalAmount,
        userId: user?._id ?? null,
        redirectUrl: PAYMENT_RETURN_SENTINEL,
        cartItems: allCartItems,
        contactEmail: form.contactEmail || user?.email || '',
        shippingAddress: addressData,
        billingAddress: addressData,
        deliveryMethod: 'delivery',
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
          amountPaise: data.amountPaise || Math.round(totalAmount * 100),
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
      setStep('delivery');
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
                  ? 'Delivery Details'
                  : groups.length > 1
                  ? `Order ${groupIndex + 1} of ${groups.length}`
                  : 'Confirm Your Order'}
              </Text>
              {step !== 'contact' && (
                <Text style={styles.subtitle}>{chosen.storeName}</Text>
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
            style={{ maxHeight: 480 }}
            contentContainerStyle={{ padding: Spacing.md }}
            bounces={false}
          >
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color={CustomerColors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {step === 'contact' && (
              <View style={{ gap: Spacing.xs }}>
                <View
                  style={[
                    styles.cartSummary,
                    isDark && {
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                    },
                  ]}
                >
                  {groups.map(g => (
                    <View key={g.storeId} style={{ marginBottom: Spacing.xs }}>
                      <View style={styles.summaryRow}>
                        <Text
                          style={[
                            styles.summaryStore,
                            isDark && { color: '#FFFFFF' },
                          ]}
                        >
                          {g.storeName}
                        </Text>
                        <Text style={styles.summaryAmount}>
                          ₹{g.totalAmount.toFixed(0)}
                        </Text>
                      </View>
                      {g.items.map(i => (
                        <Text
                          key={i.productId}
                          style={[
                            styles.summaryItem,
                            isDark && { color: '#9CA3AF' },
                          ]}
                        >
                          {i.qty} × {i.title} — ₹{i.price}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>

                <Field
                  label="First Name *"
                  value={form.firstName}
                  onChangeText={(v: string) => setField('firstName', v)}
                  isDark={isDark}
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  onChangeText={(v: string) => setField('lastName', v)}
                  isDark={isDark}
                />
                <Field
                  label="Phone *"
                  value={form.phone}
                  onChangeText={(v: string) =>
                    setField('phone', v.replace(/\D/g, '').slice(0, 10))
                  }
                  keyboardType="number-pad"
                  maxLength={10}
                  isDark={isDark}
                />
                <Field
                  label="Email"
                  value={form.contactEmail}
                  onChangeText={(v: string) => setField('contactEmail', v)}
                  keyboardType="email-address"
                  isDark={isDark}
                />
                <Field
                  label="Address *"
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
                    State *
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
                      {form.state || 'Select State'}
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
                    City *
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
                        setErrorMsg('Please select a state first.');
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
                      {form.city ||
                        (form.state ? 'Select City' : 'Select state first')}
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
                      Pin Code *
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
                          Auto-filling…
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
                  <Text style={styles.primaryBtnText}>Continue to Payment</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'delivery' && (
              <View style={{ gap: Spacing.md }}>
                <Text
                  style={[styles.helperText, isDark && { color: '#9CA3AF' }]}
                >
                  Your wholesale order of ₹{totalAmount.toLocaleString('en-IN')}{' '}
                  will be processed via Razorpay.
                </Text>
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
                      Pay with Razorpay
                    </Text>
                    <Text
                      style={[
                        styles.helperText,
                        isDark && { color: '#9CA3AF' },
                      ]}
                    >
                      UPI, NetBanking, Debit/Credit Card & Wallets
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('contact')}>
                  <Text
                    style={[styles.backLink, isDark && { color: '#2DD4BF' }]}
                  >
                    ← Back to Delivery Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
                  Connecting to Razorpay gateway…
                </Text>
              </View>
            )}

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
                  Order Placed!
                </Text>
                <Text
                  style={[
                    styles.helperText,
                    { textAlign: 'center' },
                    isDark && { color: '#9CA3AF' },
                  ]}
                >
                  Your wholesale order{groups.length > 1 ? 's are' : ' is'}{' '}
                  confirmed.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: Spacing.sm }]}
                  onPress={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryBtnText}>Done</Text>
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
            <View style={styles.dropdownModalHeader}>
              <Text
                style={[
                  styles.dropdownModalTitle,
                  isDark && { color: '#FFFFFF' },
                ]}
              >
                Select State
              </Text>
              <TouchableOpacity
                onPress={() => setStateModalOpen(false)}
                style={{ padding: 4 }}
              >
                <X
                  size={20}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.searchBox,
                isDark && {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                },
              ]}
            >
              <Search
                size={16}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
                placeholder="Search state…"
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                value={stateSearch}
                onChangeText={setStateSearch}
              />
            </View>
            <FlatList
              data={filteredStates}
              keyExtractor={item => item.isoCode}
              renderItem={({ item }) => {
                const isSelected = form.state === item.name;
                return (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      isDark && { borderBottomColor: '#374151' },
                    ]}
                    onPress={() => onSelectState(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                        isDark && { color: '#FFFFFF' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={CustomerColors.teal600} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
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
            <View style={styles.dropdownModalHeader}>
              <Text
                style={[
                  styles.dropdownModalTitle,
                  isDark && { color: '#FFFFFF' },
                ]}
              >
                Select City
              </Text>
              <TouchableOpacity
                onPress={() => setCityModalOpen(false)}
                style={{ padding: 4 }}
              >
                <X
                  size={20}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.searchBox,
                isDark && {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                },
              ]}
            >
              <Search
                size={16}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
                placeholder="Search city…"
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                value={citySearch}
                onChangeText={setCitySearch}
              />
            </View>
            <FlatList
              data={filteredCities}
              keyExtractor={item => item.name}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: 'center',
                    padding: Spacing.md,
                    color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
                  }}
                >
                  No cities found
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = form.city === item.name;
                return (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      isDark && { borderBottomColor: '#374151' },
                    ]}
                    onPress={() => onSelectCity(item.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                        isDark && { color: '#FFFFFF' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={CustomerColors.teal600} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
            />
          </View>
        </View>
      </Modal>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login Required"
        subtitle="Please sign in or register to place this order."
        onLogin={() => {
          onClose();
          navigateToAuthFlow(navigation);
        }}
      />
    </Modal>
  );
}

function Field(props: any) {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={[styles.fieldLabel, props.isDark && { color: '#9CA3AF' }]}>
        {props.label}
      </Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && { height: 60, textAlignVertical: 'top' },
          props.isDark && {
            backgroundColor: '#1F2937',
            borderColor: '#374151',
            color: '#FFFFFF',
          },
        ]}
        placeholderTextColor={
          props.isDark ? '#94A3B8' : CustomerColors.textSecondary
        }
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
    maxWidth: 420,
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
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: CustomerColors.dangerBg,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: { color: CustomerColors.danger, fontSize: FontSizes.sm, flex: 1 },
  cartSummary: {
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStore: {
    fontWeight: '700',
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  summaryAmount: { fontWeight: '800', color: CustomerColors.teal700 },
  summaryItem: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
    backgroundColor: '#FFFFFF',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  dropdownModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '75%',
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dropdownModalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
    padding: 0,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  dropdownItemText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  helperText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  deliveryCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.teal600,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
  },
  deliveryTitle: {
    fontWeight: '700',
    color: CustomerColors.black,
    fontSize: FontSizes.sm,
  },
  backLink: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
});
