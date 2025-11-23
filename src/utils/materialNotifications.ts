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

  // Check if notification already exists for this request and type
  hasNotification(requestId: string, type: 'upload' | 'approved' | 'rejected'): boolean {
    const notifications = this.getAll();
    return notifications.some(n =>
      n.request.id === requestId && n.type === type
    );
  },

  // Add new notification
  add(request: MaterialRequestDto, type: 'upload' | 'approved' | 'rejected') {
    const notifications = this.getAll();

    // Check if notification already exists
    if (this.hasNotification(request.id, type)) {
      return null;
    }

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

  // Ensure notifications exist for recent requests (called when user views materials page)
  ensureNotificationsForRequests(requests: MaterialRequestDto[], currentUserId: string) {
    requests.forEach(request => {
      const requestDate = new Date(request.createdAt);
      const daysSinceCreated = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24);

      // Only create notifications for requests from last 7 days
      if (daysSinceCreated > 7) return;

      // Upload notification - for all users except the contractor who created it
      if (request.contractorId !== currentUserId) {
        if (!this.hasNotification(request.id, 'upload')) {
          this.add(request, 'upload');
        }
      }

      // Approved notification - for everyone
      if (request.status === 'Approved' || request.status === 2) {
        if (!this.hasNotification(request.id, 'approved')) {
          this.add(request, 'approved');
        }
      }

      // Rejected notification - for everyone
      if (request.status === 'Rejected' || request.status === 3) {
        if (!this.hasNotification(request.id, 'rejected')) {
          this.add(request, 'rejected');
        }
      }
    });
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
