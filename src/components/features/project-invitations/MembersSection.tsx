'use client';

import { useState } from 'react';
import { InviteMembersModal } from './InviteMembersModal';
import { InvitationsList } from './InvitationsList';
import { ProjectParticipantRole } from '@/types/project-invitation.types';

interface MembersSectionProps {
  projectId: string;
  currentUserRole: ProjectParticipantRole;
}

export function MembersSection({ projectId, currentUserRole }: MembersSectionProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInviteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Check if user can invite
  const canInvite = currentUserRole === ProjectParticipantRole.Homeowner ||
                   currentUserRole === ProjectParticipantRole.MainContractor ||
                   currentUserRole === ProjectParticipantRole.MainSupervisor;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-amber-300 tracking-wide">Thành viên dự án</h2>
          <p className="text-stone-400 mt-1 text-sm">Quản lý lời mời và thành viên tham gia dự án</p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-stone-900 rounded-lg hover:bg-amber-500 transition-colors font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Mời thành viên
          </button>
        )}
      </div>

      {/* Invitations List */}
      <div>
        <h3 className="text-base font-medium text-stone-300 mb-4">Lời mời đã gửi</h3>
        <InvitationsList projectId={projectId} refreshTrigger={refreshTrigger} />
      </div>

      {/* Invite Modal */}
      <InviteMembersModal
        projectId={projectId}
        currentUserRole={currentUserRole}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
