import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Store,
  ChevronDown,
  Search,
  X,
  Check,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Truck,
} from 'lucide-react-native';
import { State, City } from 'country-state-city';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { orderApi } from '../../api/orderApi';
import { paymentApi, PAYMENT_RETURN_SENTINEL } from '../../api/paymentApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

const indianStates = State.getStatesOfCountry('IN');
const getCities = (stateCode: string) => City.getCitiesOfState('IN', stateCode);

export default function StoreSupplierCartScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const { store } = useStoreDashboard();
  const { user, token } = useAuth();
  const { cart, cartTotal, clearCart } = useSupplierCart();
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    firstName:
      store?.ownerName?.split(' ')[0] || user?.name?.split(' ')[0] || '',
    lastName:
      store?.ownerName?.split(' ').slice(1).join(' ') ||
      user?.name?.split(' ').slice(1).join(' ') ||
      '',
    phone: store?.phone || user?.mobilenumber || '',
    contactEmail: store?.email || user?.email || '',
    address: store?.address?.street || '',
    city: store?.address?.city || '',
    state: store?.address?.state || '',
    pinCode: store?.address?.pinCode || '',
  });

  const [selectedStateCode, setSelectedStateCode] = useState<string>('');
  const [cities, setCities] = useState<any[]>([]);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  // Initialize state and city options if prefilled from store profile
  useEffect(() => {
    if (form.state) {
      const matched = indianStates.find(
        s => s.name.toLowerCase() === form.state.toLowerCase(),
      );
      if (matched) {
        setSelectedStateCode(matched.isoCode);
        setCities(getCities(matched.isoCode));
      }
    }
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onSelectState = (st: any) => {
    setForm(f => ({ ...f, state: st.name || '', city: '', pinCode: '' }));
    setSelectedStateCode(st.isoCode);
    setCities(getCities(st.isoCode));
    setStateModalOpen(false);
    setStateSearch('');
  };

  const onSelectCity = async (cityName: string) => {
    set('city', cityName);
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
        const pin = data[0].PostOffice[0].Pincode;
        if (pin) set('pinCode', String(pin));
      }
    } catch {
      /* best-effort fallback */
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

  const cartLines = Object.values(cart);
  const groupsBySupplier: Record<string, any[]> = {};
  cartLines.forEach((i: any) => {
    (groupsBySupplier[i.storeId] = groupsBySupplier[i.storeId] || []).push(i);
  });
  const orderGroups = Object.entries(groupsBySupplier).map(
    ([storeId, items]) => ({
      storeId,
      storeName: items[0].storeName,
      items: items.map((i: any) => ({
        productId: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.qty,
        image: i.image,
        moq: i.moq,
        tierLabel: i.tierLabel,
      })),
      totalAmount: items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
    }),
  );

  const handlePlaceOrder = async () => {
    if (
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pinCode.trim()
    ) {
      Alert.alert(
        'Incomplete Details',
        'Please fill in all mandatory delivery address fields.',
      );
      return;
    }

    if (orderGroups.length === 0) {
      Alert.alert('Cart Empty', 'Your supplier cart is empty.');
      return;
    }

    setPlacing(true);
    try {
      const allCartItems = cartLines.map((i: any) => ({
        id: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.qty,
        image: i.image || null,
        storeId: i.storeId || null,
      }));

      const shippingAddress = {
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

      // 1. Initiate backend Razorpay checkout matching web flow
      const res = await paymentApi.initiate({
        amount: cartTotal,
        userId: user?._id ?? null,
        redirectUrl: PAYMENT_RETURN_SENTINEL,
        cartItems: allCartItems,
        contactEmail: form.contactEmail || user?.email || '',
        shippingAddress,
        billingAddress: shippingAddress,
        deliveryMethod: 'delivery',
        paymentMethod: 'razorpay',
      });

      const data = res.data;
      const targetOrderId =
        data?.razorpayOrderId || data?.orderId || data?.order?._id;

      // 2. Concurrently record wholesale order in wholesale microservice
      orderApi.placeWholesaleOrders(orderGroups, form).catch(() => {});

      if (data?.success && (data.razorpayOrderId || data.orderId)) {
        const options = {
          provider: 'razorpay',
          order_id: data.razorpayOrderId || data.orderId,
          razorpayOrderId: data.razorpayOrderId,
          keyId: data.keyId || 'rzp_test_TRXC8nEMqsywBS',
          amount: data.amount || cartTotal,
          amountPaise: data.amountPaise || Math.round(cartTotal * 100),
          currency: data.currency || 'INR',
          name: orderGroups[0]?.storeName || 'Remise Wholesale',
          description: `Wholesale Order #${data.orderId || targetOrderId}`,
          customer: {
            name:
              `${form.firstName} ${form.lastName}`.trim() ||
              user?.name ||
              'Store Owner',
            email: form.contactEmail || user?.email || '',
            contact: form.phone || user?.mobilenumber || '',
          },
        };

        setPlacing(false);
        navigation.navigate('RazorpayWebView', {
          options,
          orderId: data.orderId || targetOrderId,
          returnScreen: 'StoreOwnerTabs',
          onSuccess: () => {
            clearCart();
          },
        });
        return;
      }

      // If already marked success without gateway redirect:
      clearCart();
      Alert.alert('Success', 'Order placed successfully!');
      navigation.navigate('StoreOwnerTabs', { screen: 'StoreOwnerOrders' });
    } catch (err: any) {
      console.error('Wholesale place order error:', err);
      // Fallback direct placement if payment service returned an error
      try {
        await orderApi.placeWholesaleOrders(orderGroups, form);
        clearCart();
        Alert.alert('Success', 'Stock order placed successfully!');
        navigation.navigate('StoreOwnerTabs', { screen: 'StoreOwnerOrders' });
      } catch (fallbackErr: any) {
        const message =
          err?.response?.data?.message ||
          fallbackErr?.response?.data?.message ||
          err?.message ||
          'Failed to place order(s). Please try again.';
        Alert.alert('Error', message);
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orderGroups}
        keyExtractor={g => g.storeId}
        contentContainerStyle={{ padding: Spacing.md }}
        ListHeaderComponent={
          <View>
            {/* Step 1: Contact & Delivery */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Contact & Delivery</Text>
            </View>

            <View style={styles.cardSection}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.firstName}
                    onChangeText={v => set('firstName', v)}
                    placeholder="First Name"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.lastName}
                    onChangeText={v => set('lastName', v)}
                    placeholder="Last Name"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </View>
              </View>

              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={v => set('phone', v)}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>

              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={form.contactEmail}
                  onChangeText={v => set('contactEmail', v)}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>

              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>Delivery Address / Street *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { minHeight: 60, textAlignVertical: 'top' },
                  ]}
                  value={form.address}
                  onChangeText={v => set('address', v)}
                  placeholder="House / Building / Street address"
                  multiline
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>

              {/* State Dropdown */}
              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setStateModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      form.state ? styles.selectValue : styles.selectPlaceholder
                    }
                    numberOfLines={1}
                  >
                    {form.state || 'Select State'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* City Dropdown */}
              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>City *</Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput,
                    !form.state && styles.selectDisabled,
                  ]}
                  onPress={() => {
                    if (!form.state) {
                      Alert.alert(
                        'Select State',
                        'Please select a state first to view cities.',
                      );
                      return;
                    }
                    setCityModalOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      form.city ? styles.selectValue : styles.selectPlaceholder
                    }
                    numberOfLines={1}
                  >
                    {form.city ||
                      (form.state ? 'Select City' : 'Choose state first')}
                  </Text>
                  <ChevronDown
                    size={18}
                    color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Pincode (Auto-filled on City selection + editable) */}
              <View style={{ marginBottom: Spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <Text style={styles.label}>Pin Code *</Text>
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
                        color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          color: isDark ? '#2DD4BF' : CustomerColors.teal700,
                        }}
                      >
                        Auto-detecting...
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  value={form.pinCode}
                  onChangeText={v => set('pinCode', v.replace(/\D/g, ''))}
                  placeholder="6-digit PIN code"
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
            </View>

            {/* Step 2: Delivery Method */}
            <View style={[styles.sectionHeaderRow, { marginTop: Spacing.sm }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Delivery Method</Text>
            </View>

            <View style={styles.deliveryMethodCard}>
              <View style={styles.deliveryMethodRow}>
                <View style={styles.deliveryRadioActive}>
                  <View style={styles.deliveryRadioInner} />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Truck
                      size={18}
                      color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                    />
                    <Text style={styles.deliveryTitle}>
                      Home / Store Delivery
                    </Text>
                    <View style={styles.selectedPill}>
                      <Text style={styles.selectedPillText}>Selected</Text>
                    </View>
                  </View>
                  <Text style={styles.deliverySubtitle}>
                    Suppliers will dispatch and deliver stock packages directly
                    to your entered address.
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3: Order Summary */}
            <View style={[styles.sectionHeaderRow, { marginTop: Spacing.lg }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>
          </View>
        }
        renderItem={({ item: g }) => (
          <View style={styles.supplierGroup}>
            <View style={styles.supplierHeader}>
              <Store
                size={15}
                color={isDark ? '#2DD4BF' : CustomerColors.teal700}
              />
              <Text style={styles.supplierName}>{g.storeName}</Text>
            </View>
            {g.items.map((i: any) => (
              <View key={i.productId} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {i.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {i.quantity} × ₹{i.price}
                  {i.tierLabel ? ` (${i.tierLabel})` : ''}
                </Text>
              </View>
            ))}
            <Text style={styles.supplierTotal}>
              Subtotal: ₹{g.totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* Step 4: Payment Method */}
            <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.paymentMethodRow}>
                <View style={styles.paymentRadioActive}>
                  <View style={styles.paymentRadioInner} />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CreditCard
                      size={18}
                      color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                    />
                    <Text style={styles.paymentTitle}>
                      Online Payment (Razorpay)
                    </Text>
                  </View>
                  <Text style={styles.paymentSubtitle}>
                    UPI, Credit/Debit Cards, NetBanking & Wallets
                  </Text>
                </View>
              </View>
              <View style={styles.securityBadge}>
                <ShieldCheck
                  size={14}
                  color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                />
                <Text style={styles.securityBadgeText}>
                  Secure 256-bit SSL encrypted payment
                </Text>
              </View>
            </View>

            {/* Step 5: Order Total */}
            <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>5</Text>
              </View>
              <Text style={styles.sectionTitle}>Order Total</Text>
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.placeBtn}
                onPress={handlePlaceOrder}
                disabled={placing || orderGroups.length === 0}
                activeOpacity={0.85}
              >
                {placing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.placeBtnText}>
                    Place Stock Order & Pay
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* State Selector Modal */}
      <Modal
        visible={stateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStateModalOpen(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStateModalOpen(false)}>
                <X
                  size={20}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Search
                size={16}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search state..."
                value={stateSearch}
                onChangeText={setStateSearch}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={s => s.isoCode}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelectState(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.state === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {form.state === item.name && (
                    <Check
                      size={16}
                      color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No matching states found</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* City Selector Modal */}
      <Modal
        visible={cityModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCityModalOpen(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setCityModalOpen(false)}>
                <X
                  size={20}
                  color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Search
                size={16}
                color={isDark ? '#9CA3AF' : CustomerColors.textSecondary}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search city..."
                value={citySearch}
                onChangeText={setCitySearch}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(c, idx) => `${c.name}-${idx}`}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelectCity(item.name)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.city === item.name && styles.modalItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {form.city === item.name && (
                    <Check
                      size={16}
                      color={isDark ? '#2DD4BF' : CustomerColors.teal700}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>
                  No cities found for this state
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    stepBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: CustomerColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 12,
    },
    sectionTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    cardSection: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    nameRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    label: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    input: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      fontSize: FontSizes.sm,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    selectInput: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectDisabled: {
      opacity: 0.5,
    },
    selectValue: {
      fontSize: FontSizes.sm,
      fontWeight: '600',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      flex: 1,
    },
    selectPlaceholder: {
      fontSize: FontSizes.sm,
      color: isDark ? '#6B7280' : '#9CA3AF',
      flex: 1,
    },
    supplierGroup: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    supplierHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    supplierName: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#E5E7EB' : '#374151',
      flex: 1,
      paddingRight: 6,
    },
    itemMeta: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    supplierTotal: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      marginTop: 8,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
      textAlign: 'right',
    },
    deliveryMethodCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#0f766e' : CustomerColors.teal600,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    deliveryMethodRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    deliveryRadioActive: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#2DD4BF' : CustomerColors.teal700,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    deliveryRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    deliveryTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    selectedPill: {
      backgroundColor: isDark ? '#115E59' : '#CCFBF1',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: BorderRadius.pill,
    },
    selectedPillText: {
      fontSize: 9,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      textTransform: 'uppercase',
    },
    deliverySubtitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 3,
      lineHeight: 16,
    },
    footer: { marginTop: Spacing.sm, paddingBottom: Spacing.xl },
    paymentCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    paymentMethodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    paymentRadioActive: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#2DD4BF' : CustomerColors.teal700,
      alignItems: 'center',
      justifyContent: 'center',
    },
    paymentRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    paymentTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    paymentSubtitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: Spacing.sm,
      paddingTop: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    securityBadgeText: {
      fontSize: 11,
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      fontWeight: '600',
    },
    totalCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    totalLabel: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    totalValue: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    placeBtn: {
      backgroundColor: CustomerColors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    placeBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: FontSizes.base,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? '#111827' : '#fff',
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
      maxHeight: '75%',
      paddingBottom: Spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    modalTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    modalSearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    modalSearchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F5F5F5',
    },
    modalItemText: {
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    modalItemTextActive: {
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
      fontWeight: '700',
    },
    modalEmpty: {
      textAlign: 'center',
      color: '#9CA3AF',
      fontSize: FontSizes.sm,
      paddingVertical: Spacing.lg,
    },
  });
