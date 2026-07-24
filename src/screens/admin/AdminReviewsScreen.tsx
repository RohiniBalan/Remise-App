import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { adminReviewsApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/reviews/page.tsx — same shape
// ({reviews:[{id,name,rating,text,date,avatar}], photos:[{id,url}]}), same
// 2 sub-tabs (Testimonials/Gallery), GET/PUT/`/reset` `/reviews` (bare object).
interface Review { id: string; name: string; rating: number; text: string; date: string; avatar: string }
interface Photo { id: string; url: string }
interface ReviewsData { reviews: Review[]; photos: Photo[] }

export default function AdminReviewsScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<ReviewsData>(adminReviewsApi, { reviews: [], photos: [] });
  const [tab, setTab] = useState<'testimonials' | 'gallery'>('testimonials');

  const addReview = () => setData(d => ({ ...d, reviews: [...d.reviews, { id: Date.now().toString(), name: '', rating: 5, text: '', date: '', avatar: '' }] }));
  const removeReview = (idx: number) => setData(d => ({ ...d, reviews: d.reviews.filter((_, i) => i !== idx) }));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d.reviews];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return d;
    [next[idx], next[target]] = [next[target], next[idx]];
    return { ...d, reviews: next };
  });
  const updateReview = (idx: number, patch: Partial<Review>) => setData(d => ({ ...d, reviews: d.reviews.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));

  const addPhoto = () => setData(d => ({ ...d, photos: [...d.photos, { id: Date.now().toString(), url: '' }] }));
  const removePhoto = (idx: number) => setData(d => ({ ...d, photos: d.photos.filter((_, i) => i !== idx) }));
  const updatePhoto = (idx: number, url: string) => setData(d => ({ ...d, photos: d.photos.map((p, i) => (i === idx ? { ...p, url } : p)) }));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'testimonials' && styles.tabActive]} onPress={() => setTab('testimonials')}>
          <Text style={[styles.tabText, tab === 'testimonials' && styles.tabTextActive]}>Testimonials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'gallery' && styles.tabActive]} onPress={() => setTab('gallery')}>
          <Text style={[styles.tabText, tab === 'gallery' && styles.tabTextActive]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
        {tab === 'testimonials' ? (
          <>
            {data.reviews.map((r, idx) => (
              <AdminArrayCard key={r.id} index={idx} total={data.reviews.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeReview(idx)}>
                <AdminField label="Name *" value={r.name} onChangeText={v => updateReview(idx, { name: v })} />
                <AdminField label="Rating (1-5)" value={String(r.rating)} onChangeText={v => updateReview(idx, { rating: Number(v) || 5 })} keyboardType="numeric" />
                <AdminField label="Review Text *" value={r.text} onChangeText={v => updateReview(idx, { text: v })} multiline />
                <AdminField label="Date *" value={r.date} onChangeText={v => updateReview(idx, { date: v })} />
                <AdminField label="Avatar URL" value={r.avatar} onChangeText={v => updateReview(idx, { avatar: v })} />
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addReview}>
              <Plus size={15} color={AdminColors.primary} />
              <Text style={styles.addBtnText}>Add Testimonial</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.photoGrid}>
            {data.photos.map((p, idx) => (
              <View key={p.id} style={styles.photoCard}>
                <Image source={{ uri: p.url }} style={styles.photoImage} />
                <AdminField label="URL" value={p.url} onChangeText={v => updatePhoto(idx, v)} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(idx)}>
                  <X size={14} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addPhoto}>
              <Plus size={15} color={AdminColors.primary} />
              <Text style={styles.addBtnText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </AdminContentLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: AdminColors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '600', color: AdminColors.textSecondary },
  tabTextActive: { color: AdminColors.primary },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
  photoGrid: { gap: Spacing.sm },
  photoCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  photoImage: { width: '100%', height: 100, borderRadius: BorderRadius.sm, backgroundColor: '#F3F4F6', marginBottom: Spacing.sm },
  photoRemove: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: '#fff', borderRadius: 12, padding: 4 },
});
