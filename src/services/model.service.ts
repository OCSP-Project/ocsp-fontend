// src/services/model.service.ts
import apiClient from '@/lib/api/client';

export interface Model3D {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  format: string;
  uploadedBy: string;
  version: number;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface BuildingElement {
  id: string;
  modelId: string;
  elementId: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  position: { x: number; y: number; z: number };
  metadata: Record<string, any>;
}

export interface ElementTracking {
  id: string;
  elementId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  notes?: string;
  updatedBy: string;
  updatedAt: string;
}

/**
 * 3D Model Service
 * Handles all 3D model and building element related API calls
 */
export const modelService = {
  /**
   * Upload 3D model
   */
  upload: async (projectId: string, file: File): Promise<Model3D> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const response = await apiClient.post(`/projects/${projectId}/models`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Get models for a project
   */
  getByProject: async (projectId: string): Promise<Model3D[]> => {
    const response = await apiClient.get(`/projects/${projectId}/models`);
    return response.data;
  },

  /**
   * Get model by ID
   */
  getById: async (modelId: string): Promise<Model3D> => {
    const response = await apiClient.get(`/models/${modelId}`);
    return response.data;
  },

  /**
   * Delete model
   */
  delete: async (modelId: string): Promise<void> => {
    await apiClient.delete(`/models/${modelId}`);
  },

  /**
   * Get building elements from model
   */
  getElements: async (modelId: string): Promise<BuildingElement[]> => {
    const response = await apiClient.get(`/models/${modelId}/elements`);
    return response.data;
  },

  /**
   * Get element by ID
   */
  getElementById: async (elementId: string): Promise<BuildingElement> => {
    const response = await apiClient.get(`/elements/${elementId}`);
    return response.data;
  },

  /**
   * Update element tracking
   */
  updateTracking: async (elementId: string, data: Partial<ElementTracking>): Promise<ElementTracking> => {
    const response = await apiClient.put(`/elements/${elementId}/tracking`, data);
    return response.data;
  },

  /**
   * Get element tracking history
   */
  getTrackingHistory: async (elementId: string): Promise<ElementTracking[]> => {
    const response = await apiClient.get(`/elements/${elementId}/tracking/history`);
    return response.data;
  },

  /**
   * Get model analysis
   */
  getAnalysis: async (modelId: string): Promise<any> => {
    const response = await apiClient.get(`/models/${modelId}/analysis`);
    return response.data;
  },
};
