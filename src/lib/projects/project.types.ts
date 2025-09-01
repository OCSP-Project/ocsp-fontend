export interface CreateProjectDto {
  name: string;
  description?: string;
  address: string;
  floorArea: number;
  numberOfFloors: number;
  budget: number;
  startDate: string; // ISO date string
  estimatedCompletionDate?: string; // ISO date string
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
  participants: ProjectParticipantDto[];
}

export interface ProjectParticipantDto {
  userId: string;
  role: string;
  status: string;
}
