// src/constants/routes.constants.ts

/**
 * Application route constants
 */

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  PROFILE: '/profile',
} as const;

export const PROJECT_ROUTES = {
  LIST: '/projects',
  CREATE: '/projects/create',
  DETAIL: (id: string) => `/projects/${id}`,
  EDIT: (id: string) => `/projects/${id}/edit`,
  CHAT: (id: string) => `/projects/${id}/chat`,
  PROGRESS: (id: string) => `/projects/${id}/progress`,
  REPORTS: (id: string) => `/projects/${id}/reports`,
  RESOURCES: (id: string) => `/projects/${id}/resources`,
  ELEMENTS: (id: string) => `/projects/${id}/elements`,
  MODEL_3D: (id: string) => `/projects/${id}/3d-model`,
  MODEL_UPLOAD: (id: string) => `/projects/${id}/3d-model/upload`,
  MODEL_HISTORY: (id: string) => `/projects/${id}/3d-model/history`,
  MODEL_DETAIL: (projectId: string, modelId: string) => `/projects/${projectId}/3d-model/${modelId}`,
  MODEL_TRACKING: (projectId: string, modelId: string) => `/projects/${projectId}/3d-model/${modelId}/tracking`,
  ELEMENT_TRACKING: (projectId: string, elementId: string) => `/projects/${projectId}/elements/${elementId}/tracking`,
} as const;

export const CONTRACTOR_ROUTES = {
  DASHBOARD: '/contractor',
  PROJECTS: '/contractor/projects',
  PROJECT_DETAIL: (id: string) => `/contractor/projects/${id}`,
  PROJECT_TEAM: (id: string) => `/contractor/projects/${id}/team`,
  PROJECT_TIMELINE: (id: string) => `/contractor/projects/${id}/timeline`,
  LEADS: '/contractor/leads',
  LEAD_DETAIL: (id: string) => `/contractor/leads/${id}`,
  POSTS: '/contractor/posts',
  CHAT: '/contractor/chat',
} as const;

export const SUPERVISOR_ROUTES = {
  DASHBOARD: '/supervisor',
  PROJECTS: '/supervisor/projects',
  INSPECTIONS: '/supervisor/inspections',
  INSPECTION_DETAIL: (id: string) => `/supervisor/inspections/${id}`,
  INSPECTION_CHAT: (id: string) => `/supervisor/inspections/${id}/chat`,
  INSPECTION_PROGRESS: (id: string) => `/supervisor/inspections/${id}/progress`,
  INSPECTION_REPORTS: (id: string) => `/supervisor/inspections/${id}/reports`,
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  PROJECTS: '/admin/projects',
  PROJECT_DETAIL: (id: string) => `/admin/projects/${id}`,
  REPORTS: '/admin/reports',
  REPORT_DETAIL: (id: string) => `/admin/reports/${id}`,
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  '/',
] as const;
