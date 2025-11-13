// src/services/work-item.service.ts
import apiClient from '@/lib/api/client';
import {
  WorkItemDto,
  WorkItemDetailDto,
  CreateWorkItemDto,
  UpdateWorkItemDto,
  UpdateProgressDto,
  AddCommentDto,
  WorkItemDocumentDto,
  WorkItemActivityDto,
  GanttChartDataDto,
  ImportBudgetResponseDto,
} from '@/types/work-item.types';

/**
 * Work Item Service
 * Handles all work item-related API calls
 */
export const workItemService = {
  /**
   * Get all work items by project
   */
  getAllByProject: async (
    projectId: string,
    rootLevelOnly: boolean = false,
    includeChildren: boolean = true
  ): Promise<WorkItemDto[]> => {
    const response = await apiClient.get(`/work-items/project/${projectId}`, {
      params: { rootLevelOnly, includeChildren },
    });
    return response.data;
  },

  /**
   * Get work item by ID
   */
  getById: async (id: string): Promise<WorkItemDetailDto> => {
    const response = await apiClient.get(`/work-items/${id}`);
    return response.data;
  },

  /**
   * Get tree structure by project
   */
  getTreeByProject: async (projectId: string): Promise<WorkItemDto[]> => {
    const response = await apiClient.get(`/work-items/project/${projectId}/tree`);
    return response.data;
  },

  /**
   * Create new work item
   */
  create: async (data: CreateWorkItemDto): Promise<WorkItemDto> => {
    const response = await apiClient.post('/work-items', data);
    return response.data;
  },

  /**
   * Update work item
   */
  update: async (id: string, data: UpdateWorkItemDto): Promise<WorkItemDto> => {
    const response = await apiClient.put(`/work-items/${id}`, data);
    return response.data;
  },

  /**
   * Update progress
   */
  updateProgress: async (id: string, data: UpdateProgressDto): Promise<WorkItemDto> => {
    const response = await apiClient.put(`/work-items/${id}/progress`, data);
    return response.data;
  },

  /**
   * Delete work item
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/work-items/${id}`);
  },

  /**
   * Add comment
   */
  addComment: async (id: string, data: AddCommentDto): Promise<WorkItemDetailDto> => {
    const response = await apiClient.post(`/work-items/${id}/comments`, data);
    return response.data;
  },

  /**
   * Upload document
   */
  uploadDocument: async (
    id: string,
    file: File,
    documentType: string,
    description?: string
  ): Promise<WorkItemDocumentDto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post(`/work-items/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get activities
   */
  getActivities: async (
    id: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<WorkItemActivityDto[]> => {
    const response = await apiClient.get(`/work-items/${id}/activities`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  /**
   * Get Gantt chart data
   */
  getGanttChartData: async (
    projectId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<GanttChartDataDto> => {
    const response = await apiClient.get(`/work-items/project/${projectId}/gantt`, {
      params: { fromDate, toDate },
    });
    return response.data;
  },

  /**
   * Import from Excel
   */
  importFromExcel: async (
    projectId: string,
    file: File,
    overwriteExisting: boolean = false
  ): Promise<ImportBudgetResponseDto> => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    const response = await apiClient.post('/work-items/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Export to Excel
   */
  exportToExcel: async (projectId: string): Promise<Blob> => {
    const response = await apiClient.get(`/work-items/project/${projectId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Assign users to work item
   */
  assignUsers: async (id: string, userIds: string[]): Promise<WorkItemDto> => {
    const response = await apiClient.post(`/work-items/${id}/assign-users`, userIds);
    return response.data;
  },

  /**
   * Unassign user from work item
   */
  unassignUser: async (id: string, userId: string): Promise<WorkItemDto> => {
    const response = await apiClient.delete(`/work-items/${id}/unassign-user/${userId}`);
    return response.data;
  },
};
