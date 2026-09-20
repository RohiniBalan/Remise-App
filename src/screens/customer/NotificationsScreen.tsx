import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, BellOff, CheckCheck, X } from 'lucide-react-native';
import { notificationApi } from '../../api/notificationApi';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark, colors } = useTheme();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch } = useUnreadNotifications();

  const load = useCallback(async () => {
    try {
      const res = await notificationApi.getAll();
      const raw: NotificationItem[] = res.data.data ?? res.data.notifications ?? [];
      // Only display unread / unseen notifications in the card list
      const unreadOnly = raw.filter(n => !n.isRead);
      setItems(unreadOnly);
    } catch (err: any) {
      console.log(
        '[Notifications] load failed:',
        err?.response?.status,
        err?.response?.data || err?.message,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    load();
  }, [refetch, load]);

  const handleMarkRead = async (id: string) => {
    // Immediately remove notification from the card list once seen/dismissed
    setItems(prev => prev.filter(n => n._id !== id));
    try {
      await notificationApi.markRead(id);
      refetch();
    } catch (e) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    // Immediately clear all from the card list
    setItems([]);
    try {
      await notificationApi.markAllRead();
      refetch();
    } catch (e) {
      // silent
    }
  };

  const handleItemPress = (item: NotificationItem) => {
    // Once seen, dismiss/disappear from notification card and mark read
    handleMarkRead(item._id);

    const url = item.url?.toLowerCase() || '';
    if (url.includes('order')) {
      if (user?.role === 'store_owner') {
        navigation.navigate('StoreOwnerTabs', { screen: 'Orders' });
      } else {
        navigation.navigate('CustomerTabs', { screen: 'Orders' });
      }
    } else if (url.includes('cart')) {
      navigation.navigate('CustomerTabs', { screen: 'Cart' });
    } else if (url.includes('wishlist')) {
      navigation.navigate('CustomerTabs', { screen: 'Wishlist' });
    } else if (url.includes('bulk')) {
      navigation.navigate('CustomerTabs', { screen: 'BulkPurchase' });
    } else if (url.includes('offer') || url.includes('nearby')) {
      navigation.navigate('CustomerTabs', { screen: 'Nearby' });
    } else {
      if (user?.role === 'store_owner') {
        navigation.navigate('StoreOwnerTabs', { screen: 'Overview' });
      } else {
        navigation.navigate('CustomerTabs', { screen: 'Home' });
      }
    }
  };

  const hasUnread = items.length > 0;

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg },
        ]}
      >
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg },
      ]}
    >
      {hasUnread && (
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={[
              styles.markAllBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 0, 0, 0.15)'
                  : '#FEE2E2',
              },
            ]}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <CheckCheck size={14} color={CustomerColors.primary} />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={n => n._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={CustomerColors.primary}
            colors={[CustomerColors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIconBg,
                {
                  backgroundColor: isDark
                    ? '#1e293b'
                    : '#F1F5F9',
                },
              ]}
            >
              <BellOff
                size={36}
                color={isDark ? '#64748B' : '#94A3B8'}
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? '#FFFFFF' : CustomerColors.black },
              ]}
            >
              No notifications yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isDark ? '#94A3B8' : CustomerColors.textSecondary },
              ]}
            >
              We'll notify you when offers, order updates, or alerts arrive.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              {
                backgroundColor: isDark ? '#111827' : CustomerColors.white,
                borderColor: isDark ? '#1f2937' : '#FECACA',
              },
            ]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.8}
          >
            {item.image ? (
              <Image source={{ uri: resolveImageUrl(item.image) }} style={styles.rowImage} />
            ) : (
              <View
                style={[
                  styles.rowIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 0, 0, 0.15)'
                      : '#FEE2E2',
                  },
                ]}
              >
                <Bell size={18} color={CustomerColors.primary} />
              </View>
            )}
            <View style={{ flex: 1, paddingRight: Spacing.xs }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: isDark ? '#FFFFFF' : CustomerColors.black },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.rowBody,
                  { color: isDark ? '#9CA3AF' : CustomerColors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {item.body}
              </Text>
              <Text
                style={[
                  styles.rowDate,
                  { color: isDark ? '#6B7280' : '#9CA3AF' },
                ]}
              >
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.dismissBtn, isDark && { backgroundColor: '#1e293b' }]}
              onPress={() => handleMarkRead(item._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Dismiss notification"
            >
              <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  markAllText: {
    color: CustomerColors.primary,
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 1.5,
    gap: Spacing.sm,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rowImage: { width: 44, height: 44, borderRadius: BorderRadius.sm },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  rowBody: {
    fontSize: FontSizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  rowDate: {
    fontSize: 10,
    marginTop: 4,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});