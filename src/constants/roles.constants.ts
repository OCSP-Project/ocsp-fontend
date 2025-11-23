// src/constants/roles.constants.ts

/**
 * User roles and permissions
 */

export const USER_ROLES = {
  HOMEOWNER: 'homeowner',
  CONTRACTOR: 'contractor',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.HOMEOWNER]: 'Homeowner',
  [USER_ROLES.CONTRACTOR]: 'Contractor',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.ADMIN]: 'Admin',
} as const;

/**
 * Permissions for each role
 */
export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',

  // Quote permissions
  QUOTE_CREATE: 'quote:create',
  QUOTE_READ: 'quote:read',
  QUOTE_UPDATE: 'quote:update',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_SEND: 'quote:send',
  QUOTE_ACCEPT: 'quote:accept',

  // Contract permissions
  CONTRACT_CREATE: 'contract:create',
  CONTRACT_READ: 'contract:read',
  CONTRACT_UPDATE: 'contract:update',
  CONTRACT_SIGN: 'contract:sign',

  // Inspection permissions
  INSPECTION_CREATE: 'inspection:create',
  INSPECTION_READ: 'inspection:read',
  INSPECTION_UPDATE: 'inspection:update',
  INSPECTION_COMPLETE: 'inspection:complete',

  // Model permissions
  MODEL_UPLOAD: 'model:upload',
  MODEL_READ: 'model:read',
  MODEL_DELETE: 'model:delete',
  MODEL_TRACK: 'model:track',

  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Chat permissions
  CHAT_SEND: 'chat:send',
  CHAT_READ: 'chat:read',
} as const;

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.HOMEOWNER]: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_ACCEPT,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.CONTRACT_SIGN,
    PERMISSIONS.INSPECTION_READ,
    PERMISSIONS.MODEL_UPLOAD,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_READ,
  ],
  [USER_ROLES.CONTRACTOR]: [
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_UPDATE,
    PERMISSIONS.QUOTE_SEND,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.CONTRACT_SIGN,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.MODEL_TRACK,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_READ,
  ],
  [USER_ROLES.SUPERVISOR]: [
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.INSPECTION_CREATE,
    PERMISSIONS.INSPECTION_READ,
    PERMISSIONS.INSPECTION_UPDATE,
    PERMISSIONS.INSPECTION_COMPLETE,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_READ,
  ],
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
} as const;

/**
 * Check if role has permission
 */
export const hasPermission = (role: string, permission: string): boolean => {
  const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  return rolePerms ? rolePerms.includes(permission) : false;
};
