import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { adminContactApi } from '../../api/adminContentApi';
import { useAdminContent } from '../../hooks/useAdminContent';
import AdminContentLayout from '../../components/admin/AdminContentLayout';
import AdminField from '../../components/admin/AdminField';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/admin/contact/page.tsx — same fields
// (title/subtitle/email/phone/address/hoursWeekday/hoursSaturday/
// hoursSunday), GET/PUT/`/reset` /contact, plus a read-only Messages tab
// (GET /contact/messages — no delete/reply capability on web either).
interface ContactData {
  title: string; subtitle: string; email: string; phone: string; address: string;
  hoursWeekday: string; hoursSaturday: string; hoursSunday: string;
}
const DEFAULTS: ContactData = { title: '', subtitle: '', email: '', phone: '', address: '', hoursWeekday: '', hoursSaturday: '', hoursSunday: '' };

export default function AdminContactScreen() {
  const [tab, setTab] = useState<'edit' | 'messages'>('edit');
  const { data, setData, loading, saving, status, save, reset } = useAdminContent(adminContactApi, DEFAULTS);
  const set = (k: keyof ContactData, v: string) => setData(d => ({ ...d, [k]: v }));

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'edit' && styles.tabActive]} onPress={() => setTab('edit')}>
          <Text style={[styles.tabText, tab === 'edit' && styles.tabTextActive]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'messages' && styles.tabActive]} onPress={() => setTab('messages')}>
          <Text style={[styles.tabText, tab === 'messages' && styles.tabTextActive]}>Messages</Text>
        </TouchableOpacity>
      </View>

      {tab === 'edit' ? (
        <AdminContentLayout loading={loading} saving={saving} status={status} onSave={save} onReset={reset}>
          <AdminField label="Title" value={data.title} onChangeText={v => set('title', v)} />
          <AdminField label="Subtitle" value={data.subtitle} onChangeText={v => set('subtitle', v)} />
          <AdminField label="Email" value={data.email} onChangeText={v => set('email', v)} keyboardType="email-address" />
          <AdminField label="Phone" value={data.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
          <AdminField label="Address" value={data.address} onChangeText={v => set('address', v)} />
          <AdminField label="Weekday Hours" value={data.hoursWeekday} onChangeText={v => set('hoursWeekday', v)} />
          <AdminField label="Saturday Hours" value={data.hoursSaturday} onChangeText={v => set('hoursSaturday', v)} />
          <AdminField label="Sunday Hours" value={data.hoursSunday} onChangeText={v => set('hoursSunday', v)} />
        </AdminContentLayout>
      ) : (
        <MessagesTab />
      )}
    </View>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminContactApi.getMessages().then(res => setMessages(res.data.data || res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  return (
    <FlatList
      data={messages}
      keyExtractor={m => m._id}
      contentContainerStyle={{ padding: Spacing.lg }}
      ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
      renderItem={({ item: m }) => (
        <View style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageName}>{m.name}</Text>
            <Text style={styles.messageDate}>{new Date(m.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.messageMeta}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</Text>
          <Text style={styles.messageBody}>{m.message}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: AdminColors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '600', color: AdminColors.textSecondary },
  tabTextActive: { color: AdminColors.primary },
  emptyText: { textAlign: 'center', color: AdminColors.textSecondary, marginTop: Spacing.xl },
  messageCard: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  messageName: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
  messageDate: { fontSize: 10, color: AdminColors.textMuted },
  messageMeta: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 2 },
  messageBody: { fontSize: FontSizes.sm, color: '#374151', marginTop: Spacing.xs },
});
