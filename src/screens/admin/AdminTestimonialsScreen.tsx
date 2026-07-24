import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminTestimonialsApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes } from '../../styles/theme';

// Ported from client/app/admin/testimonials/page.tsx ("Enhanced
// Testimonials") — same 2 sub-tabs (Marquee Reviews / Page Settings, 3
// grouped sections: hero/spotlight/cta), same reviews[] fields
// (name/role/text/image-auto-pravatar-if-blank/rating), same hero
// (badge/title/titleHighlight/subtitle), spotlight (badge/quote/
// description/name/role/image/stampText), cta (title/titleHighlight/
// buttonText). PUT strips Mongoose _id/__v on web before sending — mobile
// only ever holds the fields it edits, so there's nothing to strip.
// GET/PUT/`/reset` `/enhanced-testimonials` (bare object).
interface Review { id: string; name: string; role: string; text: string; image: string; rating: number }
interface Hero { badge?: string; title?: string; titleHighlight?: string; subtitle?: string }
interface Spotlight { badge?: string; quote?: string; description?: string; name?: string; role?: string; image?: string; stampText?: string }
interface Cta { title?: string; titleHighlight?: string; buttonText?: string }
interface TestimonialsData { reviews: Review[]; hero: Hero; spotlight: Spotlight; cta: Cta }

const DEFAULTS: TestimonialsData = { reviews: [], hero: {}, spotlight: {}, cta: {} };

export default function AdminTestimonialsScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<TestimonialsData>(adminTestimonialsApi, DEFAULTS);
  const [tab, setTab] = useState<'reviews' | 'settings'>('reviews');

  const addReview = () => setData(d => ({ ...d, reviews: [...d.reviews, { id: Date.now().toString(), name: '', role: 'Customer', text: '', image: '', rating: 5 }] }));
  const removeReview = (idx: number) => setData(d => ({ ...d, reviews: d.reviews.filter((_, i) => i !== idx) }));
  const move = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d.reviews]; const t = idx + dir; if (t < 0 || t >= next.length) return d;
    [next[idx], next[t]] = [next[t], next[idx]]; return { ...d, reviews: next };
  });
  const updateReview = (idx: number, patch: Partial<Review>) => setData(d => ({ ...d, reviews: d.reviews.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'reviews' && styles.tabActive]} onPress={() => setTab('reviews')}><Text style={[styles.tabText, tab === 'reviews' && styles.tabTextActive]}>Marquee Reviews</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'settings' && styles.tabActive]} onPress={() => setTab('settings')}><Text style={[styles.tabText, tab === 'settings' && styles.tabTextActive]}>Page Settings</Text></TouchableOpacity>
      </View>

      <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
        {tab === 'reviews' ? (
          <>
            {data.reviews.map((r, idx) => (
              <AdminArrayCard key={r.id} index={idx} total={data.reviews.length} onMoveUp={() => move(idx, -1)} onMoveDown={() => move(idx, 1)} onDelete={() => removeReview(idx)}>
                <AdminField label="Name *" value={r.name} onChangeText={v => updateReview(idx, { name: v })} />
                <AdminField label="Role" value={r.role} onChangeText={v => updateReview(idx, { role: v })} />
                <AdminField label="Text *" value={r.text} onChangeText={v => updateReview(idx, { text: v })} multiline />
                <AdminField label="Image URL" value={r.image} onChangeText={v => updateReview(idx, { image: v })} />
                <AdminField label="Rating (1-5)" value={String(r.rating)} onChangeText={v => updateReview(idx, { rating: Number(v) || 5 })} keyboardType="numeric" />
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addReview}><Plus size={15} color={AdminColors.primary} /><Text style={styles.addBtnText}>Add Review</Text></TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Hero</Text>
            <AdminField label="Badge" value={data.hero.badge || ''} onChangeText={v => setData(d => ({ ...d, hero: { ...d.hero, badge: v } }))} />
            <AdminField label="Title" value={data.hero.title || ''} onChangeText={v => setData(d => ({ ...d, hero: { ...d.hero, title: v } }))} />
            <AdminField label="Title Highlight" value={data.hero.titleHighlight || ''} onChangeText={v => setData(d => ({ ...d, hero: { ...d.hero, titleHighlight: v } }))} />
            <AdminField label="Subtitle" value={data.hero.subtitle || ''} onChangeText={v => setData(d => ({ ...d, hero: { ...d.hero, subtitle: v } }))} />

            <Text style={styles.sectionTitle}>Spotlight</Text>
            <AdminField label="Badge" value={data.spotlight.badge || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, badge: v } }))} />
            <AdminField label="Quote" value={data.spotlight.quote || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, quote: v } }))} multiline />
            <AdminField label="Description" value={data.spotlight.description || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, description: v } }))} multiline />
            <AdminField label="Name" value={data.spotlight.name || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, name: v } }))} />
            <AdminField label="Role" value={data.spotlight.role || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, role: v } }))} />
            <AdminField label="Image URL" value={data.spotlight.image || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, image: v } }))} />
            <AdminField label="Stamp Text" value={data.spotlight.stampText || ''} onChangeText={v => setData(d => ({ ...d, spotlight: { ...d.spotlight, stampText: v } }))} />

            <Text style={styles.sectionTitle}>Call To Action</Text>
            <AdminField label="Title" value={data.cta.title || ''} onChangeText={v => setData(d => ({ ...d, cta: { ...d.cta, title: v } }))} />
            <AdminField label="Title Highlight" value={data.cta.titleHighlight || ''} onChangeText={v => setData(d => ({ ...d, cta: { ...d.cta, titleHighlight: v } }))} />
            <AdminField label="Button Text" value={data.cta.buttonText || ''} onChangeText={v => setData(d => ({ ...d, cta: { ...d.cta, buttonText: v } }))} />
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
  tabText: { fontSize: FontSizes.xs, fontWeight: '600', color: AdminColors.textSecondary },
  tabTextActive: { color: AdminColors.primary },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: 12, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
