// src/services/project.service.ts
import apiClient from '@/lib/api/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
}

/**
 * Project Service
 * Handles all project-related API calls
 */
export const projectService = {
  /**
   * Get all projects
   */
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  /**
   * Get project by ID
   */
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create new project
   */
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  /**
   * Update project
   */
  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete project
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  /**
   * Get projects by user
   */
  getByUserId: async (userId: string): Promise<Project[]> => {
    const response = await apiClient.get(`/projects/user/${userId}`);
    return response.data;
  },

  /**
   * Get project team members
   */
  getTeamMembers: async (projectId: string): Promise<any[]> => {
    const response = await apiClient.get(`/projects/${projectId}/team`);
    return response.data;
  },

  /**
   * Add team member to project
   */
  addTeamMember: async (projectId: string, userId: string, role: string): Promise<any> => {
    const response = await apiClient.post(`/projects/${projectId}/team`, { userId, role });
    return response.data;
  },

  /**
   * Remove team member from project
   */
  removeTeamMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/team/${userId}`);
  },
};
