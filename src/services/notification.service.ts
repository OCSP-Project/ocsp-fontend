// src/services/notification.service.ts
import apiClient from '@/lib/api/client';

export enum NotificationType {
  MaterialRequestUploaded = 1,
  MaterialRequestApproved = 2,
  MaterialRequestRejected = 3,
  MaterialRequestPartiallyApproved = 4,
  ProjectInvitation = 100,
  PaymentRequest = 200,
  ProgressUpdate = 300,
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  notificationDate: string;
  type: NotificationType;
  referenceId?: string;
  actionUrl?: string;
  projectId?: string;
  projectName?: string;
  userId: string;
  createdAt: string;
}

/**
 * Notification Service
 * Handles all notification-related API calls
 */
export const notificationService = {
  /**
   * Get current user's notifications
   */
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<NotificationDto[]> {
    const response = await apiClient.get<NotificationDto[]>('/notification', {
      params: { unreadOnly, limit },
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/notification/unread-count');
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(`/notification/${notificationId}/mark-read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notification/mark-all-read');
  },
};
