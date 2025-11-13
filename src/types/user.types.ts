// src/types/user.types.ts
import { EntityWithMetadata } from './common.types';

/**
 * User roles in the system
 */
export type UserRole = 'homeowner' | 'contractor' | 'supervisor' | 'admin';

/**
 * User base interface
 */
export interface User extends EntityWithMetadata {
  username: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatar?: string;
  phone?: string;
  address?: string;
}

/**
 * User profile
 */
export interface UserProfile extends User {
  bio?: string;
  preferences?: UserPreferences;
  notifications?: NotificationSettings;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language: 'en' | 'vi';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  projectUpdates: boolean;
  messageAlerts: boolean;
  weeklyDigest: boolean;
}

/**
 * Homeowner specific data
 */
export interface Homeowner extends User {
  role: 'homeowner';
  projectCount: number;
  activeProjects: number;
}

/**
 * Contractor specific data
 */
export interface ContractorUser extends User {
  role: 'contractor';
  companyName: string;
  specialization: string[];
  experience: number;
  rating: number;
  verified: boolean;
  licenseNumber?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
}

/**
 * Supervisor specific data
 */
export interface SupervisorUser extends User {
  role: 'supervisor';
  certifications: string[];
  specialization: string[];
  experience: number;
  rating: number;
  verified: boolean;
}

/**
 * Admin specific data
 */
export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
  lastLoginAt: string;
}
