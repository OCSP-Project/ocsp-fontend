import apiClient from '@/lib/api/client';
import { type ProposalDto } from './proposal.types';

export const homeownerProposalsApi = {
  // Homeowner: Get all proposals for a specific quote
  getByQuote: async (quoteId: string): Promise<ProposalDto[]> => {
    const res = await apiClient.get(`/proposals/by-quote/${quoteId}`);
    return res.data;
  },
  
  // Homeowner: Accept a proposal
  accept: async (proposalId: string): Promise<void> => {
    await apiClient.post(`/proposals/${proposalId}/accept`);
  },

  // Homeowner: Request revision for a proposal
  requestRevision: async (proposalId: string): Promise<void> => {
    await apiClient.post(`/proposals/${proposalId}/request-revision`);
  },

  // Homeowner: Download Excel file for proposal
  downloadExcel: async (proposalId: string): Promise<Blob> => {
    const res = await apiClient.get(`/proposals/${proposalId}/download-excel`, {
      responseType: 'blob'
    });
    return res.data;
  },
};
