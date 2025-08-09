export enum UserRole {
  HOMEOWNER = 'homeowner',
  CONTRACTOR = 'contractor',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

export enum Permission {
  CREATE_PROJECT = 'create_project',
  MANAGE_USERS = 'manage_users',
  VIEW_REPORTS = 'view_reports',
  SUPERVISE_PROJECTS = 'supervise_projects',
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.HOMEOWNER]: [Permission.CREATE_PROJECT, Permission.VIEW_REPORTS],
  [UserRole.CONTRACTOR]: [Permission.VIEW_REPORTS],
  [UserRole.SUPERVISOR]: [Permission.SUPERVISE_PROJECTS, Permission.VIEW_REPORTS],
  [UserRole.ADMIN]: [Permission.MANAGE_USERS, Permission.VIEW_REPORTS, Permission.CREATE_PROJECT],
};
