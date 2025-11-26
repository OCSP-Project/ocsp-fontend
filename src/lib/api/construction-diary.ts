// src/lib/api/construction-diary.ts
import apiClient from './client';
import type {
  ConstructionDiaryDetailDto,
  ConstructionDiarySummaryDto,
  CreateConstructionDiaryDto,
  UpdateConstructionDiaryDto,
} from '@/types/construction-diary.types';

/**
 * Get diary by project ID and date
 */
export const getDiaryByDate = async (
  projectId: string,
  date: string // Format: yyyy-MM-dd
): Promise<ConstructionDiaryDetailDto | null> => {
  try {
    const response = await apiClient.get<ConstructionDiaryDetailDto>(
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
): Promise<ConstructionDiarySummaryDto[]> => {
  const response = await apiClient.get<ConstructionDiarySummaryDto[]>(
    `/constructiondiary/project/${projectId}/month/${year}/${month}`
  );
  return response.data;
};

/**
 * Get all diaries for a project
 */
export const getAllDiariesByProject = async (
  projectId: string
): Promise<ConstructionDiarySummaryDto[]> => {
  const response = await apiClient.get<ConstructionDiarySummaryDto[]>(
    `/constructiondiary/project/${projectId}`
  );
  return response.data;
};

/**
 * Create a new construction diary
 */
export const createDiary = async (
  dto: CreateConstructionDiaryDto
): Promise<ConstructionDiaryDetailDto> => {
  const response = await apiClient.post<ConstructionDiaryDetailDto>(
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
): Promise<ConstructionDiaryDetailDto> => {
  const response = await apiClient.put<ConstructionDiaryDetailDto>(
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
