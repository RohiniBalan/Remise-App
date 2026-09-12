import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, 
  TouchableOpacity, Alert, Modal, ScrollView 
} from 'react-native';
import { Search, Shield, Users, Trash2, UserPlus, X, ShieldCheck, Check, RotateCcw } from 'lucide-react-native';
import { adminUserApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';
import { useTheme } from '../../context/ThemeContext';

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admins' },
  { value: 'store_owner', label: 'Store Owners' },
  { value: 'wholesaler', label: 'Wholesalers' },
  { value: 'home_business', label: 'Home Business' },
  { value: 'customer', label: 'Customers' },
];

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin (Full Access)' },
  { value: 'customer', label: 'Customer' },
  { value: 'store_owner', label: 'Store Owner' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'home_business', label: 'Home Business' },
];

export default function AdminUsersScreen() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
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

  const ITEMS_PER_PAGE = 30;

  const loadUsers = () => {
    setLoading(true);
    adminUserApi
      .getAll()
      .then(res => setUsers(res.data.data || res.data || []))
      .catch((err) => {
        console.warn('Failed to fetch users:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRoleFilter]);

  // ── Handle Delete User ──
  const handleDeletePress = (user: any) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.fullname || user.email}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await adminUserApi.delete(user._id);
              if (res.data?.success !== false) {
                setUsers(prev => prev.filter(u => u._id !== user._id));
                Alert.alert('Deleted', `User ${user.fullname || user.email} deleted successfully.`);
              } else {
                Alert.alert('Error', res.data?.message || 'Failed to delete user.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };

  // ── Handle Update Role (Make Admin / Change Role) ──
  const handleRoleSelect = async (newRole: string) => {
    if (!roleChangeTarget) return;
    setUpdatingRole(true);
    try {
      const res = await adminUserApi.updateRole(roleChangeTarget._id, newRole);
      if (res.data?.success !== false) {
        setUsers(prev => prev.map(u => u._id === roleChangeTarget._id ? { ...u, role: newRole } : u));
        Alert.alert('Success', `Role updated to ${newRole} for ${roleChangeTarget.fullname || roleChangeTarget.email}`);
        setRoleChangeTarget(null);
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to update user role.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  // ── Handle Create Admin User ──
  const handleCreateAdmin = async () => {
    if (!adminForm.fullname || !adminForm.email || !adminForm.password) {
      Alert.alert('Validation Error', 'Full Name, Email, and Password are required.');
      return;
    }
    setCreatingAdmin(true);
    try {
      const res = await adminUserApi.createAdmin(adminForm);
      if (res.data?.success !== false) {
        Alert.alert('Success', `Admin account created for ${adminForm.fullname}!`);
        setShowAddAdminModal(false);
        setAdminForm({ fullname: '', email: '', password: '', mobilenumber: '', role: 'admin' });
        loadUsers();
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to create admin.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      // Role Filter
      if (selectedRoleFilter !== 'all') {
        const r = (u.role || 'customer').toLowerCase();
        if (selectedRoleFilter === 'wholesaler' && (r === 'wholesaler' || r === 'whole_saler')) {
          // match
        } else if (selectedRoleFilter === 'customer' && (r === 'customer' || r === 'user')) {
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
    const counts: Record<string, number> = { all: users.length, admin: 0, store_owner: 0, wholesaler: 0, home_business: 0, customer: 0 };
    users.forEach(u => {
      const r = (u.role || 'customer').toLowerCase();
      if (r === 'admin') counts.admin++;
      else if (r === 'store_owner') counts.store_owner++;
      else if (r === 'wholesaler' || r === 'whole_saler') counts.wholesaler++;
      else if (r === 'home_business') counts.home_business++;
      else counts.customer++;
    });
    return counts;
  }, [users]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Top Action Bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, isDark && styles.textWhite]}>User Management</Text>
          <Text style={styles.headerSub}>{users.length} registered accounts</Text>
        </View>

        <TouchableOpacity 
          style={styles.addAdminBtn} 
          onPress={() => setShowAddAdminModal(true)}
        >
          <UserPlus size={14} color="#fff" />
          <Text style={styles.addAdminBtnText}>+ Add Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchRow, isDark && styles.searchRowDark]}>
        <Search size={14} color={AdminColors.textSecondary} />
        <TextInput 
          style={[styles.searchInput, isDark && styles.textWhite]} 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search name, email, phone, role…" 
          placeholderTextColor="#9CA3AF"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={14} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter Chips */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {ROLE_FILTERS.map((rf) => {
            const count = roleCounts[rf.value] ?? 0;
            const active = selectedRoleFilter === rf.value;
            return (
              <TouchableOpacity
                key={rf.value}
                onPress={() => setSelectedRoleFilter(rf.value)}
                style={[
                  styles.filterChip, 
                  isDark && styles.filterChipDark,
                  active && styles.filterChipActive
                ]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
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
        keyExtractor={u => u._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={36} color="#D1D5DB" />
            <Text style={styles.emptyText}>No users found</Text>
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
          return (
            <View style={[styles.row, isDark && styles.rowDark]}>
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              {/* User Details */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, isDark && styles.textWhite]}>{u.fullname || u.email}</Text>
                <Text style={styles.email}>{u.email}{u.mobilenumber ? ` · ${u.mobilenumber}` : ''}</Text>
                
                {/* Role Badge (Clickable to change role / make admin) */}
                <TouchableOpacity 
                  onPress={() => setRoleChangeTarget(u)}
                  style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}
                >
                  {isAdmin ? <Shield size={10} color="#7C3AED" /> : <ShieldCheck size={10} color="#059669" />}
                  <Text style={[styles.roleBadgeText, isAdmin && styles.roleBadgeTextAdmin]}>
                    {u.role || 'customer'}
                  </Text>
                  <Text style={styles.roleChangeHint}>· change</Text>
                </TouchableOpacity>
              </View>

              {/* Actions: Make Admin & Delete */}
              <View style={styles.actionGroup}>
                <TouchableOpacity 
                  style={[styles.roleToggleBtn, isAdmin && styles.roleToggleBtnActive]}
                  onPress={() => setRoleChangeTarget(u)}
                  accessibilityLabel="Change Role"
                >
                  <ShieldCheck size={14} color={isAdmin ? "#7C3AED" : AdminColors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDeletePress(u)}
                  accessibilityLabel="Delete User"
                >
                  <Trash2 size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* ─── MODAL 1: ADD ADMIN / USER ──────────────────────────────────────── */}
      <Modal visible={showAddAdminModal} transparent animationType="slide" onRequestClose={() => setShowAddAdminModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add Admin / User</Text>
              <TouchableOpacity onPress={() => setShowAddAdminModal(false)}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder="e.g. Administrator"
                placeholderTextColor="#9CA3AF"
                value={adminForm.fullname}
                onChangeText={v => setAdminForm(f => ({ ...f, fullname: v }))}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder="admin@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={adminForm.email}
                onChangeText={v => setAdminForm(f => ({ ...f, email: v }))}
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder="Min 6 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={adminForm.password}
                onChangeText={v => setAdminForm(f => ({ ...f, password: v }))}
              />

              <Text style={styles.inputLabel}>Mobile Number (Optional)</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                placeholder="+91 9876543210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={adminForm.mobilenumber}
                onChangeText={v => setAdminForm(f => ({ ...f, mobilenumber: v }))}
              />

              <Text style={styles.inputLabel}>Assign Role</Text>
              <View style={styles.roleOptionsContainer}>
                {AVAILABLE_ROLES.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setAdminForm(f => ({ ...f, role: r.value }))}
                    style={[styles.roleSelectChip, adminForm.role === r.value && styles.roleSelectChipActive]}
                  >
                    <Text style={[styles.roleSelectChipText, adminForm.role === r.value && styles.roleSelectChipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddAdminModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAdmin} disabled={creatingAdmin}>
                {creatingAdmin ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: CHANGE ROLE / MAKE ADMIN ───────────────────────────────── */}
      <Modal visible={!!roleChangeTarget} transparent animationType="fade" onRequestClose={() => setRoleChangeTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Change User Role</Text>
              <TouchableOpacity onPress={() => setRoleChangeTarget(null)}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select role for: <Text style={{ fontWeight: '700' }}>{roleChangeTarget?.fullname || roleChangeTarget?.email}</Text>
            </Text>

            <View style={{ gap: 8, marginVertical: 12 }}>
              {AVAILABLE_ROLES.map(r => {
                const isSelected = roleChangeTarget?.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    disabled={updatingRole}
                    onPress={() => handleRoleSelect(r.value)}
                    style={[styles.roleOptionRow, isSelected && styles.roleOptionRowSelected]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleOptionText, isSelected && styles.roleOptionTextSelected]}>
                        {r.label}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color="#7C3AED" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setRoleChangeTarget(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  containerDark: { backgroundColor: '#0B0F19' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  headerTitleGroup: { flex: 1 },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: AdminColors.textPrimary },
  headerSub: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 2 },
  addAdminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AdminColors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md },
  addAdminBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: 8, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border },
  searchRowDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: '#111827' },
  
  filterScrollWrapper: { marginBottom: 8 },
  filterScroll: { paddingHorizontal: Spacing.md, gap: 6 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border },
  filterChipDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  filterChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  filterChipText: { fontSize: 11, fontWeight: '600', color: AdminColors.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.xs },
  rowDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: AdminColors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: AdminColors.primary },
  name: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
  email: { fontSize: FontSizes.xs, color: AdminColors.textSecondary },
  textWhite: { color: '#F9FAFB' },
  
  roleBadge: { flexDirection: 'row', gap: 3, alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill, alignSelf: 'flex-start', marginTop: 4 },
  roleBadgeAdmin: { backgroundColor: '#F5F3FF' },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'capitalize' },
  roleBadgeTextAdmin: { color: '#7C3AED' },
  roleChangeHint: { fontSize: 9, color: '#9CA3AF' },

  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleToggleBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  roleToggleBtnActive: { backgroundColor: '#F5F3FF' },
  deleteBtn: { padding: 6, borderRadius: 8, backgroundColor: '#FEE2E2' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: AdminColors.textSecondary, fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  modalCardDark: { backgroundColor: '#111827' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalHeaderTitle: { fontSize: FontSizes.md, fontWeight: '800', color: AdminColors.textPrimary },
  modalSub: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginBottom: 8 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: AdminColors.textSecondary, textTransform: 'uppercase', marginTop: 8, marginBottom: 4 },
  formInput: { borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 8, fontSize: FontSizes.sm, color: '#111827', backgroundColor: '#F9FAFB' },
  formInputDark: { backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' },
  
  roleOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  roleSelectChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: AdminColors.border, backgroundColor: '#fff' },
  roleSelectChipActive: { borderColor: AdminColors.primary, backgroundColor: AdminColors.primaryLight },
  roleSelectChipText: { fontSize: 11, fontWeight: '600', color: AdminColors.textSecondary },
  roleSelectChipTextActive: { color: AdminColors.primary, fontWeight: '700' },

  roleOptionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, backgroundColor: '#fff' },
  roleOptionRowSelected: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
  roleOptionText: { fontSize: FontSizes.sm, fontWeight: '600', color: AdminColors.textPrimary },
  roleOptionTextSelected: { color: '#7C3AED', fontWeight: '700' },

  modalFooter: { flexDirection: 'row', gap: 10, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary },
  submitBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: AdminColors.primary, alignItems: 'center' },
  submitBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#fff' },
});
