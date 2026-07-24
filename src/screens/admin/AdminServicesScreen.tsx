import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminServicesApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/services/page.tsx — same nested tab system
// (top-level Retail/Wholesale -> Products list / Offer Card sub-toggle),
// same fields (retail: name*/category*/icon-emoji/price*/rating*/
// originalPrice/discount/stock/sales; wholesale adds moq*/margin*/
// delivery*/orders instead of originalPrice/discount/stock), same offer
// card fields (badgeText/discountPercentage/title/description/
// perk1-3{title,desc}/buttonText/terms). GET/PUT/`/reset` `/services`
// (bare object, matches the Customer-facing ServicesScreen's read side).
interface Perk { title: string; desc: string }
interface OfferCard { badgeText: string; discountPercentage: string; title: string; description: string; perk1: Perk; perk2: Perk; perk3: Perk; buttonText: string; terms: string }
interface ServiceProduct { id: string; name: string; category: string; icon: string; price: string; rating: string; originalPrice?: string; discount?: string; stock?: string; sales?: string; moq?: string; margin?: string; delivery?: string; orders?: string }
interface ServicesData { retailProducts: ServiceProduct[]; wholesaleProducts: ServiceProduct[]; retailOffer: OfferCard; wholesaleOffer: OfferCard }

const EMPTY_OFFER: OfferCard = { badgeText: '', discountPercentage: '', title: '', description: '', perk1: { title: '', desc: '' }, perk2: { title: '', desc: '' }, perk3: { title: '', desc: '' }, buttonText: '', terms: '' };
const DEFAULTS: ServicesData = { retailProducts: [], wholesaleProducts: [], retailOffer: EMPTY_OFFER, wholesaleOffer: EMPTY_OFFER };

export default function AdminServicesScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<ServicesData>(adminServicesApi, DEFAULTS);
  const [viewMode, setViewMode] = useState<'retail' | 'wholesale'>('retail');
  const [subTab, setSubTab] = useState<'products' | 'offer'>('products');

  const productsKey = viewMode === 'retail' ? 'retailProducts' : 'wholesaleProducts';
  const offerKey = viewMode === 'retail' ? 'retailOffer' : 'wholesaleOffer';
  const products = data[productsKey];
  const offer = data[offerKey];

  const addProduct = () => {
    const base = { id: Date.now().toString(), name: '', category: '', icon: '🛍️', price: '', rating: '' };
    const item: ServiceProduct = viewMode === 'retail' ? { ...base, originalPrice: '', discount: '', stock: '', sales: '' } : { ...base, moq: '', margin: '', delivery: '', orders: '' };
    setData(d => ({ ...d, [productsKey]: [...d[productsKey], item] }));
  };
  const removeProduct = (idx: number) => setData(d => ({ ...d, [productsKey]: d[productsKey].filter((_, i) => i !== idx) }));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d[productsKey]];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return { ...d, [productsKey]: next };
  });
  const updateProduct = (idx: number, patch: Partial<ServiceProduct>) => setData(d => ({ ...d, [productsKey]: d[productsKey].map((p, i) => (i === idx ? { ...p, ...patch } : p)) }));
  const updateOffer = (patch: Partial<OfferCard>) => setData(d => ({ ...d, [offerKey]: { ...d[offerKey], ...patch } }));
  const updatePerk = (perkKey: 'perk1' | 'perk2' | 'perk3', patch: Partial<Perk>) => setData(d => ({ ...d, [offerKey]: { ...d[offerKey], [perkKey]: { ...d[offerKey][perkKey], ...patch } } }));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, viewMode === 'retail' && styles.tabActive]} onPress={() => setViewMode('retail')}><Text style={[styles.tabText, viewMode === 'retail' && styles.tabTextActive]}>Retail</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, viewMode === 'wholesale' && styles.tabActive]} onPress={() => setViewMode('wholesale')}><Text style={[styles.tabText, viewMode === 'wholesale' && styles.tabTextActive]}>Wholesale</Text></TouchableOpacity>
      </View>
      <View style={styles.subTabBar}>
        <TouchableOpacity style={[styles.subTab, subTab === 'products' && styles.subTabActive]} onPress={() => setSubTab('products')}><Text style={[styles.subTabText, subTab === 'products' && styles.subTabTextActive]}>Products</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.subTab, subTab === 'offer' && styles.subTabActive]} onPress={() => setSubTab('offer')}><Text style={[styles.subTabText, subTab === 'offer' && styles.subTabTextActive]}>Offer Card</Text></TouchableOpacity>
      </View>

      <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
        {subTab === 'products' ? (
          <>
            {products.map((p, idx) => (
              <AdminArrayCard key={p.id} index={idx} total={products.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeProduct(idx)}>
                <AdminField label="Name *" value={p.name} onChangeText={v => updateProduct(idx, { name: v })} />
                <AdminField label="Category *" value={p.category} onChangeText={v => updateProduct(idx, { category: v })} />
                <AdminField label="Icon (emoji)" value={p.icon} onChangeText={v => updateProduct(idx, { icon: v })} />
                <AdminField label="Price *" value={p.price} onChangeText={v => updateProduct(idx, { price: v })} keyboardType="numeric" />
                <AdminField label="Rating *" value={p.rating} onChangeText={v => updateProduct(idx, { rating: v })} keyboardType="numeric" />
                {viewMode === 'retail' ? (
                  <>
                    <AdminField label="Original Price" value={p.originalPrice || ''} onChangeText={v => updateProduct(idx, { originalPrice: v })} keyboardType="numeric" />
                    <AdminField label="Discount" value={p.discount || ''} onChangeText={v => updateProduct(idx, { discount: v })} />
                    <AdminField label="Stock" value={p.stock || ''} onChangeText={v => updateProduct(idx, { stock: v })} keyboardType="numeric" />
                    <AdminField label="Sales" value={p.sales || ''} onChangeText={v => updateProduct(idx, { sales: v })} keyboardType="numeric" />
                  </>
                ) : (
                  <>
                    <AdminField label="MOQ *" value={p.moq || ''} onChangeText={v => updateProduct(idx, { moq: v })} />
                    <AdminField label="Margin *" value={p.margin || ''} onChangeText={v => updateProduct(idx, { margin: v })} />
                    <AdminField label="Delivery *" value={p.delivery || ''} onChangeText={v => updateProduct(idx, { delivery: v })} />
                    <AdminField label="Orders" value={p.orders || ''} onChangeText={v => updateProduct(idx, { orders: v })} keyboardType="numeric" />
                  </>
                )}
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addProduct}>
              <Plus size={15} color={AdminColors.primary} />
              <Text style={styles.addBtnText}>Add Product</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <AdminField label="Badge Text" value={offer.badgeText} onChangeText={v => updateOffer({ badgeText: v })} />
            <AdminField label="Discount Percentage" value={offer.discountPercentage} onChangeText={v => updateOffer({ discountPercentage: v })} keyboardType="numeric" />
            <AdminField label="Title" value={offer.title} onChangeText={v => updateOffer({ title: v })} />
            <AdminField label="Description" value={offer.description} onChangeText={v => updateOffer({ description: v })} multiline />
            {(['perk1', 'perk2', 'perk3'] as const).map((perkKey, i) => (
              <View key={perkKey} style={styles.perkBlock}>
                <Text style={styles.perkLabel}>Perk {i + 1}</Text>
                <AdminField label="Title" value={offer[perkKey].title} onChangeText={v => updatePerk(perkKey, { title: v })} />
                <AdminField label="Description" value={offer[perkKey].desc} onChangeText={v => updatePerk(perkKey, { desc: v })} />
              </View>
            ))}
            <AdminField label="Button Text" value={offer.buttonText} onChangeText={v => updateOffer({ buttonText: v })} />
            <AdminField label="Terms" value={offer.terms} onChangeText={v => updateOffer({ terms: v })} multiline />
          </View>
        )}
      </AdminContentLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: AdminColors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#9CA3AF' },
  tabTextActive: { color: '#fff' },
  subTabBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  subTab: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, backgroundColor: AdminColors.bg },
  subTabActive: { backgroundColor: AdminColors.primary },
  subTabText: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary },
  subTabTextActive: { color: '#fff' },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
  perkBlock: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: Spacing.sm, marginTop: Spacing.sm },
  perkLabel: { fontSize: 10, fontWeight: '800', color: AdminColors.textMuted, textTransform: 'uppercase', marginBottom: Spacing.xs },
});
