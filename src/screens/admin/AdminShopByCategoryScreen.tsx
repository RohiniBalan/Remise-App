import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminShopByCategoryApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/shop-by-category/page.tsx (3D rotating
// category carousel) — same fields (id*/title*/description*/badge*/
// count*/icon/color(gradient)/accent/img*), same id-slugification
// (lowercase, spaces -> hyphens) and 8/6/6 option presets, same
// PUT `{ items }` wrapper.
const ICON_OPTIONS = ['CarFront', 'Trophy', 'Gift', 'Brain', 'Palette', 'Gamepad2', 'Sparkles', 'Zap'];
const GRADIENT_OPTIONS = ['from-red-600 to-rose-900', 'from-purple-600 to-indigo-900', 'from-amber-500 to-orange-800', 'from-emerald-500 to-green-800', 'from-pink-500 to-rose-700', 'from-blue-500 to-cyan-700'];
const ACCENT_OPTIONS = ['text-red-500', 'text-purple-500', 'text-amber-500', 'text-emerald-500', 'text-pink-500', 'text-blue-500'];

interface CategoryItem {
  id: string; title: string; description: string; badge: string; count: number;
  icon: string; color: string; accent: string; img: string;
}

export default function AdminShopByCategoryScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<CategoryItem[]>(adminShopByCategoryApi, []);

  const addItem = () => setData(d => [...d, { id: '', title: '', description: '', badge: '', count: 0, icon: ICON_OPTIONS[0], color: GRADIENT_OPTIONS[0], accent: ACCENT_OPTIONS[0], img: '' }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<CategoryItem>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const commitId = (idx: number, raw: string) => update(idx, { id: raw.toLowerCase().replace(/\s+/g, '-') });

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((item, idx) => (
        <AdminArrayCard key={idx} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="ID (slug) *" value={item.id} onChangeText={v => commitId(idx, v)} placeholder="e.g. vehicles" autoCapitalize="none" />
          <AdminField label="Title *" value={item.title} onChangeText={v => update(idx, { title: v })} />
          <AdminField label="Description *" value={item.description} onChangeText={v => update(idx, { description: v })} />
          <AdminField label="Badge *" value={item.badge} onChangeText={v => update(idx, { badge: v })} />
          <AdminField label="Count *" value={String(item.count)} onChangeText={v => update(idx, { count: Number(v) || 0 })} keyboardType="numeric" />
          <AdminField label="Image URL *" value={item.img} onChangeText={v => update(idx, { img: v })} />
          <Text style={styles.chipLabel}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            {ICON_OPTIONS.map(icon => (
              <TouchableOpacity key={icon} style={[styles.chip, item.icon === icon && styles.chipActive]} onPress={() => update(idx, { icon })}>
                <Text style={[styles.chipText, item.icon === icon && styles.chipTextActive]}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.chipLabel}>Gradient</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            {GRADIENT_OPTIONS.map(g => (
              <TouchableOpacity key={g} style={[styles.chip, item.color === g && styles.chipActive]} onPress={() => update(idx, { color: g })}>
                <Text style={[styles.chipText, item.color === g && styles.chipTextActive]}>{g.split('-')[1]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.chipLabel}>Accent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ACCENT_OPTIONS.map(a => (
              <TouchableOpacity key={a} style={[styles.chip, item.accent === a && styles.chipActive]} onPress={() => update(idx, { accent: a })}>
                <Text style={[styles.chipText, item.accent === a && styles.chipTextActive]}>{a.split('-')[1]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AdminArrayCard>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Plus size={15} color={AdminColors.primary} />
        <Text style={styles.addBtnText}>Add Category</Text>
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
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
