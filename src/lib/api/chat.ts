import { apiClient } from './client';

export interface StartChatRequest {
    projectId?: string; // Make optional for consultation chats
    userIds: string[];
    chatType?: 'consultation' | 'project'; // Add chat type
  }
  
  export interface SendMessageRequest {
    senderId: string;
    content: string;
  }
  
  export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  }
  
  export interface SendMessageResponse {
    message: MessageResponse;
    warning?: {
      message: string;
      reason: string;
      warningLevel: number;
      requiresAcknowledgment: boolean;
    };
    requiresAcknowledgment: boolean;
  }
  
  export interface ConversationResponse {
    conversationId: string;
    projectId: string;
    participantIds: string[];
  }

  // Conversation item returned by list endpoint
  export interface ConversationListItem {
    id: string;
    projectId: string | null;
  participants: Array<{
    userId: string;
    username: string;
    role: number;
  }>;
    lastMessage: MessageResponse | null;
    unreadCount: number;
    updatedAt: string;
  }

// Lightweight public user info for displaying names/avatars in chat
export interface PublicUserSummary {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

  export const chatApi = {
    // Start new conversation
    startConversation: async (data: StartChatRequest): Promise<ConversationResponse> => {
      const response = await apiClient.post('/chat/start', data);
      return response.data;
    },
  
    // Send message
    sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<SendMessageResponse> => {
      const response = await apiClient.post(`/chat/${conversationId}/send`, data);
      return response.data;
    },
  
    // Get messages
    getMessages: async (conversationId: string): Promise<MessageResponse[]> => {
      const response = await apiClient.get(`/chat/${conversationId}/messages`);
      return response.data;
    },

    // Get conversations for a user
    getUserConversations: async (userId: string): Promise<ConversationListItem[]> => {
      const response = await apiClient.get(`/chat/users/${userId}/conversations`);
      return response.data;
    },

    // Note: usernames are already returned inside conversations via `participants`
  
    // Acknowledge warning
    acknowledgeWarning: async (data: { userId: string; warningType: string }) => {
      const response = await apiClient.post('/chat/acknowledge-warning', data);
      return response.data;
    },

    // Join users to conversation
    joinUsersToConversation: async (conversationId: string, userIds: string[]): Promise<ConversationListItem> => {
      const response = await apiClient.post(`/chat/${conversationId}/join`, { userIds });
      return response.data;
    }
  };