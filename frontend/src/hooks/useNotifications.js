import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/notifications';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationsAPI.list({ limit: 20 });
      setNotifications(res.data || []);
      setUnreadCount(res.data?.filter(n => !n.is_read).length || 0);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.notification_id === id ? {...n, is_read: true} : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    setUnreadCount(0);
  };

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, addNotification };
};
