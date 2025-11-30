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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-stone-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-stone-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-600">
          <h2 className="text-2xl font-bold text-amber-300">Mời thành viên</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-stone-400 hover:text-stone-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Vai trò <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(Number(e.target.value) as ProjectParticipantRole)}
              className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded-lg text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Nhập nhiều email, cách nhau bởi dấu phẩy hoặc xuống dòng&#10;Ví dụ:&#10;user1@example.com, user2@example.com&#10;user3@example.com"
              rows={4}
              className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded-lg text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-stone-400">
              Có thể nhập nhiều email, phân cách bằng dấu phẩy (,) hoặc xuống dòng
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Thêm lời nhắn cá nhân cho lời mời..."
              rows={3}
              className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded-lg text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
              <p className={`font-medium ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.message}
              </p>

              {result.successfulInvites.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-green-400">Đã gửi lời mời:</p>
                  <ul className="list-disc list-inside text-sm text-green-300">
                    {result.successfulInvites.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.failedInvites.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-400">Không thể gửi:</p>
                  <ul className="list-disc list-inside text-sm text-red-300">
                    {result.failedInvites.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-600">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-stone-300 bg-stone-700 border border-stone-600 rounded-lg hover:bg-stone-600 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-stone-900 bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
