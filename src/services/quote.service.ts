// src/services/quote.service.ts
import apiClient from '@/lib/api/client';

export interface Quote {
  id: string;
  projectId: string;
  contractorId: string;
  items: QuoteItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateQuoteData {
  projectId: string;
  items: Omit<QuoteItem, 'id'>[];
  validUntil: string;
  notes?: string;
}

/**
 * Quote Service
 * Handles all quote-related API calls
 */
export const quoteService = {
  /**
   * Get all quotes for a project
   */
  getByProject: async (projectId: string): Promise<Quote[]> => {
    const response = await apiClient.get(`/projects/${projectId}/quotes`);
    return response.data;
  },

  /**
   * Get quote by ID
   */
  getById: async (id: string): Promise<Quote> => {
    const response = await apiClient.get(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Create new quote
   */
  create: async (data: CreateQuoteData): Promise<Quote> => {
    const response = await apiClient.post('/quotes', data);
    return response.data;
  },

  /**
   * Update quote
   */
  update: async (id: string, data: Partial<CreateQuoteData>): Promise<Quote> => {
    const response = await apiClient.put(`/quotes/${id}`, data);
    return response.data;
  },

  /**
   * Delete quote
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotes/${id}`);
  },

  /**
   * Send quote to homeowner
   */
  send: async (id: string): Promise<Quote> => {
    const response = await apiClient.post(`/quotes/${id}/send`);
    return response.data;
  },

  /**
   * Accept quote
   */
  accept: async (id: string): Promise<Quote> => {
    const response = await apiClient.post(`/quotes/${id}/accept`);
    return response.data;
  },

  /**
   * Reject quote
   */
  reject: async (id: string, reason?: string): Promise<Quote> => {
    const response = await apiClient.post(`/quotes/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Get contractor quotes
   */
  getByContractor: async (contractorId: string): Promise<Quote[]> => {
    const response = await apiClient.get(`/contractors/${contractorId}/quotes`);
    return response.data;
  },
};
