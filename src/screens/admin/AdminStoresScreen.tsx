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
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Store,
  Search,
  RotateCcw,
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Eye,
  AlertTriangle,
  X,
  CreditCard,
  FileText,
  Send,
  Calendar,
  Check,
  Edit,
  Copy,
} from 'lucide-react-native';
import { adminStoreApi } from '../../api/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { getAdminColors, AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreRegistrationItem {
  _id: string;
  name: string;
  storeType?: 'store' | 'whole_saler' | 'home_business';
  ownerId?: {
    _id?: string;
    fullname?: string;
    email?: string;
    phone?: string;
  } | string;
  ownerName?: string;
  phone: string;
  email: string;
  category?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    maskedAccountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  bankAccount?: {
    beneficiaryName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  businessDetails?: {
    legalBusinessName?: string;
    businessType?: string;
    pan?: string;
    gstin?: string;
    aadhaar?: string;
    fssaiNumber?: string;
    bankAccount?: {
      accountNumber?: string;
      ifscCode?: string;
      beneficiaryName?: string;
    };
  };
  upiId?: string;
  pan?: string;
  gstin?: string;
  fssai?: string;
  fssaiNumber?: string;
  aadhaar?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  kycStatus?: string;
  razorpayRoute?: {
    accountId?: string;
    status?: string;
    activatedAt?: string;
    failureReason?: string;
  };
  razorpayAccountId?: string | null;
  razorpayRouteStatus?: string;
  registrationEmailNotification?: {
    sent?: boolean;
    status: 'pending' | 'sent' | 'failed';
    sentTo?: string;
    recipient?: string;
    sentAt?: string;
    lastAttemptAt?: string;
    attempts?: number;
    error?: string;
  };
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

export default function AdminStoresScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);

  const [stores, setStores] = useState<StoreRegistrationItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    store: 0,
    whole_saler: 0,
    home_business: 0,
    routeActive: 0,
    emailSent: 0,
    emailFailed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'store' | 'whole_saler' | 'home_business'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'verified'>('all');

  // Detail Modal States
  const [selectedStore, setSelectedStore] = useState<StoreRegistrationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bank' | 'kyc' | 'route_email'>('overview');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchStores = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      // First try registrations API which has comprehensive bank/route data
      const res = await adminStoreApi.getRegistrations({
        search: searchTerm || undefined,
        storeType: typeFilter !== 'all' ? typeFilter : undefined,
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setStores(res.data.data);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        // Fallback to getAll
        const altRes = await adminStoreApi.getAll();
        const altData = altRes.data?.data || altRes.data;
        if (Array.isArray(altData)) {
          setStores(altData);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch stores:', err);
      // Fallback to getAll
      try {
        const altRes = await adminStoreApi.getAll();
        const altData = altRes.data?.data || altRes.data;
        if (Array.isArray(altData)) {
          setStores(altData);
        }
      } catch (e) {
        Alert.alert('Error', 'Unable to fetch stores. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStores(true);
  };

  const handleOpenDetail = async (id: string) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setActiveTab('overview');
    try {
      const res = await adminStoreApi.getRegistrationById(id);
      if (res.data?.success && res.data.data) {
        setSelectedStore(res.data.data);
      } else {
        // Fallback to finding from list
        const found = stores.find((s) => s._id === id);
        if (found) setSelectedStore(found);
      }
    } catch (err: any) {
      const found = stores.find((s) => s._id === id);
      if (found) {
        setSelectedStore(found);
      } else {
        Alert.alert('Error', err?.response?.data?.message || 'Failed to load details');
        setIsDetailOpen(false);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleVerification = async (store: StoreRegistrationItem) => {
    try {
      const newStatus = !store.isVerified;
      const res = await adminStoreApi.toggleVerify(store._id, newStatus);
      if (res.data?.success) {
        Alert.alert('Success', `Store ${newStatus ? 'verified' : 'unverified'} successfully!`);
        setStores((prev) => prev.map((s) => (s._id === store._id ? { ...s, isVerified: newStatus } : s)));
        if (selectedStore?._id === store._id) {
          setSelectedStore((prev) => (prev ? { ...prev, isVerified: newStatus } : null));
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleUpdateStatus = async (store: StoreRegistrationItem, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const isActive = newStatus === 'active';
      const res = await adminStoreApi.updateStatus(store._id, newStatus, isActive);
      if (res.data?.success) {
        Alert.alert('Success', `Store status changed to ${newStatus}!`);
        setStores((prev) => prev.map((s) => (s._id === store._id ? { ...s, isActive } : s)));
        if (selectedStore?._id === store._id) {
          setSelectedStore((prev) => (prev ? { ...prev, isActive } : null));
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResendEmail = async (id: string, storeName: string) => {
    Alert.alert(
      'Resend Registration Email',
      `Send full store registration & bank details for "${storeName}" to porulontechnologies@gmail.com?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            setResendingId(id);
            try {
              const res = await adminStoreApi.resendRegistrationEmail(id);
              if (res.data?.success) {
                Alert.alert('Success', res.data.message || 'Notification email sent successfully');
                fetchStores(true);
                if (selectedStore && selectedStore._id === id) {
                  const updated = await adminStoreApi.getRegistrationById(id);
                  if (updated.data?.success) {
                    setSelectedStore(updated.data.data);
                  }
                }
              }
            } catch (err: any) {
              Alert.alert('Failed', err?.response?.data?.message || 'Could not send email');
            } finally {
              setResendingId(null);
            }
          },
        },
      ]
    );
  };

  // Filter list by status client-side
  const filteredStores = useMemo(() => {
    return stores.filter((item) => {
      const q = searchTerm.toLowerCase();
      const owner = typeof item.ownerId === 'object' ? item.ownerId?.fullname || '' : item.ownerName || '';
      const matchesSearch =
        (item.name || '').toLowerCase().includes(q) ||
        owner.toLowerCase().includes(q) ||
        (item.phone || '').includes(searchTerm) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.address?.city || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (typeFilter !== 'all') {
        const st = item.storeType || 'store';
        if (st !== typeFilter) return false;
      }

      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;
      if (statusFilter === 'verified' && !item.isVerified) return false;

      return true;
    });
  }, [stores, searchTerm, typeFilter, statusFilter]);

  const getStoreTypeBadge = (type?: string) => {
    switch (type) {
      case 'whole_saler':
        return { label: 'Wholesaler', bg: '#EDE9FE', color: '#6D28D9' };
      case 'home_business':
        return { label: 'Home Business', bg: '#FCE7F3', color: '#BE185D' };
      default:
        return { label: 'Store Owner', bg: '#E0F2FE', color: '#0369A1' };
    }
  };

  const getEmailBadge = (emailInfo?: StoreRegistrationItem['registrationEmailNotification']) => {
    if (emailInfo?.status === 'sent' || emailInfo?.sent) {
      return { label: 'Email Sent', bg: '#DCFCE7', color: '#15803D', icon: CheckCircle2 };
    }
    if (emailInfo?.status === 'failed') {
      return { label: 'Email Failed', bg: '#FEE2E2', color: '#B91C1C', icon: XCircle };
    }
    return { label: 'Email Pending', bg: '#FEF3C7', color: '#B45309', icon: AlertTriangle };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Search & Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: 'transparent', borderColor: 'transparent', borderBottomWidth: 0 }]}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Search size={18} color={themeColors.textMuted} />
          <TextInput
            placeholder="Search store, owner, email, phone..."
            placeholderTextColor={themeColors.textMuted}
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            selectionColor={AdminColors.primary}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Store Type Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {[
            { key: 'all', label: 'All Types' },
            { key: 'store', label: 'Store Owner' },
            { key: 'whole_saler', label: 'Wholesaler' },
            { key: 'home_business', label: 'Home Business' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setTypeFilter(chip.key as any)}
              style={[
                styles.chip,
                { borderColor: themeColors.border, backgroundColor: themeColors.bg },
                typeFilter === chip.key && { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isDark ? '#FFFFFF' : themeColors.textSecondary },
                  typeFilter === chip.key && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Status Filter Chips */}
          <TouchableOpacity
            onPress={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            style={[
              styles.chip,
              { borderColor: themeColors.border, backgroundColor: themeColors.bg },
              statusFilter === 'active' && { backgroundColor: '#10B981', borderColor: '#10B981' },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isDark ? '#FFFFFF' : themeColors.textSecondary },
                statusFilter === 'active' && { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStatusFilter(statusFilter === 'verified' ? 'all' : 'verified')}
            style={[
              styles.chip,
              { borderColor: themeColors.border, backgroundColor: themeColors.bg },
              statusFilter === 'verified' && { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isDark ? '#FFFFFF' : themeColors.textSecondary },
                statusFilter === 'verified' && { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              Verified
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* KPI Stats Strip */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: AdminColors.primary }]}>{stores.length}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total Stores</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: '#10B981' }]}>{stores.filter((s) => s.isActive).length}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: '#8B5CF6' }]}>{stores.filter((s) => s.isVerified).length}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Verified</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: stats.emailSent > 0 ? '#10B981' : themeColors.textPrimary }]}>
            {stats.emailSent || stores.filter((s) => s.registrationEmailNotification?.status === 'sent' || s.registrationEmailNotification?.sent).length}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Notified</Text>
        </View>
      </View>

      {/* Stores List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading stores...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredStores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Store size={48} color={themeColors.textMuted} />
              <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Stores Found</Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textMuted }]}>
                Try adjusting your search query or filters.
              </Text>
            </View>
          ) : (
            filteredStores.map((item) => {
              const typeBadge = getStoreTypeBadge(item.storeType);
              const emailBadge = getEmailBadge(item.registrationEmailNotification);
              const EmailIcon = emailBadge.icon;
              const ownerName =
                typeof item.ownerId === 'object' && item.ownerId?.fullname
                  ? item.ownerId.fullname
                  : item.ownerName || '—';

              const bankAccDisplay =
                item.bankDetails?.maskedAccountNumber ||
                (item.bankDetails?.accountNumber
                  ? `•••• ${item.bankDetails.accountNumber.slice(-4)}`
                  : item.bankAccount?.accountNumber
                  ? `•••• ${item.bankAccount.accountNumber.slice(-4)}`
                  : item.businessDetails?.bankAccount?.accountNumber
                  ? `•••• ${item.businessDetails.bankAccount.accountNumber.slice(-4)}`
                  : '—');

              const ifscDisplay =
                item.bankDetails?.ifscCode ||
                item.bankAccount?.ifscCode ||
                item.businessDetails?.bankAccount?.ifscCode ||
                '—';

              const kycStatusDisplay =
                item.kycStatus || (item.isVerified ? 'VERIFIED' : 'PENDING');

              return (
                <View
                  key={item._id}
                  style={[styles.regCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.storeTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.isVerified && <ShieldCheck size={16} color="#10B981" />}
                      </View>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: typeBadge.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: typeBadge.color }]}>{typeBadge.label}</Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: emailBadge.bg }]}>
                          <EmailIcon size={12} color={emailBadge.color} style={{ marginRight: 4 }} />
                          <Text style={[styles.typeBadgeText, { color: emailBadge.color }]}>{emailBadge.label}</Text>
                        </View>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: item.isActive ? '#DCFCE7' : '#FEE2E2' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              { color: item.isActive ? '#15803D' : '#B91C1C' },
                            ]}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  {/* Info Rows */}
                  <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.infoRow}>
                      <Building2 size={14} color={themeColors.textMuted} />
                      <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Owner:</Text>
                      <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={1}>
                        {ownerName}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Mail size={14} color={themeColors.textMuted} />
                      <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Email:</Text>
                      <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Phone size={14} color={themeColors.textMuted} />
                      <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Phone:</Text>
                      <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>{item.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <ShieldCheck size={14} color={themeColors.textMuted} />
                      <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>KYC Status:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          {
                            color:
                              kycStatusDisplay === 'VERIFIED' || item.isVerified
                                ? '#10B981'
                                : '#F59E0B',
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {kycStatusDisplay}
                      </Text>
                    </View>
                  </View>

                  {/* Card Actions */}
                  <View style={[styles.cardActions, { borderTopColor: themeColors.border }]}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: AdminColors.primary }]}
                      onPress={() => handleOpenDetail(item._id)}
                      activeOpacity={0.8}
                    >
                      <Eye size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Full Store & Bank Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtnOutline,
                        { borderColor: themeColors.border, backgroundColor: themeColors.bg },
                      ]}
                      onPress={() => handleResendEmail(item._id, item.name)}
                      disabled={resendingId === item._id}
                      activeOpacity={0.7}
                    >
                      {resendingId === item._id ? (
                        <ActivityIndicator size="small" color={AdminColors.primary} />
                      ) : (
                        <>
                          <Send size={14} color={themeColors.textPrimary} />
                          <Text style={[styles.actionBtnOutlineText, { color: themeColors.textPrimary }]}>
                            Resend Email
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Full Details Modal */}
      <Modal visible={isDetailOpen} transparent animationType="slide" onRequestClose={() => setIsDetailOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {selectedStore?.name || 'Store & Registration Details'}
                </Text>
                <Text style={[styles.modalSub, { color: themeColors.textMuted }]}>
                  Registered on {formatDate(selectedStore?.createdAt)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsDetailOpen(false)} style={styles.closeBtn}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingDetail ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={AdminColors.primary} />
                <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading full details...</Text>
              </View>
            ) : selectedStore ? (
              <>
                {/* Modal Navigation Tabs */}
                <View style={[styles.modalTabs, { borderBottomColor: themeColors.border }]}>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'bank', label: 'Bank Details' },
                    { key: 'kyc', label: 'KYC & Tax' },
                    { key: 'route_email', label: 'Route & Email' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setActiveTab(t.key as any)}
                      style={[
                        styles.modalTabItem,
                        activeTab === t.key && [styles.modalTabItemActive, { borderBottomColor: AdminColors.primary }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalTabItemText,
                          { color: themeColors.textSecondary },
                          activeTab === t.key && { color: AdminColors.primary, fontWeight: '700' },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tab Contents */}
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {activeTab === 'overview' && (
                    <View style={styles.tabSection}>
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Store Information</Text>
                        <DetailField label="Store Name" value={selectedStore.name} theme={themeColors} />
                        <DetailField
                          label="Store Type"
                          value={getStoreTypeBadge(selectedStore.storeType).label}
                          theme={themeColors}
                        />
                        <DetailField label="Category" value={selectedStore.category || 'General'} theme={themeColors} />
                        <DetailField
                          label="Description"
                          value={selectedStore.description || '—'}
                          theme={themeColors}
                        />
                      </View>

                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Owner & Contact</Text>
                        <DetailField
                          label="Owner Name"
                          value={
                            typeof selectedStore.ownerId === 'object' && selectedStore.ownerId?.fullname
                              ? selectedStore.ownerId.fullname
                              : selectedStore.ownerName || '—'
                          }
                          theme={themeColors}
                        />
                        <DetailField label="Email" value={selectedStore.email} theme={themeColors} />
                        <DetailField label="Phone" value={selectedStore.phone} theme={themeColors} />
                      </View>

                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Address</Text>
                        <DetailField
                          label="Street"
                          value={selectedStore.address?.street || '—'}
                          theme={themeColors}
                        />
                        <DetailField
                          label="City / State"
                          value={`${selectedStore.address?.city || '—'}, ${selectedStore.address?.state || '—'}`}
                          theme={themeColors}
                        />
                        <DetailField
                          label="PIN / Country"
                          value={`${selectedStore.address?.pinCode || '—'}, ${selectedStore.address?.country || 'India'}`}
                          theme={themeColors}
                        />
                      </View>

                      {/* Admin Actions Box */}
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Store Status Controls</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              { backgroundColor: selectedStore.isVerified ? '#FEF2F2' : '#F0FDF4', borderColor: selectedStore.isVerified ? '#EF4444' : '#10B981' },
                            ]}
                            onPress={() => handleToggleVerification(selectedStore)}
                          >
                            <ShieldCheck size={16} color={selectedStore.isVerified ? '#DC2626' : '#16A34A'} />
                            <Text style={{ color: selectedStore.isVerified ? '#DC2626' : '#16A34A', fontWeight: '600', fontSize: 12 }}>
                              {selectedStore.isVerified ? 'Revoke Verification' : 'Verify Store'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              { backgroundColor: selectedStore.isActive ? '#FFFBEB' : '#ECFDF5', borderColor: selectedStore.isActive ? '#F59E0B' : '#10B981' },
                            ]}
                            onPress={() => handleUpdateStatus(selectedStore, selectedStore.isActive ? 'inactive' : 'active')}
                          >
                            <CheckCircle2 size={16} color={selectedStore.isActive ? '#D97706' : '#10B981'} />
                            <Text style={{ color: selectedStore.isActive ? '#D97706' : '#10B981', fontWeight: '600', fontSize: 12 }}>
                              {selectedStore.isActive ? 'Deactivate Store' : 'Activate Store'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  {activeTab === 'bank' && (
                    <View style={styles.tabSection}>
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          Settlement Bank Account
                        </Text>
                        <DetailField
                          label="Account Holder Name"
                          value={
                            selectedStore.bankDetails?.accountHolderName ||
                            selectedStore.bankAccount?.beneficiaryName ||
                            selectedStore.businessDetails?.bankAccount?.beneficiaryName ||
                            selectedStore.ownerName ||
                            '—'
                          }
                          theme={themeColors}
                        />
                        <DetailField
                          label="Account Number"
                          value={
                            selectedStore.bankDetails?.accountNumber ||
                            selectedStore.bankDetails?.maskedAccountNumber ||
                            selectedStore.bankAccount?.accountNumber ||
                            selectedStore.businessDetails?.bankAccount?.accountNumber ||
                            '—'
                          }
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="IFSC Code"
                          value={
                            selectedStore.bankDetails?.ifscCode ||
                            selectedStore.bankAccount?.ifscCode ||
                            selectedStore.businessDetails?.bankAccount?.ifscCode ||
                            '—'
                          }
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="Bank Name"
                          value={selectedStore.bankDetails?.bankName || 'Direct NEFT/RTGS Transfer'}
                          theme={themeColors}
                        />
                        <DetailField
                          label="UPI ID"
                          value={selectedStore.upiId || '—'}
                          theme={themeColors}
                        />
                      </View>
                    </View>
                  )}

                  {activeTab === 'kyc' && (
                    <View style={styles.tabSection}>
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          KYC & Tax Compliance
                        </Text>
                        <DetailField
                          label="PAN Number"
                          value={selectedStore.pan || selectedStore.businessDetails?.pan || '—'}
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="GSTIN Number"
                          value={selectedStore.gstin || selectedStore.businessDetails?.gstin || '—'}
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="Aadhaar Number"
                          value={
                            selectedStore.aadhaar ||
                            selectedStore.aadhaarNumber ||
                            selectedStore.maskedAadhaar ||
                            selectedStore.businessDetails?.aadhaar ||
                            '—'
                          }
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="FSSAI License"
                          value={
                            selectedStore.fssai ||
                            selectedStore.fssaiNumber ||
                            selectedStore.businessDetails?.fssaiNumber ||
                            '—'
                          }
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="Legal Business Name"
                          value={selectedStore.businessDetails?.legalBusinessName || selectedStore.name || '—'}
                          theme={themeColors}
                        />
                        <DetailField
                          label="KYC Status"
                          value={selectedStore.kycStatus || (selectedStore.isVerified ? 'VERIFIED' : 'PENDING')}
                          theme={themeColors}
                        />
                      </View>
                    </View>
                  )}

                  {activeTab === 'route_email' && (
                    <View style={styles.tabSection}>
                      {/* Razorpay Route */}
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Razorpay Route</Text>
                        <DetailField
                          label="Linked Route Account ID"
                          value={selectedStore.razorpayRoute?.accountId || selectedStore.razorpayAccountId || '—'}
                          monospace
                          theme={themeColors}
                        />
                        <DetailField
                          label="Route Status"
                          value={selectedStore.razorpayRoute?.status || selectedStore.razorpayRouteStatus || 'Not Linked'}
                          theme={themeColors}
                        />
                        {selectedStore.razorpayRoute?.activatedAt ? (
                          <DetailField
                            label="Activated At"
                            value={formatDate(selectedStore.razorpayRoute.activatedAt)}
                            theme={themeColors}
                          />
                        ) : null}
                      </View>

                      {/* Registration Email Notification */}
                      <View style={[styles.detailCard, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          Registration Email Notification
                        </Text>
                        <DetailField
                          label="Status"
                          value={
                            selectedStore.registrationEmailNotification?.status?.toUpperCase() ||
                            (selectedStore.registrationEmailNotification?.sent ? 'SENT' : 'PENDING')
                          }
                          theme={themeColors}
                        />
                        <DetailField
                          label="Recipient"
                          value={
                            selectedStore.registrationEmailNotification?.sentTo ||
                            selectedStore.registrationEmailNotification?.recipient ||
                            'porulontechnologies@gmail.com'
                          }
                          theme={themeColors}
                        />
                        <DetailField
                          label="Sent Date"
                          value={formatDate(selectedStore.registrationEmailNotification?.sentAt)}
                          theme={themeColors}
                        />
                        {selectedStore.registrationEmailNotification?.error ? (
                          <DetailField
                            label="Error Reason"
                            value={selectedStore.registrationEmailNotification.error}
                            theme={themeColors}
                          />
                        ) : null}

                        <TouchableOpacity
                          style={[styles.resendBigBtn, { backgroundColor: AdminColors.primary }]}
                          onPress={() => handleResendEmail(selectedStore._id, selectedStore.name)}
                          disabled={resendingId === selectedStore._id}
                        >
                          {resendingId === selectedStore._id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Send size={16} color="#FFFFFF" />
                              <Text style={styles.resendBigBtnText}>Resend Email Notification Now</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailField({
  label,
  value,
  monospace,
  theme,
}: {
  label: string;
  value: string;
  monospace?: boolean;
  theme: any;
}) {
  return (
    <View style={styles.detailField}>
      <Text style={[styles.detailFieldLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text
        style={[
          styles.detailFieldValue,
          { color: theme.textPrimary },
          monospace && { fontFamily: 'monospace', letterSpacing: 0.5 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    padding: Spacing.sm,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    paddingVertical: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  listContainer: {
    padding: Spacing.sm,
    paddingBottom: 40,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  regCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  detailsGrid: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    width: 75,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '85%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabItemActive: {},
  modalTabItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalBody: {
    flex: 1,
    padding: Spacing.md,
  },
  tabSection: {
    gap: 12,
    paddingBottom: 30,
  },
  detailCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailFieldLabel: {
    fontSize: 12,
    flex: 1,
  },
  detailFieldValue: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  statusActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  resendBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: 12,
    gap: 8,
  },
  resendBigBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
