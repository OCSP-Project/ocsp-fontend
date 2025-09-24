// src/lib/resources/project-daily-resource.api.ts
import { apiClient } from '@/lib/api/client';

export interface ProjectDailyResourceDto {
  id: string;
  projectId: string;
  resourceDate: string;
  towerCrane: boolean;
  concreteMixer: boolean;
  materialHoist: boolean;
  passengerHoist: boolean;
  vibrator: boolean;
  cementConsumed: number;
  cementRemaining: number;
  sandConsumed: number;
  sandRemaining: number;
  aggregateConsumed: number;
  aggregateRemaining: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDailyResourceListDto {
  id: string;
  projectId: string;
  resourceDate: string;
  // equipment booleans for per-device status
  towerCrane: boolean;
  concreteMixer: boolean;
  materialHoist: boolean;
  passengerHoist: boolean;
  vibrator: boolean;
  equipmentCount: number;
  totalCementConsumed: number;
  totalCementRemaining: number;
  totalSandConsumed: number;
  totalSandRemaining: number;
  totalAggregateConsumed: number;
  totalAggregateRemaining: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}


export interface CreateProjectDailyResourceDto {
  projectId: string;
  resourceDate: string;
  towerCrane: boolean;
  concreteMixer: boolean;
  materialHoist: boolean;
  passengerHoist: boolean;
  vibrator: boolean;
  cementConsumed: number;
  cementRemaining: number;
  sandConsumed: number;
  sandRemaining: number;
  aggregateConsumed: number;
  aggregateRemaining: number;
  notes?: string;
}

export interface UpdateProjectDailyResourceDto {
  towerCrane?: boolean;
  concreteMixer?: boolean;
  materialHoist?: boolean;
  passengerHoist?: boolean;
  vibrator?: boolean;
  cementConsumed?: number;
  cementRemaining?: number;
  sandConsumed?: number;
  sandRemaining?: number;
  aggregateConsumed?: number;
  aggregateRemaining?: number;
  notes?: string;
}

class ProjectDailyResourceApi {
  /**
   * Tạo báo cáo tài nguyên hàng ngày
   */
  async createDailyResource(data: CreateProjectDailyResourceDto): Promise<ProjectDailyResourceDto> {
    const response = await apiClient.post('/ProjectDailyResource', data);
    return response.data;
  }

  /**
   * Cập nhật báo cáo tài nguyên hàng ngày
   */
  async updateDailyResource(id: string, data: UpdateProjectDailyResourceDto): Promise<ProjectDailyResourceDto> {
    const response = await apiClient.put(`/ProjectDailyResource/${id}`, data);
    return response.data;
  }

  /**
   * Xóa báo cáo tài nguyên hàng ngày
   */
  async deleteDailyResource(id: string): Promise<void> {
    await apiClient.delete(`/ProjectDailyResource/${id}`);
  }

  /**
   * Lấy báo cáo tài nguyên theo ID
   */
  async getDailyResourceById(id: string): Promise<ProjectDailyResourceDto> {
    const response = await apiClient.get(`/ProjectDailyResource/${id}`);
    return response.data;
  }

  /**
   * Lấy báo cáo tài nguyên theo project và ngày
   */
  async getDailyResourceByProjectAndDate(projectId: string, resourceDate: string): Promise<ProjectDailyResourceDto> {
    const response = await apiClient.get(`/ProjectDailyResource/project/${projectId}/date/${resourceDate}`);
    return response.data;
  }

  /**
   * Lấy danh sách báo cáo tài nguyên theo project
   */
  async getDailyResourcesByProject(projectId: string): Promise<ProjectDailyResourceListDto[]> {
    console.log('🚀 API Request: GET /ProjectDailyResource/project/', projectId);
    const response = await apiClient.get(`/ProjectDailyResource/project/${projectId}`);
    console.log('📡 API Response status:', response.status);
    console.log('📦 Response data length:', Array.isArray(response.data) ? response.data.length : 'n/a');
    if (Array.isArray(response.data)) {
      response.data.forEach((item: any, idx: number) => {
        console.log(
          `#${idx} ${item.id} date=${item.resourceDate} flags:`,
          {
            towerCrane: item.towerCrane ?? item.TowerCrane,
            concreteMixer: item.concreteMixer ?? item.ConcreteMixer,
            materialHoist: item.materialHoist ?? item.MaterialHoist,
            passengerHoist: item.passengerHoist ?? item.PassengerHoist,
            vibrator: item.vibrator ?? item.Vibrator,
            equipmentCount: item.equipmentCount,
          }
        );
        console.log(`#${idx} keys`, Object.keys(item));
      });
    }
    return response.data;
  }


  /**
   * Lấy danh sách báo cáo tài nguyên theo project và khoảng thời gian
   */
  async getDailyResourcesByProjectAndDateRange(
    projectId: string, 
    startDate: string, 
    endDate: string
  ): Promise<ProjectDailyResourceListDto[]> {
    const response = await apiClient.get(
      `/ProjectDailyResource/project/${projectId}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
}

export const projectDailyResourceApi = new ProjectDailyResourceApi();
