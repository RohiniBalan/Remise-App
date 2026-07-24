import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { adminBlogLifestyleApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import AdminArrayCard from '../../components/admin/AdminArrayCard';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/blog-lifestyle/page.tsx — same 4 sub-tabs
// (Featured Story / Articles / Company Timeline / Testimonials), same
// fields per web's handleFeaturedChange/add-article/add-timeline/
// add-testimonial handlers, same 4 icon presets for articles.
// GET/PUT/`/reset` `/blog-lifestyle` (bare object).
const ICON_OPTIONS = ['Globe2', 'Smile', 'Shield', 'Rocket'];

interface Featured { category?: string; date?: string; title?: string; excerpt?: string; image?: string; stats: { years?: string; stores?: string; countries?: string; smiles?: string } }
interface Article { id: string; title: string; category: string; date: string; image: string; icon: string; excerpt: string }
interface TimelineItem { id: string; year: string; event: string; highlight: boolean }
interface Testimonial { id: string; name: string; role: string; location: string; rating: number; content: string }
interface BlogData { featuredArticle: Featured; articles: Article[]; timeline: TimelineItem[]; testimonials: Testimonial[] }

const DEFAULTS: BlogData = { featuredArticle: { stats: {} }, articles: [], timeline: [], testimonials: [] };

export default function AdminBlogLifestyleScreen() {
  const { data, setData, loading, saving, status, save, reset } = useAdminContent<BlogData>(adminBlogLifestyleApi, DEFAULTS);
  const [tab, setTab] = useState<'featured' | 'articles' | 'timeline' | 'testimonials'>('featured');

  const setFeatured = (patch: Partial<Featured>) => setData(d => ({ ...d, featuredArticle: { ...d.featuredArticle, ...patch } }));
  const setStats = (patch: Partial<Featured['stats']>) => setData(d => ({ ...d, featuredArticle: { ...d.featuredArticle, stats: { ...d.featuredArticle.stats, ...patch } } }));

  const addArticle = () => setData(d => ({ ...d, articles: [...d.articles, { id: Date.now().toString(), title: '', category: '', date: '', image: '', icon: ICON_OPTIONS[0], excerpt: '' }] }));
  const removeArticle = (idx: number) => setData(d => ({ ...d, articles: d.articles.filter((_, i) => i !== idx) }));
  const moveArticle = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d.articles]; const t = idx + dir; if (t < 0 || t >= next.length) return d;
    [next[idx], next[t]] = [next[t], next[idx]]; return { ...d, articles: next };
  });
  const updateArticle = (idx: number, patch: Partial<Article>) => setData(d => ({ ...d, articles: d.articles.map((a, i) => (i === idx ? { ...a, ...patch } : a)) }));

  const addTimeline = () => setData(d => ({ ...d, timeline: [...d.timeline, { id: Date.now().toString(), year: '', event: '', highlight: false }] }));
  const removeTimeline = (idx: number) => setData(d => ({ ...d, timeline: d.timeline.filter((_, i) => i !== idx) }));
  const moveTimeline = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d.timeline]; const t = idx + dir; if (t < 0 || t >= next.length) return d;
    [next[idx], next[t]] = [next[t], next[idx]]; return { ...d, timeline: next };
  });
  const updateTimeline = (idx: number, patch: Partial<TimelineItem>) => setData(d => ({ ...d, timeline: d.timeline.map((t, i) => (i === idx ? { ...t, ...patch } : t)) }));

  const addTestimonial = () => setData(d => ({ ...d, testimonials: [...d.testimonials, { id: Date.now().toString(), name: '', role: '', location: '', rating: 5, content: '' }] }));
  const removeTestimonial = (idx: number) => setData(d => ({ ...d, testimonials: d.testimonials.filter((_, i) => i !== idx) }));
  const moveTestimonial = (idx: number, dir: -1 | 1) => setData(d => {
    const next = [...d.testimonials]; const t = idx + dir; if (t < 0 || t >= next.length) return d;
    [next[idx], next[t]] = [next[t], next[idx]]; return { ...d, testimonials: next };
  });
  const updateTestimonial = (idx: number, patch: Partial<Testimonial>) => setData(d => ({ ...d, testimonials: d.testimonials.map((t, i) => (i === idx ? { ...t, ...patch } : t)) }));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {(['featured', 'articles', 'timeline', 'testimonials'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
        {tab === 'featured' && (
          <View>
            <AdminField label="Category" value={data.featuredArticle.category || ''} onChangeText={v => setFeatured({ category: v })} />
            <AdminField label="Date" value={data.featuredArticle.date || ''} onChangeText={v => setFeatured({ date: v })} />
            <AdminField label="Title (use : to split gradient part)" value={data.featuredArticle.title || ''} onChangeText={v => setFeatured({ title: v })} />
            <AdminField label="Excerpt" value={data.featuredArticle.excerpt || ''} onChangeText={v => setFeatured({ excerpt: v })} multiline />
            <AdminField label="Image URL" value={data.featuredArticle.image || ''} onChangeText={v => setFeatured({ image: v })} />
            <Text style={styles.sectionTitle}>Stats</Text>
            <AdminField label="Years" value={data.featuredArticle.stats?.years || ''} onChangeText={v => setStats({ years: v })} />
            <AdminField label="Stores" value={data.featuredArticle.stats?.stores || ''} onChangeText={v => setStats({ stores: v })} />
            <AdminField label="Countries" value={data.featuredArticle.stats?.countries || ''} onChangeText={v => setStats({ countries: v })} />
            <AdminField label="Smiles" value={data.featuredArticle.stats?.smiles || ''} onChangeText={v => setStats({ smiles: v })} />
          </View>
        )}

        {tab === 'articles' && (
          <>
            {data.articles.map((a, idx) => (
              <AdminArrayCard key={a.id} index={idx} total={data.articles.length} onMoveUp={() => moveArticle(idx, -1)} onMoveDown={() => moveArticle(idx, 1)} onDelete={() => removeArticle(idx)}>
                <AdminField label="Title *" value={a.title} onChangeText={v => updateArticle(idx, { title: v })} />
                <AdminField label="Category *" value={a.category} onChangeText={v => updateArticle(idx, { category: v })} />
                <AdminField label="Date *" value={a.date} onChangeText={v => updateArticle(idx, { date: v })} />
                <AdminField label="Image URL *" value={a.image} onChangeText={v => updateArticle(idx, { image: v })} />
                <AdminField label="Excerpt *" value={a.excerpt} onChangeText={v => updateArticle(idx, { excerpt: v })} multiline />
                <Text style={styles.chipLabel}>Icon</Text>
                <View style={styles.chipRow}>
                  {ICON_OPTIONS.map(icon => (
                    <TouchableOpacity key={icon} style={[styles.chip, a.icon === icon && styles.chipActive]} onPress={() => updateArticle(idx, { icon })}>
                      <Text style={[styles.chipText, a.icon === icon && styles.chipTextActive]}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addArticle}><Plus size={15} color={AdminColors.primary} /><Text style={styles.addBtnText}>Add Article</Text></TouchableOpacity>
          </>
        )}

        {tab === 'timeline' && (
          <>
            {data.timeline.map((t, idx) => (
              <AdminArrayCard key={t.id} index={idx} total={data.timeline.length} onMoveUp={() => moveTimeline(idx, -1)} onMoveDown={() => moveTimeline(idx, 1)} onDelete={() => removeTimeline(idx)}>
                <AdminField label="Year *" value={t.year} onChangeText={v => updateTimeline(idx, { year: v })} />
                <AdminField label="Event *" value={t.event} onChangeText={v => updateTimeline(idx, { event: v })} />
                <TouchableOpacity style={styles.checkboxRow} onPress={() => updateTimeline(idx, { highlight: !t.highlight })}>
                  <View style={[styles.checkbox, t.highlight && styles.checkboxChecked]} />
                  <Text style={styles.checkboxLabel}>Highlight this milestone</Text>
                </TouchableOpacity>
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addTimeline}><Plus size={15} color={AdminColors.primary} /><Text style={styles.addBtnText}>Add Milestone</Text></TouchableOpacity>
          </>
        )}

        {tab === 'testimonials' && (
          <>
            {data.testimonials.map((t, idx) => (
              <AdminArrayCard key={t.id} index={idx} total={data.testimonials.length} onMoveUp={() => moveTestimonial(idx, -1)} onMoveDown={() => moveTestimonial(idx, 1)} onDelete={() => removeTestimonial(idx)}>
                <AdminField label="Name *" value={t.name} onChangeText={v => updateTestimonial(idx, { name: v })} />
                <AdminField label="Role *" value={t.role} onChangeText={v => updateTestimonial(idx, { role: v })} />
                <AdminField label="Location *" value={t.location} onChangeText={v => updateTestimonial(idx, { location: v })} />
                <AdminField label="Rating (1-5)" value={String(t.rating)} onChangeText={v => updateTestimonial(idx, { rating: Number(v) || 5 })} keyboardType="numeric" />
                <AdminField label="Content *" value={t.content} onChangeText={v => updateTestimonial(idx, { content: v })} multiline />
              </AdminArrayCard>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addTestimonial}><Plus size={15} color={AdminColors.primary} /><Text style={styles.addBtnText}>Add Testimonial</Text></TouchableOpacity>
          </>
        )}
      </AdminContentLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexGrow: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: AdminColors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '600', color: AdminColors.textSecondary },
  tabTextActive: { color: AdminColors.primary },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  chipLabel: { fontSize: 10, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: AdminColors.border },
  chipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  chipText: { fontSize: 10, color: AdminColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#D1D5DB' },
  checkboxChecked: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  checkboxLabel: { fontSize: FontSizes.xs, color: '#374151' },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
