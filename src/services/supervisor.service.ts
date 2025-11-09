// src/services/supervisor.service.ts
import apiClient from '@/lib/api/client';

export interface Supervisor {
  id: string;
  userId: string;
  name: string;
  specialization: string[];
  certifications: string[];
  experience: number;
  rating: number;
  contactInfo: {
    phone: string;
    email: string;
  };
  verified: boolean;
}

export interface Inspection {
  id: string;
  projectId: string;
  supervisorId: string;
  type: 'foundation' | 'framing' | 'electrical' | 'plumbing' | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduledDate: string;
  completedDate?: string;
  findings: InspectionFinding[];
  notes?: string;
  report?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  images?: string[];
  resolved: boolean;
}

export interface CreateInspectionData {
  projectId: string;
  type: string;
  scheduledDate: string;
  notes?: string;
}

/**
 * Supervisor Service
 * Handles all supervisor and inspection related API calls
 */
export const supervisorService = {
  /**
   * Get all supervisors
   */
  getAll: async (params?: { specialization?: string }): Promise<Supervisor[]> => {
    const response = await apiClient.get('/supervisors', { params });
    return response.data;
  },

  /**
   * Get supervisor by ID
   */
  getById: async (id: string): Promise<Supervisor> => {
    const response = await apiClient.get(`/supervisors/${id}`);
    return response.data;
  },

  /**
   * Search supervisors
   */
  search: async (query: string, filters?: any): Promise<Supervisor[]> => {
    const response = await apiClient.get('/supervisors/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * Get inspections for a project
   */
  getInspectionsByProject: async (projectId: string): Promise<Inspection[]> => {
    const response = await apiClient.get(`/projects/${projectId}/inspections`);
    return response.data;
  },

  /**
   * Get inspection by ID
   */
  getInspectionById: async (id: string): Promise<Inspection> => {
    const response = await apiClient.get(`/inspections/${id}`);
    return response.data;
  },

  /**
   * Create inspection
   */
  createInspection: async (data: CreateInspectionData): Promise<Inspection> => {
    const response = await apiClient.post('/inspections', data);
    return response.data;
  },

  /**
   * Update inspection
   */
  updateInspection: async (id: string, data: Partial<Inspection>): Promise<Inspection> => {
    const response = await apiClient.put(`/inspections/${id}`, data);
    return response.data;
  },

  /**
   * Complete inspection
   */
  completeInspection: async (id: string, findings: InspectionFinding[], notes?: string): Promise<Inspection> => {
    const response = await apiClient.post(`/inspections/${id}/complete`, { findings, notes });
    return response.data;
  },

  /**
   * Download inspection report
   */
  downloadReport: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/inspections/${id}/report`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
