// src/lib/api/construction-diary.ts
import apiClient from './client';
import type {
  ConstructionDiaryDto,
  CreateConstructionDiaryDto,
  UpdateConstructionDiaryDto,
} from '@/types/construction-diary.types';

/**
 * Get diary by project ID and date
 */
export const getDiaryByDate = async (
  projectId: string,
  date: string // Format: yyyy-MM-dd
): Promise<ConstructionDiaryDto | null> => {
  try {
    const response = await apiClient.get<ConstructionDiaryDto>(
      `/constructiondiary/project/${projectId}/date/${date}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Diary not found for this date
    }
    throw error;
  }
};

/**
 * Get all diaries for a specific month
 */
export const getDiariesByMonth = async (
  projectId: string,
  year: number,
  month: number
): Promise<ConstructionDiaryDto[]> => {
  const response = await apiClient.get<ConstructionDiaryDto[]>(
    `/constructiondiary/project/${projectId}/month/${year}/${month}`
  );
  return response.data;
};

/**
 * Get all diaries for a project
 */
export const getAllDiariesByProject = async (
  projectId: string
): Promise<ConstructionDiaryDto[]> => {
  const response = await apiClient.get<ConstructionDiaryDto[]>(
    `/constructiondiary/project/${projectId}`
  );
  return response.data;
};

/**
 * Create a new construction diary
 */
export const createDiary = async (
  dto: CreateConstructionDiaryDto
): Promise<ConstructionDiaryDto> => {
  const response = await apiClient.post<ConstructionDiaryDto>(
    '/constructiondiary',
    dto
  );
  return response.data;
};

/**
 * Update an existing construction diary
 */
export const updateDiary = async (
  diaryId: string,
  dto: UpdateConstructionDiaryDto
): Promise<ConstructionDiaryDto> => {
  const response = await apiClient.put<ConstructionDiaryDto>(
    `/constructiondiary/${diaryId}`,
    dto
  );
  return response.data;
};

/**
 * Delete a construction diary
 */
export const deleteDiary = async (diaryId: string): Promise<void> => {
  await apiClient.delete(`/constructiondiary/${diaryId}`);
};
