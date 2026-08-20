import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Search, Shield, Users } from 'lucide-react-native';
import { adminUserApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    adminUserApi.getAll().then(res => setUsers(res.data.data || res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(u => u.fullname?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.mobilenumber?.includes(q));
  }, [users, search]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Search size={14} color={AdminColors.textSecondary} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search name, email, phone…" />
      </View>
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
          <PaginationControl
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        }
        renderItem={({ item: u }) => {
          const initials = (u.fullname || u.email || 'U').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
          const isAdmin = u.role === 'admin';
          return (
            <View style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.fullname || u.email}</Text>
                <Text style={styles.email}>{u.email}{u.mobilenumber ? ` · ${u.mobilenumber}` : ''}</Text>
              </View>
              <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
                {isAdmin && <Shield size={10} color="#7C3AED" />}
                <Text style={[styles.roleBadgeText, isAdmin && styles.roleBadgeTextAdmin]}>{u.role}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', margin: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  list: { paddingHorizontal: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.xs },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: AdminColors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: AdminColors.primary },
  name: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
  email: { fontSize: FontSizes.xs, color: AdminColors.textSecondary },
  roleBadge: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.pill },
  roleBadgeAdmin: { backgroundColor: '#F5F3FF' },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'capitalize' },
  roleBadgeTextAdmin: { color: '#7C3AED' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: AdminColors.textSecondary, fontWeight: '600' },
});

