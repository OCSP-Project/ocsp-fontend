import apiClient from '@/lib/api/client';
import { type CreateProjectDto, type UpdateProjectDto, type ProjectResponseDto, type ProjectDetailDto, type ProgressMediaListDto } from './project.types';

export const projectsApi = {
  // Get all projects for current homeowner
  getMyProjects: async (): Promise<ProjectResponseDto[]> => {
    const res = await apiClient.get('/projects/my-projects');
    return res.data;
  },

  // Get project by ID
  getProject: async (id: string): Promise<ProjectDetailDto> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },

  // Create new project
  createProject: async (data: CreateProjectDto): Promise<ProjectDetailDto> => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectDto): Promise<ProjectDetailDto> => {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data;
  },

  // Get project gallery (progress media)
  getProjectGallery: async (
    projectId: string,
    params?: { taskId?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number }
  ): Promise<ProgressMediaListDto> => {
    const res = await apiClient.get(`/projects/${projectId}/gallery`, { params });
    return res.data;
  },

  // Upload progress media (Contractor)
  uploadProjectMedia: async (
    projectId: string,
    file: File,
    payload?: { caption?: string; taskId?: string; progressUpdateId?: string }
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (payload?.caption) form.append('caption', payload.caption);
    if (payload?.taskId) form.append('taskId', payload.taskId);
    if (payload?.progressUpdateId) form.append('progressUpdateId', payload.progressUpdateId);

    const res = await apiClient.post(`/projects/${projectId}/gallery`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as { id: string };
  },

  // Delete progress media (Contractor or authorized)
  deleteProjectMedia: async (projectId: string, mediaId: string) => {
    const res = await apiClient.delete(`/projects/${projectId}/gallery/${mediaId}`);
    return res.data as { success: boolean };
  },
};
export { ProjectResponseDto, ProjectDetailDto, UpdateProjectDto };

