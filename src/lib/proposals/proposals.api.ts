import apiClient from '@/lib/api/client';

export interface ProposalItemInput {
  name: string;
  price: number;
  notes?: string;
}

export interface CreateProposalDto {
  quoteRequestId: string;
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemInput[];
}

export interface ProposalDto {
  id: string;
  quoteRequestId: string;
  contractorUserId: string;
  status: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    notes?: string;
  }>;
  
  // Excel-based proposal info
  isFromExcel: boolean;
  excelFileName?: string;
  excelFileUrl?: string;
  
  // Project Information from Excel
  projectTitle?: string;
  constructionArea?: string;
  constructionTime?: string;
  numberOfWorkers?: string;
  averageSalary?: string;
}


export interface UpdateProposalDto {
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemInput[];
}

export const proposalsApi = {
  create: async (data: CreateProposalDto): Promise<ProposalDto> => {
    const res = await apiClient.post('/proposals', data);
    return res.data;
  },
  submit: async (proposalId: string): Promise<void> => {
    await apiClient.post(`/proposals/${proposalId}/submit`);
  },
  getMineById: async (proposalId: string): Promise<ProposalDto> => {
    const res = await apiClient.get(`/proposals/${proposalId}`);
    return res.data;
  },
  getMineByQuote: async (quoteId: string): Promise<ProposalDto> => {
    const res = await apiClient.get(`/proposals/by-quote/${quoteId}/mine`);
    return res.data;
  },
  updateDraft: async (proposalId: string, data: UpdateProposalDto): Promise<ProposalDto> => {
    const res = await apiClient.put(`/proposals/${proposalId}`, data);
    return res.data;
  },

  // Upload proposal Excel for a quote (contractor)
  uploadExcel: async (quoteId: string, file: File): Promise<{ message: string; result: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post(`/proposals/by-quote/${quoteId}/upload-excel`, form);
    return res.data;
  },

  // Download Excel file for proposal (homeowner)
  downloadExcel: async (proposalId: string): Promise<Blob> => {
    const res = await apiClient.get(`/proposals/${proposalId}/download-excel`, {
      responseType: 'blob'
    });
    return res.data;
  },
};


