import apiClient from '@/lib/api/client';

export interface CreateContractDto {
  proposalId: string;
  terms: string;
}

export interface ContractDto {
  id: string;
  proposalId: string;
  terms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  proposal?: {
    id: string;
    contractorUserId: string;
    priceTotal: number;
    durationDays: number;
    termsSummary?: string;
    contractor?: {
      companyName: string;
      contactPerson: string;
      phone: string;
      email: string;
    };
    quoteRequest?: {
      id: string;
      project?: {
        title: string;
        description: string;
      };
    };
  };
}

export interface HomeownerInfoDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ContractorInfoDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  province?: string;
  yearsOfExperience: number;
  teamSize: number;
  averageRating: number;
  totalReviews: number;
  completedProjects: number;
  isVerified: boolean;
  isPremium: boolean;
}

export interface ContractDetailDto {
  id: string;
  proposalId: string;
  projectId: string;
  contractorUserId: string;
  homeownerUserId: string;
  homeowner?: HomeownerInfoDto;
  contractor?: ContractorInfoDto;
  terms: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ContractItemDto[];
}

export interface ContractItemDto {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface UpdateContractStatusDto {
  contractId: string;
  status: number; // 0: Draft, 1: PendingSignatures, 2: Active, 3: Completed, 4: Cancelled
}

export interface ContractListItemDto {
  id: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const contractsApi = {
  // Homeowner: Create contract from proposal
  create: async (data: CreateContractDto): Promise<ContractDto> => {
    const res = await apiClient.post('/contracts', data);
    return res.data;
  },
  
  // Homeowner: Get all contracts
  getAll: async (): Promise<ContractListItemDto[]> => {
    const res = await apiClient.get('/contracts/my');
    return res.data;
  },
  
  // Homeowner: Get contract by ID
  getById: async (id: string): Promise<ContractDto> => {
    const res = await apiClient.get(`/contracts/${id}`);
    return res.data;
  },

  // Homeowner: Get contract detail by ID
  getDetailById: async (id: string): Promise<ContractDetailDto> => {
    const res = await apiClient.get(`/contracts/${id}`);
    return res.data;
  },

  // Update contract status (both homeowner and contractor)
  updateStatus: async (id: string, status: number): Promise<ContractDto> => {
    const res = await apiClient.post(`/contracts/${id}/status`, {
      contractId: id,
      status: status
    });
    return res.data;
  },
};

// Milestones API for homeowner management
export interface MilestoneDto {
  id: string;
  contractId: string;
  name: string;
  amount: number;
  dueDate?: string | null;
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface CreateMilestoneDto {
  name: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
}

export interface BulkCreateMilestonesDto {
  contractId: string;
  milestones: CreateMilestoneDto[];
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
    const res = await apiClient.get(`/milestones/by-contract/${contractId}`);
    return res.data;
  },

  // Bulk create milestones
  createBulk: async (data: BulkCreateMilestonesDto): Promise<MilestoneDto[]> => {
    const res = await apiClient.post(`/milestones/bulk`, data);
    return res.data;
  },

  // Update milestone
  update: async (milestoneId: string, data: UpdateMilestoneDto): Promise<MilestoneDto> => {
    const res = await apiClient.put(`/milestones/${milestoneId}`, data);
    return res.data;
  },

  // Delete milestone
  delete: async (milestoneId: string): Promise<void> => {
    await apiClient.delete(`/milestones/${milestoneId}`);
  },
};

export interface EscrowAccountDto {
  id: string;
  contractId: string;
  provider: number;
  status: string;
  balance: number;
  externalAccountId?: string | null;
  createdAt: string;
}

export const escrowApi = {
  getByContract: async (contractId: string): Promise<EscrowAccountDto> => {
    const res = await apiClient.get(`/escrow/by-contract/${contractId}`);
    return res.data;
  },
};

// Payments API (MoMo)
export interface MomoCreatePaymentDto {
  amount: number;
  description?: string;
  contractId?: string;
}
export interface MomoCreatePaymentResultDto {
  payUrl: string;
  orderId: string;
  requestId: string;
}
export const paymentsApi = {
  momoCreate: async (data: MomoCreatePaymentDto): Promise<MomoCreatePaymentResultDto> => {
    const res = await apiClient.post(`/payments/momo/create`, data);
    return res.data;
  },
};