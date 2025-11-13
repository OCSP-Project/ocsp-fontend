// src/constants/status.constants.ts

/**
 * Status constants for various entities
 */

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Planning',
  [PROJECT_STATUS.IN_PROGRESS]: 'In Progress',
  [PROJECT_STATUS.COMPLETED]: 'Completed',
  [PROJECT_STATUS.ON_HOLD]: 'On Hold',
  [PROJECT_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: 'blue',
  [PROJECT_STATUS.IN_PROGRESS]: 'orange',
  [PROJECT_STATUS.COMPLETED]: 'green',
  [PROJECT_STATUS.ON_HOLD]: 'yellow',
  [PROJECT_STATUS.CANCELLED]: 'red',
} as const;

export const QUOTE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const QUOTE_STATUS_LABELS = {
  [QUOTE_STATUS.DRAFT]: 'Draft',
  [QUOTE_STATUS.SENT]: 'Sent',
  [QUOTE_STATUS.ACCEPTED]: 'Accepted',
  [QUOTE_STATUS.REJECTED]: 'Rejected',
} as const;

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING_SIGNATURE: 'pending_signature',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
} as const;

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.DRAFT]: 'Draft',
  [CONTRACT_STATUS.PENDING_SIGNATURE]: 'Pending Signature',
  [CONTRACT_STATUS.ACTIVE]: 'Active',
  [CONTRACT_STATUS.COMPLETED]: 'Completed',
  [CONTRACT_STATUS.TERMINATED]: 'Terminated',
} as const;

export const INSPECTION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const INSPECTION_STATUS_LABELS = {
  [INSPECTION_STATUS.SCHEDULED]: 'Scheduled',
  [INSPECTION_STATUS.IN_PROGRESS]: 'In Progress',
  [INSPECTION_STATUS.COMPLETED]: 'Completed',
  [INSPECTION_STATUS.FAILED]: 'Failed',
} as const;

export const ELEMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
} as const;

export const ELEMENT_STATUS_LABELS = {
  [ELEMENT_STATUS.PENDING]: 'Pending',
  [ELEMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [ELEMENT_STATUS.COMPLETED]: 'Completed',
  [ELEMENT_STATUS.DELAYED]: 'Delayed',
} as const;

export const MODEL_STATUS = {
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const;

export const MODEL_STATUS_LABELS = {
  [MODEL_STATUS.PROCESSING]: 'Processing',
  [MODEL_STATUS.READY]: 'Ready',
  [MODEL_STATUS.ERROR]: 'Error',
} as const;

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
} as const;

export const MILESTONE_STATUS_LABELS = {
  [MILESTONE_STATUS.PENDING]: 'Pending',
  [MILESTONE_STATUS.IN_PROGRESS]: 'In Progress',
  [MILESTONE_STATUS.COMPLETED]: 'Completed',
  [MILESTONE_STATUS.DELAYED]: 'Delayed',
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const SEVERITY_LABELS = {
  [SEVERITY_LEVELS.LOW]: 'Low',
  [SEVERITY_LEVELS.MEDIUM]: 'Medium',
  [SEVERITY_LEVELS.HIGH]: 'High',
  [SEVERITY_LEVELS.CRITICAL]: 'Critical',
} as const;

export const SEVERITY_COLORS = {
  [SEVERITY_LEVELS.LOW]: 'green',
  [SEVERITY_LEVELS.MEDIUM]: 'yellow',
  [SEVERITY_LEVELS.HIGH]: 'orange',
  [SEVERITY_LEVELS.CRITICAL]: 'red',
} as const;
