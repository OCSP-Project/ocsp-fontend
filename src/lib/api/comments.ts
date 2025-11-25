import { apiClient } from './client';
import type { WorkItemComment, CreateCommentDto, UpdateCommentDto } from '@/types/comment';

export const commentsApi = {
  // Get all comments for a work item
  getByWorkItemId: async (workItemId: string): Promise<WorkItemComment[]> => {
    const response = await apiClient.get<WorkItemComment[]>(
      `/work-item-comments/work-item/${workItemId}`
    );
    return response.data;
  },

  // Get a specific comment
  getById: async (commentId: string): Promise<WorkItemComment> => {
    const response = await apiClient.get<WorkItemComment>(
      `/work-item-comments/${commentId}`
    );
    return response.data;
  },

  // Create a new comment
  create: async (dto: CreateCommentDto): Promise<WorkItemComment> => {
    const response = await apiClient.post<WorkItemComment>(
      '/work-item-comments',
      dto
    );
    return response.data;
  },

  // Update a comment
  update: async (
    commentId: string,
    dto: UpdateCommentDto
  ): Promise<WorkItemComment> => {
    const response = await apiClient.put<WorkItemComment>(
      `/work-item-comments/${commentId}`,
      dto
    );
    return response.data;
  },

  // Delete a comment
  delete: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/work-item-comments/${commentId}`);
  },
};
