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
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [adminDark, setAdminDark] = useState(false);
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

  const toggleAdminTheme = () => {
    const next = !adminDark;
    setAdminDark(next);
    AsyncStorage.setItem('admin_theme_mode', next ? 'dark' : 'light').catch(() => {});
  };

  const isDark = adminDark;

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
      Alert.alert('Missing Title', 'Please enter a title for the story.');
      return;
    }
    if (!excerpt.trim()) {
      Alert.alert('Missing Summary', 'Please enter a short excerpt for the story.');
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
          Alert.alert('Success', publishNow ? 'Article updated and published!' : 'Article saved as draft.');
          setModalVisible(false);
          fetchArticles();
        }
      } else {
        const res = await blogApi.createArticle(payload);
        if (res?.success) {
          Alert.alert('Success', publishNow ? 'New article published to live blog!' : 'Draft saved.');
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
        Alert.alert('Updated', !current ? 'Article is now Live!' : 'Article moved to Drafts.');
        fetchArticles();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const confirmDelete = (id: string, artTitle: string) => {
    Alert.alert(
      'Delete Article',
      `Are you sure you want to permanently delete "${artTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await blogApi.deleteArticle(id);
              if (res?.success) {
                Alert.alert('Deleted', 'Article removed successfully.');
                fetchArticles();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete.');
            }
          },
        },
      ]
    );
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Restore Defaults',
      'Reset all blogs and news to standard Remise stories?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await blogApi.resetDefaults();
              if (res?.success) {
                Alert.alert('Reset', 'Restored default Remise articles.');
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
      <View style={[styles.header, { borderBottomColor: dynamicColors.border }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Newspaper size={12} color={AdminColors.primary} />
            <Text style={styles.badgeText}>Publishing Studio</Text>
          </View>
          <Text style={[styles.title, { color: dynamicColors.textPrimary }]}>Blogs & News</Text>
          <Text style={[styles.subtitle, { color: dynamicColors.textSecondary }]}>
            Write and publish stories that sync live to app & web.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* THEME SWITCHER */}
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}
            onPress={toggleAdminTheme}
            activeOpacity={0.8}
          >
            {isDark ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#64748B" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn} onPress={openNewModal} activeOpacity={0.8}>
            <Plus size={15} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Write</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS STRIP */}
      <View style={[styles.statsStrip, { backgroundColor: dynamicColors.card, borderBottomColor: dynamicColors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: dynamicColors.textSecondary }]}>Total</Text>
          <Text style={[styles.statValue, { color: dynamicColors.textPrimary }]}>{articles.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: '#22C55E' }]}>Live</Text>
          <Text style={[styles.statValue, { color: '#22C55E' }]}>
            {articles.filter(a => a.published).length}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Drafts</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {articles.filter(a => !a.published).length}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: AdminColors.primary }]}>News</Text>
          <Text style={[styles.statValue, { color: AdminColors.primary }]}>
            {articles.filter(a => a.type === 'news').length}
          </Text>
        </View>
      </View>

      {/* SEARCH & STATUS TABS */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.border }]}>
          <Search size={15} color={dynamicColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: dynamicColors.textPrimary }]}
            placeholder="Search stories..."
            placeholderTextColor={dynamicColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statusTabs}>
          {(['all', 'published', 'draft'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.statusTab,
                { backgroundColor: dynamicColors.tagBg },
                statusFilter === tab && styles.statusTabActive,
              ]}
              onPress={() => setStatusFilter(tab)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  { color: dynamicColors.textSecondary },
                  statusFilter === tab && styles.statusTabTextActive,
                ]}
              >
                {tab.toUpperCase()}
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
                  { color: dynamicColors.textSecondary },
                  activeCategory === cat && styles.catChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST OF ARTICLES */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: dynamicColors.textSecondary }]}>Loading articles...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Newspaper size={40} color={dynamicColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: dynamicColors.textPrimary }]}>No stories found</Text>
          <Text style={[styles.emptySub, { color: dynamicColors.textSecondary }]}>
            Tap Write above to compose your first post.
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
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                  )}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{art.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, art.published ? styles.liveBadge : styles.draftBadge]}>
                    <Text style={[styles.statusBadgeText, art.published ? styles.liveText : styles.draftText]}>
                      {art.published ? 'LIVE' : 'DRAFT'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: dynamicColors.textPrimary }]}>{art.title}</Text>
              <Text style={[styles.cardExcerpt, { color: dynamicColors.textSecondary }]} numberOfLines={2}>
                {art.excerpt}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <User size={11} color={dynamicColors.textSecondary} />
                  <Text style={[styles.metaText, { color: dynamicColors.textSecondary }]}>{art.author || 'Team Remise'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={11} color={dynamicColors.textSecondary} />
                  <Text style={[styles.metaText, { color: dynamicColors.textSecondary }]}>{art.date}</Text>
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
                    {art.published ? 'Draft' : 'Publish'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => openEditModal(art)}
                >
                  <Edit3 size={13} color={isDark ? '#FFF' : '#0F172A'} />
                  <Text style={[styles.actionBtnText, { color: isDark ? '#FFF' : '#0F172A' }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => confirmDelete(art._id || art.id, art.title)}
                >
                  <Trash2 size={13} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetDefaults}>
            <RefreshCw size={13} color={dynamicColors.textSecondary} />
            <Text style={[styles.resetBtnText, { color: dynamicColors.textSecondary }]}>Restore Remise Defaults</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* COMPOSE & EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalRoot, { backgroundColor: dynamicColors.bg }]}>
          {/* MODAL HEADER */}
          <View style={[styles.modalHeader, { borderBottomColor: dynamicColors.border, backgroundColor: dynamicColors.card }]}>
            <View>
              <Text style={[styles.modalHeaderTitle, { color: dynamicColors.textPrimary }]}>
                {isEditing ? 'Edit Story' : 'Compose Story'}
              </Text>
              <Text style={[styles.modalHeaderSub, { color: dynamicColors.textSecondary }]}>
                Publish live to web & mobile app
              </Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <X size={20} color={dynamicColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* TITLE */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>TITLE *</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
              placeholder="Enter headline..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={handleTitleChange}
            />

            {/* SLUG */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>URL SLUG</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textSecondary, fontStyle: 'italic', fontSize: 12 }]}
              placeholder="auto-generated-slug"
              placeholderTextColor="#999"
              value={slug}
              onChangeText={setSlug}
            />

            {/* CATEGORY */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>CATEGORY</Text>
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
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>POST TYPE</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeBtn, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }, type === 'blog' && styles.typeBtnActive]}
                    onPress={() => setType('blog')}
                  >
                    <Text style={[styles.typeBtnText, { color: dynamicColors.textSecondary }, type === 'blog' && styles.typeBtnTextActive]}>Blog</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeBtn, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }, type === 'news' && styles.typeBtnActive]}
                    onPress={() => setType('news')}
                  >
                    <Text style={[styles.typeBtnText, { color: dynamicColors.textSecondary }, type === 'news' && styles.typeBtnTextActive]}>News</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>READ TIME</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
                  placeholder="e.g. 5 min read"
                  placeholderTextColor="#999"
                  value={readTime}
                  onChangeText={setReadTime}
                />
              </View>
            </View>

            {/* EXCERPT */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>SHORT SUMMARY / EXCERPT *</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary, height: 70, textAlignVertical: 'top' }]}
              placeholder="Brief 1-2 sentences shown in cards..."
              placeholderTextColor="#999"
              multiline
              value={excerpt}
              onChangeText={setExcerpt}
            />

            {/* FULL BODY */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>FULL ARTICLE CONTENT (Markdown / Paragraphs)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary, height: 160, textAlignVertical: 'top' }]}
              placeholder="Write the full story here. Separate paragraphs with a blank line..."
              placeholderTextColor="#999"
              multiline
              value={bodyText}
              onChangeText={setBodyText}
            />

            {/* COVER IMAGE */}
            <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>COVER IMAGE URL</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#999"
              value={image}
              onChangeText={setImage}
            />

            {/* AUTHOR & DATE */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>AUTHOR</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
                  placeholder="Team Remise"
                  placeholderTextColor="#999"
                  value={author}
                  onChangeText={setAuthor}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: dynamicColors.textSecondary }]}>DATE</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, color: dynamicColors.textPrimary }]}
                  placeholder="September 2026"
                  placeholderTextColor="#999"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            {/* SWITCHES */}
            <View style={[styles.switchRow, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }]}>
              <Text style={[styles.switchLabel, { color: dynamicColors.textPrimary }]}>Pin as Featured Story</Text>
              <Switch
                value={featured}
                onValueChange={setFeatured}
                trackColor={{ false: '#999', true: AdminColors.primary }}
              />
            </View>

            <View style={[styles.switchRow, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border, borderWidth: 1 }]}>
              <Text style={[styles.switchLabel, { color: dynamicColors.textPrimary }]}>Publish Live Immediately</Text>
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
                <Text style={styles.draftSubmitText}>Save Draft</Text>
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
                      {isEditing ? 'Save & Publish' : 'Publish Story'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', color: AdminColors.primary, textTransform: 'uppercase' },
  title: { fontSize: FontSizes.lg, fontWeight: '900' },
  subtitle: { fontSize: FontSizes.xs, marginTop: 2 },
  themeBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AdminColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: FontSizes.xs, textTransform: 'uppercase' },

  statsStrip: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: FontSizes.base, fontWeight: '900', marginTop: 1 },

  searchSection: { padding: Spacing.md, gap: Spacing.xs },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, fontSize: FontSizes.xs, padding: 0 },

  statusTabs: { flexDirection: 'row', gap: 6, marginTop: 4 },
  statusTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  statusTabActive: { backgroundColor: AdminColors.primary },
  statusTabText: { fontSize: 10, fontWeight: '800' },
  statusTabTextActive: { color: '#FFFFFF' },

  categoriesWrapper: { marginBottom: Spacing.xs },
  categoryScroll: { paddingHorizontal: Spacing.md, gap: 6 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  catChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  catChipText: { fontSize: 11, fontWeight: '700' },
  catChipTextActive: { color: '#FFFFFF', fontWeight: '800' },

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
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10 },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 8,
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
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: { fontSize: FontSizes.base, fontWeight: '900' },
  modalHeaderSub: { fontSize: FontSizes.xs },
  closeBtn: { padding: 4 },
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
  typeRow: { flexDirection: 'row', gap: 6 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  typeBtnActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  typeBtnText: { fontSize: FontSizes.xs, fontWeight: '700' },
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
});
