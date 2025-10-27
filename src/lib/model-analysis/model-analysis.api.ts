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

const BASE_URL = '/api/model-analysis';

export const modelAnalysisApi = {
  // Upload GLB file
  uploadGLB: async (projectId: string, file: File): Promise<Project3DModel> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const response = await apiClient.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get 3D model info
  getModelInfo: async (projectId: string): Promise<Project3DModel> => {
    const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/model`);
    return response.data;
  },

  // Get building elements (parsed from GLB)
  getBuildingElements: async (modelId: string): Promise<BuildingElement[]> => {
    const response = await apiClient.get(`${BASE_URL}/models/${modelId}/elements`);
    return response.data;
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
    const response = await apiClient.get(`${BASE_URL}/projects/${projectId}/statistics`);
    return response.data;
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
