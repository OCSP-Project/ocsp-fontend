// src/services/project-invitation.service.ts
import apiClient from '@/lib/api/client';
import {
  InviteMembersDto,
  InvitationResponseDto,
  ProjectInvitationDto,
  RespondToInvitationDto,
} from '@/types/project-invitation.types';

export const projectInvitationService = {
  /**
   * Mời nhiều thành viên vào project
   */
  inviteMembers: async (
    projectId: string,
    dto: InviteMembersDto
  ): Promise<InvitationResponseDto> => {
    const response = await apiClient.post(
      `/projects/${projectId}/invitations`,
      dto
    );
    return response.data;
  },

  /**
   * Lấy danh sách lời mời của một project
   */
  getProjectInvitations: async (
    projectId: string
  ): Promise<ProjectInvitationDto[]> => {
    const response = await apiClient.get(`/projects/${projectId}/invitations`);
    return response.data;
  },

  /**
   * Hủy lời mời
   */
  cancelInvitation: async (
    projectId: string,
    invitationId: string
  ): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/invitations/${invitationId}`);
  },

  /**
   * Lấy thông tin invitation bằng token (public - không cần auth)
   */
  getInvitationByToken: async (token: string): Promise<ProjectInvitationDto> => {
    const response = await apiClient.get(`/invitations/${token}`);
    return response.data;
  },

  /**
   * Chấp nhận hoặc từ chối lời mời
   */
  respondToInvitation: async (
    token: string,
    dto: RespondToInvitationDto
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/invitations/${token}/respond`, dto);
    return response.data;
  },
};
