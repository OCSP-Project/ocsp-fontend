'use client';

import { useState } from 'react';
import { notification } from 'antd';
import { projectInvitationService } from '@/services/project-invitation.service';
import {
  ProjectParticipantRole,
  getRoleDisplayName,
  getInvitableRoles,
  InvitationResponseDto,
} from '@/types/project-invitation.types';

interface InviteMembersModalProps {
  projectId: string;
  currentUserRole: ProjectParticipantRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteMembersModal({
  projectId,
  currentUserRole,
  isOpen,
  onClose,
  onSuccess,
}: InviteMembersModalProps) {
  const [emails, setEmails] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectParticipantRole | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvitationResponseDto | null>(null);

  const invitableRoles = getInvitableRoles(currentUserRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      notification.warning({
        message: "Chưa chọn vai trò",
        description: "Vui lòng chọn vai trò",
      });
      return;
    }

    // Parse emails (split by comma, newline, or semicolon)
    const emailList = emails
      .split(/[,;\n]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      notification.warning({
        message: "Chưa nhập email",
        description: "Vui lòng nhập ít nhất một email",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await projectInvitationService.inviteMembers(projectId, {
        emails: emailList,
        role: selectedRole,
        customMessage: customMessage || undefined,
      });

      setResult(response);

      if (response.success) {
        // Reset form after 2 seconds
        setTimeout(() => {
          setEmails('');
          setCustomMessage('');
          setResult(null);
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmails('');
      setCustomMessage('');
      setResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent">
              Mời thành viên
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Gửi lời mời tham gia dự án cho nhà thầu, giám sát viên hoặc các thành viên khác.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-full p-1 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(Number(e.target.value) as ProjectParticipantRole)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#38c1b6] focus:outline-none focus:ring-2 focus:ring-[#38c1b6]/30"
              required
              disabled={loading}
            >
              <option value="">Chọn vai trò</option>
              {invitableRoles.map((role) => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Nhập nhiều email, cách nhau bởi dấu phẩy hoặc xuống dòng&#10;Ví dụ:&#10;user1@example.com, user2@example.com&#10;user3@example.com"
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-[#38c1b6] focus:outline-none focus:ring-2 focus:ring-[#38c1b6]/30"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Có thể nhập nhiều email, phân cách bằng dấu phẩy (,) hoặc xuống dòng
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Thêm lời nhắn cá nhân cho lời mời..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-[#38c1b6] focus:outline-none focus:ring-2 focus:ring-[#38c1b6]/30"
              disabled={loading}
            />
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg border text-sm ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-medium">
                {result.message}
              </p>

              {result.successfulInvites.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-emerald-700">Đã gửi lời mời:</p>
                  <ul className="list-disc list-inside text-xs text-emerald-700/90">
                    {result.successfulInvites.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.failedInvites.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700">Không thể gửi:</p>
                  <ul className="list-disc list-inside text-xs text-red-700/90">
                    {result.failedInvites.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Gửi lời mời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
