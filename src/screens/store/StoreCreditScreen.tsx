import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  CreditCard,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  ShieldCheck,
  FileText,
  UserCheck,
  User,
  Phone,
  Mail,
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
} from 'lucide-react-native';
import { useTranslation, getCreditTranslations } from '../../i18n';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { creditApi, CreditAccount, CreditLedgerEntry, RepaymentPolicy } from '../../api/creditApi';
import { storeApi } from '../../api/storeApi';

export default function StoreCreditScreen() {
  const { store } = useStoreDashboard();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const cr = useMemo(() => getCreditTranslations(language), [language]);
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const storeId = store?._id || store?.storeId || store?.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'DUE' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);

  // In-person registration form state
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [searchingCust, setSearchingCust] = useState(false);
  const [custSearchResults, setCustSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formCustEmail, setFormCustEmail] = useState('');

  const [formLimit, setFormLimit] = useState('5000');
  const [formPolicyType, setFormPolicyType] = useState<'weekly' | 'monthly' | 'custom_days' | 'specific_date'>('weekly');
  const [formWeeklyDay, setFormWeeklyDay] = useState<string>('monday');
  const [formMonthlyDay, setFormMonthlyDay] = useState<string>('5');
  const [formCustomDays, setFormCustomDays] = useState<string>('15');
  const [formSpecificDate, setFormSpecificDate] = useState<string>('');
  const [formIdType, setFormIdType] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formNameOnId, setFormNameOnId] = useState('');
  const [formConsent, setFormConsent] = useState(false);
  const [formCustomerAgreed, setFormCustomerAgreed] = useState(false);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);

  // Cashfree Identity Verification states
  const [verifyingId, setVerifyingId] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [idVerificationError, setIdVerificationError] = useState('');
  const [verifiedIdData, setVerifiedIdData] = useState<any>(null);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarRefId, setAadhaarRefId] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);

  // Helper to verify name match against government database (Aadhaar / PAN)
  const isNameMatching = (enteredName: string, govtName: string): boolean => {
    if (!enteredName || !govtName) return true;
    const clean1 = enteredName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const clean2 = govtName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (clean1 === clean2) return true;

    const tokens1 = clean1.split(/\s+/).filter(Boolean);
    const tokens2 = clean2.split(/\s+/).filter(Boolean);
    if (tokens1.length === 0 || tokens2.length === 0) return false;

    const usedTokens2 = new Set<number>();
    let matchedCount = 0;

    for (const t1 of tokens1) {
      for (let j = 0; j < tokens2.length; j++) {
        if (usedTokens2.has(j)) continue;
        const t2 = tokens2[j];
        if (t1 === t2 || (t1.length === 1 && t2.startsWith(t1)) || (t2.length === 1 && t1.startsWith(t2))) {
          usedTokens2.add(j);
          matchedCount++;
          break;
        }
      }
    }

    const maxTokens = Math.max(tokens1.length, tokens2.length);
    return matchedCount >= Math.min(tokens1.length, tokens2.length) && (matchedCount / maxTokens) >= 0.5;
  };

  // Repayment form state
  const [repayAmount, setRepayAmount] = useState('');
  const [repayNotes, setRepayNotes] = useState('');
  const [submittingRepay, setSubmittingRepay] = useState(false);

  // Terms form state
  const [termsLimit, setTermsLimit] = useState('');
  const [termsReason, setTermsReason] = useState('');
  const [submittingTerms, setSubmittingTerms] = useState(false);

  // Ledger state
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<CreditLedgerEntry[]>([]);

  const fetchAccounts = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await creditApi.getStoreCreditAccounts(storeId);
      if (res.data?.success) {
        setAccounts(res.data?.data || res.data?.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load store credit accounts', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalLimit = accounts.reduce((acc, a) => acc + (a.creditLimit || 0), 0);
    const totalOutstanding = accounts.reduce((acc, a) => acc + (a.outstandingBalance || 0), 0);
    const activeCount = accounts.filter(a => a.status === 'APPROVED').length;
    const overdueCount = accounts.filter(a => a.isOverdue || (a.outstandingBalance > 0 && a.nextDueDate && new Date(a.nextDueDate) < new Date())).length;
    return { totalLimit, totalOutstanding, activeCount, overdueCount };
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (statusFilter === 'APPROVED' && acc.status !== 'APPROVED') return false;
      if (statusFilter === 'SUSPENDED' && acc.status !== 'SUSPENDED') return false;
      if (statusFilter === 'DUE') {
        if (acc.outstandingBalance <= 0) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = acc.customerName?.toLowerCase().includes(q);
        const matchesPhone = acc.customerPhone?.includes(q);
        const matchesEmail = acc.customerEmail?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }
      return true;
    });
  }, [accounts, statusFilter, searchQuery]);

  // Customer search for in-person registration
  const handleSearchCustomers = async (text: string) => {
    setCustSearchQuery(text);
    if (text.trim().length < 2) {
      setCustSearchResults([]);
      return;
    }
    setSearchingCust(true);
    try {
      const res = await creditApi.searchCustomers(text.trim());
      if (res.data?.success) {
        setCustSearchResults(res.data.data || res.data.customers || []);
      }
    } catch {
      // ignore
    } finally {
      setSearchingCust(false);
    }
  };

  const handleSelectCustomer = (c: any) => {
    setSelectedCustomer(c);
    setFormCustName(c.fullname || c.name || '');
    setFormCustPhone(c.mobilenumber || c.phone || '');
    setFormCustEmail(c.email || '');
    setFormNameOnId(c.fullname || c.name || '');
    setCustSearchResults([]);
    setIdVerified(false);
    setVerifiedIdData(null);
    setIdVerificationError('');
  };

  // Auto-lookup registered customer account if phone or email entered directly
  const lookupCustomerAccount = async (val: string) => {
    if (!val || val.trim().length < 3) return;
    try {
      const res = await creditApi.searchCustomers(val.trim());
      const list = res.data?.data || res.data?.customers || [];
      if (list.length > 0) {
        const cleanVal = val.trim().toLowerCase();
        const match =
          list.find(
            (u: any) =>
              (u.mobilenumber && u.mobilenumber === cleanVal) ||
              (u.phone && u.phone === cleanVal) ||
              (u.email && u.email.toLowerCase() === cleanVal)
          ) || list[0];
        if (match) {
          setSelectedCustomer(match);
          if (!formCustName) setFormCustName(match.fullname || match.name || '');
          if (!formCustPhone) setFormCustPhone(match.mobilenumber || match.phone || '');
          if (!formCustEmail) setFormCustEmail(match.email || '');
          if (!formNameOnId) setFormNameOnId(match.fullname || match.name || '');
        }
      }
    } catch {
      // ignore
    }
  };

  // Cashfree SecureID identity verification
  const handleVerifyCashfree = async () => {
    const cleanName = formNameOnId.trim();
    if (!cleanName) {
      setIdVerificationError(cr.alerts.enterLegalNameMsg);
      return;
    }
    setIdVerificationError('');

    if (formIdType === 'aadhaar') {
      const cleanAadhaar = formIdNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        setIdVerificationError(cr.alerts.enter12AadhaarMsg);
        return;
      }
      setVerifyingId(true);
      try {
        const res = await storeApi.generateAadhaarOtp(cleanAadhaar);
        const data = res.data;
        if (data?.success && data?.refId) {
          setAadhaarRefId(data.refId);
          setAadhaarOtpSent(true);
          setIdVerificationError('');
        } else {
          setIdVerificationError(data?.message || 'Failed to generate Aadhaar OTP from UIDAI.');
        }
      } catch (err: any) {
        setIdVerificationError(
          err?.response?.data?.message || 'Failed to initiate Aadhaar OTP request with UIDAI.'
        );
      } finally {
        setVerifyingId(false);
      }
    } else if (formIdType === 'pan') {
      const cleanPan = formIdNumber.trim().toUpperCase();
      const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!PAN_REGEX.test(cleanPan)) {
        setIdVerificationError(cr.alerts.invalidPanFormatMsg);
        return;
      }
      setVerifyingId(true);
      try {
        const res = await storeApi.verifyPan(cleanPan, cleanName);
        const data = res.data;
        if (data?.valid) {
          const registeredName = data.registeredName || '';
          if (data.belongsToUser === false || (registeredName && !isNameMatching(cleanName, registeredName))) {
            setIdVerified(false);
            const displayGovt = registeredName ? `"${registeredName}"` : 'the PAN card holder';
            setIdVerificationError(`Name mismatch: Income Tax records show name as ${displayGovt}. Legal name entered ("${cleanName}") does not match.`);
            return;
          }
          setIdVerified(true);
          setVerifiedIdData(data);
          setIdVerificationError('');
        } else {
          setIdVerified(false);
          setIdVerificationError(data?.message || 'PAN verification failed with Income Tax database.');
        }
      } catch (err: any) {
        setIdVerified(false);
        setIdVerificationError(
          err?.response?.data?.message || 'Could not verify PAN with Cashfree.'
        );
      } finally {
        setVerifyingId(false);
      }
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    const cleanName = formNameOnId.trim();
    if (!cleanName) {
      setIdVerificationError(cr.alerts.enterLegalNameMsg);
      return;
    }
    if (!aadhaarOtp || aadhaarOtp.length < 4) {
      setIdVerificationError(cr.alerts.enterAadhaarOtpMsg);
      return;
    }
    setVerifyingAadhaarOtp(true);
    setIdVerificationError('');
    try {
      const res = await storeApi.verifyAadhaarOtp(
        aadhaarRefId,
        aadhaarOtp.trim(),
        cleanName
      );
      const data = res.data;
      if (data?.valid) {
        const nameOnAadhaar = data.nameOnAadhaar || '';
        if (data.belongsToUser === false || (nameOnAadhaar && !isNameMatching(cleanName, nameOnAadhaar))) {
          setIdVerified(false);
          const displayGovt = nameOnAadhaar ? `"${nameOnAadhaar}"` : 'the Aadhaar holder';
          setIdVerificationError(`Name mismatch: UIDAI records show name as ${displayGovt}. Legal name entered ("${cleanName}") does not match.`);
          return;
        }
        setIdVerified(true);
        setVerifiedIdData(data);
        setIdVerificationError('');
        setAadhaarOtpSent(false);
        setAadhaarOtp('');
      } else {
        setIdVerified(false);
        setIdVerificationError(data?.message || 'Invalid Aadhaar OTP. Please try again.');
      }
    } catch (err: any) {
      setIdVerified(false);
      setIdVerificationError(
        err?.response?.data?.message || 'Failed to verify Aadhaar OTP with UIDAI.'
      );
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  const handleSubmitRegistration = async () => {
    // 1. Mandatory validation for ALL THREE customer details
    if (!formCustName.trim()) {
      Alert.alert(cr.alerts.nameRequiredTitle, cr.alerts.nameRequiredMsg);
      return;
    }
    if (!formCustPhone.trim() || formCustPhone.trim().length < 10) {
      Alert.alert(cr.alerts.phoneRequiredTitle, cr.alerts.phoneRequiredMsg);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formCustEmail.trim() || !emailRegex.test(formCustEmail.trim())) {
      Alert.alert(cr.alerts.emailRequiredTitle, cr.alerts.emailRequiredMsg);
      return;
    }

    let targetCustomer = selectedCustomer;
    if (!targetCustomer) {
      try {
        if (formCustPhone.trim()) {
          const res = await creditApi.searchCustomers(formCustPhone.trim());
          const list = res.data?.data || res.data?.customers || [];
          if (list.length > 0) {
            targetCustomer =
              list.find(
                (u: any) =>
                  u.mobilenumber === formCustPhone.trim() ||
                  u.phone === formCustPhone.trim() ||
                  u.email?.toLowerCase() === formCustEmail.trim().toLowerCase()
              ) || list[0];
            if (targetCustomer) setSelectedCustomer(targetCustomer);
          }
        }
        if (!targetCustomer && formCustEmail.trim()) {
          const resEmail = await creditApi.searchCustomers(formCustEmail.trim());
          const listEmail = resEmail.data?.data || resEmail.data?.customers || [];
          if (listEmail.length > 0) {
            targetCustomer = listEmail[0];
            if (targetCustomer) setSelectedCustomer(targetCustomer);
          }
        }
      } catch (err) {
        console.warn('Auto resolve error', err);
      }
    }

    const limitNum = parseFloat(formLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      Alert.alert(cr.alerts.invalidLimitTitle, cr.alerts.invalidLimitMsg);
      return;
    }

    // 2. Identity Verification via Cashfree
    if (!formIdNumber.trim()) {
      Alert.alert(cr.alerts.identityRequiredTitle, cr.alerts.identityRequiredMsg);
      return;
    }
    if (!formNameOnId.trim()) {
      Alert.alert(cr.alerts.nameOnIdRequiredTitle, cr.alerts.nameOnIdRequiredMsg);
      return;
    }
    if (!idVerified) {
      Alert.alert(
        cr.alerts.cashfreeRequiredTitle,
        cr.alerts.cashfreeRequiredMsg
      );
      return;
    }
    if (!formConsent || !formCustomerAgreed) {
      Alert.alert(cr.alerts.consentRequiredTitle, cr.alerts.consentRequiredMsg);
      return;
    }

    setSubmittingRegistration(true);
    try {
      const policy: RepaymentPolicy = {
        policyType: formPolicyType,
        weeklyDay: formPolicyType === 'weekly' ? (formWeeklyDay as any) : undefined,
        monthlyDayOfMonth: formPolicyType === 'monthly' ? parseInt(formMonthlyDay, 10) : undefined,
        customDaysCount: formPolicyType === 'custom_days' ? parseInt(formCustomDays, 10) : undefined,
        specificDueDate: formPolicyType === 'specific_date' ? formSpecificDate : undefined,
      };

      const res = await creditApi.createInPersonApplication({
        storeId,
        customerId: targetCustomer?._id || targetCustomer?.id || '',
        customerName: formCustName.trim(),
        customerPhone: formCustPhone.trim(),
        customerEmail: formCustEmail.trim().toLowerCase(),
        creditLimit: limitNum,
        repaymentPolicy: policy,
        idType: formIdType,
        idNumber: formIdNumber.trim(),
        nameOnId: formNameOnId.trim(),
        customerAgreed: formCustomerAgreed,
        consentGiven: formConsent,
      });

      if (res.data?.success) {
        Alert.alert(cr.alerts.successTitle, cr.alerts.creditApprovedMsg);
        setRegisterModalOpen(false);
        // reset form
        setSelectedCustomer(null);
        setCustSearchQuery('');
        setFormCustName('');
        setFormCustPhone('');
        setFormCustEmail('');
        setFormIdNumber('');
        setFormNameOnId('');
        setIdVerified(false);
        setVerifiedIdData(null);
        setIdVerificationError('');
        setFormConsent(false);
        setFormCustomerAgreed(false);
        fetchAccounts();
      } else {
        Alert.alert(cr.alerts.errorTitle, res.data?.message || cr.alerts.registrationFailedMsg);
      }
    } catch (err: any) {
      Alert.alert(cr.alerts.errorTitle, err?.response?.data?.message || err.message || cr.alerts.registrationFailedMsg);
    } finally {
      setSubmittingRegistration(false);
    }
  };

  const handleRecordRepayment = async () => {
    if (!selectedAccount) return;
    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert(cr.alerts.invalidAmountTitle, cr.alerts.invalidAmountMsg);
      return;
    }
    if (amt > selectedAccount.outstandingBalance) {
      Alert.alert(cr.alerts.amountExceedsDebtTitle, cr.alerts.amountExceedsDebtMsg.replace('{{amount}}', selectedAccount.outstandingBalance.toLocaleString('en-IN')));
      return;
    }

    setSubmittingRepay(true);
    try {
      const res = await creditApi.recordCashRepayment(
        selectedAccount._id,
        amt,
        repayNotes,
        'cash'
      );
      if (res.data?.success) {
        Alert.alert(
          cr.alerts.repaymentRecordedTitle,
          cr.alerts.repaymentRecordedMsg
            .replace('{{amount}}', amt.toLocaleString('en-IN'))
            .replace('{{receipt}}', res.data.receiptNumber || 'CR-CASH')
            .replace('{{balance}}', res.data.outstandingBalance.toLocaleString('en-IN'))
        );
        setRepayModalOpen(false);
        setRepayAmount('');
        setRepayNotes('');
        fetchAccounts();
      } else {
        Alert.alert(cr.alerts.errorTitle, res.data?.message || cr.alerts.repaymentFailedMsg);
      }
    } catch (err: any) {
      Alert.alert(cr.alerts.errorTitle, err?.response?.data?.message || err.message || cr.alerts.repaymentFailedMsg);
    } finally {
      setSubmittingRepay(false);
    }
  };

  const handleUpdateTerms = async () => {
    if (!selectedAccount) return;
    const limitNum = parseFloat(termsLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      Alert.alert(cr.alerts.invalidLimitTitle, cr.alerts.invalidLimitMsg);
      return;
    }
    if (!termsReason.trim()) {
      Alert.alert(cr.alerts.reasonRequiredTitle, cr.alerts.reasonRequiredMsg);
      return;
    }

    setSubmittingTerms(true);
    try {
      const res = await creditApi.updateCreditTerms(selectedAccount._id, {
        creditLimit: limitNum,
        repaymentPolicy: selectedAccount.repaymentPolicy,
        reason: termsReason.trim(),
      });
      if (res.data?.success) {
        Alert.alert(cr.alerts.successTitle, cr.alerts.termsUpdatedMsg);
        setTermsModalOpen(false);
        setTermsReason('');
        fetchAccounts();
      } else {
        Alert.alert(cr.alerts.errorTitle, res.data?.message || cr.alerts.termsFailedMsg);
      }
    } catch (err: any) {
      Alert.alert(cr.alerts.errorTitle, err?.response?.data?.message || err.message || cr.alerts.termsFailedMsg);
    } finally {
      setSubmittingTerms(false);
    }
  };

  const handleToggleSuspend = async (acc: CreditAccount) => {
    const isCurrentlySuspended = acc.status === 'SUSPENDED';
    const newStatus = isCurrentlySuspended ? 'APPROVED' : 'SUSPENDED';
    Alert.alert(
      isCurrentlySuspended ? cr.reactivateCredit : cr.suspendCredit,
      isCurrentlySuspended
        ? cr.alerts.reactivateConfirmMsg.replace('{{name}}', acc.customerName || cr.customer)
        : cr.alerts.suspendConfirmMsg.replace('{{name}}', acc.customerName || cr.customer),
      [
        { text: cr.cancel, style: 'cancel' },
        {
          text: cr.confirm,
          style: isCurrentlySuspended ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const res = await creditApi.suspendOrRevokeAccount(
                acc._id,
                newStatus,
                isCurrentlySuspended ? 'Store owner reactivated account' : 'Store owner suspended account'
              );
              if (res.data?.success) {
                fetchAccounts();
              }
            } catch (err: any) {
              Alert.alert(cr.alerts.errorTitle, err?.response?.data?.message || cr.alerts.updateStatusFailed);
            }
          },
        },
      ]
    );
  };

  const openLedgerModal = async (acc: CreditAccount) => {
    setSelectedAccount(acc);
    setLedgerModalOpen(true);
    setLedgerLoading(true);
    try {
      const res = await creditApi.getAccountLedger(acc._id);
      if (res.data?.success) {
        setLedgerEntries(res.data.ledger || []);
      }
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Action Bar */}
      <View style={styles.headerBar}>
        <View style={styles.searchBox}>
          <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={styles.searchInput}
            placeholder={cr.searchPlaceholder}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setRegisterModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{cr.inPersonCreditBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScroll}
        >
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {cr.totalOutstanding}
            </Text>
            <Text
              style={[
                styles.kpiValue,
                { color: kpis.totalOutstanding > 0 ? '#DC2626' : '#10B981' },
              ]}
            >
              ₹{kpis.totalOutstanding.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {cr.totalApprovedLimit}
            </Text>
            <Text style={styles.kpiValue}>
              ₹{kpis.totalLimit.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {cr.activeAccounts}
            </Text>
            <Text style={styles.kpiValue}>{kpis.activeCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {cr.overdue}
            </Text>
            <Text
              style={[
                styles.kpiValue,
                { color: kpis.overdueCount > 0 ? '#EF4444' : '#6B7280' },
              ]}
            >
              {kpis.overdueCount}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          {(['ALL', 'APPROVED', 'DUE', 'SUSPENDED'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                statusFilter === f && styles.filterTabActive,
              ]}
              onPress={() => setStatusFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  statusFilter === f && styles.filterTabTextActive,
                ]}
              >
                {f === 'ALL'
                  ? cr.filterAll
                  : f === 'DUE'
                  ? cr.filterWithBalance
                  : f === 'APPROVED'
                  ? cr.filterActive
                  : cr.filterSuspended}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Accounts List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={CustomerColors.teal600} />
          <Text style={styles.loadingText}>{cr.loadingStoreCredit}</Text>
        </View>
      ) : filteredAccounts.length === 0 ? (
        <View style={styles.centerContainer}>
          <CreditCard size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
          <Text style={styles.emptyTitle}>{cr.noCreditAccountsFound}</Text>
          <Text style={styles.emptySub}>
            {cr.registerInPersonDesc}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={item => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const hasDebt = item.outstandingBalance > 0;
            const isSuspended = item.status === 'SUSPENDED';
            return (
              <View style={styles.accountCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.customerName || cr.customer}</Text>
                    <Text style={styles.customerMeta}>
                      {item.customerPhone} {item.customerEmail ? `· ${item.customerEmail}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.badge, isSuspended ? styles.badgeSuspended : styles.badgeApproved]}>
                    <Text style={[styles.badgeText, isSuspended ? styles.badgeTextSuspended : styles.badgeTextApproved]}>
                      {isSuspended ? cr.statusSuspended : cr.statusApproved}
                    </Text>
                  </View>
                </View>

                {/* Balances */}
                {(() => {
                  const itemAvailable = item.availableCredit !== undefined ? item.availableCredit : Math.max(0, item.creditLimit - (item.outstandingBalance + (item.reservedCreditAmount || 0)));
                  const itemUsed = Math.max(0, item.creditLimit - itemAvailable);
                  return (
                    <View style={styles.balanceGrid}>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>{cr.creditLimit}</Text>
                        <Text style={styles.balanceValue}>₹{item.creditLimit.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>{cr.usedCredit}</Text>
                        <Text style={[styles.balanceValue, itemUsed > 0 && { color: '#7C3AED' }]}>
                          ₹{itemUsed.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>{cr.outstanding}</Text>
                        <Text style={[styles.balanceValue, hasDebt ? styles.debtText : styles.settledText]}>
                          ₹{item.outstandingBalance.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>{cr.available}</Text>
                        <Text style={[styles.balanceValue, { color: '#059669' }]}>
                          ₹{itemAvailable.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {/* Terms / Policy Row */}
                <View style={styles.policyRow}>
                  <Calendar size={13} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.policyText}>
                    {cr.policyLabel}{' '}
                    {item.repaymentPolicy?.policyType === 'weekly'
                      ? cr.policyWeekly.replace('{{day}}', (cr.days as any)[item.repaymentPolicy.weeklyDay?.toLowerCase() || ''] || item.repaymentPolicy.weeklyDay?.toUpperCase() || '')
                      : item.repaymentPolicy?.policyType === 'monthly'
                      ? cr.policyMonthly.replace('{{day}}', String(item.repaymentPolicy.monthlyDayOfMonth))
                      : item.repaymentPolicy?.policyType === 'custom_days'
                      ? cr.everyDays.replace('{{days}}', String(item.repaymentPolicy.customDaysCount))
                      : cr.specificDueDate}
                  </Text>
                  {item.nextDueDate && (
                    <Text style={[styles.dueDateText, item.isOverdue && styles.overdueText]}>
                      {cr.dueOn.replace('{{date}}', new Date(item.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))}
                      {item.isOverdue ? ` ${cr.overdueText}` : ''}
                    </Text>
                  )}
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                  {hasDebt && (
                    <TouchableOpacity
                      style={styles.repayBtn}
                      onPress={() => {
                        setSelectedAccount(item);
                        setRepayAmount(String(item.outstandingBalance));
                        setRepayModalOpen(true);
                      }}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.repayBtnText}>{cr.recordRepaymentBtn}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => openLedgerModal(item)}
                  >
                    <FileText size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.secondaryBtnText}>{cr.ledgerBtn}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setSelectedAccount(item);
                      setTermsLimit(String(item.creditLimit));
                      setTermsModalOpen(true);
                    }}
                  >
                    <TrendingUp size={14} color={isDark ? '#9CA3AF' : '#4B5563'} />
                    <Text style={styles.secondaryBtnText}>{cr.termsBtn}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryBtn, isSuspended && styles.reactivateBtn]}
                    onPress={() => handleToggleSuspend(item)}
                  >
                    {isSuspended ? (
                      <Unlock size={14} color="#10B981" />
                    ) : (
                      <Lock size={14} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ================= IN-PERSON REGISTRATION MODAL ================= */}
      <Modal visible={registerModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{cr.registerModalTitle}</Text>
                <Text style={styles.modalSubtitle}>{cr.registerModalSubtitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setRegisterModalOpen(false)}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              {/* Step 1: Customer Details (All 3 Details Required: Name, Phone, Email) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
                <Text style={[styles.fieldLabel, { marginTop: 0, marginBottom: 0 }]}>
                  {cr.step1CustomerInfo}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 }}>
                  {cr.step1Subtitle}
                </Text>
              </View>

              {/* Quick Search */}
              <TextInput
                style={styles.input}
                placeholder={cr.searchAutoFillPlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={custSearchQuery}
                onChangeText={handleSearchCustomers}
              />
              {searchingCust && <ActivityIndicator size="small" color={CustomerColors.teal600} />}
              {custSearchResults.length > 0 && (
                <View style={styles.dropdownResults}>
                  {custSearchResults.map(c => (
                    <TouchableOpacity
                      key={c._id || c.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectCustomer(c)}
                    >
                      <Text style={styles.dropdownItemName}>{c.fullname || c.name}</Text>
                      <Text style={styles.dropdownItemPhone}>
                        📞 {c.mobilenumber || c.phone} · ✉️ {c.email}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Three Mandatory Detail Fields */}
              <Text style={styles.subFieldLabel}>{cr.customerFullName}</Text>
              <TextInput
                style={styles.input}
                placeholder={cr.fullNamePlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={formCustName}
                onChangeText={v => {
                  setFormCustName(v);
                  if (!formNameOnId || formNameOnId === formCustName) {
                    setFormNameOnId(v);
                  }
                }}
              />

              <Text style={styles.subFieldLabel}>{cr.mobileNumberLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={cr.mobilePlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="phone-pad"
                maxLength={10}
                value={formCustPhone}
                onChangeText={v => {
                  const clean = v.replace(/\D/g, '');
                  setFormCustPhone(clean);
                  if (clean.length === 10 && !selectedCustomer) {
                    lookupCustomerAccount(clean);
                  }
                }}
              />

              <Text style={styles.subFieldLabel}>{cr.emailAddressLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={cr.emailPlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formCustEmail}
                onChangeText={v => {
                  setFormCustEmail(v);
                  if (v.includes('@') && !selectedCustomer) {
                    lookupCustomerAccount(v);
                  }
                }}
              />

              {selectedCustomer ? (
                <View style={styles.selectedCustomerBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustName}>
                      {cr.linkedAccountPrefix} {selectedCustomer.fullname || selectedCustomer.name}
                    </Text>
                    <Text style={styles.selectedCustPhone}>
                      {selectedCustomer.mobilenumber || selectedCustomer.phone || formCustPhone} · {selectedCustomer.email || formCustEmail}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                    <Text style={styles.changeLink}>{cr.change}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.helperNotice}>
                  {cr.customerMustBeRegistered}
                </Text>
              )}

              {/* Step 2: Set Credit Limit */}
              <Text style={styles.fieldLabel}>{cr.step2CreditLimit}</Text>
              <TextInput
                style={styles.input}
                placeholder={cr.limitPlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="numeric"
                value={formLimit}
                onChangeText={text => setFormLimit(text.replace(/^0+(?=\d)/, ''))}
              />

              {/* Step 3: Repayment Policy */}
              <Text style={styles.fieldLabel}>{cr.step3RepaymentPolicy}</Text>
              <View style={styles.policyOptionGrid}>
                {(['weekly', 'monthly', 'custom_days', 'specific_date'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.policyPill, formPolicyType === p && styles.policyPillActive]}
                    onPress={() => setFormPolicyType(p)}
                  >
                    <Text style={[styles.policyPillText, formPolicyType === p && styles.policyPillTextActive]}>
                      {p === 'weekly' ? cr.policyWeekly : p === 'monthly' ? cr.policyMonthly : p === 'custom_days' ? cr.policyCustomDays : cr.policySpecificDate}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formPolicyType === 'weekly' && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subFieldLabel}>{cr.weeklyDueDayLabel}</Text>
                  <View style={styles.daysGrid}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dayPill, formWeeklyDay === d && styles.dayPillActive]}
                        onPress={() => setFormWeeklyDay(d)}
                      >
                        <Text style={[styles.dayPillText, formWeeklyDay === d && styles.dayPillTextActive]}>
                          {(cr.days as any)[d.slice(0, 3)] || d.slice(0, 3).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {formPolicyType === 'monthly' && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subFieldLabel}>{cr.dueDayOfMonthLabel}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={formMonthlyDay}
                    onChangeText={text => setFormMonthlyDay(text.replace(/^0+(?=\d)/, ''))}
                  />
                </View>
              )}

              {formPolicyType === 'custom_days' && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subFieldLabel}>{cr.repayWithinDaysLabel}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    keyboardType="numeric"
                    value={formCustomDays}
                    onChangeText={text => setFormCustomDays(text.replace(/^0+(?=\d)/, ''))}
                  />
                </View>
              )}

              {formPolicyType === 'specific_date' && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subFieldLabel}>{cr.agreedDueDateLabel}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-12-31"
                    value={formSpecificDate}
                    onChangeText={setFormSpecificDate}
                  />
                </View>
              )}

              {/* Step 4: Identity Verification (Cashfree SecureID) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
                <Text style={[styles.fieldLabel, { marginTop: 0, marginBottom: 0 }]}>
                  {cr.step4IdentityVerification}
                </Text>
                {idVerified ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? 'rgba(6, 78, 59, 0.4)' : '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <CheckCircle2 size={12} color="#059669" />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#059669' }}>{cr.cashfreeVerifiedBadge}</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280' }}>{cr.uidaiItdCheck}</Text>
                )}
              </View>

              <View style={styles.policyOptionGrid}>
                {(['aadhaar', 'pan'] as const).map(id => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.policyPill, formIdType === id && styles.policyPillActive]}
                    onPress={() => {
                      setFormIdType(id);
                      setIdVerified(false);
                      setVerifiedIdData(null);
                      setIdVerificationError('');
                      setAadhaarOtpSent(false);
                      setAadhaarOtp('');
                      setAadhaarRefId('');
                    }}
                  >
                    <Text style={[styles.policyPillText, formIdType === id && styles.policyPillActive && styles.policyPillTextActive]}>
                      {id === 'aadhaar' ? cr.aadhaarOption : cr.panOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.subFieldLabel}>
                {formIdType === 'aadhaar' ? cr.aadhaarNumberLabel : cr.panNumberLabel}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={formIdType === 'aadhaar' ? cr.aadhaarPlaceholder : cr.panPlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType={formIdType === 'aadhaar' ? 'number-pad' : 'default'}
                maxLength={formIdType === 'aadhaar' ? 12 : 10}
                autoCapitalize="characters"
                value={formIdNumber}
                onChangeText={v => {
                  setFormIdNumber(v);
                  setIdVerified(false);
                  setVerifiedIdData(null);
                  setIdVerificationError('');
                  setAadhaarOtpSent(false);
                  setAadhaarOtp('');
                  setAadhaarRefId('');
                }}
              />

              <Text style={styles.subFieldLabel}>{cr.legalNameLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={cr.legalNamePlaceholder}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={formNameOnId}
                onChangeText={v => {
                  setFormNameOnId(v);
                  setIdVerified(false);
                  setVerifiedIdData(null);
                  setIdVerificationError('');
                }}
              />

              {/* Aadhaar OTP Input Box */}
              {formIdType === 'aadhaar' && aadhaarOtpSent && !idVerified && (
                <View style={styles.otpBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.otpTitle}>{cr.enterAadhaarOtpTitle}</Text>
                    <Text style={styles.otpSubtitle}>{cr.sentToUidaiMobile}</Text>
                  </View>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="123456"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={aadhaarOtp}
                    onChangeText={text => setAadhaarOtp(text.replace(/\D/g, ''))}
                  />
                  <View style={styles.otpActionRow}>
                    <TouchableOpacity
                      style={[styles.otpVerifyBtn, (verifyingAadhaarOtp || aadhaarOtp.length < 4) && { opacity: 0.7 }]}
                      disabled={verifyingAadhaarOtp || aadhaarOtp.length < 4}
                      onPress={handleVerifyAadhaarOtp}
                    >
                      {verifyingAadhaarOtp ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.otpVerifyBtnText}>{cr.confirmAadhaarOtpBtn}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={verifyingId}
                      onPress={handleVerifyCashfree}
                      style={styles.otpSecondaryBtn}
                    >
                      <Text style={styles.otpSecondaryBtnText}>{cr.resend}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setAadhaarOtpSent(false);
                        setAadhaarOtp('');
                        setIdVerificationError('');
                      }}
                      style={styles.otpSecondaryBtn}
                    >
                      <Text style={styles.otpSecondaryBtnText}>{cr.change}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Cashfree Verification Button */}
              {(!aadhaarOtpSent || formIdType === 'pan' || idVerified) && (
                <TouchableOpacity
                  style={[
                    styles.cashfreeVerifyBtn,
                    idVerified && styles.cashfreeVerifyBtnSuccess,
                    (verifyingId || !formIdNumber.trim() || !formNameOnId.trim()) && { opacity: 0.7 },
                  ]}
                  disabled={verifyingId || !formIdNumber.trim() || !formNameOnId.trim()}
                  onPress={handleVerifyCashfree}
                >
                  {verifyingId ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.cashfreeVerifyBtnText}>
                        {formIdType === 'aadhaar'
                          ? cr.sendingAadhaarOtp
                          : cr.verifyingPan}
                      </Text>
                    </>
                  ) : idVerified ? (
                    <>
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.cashfreeVerifyBtnText}>{cr.verifiedViaCashfreeTap}</Text>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} color="#FFFFFF" />
                      <Text style={styles.cashfreeVerifyBtnText}>
                        {formIdType === 'aadhaar'
                          ? cr.verifyAadhaarBtn
                          : cr.verifyPanBtn}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Error Box */}
              {idVerificationError ? (
                <View style={styles.verifyErrorBox}>
                  <AlertCircle size={14} color="#EF4444" />
                  <Text style={styles.verifyErrorText}>{idVerificationError}</Text>
                </View>
              ) : null}

              {/* Verified Details Card */}
              {idVerified && verifiedIdData ? (
                <View style={styles.verifiedCard}>
                  <View style={styles.verifiedTitle}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text style={styles.verifiedTitleText}>{cr.cashfreeConfirmedTitle}</Text>
                  </View>
                  {(verifiedIdData.registeredName || verifiedIdData.nameOnAadhaar) && (
                    <Text style={styles.verifiedDetailsText}>
                      {cr.govtRecordNamePrefix} {verifiedIdData.registeredName || verifiedIdData.nameOnAadhaar}
                    </Text>
                  )}
                  <Text style={[styles.verifiedDetailsText, { fontSize: 10, marginTop: 2, color: isDark ? '#6EE7B7' : '#047857' }]}>
                    {cr.maskedTokenPrefix} {verifiedIdData.maskedAadhaar || (formIdType === 'pan' ? `XXXXXX${formIdNumber.slice(-4).toUpperCase()}` : `XXXX-XXXX-${formIdNumber.slice(-4)}`)} · {cr.verifiedViaCashfreeSuffix}
                  </Text>
                </View>
              ) : null}

              {/* Step 5: Checkboxes for Consent and Agreement */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormConsent(!formConsent)}
              >
                <View style={[styles.checkbox, formConsent && styles.checkboxActive]}>
                  {formConsent && <CheckCircle2 size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {cr.consentCheckboxLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormCustomerAgreed(!formCustomerAgreed)}
              >
                <View style={[styles.checkbox, formCustomerAgreed && styles.checkboxActive]}>
                  {formCustomerAgreed && <CheckCircle2 size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {cr.agreementCheckboxLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitModalBtn,
                  (!idVerified || !formCustName.trim() || !formCustPhone.trim() || !formCustEmail.trim()) && { opacity: 0.5 },
                ]}
                disabled={submittingRegistration || !idVerified || !formCustName.trim() || !formCustPhone.trim() || !formCustEmail.trim()}
                onPress={handleSubmitRegistration}
              >
                {submittingRegistration ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>{cr.approveAndActivateBtn}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= RECORD REPAYMENT MODAL ================= */}
      <Modal visible={repayModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{cr.recordRepaymentTitle}</Text>
                <Text style={styles.modalSubtitle}>{cr.customerLabelPrefix} {selectedAccount?.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setRepayModalOpen(false)}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.debtBanner}>
              <Text style={styles.debtBannerLabel}>{cr.outstandingDebtLabel}</Text>
              <Text style={styles.debtBannerVal}>
                ₹{selectedAccount?.outstandingBalance.toLocaleString('en-IN')}
              </Text>
            </View>

            <Text style={styles.fieldLabel}>{cr.repaymentAmountLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={cr.amountCollectedPlaceholder}
              keyboardType="numeric"
              value={repayAmount}
              onChangeText={text => setRepayAmount(text.replace(/^0+(?=\d)/, ''))}
            />

            <Text style={styles.fieldLabel}>{cr.notesReferenceLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={cr.notesPlaceholder}
              value={repayNotes}
              onChangeText={setRepayNotes}
            />

            <TouchableOpacity
              style={styles.submitModalBtn}
              disabled={submittingRepay}
              onPress={handleRecordRepayment}
            >
              {submittingRepay ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitModalBtnText}>{cr.confirmReceiptBtn}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= UPDATE TERMS MODAL ================= */}
      <Modal visible={termsModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{cr.modifyTermsTitle}</Text>
                <Text style={styles.modalSubtitle}>{selectedAccount?.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setTermsModalOpen(false)}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>{cr.newLimitLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={cr.limitShortPlaceholder}
              keyboardType="numeric"
              value={termsLimit}
              onChangeText={text => setTermsLimit(text.replace(/^0+(?=\d)/, ''))}
            />

            <Text style={styles.fieldLabel}>{cr.auditReasonLabel}</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder={cr.auditReasonPlaceholder}
              multiline
              value={termsReason}
              onChangeText={setTermsReason}
            />

            <TouchableOpacity
              style={styles.submitModalBtn}
              disabled={submittingTerms}
              onPress={handleUpdateTerms}
            >
              {submittingTerms ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitModalBtnText}>{cr.updateTermsBtn}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= LEDGER MODAL ================= */}
      <Modal visible={ledgerModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{cr.ledgerModalTitle}</Text>
                <Text style={styles.modalSubtitle}>{selectedAccount?.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setLedgerModalOpen(false)}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {ledgerLoading ? (
              <ActivityIndicator size="large" color={CustomerColors.teal600} style={{ marginVertical: 32 }} />
            ) : ledgerEntries.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 32, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {cr.noLedgerEntries}
              </Text>
            ) : (
              <FlatList
                data={ledgerEntries}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <View style={styles.ledgerItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ledgerType}>{item.transactionType === 'REPAYMENT' ? cr.repaymentType : cr.orderDebitType}</Text>
                      <Text style={styles.ledgerMeta}>
                        {new Date(item.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {item.receiptNumber ? ` · ${cr.refPrefix} ${item.receiptNumber}` : ''}
                      </Text>
                      {item.notes ? <Text style={styles.ledgerNotes}>"{item.notes}"</Text> : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.ledgerAmount,
                          item.transactionType === 'REPAYMENT' ? styles.ledgerGreen : styles.ledgerRed,
                        ]}
                      >
                        {item.transactionType === 'REPAYMENT' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.ledgerBal}>{cr.balPrefix} ₹{item.balanceAfter.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    },
    headerBar: {
      flexDirection: 'row',
      padding: Spacing.md,
      gap: 10,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      minHeight: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      color: isDark ? '#F8FAFC' : '#0F172A',
      fontSize: FontSizes.sm,
      paddingVertical: Platform.OS === 'android' ? 6 : 8,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CustomerColors.teal700,
      paddingHorizontal: 14,
      borderRadius: BorderRadius.md,
      gap: 6,
    },
    addBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    kpiContainer: {
      marginVertical: 4,
    },
    kpiScroll: {
      paddingHorizontal: Spacing.md,
      gap: 10,
      flexDirection: 'row',
    },
    kpiCard: {
      width: 130,
      minHeight: 80,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    kpiLabel: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 15,
    },
    kpiValue: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginTop: 4,
    },
    filterTabsContainer: {
      marginVertical: 6,
    },
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      gap: 8,
      alignItems: 'center',
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
    },
    filterTabActive: {
      backgroundColor: CustomerColors.teal700,
    },
    filterTabText: {
      fontSize: FontSizes.xs,
      fontWeight: '600',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    filterTabTextActive: {
      color: '#FFFFFF',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontSize: FontSizes.sm,
    },
    emptyTitle: {
      fontSize: FontSizes.md,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginTop: 16,
    },
    emptySub: {
      fontSize: FontSizes.sm,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      marginTop: 4,
    },
    accountCard: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      ...Shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    customerName: {
      fontSize: FontSizes.md,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    customerMeta: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeApproved: {
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    },
    badgeSuspended: {
      backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    badgeTextApproved: {
      color: '#10B981',
    },
    badgeTextSuspended: {
      color: '#EF4444',
    },
    balanceGrid: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#334155' : '#F1F5F9',
      justifyContent: 'space-between',
      gap: 6,
    },
    balanceItem: {
      flex: 1,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase',
      lineHeight: 14,
      textAlign: 'center',
    },
    balanceValue: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginTop: 2,
      textAlign: 'center',
    },
    debtText: {
      color: '#EF4444',
    },
    settledText: {
      color: '#10B981',
    },
    policyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      padding: 8,
      borderRadius: BorderRadius.sm,
    },
    policyText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#CBD5E1' : '#334155',
      flex: 1,
    },
    dueDateText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: CustomerColors.teal700,
    },
    overdueText: {
      color: '#EF4444',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      alignItems: 'center',
    },
    repayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#10B981',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: BorderRadius.md,
    },
    repayBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
    },
    secondaryBtnText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#F8FAFC' : '#0F172A',
      fontWeight: '600',
    },
    reactivateBtn: {
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: FontSizes.lg,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    modalSubtitle: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    fieldLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1E293B',
      marginTop: 12,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    subFieldLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1E293B',
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: isDark ? '#F8FAFC' : '#0F172A',
      fontSize: FontSizes.sm,
      marginBottom: 8,
    },
    selectedCustomerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
      padding: 12,
      borderRadius: BorderRadius.md,
      marginBottom: 8,
    },
    selectedCustName: {
      fontWeight: '700',
      color: isDark ? '#A7F3D0' : '#065F46',
      fontSize: FontSizes.sm,
    },
    selectedCustPhone: {
      fontSize: FontSizes.xs,
      color: isDark ? '#6EE7B7' : '#047857',
    },
    changeLink: {
      color: CustomerColors.teal700,
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    dropdownResults: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      borderRadius: BorderRadius.md,
      marginBottom: 8,
      maxHeight: 150,
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
    },
    dropdownItemName: {
      fontWeight: '700',
      fontSize: FontSizes.xs,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    dropdownItemPhone: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    policyOptionGrid: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 8,
    },
    policyPill: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.sm,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
    },
    policyPillActive: {
      backgroundColor: CustomerColors.teal700,
      borderColor: CustomerColors.teal700,
    },
    policyPillText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : '#6B7280',
      textAlign: 'center',
    },
    policyPillTextActive: {
      color: '#FFFFFF',
      textAlign: 'center',
    },
    daysGrid: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 8,
    },
    dayPill: {
      flex: 1,
      paddingVertical: 7,
      paddingHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
    },
    dayPillActive: {
      backgroundColor: CustomerColors.teal700,
    },
    dayPillText: {
      fontSize: 9,
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : '#6B7280',
      textAlign: 'center',
    },
    dayPillTextActive: {
      color: '#FFFFFF',
      textAlign: 'center',
    },
    checkboxRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      marginVertical: 6,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: isDark ? '#6B7280' : '#9CA3AF',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxActive: {
      backgroundColor: CustomerColors.teal700,
      borderColor: CustomerColors.teal700,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: FontSizes.xs,
      color: isDark ? '#CBD5E1' : '#475569',
      lineHeight: 16,
    },
    submitModalBtn: {
      backgroundColor: CustomerColors.teal700,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    submitModalBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.sm,
    },
    debtBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
      padding: 12,
      borderRadius: BorderRadius.md,
      marginBottom: 12,
    },
    debtBannerLabel: {
      fontSize: FontSizes.xs,
      color: '#EF4444',
      fontWeight: '700',
    },
    debtBannerVal: {
      fontSize: FontSizes.md,
      color: '#EF4444',
      fontWeight: '800',
    },
    ledgerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
    },
    ledgerType: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    ledgerMeta: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginTop: 2,
    },
    ledgerNotes: {
      fontSize: 10,
      color: isDark ? '#CBD5E1' : '#475569',
      fontStyle: 'italic',
      marginTop: 2,
    },
    ledgerAmount: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    ledgerGreen: {
      color: '#10B981',
    },
    ledgerRed: {
      color: '#EF4444',
    },
    ledgerBal: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginTop: 2,
    },
    cashfreeVerifyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: CustomerColors.teal700,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: BorderRadius.md,
      marginVertical: 8,
    },
    cashfreeVerifyBtnSuccess: {
      backgroundColor: '#059669',
    },
    cashfreeVerifyBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    verifiedCard: {
      backgroundColor: isDark ? 'rgba(6, 78, 59, 0.3)' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? '#065F46' : '#BBF7D0',
      borderRadius: BorderRadius.md,
      padding: 10,
      marginVertical: 6,
    },
    verifiedTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    verifiedTitleText: {
      color: isDark ? '#34D399' : '#065F46',
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    verifiedDetailsText: {
      fontSize: 11,
      color: isDark ? '#A7F3D0' : '#15803D',
    },
    verifyErrorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : '#FEF2F2',
      borderWidth: 1,
      borderColor: isDark ? '#991B1B' : '#FECACA',
      borderRadius: BorderRadius.md,
      padding: 8,
      marginVertical: 6,
    },
    verifyErrorText: {
      flex: 1,
      color: '#EF4444',
      fontSize: 11,
    },
    helperNotice: {
      fontSize: 11,
      color: '#D97706',
      marginBottom: 8,
    },
    otpBox: {
      backgroundColor: isDark ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDark ? '#115E59' : '#99F6E4',
      borderRadius: BorderRadius.md,
      padding: 10,
      marginVertical: 6,
    },
    otpTitle: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
    otpSubtitle: {
      fontSize: 10,
      color: isDark ? '#99F6E4' : '#0D9488',
    },
    otpInput: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#115E59' : '#2DD4BF',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: FontSizes.md,
      fontWeight: '700',
      letterSpacing: 4,
      textAlign: 'center',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginVertical: 6,
    },
    otpActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    otpVerifyBtn: {
      flex: 1,
      backgroundColor: CustomerColors.teal700,
      paddingVertical: 8,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpVerifyBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: FontSizes.xs,
    },
    otpSecondaryBtn: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    otpSecondaryBtnText: {
      color: isDark ? '#5EEAD4' : '#0F766E',
      fontSize: 11,
      fontWeight: '600',
    },
  });
