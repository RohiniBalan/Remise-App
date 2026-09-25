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

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function AdminDeliveryPartnersScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);
  const styles = useMemo(() => getStyles(themeColors, isDark), [themeColors, isDark]);

  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPartners = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminDeliveryPartnerApi.getAll(filter || undefined);
      const data = res.data?.data || res.data || [];
      setPartners(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Failed to load delivery partners:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to load delivery partners.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAction = (id: string, name: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND') => {
    const actionLabel = action === 'APPROVE' ? 'Approve' : action === 'REJECT' ? 'Reject' : 'Suspend';
    Alert.alert(
      `${actionLabel} Delivery Partner`,
      `Are you sure you want to ${actionLabel.toLowerCase()} "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: action === 'APPROVE' ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(id + action);
            try {
              const res = await adminDeliveryPartnerApi.performAction(id, action);
              if (res.data?.success !== false) {
                Alert.alert('Success', res.data?.message || `Partner ${actionLabel.toLowerCase()}d successfully.`);
                fetchPartners();
              } else {
                Alert.alert('Error', res.data?.message || `Failed to ${actionLabel.toLowerCase()} partner.`);
              }
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || `Failed to ${actionLabel.toLowerCase()} partner.`);
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
          label: 'Approved',
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
          text: isDark ? '#F87171' : '#B91C1C',
          border: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
          label: 'Rejected',
          icon: XCircle,
        };
      case 'SUSPENDED':
        return {
          bg: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6',
          text: isDark ? '#9CA3AF' : '#4B5563',
          border: isDark ? 'rgba(156, 163, 175, 0.4)' : '#E5E7EB',
          label: 'Suspended',
          icon: PauseCircle,
        };
      case 'PENDING':
      default:
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
          text: isDark ? '#FBBF24' : '#B45309',
          border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#FDE68A',
          label: 'Pending',
          icon: Clock,
        };
    }
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

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* ── Top Bar: Search & Refresh ── */}
      <View style={[styles.searchBarContainer, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: isDark ? '#1f2937' : '#f8fafc', borderColor: themeColors.border }]}>
          <Search size={18} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search by name, email, phone, vehicle..."
            placeholderTextColor={themeColors.placeholder}
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
          {FILTER_TABS.map(tab => {
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
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <CheckCircle2 size={16} color="#10B981" />
          </View>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{counts.APPROVED}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Approved</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
            <Bike size={16} color="#3B82F6" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>{counts.TOTAL}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total</Text>
        </View>
      </View>

      {/* ── Main List ── */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading delivery partners...
          </Text>
        </View>
      ) : filteredPartners.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPartners(true)} tintColor={AdminColors.primary} />}
        >
          <Bike size={48} color={themeColors.textMuted} />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Delivery Partners Found</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            {search ? 'Try adjusting your search criteria.' : 'No partner applications match the selected status filter.'}
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
                        {partner.fullname || 'Unnamed Partner'}
                      </Text>
                      <View style={styles.roleTagRow}>
                        <Text style={[styles.partnerRoleText, { color: themeColors.textSecondary }]}>
                          Delivery Partner
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
                              {isAvailable ? 'Online' : 'Offline'}
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
                      {partner.email || 'No email provided'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color={themeColors.textSecondary} />
                    <Text style={[styles.detailText, { color: themeColors.textPrimary }]}>
                      {partner.mobilenumber || 'No phone provided'}
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
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]}>Vehicle</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]} numberOfLines={1}>
                      {dp.vehicleType || 'Bike'} · {dp.vehicleNumber || 'N/A'}
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: themeColors.border }]}>
                    <Package size={14} color="#10B981" />
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]}>Deliveries</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]}>
                      {dp.completedDeliveries || 0} completed
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: isDark ? '#111827' : '#f8fafc', borderColor: themeColors.border }]}>
                    <DollarSign size={14} color="#F59E0B" />
                    <Text style={[styles.statBoxLabel, { color: themeColors.textSecondary }]}>Earnings</Text>
                    <Text style={[styles.statBoxValue, { color: themeColors.textPrimary }]}>
                      ₹{(dp.earnings || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* ── Dates ── */}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: themeColors.textMuted }]}>
                    Applied: {dp.appliedAt ? new Date(dp.appliedAt).toLocaleDateString() : 'N/A'}
                  </Text>
                  {dp.approvedAt && (
                    <Text style={[styles.metaText, { color: themeColors.textMuted }]}>
                      Approved: {new Date(dp.approvedAt).toLocaleDateString()}
                    </Text>
                  )}
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
                            <Text style={styles.approveBtnText}>Approve</Text>
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
                            <Text style={[styles.rejectBtnText, { color: '#EF4444' }]}>Reject</Text>
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
                          <Text style={[styles.suspendBtnText, { color: '#F59E0B' }]}>Suspend Partner</Text>
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
                          <Text style={styles.approveBtnText}>Re-activate Partner</Text>
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
                          <Text style={styles.approveBtnText}>Approve Application</Text>
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
      paddingHorizontal: Spacing.sm,
      height: 40,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: FontSizes.sm,
      paddingVertical: 0,
    },
    refreshButton: {
      width: 40,
      height: 40,
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
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
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
      textTransform: 'uppercase',
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
      alignItems: 'flex-start',
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      marginRight: 8,
    },
    avatarBox: {
      width: 42,
      height: 42,
      borderRadius: BorderRadius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: FontSizes.md,
      fontWeight: '700',
    },
    partnerInfo: {
      flex: 1,
    },
    partnerName: {
      fontSize: FontSizes.md,
      fontWeight: '700',
    },
    roleTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
      paddingVertical: 4,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      gap: 4,
    },
    statusBadgeText: {
      fontSize: 11,
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
    },
    metaText: {
      fontSize: 10,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    actionBtn: {
      flex: 1,
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
