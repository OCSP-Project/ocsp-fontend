import { MaterialRequestDto } from '@/types/material.types';

export interface MaterialNotification {
  id: string;
  type: 'upload' | 'approved' | 'rejected';
  request: MaterialRequestDto;
  timestamp: Date;
  read: boolean;
}

const STORAGE_KEY = 'materialNotifications';

export const materialNotificationHelper = {
  // Get all notifications
  getAll(): MaterialNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  },

  // Add new notification
  add(request: MaterialRequestDto, type: 'upload' | 'approved' | 'rejected') {
    const notifications = this.getAll();

    const newNotification: MaterialNotification = {
      id: `${request.id}-${type}-${Date.now()}`,
      type,
      request,
      timestamp: new Date(),
      read: false,
    };

    const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('materialNotificationAdded', { detail: newNotification }));

    return newNotification;
  },

  // Mark as read
  markAsRead(notificationId: string) {
    const notifications = this.getAll();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event
    window.dispatchEvent(new Event('materialNotificationUpdated'));
  },

  // Mark all as read
  markAllAsRead() {
    const notifications = this.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event
    window.dispatchEvent(new Event('materialNotificationUpdated'));
  },

  // Get unread count
  getUnreadCount(): number {
    const notifications = this.getAll();
    return notifications.filter(n => !n.read).length;
  },

  // Clear all notifications
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('materialNotificationUpdated'));
  },
};
