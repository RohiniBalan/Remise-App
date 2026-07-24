import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, BellOff } from 'lucide-react-native';
import { notificationApi } from '../../api/notificationApi';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useAuth }  from '../../context/AuthContext';

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  image?: string | null;
  url?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { refetch } = useUnreadNotifications();

  const load = () => {
    notificationApi
      .getAll()
      .then(res => {
        console.log('[Notifications] response:', JSON.stringify(res.data));
        setItems(res.data.data ?? res.data.notifications ?? []);
      })
      .catch(err => {
        console.log('[Notifications] load failed:', err?.response?.status, err?.response?.data || err?.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    setItems(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    await notificationApi.markRead(id);
    refetch();
  };

  const handleMarkAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    await notificationApi.markAllRead();
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.some(n => !n.isRead) && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={items}
        keyExtractor={n => n._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BellOff size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, !item.isRead && styles.rowUnread]}
            onPress={() => {
              if (!item.isRead) handleMarkRead(item._id);
              if (user?.role === 'store_owner') {
                navigation.navigate('StoreOwnerTabs', { screen: 'Overview' });
              } else {
                navigation.navigate('CustomerTabs', { screen: 'Nearby' });
              }
            }}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.rowImage} />
            ) : (
              <View style={styles.rowIcon}><Bell size={16} color={CustomerColors.teal600} /></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  markAllBtn: { alignSelf: 'flex-end', margin: Spacing.md },
  markAllText: { color: CustomerColors.teal700, fontWeight: '700', fontSize: FontSizes.xs },
  list: { padding: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: CustomerColors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  rowUnread: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  rowImage: { width: 40, height: 40, borderRadius: BorderRadius.sm },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: CustomerColors.black },
  rowBody: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  rowDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' },
});