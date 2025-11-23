// src/types/project.types.ts
import { EntityWithMetadata } from './common.types';

/**
 * Project status
 */
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

/**
 * Project priority
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Project interface
 */
export interface Project extends EntityWithMetadata {
  name: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  estimatedCost?: number;
  actualCost?: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  ownerName?: string;
  progress: number;
  tags?: string[];
  attachments?: string[];
}

/**
 * Project team member
 */
export interface ProjectTeamMember {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  role: 'owner' | 'contractor' | 'supervisor' | 'worker';
  permissions: string[];
  joinedAt: string;
}

/**
 * Project milestone
 */
export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  dependencies?: string[];
}

/**
 * Project timeline event
 */
export interface ProjectTimelineEvent {
  id: string;
  projectId: string;
  type: 'milestone' | 'task' | 'inspection' | 'payment' | 'note';
  title: string;
  description: string;
  date: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Project resource
 */
export interface ProjectResource {
  id: string;
  projectId: string;
  name: string;
  type: 'material' | 'equipment' | 'labor';
  quantity: number;
  unit: string;
  cost: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project report
 */
export interface ProjectReport {
  id: string;
  projectId: string;
  type: 'progress' | 'financial' | 'quality' | 'safety';
  title: string;
  content: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
}

/**
 * Daily resource tracking
 */
export interface DailyResourceTracking {
  id: string;
  projectId: string;
  date: string;
  resources: {
    type: string;
    name: string;
    quantity: number;
    cost: number;
  }[];
  laborHours: number;
  weather?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}
