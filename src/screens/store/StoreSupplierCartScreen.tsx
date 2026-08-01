import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Store } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useSupplierCart } from '../../context/SupplierCartContext';
import { orderApi } from '../../api/orderApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from web's SupplierCartOrderModal — groups cart lines by supplier
// store, shows the prefilled delivery/contact form (from `store` profile,
// same fields web prefills), places one order per supplier on submit.
export default function StoreSupplierCartScreen() {
  const navigation = useNavigation<any>();
  const { store } = useStoreDashboard();
  const { cart, cartTotal, clearCart } = useSupplierCart();
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    firstName: store?.ownerName?.split(' ')[0] || '',
    lastName: store?.ownerName?.split(' ').slice(1).join(' ') || '',
    phone: store?.phone || '',
    contactEmail: store?.email || '',
    address: store?.address?.street || '',
    city: store?.address?.city || '',
    state: store?.address?.state || '',
    pinCode: store?.address?.pinCode || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cartLines = Object.values(cart);
  const groupsBySupplier: Record<string, any[]> = {};
  cartLines.forEach((i: any) => { (groupsBySupplier[i.storeId] = groupsBySupplier[i.storeId] || []).push(i); });
  const orderGroups = Object.entries(groupsBySupplier).map(([storeId, items]) => ({
    storeId,
    storeName: items[0].storeName,
    items: items.map((i: any) => ({ productId: i.productId, title: i.title, price: i.price, quantity: i.qty, image: i.image, moq: i.moq, tierLabel: i.tierLabel })),
    totalAmount: items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
  }));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await orderApi.placeWholesaleOrders(orderGroups, form);
      clearCart();
      Alert.alert('Order(s) placed successfully!');
      navigation.navigate('StoreOwnerTabs', { screen: 'StoreOwnerOrders' });
    } catch {
      Alert.alert('Error', 'Failed to place order(s). Try again.');
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
            <Text style={styles.sectionTitle}>Contact & Delivery</Text>
            {[
              ['firstName', 'First Name'], ['lastName', 'Last Name'], ['phone', 'Phone'],
              ['contactEmail', 'Email'], ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['pinCode', 'Pin Code'],
            ].map(([key, label]) => (
              <View key={key} style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} value={(form as any)[key]} onChangeText={v => set(key, v)} />
              </View>
            ))}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Order Summary</Text>
          </View>
        }
        renderItem={({ item: g }) => (
          <View style={styles.supplierGroup}>
            <View style={styles.supplierHeader}>
              <Store size={14} color={CustomerColors.teal700} />
              <Text style={styles.supplierName}>{g.storeName}</Text>
            </View>
            {g.items.map((i: any) => (
              <View key={i.productId} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>{i.title}</Text>
                <Text style={styles.itemMeta}>{i.quantity} × ₹{i.price}{i.tierLabel ? ` (${i.tierLabel})` : ''}</Text>
              </View>
            ))}
            <Text style={styles.supplierTotal}>Subtotal: ₹{g.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={placing || orderGroups.length === 0}>
              {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeBtnText}>Place Order</Text>}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black, marginBottom: Spacing.sm },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSizes.sm },
  supplierGroup: { backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  supplierHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  supplierName: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: FontSizes.xs, color: '#374151', flex: 1, paddingRight: 6 },
  itemMeta: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  supplierTotal: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.teal700, marginTop: 6, textAlign: 'right' },
  footer: { marginTop: Spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#E5E7EB', marginBottom: Spacing.md },
  totalLabel: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  totalValue: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.teal700 },
  placeBtn: { backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  placeBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
});