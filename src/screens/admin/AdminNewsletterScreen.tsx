import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Mail,
  Users,
  Send,
  UserCheck,
  UserX,
  Search,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { getAdminColors, AdminColors, Spacing, BorderRadius, FontSizes, Shadows } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { adminNewsletterApi } from '../../api/adminApi';
import { useTranslation } from '../../i18n';

interface Subscriber {
  _id: string;
  email: string;
  status: 'active' | 'unconfirmed' | 'unsubscribed';
  source: string;
  subscribedAt: string;
}

export default function AdminNewsletterScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'subscribers' | 'compose'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    active: 0,
    unsubscribed: 0,
    unconfirmed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Compose State
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [subsRes, statsRes] = await Promise.allSettled([
        adminNewsletterApi.getSubscribers({ page: 1, limit: 100 }),
        adminNewsletterApi.getStats(),
      ]);

      if (subsRes.status === 'fulfilled' && subsRes.value.data) {
        const list = subsRes.value.data.subscribers || subsRes.value.data.data || [];
        setSubscribers(Array.isArray(list) ? list : []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        const s = statsRes.value.data.stats || statsRes.value.data.data || statsRes.value.data;
        if (s) {
          setStats({
            totalSubscribers: s.totalSubscribers || s.total || 0,
            active: s.active || 0,
            unsubscribed: s.unsubscribed || 0,
            unconfirmed: s.unconfirmed || 0,
          });
        }
      }
    } catch (err) {
      console.warn('Error loading newsletter data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteSubscriber = (id: string, email: string) => {
    Alert.alert(
      t('admin.deleteSubscriberTitle'),
      t('admin.deleteSubscriberConfirm', { email }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await adminNewsletterApi.deleteSubscriber(id);
              setSubscribers(prev => prev.filter(s => s._id !== id));
            } catch (err: any) {
              Alert.alert(t('common.error'), err.response?.data?.message || t('admin.failedDeleteSubscriber'));
            }
          },
        },
      ]
    );
  };

  const handleSendCampaign = async (isTest: boolean) => {
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      Alert.alert(t('admin.incompleteCampaignTitle'), t('admin.incompleteCampaignMsg'));
      return;
    }

    if (isTest && !testEmail.trim()) {
      Alert.alert(t('admin.missingTestEmailTitle'), t('admin.missingTestEmailMsg'));
      return;
    }

    setIsSending(true);
    try {
      await adminNewsletterApi.sendCampaign({
        subject: campaignSubject,
        title: campaignTitle || campaignSubject,
        body: campaignBody,
        isTest,
        testEmail: isTest ? testEmail.trim() : undefined,
      });

      Alert.alert(
        t('common.success'),
        isTest ? t('admin.testCampaignSent', { email: testEmail }) : t('admin.broadcastSuccessMsg')
      );
      if (!isTest) {
        setCampaignSubject('');
        setCampaignTitle('');
        setCampaignBody('');
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('admin.failedSendCampaign'));
    } finally {
      setIsSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.email.toLowerCase().includes(q) || (s.source && s.source.toLowerCase().includes(q));
    }
    return true;
  });

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return t('admin.recentDate');
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: themeColors.sidebarBg, borderBottomColor: themeColors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.screenTitle, { color: themeColors.textPrimary }]}>{t('admin.newsletterAndSubscribers')}</Text>
          <Text style={[styles.screenSub, { color: themeColors.textSecondary }]}>
            {t('admin.audienceManagementSub')}
          </Text>
        </View>

        <TouchableOpacity onPress={loadData} style={[styles.refreshBtn, { borderColor: themeColors.border }]}>
          <RefreshCw size={14} color={refreshing ? AdminColors.primary : themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.modeTabsRow, { backgroundColor: themeColors.sidebarBg, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('subscribers')}
          style={[styles.modeTab, activeTab === 'subscribers' && styles.modeTabActive]}
        >
          <Users size={14} color={activeTab === 'subscribers' ? AdminColors.primary : themeColors.textSecondary} />
          <Text style={[styles.modeTabText, activeTab === 'subscribers' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
            {t('admin.subscribersTab', { count: subscribers.length })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('compose')}
          style={[styles.modeTab, activeTab === 'compose' && styles.modeTabActive]}
        >
          <Send size={14} color={activeTab === 'compose' ? AdminColors.primary : themeColors.textSecondary} />
          <Text style={[styles.modeTabText, activeTab === 'compose' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
            {t('admin.composeCampaignTab')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: themeColors.textSecondary }]} numberOfLines={2} adjustsFontSizeToFit>
                {t('admin.totalKpi')}
              </Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Mail size={13} color="#2563EB" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: themeColors.textPrimary }]}>{stats.totalSubscribers || subscribers.length}</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: themeColors.textSecondary }]} numberOfLines={2} adjustsFontSizeToFit>
                {t('admin.activeKpi')}
              </Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                <UserCheck size={13} color="#059669" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {stats.active || subscribers.filter(s => s.status === 'active').length}
            </Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: themeColors.textSecondary }]} numberOfLines={2} adjustsFontSizeToFit>
                {t('admin.unconfirmedKpi')}
              </Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                <AlertCircle size={13} color="#D97706" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#D97706' }]}>
              {stats.unconfirmed || subscribers.filter(s => s.status === 'unconfirmed').length}
            </Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: themeColors.textSecondary }]} numberOfLines={2} adjustsFontSizeToFit>
                {t('admin.unsubscribedKpi')}
              </Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FEF2F2' }]}>
                <UserX size={13} color="#EF4444" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#EF4444' }]}>
              {stats.unsubscribed || subscribers.filter(s => s.status === 'unsubscribed').length}
            </Text>
          </View>
        </View>

        {activeTab === 'subscribers' ? (
          <View style={{ gap: Spacing.md }}>
            {/* Filter Bar */}
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              {/* Search */}
              <View style={[styles.searchWrap, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <Search size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('admin.searchSubscriberPlaceholder')}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                />
              </View>

              {/* Status Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {[
                  { label: t('admin.all'), value: 'all' },
                  { label: t('admin.activeKpi'), value: 'active' },
                  { label: t('admin.unconfirmedKpi'), value: 'unconfirmed' },
                  { label: t('admin.unsubscribedKpi'), value: 'unsubscribed' },
                ].map(item => {
                  const active = statusFilter === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setStatusFilter(item.value)}
                      style={[
                        styles.chip,
                        active
                          ? { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary }
                          : { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' },
                      ]}
                    >
                      <Text style={[styles.chipText, active ? { color: '#FFFFFF', fontWeight: '700' } : { color: isDark ? '#D1D5DB' : '#374151' }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Subscriber List */}
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                {t('admin.subscribersDirectory', { count: filteredSubscribers.length })}
              </Text>

              {filteredSubscribers.length === 0 ? (
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <Mail size={32} color={isDark ? '#4B5563' : '#9CA3AF'} />
                  <Text style={{ marginTop: 8, fontSize: 12, color: themeColors.textSecondary }}>
                    {t('admin.noSubscribersMatch')}
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 10, gap: 8 }}>
                  {filteredSubscribers.map(sub => (
                    <View
                      key={sub._id}
                      style={[
                        styles.subCard,
                        { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' },
                      ]}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.subEmail, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                          {sub.email}
                        </Text>
                        <Text style={[styles.subDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {t('admin.subscriberSourceInfo', { 
                            source: sub.source || t('admin.websiteSource'), 
                            date: formatShortDate(sub.subscribedAt) 
                          })}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View
                          style={[
                            styles.statusPill,
                            sub.status === 'active'
                              ? { backgroundColor: '#ECFDF5' }
                              : sub.status === 'unconfirmed'
                              ? { backgroundColor: '#FFFBEB' }
                              : { backgroundColor: '#FEF2F2' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              sub.status === 'active'
                                ? { color: '#059669' }
                                : sub.status === 'unconfirmed'
                                ? { color: '#D97706' }
                                : { color: '#EF4444' },
                            ]}
                          >
                            {sub.status === 'active' 
                              ? t('admin.activeKpi').toUpperCase() 
                              : sub.status === 'unconfirmed' 
                              ? t('admin.unconfirmedKpi').toUpperCase() 
                              : t('admin.unsubscribedKpi').toUpperCase()}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleDeleteSubscriber(sub._id, sub.email)}
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Compose Campaign Mode */
          <View style={{ gap: Spacing.md }}>
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>{t('admin.broadcastNewsletterTitle')}</Text>
              <Text style={[styles.cardSub, { color: themeColors.textSecondary }]}>
                {t('admin.broadcastNewsletterSub')}
              </Text>

              <View style={{ marginTop: 14, gap: 10 }}>
                <View>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>{t('admin.emailSubjectLabel')}</Text>
                  <TextInput
                    value={campaignSubject}
                    onChangeText={setCampaignSubject}
                    placeholder={t('admin.emailSubjectPlaceholder')}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    style={[styles.textInput, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#111827' }]}
                  />
                </View>

                <View>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>{t('admin.campaignTitleLabel')}</Text>
                  <TextInput
                    value={campaignTitle}
                    onChangeText={setCampaignTitle}
                    placeholder={t('admin.campaignTitlePlaceholder')}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    style={[styles.textInput, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#111827' }]}
                  />
                </View>

                <View>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>{t('admin.campaignBodyLabel')}</Text>
                  <TextInput
                    value={campaignBody}
                    onChangeText={setCampaignBody}
                    placeholder={t('admin.campaignBodyPlaceholder')}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    multiline
                    numberOfLines={5}
                    style={[styles.textInput, styles.textArea, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#111827' }]}
                  />
                </View>
              </View>

              {/* Test Email Row */}
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#E5E7EB' }}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>{t('admin.sendTestEmailLabel')}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TextInput
                    value={testEmail}
                    onChangeText={setTestEmail}
                    placeholder={t('admin.testEmailPlaceholder')}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    style={[styles.textInput, { flex: 1, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#111827' }]}
                  />
                  <TouchableOpacity
                    onPress={() => handleSendCampaign(true)}
                    disabled={isSending}
                    style={[styles.testSendBtn, { borderColor: themeColors.border }]}
                  >
                    <Text style={[styles.testSendBtnText, { color: themeColors.textPrimary }]}>{t('admin.sendTestBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Broadcast Button */}
              <TouchableOpacity
                onPress={() => handleSendCampaign(false)}
                disabled={isSending}
                style={[styles.broadcastBtn, { opacity: isSending ? 0.7 : 1 }]}
              >
                {isSending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <View style={styles.btnIconBox}>
                      <Send size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.broadcastBtnText}>{t('admin.broadcastToAllBtn')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  screenSub: {
    fontSize: 11,
    marginTop: 1,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },

  modeTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabActive: {
    borderBottomColor: AdminColors.primary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  kpiLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  kpiIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },

  sectionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  subCard: {
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subEmail: {
    fontSize: 12,
    fontWeight: '700',
  },
  subDate: {
    fontSize: 10,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 12,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  testSendBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  testSendBtnText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  broadcastBtn: {
    marginTop: 16,
    backgroundColor: AdminColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  btnIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  broadcastBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    flexShrink: 1,
  },
});
