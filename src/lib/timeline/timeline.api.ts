import { apiClient } from '@/lib/api/client';

export interface AutoCreateTimelineDto {
  projectId: string;
  contractorId: string;
  timelineName: string;
  description?: string;
  projectStartDate: string;
  milestones: MilestoneDataDto[];
}

export interface MilestoneDataDto {
  name: string;
  description?: string;
  durationInDays: number;
  deliverables: string[];
}

export interface ProjectTimelineGanttDto {
  id: string;
  projectId: string;
  contractorId: string;
  name: string;
  description?: string;
  status: string;
  milestones: MilestoneGanttDto[];
}

export interface MilestoneGanttDto {
  id: string;
  name: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: string;
  progressPercentage: number;
  deliverables: DeliverableGanttDto[];
}

export interface DeliverableGanttDto {
  id: string;
  name: string;
  description?: string;
  plannedDueDate: string;
  actualCompletionDate?: string;
  status: string;
  progressPercentage: number;
}

export interface MilestoneOverdueDto {
  milestoneId: string;
  milestoneName: string;
  plannedEndDate: string;
  daysOverdue: number;
  status: string;
  progressPercentage: number;
  isOverdue: boolean;
  isApproachingDeadline: boolean;
}

export const timelineApi = {
  // Tự động tạo timeline từ milestone data
  autoCreateTimeline: async (dto: AutoCreateTimelineDto): Promise<ProjectTimelineGanttDto> => {
    const res = await apiClient.post('/ProjectTimeline/auto-create', dto);
    return res.data;
  },

  // Lấy timeline cho Gantt chart
  getProjectTimeline: async (projectId: string): Promise<ProjectTimelineGanttDto | null> => {
    try {
      const res = await apiClient.get(`/ProjectTimeline/project/${projectId}`);
      return res.data;
    } catch (error) {
      return null;
    }
  },

  // Kiểm tra milestone trễ tiến độ
  checkOverdueMilestones: async (projectId: string): Promise<MilestoneOverdueDto[]> => {
    const res = await apiClient.get(`/ProjectTimeline/overdue/${projectId}`);
    return res.data;
  },

  // Cập nhật tiến độ milestone
  updateMilestoneProgress: async (dto: {
    projectId: string;
    milestoneId: string;
    progressPercentage: number;
    status?: string;
    actualStartDate?: string;
    actualEndDate?: string;
  }): Promise<boolean> => {
    const res = await apiClient.put('/ProjectTimeline/milestone/progress', dto);
    return res.data.success;
  },

  // Cập nhật tiến độ deliverable
  updateDeliverableProgress: async (dto: {
    projectId: string;
    deliverableId: string;
    progressPercentage: number;
    status?: string;
    actualCompletionDate?: string;
  }): Promise<boolean> => {
    const res = await apiClient.put('/ProjectTimeline/deliverable/progress', dto);
    return res.data.success;
  }
};
