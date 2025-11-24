// lib/registration/registration.api.ts
import { apiClient } from '@/lib/api/client';

export interface SubmitRegistrationRequestDto {
  username: string;
  email: string;
  phone: string;
  requestedRole: number; // 1: Supervisor, 2: Contractor
  // Supervisor fields
  department?: string;
  position?: string;
  district?: string;
  minRate?: number;
  maxRate?: number;
  // Contractor fields
  companyName?: string;
  businessLicense?: string;
  taxCode?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  yearsOfExperience?: number;
  teamSize?: number;
  completedProjects?: number;
  minProjectBudget?: number;
  maxProjectBudget?: number;
}

export interface RegistrationRequestDto {
  id: string;
  username: string;
  email: string;
  phone: string;
  requestedRole: number;
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewedByUsername?: string;
  createdAt: string;
  createdUserId?: string;
  // Supervisor fields
  department?: string;
  position?: string;
  district?: string;
  minRate?: number;
  maxRate?: number;
  // Contractor fields
  companyName?: string;
  businessLicense?: string;
  taxCode?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  yearsOfExperience?: number;
  teamSize?: number;
  completedProjects?: number;
  minProjectBudget?: number;
  maxProjectBudget?: number;
}

export interface ApproveRegistrationRequestDto {
  password: string;
  skipEmailVerification: boolean;
}

export interface RejectRegistrationRequestDto {
  rejectionReason: string;
}

export const registrationApi = {
  // Submit registration request (public)
  submit: async (data: SubmitRegistrationRequestDto): Promise<RegistrationRequestDto> => {
    const res = await apiClient.post('/registration-request', data);
    return res.data;
  },

  // Get all registration requests (admin only)
  getAll: async (): Promise<RegistrationRequestDto[]> => {
    const res = await apiClient.get('/registration-request');
    return res.data;
  },

  // Get registration request by ID (admin only)
  getById: async (id: string): Promise<RegistrationRequestDto> => {
    const res = await apiClient.get(`/registration-request/${id}`);
    return res.data;
  },

  // Approve registration request (admin only)
  approve: async (id: string, data: ApproveRegistrationRequestDto): Promise<RegistrationRequestDto> => {
    const res = await apiClient.post(`/registration-request/${id}/approve`, data);
    return res.data;
  },

  // Reject registration request (admin only)
  reject: async (id: string, data: RejectRegistrationRequestDto): Promise<RegistrationRequestDto> => {
    const res = await apiClient.post(`/registration-request/${id}/reject`, data);
    return res.data;
  },
};


