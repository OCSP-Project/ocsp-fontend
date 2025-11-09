// src/services/chat.service.ts
import apiClient from '@/lib/api/client';

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  readBy: string[];
}

export interface SendMessageData {
  projectId: string;
  content: string;
  attachments?: File[];
}

/**
 * Chat Service
 * Handles all chat-related API calls
 */
export const chatService = {
  /**
   * Get messages for a project
   */
  getMessages: async (projectId: string, limit?: number, offset?: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/projects/${projectId}/messages`, {
      params: { limit, offset }
    });
    return response.data;
  },

  /**
   * Send message
   */
  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('content', data.content);

    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await apiClient.post(`/projects/${data.projectId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.put(`/messages/${messageId}/read`);
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/messages/${messageId}`);
  },

  /**
   * Get unread count for a project
   */
  getUnreadCount: async (projectId: string): Promise<number> => {
    const response = await apiClient.get(`/projects/${projectId}/messages/unread-count`);
    return response.data.count;
  },
};
