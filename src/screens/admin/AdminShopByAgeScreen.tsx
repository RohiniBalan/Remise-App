import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminShopByAgeApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/shop-by-age/page.tsx — same fields
// (label*/sub*/img*/gradient/icon), same 8 gradient + 8 icon presets, same
// PUT `{ items }` wrapper.
const ICON_OPTIONS = ['Baby', 'Star', 'Building2', 'Zap', 'Sparkles', 'Gauge', 'Trophy', 'Wand2'];
const GRADIENT_OPTIONS = [
  'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-600', 'from-amber-400 to-orange-600', 'from-red-600 to-red-800',
  'from-fuchsia-500 to-purple-600', 'from-orange-500 to-red-600', 'from-slate-800 to-black', 'from-purple-800 to-indigo-900',
];

interface AgeGroupItem { id: string | number; label: string; sub: string; img: string; gradient: string; icon: string }

let uid = 0;
export default function AdminShopByAgeScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<AgeGroupItem[]>(adminShopByAgeApi, []);

  const addItem = () => setData(d => [...d, { id: `new-${++uid}`, label: '', sub: '', img: '', gradient: GRADIENT_OPTIONS[0], icon: ICON_OPTIONS[0] }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<AgeGroupItem>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((item, idx) => (
        <AdminArrayCard key={item.id} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="Label *" value={item.label} onChangeText={v => update(idx, { label: v })} />
          <AdminField label="Subtitle *" value={item.sub} onChangeText={v => update(idx, { sub: v })} />
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {GRADIENT_OPTIONS.map(g => (
              <TouchableOpacity key={g} style={[styles.chip, item.gradient === g && styles.chipActive]} onPress={() => update(idx, { gradient: g })}>
                <Text style={[styles.chipText, item.gradient === g && styles.chipTextActive]}>{g.split(' ')[0].replace('from-', '')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AdminArrayCard>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Plus size={15} color={AdminColors.primary} />
        <Text style={styles.addBtnText}>Add Age Group</Text>
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
