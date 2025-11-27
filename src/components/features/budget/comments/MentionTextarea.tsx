'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { projectsApi } from '@/lib/projects/projects.api';

interface ProjectMember {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
  role?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  projectId?: string;
  onMentionSelect?: (userIds: string[]) => void;
}

export function MentionTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  projectId,
  onMentionSelect,
}: MentionTextareaProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<Set<string>>(new Set());
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch project members from API
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setProjectMembers([]);
        return;
      }

      try {
        setIsLoadingMembers(true);
        const participants = await projectsApi.getProjectMembers(projectId);

        // Map backend data to ProjectMember interface
        const members: ProjectMember[] = participants.map((p: any) => ({
          id: p.userId,
          fullName: p.userName,
          username: p.userName.toLowerCase().replace(/\s+/g, ''), // Generate username from fullName
          role: p.role,
        }));

        setProjectMembers(members);
      } catch (error) {
        console.error('Error fetching project members:', error);
        setProjectMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check if user typed @
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

      // Show mentions if @ is at start or after space/newline
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (/\s/.test(charBeforeAt) || lastAtIndex === 0) {
        // Check if there's no space after @
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setMentionSearch(textAfterAt);
          setShowMentions(true);
          setSelectedIndex(0);

          // Calculate position for dropdown
          if (textareaRef.current) {
            const rect = textareaRef.current.getBoundingClientRect();
            setMentionPosition({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            });
          }
          return;
        }
      }
    }

    setShowMentions(false);
  };

  const filteredMembers = projectMembers.filter((member) =>
    member.fullName.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    member.username.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const insertMention = (member: ProjectMember) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);

    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeAt = value.slice(0, lastAtIndex);
    const mention = `@${member.username}`;
    const newValue = textBeforeAt + mention + ' ' + textAfterCursor;

    onChange(newValue);
    setShowMentions(false);

    // Add to mentioned users
    const newMentionedUsers = new Set(mentionedUsers);
    newMentionedUsers.add(member.id);
    setMentionedUsers(newMentionedUsers);

    // Notify parent
    if (onMentionSelect) {
      onMentionSelect(Array.from(newMentionedUsers));
    }

    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = textBeforeAt.length + mention.length + 1;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredMembers[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }

    // Call parent's onKeyDown
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMentions) {
        const target = e.target as Node;
        const clickedInTextarea = textareaRef.current?.contains(target);
        const clickedInDropdown = dropdownRef.current?.contains(target);

        if (!clickedInTextarea && !clickedInDropdown) {
          setShowMentions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentions]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        className={className}
      />

      {/* Mention dropdown */}
      {showMentions && (
        <div ref={dropdownRef} className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoadingMembers ? (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Đang tải danh sách thành viên...
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <div
                key={member.id}
                onClick={() => insertMention(member)}
                className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                  {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{member.fullName}</div>
                  <div className="text-xs text-gray-500">@{member.username}</div>
                </div>
                {member.role && (
                  <div className="text-xs text-gray-500">{member.role}</div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Không tìm thấy thành viên
            </div>
          )}
        </div>
      )}
    </div>
  );
}
