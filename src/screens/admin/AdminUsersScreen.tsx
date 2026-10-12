import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, 
  TouchableOpacity, Alert, Modal, ScrollView, Platform, KeyboardAvoidingView 
} from 'react-native';
import { 
  Search, Shield, Users, Trash2, UserPlus, X, ShieldCheck, Check, 
  RotateCcw, Eye, EyeOff, AlertTriangle 
} from 'lucide-react-native';
import { adminUserApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius, getAdminColors } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, translateDate } from '../../i18n';

export default function AdminUsersScreen() {
  const { isDark } = useTheme();
  const themeColors = getAdminColors(isDark);
  const { t, language } = useTranslation();

  // Core list state
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullname: '',
    email: '',
    password: '',
    mobilenumber: '',
    role: 'admin',
  });

  const [roleChangeTarget, setRoleChangeTarget] = useState<any | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Custom Delete Modal state
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const ITEMS_PER_PAGE = 30;

  const roleFilters = useMemo(() => [
    { value: 'all', label: t('admin.allFilter') },
    { value: 'admin', label: t('admin.adminsFilter') },
    { value: 'store_owner', label: t('admin.storeOwnersFilter') },
    { value: 'wholesaler', label: t('admin.wholesalersFilter') },
    { value: 'home_business', label: t('admin.homeBusinessFilter') },
    { value: 'user', label: t('admin.usersFilter') },
  ], [t, language]);

  const availableRoles = useMemo(() => [
    { value: 'admin', label: t('admin.roleAdminFull') },
    { value: 'user', label: t('admin.roleUser') },
    { value: 'store_owner', label: t('admin.roleStoreOwner') },
    { value: 'wholesaler', label: t('admin.roleWholesaler') },
    { value: 'home_business', label: t('admin.roleHomeBusiness') },
  ], [t, language]);

  const loadUsers = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminUserApi.getAll();
      const userList = res.data?.data || (Array.isArray(res.data) ? res.data : res.data?.users || []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.warn('Failed to fetch real users from gateway:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRoleFilter]);

  // ── Format Role Display Text ──
  const formatRoleText = useCallback((role: string) => {
    const r = (role || 'user').toLowerCase();
    if (r === 'user') return t('admin.roleUser');
    if (r === 'admin') return t('admin.roleAdmin');
    if (r === 'store_owner') return t('admin.roleStoreOwner');
    if (r === 'wholesaler' || r === 'whole_saler') return t('admin.roleWholesaler');
    if (r === 'home_business') return t('admin.roleHomeBusiness');
    if (r === 'delivery_partner' || r === 'delivery_person') return t('admin.roleDeliveryPartner');
    return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [t]);

  // ── Handle Delete User Trigger ──
  const handleDeletePress = (user: any) => {
    setUserToDelete(user);
  };

  // ── Handle Confirmed Delete User ──
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    const targetName = userToDelete.fullname || userToDelete.email || 'User';
    try {
      const res = await adminUserApi.delete(userToDelete._id);
      if (res.data?.success !== false) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        setUserToDelete(null);
      } else {
        Alert.alert(t('common.error'), res.data?.message || t('admin.failedDeleteUser'));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('admin.failedDeleteUser'));
    } finally {
      setDeletingUser(false);
    }
  };

  // ── Handle Update Role (Make Admin / Change Role) ──
  const handleRoleSelect = async (newRole: string) => {
    if (!roleChangeTarget) return;
    setUpdatingRole(true);
    const targetName = roleChangeTarget.fullname || roleChangeTarget.email || 'User';
    try {
      const res = await adminUserApi.updateRole(roleChangeTarget._id, newRole);
      if (res.data?.success !== false) {
        setUsers(prev => prev.map(u => u._id === roleChangeTarget._id ? { ...u, role: newRole } : u));
        Alert.alert(t('common.success'), t('admin.roleUpdatedSuccess', { role: formatRoleText(newRole), name: targetName }));
        setRoleChangeTarget(null);
      } else {
        Alert.alert(t('common.error'), res.data?.message || t('admin.failedUpdateRole'));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('admin.failedUpdateRole'));
    } finally {
      setUpdatingRole(false);
    }
  };

  // ── Handle Create Admin User ──
  const handleCreateAdmin = async () => {
    if (!adminForm.fullname || !adminForm.email || !adminForm.password || !adminForm.mobilenumber?.trim()) {
      Alert.alert(t('admin.validationError'), t('admin.allFieldsRequired'));
      return;
    }
    setCreatingAdmin(true);
    try {
      const res = await adminUserApi.createAdmin(adminForm);
      if (res.data?.success !== false) {
        Alert.alert(t('common.success'), t('admin.accountCreatedSuccess', { name: adminForm.fullname }));
        setShowAddAdminModal(false);
        setAdminForm({ fullname: '', email: '', password: '', mobilenumber: '', role: 'admin' });
        loadUsers();
      } else {
        Alert.alert(t('common.error'), res.data?.message || t('admin.failedCreateAccount'));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('admin.failedCreateAccount'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      // Role Filter
      if (selectedRoleFilter !== 'all') {
        const r = (u.role || 'user').toLowerCase();
        if (selectedRoleFilter === 'wholesaler' && (r === 'wholesaler' || r === 'whole_saler')) {
          // match
        } else if (selectedRoleFilter === 'user' && r === 'user') {
          // match
        } else if (r !== selectedRoleFilter) {
          return false;
        }
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (u.fullname?.toLowerCase() || '').includes(q);
        const matchEmail = (u.email?.toLowerCase() || '').includes(q);
        const matchPhone = (u.mobilenumber || '').includes(q);
        const matchRole = (u.role?.toLowerCase() || '').includes(q);
        return matchName || matchEmail || matchPhone || matchRole;
      }

      return true;
    });
  }, [users, search, selectedRoleFilter]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length, admin: 0, store_owner: 0, wholesaler: 0, home_business: 0, user: 0 };
    users.forEach(u => {
      const r = (u.role || 'user').toLowerCase();
      if (r === 'admin') counts.admin++;
      else if (r === 'store_owner') counts.store_owner++;
      else if (r === 'wholesaler' || r === 'whole_saler') counts.wholesaler++;
      else if (r === 'home_business') counts.home_business++;
      else counts.user++;
    });
    return counts;
  }, [users]);

  const getRoleBadgeStyle = (role: string) => {
    const r = (role || 'user').toLowerCase();
    if (r === 'admin') return { bg: isDark ? '#3B0764' : '#F5F3FF', text: isDark ? '#D8B4FE' : '#6D28D9', border: isDark ? '#581C87' : '#DDD6FE' };
    if (r === 'store_owner') return { bg: isDark ? '#064E3B' : '#ECFDF5', text: isDark ? '#6EE7B7' : '#059669', border: isDark ? '#047857' : '#A7F3D0' };
    if (r === 'wholesaler' || r === 'whole_saler') return { bg: isDark ? '#1E3A8A' : '#EFF6FF', text: isDark ? '#93C5FD' : '#2563EB', border: isDark ? '#1D4ED8' : '#BFDBFE' };
    if (r === 'home_business') return { bg: isDark ? '#78350F' : '#FFFBEB', text: isDark ? '#FCD34D' : '#D97706', border: isDark ? '#B45309' : '#FDE68A' };
    if (r === 'delivery_partner' || r === 'delivery_person') return { bg: isDark ? '#1E293B' : '#F1F5F9', text: isDark ? '#38BDF8' : '#0284C7', border: isDark ? '#0369A1' : '#BAE6FD' };
    return { bg: isDark ? '#1F2937' : '#F3F4F6', text: isDark ? '#9CA3AF' : '#4B5563', border: isDark ? '#374151' : '#E5E7EB' };
  };

  if (loading) return <View style={[styles.center, { backgroundColor: themeColors.bg }]}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Top Action Bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {t('admin.userManagement')}
          </Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {users.length === 1 ? t('admin.registeredAccountsSingle') : t('admin.registeredAccounts', { count: users.length })}
          </Text>
        </View>

        <View style={styles.headerActionsGroup}>
          <TouchableOpacity 
            style={[styles.refreshIconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} 
            onPress={() => loadUsers(true)}
            accessibilityLabel={t('common.refresh')}
          >
            <RotateCcw size={15} color={themeColors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addAdminBtn} 
            onPress={() => setShowAddAdminModal(true)}
          >
            <UserPlus size={14} color="#fff" />
            <Text style={styles.addAdminBtnText}>{t('admin.addAdmin')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchRow, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Search size={14} color={themeColors.textSecondary} />
        <TextInput 
          style={[styles.searchInput, { color: themeColors.textPrimary }]} 
          value={search} 
          onChangeText={setSearch} 
          placeholder={t('admin.searchUsersPlaceholder')} 
          placeholderTextColor={themeColors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={14} color={themeColors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter Chips */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {roleFilters.map((rf) => {
            const count = roleCounts[rf.value] ?? 0;
            const active = selectedRoleFilter === rf.value;
            return (
              <TouchableOpacity
                key={rf.value}
                onPress={() => setSelectedRoleFilter(rf.value)}
                style={[
                  styles.filterChip, 
                  { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
                  active && styles.filterChipActive
                ]}
              >
                <Text style={[styles.filterChipText, { color: isDark ? '#D1D5DB' : AdminColors.textSecondary }, active && styles.filterChipTextActive]}>
                  {rf.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Users List */}
      <FlatList
        data={paginated}
        keyExtractor={u => u._id || String(Math.random())}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => loadUsers(true)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={36} color={themeColors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{t('admin.noUsersFound')}</Text>
          </View>
        }
        ListFooterComponent={
          filtered.length > ITEMS_PER_PAGE ? (
            <PaginationControl
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          ) : null
        }
        renderItem={({ item: u }) => {
          const initials = (u.fullname || u.email || 'U').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
          const isAdmin = u.role === 'admin';
          const badgeTheme = getRoleBadgeStyle(u.role);
          const formattedDate = u.createdAt ? translateDate(u.createdAt, language) : null;

          return (
            <View style={[styles.row, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              {/* Avatar */}
              <View style={[styles.avatar, isDark && { backgroundColor: '#450A0A' }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              {/* User Details */}
              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                    {u.fullname || u.email}
                  </Text>
                  {u.googleId && (
                    <View style={styles.googleBadge}>
                      <Text style={styles.googleBadgeText}>Google</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.email, { color: themeColors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                  {u.email}{u.mobilenumber ? ` · ${u.mobilenumber}` : ''}
                </Text>

                {formattedDate && (
                  <Text style={[styles.joinedText, { color: themeColors.textMuted }]} numberOfLines={1}>
                    {t('admin.joinedOn', { date: formattedDate })}
                  </Text>
                )}
                
                {/* Role Badge (Clickable to change role / make admin) */}
                <TouchableOpacity 
                  onPress={() => setRoleChangeTarget(u)}
                  style={[
                    styles.roleBadge, 
                    { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border }
                  ]}
                  activeOpacity={0.7}
                >
                  {isAdmin ? <Shield size={10} color={badgeTheme.text} /> : <ShieldCheck size={10} color={badgeTheme.text} />}
                  <Text style={[styles.roleBadgeText, { color: badgeTheme.text }]} numberOfLines={1}>
                    {formatRoleText(u.role)}
                  </Text>
                  <Text style={[styles.roleChangeHint, { color: themeColors.textMuted }]}>
                    {' · '}{t('admin.changeRoleHint')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actions: Make Admin & Delete */}
              <View style={styles.actionGroup}>
                <TouchableOpacity 
                  style={[
                    styles.roleToggleBtn, 
                    isDark ? { backgroundColor: '#1F2937' } : { backgroundColor: '#F3F4F6' },
                    isAdmin && (isDark ? { backgroundColor: '#3B0764' } : styles.roleToggleBtnActive)
                  ]}
                  onPress={() => setRoleChangeTarget(u)}
                  accessibilityLabel={t('admin.changeRole')}
                >
                  <ShieldCheck size={14} color={isAdmin ? (isDark ? "#C084FC" : "#7C3AED") : (isDark ? "#9CA3AF" : AdminColors.textSecondary)} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.deleteBtn, isDark && { backgroundColor: '#450A0A' }]}
                  onPress={() => handleDeletePress(u)}
                  accessibilityLabel={t('admin.deleteUser')}
                >
                  <Trash2 size={15} color={isDark ? "#F87171" : "#EF4444"} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* ─── MODAL 1: ADD ADMIN / USER ──────────────────────────────────────── */}
      <Modal visible={showAddAdminModal} transparent animationType="slide" onRequestClose={() => setShowAddAdminModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, isDark && styles.textWhite]}>
                {t('admin.addAdminModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setShowAddAdminModal(false)}>
                <X size={18} color={isDark ? '#9CA3AF' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView} 
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                {t('admin.fullName')} *
              </Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder={t('admin.fullNamePlaceholder')}
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={adminForm.fullname}
                onChangeText={v => setAdminForm(f => ({ ...f, fullname: v }))}
              />

              <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                {t('admin.emailAddress')} *
              </Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder={t('admin.emailPlaceholder')}
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                autoCapitalize="none"
                keyboardType="email-address"
                value={adminForm.email}
                onChangeText={v => setAdminForm(f => ({ ...f, email: v }))}
              />

              <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                {t('admin.passwordLabel')} *
              </Text>
              <View style={[styles.passwordInputContainer, isDark && styles.passwordInputContainerDark]}>
                <TextInput
                  style={[styles.passwordInput, isDark && styles.textWhite]}
                  placeholder={t('admin.passwordMinCharacters')}
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  secureTextEntry={!showPassword}
                  value={adminForm.password}
                  onChangeText={v => setAdminForm(f => ({ ...f, password: v }))}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff size={18} color={isDark ? '#9CA3AF' : '#64748b'} />
                  ) : (
                    <Eye size={18} color={isDark ? '#9CA3AF' : '#64748b'} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                {t('admin.mobileNumberLabel')} *
              </Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder={t('admin.mobilePlaceholder')}
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                keyboardType="phone-pad"
                value={adminForm.mobilenumber}
                onChangeText={v => setAdminForm(f => ({ ...f, mobilenumber: v }))}
              />

              <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                {t('admin.assignRole')}
              </Text>
              <View style={styles.roleOptionsContainer}>
                {availableRoles.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setAdminForm(f => ({ ...f, role: r.value }))}
                    style={[styles.roleSelectChip, isDark && styles.roleSelectChipDark, adminForm.role === r.value && styles.roleSelectChipActive]}
                  >
                    <Text style={[styles.roleSelectChipText, isDark && styles.textWhite, adminForm.role === r.value && styles.roleSelectChipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.cancelBtn, isDark && styles.cancelBtnDark]} onPress={() => setShowAddAdminModal(false)}>
                <Text style={[styles.cancelBtnText, isDark && styles.textWhite]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAdmin} disabled={creatingAdmin}>
                {creatingAdmin ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('admin.createAccount')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL 2: CHANGE ROLE / MAKE ADMIN ───────────────────────────────── */}
      <Modal visible={!!roleChangeTarget} transparent animationType="fade" onRequestClose={() => setRoleChangeTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, isDark && styles.textWhite]}>
                {t('admin.changeUserRoleTitle')}
              </Text>
              <TouchableOpacity onPress={() => setRoleChangeTarget(null)}>
                <X size={18} color={isDark ? '#9CA3AF' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, isDark && styles.textMutedDark]} numberOfLines={2}>
              {t('admin.selectRoleFor', { name: roleChangeTarget?.fullname || roleChangeTarget?.email || '' })}
            </Text>

            <ScrollView style={styles.roleOptionsScrollView} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {availableRoles.map(r => {
                const isSelected = roleChangeTarget?.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    disabled={updatingRole}
                    onPress={() => handleRoleSelect(r.value)}
                    style={[styles.roleOptionRow, isDark && styles.roleOptionRowDark, isSelected && styles.roleOptionRowSelected]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.roleOptionText, isDark && styles.textWhite, isSelected && styles.roleOptionTextSelected]}>
                        {r.label}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color="#7C3AED" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.cancelBtn, isDark && styles.cancelBtnDark, { marginTop: Spacing.md }]} onPress={() => setRoleChangeTarget(null)}>
              <Text style={[styles.cancelBtnText, isDark && styles.textWhite]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 3: CUSTOM DELETE USER MODAL ──────────────────────────────── */}
      <Modal 
        visible={!!userToDelete} 
        transparent 
        animationType="fade" 
        onRequestClose={() => {
          if (!deletingUser) setUserToDelete(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.deleteModalCard, isDark && styles.modalCardDark]}>
            {/* Top Warning Icon Badge */}
            <View style={[styles.deleteIconBadge, isDark ? { backgroundColor: 'rgba(239, 68, 68, 0.18)' } : { backgroundColor: '#FEE2E2' }]}>
              <Trash2 size={26} color="#EF4444" />
            </View>

            {/* Modal Title */}
            <Text style={[styles.deleteModalTitle, isDark && styles.textWhite]}>
              {t('admin.deleteUserModalTitle')}
            </Text>

            {/* Confirm Question */}
            <Text style={[styles.deleteModalDesc, { color: themeColors.textSecondary }]}>
              {t('admin.deleteUserConfirmQuestion', { name: userToDelete?.fullname || userToDelete?.email || 'User' })}
            </Text>

            {/* Target Item Details Card */}
            {userToDelete && (
              <View style={[styles.deleteTargetBox, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: themeColors.border }]}>
                <View style={[styles.avatarSmall, isDark && { backgroundColor: '#450A0A' }]}>
                  <Text style={styles.avatarSmallText}>
                    {(userToDelete.fullname || userToDelete.email || 'U').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.deleteTargetName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                    {userToDelete.fullname || userToDelete.email}
                  </Text>
                  <Text style={[styles.deleteTargetEmail, { color: themeColors.textSecondary }]} numberOfLines={1}>
                    {userToDelete.email}
                  </Text>
                </View>
                <View style={[styles.roleBadgeSmall, { backgroundColor: getRoleBadgeStyle(userToDelete.role).bg, borderColor: getRoleBadgeStyle(userToDelete.role).border }]}>
                  <Text style={[styles.roleBadgeSmallText, { color: getRoleBadgeStyle(userToDelete.role).text }]}>
                    {formatRoleText(userToDelete.role)}
                  </Text>
                </View>
              </View>
            )}

            {/* Permanent Warning Row */}
            <View style={[styles.deleteWarningBox, isDark ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : { backgroundColor: '#FEF2F2' }]}>
              <AlertTriangle size={15} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
              <Text style={[styles.deleteWarningText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                {t('admin.deleteUserPermanentWarning')}
              </Text>
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, isDark && styles.cancelBtnDark]}
                onPress={() => setUserToDelete(null)}
                disabled={deletingUser}
              >
                <Text style={[styles.cancelBtnText, isDark && styles.textWhite]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteConfirmBtn, deletingUser && { opacity: 0.7 }]}
                onPress={handleConfirmDelete}
                disabled={deletingUser}
              >
                {deletingUser ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Trash2 size={15} color="#fff" />
                    <Text style={styles.deleteConfirmBtnText}>
                      {t('admin.deleteConfirmBtn')}
                    </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.md, 
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleGroup: { flex: 1, minWidth: 150 },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: AdminColors.textPrimary },
  headerSub: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 2 },
  headerActionsGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  refreshIconButton: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addAdminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AdminColors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md },
  addAdminBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },

  searchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm, 
    backgroundColor: '#fff', 
    marginHorizontal: Spacing.md, 
    marginTop: Spacing.sm, 
    marginBottom: 8, 
    paddingHorizontal: Spacing.md, 
    borderRadius: BorderRadius.md, 
    borderWidth: 1, 
    borderColor: AdminColors.border 
  },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: '#111827' },
  
  filterScrollWrapper: { marginBottom: 8 },
  filterScroll: { paddingHorizontal: Spacing.md, paddingRight: Spacing.xl, gap: 6 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border },
  filterChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  filterChipText: { fontSize: 11, fontWeight: '600', color: AdminColors.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },

  list: { paddingHorizontal: Spacing.md, paddingBottom: 50 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.md, 
    backgroundColor: '#fff', 
    borderRadius: BorderRadius.md, 
    borderWidth: 1, 
    borderColor: AdminColors.border, 
    padding: Spacing.md, 
    marginBottom: Spacing.xs 
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: AdminColors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontWeight: '800', color: AdminColors.primary },
  
  userDetails: { flex: 1, minWidth: 0, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary, flexShrink: 1 },
  email: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 1 },
  joinedText: { fontSize: 10, marginTop: 2 },
  googleBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  googleBadgeText: { fontSize: 9, fontWeight: '700', color: '#2563EB' },
  textWhite: { color: '#F9FAFB' },
  textMutedDark: { color: '#9CA3AF' },
  
  roleBadge: { 
    flexDirection: 'row', 
    gap: 3, 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: BorderRadius.pill, 
    alignSelf: 'flex-start', 
    marginTop: 4, 
    borderWidth: 1,
    maxWidth: '100%',
    flexWrap: 'wrap'
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700' },
  roleChangeHint: { fontSize: 9 },

  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  roleToggleBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  roleToggleBtnActive: { backgroundColor: '#F5F3FF' },
  deleteBtn: { padding: 6, borderRadius: 8, backgroundColor: '#FEE2E2' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: AdminColors.textSecondary, fontWeight: '600' },

  // Modals
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.65)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: Spacing.md 
  },
  modalCard: { 
    width: '100%', 
    maxWidth: 420, 
    maxHeight: '90%',
    backgroundColor: '#fff', 
    borderRadius: BorderRadius.lg, 
    padding: Spacing.lg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5 
  },
  modalCardDark: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  modalHeaderTitle: { fontSize: FontSizes.md, fontWeight: '800', color: AdminColors.textPrimary },
  modalSub: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginBottom: 8 },
  modalScrollView: { maxHeight: 360, flexShrink: 1 },
  modalScrollContent: { paddingBottom: Spacing.sm },
  roleOptionsScrollView: { maxHeight: 280, flexShrink: 1 },

  inputLabel: { fontSize: 11, fontWeight: '700', color: AdminColors.textSecondary, marginTop: 8, marginBottom: 4 },
  formInput: { borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 8, fontSize: FontSizes.sm, color: '#111827', backgroundColor: '#F9FAFB' },
  formInputDark: { backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, backgroundColor: '#F9FAFB', paddingHorizontal: 10 },
  passwordInputContainerDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  passwordInput: { flex: 1, paddingVertical: 8, fontSize: FontSizes.sm, color: '#111827' },
  eyeBtn: { padding: 4 },
  
  roleOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  roleSelectChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: AdminColors.border, backgroundColor: '#fff' },
  roleSelectChipDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  roleSelectChipActive: { borderColor: AdminColors.primary, backgroundColor: AdminColors.primaryLight },
  roleSelectChipText: { fontSize: 11, fontWeight: '600', color: AdminColors.textSecondary },
  roleSelectChipTextActive: { color: AdminColors.primary, fontWeight: '700' },

  roleOptionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, backgroundColor: '#fff' },
  roleOptionRowDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  roleOptionRowSelected: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
  roleOptionText: { fontSize: FontSizes.sm, fontWeight: '600', color: AdminColors.textPrimary },
  roleOptionTextSelected: { color: '#7C3AED', fontWeight: '700' },

  modalFooter: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cancelBtnDark: { backgroundColor: '#374151' },
  cancelBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary },
  submitBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: AdminColors.primary, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#fff' },

  // Custom Delete Modal Specific Styles
  deleteModalCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  deleteIconBadge: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  deleteModalTitle: { fontSize: FontSizes.lg, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  deleteModalDesc: { fontSize: FontSizes.sm, textAlign: 'center', marginBottom: Spacing.md, paddingHorizontal: Spacing.sm },
  deleteTargetBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    width: '100%', 
    padding: 10, 
    borderRadius: BorderRadius.md, 
    borderWidth: 1, 
    marginBottom: Spacing.md 
  },
  avatarSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: AdminColors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { fontSize: 12, fontWeight: '800', color: AdminColors.primary },
  deleteTargetName: { fontSize: FontSizes.sm, fontWeight: '700' },
  deleteTargetEmail: { fontSize: 11 },
  roleBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  roleBadgeSmallText: { fontSize: 9, fontWeight: '700' },
  deleteWarningBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 8, 
    width: '100%', 
    padding: 10, 
    borderRadius: BorderRadius.md, 
    marginBottom: Spacing.lg 
  },
  deleteWarningText: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },
  deleteModalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  deleteCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: BorderRadius.md, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtn: { 
    flex: 1.3, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    paddingVertical: 11, 
    borderRadius: BorderRadius.md, 
    backgroundColor: '#DC2626' 
  },
  deleteConfirmBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
});
