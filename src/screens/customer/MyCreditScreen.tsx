import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Store,
  ChevronLeft,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Lock,
  Info,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { creditApi, CreditAccount, CreditLedgerEntry } from '../../api/creditApi';

export default function MyCreditScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<CreditLedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await creditApi.getMyCreditAccounts();
      if (res.data?.success) {
        setAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching credit accounts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  const openLedger = async (acc: CreditAccount) => {
    setSelectedAccount(acc);
    setShowLedgerModal(true);
    setLoadingLedger(true);
    try {
      const res = await creditApi.getAccountLedger(acc._id);
      if (res.data?.success) {
        setLedgerEntries(res.data.data?.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const totalOutstanding = accounts.reduce(
    (sum, a) => sum + (a.outstandingBalance || 0),
    0
  );
  const totalLimit = accounts.reduce(
    (sum, a) => sum + (a.creditLimit || 0),
    0
  );
  const totalAvailable = accounts.reduce(
    (sum, a) => sum + (a.availableCredit || 0),
    0
  );

  const formatPolicy = (policy: CreditAccount['repaymentPolicy']) => {
    if (!policy) return 'Standard Terms';
    switch (policy.policyType) {
      case 'weekly':
        return `Weekly every ${
          policy.weeklyDay
            ? policy.weeklyDay.charAt(0).toUpperCase() +
              policy.weeklyDay.slice(1)
            : 'Sunday'
        }`;
      case 'monthly':
        return `Monthly on day ${policy.monthlyDayOfMonth || 1}`;
      case 'custom_days':
        return `Within ${policy.customDaysCount || 7} days`;
      case 'specific_date':
        return `Due by ${
          policy.specificDueDate
            ? new Date(policy.specificDueDate).toLocaleDateString()
            : 'Agreed date'
        }`;
      default:
        return 'Custom Agreement';
    }
  };

  return (
    <View
      style={[
        styles.container,
        isDark && { backgroundColor: '#0B0F19' },
      ]}
    >
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          isDark && { backgroundColor: '#111827', borderBottomColor: '#1F2937' },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft
            size={22}
            color={isDark ? '#FFFFFF' : CustomerColors.black}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.xs }}>
          <Text
            style={[
              styles.headerTitle,
              isDark && { color: '#FFFFFF' },
            ]}
          >
            My Store Credit (Kadan)
          </Text>
          <Text
            style={[
              styles.headerSubTitle,
              isDark && { color: '#9CA3AF' },
            ]}
          >
            Private credit lines & repayment ledgers
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View
            style={[
              styles.kpiCard,
              isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
            ]}
          >
            <Text style={styles.kpiLabel}>Outstanding Debt</Text>
            <Text
              style={[
                styles.kpiValue,
                totalOutstanding > 0
                  ? { color: '#D97706' }
                  : isDark
                  ? { color: '#FFFFFF' }
                  : { color: CustomerColors.black },
              ]}
            >
              ₹{totalOutstanding.toLocaleString()}
            </Text>
            <Text style={styles.kpiFootnote}>
              {totalOutstanding > 0 ? 'Full settlement required' : 'Zero debt'}
            </Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
            ]}
          >
            <Text style={styles.kpiLabel}>Available Credit</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: '#059669' },
              ]}
            >
              ₹{totalAvailable.toLocaleString()}
            </Text>
            <Text style={styles.kpiFootnote}>
              of ₹{totalLimit.toLocaleString()} limit
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text
              style={[
                styles.loadingText,
                isDark && { color: '#9CA3AF' },
              ]}
            >
              Loading your credit accounts...
            </Text>
          </View>
        ) : accounts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              isDark && { backgroundColor: '#111827', borderColor: '#1F2937' },
            ]}
          >
            <View style={styles.emptyIconBadge}>
              <CreditCard size={32} color="#7C3AED" />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: '#FFFFFF' },
              ]}
            >
              No Store Credit Accounts Yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                isDark && { color: '#9CA3AF' },
              ]}
            >
              Store credit (Kadan) is registered in person with local store
              merchants. Visit any participating store to agree on a credit
              limit and repayment policy.
            </Text>

            <View
              style={[
                styles.infoBox,
                isDark && {
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  borderColor: 'rgba(124, 58, 237, 0.3)',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Info size={16} color="#7C3AED" />
                <Text
                  style={{
                    color: isDark ? '#DDD6FE' : '#5B21B6',
                    fontWeight: '800',
                    fontSize: FontSizes.xs,
                  }}
                >
                  How it works:
                </Text>
              </View>
              <Text
                style={{
                  color: isDark ? '#C4B5FD' : '#6D28D9',
                  fontSize: FontSizes.xs,
                  marginTop: 4,
                  lineHeight: 18,
                }}
              >
                1. Visit the store in person with your Remise account.{'\n'}
                2. Agree on credit terms (weekly, monthly, or days).{'\n'}
                3. The store owner approves your account. Credit immediately
                becomes usable at checkout!
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: Spacing.md }}>
            {accounts.map(acc => {
              const hasDebt = (acc.outstandingBalance || 0) > 0;
              return (
                <View
                  key={acc._id}
                  style={[
                    styles.accountCard,
                    isDark && {
                      backgroundColor: '#111827',
                      borderColor: '#1F2937',
                    },
                  ]}
                >
                  {/* Account Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.storeBadge}>
                      <Store size={18} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: Spacing.xs,
                        }}
                      >
                        <Text
                          style={[
                            styles.storeName,
                            isDark && { color: '#FFFFFF' },
                          ]}
                          numberOfLines={1}
                        >
                          {acc.storeName}
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            acc.status === 'APPROVED' && styles.statusApproved,
                            acc.status === 'SUSPENDED' && styles.statusSuspended,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              acc.status === 'APPROVED' && styles.textApproved,
                              acc.status === 'SUSPENDED' && styles.textSuspended,
                            ]}
                          >
                            {acc.status}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.accountId,
                          isDark && { color: '#6B7280' },
                        ]}
                      >
                        ID: {acc._id.slice(-8).toUpperCase()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => openLedger(acc)}
                      style={[
                        styles.ledgerBtn,
                        isDark && { backgroundColor: 'rgba(124, 58, 237, 0.2)' },
                      ]}
                    >
                      <Receipt size={14} color="#7C3AED" />
                      <Text style={styles.ledgerBtnText}>Ledger</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Overdue Warning */}
                  {acc.isOverdue && (
                    <View style={styles.overdueBanner}>
                      <AlertTriangle size={15} color="#DC2626" />
                      <Text style={styles.overdueText}>
                        Overdue: Due on{' '}
                        {acc.nextDueDate
                          ? new Date(acc.nextDueDate).toLocaleDateString()
                          : 'earlier date'}
                        . Settle in person with store.
                      </Text>
                    </View>
                  )}

                  {/* Full Settlement Rule Note */}
                  {hasDebt && !acc.isOverdue && (
                    <View style={styles.debtBanner}>
                      <Lock size={14} color="#D97706" />
                      <Text style={styles.debtBannerText}>
                        Settlement Required: New purchases at this store are
                        blocked until ₹{acc.outstandingBalance.toLocaleString()}{' '}
                        is settled.
                      </Text>
                    </View>
                  )}

                  {/* Financial Metrics Grid */}
                  <View style={styles.metricsGrid}>
                    <View
                      style={[
                        styles.metricBox,
                        isDark && { backgroundColor: '#1F2937' },
                      ]}
                    >
                      <Text style={styles.metricLabel}>Credit Limit</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          isDark && { color: '#FFFFFF' },
                        ]}
                      >
                        ₹{(acc.creditLimit || 0).toLocaleString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricBox,
                        isDark && { backgroundColor: '#1F2937' },
                      ]}
                    >
                      <Text style={styles.metricLabel}>Outstanding</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          hasDebt
                            ? { color: '#D97706' }
                            : isDark
                            ? { color: '#FFFFFF' }
                            : { color: CustomerColors.black },
                        ]}
                      >
                        ₹{(acc.outstandingBalance || 0).toLocaleString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricBox,
                        isDark && { backgroundColor: '#1F2937' },
                      ]}
                    >
                      <Text style={styles.metricLabel}>Available</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          { color: '#059669' },
                        ]}
                      >
                        ₹{(acc.availableCredit || 0).toLocaleString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricBox,
                        isDark && { backgroundColor: '#1F2937' },
                      ]}
                    >
                      <Text style={styles.metricLabel}>Next Due</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          acc.isOverdue
                            ? { color: '#DC2626' }
                            : isDark
                            ? { color: '#FFFFFF' }
                            : { color: CustomerColors.black },
                          { fontSize: FontSizes.xs },
                        ]}
                      >
                        {acc.nextDueDate
                          ? new Date(acc.nextDueDate).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Terms & Verification Footer */}
                  <View
                    style={[
                      styles.cardFooter,
                      isDark && { borderTopColor: '#1F2937' },
                    ]}
                  >
                    <View style={styles.footerItem}>
                      <Clock size={13} color="#7C3AED" />
                      <Text
                        style={[
                          styles.footerText,
                          isDark && { color: '#9CA3AF' },
                        ]}
                      >
                        Policy: {formatPolicy(acc.repaymentPolicy)}
                      </Text>
                    </View>
                    <View style={styles.footerItem}>
                      <ShieldCheck size={13} color="#059669" />
                      <Text
                        style={[
                          styles.footerText,
                          isDark && { color: '#9CA3AF' },
                        ]}
                      >
                        Masked ID:{' '}
                        {acc.identityVerification?.idNumberMasked || 'Verified'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ──── Ledger Modal ──── */}
      <Modal
        visible={showLedgerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLedgerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              isDark && { backgroundColor: '#111827' },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && { borderBottomColor: '#1F2937' },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.modalTitle,
                    isDark && { color: '#FFFFFF' },
                  ]}
                >
                  Credit Ledger
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    isDark && { color: '#9CA3AF' },
                  ]}
                >
                  {selectedAccount?.storeName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLedgerModal(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={isDark ? '#FFFFFF' : '#374151'} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
              {loadingLedger ? (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                  <ActivityIndicator color="#7C3AED" size="small" />
                  <Text style={{ fontSize: FontSizes.xs, color: '#9CA3AF', marginTop: 8 }}>
                    Loading transactions...
                  </Text>
                </View>
              ) : ledgerEntries.length === 0 ? (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                  <Text style={{ fontSize: FontSizes.xs, color: '#9CA3AF' }}>
                    No ledger transactions recorded yet.
                  </Text>
                </View>
              ) : (
                ledgerEntries.map(entry => {
                  const isRepayment = entry.transactionType === 'REPAYMENT';
                  return (
                    <View
                      key={entry._id}
                      style={[
                        styles.ledgerRow,
                        isDark && {
                          backgroundColor: '#1F2937',
                          borderColor: '#374151',
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', gap: Spacing.sm, flex: 1 }}>
                        <View
                          style={[
                            styles.txIconBadge,
                            isRepayment
                              ? { backgroundColor: '#ECFDF5' }
                              : { backgroundColor: '#F5F3FF' },
                          ]}
                        >
                          {isRepayment ? (
                            <ArrowDownLeft size={16} color="#059669" />
                          ) : (
                            <ArrowUpRight size={16} color="#7C3AED" />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.txType,
                              isDark && { color: '#FFFFFF' },
                            ]}
                          >
                            {entry.transactionType.replace('_', ' ')}
                          </Text>
                          {entry.receiptNumber && (
                            <Text style={styles.receiptTag}>
                              Receipt #{entry.receiptNumber}
                            </Text>
                          )}
                          <Text
                            style={[
                              styles.txNotes,
                              isDark && { color: '#9CA3AF' },
                            ]}
                          >
                            {entry.notes ||
                              (entry.orderId
                                ? `Order #${entry.orderId}`
                                : 'Transaction')}
                          </Text>
                          <Text style={styles.txDate}>
                            {new Date(entry.createdAt).toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.txAmount,
                            isRepayment
                              ? { color: '#059669' }
                              : isDark
                              ? { color: '#FFFFFF' }
                              : { color: CustomerColors.black },
                          ]}
                        >
                          {isRepayment ? '-' : '+'}₹
                          {entry.amount.toLocaleString()}
                        </Text>
                        <Text style={styles.txBalance}>
                          Bal: ₹{entry.balanceAfter.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomerColors.bg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSubTitle: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  kpiLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    marginVertical: 4,
  },
  kpiFootnote: {
    fontSize: 10,
    color: '#94A3B8',
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginTop: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  infoBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  storeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    flexShrink: 1,
  },
  accountId: {
    fontSize: 10,
    color: '#94A3B8',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  statusApproved: {
    backgroundColor: '#ECFDF5',
  },
  statusSuspended: {
    backgroundColor: '#FEF2F2',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
  },
  textApproved: {
    color: '#059669',
  },
  textSuspended: {
    color: '#DC2626',
  },
  ledgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F3FF',
  },
  ledgerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  overdueText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    flex: 1,
  },
  debtBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  debtBannerText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs + 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: FontSizes.xs + 1,
    fontWeight: '800',
    marginTop: 2,
    color: CustomerColors.black,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: '#64748B',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  txType: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  receiptTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#7C3AED',
    fontWeight: '700',
  },
  txNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txDate: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: FontSizes.sm,
    fontWeight: '900',
  },
  txBalance: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
