import { apiClient } from '@/lib/api/client';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: number; // 0: Admin, 1: Supervisor, 2: Contractor, 3: Homeowner
  skipEmailVerification?: boolean;
}

export interface UserProjectInfo {
  projectId: string;
  projectName: string;
  projectStatus: string;
  participationRole: string;
  joinedAt: string | null;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: number;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  projects?: UserProjectInfo[];
}

export interface AdminDashboardStatsDto {
  totalUsers: number;
  totalProjects: number;
  totalProposals: number;
  totalQuoteRequests: number;
  totalContracts: number;
  totalTransactionValue: number;
  totalCommission: number;
  activeProjects: number;
  completedProjects: number;
  pendingProposals: number;
  activeContracts: number;
  completedContracts: number;
}

export interface RecentProjectDto {
  id: string;
  name: string;
  homeownerName: string;
  contractorName: string | null;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface RecentUserDto {
  id: string;
  username: string;
  email: string;
  role: number;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminProjectListDto {
  id: string;
  name: string;
  description: string | null;
  address: string;
  homeownerName: string;
  contractorName: string | null;
  supervisorName: string | null;
  budget: number;
  actualBudget: number | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface MonthlyFinancialDto {
  month: string;
  monthName: string;
  revenue: number;
  expenses: number;
  commission: number;
  transactionCount: number;
}

export interface FinancialReportDto {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalCommission: number;
  monthlyData: MonthlyFinancialDto[];
  completedContractValue: number;
  activeContractValue: number;
  pendingPaymentValue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  // Chi tiết để giải thích
  totalProjects: number;
  totalContracts: number;
  totalSuccessfulPaymentTransactions: number;
  averageTransactionAmount: number;
  largestTransactionAmount: number;
  smallestTransactionAmount: number;
}

export const adminApi = {
  // Create a new user
  createUser: async (data: CreateUserDto): Promise<UserDto> => {
    const res = await apiClient.post('/admin/users', data);
    return res.data;
  },

  // Get all users
  getAllUsers: async (): Promise<UserDto[]> => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserDto> => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Ban user
  banUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/ban`);
  },

  // Unban user
  unbanUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/unban`);
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStatsDto> => {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data;
  },

  // Get recent projects
  getRecentProjects: async (limit: number = 10): Promise<RecentProjectDto[]> => {
    const res = await apiClient.get(`/admin/dashboard/recent-projects?limit=${limit}`);
    return res.data;
  },

  // Get recent users
  getRecentUsers: async (limit: number = 10): Promise<RecentUserDto[]> => {
    const res = await apiClient.get(`/admin/dashboard/recent-users?limit=${limit}`);
    return res.data;
  },

  // Get all projects with filters
  getAllProjects: async (
    search?: string,
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AdminProjectListDto[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    const res = await apiClient.get(`/admin/projects?${params.toString()}`);
    return res.data;
  },

  // Get financial report
  getFinancialReport: async (): Promise<FinancialReportDto> => {
    const res = await apiClient.get('/admin/reports/financial');
    return res.data;
  },
};
