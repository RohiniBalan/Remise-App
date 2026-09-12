import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Megaphone,
  Calendar,
  User,
  Star,
  X,
  FileText,
  Save,
  Globe,
  Share2,
} from 'lucide-react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pressApi, PressReleaseItem } from '../../api/pressApi';

export type { PressReleaseItem };

const CATEGORIES = [
  'Product Launch',
  'Company News',
  'Feature Update',
  'Partnership',
  'Platform Enhancement',
  'Milestone',
  'Corporate Announcement'
];

const STORAGE_KEY = 'remise_press_releases';
const DUMMY_IDS = ['smarter-local-discovery', 'product-scanning-launch', 'store-comparison-update'];

export default function AdminPressScreen() {
  const [releases, setReleases] = useState<PressReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  // Modal / Editor State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formContactName, setFormContactName] = useState('Remise Press Team');
  const [formContactEmail, setFormContactEmail] = useState('porulontechnologies@gmail.com');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublished, setFormPublished] = useState(true);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setLoading(true);
      const res = await pressApi.getAll({ all: true });
      if (res?.data && Array.isArray(res.data)) {
        setReleases(res.data);
        return;
      }
      setReleases([]);
    } catch (e) {
      console.error('Failed to load press releases from DB:', e);
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (updatedList: PressReleaseItem[]) => {
    setReleases(updatedList);
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormTitle('');
    setFormSlug('');
    const now = new Date();
    setFormDate(now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    setFormLocation('San Francisco, CA');
    setFormCategory(CATEGORIES[0]);
    setFormExcerpt('');
    setFormBody('');
    setFormContactName('Remise Press Team');
    setFormContactEmail('porulontechnologies@gmail.com');
    setFormFeatured(false);
    setFormPublished(true);
    setIsEditing(false);
    setEditorTab('write');
    setModalVisible(true);
  };

  const openEditModal = (item: PressReleaseItem) => {
    setEditId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug || item.id);
    setFormDate(item.date);
    setFormLocation(item.location || 'San Francisco, CA');
    setFormCategory(item.category || CATEGORIES[0]);
    setFormExcerpt(item.excerpt);
    setFormBody(Array.isArray(item.body) ? item.body.join('\n\n') : (item.body || ''));
    setFormContactName(item.contactName || 'Remise Press Team');
    setFormContactEmail(item.contactEmail || 'porulontechnologies@gmail.com');
    setFormFeatured(Boolean(item.featured));
    setFormPublished(Boolean(item.published));
    setIsEditing(true);
    setEditorTab('write');
    setModalVisible(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!isEditing) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormSlug(slug);
    }
  };

  const handleSave = async (publishNow = formPublished) => {
    if (!formTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the press release.');
      return;
    }
    if (!formExcerpt.trim()) {
      Alert.alert('Missing Summary', 'Please enter a short excerpt / summary.');
      return;
    }

    const currentSlug = (formSlug.trim() || formTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')) || `press-${Date.now()}`;
    const paragraphs = formBody
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      slug: currentSlug,
      date: formDate.trim() || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      excerpt: formExcerpt.trim(),
      body: paragraphs.length > 0 ? paragraphs : [formExcerpt.trim()],
      category: formCategory,
      featured: formFeatured,
      published: publishNow,
      location: formLocation.trim(),
      contactName: formContactName.trim(),
      contactEmail: formContactEmail.trim(),
    };

    try {
      if (isEditing && editId) {
        const res = await pressApi.update(editId, payload);
        const serverItem = res?.data || { ...payload, id: editId, createdAt: new Date().toISOString() };
        let updatedList: PressReleaseItem[];
        if (formFeatured) {
          updatedList = releases.map(r => r.id === editId ? serverItem : { ...r, featured: false });
        } else {
          updatedList = releases.map(r => r.id === editId ? serverItem : r);
        }
        await saveToStorage(updatedList);
      } else {
        const res = await pressApi.create(payload);
        const serverItem = res?.data || { ...payload, id: currentSlug, createdAt: new Date().toISOString() };
        let updatedList: PressReleaseItem[];
        if (formFeatured) {
          updatedList = [serverItem, ...releases.map(r => ({ ...r, featured: false }))];
        } else {
          updatedList = [serverItem, ...releases];
        }
        await saveToStorage(updatedList);
      }
      setModalVisible(false);
      Alert.alert('Success', publishNow ? 'Press Release published to DB!' : 'Press Release saved as draft in DB!');
      loadReleases();
    } catch (err: any) {
      console.error('Backend press save error:', err?.message);
      Alert.alert('Database Error', 'Failed to save press release to database. ' + (err?.message || 'Please check your connection.'));
    }
  };

  const togglePublishStatus = async (id: string) => {
    const updated = releases.map(r => {
      if (r.id === id) {
        return { ...r, published: !r.published };
      }
      return r;
    });
    saveToStorage(updated);
    try {
      await pressApi.togglePublish(id);
    } catch (e) {
      console.warn('Backend togglePublish failed:', e);
    }
  };

  const toggleFeaturedStatus = async (id: string) => {
    const target = releases.find(r => r.id === id);
    if (!target) return;
    const willBeFeatured = !target.featured;

    const updated = releases.map(r => {
      if (r.id === id) {
        return { ...r, featured: willBeFeatured };
      }
      return willBeFeatured ? { ...r, featured: false } : r;
    });
    saveToStorage(updated);
    try {
      await pressApi.toggleFeatured(id);
    } catch (e) {
      console.warn('Backend toggleFeatured failed:', e);
    }
  };

  const confirmDelete = (item: PressReleaseItem) => {
    Alert.alert(
      'Delete Press Release',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = releases.filter(r => r.id !== item.id);
            saveToStorage(updated);
            try {
              await pressApi.delete(item.id);
            } catch (e) {
              console.warn('Backend delete failed:', e);
            }
          },
        },
      ]
    );
  };

  const filteredReleases = useMemo(() => {
    return releases.filter(r => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = activeCategory === 'All' || r.category === activeCategory;

      let matchesStatus = true;
      if (statusFilter === 'published') matchesStatus = r.published === true;
      if (statusFilter === 'draft') matchesStatus = r.published === false;
      if (statusFilter === 'featured') matchesStatus = r.featured === true;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [releases, searchQuery, activeCategory, statusFilter]);

  const stats = {
    total: releases.length,
    published: releases.filter(r => r.published).length,
    drafts: releases.filter(r => !r.published).length,
    featured: releases.filter(r => r.featured).length,
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Press & Media</Text>
          <Text style={styles.headerSubtitle}>Publish company news and press releases</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>New Press</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{stats.published}</Text>
            <Text style={styles.statLabel}>Live</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.drafts}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: AdminColors.primary }]}>{stats.featured}</Text>
            <Text style={styles.statLabel}>Featured</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Search size={16} color={AdminColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search press releases..."
            placeholderTextColor={AdminColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={AdminColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(['all', 'published', 'draft', 'featured'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusChip, statusFilter === s && styles.statusChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.statusChipText, statusFilter === s && styles.statusChipTextActive]}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {['All', ...CATEGORIES].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Press Releases List */}
        {loading ? (
          <ActivityIndicator size="large" color={AdminColors.primary} style={{ marginTop: 40 }} />
        ) : filteredReleases.length === 0 ? (
          <View style={styles.emptyCard}>
            <Megaphone size={36} color={AdminColors.textMuted} />
            <Text style={styles.emptyTitle}>No Press Releases Found</Text>
            <Text style={styles.emptySub}>
              Create your first official announcement to get started.
            </Text>
            <TouchableOpacity style={[styles.addBtn, { marginTop: 16 }]} onPress={openCreateModal}>
              <Plus size={16} color="#fff" />
              <Text style={styles.addBtnText}>Create Press Release</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredReleases.map(item => (
            <View key={item.id} style={[styles.itemCard, item.featured && styles.itemCardFeatured]}>
              {/* Badges */}
              <View style={styles.badgeRow}>
                {item.featured && (
                  <View style={styles.featuredBadge}>
                    <Star size={11} color="#DC2626" fill="#DC2626" />
                    <Text style={styles.featuredBadgeText}>Featured</Text>
                  </View>
                )}
                <View style={[styles.pubBadge, { backgroundColor: item.published ? '#ECFDF5' : '#FFFBEB' }]}>
                  <Text style={[styles.pubBadgeText, { color: item.published ? '#059669' : '#D97706' }]}>
                    {item.published ? 'Published' : 'Draft'}
                  </Text>
                </View>
                <Text style={styles.catBadge}>{item.category || 'General'}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              {/* Title & Excerpt */}
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>

              {/* Footer / Meta */}
              <View style={styles.itemMeta}>
                <Text style={styles.contactText}>
                  {item.contactName || 'Remise Press'} ({item.contactEmail || 'porulontechnologies@gmail.com'})
                </Text>
                {item.location ? <Text style={styles.locationText}>• {item.location}</Text> : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.iconBtn, item.featured && styles.iconBtnActive]}
                  onPress={() => toggleFeaturedStatus(item.id)}
                >
                  <Star size={15} color={item.featured ? AdminColors.primary : AdminColors.textMuted} fill={item.featured ? AdminColors.primary : 'none'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtn, item.published && { backgroundColor: '#ECFDF5' }]}
                  onPress={() => togglePublishStatus(item.id)}
                >
                  {item.published ? <Eye size={15} color="#059669" /> : <EyeOff size={15} color={AdminColors.textMuted} />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionPill} onPress={() => openEditModal(item)}>
                  <Edit3 size={13} color={AdminColors.textPrimary} />
                  <Text style={styles.actionPillText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionPill, styles.deletePill]} onPress={() => confirmDelete(item)}>
                  <Trash2 size={13} color="#DC2626" />
                  <Text style={[styles.actionPillText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ─── CREATE / EDIT MODAL ────────────────────────────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Press Release' : 'New Press Release'}
                </Text>
                <Text style={styles.modalSub}>Remise Newsroom announcement</Text>
              </View>
              <View style={styles.tabToggle}>
                <TouchableOpacity
                  style={[styles.tabBtn, editorTab === 'write' && styles.tabBtnActive]}
                  onPress={() => setEditorTab('write')}
                >
                  <Text style={[styles.tabBtnText, editorTab === 'write' && styles.tabBtnTextActive]}>Write</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, editorTab === 'preview' && styles.tabBtnActive]}
                  onPress={() => setEditorTab('preview')}
                >
                  <Text style={[styles.tabBtnText, editorTab === 'preview' && styles.tabBtnTextActive]}>Preview</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={AdminColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {editorTab === 'write' ? (
                <>
                  <Text style={styles.inputLabel}>Headline Title *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Remise introduces new smart shopping features..."
                    placeholderTextColor={AdminColors.textMuted}
                    value={formTitle}
                    onChangeText={handleTitleChange}
                  />

                  <Text style={styles.inputLabel}>URL Slug *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="smarter-local-discovery"
                    placeholderTextColor={AdminColors.textMuted}
                    value={formSlug}
                    onChangeText={setFormSlug}
                    autoCapitalize="none"
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="September 2026"
                        placeholderTextColor={AdminColors.textMuted}
                        value={formDate}
                        onChangeText={setFormDate}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Location / Dateline</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="San Francisco, CA"
                        placeholderTextColor={AdminColors.textMuted}
                        value={formLocation}
                        onChangeText={setFormLocation}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.catChip, formCategory === c && styles.catChipActive]}
                        onPress={() => setFormCategory(c)}
                      >
                        <Text style={[styles.catChipText, formCategory === c && styles.catChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Summary / Excerpt (1-2 sentences) *</Text>
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    placeholder="Brief summary for listings and preview cards..."
                    placeholderTextColor={AdminColors.textMuted}
                    value={formExcerpt}
                    onChangeText={setFormExcerpt}
                    multiline
                  />

                  <Text style={styles.inputLabel}>Full Body (Separate paragraphs with double lines) *</Text>
                  <TextInput
                    style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
                    placeholder="SAN FRANCISCO — Remise today announced...&#10;&#10;The new capabilities allow..."
                    placeholderTextColor={AdminColors.textMuted}
                    value={formBody}
                    onChangeText={setFormBody}
                    multiline
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>Contact Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Remise Press Team"
                        placeholderTextColor={AdminColors.textMuted}
                        value={formContactName}
                        onChangeText={setFormContactName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Contact Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="porulontechnologies@gmail.com"
                        placeholderTextColor={AdminColors.textMuted}
                        value={formContactEmail}
                        onChangeText={setFormContactEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Toggles */}
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleLabel}>Featured Banner</Text>
                      <Text style={styles.toggleSub}>Hero announcement on Newsroom</Text>
                    </View>
                    <Switch
                      value={formFeatured}
                      onValueChange={setFormFeatured}
                      trackColor={{ false: '#E5E7EB', true: AdminColors.primary + '80' }}
                      thumbColor={formFeatured ? AdminColors.primary : '#fff'}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleLabel}>Publish Live</Text>
                      <Text style={styles.toggleSub}>Make visible to public on /press</Text>
                    </View>
                    <Switch
                      value={formPublished}
                      onValueChange={setFormPublished}
                      trackColor={{ false: '#E5E7EB', true: '#10B98180' }}
                      thumbColor={formPublished ? '#059669' : '#fff'}
                    />
                  </View>
                </>
              ) : (
                /* Preview mode */
                <View style={styles.previewContainer}>
                  <View style={styles.previewTagRow}>
                    <Text style={styles.previewTag}>{formCategory}</Text>
                    {formFeatured ? <Text style={styles.previewFeaturedTag}>★ Featured</Text> : null}
                    <Text style={styles.previewDate}>{formDate || 'Date'}</Text>
                  </View>
                  <Text style={styles.previewTitle}>{formTitle || 'Untitled Press Release'}</Text>
                  <Text style={styles.previewExcerpt}>{formExcerpt || 'Summary here...'}</Text>
                  <View style={styles.previewDivider} />
                  {formBody ? (
                    formBody.split(/\n\n+/).filter(Boolean).map((p, i) => (
                      <Text key={i} style={styles.previewPara}>{p}</Text>
                    ))
                  ) : (
                    <Text style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No body text.</Text>
                  )}
                  <View style={styles.previewDivider} />
                  <Text style={styles.previewContact}>
                    {formContactName || 'Press Contact'} • {formContactEmail || 'porulontechnologies@gmail.com'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.draftBtn} onPress={() => handleSave(false)}>
                <Text style={styles.draftBtnText}>Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pubBtn} onPress={() => handleSave(true)}>
                <Save size={15} color="#fff" />
                <Text style={styles.pubBtnText}>
                  {isEditing ? 'Save & Update' : 'Publish Live'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: AdminColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: AdminColors.textPrimary },
  headerSubtitle: { fontSize: 12, color: AdminColors.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AdminColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  content: { padding: Spacing.md },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: AdminColors.sidebarBg,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: '800', color: AdminColors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AdminColors.sidebarBg,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginBottom: 10,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 13, color: AdminColors.textPrimary },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: AdminColors.sidebarBg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginRight: 6,
  },
  statusChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  statusChipText: { fontSize: 11, fontWeight: '600', color: AdminColors.textSecondary },
  statusChipTextActive: { color: '#fff', fontWeight: '700' },
  catRow: { flexDirection: 'row', marginBottom: 14 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  catChipActive: { backgroundColor: '#FEE2E2' },
  catChipText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  catChipTextActive: { color: AdminColors.primary, fontWeight: '700' },
  emptyCard: {
    padding: 30,
    backgroundColor: AdminColors.sidebarBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: AdminColors.textPrimary, marginTop: 12 },
  emptySub: { fontSize: 12, color: AdminColors.textMuted, textAlign: 'center', marginTop: 4 },
  itemCard: {
    backgroundColor: AdminColors.sidebarBg,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginBottom: 12,
  },
  itemCardFeatured: { borderColor: '#FCA5A5', backgroundColor: '#FFFDFD' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  featuredBadgeText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  pubBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  pubBadgeText: { fontSize: 10, fontWeight: '700' },
  catBadge: { fontSize: 10, color: '#6B7280', fontWeight: '600', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dateText: { fontSize: 10, color: AdminColors.textMuted, marginLeft: 'auto' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: AdminColors.textPrimary, marginBottom: 4 },
  itemExcerpt: { fontSize: 12, color: AdminColors.textSecondary, lineHeight: 17, marginBottom: 8 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  contactText: { fontSize: 11, color: AdminColors.textMuted },
  locationText: { fontSize: 11, color: AdminColors.textMuted },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: { backgroundColor: '#FEE2E2' },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F3F4F6',
  },
  actionPillText: { fontSize: 12, fontWeight: '600', color: AdminColors.textPrimary },
  deletePill: { backgroundColor: '#FEE2E2', marginLeft: 'auto' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: AdminColors.textPrimary },
  modalSub: { fontSize: 11, color: AdminColors.textMuted },
  tabToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2, marginRight: 8 },
  tabBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#fff' },
  tabBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive: { color: '#111827', fontWeight: '700' },
  closeBtn: { padding: 4 },
  modalBody: { padding: Spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 4 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    marginBottom: 12,
  },
  formRow: { flexDirection: 'row', marginBottom: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  toggleSub: { fontSize: 11, color: '#6B7280' },
  previewContainer: { backgroundColor: '#1E293B', borderRadius: BorderRadius.md, padding: 16 },
  previewTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  previewTag: { fontSize: 10, fontWeight: '700', color: '#F87171', backgroundColor: '#7F1D1D40', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  previewFeaturedTag: { fontSize: 10, fontWeight: '700', color: '#FBBF24', backgroundColor: '#78350F40', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  previewDate: { fontSize: 10, color: '#94A3B8', marginLeft: 'auto' },
  previewTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 6 },
  previewExcerpt: { fontSize: 12, color: '#CBD5E1', fontStyle: 'italic', marginBottom: 12 },
  previewDivider: { height: 1, backgroundColor: '#334155', marginVertical: 10 },
  previewPara: { fontSize: 12, color: '#E2E8F0', lineHeight: 18, marginBottom: 8 },
  previewContact: { fontSize: 10, color: '#94A3B8' },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
  },
  draftBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF3C7',
  },
  draftBtnText: { color: '#92400E', fontSize: 13, fontWeight: '700' },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primary,
  },
  pubBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
