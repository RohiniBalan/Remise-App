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
import { useTheme } from '../../context/ThemeContext';
import { getAdminColors, AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useTranslation, translateCategory, translatePressContent, translateDate } from '../../i18n';
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
  const { isDark } = useTheme();
  const { t, language } = useTranslation();
  const themeColors = getAdminColors(isDark);

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

  // Delete Confirmation Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PressReleaseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formContactName, setFormContactName] = useState(t('admin.contactNamePlaceholder'));
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
    setFormContactName(t('admin.contactNamePlaceholder'));
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
      Alert.alert(t('admin.missingTitle'), t('admin.missingTitleDesc'));
      return;
    }
    if (!formExcerpt.trim()) {
      Alert.alert(t('admin.missingSummary'), t('admin.missingSummaryDesc'));
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
      Alert.alert(
        publishNow ? t('admin.published') : t('admin.drafts'),
        publishNow ? t('admin.pressSaveSuccess') : t('admin.pressDraftSuccess')
      );
      loadReleases();
    } catch (err: any) {
      console.error('Backend press save error:', err?.message);
      Alert.alert(t('admin.failedSavePress'), err?.message || '');
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
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const targetId = itemToDelete.id;
    const updated = releases.filter(r => r.id !== targetId);
    setReleases(updated);
    saveToStorage(updated);
    try {
      await pressApi.delete(targetId);
    } catch (e) {
      console.warn('Backend delete failed:', e);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
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
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('admin.pressNewsroom')}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal} activeOpacity={0.85}>
            <Plus size={15} color="#fff" />
            <Text style={styles.addBtnText}>{t('admin.newRelease')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>{t('admin.pressSubtitle')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.textPrimary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('admin.totalReleases')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{stats.published}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('admin.published')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.drafts}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('admin.drafts')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: AdminColors.primary }]}>{stats.featured}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('admin.featured')}</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBar, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Search size={16} color={themeColors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder={t('admin.searchPressPlaceholder')}
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={AdminColors.primary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 10 }}>
          {(['all', 'published', 'draft', 'featured'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusChip,
                {
                  backgroundColor: statusFilter === s ? AdminColors.primary : themeColors.cardBg,
                  borderColor: statusFilter === s ? AdminColors.primary : themeColors.border,
                },
              ]}
              onPress={() => setStatusFilter(s)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  { color: statusFilter === s ? '#fff' : (isDark ? '#CBD5E1' : themeColors.textSecondary) },
                  statusFilter === s && styles.statusChipTextActive,
                ]}
              >
                {s === 'all' ? t('admin.all') : s === 'published' ? t('admin.published') : s === 'draft' ? t('admin.drafts') : t('admin.featured')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingRight: 10 }}>
          {['All', ...CATEGORIES].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                {
                  backgroundColor: activeCategory === cat
                    ? (isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2')
                    : (isDark ? '#1F2937' : '#F3F4F6'),
                  borderColor: activeCategory === cat ? AdminColors.primary : (isDark ? '#374151' : '#E5E7EB'),
                },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: activeCategory === cat ? AdminColors.primary : (isDark ? '#CBD5E1' : themeColors.textSecondary) },
                  activeCategory === cat && styles.catChipTextActive,
                ]}
              >
                {cat === 'All' ? t('admin.allCategories') : translateCategory(cat, language)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Press Releases List */}
        {loading ? (
          <ActivityIndicator size="large" color={AdminColors.primary} style={{ marginTop: 40 }} />
        ) : filteredReleases.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Megaphone size={36} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t('admin.noPressFound')}</Text>
            <Text style={[styles.emptySub, { color: themeColors.textSecondary }]}>
              {t('admin.noPressFoundSub')}
            </Text>
            <TouchableOpacity style={[styles.addBtn, { marginTop: 16 }]} onPress={openCreateModal}>
              <Plus size={16} color="#fff" />
              <Text style={styles.addBtnText}>{t('admin.createPressRelease')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredReleases.map(item => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: item.featured
                    ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#FFFDFD')
                    : themeColors.cardBg,
                  borderColor: item.featured
                    ? (isDark ? '#EF4444' : '#FCA5A5')
                    : themeColors.border,
                }
              ]}
            >
              {/* Badges */}
              <View style={styles.badgeRow}>
                {item.featured && (
                  <View style={[styles.featuredBadge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2' }]}>
                    <Star size={11} color="#DC2626" fill="#DC2626" />
                    <Text style={styles.featuredBadgeText}>{t('admin.featured')}</Text>
                  </View>
                )}
                <View style={[styles.pubBadge, { backgroundColor: item.published ? (isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5') : (isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFFBEB') }]}>
                  <Text style={[styles.pubBadgeText, { color: item.published ? '#059669' : '#D97706' }]}>
                    {item.published ? t('admin.published') : t('admin.draftBadge')}
                  </Text>
                </View>
                <Text style={[styles.catBadge, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: isDark ? '#CBD5E1' : '#6B7280' }]}>
                  {translateCategory(item.category || 'General', language)}
                </Text>
                <Text style={[styles.dateText, { color: themeColors.textMuted }]}>{translateDate(item.date, language)}</Text>
              </View>

              {/* Title & Excerpt */}
              <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>{translatePressContent(item.title, language)}</Text>
              <Text style={[styles.itemExcerpt, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {translatePressContent(item.excerpt, language)}
              </Text>

              {/* Footer / Meta */}
              <View style={styles.itemMeta}>
                <Text style={[styles.contactText, { color: themeColors.textMuted }]}>
                  {item.contactName || 'Remise Press'} ({item.contactEmail || 'porulontechnologies@gmail.com'})
                </Text>
                {item.location ? <Text style={[styles.locationText, { color: themeColors.textMuted }]}>• {item.location}</Text> : null}
              </View>

              {/* Action Buttons */}
              <View style={[styles.actionRow, { borderTopColor: themeColors.border }]}>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }, item.featured && styles.iconBtnActive]}
                  onPress={() => toggleFeaturedStatus(item.id)}
                >
                  <Star size={15} color={item.featured ? AdminColors.primary : AdminColors.textMuted} fill={item.featured ? AdminColors.primary : 'none'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: item.published
                        ? (isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5')
                        : (isDark ? '#1F2937' : '#F3F4F6')
                    }
                  ]}
                  onPress={() => togglePublishStatus(item.id)}
                >
                  {item.published ? <Eye size={15} color="#059669" /> : <EyeOff size={15} color={AdminColors.textMuted} />}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionPill, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]} onPress={() => openEditModal(item)}>
                  <Edit3 size={13} color={themeColors.textPrimary} />
                  <Text style={[styles.actionPillText, { color: themeColors.textPrimary }]}>{t('admin.edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionPill, styles.deletePill, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]} onPress={() => confirmDelete(item)}>
                  <Trash2 size={13} color="#DC2626" />
                  <Text style={[styles.actionPillText, { color: '#DC2626' }]}>{t('admin.delete')}</Text>
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
          <View style={[styles.modalCard, isDark && { backgroundColor: themeColors.cardBg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, isDark && { borderBottomColor: themeColors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, isDark && { color: themeColors.textPrimary }]}>
                  {isEditing ? t('admin.editPressRelease') : t('admin.newPressRelease')}
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? '#CBD5E1' : AdminColors.textMuted }]}>
                  {t('admin.newsroomAnnouncement')}
                </Text>
              </View>
              <View style={[styles.tabToggle, isDark && { backgroundColor: themeColors.bg }]}>
                <TouchableOpacity
                  style={[styles.tabBtn, editorTab === 'write' && (isDark ? { backgroundColor: themeColors.cardBg } : styles.tabBtnActive)]}
                  onPress={() => setEditorTab('write')}
                >
                  <Text style={[styles.tabBtnText, editorTab === 'write' && (isDark ? { color: '#FFFFFF' } : styles.tabBtnTextActive)]}>
                    {t('admin.tabWrite')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, editorTab === 'preview' && (isDark ? { backgroundColor: themeColors.cardBg } : styles.tabBtnActive)]}
                  onPress={() => setEditorTab('preview')}
                >
                  <Text style={[styles.tabBtnText, editorTab === 'preview' && (isDark ? { color: '#FFFFFF' } : styles.tabBtnTextActive)]}>
                    {t('admin.tabPreview')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={isDark ? themeColors.textSecondary : AdminColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {editorTab === 'write' ? (
                <>
                  <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                    {t('admin.headlineTitle')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.titleInput,
                      isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }
                    ]}
                    placeholder={t('admin.headlinePlaceholder')}
                    placeholderTextColor={AdminColors.textMuted}
                    value={formTitle}
                    onChangeText={handleTitleChange}
                    multiline
                  />

                  <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                    {t('admin.urlSlug')}
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                    placeholder={t('admin.slugPlaceholder')}
                    placeholderTextColor={AdminColors.textMuted}
                    value={formSlug}
                    onChangeText={setFormSlug}
                    autoCapitalize="none"
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                        {t('admin.dateLabel')}
                      </Text>
                      <TextInput
                        style={[styles.input, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                        placeholder={t('admin.datePlaceholder')}
                        placeholderTextColor={AdminColors.textMuted}
                        value={formDate}
                        onChangeText={setFormDate}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                        {t('admin.locationDateline')}
                      </Text>
                      <TextInput
                        style={[styles.input, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                        placeholder={t('admin.locationPlaceholder')}
                        placeholderTextColor={AdminColors.textMuted}
                        value={formLocation}
                        onChangeText={setFormLocation}
                      />
                    </View>
                  </View>

                  <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                    {t('admin.categoryFieldLabel')}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.catChip, formCategory === c && styles.catChipActive, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}
                        onPress={() => setFormCategory(c)}
                      >
                        <Text style={[styles.catChipText, formCategory === c && styles.catChipTextActive, isDark && formCategory !== c && { color: themeColors.textSecondary }]}>
                          {translateCategory(c, language)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                    {t('admin.summaryExcerpt')}
                  </Text>
                  <TextInput
                    style={[styles.input, { height: 60 }, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                    placeholder={t('admin.summaryPlaceholder')}
                    placeholderTextColor={AdminColors.textMuted}
                    value={formExcerpt}
                    onChangeText={setFormExcerpt}
                    multiline
                  />

                  <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                    {t('admin.fullBody')}
                  </Text>
                  <TextInput
                    style={[styles.input, { height: 140, textAlignVertical: 'top' }, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                    placeholder={t('admin.bodyPlaceholder')}
                    placeholderTextColor={AdminColors.textMuted}
                    value={formBody}
                    onChangeText={setFormBody}
                    multiline
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                        {t('admin.contactNameLabel')}
                      </Text>
                      <TextInput
                        style={[styles.input, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
                        placeholder={t('admin.contactNamePlaceholder')}
                        placeholderTextColor={AdminColors.textMuted}
                        value={formContactName}
                        onChangeText={setFormContactName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, isDark && { color: themeColors.textSecondary }]}>
                        {t('admin.contactEmailLabel')}
                      </Text>
                      <TextInput
                        style={[styles.input, isDark && { backgroundColor: themeColors.bg, borderColor: themeColors.border, color: '#FFFFFF' }]}
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
                  <View style={[styles.toggleRow, isDark && { borderTopColor: themeColors.border }]}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.toggleLabel, { color: themeColors.textPrimary }]}>
                        {t('admin.featuredBanner')}
                      </Text>
                      <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>
                        {t('admin.featuredBannerSub')}
                      </Text>
                    </View>
                    <Switch
                      value={formFeatured}
                      onValueChange={setFormFeatured}
                      trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: AdminColors.primary + '80' }}
                      thumbColor={formFeatured ? AdminColors.primary : '#fff'}
                    />
                  </View>

                  <View style={[styles.toggleRow, isDark && { borderTopColor: themeColors.border }]}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.toggleLabel, { color: themeColors.textPrimary }]}>
                        {t('admin.publishLiveToggle')}
                      </Text>
                      <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>
                        {t('admin.publishLiveSub')}
                      </Text>
                    </View>
                    <Switch
                      value={formPublished}
                      onValueChange={setFormPublished}
                      trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#10B98180' }}
                      thumbColor={formPublished ? '#059669' : '#fff'}
                    />
                  </View>
                </>
              ) : (
                /* Preview mode */
                <View style={styles.previewContainer}>
                  <View style={styles.previewTagRow}>
                    <Text style={styles.previewTag}>{translateCategory(formCategory, language)}</Text>
                    {formFeatured ? <Text style={styles.previewFeaturedTag}>★ {t('admin.featured')}</Text> : null}
                    <Text style={styles.previewDate}>{translateDate(formDate, language) || t('admin.dateLabel')}</Text>
                  </View>
                  <Text style={styles.previewTitle}>{formTitle || t('admin.untitledPressRelease')}</Text>
                  <Text style={styles.previewExcerpt}>{formExcerpt || t('admin.summaryHere')}</Text>
                  <View style={styles.previewDivider} />
                  {formBody ? (
                    formBody.split(/\n\n+/).filter(Boolean).map((p, i) => (
                      <Text key={i} style={styles.previewPara}>{p}</Text>
                    ))
                  ) : (
                    <Text style={{ color: '#9CA3AF', fontStyle: 'italic' }}>{t('admin.noBodyText')}</Text>
                  )}
                  <View style={styles.previewDivider} />
                  <Text style={styles.previewContact}>
                    {formContactName || t('admin.pressContact')} • {formContactEmail || 'porulontechnologies@gmail.com'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.modalFooter, isDark && { borderTopColor: themeColors.border }]}>
              <TouchableOpacity
                style={[styles.draftBtn, isDark && { backgroundColor: '#78350F40' }]}
                onPress={() => handleSave(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.draftBtnText, isDark && { color: '#FBBF24' }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('admin.saveDraft')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pubBtn}
                onPress={() => handleSave(true)}
                activeOpacity={0.8}
              >
                <Save size={15} color="#fff" />
                <Text
                  style={styles.pubBtnText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {isEditing ? t('admin.saveAndUpdate') : t('admin.publishLiveBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CUSTOM DELETE MODAL ────────────────────────────────────── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) {
            setDeleteModalVisible(false);
            setItemToDelete(null);
          }
        }}
      >
        <View style={styles.deleteModalOverlay}>
          <View
            style={[
              styles.deleteModalCard,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border,
              },
            ]}
          >
            {/* Warning Icon Badge */}
            <View
              style={[
                styles.deleteIconBadge,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
                },
              ]}
            >
              <Trash2 size={28} color="#DC2626" />
            </View>

            {/* Modal Title */}
            <Text style={[styles.deleteModalTitle, { color: themeColors.textPrimary }]}>
              {t('admin.deletePressReleaseTitle')}
            </Text>

            {/* Modal Subtitle / Question */}
            <Text style={[styles.deleteModalDesc, { color: themeColors.textSecondary }]}>
              {t('admin.deletePressReleaseConfirm')}
            </Text>

            {/* Target Item Details Card */}
            {itemToDelete ? (
              <View
                style={[
                  styles.deleteTargetBox,
                  {
                    backgroundColor: isDark ? themeColors.bg : '#F3F4F6',
                    borderColor: isDark ? themeColors.border : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.deleteTargetHeader}>
                  <Text style={styles.deleteTargetCategory}>
                    {translateCategory(itemToDelete.category, language)}
                  </Text>
                  <Text style={[styles.deleteTargetDate, { color: themeColors.textMuted }]}>
                    {translateDate(itemToDelete.date, language) || itemToDelete.date}
                  </Text>
                </View>
                <Text
                  style={[styles.deleteTargetTitle, { color: themeColors.textPrimary }]}
                  numberOfLines={2}
                >
                  {translatePressContent(itemToDelete.title, language)}
                </Text>
              </View>
            ) : null}

            {/* Caution Warning */}
            <View style={styles.deleteWarningRow}>
              <AlertCircle size={14} color="#EF4444" style={{ marginTop: 1 }} />
              <Text style={[styles.deleteWarningText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                {t('admin.deletePressReleaseWarning')}
              </Text>
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.deleteBtnRow}>
              <TouchableOpacity
                style={[
                  styles.deleteCancelBtn,
                  {
                    borderColor: themeColors.border,
                    backgroundColor: isDark ? 'transparent' : '#F9FAFB',
                  },
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setItemToDelete(null);
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteCancelText, { color: themeColors.textPrimary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteConfirmBtn, isDeleting && { opacity: 0.7 }]}
                onPress={handleExecuteDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text style={styles.deleteConfirmText}>{t('admin.delete')}</Text>
                  </>
                )}
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
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  headerSubtitle: { fontSize: 12, lineHeight: 18 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AdminColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    flexShrink: 0,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  content: { padding: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 10,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 13 },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    marginRight: 6,
  },
  statusChipActive: {},
  statusChipText: { fontSize: 11, fontWeight: '600' },
  statusChipTextActive: { color: '#fff', fontWeight: '700' },
  catRow: { flexDirection: 'row', marginBottom: 14 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: 6,
  },
  catChipActive: {},
  catChipText: { fontSize: 11, fontWeight: '600' },
  catChipTextActive: { color: AdminColors.primary, fontWeight: '700' },
  emptyCard: {
    padding: 30,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  itemCard: {
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemCardFeatured: {},
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  featuredBadgeText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  pubBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  pubBadgeText: { fontSize: 10, fontWeight: '700' },
  catBadge: { fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dateText: { fontSize: 10, marginLeft: 'auto', alignSelf: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemExcerpt: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  contactText: { fontSize: 11, flexShrink: 1 },
  locationText: { fontSize: 11 },
  actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, paddingTop: 10 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
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
  },
  actionPillText: { fontSize: 12, fontWeight: '600' },
  deletePill: { marginLeft: 'auto' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: 16,
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
    paddingVertical: 10,
    minHeight: 46,
    fontSize: 13.5,
    color: '#111827',
    marginBottom: 12,
  },
  titleInput: {
    minHeight: 56,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
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
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
    width: '100%',
  },
  draftBtn: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: { color: '#92400E', fontSize: 12.5, fontWeight: '700', textAlign: 'center' },
  pubBtn: {
    flex: 1.25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primary,
  },
  pubBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '700', textAlign: 'center' },

  // Custom Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.card,
  },
  deleteIconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  deleteModalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  deleteTargetBox: {
    width: '100%',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 14,
  },
  deleteTargetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deleteTargetCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteTargetDate: {
    fontSize: 11,
  },
  deleteTargetTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  deleteWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  deleteWarningText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  deleteBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
