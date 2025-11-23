// src/services/contractor.service.ts
import apiClient from '@/lib/api/client';

export interface Contractor {
  id: string;
  userId: string;
  companyName: string;
  specialization: string[];
  experience: number;
  rating: number;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  portfolio: string[];
  verified: boolean;
}

export interface ContractorPost {
  id: string;
  contractorId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractorPostData {
  title: string;
  description: string;
  images?: string[];
  category: string;
}

/**
 * Contractor Service
 * Handles all contractor-related API calls
 */
export const contractorService = {
  /**
   * Get all contractors
   */
  getAll: async (params?: { specialization?: string; minRating?: number }): Promise<Contractor[]> => {
    const response = await apiClient.get('/contractors', { params });
    return response.data;
  },

  /**
   * Get contractor by ID
   */
  getById: async (id: string): Promise<Contractor> => {
    const response = await apiClient.get(`/contractors/${id}`);
    return response.data;
  },

  /**
   * Update contractor profile
   */
  updateProfile: async (id: string, data: Partial<Contractor>): Promise<Contractor> => {
    const response = await apiClient.put(`/contractors/${id}`, data);
    return response.data;
  },

  /**
   * Get contractor posts
   */
  getPosts: async (contractorId: string): Promise<ContractorPost[]> => {
    const response = await apiClient.get(`/contractors/${contractorId}/posts`);
    return response.data;
  },

  /**
   * Create contractor post
   */
  createPost: async (contractorId: string, data: CreateContractorPostData): Promise<ContractorPost> => {
    const response = await apiClient.post(`/contractors/${contractorId}/posts`, data);
    return response.data;
  },

  /**
   * Update contractor post
   */
  updatePost: async (contractorId: string, postId: string, data: Partial<CreateContractorPostData>): Promise<ContractorPost> => {
    const response = await apiClient.put(`/contractors/${contractorId}/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Delete contractor post
   */
  deletePost: async (contractorId: string, postId: string): Promise<void> => {
    await apiClient.delete(`/contractors/${contractorId}/posts/${postId}`);
  },

  /**
   * Search contractors
   */
  search: async (query: string, filters?: any): Promise<Contractor[]> => {
    const response = await apiClient.get('/contractors/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },
};
