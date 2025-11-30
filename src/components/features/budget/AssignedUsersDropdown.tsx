'use client';

import { useState, useRef, useEffect } from 'react';
import { notification } from 'antd';
import { projectsApi } from '@/lib/projects/projects.api';

interface ProjectMember {
  userId: string;
  userName: string;
  role?: string;
}

interface AssignedUser {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
}

interface AssignedUsersDropdownProps {
  workItemId: string;
  projectId: string;
  currentUsers: AssignedUser[];
  onUsersChange: (userIds: string[]) => Promise<void>;
  disabled?: boolean;
}

export function AssignedUsersDropdown({
  workItemId,
  projectId,
  currentUsers,
  onUsersChange,
  disabled = false,
}: AssignedUsersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(currentUsers.map(u => u.id))
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;

      try {
        setIsLoadingMembers(true);
        const participants = await projectsApi.getProjectMembers(projectId);
        setProjectMembers(participants);
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (isOpen && projectMembers.length === 0) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Update selectedUserIds when currentUsers changes
  useEffect(() => {
    setSelectedUserIds(new Set(currentUsers.map(u => u.id)));
  }, [currentUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close dropdown if currently updating
      if (isUpdating) return;

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isUpdating]);

  const handleToggleUser = async (userId: string) => {
    if (isUpdating) return; // Prevent multiple clicks

    const previousSelectedIds = new Set(selectedUserIds);
    const newSelectedIds = new Set(selectedUserIds);

    if (newSelectedIds.has(userId)) {
      newSelectedIds.delete(userId);
    } else {
      newSelectedIds.add(userId);
    }

    // Optimistically update UI
    setSelectedUserIds(newSelectedIds);

    // Call API to update assigned users
    try {
      setIsUpdating(true);
      await onUsersChange(Array.from(newSelectedIds));
      // Clear search after adding
      setSearchQuery('');
    } catch (error) {
      // Revert on error
      setSelectedUserIds(previousSelectedIds);
      console.error('Error updating assigned users:', error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật người thực hiện. Vui lòng thử lại.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (isUpdating) return;

    const previousSelectedIds = new Set(selectedUserIds);
    const newSelectedIds = new Set(selectedUserIds);
    newSelectedIds.delete(userId);

    setSelectedUserIds(newSelectedIds);

    try {
      setIsUpdating(true);
      await onUsersChange(Array.from(newSelectedIds));
    } catch (error) {
      setSelectedUserIds(previousSelectedIds);
      console.error('Error removing user:', error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa người thực hiện. Vui lòng thử lại.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter members by search query
  const filteredMembers = projectMembers.filter(member =>
    member.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedUserIds.has(member.userId)
  );

  return (
    <div className="space-y-3">
      {/* Selected users as tags */}
      {currentUsers && currentUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="font-medium">{user.fullName}</span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                disabled={isUpdating || disabled}
                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm kiếm và thêm người thực hiện..."
            disabled={disabled || isUpdating}
            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {isUpdating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown results */}
        {isOpen && searchQuery && (
          <div className="absolute z-[100] mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="py-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => handleToggleUser(member.userId)}
                    disabled={isUpdating}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {member.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{member.userName}</div>
                      {member.role && (
                        <div className="text-xs text-gray-500">{member.role}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Không tìm thấy thành viên
              </div>
            )}
          </div>
        )}
      </div>

      {!currentUsers || currentUsers.length === 0 && !searchQuery && (
        <p className="text-gray-500 text-sm italic">Chưa có người thực hiện</p>
      )}
    </div>
  );
}
