import { LoggerFactory } from '../logger/LoggerFactory';
import { generateUUID } from '../../utils/uuid';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  key: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  action?: NotificationAction;
  read: boolean;
  timestamp: number;
}

type NotificationListener = (notification: AppNotification) => void;

export class NotificationService {
  private static instance: NotificationService;
  private logger = LoggerFactory.getInstance().createLogger('NotificationService');
  private notifications: AppNotification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private maxNotifications = 100;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  notify(title: string, message: string, severity: NotificationSeverity, action?: NotificationAction): void {
    const notification: AppNotification = {
      id: generateUUID(),
      title,
      message,
      severity,
      action,
      read: false,
      timestamp: Date.now(),
    };

    this.notifications.unshift(notification);

    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.logger.info(`Notification: [${severity}] ${title} - ${message}`);

    for (const listener of this.listeners) {
      try {
        listener(notification);
      } catch (err) {
        this.logger.error({ message: 'Notification listener error' }, err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  addListener(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAll(): AppNotification[] {
    return [...this.notifications];
  }

  getUnread(): AppNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllRead(): void {
    for (const notification of this.notifications) {
      notification.read = true;
    }
  }

  clearAll(): void {
    this.notifications = [];
  }

  getLatest(): AppNotification | null {
    return this.notifications[0] ?? null;
  }
}

export const notificationService = NotificationService.getInstance();
