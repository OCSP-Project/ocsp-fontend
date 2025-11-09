// src/constants/api.constants.ts

/**
 * API endpoint constants
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Projects
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    BY_USER: (userId: string) => `/projects/user/${userId}`,
    TEAM: (id: string) => `/projects/${id}/team`,
    TEAM_MEMBER: (projectId: string, userId: string) => `/projects/${projectId}/team/${userId}`,
    MESSAGES: (id: string) => `/projects/${id}/messages`,
    MODELS: (id: string) => `/projects/${id}/models`,
    QUOTES: (id: string) => `/projects/${id}/quotes`,
    CONTRACTS: (id: string) => `/projects/${id}/contracts`,
    INSPECTIONS: (id: string) => `/projects/${id}/inspections`,
  },

  // Contractors
  CONTRACTORS: {
    BASE: '/contractors',
    BY_ID: (id: string) => `/contractors/${id}`,
    SEARCH: '/contractors/search',
    POSTS: (id: string) => `/contractors/${id}/posts`,
    POST: (contractorId: string, postId: string) => `/contractors/${contractorId}/posts/${postId}`,
    QUOTES: (id: string) => `/contractors/${id}/quotes`,
  },

  // Supervisors
  SUPERVISORS: {
    BASE: '/supervisors',
    BY_ID: (id: string) => `/supervisors/${id}`,
    SEARCH: '/supervisors/search',
  },

  // Inspections
  INSPECTIONS: {
    BASE: '/inspections',
    BY_ID: (id: string) => `/inspections/${id}`,
    COMPLETE: (id: string) => `/inspections/${id}/complete`,
    REPORT: (id: string) => `/inspections/${id}/report`,
  },

  // Quotes
  QUOTES: {
    BASE: '/quotes',
    BY_ID: (id: string) => `/quotes/${id}`,
    SEND: (id: string) => `/quotes/${id}/send`,
    ACCEPT: (id: string) => `/quotes/${id}/accept`,
    REJECT: (id: string) => `/quotes/${id}/reject`,
  },

  // Contracts
  CONTRACTS: {
    BASE: '/contracts',
    BY_ID: (id: string) => `/contracts/${id}`,
    SIGN: (id: string) => `/contracts/${id}/sign`,
    TERMINATE: (id: string) => `/contracts/${id}/terminate`,
    PDF: (id: string) => `/contracts/${id}/pdf`,
  },

  // 3D Models
  MODELS: {
    BASE: '/models',
    BY_ID: (id: string) => `/models/${id}`,
    ELEMENTS: (id: string) => `/models/${id}/elements`,
    ANALYSIS: (id: string) => `/models/${id}/analysis`,
  },

  // Building Elements
  ELEMENTS: {
    BY_ID: (id: string) => `/elements/${id}`,
    TRACKING: (id: string) => `/elements/${id}/tracking`,
    TRACKING_HISTORY: (id: string) => `/elements/${id}/tracking/history`,
  },

  // Messages
  MESSAGES: {
    BY_ID: (id: string) => `/messages/${id}`,
    MARK_READ: (id: string) => `/messages/${id}/read`,
  },
} as const;

/**
 * API request timeout (ms)
 */
export const API_TIMEOUT = 30000;

/**
 * API retry configuration
 */
export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;
