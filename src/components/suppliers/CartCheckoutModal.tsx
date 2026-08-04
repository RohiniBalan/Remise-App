import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { State, City } from 'country-state-city';
import {
  orderApi,
  WholesaleOrderGroup,
  WholesaleContactInfo,
} from '../../api/orderApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { CartLine } from '../../utils/supplierGrouping';
import { useAuth } from '../../context/AuthContext';
import { requireAuthForPurchase } from '../../utils/authGuard';

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
  const { user, token } = useAuth();
  const groups = React.useMemo(() => {
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

  const [step, setStep] = useState<Step>('contact');
  const [groupIndex, setGroupIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [cities, setCities] = useState<any[]>([]);
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
    }
  }, [visible]);

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onSelectState = (isoCode: string) => {
    const state = indianStates.find(s => s.isoCode === isoCode);
    setForm(f => ({ ...f, state: state?.name || '', city: '', pinCode: '' }));
    setCities(getCities(isoCode));
  };

  const onSelectCity = async (cityName: string) => {
    setField('city', cityName);
    if (!cityName) return;
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
      /* best-effort — leave pincode as-is */
    }
  };

  const stateIso = indianStates.find(s => s.name === form.state)?.isoCode || '';

  const handleConfirmContact = () => {
    if (
      !form.firstName ||
      !form.phone ||
      !form.address ||
      !form.state ||
      !form.city ||
      !form.pinCode
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setStep('delivery');
  };

  const handleContinueOrSubmit = async () => {
    if (
      !requireAuthForPurchase({
        navigation,
        isAuthenticated: Boolean(token && user),
        message: 'Please sign in to place this order.',
      })
    )
      return;
    if (groupIndex < groups.length - 1) {
      setGroupIndex(i => i + 1);
      return;
    }
    // last group confirmed — batch submit everything
    setStep('placing');
    setErrorMsg('');
    try {
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
          'Order failed. Please try again.',
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
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
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={CustomerColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: 480 }}
            contentContainerStyle={{ padding: Spacing.lg }}
          >
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color={CustomerColors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {step === 'contact' && (
              <View style={{ gap: Spacing.sm }}>
                <View style={styles.cartSummary}>
                  {groups.map(g => (
                    <View key={g.storeId} style={{ marginBottom: Spacing.xs }}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryStore}>{g.storeName}</Text>
                        <Text style={styles.summaryAmount}>
                          ₹{g.totalAmount.toFixed(0)}
                        </Text>
                      </View>
                      {g.items.map(i => (
                        <Text key={i.productId} style={styles.summaryItem}>
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
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  onChangeText={(v: string) => setField('lastName', v)}
                />
                <Field
                  label="Phone *"
                  value={form.phone}
                  onChangeText={(v: string) => setField('phone', v)}
                  keyboardType="phone-pad"
                />
                <Field
                  label="Email"
                  value={form.contactEmail}
                  onChangeText={(v: string) => setField('contactEmail', v)}
                  keyboardType="email-address"
                />
                <Field
                  label="Address *"
                  value={form.address}
                  onChangeText={(v: string) => setField('address', v)}
                  multiline
                  numberOfLines={2}
                />

                <Text style={styles.fieldLabel}>State *</Text>
                <View style={styles.pickerBox}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {indianStates.map(st => (
                      <TouchableOpacity
                        key={st.isoCode}
                        style={[
                          styles.chip,
                          stateIso === st.isoCode && styles.chipActive,
                        ]}
                        onPress={() => onSelectState(st.isoCode)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            stateIso === st.isoCode && styles.chipTextActive,
                          ]}
                        >
                          {st.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.fieldLabel}>City *</Text>
                <View style={styles.pickerBox}>
                  {!form.state ? (
                    <Text style={styles.helperText}>Select a state first</Text>
                  ) : cities.length === 0 ? (
                    <Text style={styles.helperText}>
                      No cities found for this state
                    </Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {cities.map(c => (
                        <TouchableOpacity
                          key={c.name}
                          style={[
                            styles.chip,
                            form.city === c.name && styles.chipActive,
                          ]}
                          onPress={() => onSelectCity(c.name)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              form.city === c.name && styles.chipTextActive,
                            ]}
                          >
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <Field
                  label="Pin Code *"
                  value={form.pinCode}
                  onChangeText={(v: string) =>
                    setField('pinCode', v.replace(/[^0-9]/g, ''))
                  }
                  keyboardType="number-pad"
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleConfirmContact}
                >
                  <ShoppingBag size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'delivery' && (
              <View style={{ gap: Spacing.md }}>
                <Text style={styles.helperText}>
                  Your order from{' '}
                  <Text style={{ fontWeight: '700' }}>{chosen.storeName}</Text>{' '}
                  will be delivered to your address.
                </Text>
                <TouchableOpacity
                  style={styles.deliveryCard}
                  onPress={handleContinueOrSubmit}
                >
                  <Truck size={20} color={CustomerColors.teal600} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deliveryTitle}>Delivery</Text>
                    <Text style={styles.helperText}>
                      {chosen.storeName} will deliver the stock to you.
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('contact')}>
                  <Text style={styles.backLink}>← Back</Text>
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
                <Text style={styles.helperText}>Placing your order…</Text>
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
                <Text style={styles.successTitle}>Order Placed!</Text>
                <Text style={[styles.helperText, { textAlign: 'center' }]}>
                  Your order{groups.length > 1 ? 's are' : ' is'} confirmed and
                  paid via cash/invoice on delivery.
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
    </Modal>
  );
}

function Field(props: any) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && { height: 64, textAlignVertical: 'top' },
        ]}
        placeholderTextColor={CustomerColors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: CustomerColors.mint,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
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
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.bg,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  chipActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  chipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: { color: '#fff' },
  helperText: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  deliveryCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  deliveryTitle: { fontWeight: '700', color: CustomerColors.black },
  backLink: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
});
