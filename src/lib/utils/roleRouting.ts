// src/lib/utils/roleRouting.ts
import { UserRole } from '@/hooks/useAuth';

export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
      return '/admin';
    case UserRole.Supervisor:
      return '/';
    case UserRole.Contractor:
      return '/';
    case UserRole.Homeowner:
      return '/';
    default:
      return '/';
  }
};

export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
      return 'Quản trị viên';
    case UserRole.Supervisor:
      return 'Giám sát viên';
    case UserRole.Contractor:
      return 'Thầu xây dựng';
    case UserRole.Homeowner:
      return 'Chủ nhà';
    default:
      return 'Người dùng';
  }
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
      return '#FF6B6B'; // Red for admin
    case UserRole.Supervisor:
      return '#4ECDC4'; // Teal for supervisor
    case UserRole.Contractor:
      return '#45B7D1'; // Blue for contractor
    case UserRole.Homeowner:
      return '#96CEB4'; // Green for homeowner
    default:
      return '#95A5A6';
  }
};