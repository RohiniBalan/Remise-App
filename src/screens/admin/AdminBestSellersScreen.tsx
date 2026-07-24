import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminBestSellersApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/best-sellers/page.tsx ("Top Picks" carousel)
// — same fields (id/name*/img*/color), same PUT `{ items }` wrapper.
interface BestSellerItem { id: string | number; name: string; img: string; color: string }

let uid = 0;
export default function AdminBestSellersScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<BestSellerItem[]>(adminBestSellersApi, []);

  const addItem = () => setData(d => [...d, { id: `new-${++uid}`, name: '', img: '', color: '#C9A84C' }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<BestSellerItem>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((item, idx) => (
        <AdminArrayCard key={item.id} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="Name *" value={item.name} onChangeText={v => update(idx, { name: v })} />
          <AdminField label="Image URL *" value={item.img} onChangeText={v => update(idx, { img: v })} />
          <AdminField label="Color (hex)" value={item.color} onChangeText={v => update(idx, { color: v })} />
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
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
