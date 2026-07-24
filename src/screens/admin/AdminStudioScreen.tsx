import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Plus, ChevronUp, ChevronDown, Edit2, Trash2, Save } from 'lucide-react-native';
import { adminStudioApi } from '../../api/adminContentApi';
import AdminField from '../../components/admin/AdminField';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/StudioAdminPage/page.tsx ("Studio
// Showcase" video carousel) — same shape as Hot Drops (video CRUD +
// config + index-swap reorder), with Studio's own distinct fields:
// videoId (auto-incremented, computed as max+1 like web), description,
// color (hex), rating (string), category (5 presets), and config's
// autoCycleDuration (ms) + theme (dark/light) + highlightText.
const CATEGORIES = ['Vintage Collection', 'Modern Classics', 'Racing Series', 'Limited Edition', 'Signature Series'];

interface Video { _id: string; title: string; description: string; videoId: number; src: string; color: string; rating: string; category: string; order: number }
interface Config { title: string; subtitle: string; badgeText: string; highlightText: string; buttonText: string; isActive: boolean; autoCycleDuration: number; theme: 'dark' | 'light' }

const DEFAULT_CONFIG: Config = { title: 'STUDIO SHOWCASE', subtitle: '', badgeText: 'Live Exhibit', highlightText: 'SHOWCASE', buttonText: 'View All', isActive: true, autoCycleDuration: 5000, theme: 'dark' };
const EMPTY_VIDEO = { title: '', description: '', src: '', color: '#C41E3A', rating: '9.5', category: CATEGORIES[0] };

export default function AdminStudioScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_VIDEO);

  const load = () => {
    Promise.all([adminStudioApi.getVideos(), adminStudioApi.getConfig()])
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
      await adminStudioApi.saveConfig(config);
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
        const res = await adminStudioApi.resetConfig();
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
      const res = await adminStudioApi.reorder({ orders: [{ id: next[index]._id, order: next[index].order }, { id: next[swapIndex]._id, order: next[swapIndex].order }] });
      if (res.data.success) setVideos(next);
    } catch {
      Alert.alert('Error', 'Failed to reorder.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete this video?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminStudioApi.deleteVideo(id); load(); } catch { Alert.alert('Error', 'Failed to delete video.'); }
      } },
    ]);
  };

  const startEdit = (v: Video) => { setEditingId(v._id); setForm({ title: v.title, description: v.description, src: v.src, color: v.color, rating: v.rating, category: v.category }); setShowAdd(true); };
  const startAdd = () => { setEditingId(null); setForm(EMPTY_VIDEO); setShowAdd(true); };

  const handleSaveVideo = async () => {
    if (!form.title.trim() || !form.src.trim()) { Alert.alert('Error', 'Title and video URL are required.'); return; }
    setSaving(true);
    try {
      const maxId = videos.reduce((max, v) => Math.max(max, v.videoId || 0), 0);
      const payload = editingId ? form : { ...form, videoId: maxId + 1 };
      if (editingId) await adminStudioApi.updateVideo(editingId, payload);
      else await adminStudioApi.addVideo(payload);
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
        <AdminField label="Description" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
        <AdminField label="Video URL *" value={form.src} onChangeText={v => setForm(f => ({ ...f, src: v }))} />
        <AdminField label="Color (hex)" value={form.color} onChangeText={v => setForm(f => ({ ...f, color: v }))} />
        <AdminField label="Rating" value={form.rating} onChangeText={v => setForm(f => ({ ...f, rating: v }))} />
        <Text style={styles.chipLabel}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
              <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
      <AdminField label="Title" value={config.title} onChangeText={v => setConfig(c => ({ ...c, title: v }))} />
      <AdminField label="Highlight Text" value={config.highlightText} onChangeText={v => setConfig(c => ({ ...c, highlightText: v }))} />
      <AdminField label="Subtitle" value={config.subtitle} onChangeText={v => setConfig(c => ({ ...c, subtitle: v }))} multiline />
      <AdminField label="Button Text" value={config.buttonText} onChangeText={v => setConfig(c => ({ ...c, buttonText: v }))} />
      <AdminField label="Auto-Cycle Duration (ms)" value={String(config.autoCycleDuration)} onChangeText={v => setConfig(c => ({ ...c, autoCycleDuration: Number(v) || 5000 }))} keyboardType="numeric" />
      <Text style={styles.chipLabel}>Preview Theme</Text>
      <View style={styles.chipRow}>
        {(['dark', 'light'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.chip, config.theme === t && styles.chipActive]} onPress={() => setConfig(c => ({ ...c, theme: t }))}>
            <Text style={[styles.chipText, config.theme === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
            <Text style={styles.videoMeta}>{v.category} · ★{v.rating}</Text>
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
