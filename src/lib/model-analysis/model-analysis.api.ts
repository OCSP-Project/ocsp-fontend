// Model Analysis API Client
import apiClient from '../api/client';
import {
  Project3DModel,
  BuildingElement,
  MeshGroup,
  ComponentTracking,
  TrackingStatistics,
  DeviationReport
} from '@/types/model-tracking.types';

const BASE_URL = '/model-analysis';

export const modelAnalysisApi = {
  // Upload GLB file
  uploadGLB: async (projectId: string, file: File, description?: string): Promise<Project3DModel> => {
    const formData = new FormData();
    // Match backend [FromForm] UploadGLBRequest properties (case-insensitive, but keep PascalCase)
    formData.append('ProjectId', projectId);
    formData.append('File', file);
    if (description) formData.append('Description', description);

    const response = await apiClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get 3D model info
  getModelInfo: async (projectId: string): Promise<Project3DModel> => {
    const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/model`);
    const data = response.data as any;
    const base = new URL(apiClient.defaults.baseURL || window.location.origin);
    const origin = `${base.protocol}//${base.hostname}${base.port ? `:${base.port}` : ''}`;
    const fileUrl: string = data.fileUrl?.startsWith('http') ? data.fileUrl : `${origin}${data.fileUrl}`;

    return {
      ...data,
      modelId: data.id,
      fileUrl,
    } as Project3DModel;
  },

  // Get building elements (parsed from GLB)
  getBuildingElements: async (modelId: string): Promise<BuildingElement[]> => {
    try {
      const response = await apiClient.get(`${BASE_URL}/models/${modelId}/elements`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Backend chưa cung cấp elements → trả về mảng rỗng để không chặn UI
        return [];
      }
      throw error;
    }
  },

  // Get mesh groups (auto-detected components)
  getMeshGroups: async (modelId: string): Promise<MeshGroup[]> => {
    const response = await apiClient.get(`${BASE_URL}/models/${modelId}/mesh-groups`);
    return response.data;
  },

  // Update element tracking status
  updateElementStatus: async (
    elementId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ): Promise<BuildingElement> => {
    const response = await apiClient.patch(`${BASE_URL}/elements/${elementId}/status`, {
      status,
    });
    return response.data;
  },

  // Update element completion percentage
  updateCompletionPercentage: async (
    elementId: string,
    percentage: number
  ): Promise<BuildingElement> => {
    const response = await apiClient.patch(`${BASE_URL}/elements/${elementId}/completion`, {
      completion_percentage: percentage,
    });
    return response.data;
  },

  // Upload tracking photos
  uploadTrackingPhotos: async (
    elementId: string,
    photos: File[]
  ): Promise<Array<{ url: string; uploaded_at: string }>> => {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });
    formData.append('elementId', elementId);

    const response = await apiClient.post(`${BASE_URL}/tracking/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Save daily tracking
  saveDailyTracking: async (
    tracking: Omit<ComponentTracking, 'id'>
  ): Promise<ComponentTracking> => {
    const response = await apiClient.post(`${BASE_URL}/tracking`, tracking);
    return response.data;
  },

  // Get tracking history
  getTrackingHistory: async (projectId: string): Promise<ComponentTracking[]> => {
    const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/tracking-history`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (projectId: string): Promise<TrackingStatistics> => {
    try {
      const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/statistics`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          total_elements: 0,
          by_type: { walls: 0, columns: 0, slabs: 0, beams: 0 },
          total_volume: 0,
          by_status: { completed: 0, in_progress: 0, not_started: 0 },
          completion_percentage: 0,
        };
      }
      throw error;
    }
  },

  // Adjust mesh groups (after review)
  updateMeshGroups: async (modelId: string, groups: MeshGroup[]): Promise<MeshGroup[]> => {
    const response = await apiClient.put(`${BASE_URL}/models/${modelId}/mesh-groups`, {
      groups,
    });
    return response.data;
  },

  // Report deviation
  reportDeviation: async (
    elementId: string,
    report: Omit<DeviationReport, 'id' | 'reported_at' | 'status' | 'element_id'>
  ): Promise<DeviationReport> => {
    const response = await apiClient.post(`${BASE_URL}/tracking/deviation`, {
      element_id: elementId,
      ...report,
    });
    return response.data;
  },

  // Get deviation reports for project
  getDeviationReports: async (projectId: string): Promise<DeviationReport[]> => {
    const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/deviations`);
    return response.data;
  },
};
