import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Plus, ChevronUp, ChevronDown, Edit2, Trash2, Save } from 'lucide-react-native';
import { adminTrendingApi } from '../../api/adminContentApi';
import AdminField from '../../components/admin/AdminField';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/hot-drops/page.tsx ("Trending Now" video
// section, titled TrendingAdminPage on web) — real per-video CRUD
// (POST/PUT/DELETE `/trending[/:id]`) + a separate config object
// (PUT `/trending/config/update`, POST `/trending/config/reset`) + an
// index-swap reorder (POST `/trending/reorder` with the two swapped
// `{id, order}` pairs — matches web's handleReorder exactly, not a
// generic move-in-array-then-resave-everything approach).
const CATEGORIES = ['Premium', 'Limited', 'Exclusive', 'Elite', "Collector's", 'Tech', 'Sport', 'Luxury'];

interface Video { _id: string; title: string; category: string; views: string; duration: string; src: string; order: number; isActive?: boolean }
interface Config { sectionTitle: string; sectionSubtitle: string; badgeText: string; buttonText: string; isActive: boolean }

const DEFAULT_CONFIG: Config = { sectionTitle: 'Hot Drops', sectionSubtitle: '', badgeText: 'Trending Now', buttonText: 'EXPLORE ALL', isActive: true };
const EMPTY_VIDEO = { title: '', category: 'Premium', views: '', duration: '', src: '' };

export default function AdminHotDropsScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_VIDEO);

  const load = () => {
    Promise.all([adminTrendingApi.getVideos(), adminTrendingApi.getConfig()])
      .then(([vRes, cRes]) => {
        setVideos((vRes.data.data || []).sort((a: Video, b: Video) => a.order - b.order));
        if (cRes.data.data) setConfig(cRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await adminTrendingApi.saveConfig(config);
    } catch {
      Alert.alert('Error', 'Failed to save section settings.');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    Alert.alert('Reset section settings to defaults?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        const res = await adminTrendingApi.resetConfig();
        if (res.data.data) setConfig(res.data.data);
      } },
    ]);
  };

  const handleReorder = async (videoId: string, direction: 'up' | 'down') => {
    const index = videos.findIndex(v => v._id === videoId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === videos.length - 1)) return;
    const next = [...videos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const tempOrder = next[index].order;
    next[index].order = next[swapIndex].order;
    next[swapIndex].order = tempOrder;
    next.sort((a, b) => a.order - b.order);
    try {
      const res = await adminTrendingApi.reorder({ orders: [{ id: next[index]._id, order: next[index].order }, { id: next[swapIndex]._id, order: next[swapIndex].order }] });
      if (res.data.success) setVideos(next);
    } catch {
      Alert.alert('Error', 'Failed to reorder.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete this video?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminTrendingApi.deleteVideo(id); load(); } catch { Alert.alert('Error', 'Failed to delete video.'); }
      } },
    ]);
  };

  const startEdit = (v: Video) => { setEditingId(v._id); setForm({ title: v.title, category: v.category, views: v.views, duration: v.duration, src: v.src }); setShowAdd(true); };
  const startAdd = () => { setEditingId(null); setForm(EMPTY_VIDEO); setShowAdd(true); };

  const handleSaveVideo = async () => {
    if (!form.title.trim() || !form.src.trim()) { Alert.alert('Error', 'Title and video URL are required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, views: form.views || '0', duration: form.duration || '0:00' };
      if (editingId) await adminTrendingApi.updateVideo(editingId, payload);
      else await adminTrendingApi.addVideo(payload);
      setShowAdd(false);
      load();
    } catch {
      Alert.alert('Error', 'Failed to save video.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  if (showAdd) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
        <AdminField label="Title *" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
        <Text style={styles.chipLabel}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
              <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <AdminField label="Views (e.g. 2.4M)" value={form.views} onChangeText={v => setForm(f => ({ ...f, views: v }))} />
        <AdminField label="Duration (e.g. 0:45)" value={form.duration} onChangeText={v => setForm(f => ({ ...f, duration: v }))} />
        <AdminField label="Video URL *" value={form.src} onChangeText={v => setForm(f => ({ ...f, src: v }))} />
        <View style={styles.formButtonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={handleSaveVideo} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{editingId ? 'Save Changes' : 'Add Video'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      <Text style={styles.sectionTitle}>Section Settings</Text>
      <AdminField label="Badge Text" value={config.badgeText} onChangeText={v => setConfig(c => ({ ...c, badgeText: v }))} />
      <AdminField label="Section Title" value={config.sectionTitle} onChangeText={v => setConfig(c => ({ ...c, sectionTitle: v }))} />
      <AdminField label="Section Subtitle" value={config.sectionSubtitle} onChangeText={v => setConfig(c => ({ ...c, sectionSubtitle: v }))} multiline />
      <AdminField label="Button Text" value={config.buttonText} onChangeText={v => setConfig(c => ({ ...c, buttonText: v }))} />
      <View style={styles.formButtonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={resetConfig}><Text style={styles.cancelBtnText}>Reset</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={saveConfig} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Save size={14} color="#fff" /><Text style={styles.submitBtnText}>Save Settings</Text></>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Videos ({videos.length})</Text>
      {videos.map((v, idx) => (
        <View key={v._id} style={styles.videoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.videoTitle} numberOfLines={1}>{v.title}</Text>
            <Text style={styles.videoMeta}>{v.category} · {v.views} views · {v.duration}</Text>
          </View>
          <View style={styles.videoActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleReorder(v._id, 'up')} disabled={idx === 0}><ChevronUp size={14} color={idx === 0 ? '#D1D5DB' : AdminColors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleReorder(v._id, 'down')} disabled={idx === videos.length - 1}><ChevronDown size={14} color={idx === videos.length - 1 ? '#D1D5DB' : AdminColors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(v)}><Edit2 size={14} color={AdminColors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(v._id)}><Trash2 size={14} color="#DC2626" /></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={startAdd}>
        <Plus size={15} color={AdminColors.primary} />
        <Text style={styles.addBtnText}>Add Video</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary, marginBottom: Spacing.sm },
  chipLabel: { fontSize: 10, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: AdminColors.border },
  chipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  chipText: { fontSize: 10, color: AdminColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  formButtonRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border },
  cancelBtnText: { color: '#374151', fontWeight: '700' },
  submitBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  submitBtnText: { color: '#fff', fontWeight: '800' },
  videoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs },
  videoTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
  videoMeta: { fontSize: 10, color: AdminColors.textSecondary, marginTop: 2 },
  videoActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg, borderRadius: BorderRadius.sm },
  addBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AdminColors.primary, borderStyle: 'dashed', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  addBtnText: { color: AdminColors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
