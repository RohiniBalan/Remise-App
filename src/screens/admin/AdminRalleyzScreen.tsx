import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { adminRalleyzApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/RalleyzSection/page.tsx (full-bleed rotating
// banner) — same fields (title*/subtitle*/location*/description*/bg), same
// client-side up/down reorder (saved as part of the whole-array PUT, no
// separate reorder endpoint here unlike Hot Drops/Studio), and the same
// real image upload (POST `/ralleyz/upload`, multipart field `image`,
// response.imageUrl written into that item's `bg`) — this is the only
// admin content page with an actual file upload on web (every other
// "image" field elsewhere is a plain URL text input).
interface RalleyzItem { id: number | string; title: string; subtitle: string; location: string; description: string; bg: string }

let uid = 0;
export default function AdminRalleyzScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<RalleyzItem[]>(adminRalleyzApi, []);
  const [uploadingId, setUploadingId] = useState<string | number | null>(null);

  const addItem = () => setData(d => [...d, { id: `new-${++uid}`, title: '', subtitle: '', location: '', description: '', bg: '' }]);
  const removeItem = (idx: number) => setData(d => d.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });
  const update = (idx: number, patch: Partial<RalleyzItem>) => setData(d => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const uploadImage = async (idx: number, itemId: string | number) => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setUploadingId(itemId);
    try {
      const uploadRes = await adminRalleyzApi.upload(uri);
      if (uploadRes.data.success) update(idx, { bg: uploadRes.data.imageUrl });
    } catch {
      // swallow — same as web's toast-only error handling, no throw
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
      {data.map((item, idx) => (
        <AdminArrayCard key={item.id} index={idx} total={data.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeItem(idx)}>
          <AdminField label="Title *" value={item.title} onChangeText={v => update(idx, { title: v })} />
          <AdminField label="Subtitle *" value={item.subtitle} onChangeText={v => update(idx, { subtitle: v })} />
          <AdminField label="Location *" value={item.location} onChangeText={v => update(idx, { location: v })} />
          <AdminField label="Description *" value={item.description} onChangeText={v => update(idx, { description: v })} multiline />
          <Text style={styles.label}>Background Image</Text>
          <View style={styles.uploadRow}>
            {item.bg ? <Image source={{ uri: item.bg }} style={styles.preview} /> : <View style={styles.previewEmpty} />}
            <TouchableOpacity style={styles.uploadBtn} onPress={() => uploadImage(idx, item.id)} disabled={uploadingId === item.id}>
              {uploadingId === item.id ? <ActivityIndicator size="small" color={AdminColors.primary} /> : <Text style={styles.uploadBtnText}>Upload Image</Text>}
            </TouchableOpacity>
          </View>
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
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  preview: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: '#F3F4F6' },
  previewEmpty: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: AdminColors.border, borderStyle: 'dashed' },
  uploadBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, backgroundColor: AdminColors.bg, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: AdminColors.border },
  uploadBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.primary },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
