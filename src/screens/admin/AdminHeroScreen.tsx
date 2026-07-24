import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { adminHeroApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/hero/page.tsx — same fields (badgeText/
// title/titleGradient/description/primaryButtonText/secondaryButtonText),
// same carImages[] (URL list, max 10) and brands[] (name+src) add/remove
// UI, same GET/PUT/`/reset` /hero. The live animated car-carousel preview
// has no direct RN equivalent — omitted per the plan (simplified static
// screens instead of re-implementing the production section component).
interface BrandLogo { name: string; src: string }
interface HeroContent {
  badgeText: string; title: string; titleGradient: string; description: string;
  primaryButtonText: string; secondaryButtonText: string; carImages: string[]; brands: BrandLogo[];
}
const DEFAULTS: HeroContent = { badgeText: '', title: '', titleGradient: '', description: '', primaryButtonText: '', secondaryButtonText: '', carImages: [], brands: [] };

export default function AdminHeroScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent(adminHeroApi, DEFAULTS);
  const set = (k: keyof HeroContent, v: string) => setData(d => ({ ...d, [k]: v }));

  const [newCarUrl, setNewCarUrl] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandUrl, setNewBrandUrl] = useState('');

  const addCarImage = () => {
    if (!newCarUrl.trim() || data.carImages.length >= 10) return;
    setData(d => ({ ...d, carImages: [...d.carImages, newCarUrl.trim()] }));
    setNewCarUrl('');
  };
  const removeCarImage = (idx: number) => setData(d => ({ ...d, carImages: d.carImages.filter((_, i) => i !== idx) }));

  const addBrand = () => {
    if (!newBrandName.trim() || !newBrandUrl.trim()) return;
    setData(d => ({ ...d, brands: [...d.brands, { name: newBrandName.trim(), src: newBrandUrl.trim() }] }));
    setNewBrandName('');
    setNewBrandUrl('');
  };
  const removeBrand = (idx: number) => setData(d => ({ ...d, brands: d.brands.filter((_, i) => i !== idx) }));

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      <AdminField label="Badge Text" value={data.badgeText} onChangeText={v => set('badgeText', v)} />
      <AdminField label="Title" value={data.title} onChangeText={v => set('title', v)} />
      <AdminField label="Title Gradient (highlighted part)" value={data.titleGradient} onChangeText={v => set('titleGradient', v)} />
      <AdminField label="Description" value={data.description} onChangeText={v => set('description', v)} style={{ marginBottom: Spacing.md }} multiline />
      <AdminField label="Primary Button Text" value={data.primaryButtonText} onChangeText={v => set('primaryButtonText', v)} />
      <AdminField label="Secondary Button Text" value={data.secondaryButtonText} onChangeText={v => set('secondaryButtonText', v)} />

      <Text style={styles.sectionTitle}>Car Images ({data.carImages.length}/10)</Text>
      {data.carImages.map((url, idx) => (
        <View key={idx} style={styles.listRow}>
          <Image source={{ uri: url }} style={styles.thumb} />
          <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
          <TouchableOpacity onPress={() => removeCarImage(idx)}><X size={16} color="#DC2626" /></TouchableOpacity>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={newCarUrl} onChangeText={setNewCarUrl} placeholder="Image URL" />
        <TouchableOpacity style={styles.addBtn} onPress={addCarImage} disabled={data.carImages.length >= 10}>
          <Plus size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Brand Logos</Text>
      {data.brands.map((b, idx) => (
        <View key={idx} style={styles.listRow}>
          <Image source={{ uri: b.src }} style={styles.thumb} />
          <Text style={styles.urlText} numberOfLines={1}>{b.name}</Text>
          <TouchableOpacity onPress={() => removeBrand(idx)}><X size={16} color="#DC2626" /></TouchableOpacity>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput style={styles.input} value={newBrandName} onChangeText={setNewBrandName} placeholder="Brand name" />
      </View>
      <View style={styles.addRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={newBrandUrl} onChangeText={setNewBrandUrl} placeholder="Logo URL" />
        <TouchableOpacity style={styles.addBtn} onPress={addBrand}>
          <Plus size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    </AdminContentLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.xs },
  thumb: { width: 32, height: 32, borderRadius: BorderRadius.sm, backgroundColor: '#F3F4F6' },
  urlText: { flex: 1, fontSize: FontSizes.xs, color: AdminColors.textSecondary },
  addRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, flex: 1 },
  addBtn: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.primary, borderRadius: BorderRadius.md },
});
