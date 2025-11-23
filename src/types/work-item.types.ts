// src/types/work-item.types.ts

export interface WorkItemDto {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  description?: string;
  workCode?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  status: WorkItemStatus | string; // Can be enum number or string from backend
  level: number;
  orderIndex: number;
  assignedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  children?: WorkItemDto[];
}

export interface WorkItemDetailDto extends WorkItemDto {
  budgets: BudgetDetailDto[];
  documents: WorkItemDocumentDto[];
  comments: WorkItemCommentDto[];
  activities: WorkItemActivityDto[];
  materials: WorkItemMaterialDto[];
  assignedUsers: UserDto[];
}

export interface BudgetDetailDto {
  id: string;
  workItemId: string;
  budgetType: BudgetType;
  category: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalAmount: number;
  actualAmount?: number;
  notes?: string;
}

export interface WorkItemDocumentDto {
  id: string;
  workItemId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  documentType: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WorkItemCommentDto {
  id: string;
  workItemId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface WorkItemActivityDto {
  id: string;
  workItemId: string;
  activityType: string;
  description: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  metadata?: string;
}

export interface WorkItemMaterialDto {
  id: string;
  workItemId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  notes?: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface CreateWorkItemDto {
  projectId: string;
  parentId?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  assignedUserIds?: string[];
}

export interface UpdateWorkItemDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  status?: string; // Backend expects string (NotStarted, InProgress, Completed, Paused, Cancelled)
  assignedUserIds?: string[];
}

export interface UpdateProgressDto {
  progress: number;
  actualHours?: number;
  notes?: string;
}

export interface AddCommentDto {
  content: string;
}

export interface GanttChartDataDto {
  projectId: string;
  projectName: string;
  items: GanttItemDto[];
  timeline: {
    startDate: string;
    endDate: string;
    weeks: WeekDto[];
  };
}

export interface GanttItemDto {
  id: string;
  parentId?: string;
  name: string;
  workCode?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  progress?: number;
  status: WorkItemStatus;
  level: number;
  assignedUsers: UserDto[];
  children?: GanttItemDto[];
}

export interface WeekDto {
  weekNumber: number;
  startDate: string;
  endDate: string;
}

export interface ImportBudgetResponseDto {
  success: boolean;
  message: string;
  importedCount: number;
  errorCount: number;
  errors: string[];
  importedItems: WorkItemDto[];
}

export enum WorkItemStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4,
}

export enum BudgetType {
  Labor = 0,
  Material = 1,
  Equipment = 2,
  Other = 3,
}

export const WorkItemStatusLabels = {
  [WorkItemStatus.NotStarted]: 'Chưa bắt đầu',
  [WorkItemStatus.InProgress]: 'Đang thực hiện',
  [WorkItemStatus.Completed]: 'Hoàn thành',
  [WorkItemStatus.OnHold]: 'Tạm dừng',
  [WorkItemStatus.Cancelled]: 'Đã hủy',
};

export const BudgetTypeLabels = {
  [BudgetType.Labor]: 'Nhân công',
  [BudgetType.Material]: 'Vật tư',
  [BudgetType.Equipment]: 'Thiết bị',
  [BudgetType.Other]: 'Khác',
};

// Helper function to convert backend status string to frontend enum
export function parseWorkItemStatus(status: string | number): WorkItemStatus {
  if (typeof status === 'number') {
    return status as WorkItemStatus;
  }

  const statusMap: Record<string, WorkItemStatus> = {
    'NotStarted': WorkItemStatus.NotStarted,
    'InProgress': WorkItemStatus.InProgress,
    'Completed': WorkItemStatus.Completed,
    'Overdue': WorkItemStatus.OnHold,     // Backend Overdue -> Frontend OnHold
    'Paused': WorkItemStatus.OnHold,      // Backend Paused -> Frontend OnHold
    'Cancelled': WorkItemStatus.Cancelled,
  };

  return statusMap[status] ?? WorkItemStatus.NotStarted;
}
