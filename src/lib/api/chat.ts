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
  
    // Acknowledge warning
    acknowledgeWarning: async (data: { userId: string; warningType: string }) => {
      const response = await apiClient.post('/chat/acknowledge-warning', data);
      return response.data;
    }
  };