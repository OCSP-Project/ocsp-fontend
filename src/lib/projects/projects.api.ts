import { apiClient } from '@/lib/api/client';
import { type CreateProjectDto, type UpdateProjectDto, type ProjectResponseDto, type ProjectDetailDto, type ProgressMediaListDto } from './project.types';

export const projectsApi = {
  // Test backend connection
  testConnection: async (): Promise<boolean> => {
    try {
      // Thử nhiều endpoint để test
      const endpoints = ['/health', '/projects/my-projects', '/auth/me'];
      
      for (const endpoint of endpoints) {
        try {
          const res = await apiClient.get(endpoint, { timeout: 3000 });
          console.log(`✅ Backend responding on ${endpoint}:`, res.status);
          return true;
        } catch (e: any) {
          console.log(`❌ ${endpoint} failed:`, e.message);
        }
      }
      
      console.log('⚠️ All endpoints failed - backend might be down');
      return false;
    } catch {
      console.log('⚠️ Connection test failed completely');
      return false;
    }
  },

  // Test create project without files
  testCreateProject: async (dto: CreateProjectDto): Promise<boolean> => {
    try {
      console.log('🧪 Testing create project without files...');
      const response = await apiClient.post('/projects/test', dto, {
        timeout: 10000
      });
      console.log('✅ Test create project response:', response.status);
      return true;
    } catch (e: any) {
      console.log('❌ Test create project failed:', e.message);
      return false;
    }
  },

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

  // Create project with BOTH drawing + permit (OCR data included in DTO)
  createProject: async (
    dto: CreateProjectDto, 
    drawingFile: File, 
    permitFile: File
  ): Promise<ProjectDetailDto> => {
    console.log('🔧 Building FormData...');
    const formData = new FormData();
    formData.append('name', dto.name);
    
    // Clean address - remove OCR artifacts
    const cleanAddress = dto.address
      .replace(/^2\.\s*Dược\s*phép\s*xây\s*dụng\s*công\s*trình.*?:\s*/i, '')
      .replace(/\(loại\s*công\s*trình\):\s*/i, '')
      .trim();
    formData.append('address', cleanAddress || dto.address);
    
    formData.append('budget', dto.budget.toString());
    if (dto.description) formData.append('description', dto.description);
    
    // ✅ Gửi đầy đủ dữ liệu OCR từ frontend (đã clean)
    if (dto.floorArea) formData.append('floorArea', dto.floorArea.toString());
    if (dto.numberOfFloors) formData.append('numberOfFloors', dto.numberOfFloors.toString());
    if (dto.permitNumber) {
      // Clean permit number - remove special characters
      const cleanPermitNumber = dto.permitNumber.replace(/[™]/g, '').trim();
      formData.append('permitNumber', cleanPermitNumber);
    }
    
    // Upload both files
    formData.append('drawingFile', drawingFile);
    formData.append('permitFile', permitFile);
    
    console.log('📤 Sending request to /projects...');
    console.log('📋 FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.log('🧹 Cleaned data:', {
      address: cleanAddress || dto.address,
      permitNumber: dto.permitNumber ? dto.permitNumber.replace(/[™]/g, '').trim() : null
    });
    
    try {
      // Test kết nối trước
      console.log('🔍 Testing backend connection...');
      try {
        const healthCheck = await apiClient.get('/health', { timeout: 5000 });
        console.log('✅ Backend is running:', healthCheck.status);
      } catch (healthError) {
        console.log('⚠️ Health check failed, trying projects endpoint anyway...');
      }

      // Thử endpoint cũ trước để test kết nối
      const response = await apiClient.post('/projects', formData, {
        timeout: 60000 // Tăng timeout lên 60s
      });
      console.log('✅ API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ API error:', error);
      
      // Thử endpoint mới nếu endpoint cũ fail
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('🔄 Trying new endpoint /projects/create-with-files...');
        try {
          const response = await apiClient.post('/projects/create-with-files', formData, {
            timeout: 60000
          });
          console.log('✅ New endpoint response:', response);
          return response.data;
        } catch (newError: any) {
          console.error('❌ New endpoint also failed:', newError);
          throw newError;
        }
      }
      
      throw error;
    }
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

