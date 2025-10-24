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
