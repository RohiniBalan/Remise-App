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
  Image,
  Platform,
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
  Newspaper,
  BookOpen,
  Calendar,
  Clock,
  User,
  Star,
  X,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react-native';
import { blogApi } from '../../api/blogApi';
import { useTheme } from '../../context/ThemeContext';
import { getAdminColors, AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation, translateCategory, translatePressContent, translateDate } from '../../i18n';

const CATEGORIES = [
  'All',
  'Shopping Tips',
  'Business',
  'Technology',
  'Remise News',
  'Offers',
  'General',
];

export default function AdminBlogsScreen() {
  const { t, language } = useTranslation();
  const { isDark: globalDark } = useTheme();
  const [adminDark, setAdminDark] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal / Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Shopping Tips');
  const [type, setType] = useState<'blog' | 'news'>('blog');
  const [excerpt, setExcerpt] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [author, setAuthor] = useState('Team Remise');
  const [date, setDate] = useState('');
  const [readTime, setReadTime] = useState('4 min read');
  const [image, setImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Load theme preference
  useEffect(() => {
    AsyncStorage.getItem('admin_theme_mode').then((val) => {
      if (val === 'dark') setAdminDark(true);
      else if (val === 'light') setAdminDark(false);
    }).catch(() => {});
  }, []);

  const isDark = adminDark !== null ? adminDark : globalDark;

  const toggleAdminTheme = () => {
    const next = !isDark;
    setAdminDark(next);
    AsyncStorage.setItem('admin_theme_mode', next ? 'dark' : 'light').catch(() => {});
  };

  const dynamicColors = {
    bg: isDark ? '#0B0F19' : '#F8FAFC',
    card: isDark ? '#131D31' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    inputBg: isDark ? '#1E293B' : '#F1F5F9',
    tagBg: isDark ? '#1E293B' : '#F1F5F9',
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getArticles({ all: true });
      if (res?.success) {
        setArticles(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to load articles in mobile admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openNewModal = () => {
    setFormId(null);
    setTitle('');
    setSlug('');
    setCategory('Shopping Tips');
    setType('blog');
    setExcerpt('');
    setBodyText('');
    setAuthor('Team Remise');
    setDate(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    setReadTime('4 min read');
    setImage('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80');
    setFeatured(false);
    setPublished(true);
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditModal = (art: any) => {
    setFormId(art._id || art.id);
    setTitle(art.title || '');
    setSlug(art.slug || '');
    setCategory(art.category || 'Shopping Tips');
    setType(art.type || 'blog');
    setExcerpt(art.excerpt || '');
    setBodyText(Array.isArray(art.body) ? art.body.join('\n\n') : art.body || '');
    setAuthor(art.author || 'Team Remise');
    setDate(art.date || '');
    setReadTime(art.readTime || '4 min read');
    setImage(art.image || '');
    setFeatured(Boolean(art.featured));
    setPublished(Boolean(art.published));
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const gen = val
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(gen);
    }
  };

  const handleSave = async (publishNow = published) => {
    if (!title.trim()) {
      Alert.alert(t('admin.titleLabel'), t('admin.missingTitleMsg'));
      return;
    }
    if (!excerpt.trim()) {
      Alert.alert(t('admin.excerptLabel'), t('admin.missingExcerptMsg'));
      return;
    }

    setSaving(true);
    try {
      const paragraphs = bodyText
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        type,
        excerpt: excerpt.trim(),
        body: paragraphs.length > 0 ? paragraphs : [excerpt.trim()],
        author: author.trim() || 'Team Remise',
        date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        readTime: readTime.trim(),
        image: image.trim(),
        featured,
        published: publishNow,
      };

      if (isEditing && formId) {
        const res = await blogApi.updateArticle(formId, payload);
        if (res?.success) {
          Alert.alert(
            publishNow ? t('admin.liveBadge') : t('admin.draftBadge'),
            publishNow ? t('admin.storyUpdatedPublished') : t('admin.storySavedDraft')
          );
          setModalVisible(false);
          fetchArticles();
        }
      } else {
        const res = await blogApi.createArticle(payload);
        if (res?.success) {
          Alert.alert(
            publishNow ? t('admin.liveBadge') : t('admin.draftBadge'),
            publishNow ? t('admin.storyPublishedLive') : t('admin.storySavedDraft')
          );
          setModalVisible(false);
          fetchArticles();
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      const res = await blogApi.togglePublish(id);
      if (res?.success) {
        fetchArticles();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const requestDelete = (art: any) => {
    setItemToDelete(art);
    setDeleteModalVisible(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete._id || itemToDelete.id;
    setIsDeleting(true);
    try {
      const res = await blogApi.deleteArticle(id);
      if (res?.success) {
        setDeleteModalVisible(false);
        setItemToDelete(null);
        fetchArticles();
      }
    } catch (err: any) {
      Alert.alert(t('admin.deleteArticle'), err?.response?.data?.message || 'Failed to delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      t('admin.restoreDefaults'),
      t('admin.restoreDefaultsPrompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('admin.restoreDefaults'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await blogApi.resetDefaults();
              if (res?.success) {
                Alert.alert(t('admin.restoreDefaults'), t('admin.restoreDefaultsSuccess'));
                fetchArticles();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to reset.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchesCat = activeCategory === 'All' || a.category === activeCategory;
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'published' ? a.published : !a.published;
      const matchesSearch =
        searchQuery.trim() === '' ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [articles, activeCategory, statusFilter, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: dynamicColors.bg }]}>
      {/* HEADER BAR */}
      <View style={[styles.header, { backgroundColor: dynamicColors.card, borderBottomColor: dynamicColors.border }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.badgeRow}>
              <Newspaper size={12} color={AdminColors.primary} />
              <Text style={styles.badgeText}>{t('admin.adminPublishingStudio')}</Text>
            </View>
            <Text style={[styles.title, { color: dynamicColors.textPrimary }]}>
              {t('admin.blogsNewsManagement')}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openNewModal} activeOpacity={0.85}>
            <Plus size={15} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{t('admin.newStory')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: dynamicColors.textSecondary }]}>
          {t('admin.blogsSubtitle')}
        </Text>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
          <Text style={[styles.statNum, { color: dynamicColors.textPrimary }]}>{articles.length}</Text>
          <Text style={[styles.statLabel, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
            {t('admin.totalStories')}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
          <Text style={[styles.statNum, { color: '#22C55E' }]}>
            {articles.filter(a => a.published).length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
            {t('admin.published')}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>
            {articles.filter(a => !a.published).length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
            {t('admin.drafts')}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
          <Text style={[styles.statNum, { color: AdminColors.primary }]}>
            {articles.filter(a => a.type === 'news').length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
            {t('admin.newsItems')}
          </Text>
        </View>
      </View>

      {/* SEARCH & STATUS TABS */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.border }]}>
          <Search size={16} color={isDark ? '#9CA3AF' : '#64748B'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
            placeholder={t('admin.searchBlogsPlaceholder')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#64748B'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={AdminColors.primary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color={isDark ? '#9CA3AF' : '#64748B'} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusTabs}>
          {(['all', 'published', 'draft'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.statusTab,
                { backgroundColor: dynamicColors.tagBg, borderColor: dynamicColors.border },
                statusFilter === tab && styles.statusTabActive,
              ]}
              onPress={() => setStatusFilter(tab)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  { color: isDark ? '#CBD5E1' : dynamicColors.textSecondary },
                  statusFilter === tab && styles.statusTabTextActive,
                ]}
              >
                {tab === 'all'
                  ? t('admin.all')
                  : tab === 'published'
                  ? t('admin.liveBadge')
                  : t('admin.draftBadge')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CATEGORY CHIPS */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                activeCategory === cat && styles.catChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: isDark ? '#CBD5E1' : dynamicColors.textSecondary },
                  activeCategory === cat && styles.catChipTextActive,
                ]}
              >
                {cat === 'All' ? t('admin.allCategories') : translateCategory(cat, language)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST OF ARTICLES */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: dynamicColors.textSecondary }]}>
            {t('admin.loadingArticles')}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Newspaper size={40} color={dynamicColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: dynamicColors.textPrimary }]}>
            {t('admin.noStoriesFound')}
          </Text>
          <Text style={[styles.emptySub, { color: dynamicColors.textSecondary }]}>
            {t('admin.noStoriesFoundSub')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          {filtered.map(art => (
            <View
              key={art._id || art.id}
              style={[
                styles.card,
                { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                art.featured && { borderColor: 'rgba(255,0,0,0.4)' },
              ]}
            >
              {/* CARD HEADER */}
              <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                  {art.featured && (
                    <View style={styles.featuredBadge}>
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.featuredBadgeText}>{t('admin.featured')}</Text>
                    </View>
                  )}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{translateCategory(art.category, language)}</Text>
                  </View>
                  <View style={[styles.statusBadge, art.published ? styles.liveBadge : styles.draftBadge]}>
                    <Text style={[styles.statusBadgeText, art.published ? styles.liveText : styles.draftText]}>
                      {art.published ? t('admin.liveBadge') : t('admin.draftBadge')}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: dynamicColors.textPrimary }]}>{translatePressContent(art.title, language)}</Text>
              <Text style={[styles.cardExcerpt, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
                {translatePressContent(art.excerpt, language)}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <User size={11} color={dynamicColors.textSecondary} />
                  <Text style={[styles.metaText, { color: dynamicColors.textSecondary }]}>{art.author || 'Team Remise'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={11} color={dynamicColors.textSecondary} />
                  <Text style={[styles.metaText, { color: dynamicColors.textSecondary }]}>{translateDate(art.date, language)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={11} color={dynamicColors.textSecondary} />
                  <Text style={[styles.metaText, { color: dynamicColors.textSecondary }]}>{art.readTime}</Text>
                </View>
              </View>

              {/* ACTION BUTTONS */}
              <View style={[styles.cardActions, { borderTopColor: dynamicColors.border }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.toggleBtn, { backgroundColor: dynamicColors.tagBg }]}
                  onPress={() => handleTogglePublish(art._id || art.id, art.published)}
                >
                  {art.published ? <EyeOff size={13} color="#F59E0B" /> : <Eye size={13} color="#22C55E" />}
                  <Text style={[styles.actionBtnText, { color: art.published ? '#F59E0B' : '#22C55E' }]}>
                    {art.published ? t('admin.draftBadge') : t('admin.publish')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => openEditModal(art)}
                >
                  <Edit3 size={13} color={isDark ? '#FFF' : '#0F172A'} />
                  <Text style={[styles.actionBtnText, { color: isDark ? '#FFF' : '#0F172A' }]}>{t('admin.edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => requestDelete(art)}
                >
                  <Trash2 size={13} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetDefaults}>
            <RefreshCw size={13} color={dynamicColors.textSecondary} />
            <Text style={[styles.resetBtnText, { color: dynamicColors.textSecondary }]}>
              {t('admin.restoreRemiseDefaultsBtn')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* COMPOSE & EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalRoot, { backgroundColor: dynamicColors.bg }]}>
          {/* MODAL HEADER */}
          <View style={[styles.modalHeader, { borderBottomColor: dynamicColors.border, backgroundColor: dynamicColors.card }]}>
            <View style={styles.modalHeaderLeft}>
              <Text style={[styles.modalHeaderTitle, { color: dynamicColors.textPrimary }]}>
                {isEditing ? t('admin.editStory') : t('admin.composeStory')}
              </Text>
              <Text style={[styles.modalHeaderSub, { color: isDark ? '#CBD5E1' : dynamicColors.textSecondary }]}>
                {t('admin.composeStorySub')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={dynamicColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* TITLE */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.titleLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
              placeholder={t('admin.titlePlaceholder')}
              placeholderTextColor="#999"
              value={title}
              onChangeText={handleTitleChange}
            />

            {/* SLUG */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.urlSlugLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textSecondary, fontStyle: 'italic', fontSize: 12 }]}
              placeholder={t('admin.urlSlugPlaceholder')}
              placeholderTextColor="#999"
              value={slug}
              onChangeText={setSlug}
            />

            {/* CATEGORY */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.categoryLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catChip,
                    { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                    category === c && styles.catChipActive,
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.catChipText, { color: dynamicColors.textSecondary }, category === c && styles.catChipTextActive]}>
                    {translateCategory(c, language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* POST TYPE */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.postTypeLabel')}</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 },
                  type === 'blog' && styles.typeBtnActive,
                ]}
                onPress={() => setType('blog')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: dynamicColors.textSecondary },
                    type === 'blog' && styles.typeBtnTextActive,
                  ]}
                >
                  {t('admin.blogType')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 },
                  type === 'news' && styles.typeBtnActive,
                ]}
                onPress={() => setType('news')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: dynamicColors.textSecondary },
                    type === 'news' && styles.typeBtnTextActive,
                  ]}
                >
                  {t('admin.newsType')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* READ TIME */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.readTimeLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
              placeholder={t('admin.readTimePlaceholder')}
              placeholderTextColor="#999"
              value={readTime}
              onChangeText={setReadTime}
            />

            {/* EXCERPT */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.excerptLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary, height: 70, textAlignVertical: 'top' }]}
              placeholder={t('admin.excerptPlaceholder')}
              placeholderTextColor="#999"
              multiline
              value={excerpt}
              onChangeText={setExcerpt}
            />

            {/* FULL BODY */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.fullContentLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary, height: 160, textAlignVertical: 'top' }]}
              placeholder={t('admin.fullContentPlaceholder')}
              placeholderTextColor="#999"
              multiline
              value={bodyText}
              onChangeText={setBodyText}
            />

            {/* COVER IMAGE */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.coverImageLabel')}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
              placeholder={t('admin.coverImagePlaceholder')}
              placeholderTextColor="#999"
              value={image}
              onChangeText={setImage}
            />

            {/* AUTHOR & DATE */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.authorLabel')}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
                  placeholder="Team Remise"
                  placeholderTextColor="#999"
                  value={author}
                  onChangeText={setAuthor}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>{t('admin.dateLabel')}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
                  placeholder={t('admin.datePlaceholder')}
                  placeholderTextColor="#999"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            {/* SWITCHES */}
            <View style={[styles.switchRow, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }]}>
              <Text style={[styles.switchLabel, { color: dynamicColors.textPrimary }]}>{t('admin.pinFeaturedLabel')}</Text>
              <Switch
                value={featured}
                onValueChange={setFeatured}
                trackColor={{ false: '#999', true: AdminColors.primary }}
              />
            </View>

            <View style={[styles.switchRow, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }]}>
              <Text style={[styles.switchLabel, { color: dynamicColors.textPrimary }]}>{t('admin.publishImmediatelyLabel')}</Text>
              <Switch
                value={published}
                onValueChange={setPublished}
                trackColor={{ false: '#999', true: '#22C55E' }}
              />
            </View>

            {/* SUBMIT BUTTONS */}
            <View style={styles.modalSubmitRow}>
              <TouchableOpacity
                style={[styles.draftSubmitBtn, { backgroundColor: dynamicColors.tagBg }]}
                onPress={() => handleSave(false)}
                disabled={saving}
              >
                <Text style={styles.draftSubmitText}>{t('admin.saveDraftBtn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.publishSubmitBtn}
                onPress={() => handleSave(true)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFF" />
                    <Text style={styles.publishSubmitText}>
                      {isEditing ? t('admin.saveAndPublishBtn') : t('admin.publishStoryBtn')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
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
                backgroundColor: dynamicColors.card,
                borderColor: dynamicColors.border,
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
              <Trash2 size={26} color="#DC2626" />
            </View>

            {/* Modal Title */}
            <Text style={[styles.deleteModalTitle, { color: dynamicColors.textPrimary }]}>
              {t('admin.deleteArticle')}
            </Text>

            {/* Modal Subtitle / Question */}
            <Text style={[styles.deleteModalDesc, { color: dynamicColors.textSecondary }]}>
              {t('admin.deleteArticleConfirm')}
            </Text>

            {/* Target Item Details Card */}
            {itemToDelete ? (
              <View
                style={[
                  styles.deleteTargetBox,
                  {
                    backgroundColor: isDark ? dynamicColors.bg : '#F3F4F6',
                    borderColor: isDark ? dynamicColors.border : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.deleteTargetHeader}>
                  <Text style={styles.deleteTargetCategory}>
                    {translateCategory(itemToDelete.category, language)}
                  </Text>
                  <Text style={[styles.deleteTargetDate, { color: dynamicColors.textSecondary }]}>
                    {translateDate(itemToDelete.date, language) || itemToDelete.date}
                  </Text>
                </View>
                <Text
                  style={[styles.deleteTargetTitle, { color: dynamicColors.textPrimary }]}
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
                {t('admin.deleteArticleWarning')}
              </Text>
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.deleteBtnRow}>
              <TouchableOpacity
                style={[
                  styles.deleteCancelBtn,
                  {
                    borderColor: dynamicColors.border,
                    backgroundColor: isDark ? 'transparent' : '#F9FAFB',
                  },
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setItemToDelete(null);
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteCancelText, { color: dynamicColors.textPrimary }]}>
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
                    <Trash2 size={14} color="#FFFFFF" />
                    <Text style={styles.deleteConfirmText}>{t('common.delete')}</Text>
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
  container: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    gap: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', color: AdminColors.primary, textTransform: 'uppercase' },
  title: { fontSize: 17, fontWeight: '800', lineHeight: 24 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 66,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 13,
  },

  searchSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 40,
    textAlignVertical: 'center',
    includeFontPadding: true,
  },

  statusTabs: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  statusTabText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  statusTabTextActive: { color: '#FFFFFF' },

  categoriesWrapper: { marginBottom: 8 },
  categoryScroll: { paddingHorizontal: Spacing.md, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  catChipText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  catChipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  list: { flex: 1, paddingHorizontal: Spacing.md },
  loadingBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSizes.xs, marginTop: Spacing.sm },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '800', marginTop: Spacing.sm },
  emptySub: { fontSize: FontSizes.xs, textAlign: 'center', marginTop: 4 },

  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  featuredBadgeText: { fontSize: 9, fontWeight: '900', color: '#FBBF24' },
  categoryBadge: {
    backgroundColor: 'rgba(255,0,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: { fontSize: 9, fontWeight: '800', color: AdminColors.primary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  liveBadge: { backgroundColor: 'rgba(34,197,94,0.15)' },
  draftBadge: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  liveText: { color: '#22C55E' },
  draftText: { color: '#F59E0B' },

  cardTitle: { fontSize: FontSizes.sm, fontWeight: '800', marginBottom: 4 },
  cardExcerpt: { fontSize: FontSizes.xs, lineHeight: 17, marginBottom: Spacing.sm },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10 },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  toggleBtn: {},
  editBtn: {},
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 8 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  resetBtnText: { fontSize: FontSizes.xs, fontWeight: '700' },

  // Modal styles
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flex: 1,
    paddingRight: 14,
  },
  modalHeaderTitle: { fontSize: FontSizes.base, fontWeight: '900' },
  modalHeaderSub: { fontSize: FontSizes.xs, lineHeight: 17, marginTop: 2 },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: { padding: Spacing.md },

  inputLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, marginTop: Spacing.sm },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: FontSizes.xs,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  typeBtnActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  typeBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  typeBtnTextActive: { color: '#FFFFFF', fontWeight: '800' },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  switchLabel: { fontSize: FontSizes.xs, fontWeight: '700' },

  modalSubmitRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  draftSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  draftSubmitText: { color: '#F59E0B', fontWeight: '800', fontSize: FontSizes.xs, textTransform: 'uppercase' },
  publishSubmitBtn: {
    flex: 2,
    backgroundColor: AdminColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  publishSubmitText: { color: '#FFFFFF', fontWeight: '900', fontSize: FontSizes.xs, textTransform: 'uppercase' },

  // Delete Modal styles
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  deleteCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    gap: 6,
  },
  deleteConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
