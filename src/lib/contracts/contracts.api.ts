import apiClient from '@/lib/api/client';

export interface ContractDto {
  id: string;
  proposalId: string;
  projectId: string;
  contractorUserId: string;
  homeownerUserId: string;
  terms: string;
  totalPrice: number;
  durationDays: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  homeownerSignatureBase64?: string;
  contractorSignatureBase64?: string;
  signedByHomeownerAt?: string;
  signedByContractorAt?: string;
  templatePdfUrl?: string;
  signedPdfUrl?: string;
}

export interface ContractListItemDto {
  id: string;
  proposalId: string;
  projectId: string;
  contractorUserId: string;
  homeownerUserId: string;
  terms: string;
  totalPrice: number;
  durationDays: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  homeownerSignatureBase64?: string;
  contractorSignatureBase64?: string;
  signedByHomeownerAt?: string;
  signedByContractorAt?: string;
  templatePdfUrl?: string;
  signedPdfUrl?: string;
  // Additional fields for display
  projectName?: string;
  contractorName?: string;
}

export interface ContractDetailDto {
  id: string;
  proposalId: string;
  projectId: string;
  contractorUserId: string;
  homeownerUserId: string;
  terms: string;
  totalPrice: number;
  durationDays: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  homeownerSignatureBase64?: string;
  contractorSignatureBase64?: string;
  signedByHomeownerAt?: string;
  signedByContractorAt?: string;
  templatePdfUrl?: string;
  signedPdfUrl?: string;
  // Additional fields for display
  items?: ContractItemDto[];
  homeowner?: UserInfoDto;
  contractor?: UserInfoDto;
}

export interface ContractItemDto {
  id: string;
  name: string;
  price: number;
  notes?: string;
  unit?: string;
  qty?: number;
  unitPrice?: number;
  total?: number;
}

export interface UserInfoDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  username?: string;
  companyName?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  contactPhone?: string;
  averageRating?: number;
  totalReviews?: number;
  completedProjects?: number;
  teamSize?: number;
  yearsOfExperience?: number;
}

export interface SignContractDto {
  signatureBase64: string;
}

export interface CreateContractDto {
  proposalId: string;
  terms: string;
  items?: any[];
}

export const contractsApi = {
  // Get all contracts for current user
  getAll: async (): Promise<ContractListItemDto[]> => {
    const { data } = await apiClient.get('/contracts');
    return data;
  },

  // Create contract from proposal
  create: async (dto: CreateContractDto): Promise<ContractDto> => {
    const { data } = await apiClient.post('/contracts', dto);
    return data;
  },

  // Get contract by ID
  getById: async (contractId: string): Promise<ContractDto> => {
    const { data } = await apiClient.get(`/contracts/${contractId}`);
    return data;
  },

  // Sign by homeowner
  signByHomeowner: async (contractId: string, dto: SignContractDto): Promise<ContractDto> => {
    const { data } = await apiClient.post(`/contracts/${contractId}/sign-homeowner`, dto);
    return data;
  },

  // Sign by contractor
  signByContractor: async (contractId: string, dto: SignContractDto): Promise<ContractDto> => {
    const { data} = await apiClient.post(`/contracts/${contractId}/sign-contractor`, dto);
    return data;
  },

  // Generate PDF template
  generatePdf: async (contractId: string): Promise<ContractDetailDto> => {
    const { data } = await apiClient.post(`/contracts/${contractId}/generate-pdf`);
    return data;
  },

  // Download PDF
  downloadPdf: async (contractId: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/contracts/${contractId}/pdf`, {
      responseType: 'blob',
    });
    return data;
  },

  // Get contract detail by ID (alias for getById)
  getDetailById: async (contractId: string): Promise<ContractDetailDto> => {
    const { data } = await apiClient.get(`/contracts/${contractId}`);
    return data;
  },

  // Update contract status
  updateStatus: async (contractId: string, status: string): Promise<ContractDto> => {
    const payload = { 
      contractId: contractId,
      status: parseInt(status) // Convert string to number for enum
    };
    console.log('Updating contract status:', payload);
    const { data } = await apiClient.post(`/contracts/${contractId}/status`, payload);
    return data;
  },
};

// Payments (MoMo)
export interface MomoCreatePaymentDto {
  amount: number;
  description?: string;
  contractId?: string;
  redirectUrl?: string;
  projectId?: string;
  purpose?: string; // 'commission' | 'supervisor'
  extraData?: string; // base64 JSON chứa projectId, userId... (bổ sung cho BE xử lý chuẩn)
}

export interface MomoCreatePaymentResultDto {
  payUrl: string;
  orderId: string;
  requestId: string;
}

export const paymentsApi = {
  momoCreate: async (dto: MomoCreatePaymentDto): Promise<MomoCreatePaymentResultDto> => {
    const { data } = await apiClient.post('/payments/momo/create', dto);
    return data;
  },
  manualWebhook: async (payload: any) => {
    return apiClient.post('/payments/manual-webhook', payload);
  },
  getWalletBalance: async (): Promise<{ balance: number }> => {
    const { data } = await apiClient.get('/payments/wallet/balance');
    return data;
  },
  getCommissionStatus: async (contractId: string): Promise<{ paid: boolean }> => {
    const { data } = await apiClient.get(`/payments/commission/status`, { params: { contractId } });
    return data;
  },
  getSupervisorPaymentStatus: async (projectId: string): Promise<{ paid: boolean }> => {
    const { data } = await apiClient.get(`/payments/supervisor/status`, { params: { projectId } });
    return data;
  },
};

// Escrow
export interface EscrowAccountDto {
  id: string;
  contractId: string;
  balance: number;
}

export const escrowApi = {
  getByContract: async (contractId: string): Promise<EscrowAccountDto> => {
    const { data } = await apiClient.get(`/escrow/by-contract/${contractId}`);
    return data;
  },
};

// Milestones
export interface MilestoneDto {
  id: string;
  contractId: string;
  name: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneDto {
  contractId: string;
  name: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
}

export interface BulkCreateMilestonesDto {
  contractId: string;
  milestones: Array<{
    name: string;
    amount: number;
    dueDate?: string | null;
    note?: string | null;
  }>;
}

export interface UpdateMilestoneDto {
  name: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
}

export const milestonesApi = {
  // List milestones by contract
  listByContract: async (contractId: string): Promise<MilestoneDto[]> => {
    const { data } = await apiClient.get(`/milestones/contract/${contractId}`);
    return data;
  },

  // Create milestone
  create: async (dto: CreateMilestoneDto): Promise<MilestoneDto> => {
    const { data } = await apiClient.post('/milestones', dto);
    return data;
  },

  // Bulk create milestones
  createBulk: async (dto: BulkCreateMilestonesDto): Promise<MilestoneDto[]> => {
    const { data } = await apiClient.post('/milestones/bulk', dto);
    return data;
  },

  // Update milestone
  update: async (milestoneId: string, dto: UpdateMilestoneDto): Promise<MilestoneDto> => {
    const { data } = await apiClient.put(`/milestones/${milestoneId}`, dto);
    return data;
  },

  // Delete milestone
  delete: async (milestoneId: string): Promise<void> => {
    await apiClient.delete(`/milestones/${milestoneId}`);
  },
};

// Supervisor Contracts
export interface SupervisorContractDto {
  id: string;
  projectId: string;
  projectName: string;
  supervisorId: string;
  supervisorUserId: string;
  supervisorName: string;
  homeownerUserId: string;
  homeownerName: string;
  monthlyPrice: number;
  terms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  homeownerSignatureBase64?: string;
  supervisorSignatureBase64?: string;
  signedByHomeownerAt?: string;
  signedBySupervisorAt?: string;
  templatePdfUrl?: string;
  signedPdfUrl?: string;
}

export interface SupervisorContractListItemDto {
  id: string;
  projectId: string;
  projectName: string;
  supervisorName: string;
  monthlyPrice: number;
  status: string;
  createdAt: string;
}

export interface SignSupervisorContractDto {
  signatureBase64: string;
}

export interface CreateSupervisorContractDto {
  projectId: string;
  monthlyPrice: number;
}

export interface CreateSupervisorContractWithSupervisorDto {
  projectId: string;
  supervisorId: string;
  monthlyPrice: number;
}

export const supervisorContractsApi = {
  create: async (dto: CreateSupervisorContractDto): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.post('/supervisor-contracts', dto);
    return data;
  },

  createWithSupervisor: async (dto: CreateSupervisorContractWithSupervisorDto): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.post('/supervisor-contracts/with-supervisor', dto);
    return data;
  },

  getAll: async (): Promise<SupervisorContractListItemDto[]> => {
    const { data } = await apiClient.get('/supervisor-contracts');
    return data;
  },

  getByProjectId: async (projectId: string): Promise<SupervisorContractDto | null> => {
    try {
      const { data } = await apiClient.get(`/supervisor-contracts/by-project/${projectId}`);
      return data;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  getById: async (contractId: string): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.get(`/supervisor-contracts/${contractId}`);
    return data;
  },

  signByHomeowner: async (contractId: string, dto: SignSupervisorContractDto): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.post(`/supervisor-contracts/${contractId}/sign-homeowner`, dto);
    return data;
  },

  signBySupervisor: async (contractId: string, dto: SignSupervisorContractDto): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.post(`/supervisor-contracts/${contractId}/sign-supervisor`, dto);
    return data;
  },

  generatePdf: async (contractId: string): Promise<SupervisorContractDto> => {
    const { data } = await apiClient.post(`/supervisor-contracts/${contractId}/generate-pdf`);
    return data;
  },

  downloadPdf: async (contractId: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/supervisor-contracts/${contractId}/pdf`, {
      responseType: 'blob',
    });
    return data;
  },
};