import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminBentoGridApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/bento-grid/page.tsx ("Best of WOW" mosaic)
// — same fields (title*/subtitle*/className(size)/icon/iconColor/color(hex)/
// img*/isVideo), same 9/9/4 option presets, same PUT `{ items }` wrapper.
const ICON_OPTIONS = ['Star', 'Gift', 'Brain', 'Music', 'Rocket', 'Zap', 'Palette', 'Bot', 'Gamepad2'];
const COLOR_CLASSES = [
  { label: 'Yellow', value: 'text-yellow-400' }, { label: 'Purple', value: 'text-purple-400' }, { label: 'Blue', value: 'text-blue-400' },
  { label: 'Pink', value: 'text-pink-400' }, { label: 'Orange', value: 'text-orange-400' }, { label: 'Red', value: 'text-red-400' },
  { label: 'Teal', value: 'text-teal-400' }, { label: 'Cyan', value: 'text-cyan-400' }, { label: 'Green', value: 'text-green-400' },
];
const SIZE_OPTIONS = [
  { label: 'Standard', value: 'md:col-span-1 md:row-span-1' }, { label: 'Tall', value: 'md:col-span-1 md:row-span-2' },
  { label: 'Wide', value: 'md:col-span-2 md:row-span-1' }, { label: 'Large', value: 'md:col-span-2 md:row-span-2' },
];

interface BentoItem {
  title: string; subtitle: string; className: string; img: string; isVideo: boolean; icon: string; iconColor: string; color: string;
}

export default function AdminBentoGridScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<BentoItem[]>(adminBentoGridApi, []);

  const addItem = () => setData(d => [...d, { title: '', subtitle: '', className: SIZE_OPTIONS[0].value, img: '', isVideo: false, icon: ICON_OPTIONS[0], iconColor: COLOR_CLASSES[0].value, color: '#C41E3A' }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<BentoItem>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((item, idx) => (
        <AdminArrayCard key={idx} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="Title *" value={item.title} onChangeText={v => update(idx, { title: v })} />
          <AdminField label="Subtitle *" value={item.subtitle} onChangeText={v => update(idx, { subtitle: v })} />
          <AdminField label="Image/Video URL *" value={item.img} onChangeText={v => update(idx, { img: v })} />
          <AdminField label="Icon Accent Color (hex)" value={item.color} onChangeText={v => update(idx, { color: v })} />

          <TouchableOpacity style={styles.checkboxRow} onPress={() => update(idx, { isVideo: !item.isVideo })}>
            <View style={[styles.checkbox, item.isVideo && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>URL is a video file</Text>
          </TouchableOpacity>

          <Text style={styles.chipLabel}>Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            {SIZE_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.value} style={[styles.chip, item.className === opt.value && styles.chipActive]} onPress={() => update(idx, { className: opt.value })}>
                <Text style={[styles.chipText, item.className === opt.value && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.chipLabel}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            {ICON_OPTIONS.map(icon => (
              <TouchableOpacity key={icon} style={[styles.chip, item.icon === icon && styles.chipActive]} onPress={() => update(idx, { icon })}>
                <Text style={[styles.chipText, item.icon === icon && styles.chipTextActive]}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.chipLabel}>Icon Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COLOR_CLASSES.map(c => (
              <TouchableOpacity key={c.value} style={[styles.chip, item.iconColor === c.value && styles.chipActive]} onPress={() => update(idx, { iconColor: c.value })}>
                <Text style={[styles.chipText, item.iconColor === c.value && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AdminArrayCard>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Plus size={15} color={AdminColors.primary} />
        <Text style={styles.addBtnText}>Add Item</Text>
      </TouchableOpacity>
    </AdminContentLayout>
  );
}

const styles = StyleSheet.create({
  chipLabel: { fontSize: 10, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: AdminColors.border, marginRight: Spacing.xs },
  chipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  chipText: { fontSize: 10, color: AdminColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#D1D5DB' },
  checkboxChecked: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  checkboxLabel: { fontSize: FontSizes.xs, color: '#374151' },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
