import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Bike,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Package,
  ShieldCheck,
  ShieldAlert,
  User,
  Filter,
} from 'lucide-react-native';
import { adminDeliveryPartnerApi } from '../../api/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { getAdminColors, AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { useTranslation } from '../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DeliveryPartner = {
  _id: string;
  fullname: string;
  email: string;
  mobilenumber: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  deliveryPartner: {
    applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    availability: string;
    vehicleType: string;
    vehicleNumber: string;
    address: string;
    earnings: number;
    completedDeliveries: number;
    appliedAt: string;
    approvedAt?: string;
  };
};

export default function AdminDeliveryPartnersScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);
  const styles = useMemo(() => getStyles(themeColors, isDark), [themeColors, isDark]);
  const { t, language } = useTranslation();

  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filterTabs = useMemo(() => [
    { value: '', label: t('admin.all') },
    { value: 'PENDING', label: t('admin.pendingFilter') },
    { value: 'APPROVED', label: t('admin.approvedFilter') },
    { value: 'REJECTED', label: t('admin.rejectedFilter') },
    { value: 'SUSPENDED', label: t('admin.suspendedFilter') },
  ], [t]);

  const fetchPartners = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminDeliveryPartnerApi.getAll(filter || undefined);
      const data = res.data?.data || res.data || [];
      setPartners(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Failed to load delivery partners:', err);
      Alert.alert(t('common.error'), err?.response?.data?.message || t('admin.failedToLoadDeliveryPartners'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAction = (id: string, name: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND') => {
    const actionLabel = action === 'APPROVE' ? t('admin.approvePartnerBtn') : action === 'REJECT' ? t('admin.rejectPartnerBtn') : t('admin.suspendPartnerBtn');
    const partnerName = name || t('admin.unnamedPartner');
    Alert.alert(
      t('admin.confirmActionTitle', { action: actionLabel }),
      t('admin.confirmActionMessage', { actionLower: actionLabel.toLowerCase(), name: partnerName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: actionLabel,
          style: action === 'APPROVE' ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(id + action);
            try {
              const res = await adminDeliveryPartnerApi.performAction(id, action);
              if (res.data?.success !== false) {
                Alert.alert(t('common.success'), res.data?.message || t('admin.partnerActionSuccess', { actionLower: actionLabel }));
                fetchPartners();
              } else {
                Alert.alert(t('common.error'), res.data?.message || t('admin.partnerActionFailed', { actionLower: actionLabel }));
              }
            } catch (err: any) {
              Alert.alert(t('common.error'), err?.response?.data?.message || t('admin.partnerActionFailed', { actionLower: actionLabel }));
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const counts = useMemo(() => {
    return {
      TOTAL: partners.length,
      PENDING: partners.filter(p => p.deliveryPartner?.applicationStatus === 'PENDING').length,
      APPROVED: partners.filter(p => p.deliveryPartner?.applicationStatus === 'APPROVED').length,
      REJECTED: partners.filter(p => p.deliveryPartner?.applicationStatus === 'REJECTED').length,
      SUSPENDED: partners.filter(p => p.deliveryPartner?.applicationStatus === 'SUSPENDED').length,
    };
  }, [partners]);

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.fullname?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.mobilenumber?.includes(q) ||
        p.deliveryPartner?.vehicleNumber?.toLowerCase().includes(q) ||
        p.deliveryPartner?.vehicleType?.toLowerCase().includes(q) ||
        p.deliveryPartner?.address?.toLowerCase().includes(q)
      );
    });
  }, [partners, search]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7',
          text: isDark ? '#34D399' : '#15803D',
          border: isDark ? 'rgba(52, 211, 153, 0.4)' : '#BBF7D0',
          label: t('admin.approvedFilter'),
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
          text: isDark ? '#F87171' : '#B91C1C',
          border: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
          label: t('admin.rejectedFilter'),
          icon: XCircle,
        };
      case 'SUSPENDED':
        return {
          bg: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6',
          text: isDark ? '#9CA3AF' : '#4B5563',
          border: isDark ? 'rgba(156, 163, 175, 0.4)' : '#E5E7EB',
          label: t('admin.suspendedFilter'),
          icon: PauseCircle,
        };
      case 'PENDING':
      default:
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
          text: isDark ? '#FBBF24' : '#B45309',
          border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#FDE68A',
          label: t('admin.pendingFilter'),
          icon: Clock,
        };
    }
  };

  const translateVehicle = (type?: string) => {
    if (!type) return t('admin.vehicleBike');
    const lower = type.toLowerCase();
    if (lower.includes('scooter')) return t('admin.vehicleScooter');
    if (lower.includes('bicycle') || lower.includes('cycle')) return t('admin.vehicleBicycle');
    if (lower.includes('car')) return t('admin.vehicleCar');
    if (lower.includes('van')) return t('admin.vehicleVan');
    if (lower.includes('auto')) return t('admin.vehicleAuto');
    if (lower.includes('bike')) return t('admin.vehicleBike');
    return type;
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'DP';
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* ── Top Bar: Search & Refresh ── */}
      <View style={[styles.searchBarContainer, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: isDark ? '#1f2937' : '#f8fafc', borderColor: themeColors.border }]}>
          <Search size={18} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder={t('admin.searchDeliveryPartnersPlaceholder')}
            placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <XCircle size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: isDark ? '#1f2937' : '#f8fafc', borderColor: themeColors.border }]}
          onPress={() => fetchPartners(true)}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Status Filter Chips ── */}
      <View style={styles.filterScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterTabs.map(tab => {
            const isSelected = filter === tab.value;
            const count =
              tab.value === ''
                ? counts.TOTAL
                : tab.value === 'PENDING'
                ? counts.PENDING
                : tab.value === 'APPROVED'
                ? counts.APPROVED
                : tab.value === 'REJECTED'
                ? counts.REJECTED
                : counts.SUSPENDED;

            return (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? AdminColors.primary : isDark ? '#1f2937' : '#ffffff',
                    borderColor: isSelected ? AdminColors.primary : themeColors.border,
                  },
                ]}
                onPress={() => setFilter(tab.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#ffffff' : themeColors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.filterChipBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : isDark
                        ? '#374151'
                        : '#e2e8f0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipBadgeText,
                      { color: isSelected ? '#ffffff' : themeColors.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Stat Cards Summary Row ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <Clock size={16} color="#F59E0B" />
          </View>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{counts.PENDING}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            {t('admin.pendingFilter')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <CheckCircle2 size={16} color="#10B981" />
          </View>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{counts.APPROVED}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            {t('admin.approvedFilter')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
            <Bike size={16} color="#3B82F6" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>{counts.TOTAL}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            {t('admin.totalPartners')}
          </Text>
        </View>
      </View>

      {/* ── Main List ── */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            {t('admin.loadingDeliveryPartners')}
          </Text>
        </View>
      ) : filteredPartners.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPartners(true)} tintColor={AdminColors.primary} />}
        >
          <Bike size={48} color={themeColors.textMuted} />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t('admin.noDeliveryPartnersFound')}</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            {search ? t('admin.adjustSearchCriteria') : t('admin.noPartnersMatchFilter')}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPartners(true)} tintColor={AdminColors.primary} />}
        >
          {filteredPartners.map(partner => {
            const dp = partner.deliveryPartner || ({} as any);
            const statusConfig = getStatusBadge(dp.applicationStatus);
            const StatusIcon = statusConfig.icon;
            const isPending = dp.applicationStatus === 'PENDING';
            const isApproved = dp.applicationStatus === 'APPROVED';
            const isSuspended = dp.applicationStatus === 'SUSPENDED';
            const isRejected = dp.applicationStatus === 'REJECTED';
            const isAvailable = dp.availability === 'AVAILABLE';

            return (
              <View
                key={partner._id}
                style={[
                  styles.partnerCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                {/* ── Card Header ── */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.avatarBox, { backgroundColor: isDark ? '#374151' : '#E0E7FF' }]}>
                      <Text style={[styles.avatarText, { color: isDark ? '#93C5FD' : '#4338CA' }]}>
                        {getInitials(partner.fullname, partner.email)}
                      </Text>
                    </View>
                    <View style={styles.partnerInfo}>
                      <Text style={[styles.partnerName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                        {partner.fullname || t('admin.unnamedPartner')}
                      </Text>
                      <View style={styles.roleTagRow}>
                        <Text style={[styles.partnerRoleText, { color: themeColors.textSecondary }]}>
                          {t('admin.deliveryPartnerRole')}
                        </Text>
                        {isApproved && (
                          <View
                            style={[
                              styles.availabilityPill,
                              {
                                backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.availabilityDot,
                                { backgroundColor: isAvailable ? '#10B981' : '#6B7280' },
                              ]}
                            />
                            <Text
                              style={[
                                styles.availabilityText,
                                { color: isAvailable ? '#10B981' : '#6B7280' },
                              ]}
                            >
                              {isAvailable ? t('admin.onlineStatus') : t('admin.offlineStatus')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusConfig.bg,
                        borderColor: statusConfig.border,
                      },
                    ]}
                  >
                    <StatusIcon size={13} color={statusConfig.text} />
                    <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* ── Contact Details ── */}
                <View style={[styles.detailsSection, { borderTopColor: themeColors.border, borderBottomColor: themeColors.border }]}>
                  <View style={styles.detailRow}>
                    <Mail size={14} color={themeColors.textSecondary} />
                    <Text style={[styles.detailText, { color: themeColors.textPrimary }]} numberOfLines={1}>
                      {partner.email || t('admin.noEmailProvided')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color={themeColors.textSecondary} />
                    <Text style={[styles.detailText, { color: themeColors.textPrimary }]}>
                      {partner.mobilenumber || t('admin.noPhoneProvided')}
                    </Text>
                  </View>
                  {dp.address ? (
                    <View style={styles.detailRow}>
                      <MapPin size={14} color={themeColors.textSecondary} />
                      <Text style={[styles.detailText, { color: themeColors.textSecondary }]} numberOfLines={2}>
                        {dp.address}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* ── Vehicle & Delivery Stats ── */}
                <View style={styles.statsGrid}>
                  <View style={[styles.statBox, { backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: themeColors.border }]}>
                    <Bike size={14} color={AdminColors.primary} />
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>{t('admin.vehicleLabel')}</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                      {translateVehicle(dp.vehicleType)} · {dp.vehicleNumber || 'N/A'}
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: themeColors.border }]}>
                    <Package size={14} color="#10B981" />
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>{t('admin.deliveriesLabel')}</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                      {t('admin.deliveriesCompletedCount', { count: dp.completedDeliveries || 0 })}
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: themeColors.border }]}>
                    <DollarSign size={14} color="#F59E0B" />
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>{t('admin.earningsLabel')}</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                      ₹{(dp.earnings || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* ── Dates ── */}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: themeColors.textMuted }]} numberOfLines={1}>
                    {t('admin.appliedDate', { date: formatShortDate(dp.appliedAt) })}
                  </Text>
                  {dp.approvedAt ? (
                    <Text style={[styles.metaText, { color: themeColors.textMuted }]} numberOfLines={1}>
                      {t('admin.approvedDate', { date: formatShortDate(dp.approvedAt) })}
                    </Text>
                  ) : null}
                </View>

                {/* ── Action Buttons ── */}
                <View style={styles.actionRow}>
                  {isPending && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleAction(partner._id, partner.fullname, 'APPROVE')}
                        disabled={!!actionLoading}
                        activeOpacity={0.8}
                      >
                        {actionLoading === partner._id + 'APPROVE' ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <CheckCircle2 size={16} color="#ffffff" />
                            <Text style={styles.approveBtnText}>{t('admin.approvePartnerBtn')}</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn, { borderColor: '#EF4444' }]}
                        onPress={() => handleAction(partner._id, partner.fullname, 'REJECT')}
                        disabled={!!actionLoading}
                        activeOpacity={0.8}
                      >
                        {actionLoading === partner._id + 'REJECT' ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <>
                            <XCircle size={16} color="#EF4444" />
                            <Text style={[styles.rejectBtnText, { color: '#EF4444' }]}>{t('admin.rejectPartnerBtn')}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {isApproved && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.suspendBtn, { borderColor: '#F59E0B' }]}
                      onPress={() => handleAction(partner._id, partner.fullname, 'SUSPEND')}
                      disabled={!!actionLoading}
                      activeOpacity={0.8}
                    >
                      {actionLoading === partner._id + 'SUSPEND' ? (
                        <ActivityIndicator size="small" color="#F59E0B" />
                      ) : (
                        <>
                          <PauseCircle size={16} color="#F59E0B" />
                          <Text style={[styles.suspendBtnText, { color: '#F59E0B' }]}>{t('admin.suspendPartnerBtn')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {isSuspended && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleAction(partner._id, partner.fullname, 'APPROVE')}
                      disabled={!!actionLoading}
                      activeOpacity={0.8}
                    >
                      {actionLoading === partner._id + 'APPROVE' ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} color="#ffffff" />
                          <Text style={styles.approveBtnText}>{t('admin.reactivatePartnerBtn')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {isRejected && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleAction(partner._id, partner.fullname, 'APPROVE')}
                      disabled={!!actionLoading}
                      activeOpacity={0.8}
                    >
                      {actionLoading === partner._id + 'APPROVE' ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} color="#ffffff" />
                          <Text style={styles.approveBtnText}>{t('admin.approveApplicationBtn')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function getStyles(themeColors: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      gap: Spacing.sm,
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      height: '100%',
      paddingVertical: Platform.OS === 'android' ? 2 : 6,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    refreshButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterScrollContainer: {
      paddingVertical: Spacing.xs,
    },
    filterScroll: {
      paddingHorizontal: Spacing.md,
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      gap: 6,
    },
    filterChipText: {
      fontSize: FontSizes.xs,
    },
    filterChipBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: BorderRadius.pill,
    },
    filterChipBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      gap: 8,
    },
    statCard: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: 4,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    statIconBox: {
      padding: 6,
      borderRadius: BorderRadius.sm,
      marginBottom: 2,
    },
    statValue: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },
    listScroll: {
      flex: 1,
    },
    listContent: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    partnerCard: {
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      padding: Spacing.md,
      gap: Spacing.sm,
      ...Shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
      marginRight: 6,
    },
    avatarBox: {
      width: 42,
      height: 42,
      borderRadius: BorderRadius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarText: {
      fontSize: FontSizes.md,
      fontWeight: '700',
    },
    partnerInfo: {
      flex: 1,
      minWidth: 0,
    },
    partnerName: {
      fontSize: FontSizes.md,
      fontWeight: '700',
    },
    roleTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 2,
    },
    partnerRoleText: {
      fontSize: FontSizes.xs,
    },
    availabilityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.pill,
      gap: 4,
    },
    availabilityDot: {
      width: 6,
      height: 6,
      borderRadius: BorderRadius.pill,
    },
    availabilityText: {
      fontSize: 10,
      fontWeight: '700',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      gap: 4,
      flexShrink: 0,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    detailsSection: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      paddingVertical: 8,
      gap: 6,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: FontSizes.xs,
      flex: 1,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 6,
    },
    statBox: {
      flex: 1,
      padding: 8,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      alignItems: 'center',
      gap: 2,
    },
    statBoxLabel: {
      fontSize: 10,
      fontWeight: '500',
    },
    statBoxValue: {
      fontSize: 11,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    metaText: {
      fontSize: 10.5,
      flexShrink: 1,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 6,
      flexWrap: 'wrap',
    },
    actionBtn: {
      flex: 1,
      minWidth: 120,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
      gap: 6,
    },
    approveBtn: {
      backgroundColor: '#10B981',
    },
    approveBtnText: {
      color: '#ffffff',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    rejectBtn: {
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    rejectBtnText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    suspendBtn: {
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    suspendBtnText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: Spacing.sm,
    },
    loadingText: {
      fontSize: FontSizes.sm,
      marginTop: 8,
    },
    emptyTitle: {
      fontSize: FontSizes.lg,
      fontWeight: '700',
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: FontSizes.sm,
      textAlign: 'center',
    },
  });
}
