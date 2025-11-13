// src/services/contract.service.ts
import apiClient from '@/lib/api/client';

export interface Contract {
  id: string;
  projectId: string;
  quoteId: string;
  contractorId: string;
  homeownerId: string;
  terms: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'terminated';
  signatures: {
    homeowner?: ContractSignature;
    contractor?: ContractSignature;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContractSignature {
  signedAt: string;
  signature: string; // Base64 image
  ipAddress: string;
}

export interface CreateContractData {
  projectId: string;
  quoteId: string;
  terms: string;
  startDate: string;
  endDate: string;
}

/**
 * Contract Service
 * Handles all contract-related API calls
 */
export const contractService = {
  /**
   * Get all contracts for a project
   */
  getByProject: async (projectId: string): Promise<Contract[]> => {
    const response = await apiClient.get(`/projects/${projectId}/contracts`);
    return response.data;
  },

  /**
   * Get contract by ID
   */
  getById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data;
  },

  /**
   * Create new contract
   */
  create: async (data: CreateContractData): Promise<Contract> => {
    const response = await apiClient.post('/contracts', data);
    return response.data;
  },

  /**
   * Update contract
   */
  update: async (id: string, data: Partial<CreateContractData>): Promise<Contract> => {
    const response = await apiClient.put(`/contracts/${id}`, data);
    return response.data;
  },

  /**
   * Sign contract
   */
  sign: async (id: string, signature: string): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${id}/sign`, { signature });
    return response.data;
  },

  /**
   * Terminate contract
   */
  terminate: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${id}/terminate`, { reason });
    return response.data;
  },

  /**
   * Download contract PDF
   */
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/contracts/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
