'use client';

import { useEffect, useState } from 'react';
import { notification, Modal } from 'antd';
import { projectInvitationService } from '@/services/project-invitation.service';
import {
  ProjectInvitationDto,
  getStatusDisplayName,
  getStatusColor,
  InvitationStatus,
} from '@/types/project-invitation.types';

interface InvitationsListProps {
  projectId: string;
  refreshTrigger?: number;
}

export function InvitationsList({ projectId, refreshTrigger }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<ProjectInvitationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectInvitationService.getProjectInvitations(projectId);
      setInvitations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [projectId, refreshTrigger]);

  const handleCancel = async (invitationId: string) => {
    Modal.confirm({
      title: "Xác nhận hủy",
      content: "Bạn có chắc chắn muốn hủy lời mời này?",
      okText: "Hủy lời mời",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          await projectInvitationService.cancelInvitation(projectId, invitationId);
          loadInvitations(); // Reload list
        } catch (error: any) {
          notification.error({
            message: "Lỗi",
            description: error.response?.data?.message || 'Không thể hủy lời mời',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadInvitations}
          className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-stone-700/30 border border-stone-600 rounded-lg p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto text-stone-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-stone-400">Chưa có lời mời nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-stone-700/30 border border-stone-600 rounded-lg p-4 hover:bg-stone-700/50 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Email */}
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-stone-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium text-stone-100">{invitation.inviteeEmail}</span>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 text-sm text-stone-300 mb-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{invitation.roleName}</span>
              </div>

              {/* Invited By */}
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <span>Được mời bởi:</span>
                <span className="font-medium text-stone-300">{invitation.invitedByName}</span>
              </div>

              {/* Dates */}
              <div className="mt-2 text-xs text-stone-500 space-y-1">
                <div>Ngày gửi: {formatDate(invitation.createdAt)}</div>
                {invitation.isExpired && (
                  <div className="text-red-400">Hết hạn: {formatDate(invitation.expiresAt)}</div>
                )}
                {invitation.respondedAt && (
                  <div>Phản hồi: {formatDate(invitation.respondedAt)}</div>
                )}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  invitation.status
                )}`}
              >
                {getStatusDisplayName(invitation.status)}
              </span>

              {invitation.status === InvitationStatus.Pending && !invitation.isExpired && (
                <button
                  onClick={() => handleCancel(invitation.id)}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline"
                >
                  Hủy lời mời
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
