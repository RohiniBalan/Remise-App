import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminCharactersApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/characters/page.tsx ("Shop by Character"
// slider) — same fields (id/name*/color/src*), same PUT `{ characters }`
// wrapper. Web's hex color-picker + 15 swatch presets become a plain hex
// text field (same stored value, simpler mobile input).
interface Character { id: number | string; name: string; color: string; src: string }

let uid = 0;
export default function AdminCharactersScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<Character[]>(adminCharactersApi, []);

  const addItem = () => setData(d => [...d, { id: `new-${++uid}`, name: '', color: '#C9A84C', src: '' }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<Character>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((c, idx) => (
        <AdminArrayCard key={c.id} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="Name *" value={c.name} onChangeText={v => update(idx, { name: v })} />
          <AdminField label="Image URL *" value={c.src} onChangeText={v => update(idx, { src: v })} />
          <AdminField label="Color (hex)" value={c.color} onChangeText={v => update(idx, { color: v })} />
        </AdminArrayCard>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Plus size={15} color={AdminColors.primary} />
        <Text style={styles.addBtnText}>Add Character</Text>
      </TouchableOpacity>
    </AdminContentLayout>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
