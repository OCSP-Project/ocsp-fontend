// Model Analysis API Client
import apiClient from '../api/client';
import {
  Project3DModel,
  BuildingElement,
  MeshGroup,
  ComponentTracking,
  TrackingStatistics
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
};
