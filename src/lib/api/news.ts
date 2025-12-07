// src/lib/api/news.ts
import apiClient from './client';
import type {
  News,
  CreateNewsDto,
  UpdateNewsDto,
  ScheduleNewsDto,
} from '@/types/news';

/**
 * Get published news list (public)
 */
export const getPublishedNews = async (
  page: number = 1,
  pageSize: number = 10,
  category?: string
): Promise<News[]> => {
  const params: any = { page, pageSize };
  if (category) params.category = category;

  const response = await apiClient.get<News[]>('/news', { params });
  return response.data;
};

/**
 * Get news by ID (public)
 */
export const getNewsById = async (id: string): Promise<News | null> => {
  try {
    const response = await apiClient.get<News>(`/news/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get all news (admin only)
 */
export const getAllNews = async (
  isPublished?: boolean,
  page: number = 1,
  pageSize: number = 20
): Promise<News[]> => {
  const params: any = { page, pageSize };
  if (isPublished !== undefined) params.isPublished = isPublished;

  const response = await apiClient.get<News[]>('/news/admin/all', { params });
  return response.data;
};

/**
 * Create news manually (admin)
 */
export const createNews = async (dto: CreateNewsDto): Promise<News> => {
  const response = await apiClient.post<News>('/news', dto);
  return response.data;
};

/**
 * Update news (admin)
 */
export const updateNews = async (id: string, dto: UpdateNewsDto): Promise<News> => {
  const response = await apiClient.put<News>(`/news/${id}`, dto);
  return response.data;
};

/**
 * Delete news (admin)
 */
export const deleteNews = async (id: string): Promise<void> => {
  await apiClient.delete(`/news/${id}`);
};

/**
 * Publish news (admin)
 */
export const publishNews = async (id: string): Promise<News> => {
  const response = await apiClient.post<News>(`/news/${id}/publish`);
  return response.data;
};

/**
 * Unpublish news (admin)
 */
export const unpublishNews = async (id: string): Promise<News> => {
  const response = await apiClient.post<News>(`/news/${id}/unpublish`);
  return response.data;
};

/**
 * Schedule news publishing (admin)
 */
export const scheduleNews = async (id: string, dto: ScheduleNewsDto): Promise<News> => {
  const response = await apiClient.post<News>(`/news/${id}/schedule`, dto);
  return response.data;
};
