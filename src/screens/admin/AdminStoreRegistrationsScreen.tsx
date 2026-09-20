import React, { useEffect, useState, useCallback } from 'react';
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
  DollarSign,
  Package,
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
} from 'lucide-react-native';
import { adminStoreApi } from '../../api/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { getAdminColors, AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

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

export default function AdminStoreRegistrationsScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);

  const [registrations, setRegistrations] = useState<StoreRegistrationItem[]>([]);
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'email_failed' | 'no_route'>('all');

  // Detail Modal States
  const [selectedReg, setSelectedReg] = useState<StoreRegistrationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bank' | 'kyc' | 'route_email'>('overview');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await adminStoreApi.getRegistrations({
        search: searchTerm || undefined,
        storeType: typeFilter !== 'all' ? typeFilter : undefined,
      });

      if (res.data?.success) {
        setRegistrations(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch registrations:', err);
      Alert.alert('Error', 'Unable to fetch store registrations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistrations(true);
  };

  const handleOpenDetail = async (id: string) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setActiveTab('overview');
    try {
      const res = await adminStoreApi.getRegistrationById(id);
      if (res.data?.success) {
        setSelectedReg(res.data.data);
      } else {
        Alert.alert('Error', 'Could not load registration details');
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to load details');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResendEmail = async (id: string, storeName: string) => {
    Alert.alert(
      'Resend Email Notification',
      `Send registration details email for "${storeName}" to porulontechnologies@gmail.com?`,
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
                fetchRegistrations(true);
                if (selectedReg && selectedReg._id === id) {
                  const updated = await adminStoreApi.getRegistrationById(id);
                  if (updated.data?.success) {
                    setSelectedReg(updated.data.data);
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
  const filteredList = registrations.filter((item) => {
    if (statusFilter === 'active' && !item.isActive) return false;
    if (statusFilter === 'email_failed' && item.registrationEmailNotification?.status !== 'failed') return false;
    if (statusFilter === 'no_route' && item.razorpayRoute?.status === 'active') return false;
    return true;
  });

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
      {/* Search & Action Bar */}
      <View style={[styles.filterBar, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
          <Search size={18} color={themeColors.textMuted} />
          <TextInput
            placeholder="Search store, owner, email, phone..."
            placeholderTextColor={themeColors.textMuted}
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
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
                  { color: themeColors.textSecondary },
                  typeFilter === chip.key && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* KPI Stats Strip */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: AdminColors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total Stores</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: '#10B981' }]}>{stats.emailSent}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Notified</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: stats.emailFailed > 0 ? '#EF4444' : themeColors.textPrimary }]}>
            {stats.emailFailed}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Email Failed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.statNum, { color: '#8B5CF6' }]}>{stats.routeActive}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Route Linked</Text>
        </View>
      </View>

      {/* Registration List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AdminColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading store registrations...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Building2 size={48} color={themeColors.textMuted} />
              <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Registrations Found</Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textMuted }]}>
                Try adjusting your search query or type filters.
              </Text>
            </View>
          ) : (
            filteredList.map((item) => {
              const typeBadge = getStoreTypeBadge(item.storeType);
              const emailBadge = getEmailBadge(item.registrationEmailNotification);
              const EmailIcon = emailBadge.icon;
              const ownerName =
                typeof item.ownerId === 'object' && item.ownerId?.fullname
                  ? item.ownerId.fullname
                  : item.ownerName || '—';

              return (
                <View
                  key={item._id}
                  style={[styles.regCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.storeTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: typeBadge.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: typeBadge.color }]}>{typeBadge.label}</Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: emailBadge.bg }]}>
                          <EmailIcon size={12} color={emailBadge.color} style={{ marginRight: 4 }} />
                          <Text style={[styles.typeBadgeText, { color: emailBadge.color }]}>{emailBadge.label}</Text>
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
                      <CreditCard size={14} color={themeColors.textMuted} />
                      <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Bank Acc:</Text>
                      <Text style={[styles.infoValue, { color: themeColors.textPrimary, fontFamily: 'monospace' }]}>
                        {item.bankDetails?.maskedAccountNumber || '—'}
                      </Text>
                    </View>

                    {item.maskedAadhaar ? (
                      <View style={styles.infoRow}>
                        <FileText size={14} color={themeColors.textMuted} />
                        <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Aadhaar:</Text>
                        <Text style={[styles.infoValue, { color: themeColors.textPrimary, fontFamily: 'monospace' }]}>
                          {item.maskedAadhaar}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Card Actions */}
                  <View style={[styles.cardActions, { borderTopColor: themeColors.border }]}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: AdminColors.primary }]}
                      onPress={() => handleOpenDetail(item._id)}
                      activeOpacity={0.8}
                    >
                      <Eye size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>View Full Details</Text>
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
                  {selectedReg?.name || 'Registration Details'}
                </Text>
                <Text style={[styles.modalSub, { color: themeColors.textMuted }]}>
                  Registered on {formatDate(selectedReg?.createdAt)}
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
            ) : selectedReg ? (
              <>
                {/* Modal Navigation Tabs */}
                <View style={[styles.modalTabs, { borderBottomColor: themeColors.border }]}>
                  {[
                    { key: 'overview', label: 'Store & Contact' },
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
                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Store Information</Text>
                        <DetailField label="Store Name" value={selectedReg.name} theme={themeColors} />
                        <DetailField
                          label="Store Type"
                          value={getStoreTypeBadge(selectedReg.storeType).label}
                          theme={themeColors}
                        />
                        <DetailField label="Category" value={selectedReg.category || '—'} theme={themeColors} />
                        <DetailField
                          label="Description"
                          value={selectedReg.description || '—'}
                          theme={themeColors}
                        />
                      </View>

                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Owner & Contact</Text>
                        <DetailField
                          label="Owner Name"
                          value={
                            typeof selectedReg.ownerId === 'object' && selectedReg.ownerId?.fullname
                              ? selectedReg.ownerId.fullname
                              : selectedReg.ownerName || '—'
                          }
                          theme={themeColors}
                        />
                        <DetailField label="Email" value={selectedReg.email} theme={themeColors} />
                        <DetailField label="Phone" value={selectedReg.phone} theme={themeColors} />
                      </View>

                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Address</Text>
                        <DetailField
                          label="Street"
                          value={selectedReg.address?.street || '—'}
                          theme={themeColors}
                        />
                        <DetailField
                          label="City / State"
                          value={`${selectedReg.address?.city || '—'}, ${selectedReg.address?.state || '—'}`}
                          theme={themeColors}
                        />
                        <DetailField
                          label="PIN / Country"
                          value={`${selectedReg.address?.pinCode || '—'}, ${selectedReg.address?.country || 'India'}`}
                          theme={themeColors}
                        />
                      </View>
                    </View>
                  )}

                  {activeTab === 'bank' && (
                    <View style={styles.tabSection}>
                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          Settlement Bank Account
                        </Text>
                        <DetailField
                          label="Account Holder Name"
                          value={
                            selectedReg.bankDetails?.accountHolderName ||
                            selectedReg.businessDetails?.bankAccount?.beneficiaryName ||
                            selectedReg.bankAccount?.beneficiaryName ||
                            selectedReg.ownerName ||
                            '—'
                          }
                          theme={themeColors}
                        />
                        <DetailField
                          label="Account Number (Unmasked)"
                          value={
                            selectedReg.bankDetails?.accountNumber ||
                            selectedReg.businessDetails?.bankAccount?.accountNumber ||
                            selectedReg.bankAccount?.accountNumber ||
                            '—'
                          }
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="IFSC Code"
                          value={
                            selectedReg.bankDetails?.ifscCode ||
                            selectedReg.businessDetails?.bankAccount?.ifscCode ||
                            selectedReg.bankAccount?.ifscCode ||
                            '—'
                          }
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="UPI ID"
                          value={selectedReg.upiId || '—'}
                          theme={themeColors}
                        />
                      </View>
                    </View>
                  )}

                  {activeTab === 'kyc' && (
                    <View style={styles.tabSection}>
                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>Identity & Compliance</Text>
                        <DetailField
                          label="PAN Number"
                          value={selectedReg.pan || selectedReg.businessDetails?.pan || '—'}
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="Aadhaar Number (Unmasked)"
                          value={
                            selectedReg.aadhaarNumber ||
                            selectedReg.aadhaar ||
                            selectedReg.businessDetails?.aadhaar ||
                            '—'
                          }
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="GSTIN Number"
                          value={selectedReg.gstin || selectedReg.businessDetails?.gstin || '—'}
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="FSSAI Number"
                          value={
                            selectedReg.fssai ||
                            selectedReg.businessDetails?.fssaiNumber ||
                            selectedReg.fssaiNumber ||
                            '—'
                          }
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="KYC Verification Status"
                          value={selectedReg.kycStatus || (selectedReg.isVerified ? 'VERIFIED' : 'PENDING REVIEW')}
                          theme={themeColors}
                        />
                      </View>
                    </View>
                  )}

                  {activeTab === 'route_email' && (
                    <View style={styles.tabSection}>
                      {/* Email Notification Details */}
                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          Registration Email (porulontechnologies@gmail.com)
                        </Text>
                        <DetailField
                          label="Email Delivery Status"
                          value={selectedReg.registrationEmailNotification?.status?.toUpperCase() || 'PENDING'}
                          theme={themeColors}
                        />
                        <DetailField
                          label="Recipient"
                          value={
                            selectedReg.registrationEmailNotification?.sentTo ||
                            selectedReg.registrationEmailNotification?.recipient ||
                            'porulontechnologies@gmail.com'
                          }
                          theme={themeColors}
                        />
                        <DetailField
                          label="Sent At"
                          value={
                            selectedReg.registrationEmailNotification?.sentAt
                              ? new Date(selectedReg.registrationEmailNotification.sentAt).toLocaleString('en-IN')
                              : 'Not Sent'
                          }
                          theme={themeColors}
                        />
                        {selectedReg.registrationEmailNotification?.error ? (
                          <DetailField
                            label="Last Error"
                            value={selectedReg.registrationEmailNotification.error}
                            theme={themeColors}
                            isError
                          />
                        ) : null}

                        <TouchableOpacity
                          style={[styles.resendBtn, { backgroundColor: AdminColors.primary }]}
                          onPress={() => handleResendEmail(selectedReg._id, selectedReg.name)}
                          disabled={resendingId === selectedReg._id}
                        >
                          {resendingId === selectedReg._id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Send size={15} color="#FFFFFF" />
                              <Text style={styles.resendBtnText}>Resend Email Now</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Razorpay Route */}
                      <View style={styles.detailCard}>
                        <Text style={[styles.detailSectionTitle, { color: AdminColors.primary }]}>
                          Razorpay Route Sub-Account
                        </Text>
                        <DetailField
                          label="Route Account ID"
                          value={
                            selectedReg.razorpayRoute?.accountId ||
                            selectedReg.razorpayAccountId ||
                            '—'
                          }
                          theme={themeColors}
                          monospace
                        />
                        <DetailField
                          label="Route Status"
                          value={
                            (
                              selectedReg.razorpayRoute?.status ||
                              selectedReg.razorpayRouteStatus ||
                              'pending'
                            ).toUpperCase()
                          }
                          theme={themeColors}
                        />
                        {selectedReg.razorpayRoute?.failureReason ? (
                          <DetailField
                            label="Route Error"
                            value={selectedReg.razorpayRoute.failureReason}
                            theme={themeColors}
                            isError
                          />
                        ) : null}
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
  theme,
  monospace = false,
  isError = false,
}: {
  label: string;
  value: string;
  theme: any;
  monospace?: boolean;
  isError?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text
        style={[
          styles.fieldVal,
          { color: isError ? '#EF4444' : theme.textPrimary },
          monospace && { fontFamily: 'monospace' },
        ]}
        selectable
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
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSizes.sm,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  statCard: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statNum: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  listContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  regCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  typeBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: FontSizes.xs,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
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
    fontSize: FontSizes.xs,
    width: 65,
  },
  infoValue: {
    fontSize: FontSizes.xs,
    flex: 1,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '88%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: FontSizes.xs,
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
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabItemActive: {},
  modalTabItemText: {
    fontSize: FontSizes.xs,
  },
  modalBody: {
    flex: 1,
    padding: Spacing.md,
  },
  tabSection: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  detailCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: Spacing.sm,
  },
  detailSectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.xs,
    flex: 1,
  },
  fieldVal: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  resendBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});
