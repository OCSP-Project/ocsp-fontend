export interface CreateProjectDto {
  name: string;
  description?: string;
  address: string;
  budget: number;
  floorArea?: number;
  numberOfFloors?: number;
  permitNumber?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  address?: string;
  floorArea?: number;
  numberOfFloors?: number;
  budget?: number;
  startDate?: string; // ISO date string
  estimatedCompletionDate?: string; // ISO date string
  status?: string;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  address: string;
  floorArea: number;
  numberOfFloors: number;
  budget: number;
  actualBudget?: number;
  startDate: string;
  endDate?: string;
  estimatedCompletionDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  supervisorId?: string;
  supervisorName?: string;
  homeownerId: string;
  homeownerName?: string;
}

export interface ProjectDetailDto {
  id: string;
  name: string;
  address: string;
  description: string;
  floorArea: number;
  numberOfFloors: number;
  budget: number;
  startDate: string;
  estimatedCompletionDate?: string;
  status: string;
  homeownerId: string;
  supervisorId?: string;
  hasSupervisorsAvailable: boolean; // Có supervisor availableNow=true không
  participants: ProjectParticipantDto[];
  supervisorPackagePaymentStatus?: string;
  updatedAt?: string;
}

export interface ProjectParticipantDto {
  userId: string;
  userName: string;
  role: string;
  status: string;
}

// Progress / Gallery types for UC-34
export interface ProgressMediaDto {
  id: string;
  projectId: string;
  taskId?: string | null;
  progressUpdateId?: string | null;
  url: string;
  caption: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
}

export interface ProgressMediaListDto {
  items: ProgressMediaDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}