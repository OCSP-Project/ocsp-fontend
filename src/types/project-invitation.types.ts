// Project Invitation Types

export enum ProjectParticipantRole {
  MainSupervisor = 1,
  SubSupervisor = 2,
  MainContractor = 3,
  SubContractor = 4,
  Homeowner = 5,
}

export enum InvitationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Expired = 3,
}

export interface ProjectInvitationDto {
  id: string;
  projectId: string;
  projectName: string;
  inviteeEmail: string;
  invitedByName: string;
  invitedByEmail: string;
  role: ProjectParticipantRole;
  roleName: string;
  status: InvitationStatus;
  statusName: string;
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  isExpired: boolean;
}

export interface InviteMembersDto {
  emails: string[];
  role: ProjectParticipantRole;
  customMessage?: string;
}

export interface InvitationResponseDto {
  success: boolean;
  message: string;
  successfulInvites: string[];
  failedInvites: string[];
  invitations: ProjectInvitationDto[];
}

export interface RespondToInvitationDto {
  accept: boolean;
}

// Helper functions
export const getRoleDisplayName = (role: ProjectParticipantRole): string => {
  switch (role) {
    case ProjectParticipantRole.MainSupervisor:
      return 'Giám sát chính';
    case ProjectParticipantRole.SubSupervisor:
      return 'Giám sát phụ';
    case ProjectParticipantRole.MainContractor:
      return 'Nhà thầu chính';
    case ProjectParticipantRole.SubContractor:
      return 'Nhà thầu phụ';
    case ProjectParticipantRole.Homeowner:
      return 'Chủ nhà';
    default:
      return 'Unknown';
  }
};

export const getStatusDisplayName = (status: InvitationStatus): string => {
  switch (status) {
    case InvitationStatus.Pending:
      return 'Đang chờ';
    case InvitationStatus.Accepted:
      return 'Đã chấp nhận';
    case InvitationStatus.Rejected:
      return 'Đã từ chối';
    case InvitationStatus.Expired:
      return 'Hết hạn';
    default:
      return 'Unknown';
  }
};

export const getStatusColor = (status: InvitationStatus): string => {
  switch (status) {
    case InvitationStatus.Pending:
      return 'text-yellow-600 bg-yellow-50';
    case InvitationStatus.Accepted:
      return 'text-green-600 bg-green-50';
    case InvitationStatus.Rejected:
      return 'text-red-600 bg-red-50';
    case InvitationStatus.Expired:
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Permission helper: What roles can the current user invite?
export const getInvitableRoles = (userRole: ProjectParticipantRole): ProjectParticipantRole[] => {
  switch (userRole) {
    case ProjectParticipantRole.Homeowner:
      return [
        ProjectParticipantRole.MainSupervisor,
        ProjectParticipantRole.SubSupervisor,
        ProjectParticipantRole.MainContractor,
        ProjectParticipantRole.SubContractor,
      ];
    case ProjectParticipantRole.MainContractor:
      return [ProjectParticipantRole.SubContractor];
    case ProjectParticipantRole.MainSupervisor:
      return [ProjectParticipantRole.SubSupervisor];
    default:
      return [];
  }
};
