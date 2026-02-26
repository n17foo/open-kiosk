import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { notificationService, AppNotification } from '../services/notifications/NotificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  latestToast: AppNotification | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  latestToast: null,
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
  dismissToast: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [latestToast, setLatestToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.addListener(notification => {
      setNotifications(notificationService.getAll());
      setLatestToast(notification);

      // Auto-dismiss toast after 4 seconds
      setTimeout(() => {
        setLatestToast(current => (current?.id === notification.id ? null : current));
      }, 4000);
    });
    return unsubscribe;
  }, []);

  const markRead = useCallback((id: string) => {
    notificationService.markRead(id);
    setNotifications(notificationService.getAll());
  }, []);

  const markAllRead = useCallback(() => {
    notificationService.markAllRead();
    setNotifications(notificationService.getAll());
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
    setNotifications([]);
  }, []);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      latestToast,
      markRead,
      markAllRead,
      clearAll,
      dismissToast,
    }),
    [notifications, unreadCount, latestToast, markRead, markAllRead, clearAll, dismissToast]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
