import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';

// Ported from client/app/hooks/useNotifications.ts — same 60s poll for
// unread count. The subscribe()/updateLocation() Web Push methods are not
// reproduced here (see notificationApi.ts comment); this hook only covers
// the in-app bell/list's unread-count badge.
export function useUnreadNotifications() {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationApi.getAll();
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      // silent — matches web's best-effort polling
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { unreadCount, refetch: fetchUnread };
}
