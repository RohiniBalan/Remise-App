import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notificationApi';

interface NotificationContextType {
  unreadCount: number;
  refetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refetch: async () => {},
  markRead: async () => {},
  markAllRead: async () => {},
  setUnreadCount: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnread = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationApi.getAll();
      const count = typeof res.data?.unreadCount === 'number'
        ? res.data.unreadCount
        : (res.data?.data ?? res.data?.notifications ?? []).filter((n: any) => !n.isRead).length;
      setUnreadCount(count ?? 0);
    } catch {
      // silent — best effort polling
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const markRead = useCallback(async (id: string) => {
    // Optimistically decrement unread count immediately across all listening screens
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationApi.markRead(id);
      await fetchUnread();
    } catch {
      fetchUnread();
    }
  }, [fetchUnread]);

  const markAllRead = useCallback(async () => {
    // Optimistically reset count to 0 immediately across all screens
    setUnreadCount(0);
    try {
      await notificationApi.markAllRead();
      await fetchUnread();
    } catch {
      fetchUnread();
    }
  }, [fetchUnread]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refetch: fetchUnread,
        markRead,
        markAllRead,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export const useUnreadNotifications = () => useContext(NotificationContext);
