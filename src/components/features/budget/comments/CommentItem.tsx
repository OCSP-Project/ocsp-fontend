'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { User, MoreHorizontal, Trash2, Edit2, Reply } from 'lucide-react';
import type { WorkItemComment } from '@/types/comment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommentItemProps {
  comment: WorkItemComment;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  level = 0,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const isOwner = currentUserId === comment.createdById;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: vi,
    });
  };

  // Render comment content with @mentions highlighted
  const renderContent = () => {
    let content = comment.content;

    // Highlight mentions
    if (comment.mentionedUsers && comment.mentionedUsers.length > 0) {
      comment.mentionedUsers.forEach((user) => {
        const mentionPattern = new RegExp(`@${user.username}`, 'gi');
        content = content.replace(
          mentionPattern,
          `<span class="text-blue-600 font-semibold">@${user.username}</span>`
        );
      });
    }

    return (
      <div
        className="text-sm text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div className={`flex gap-2 ${level > 0 ? 'ml-10' : ''} group`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.createdByAvatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
            {getInitials(comment.createdByName)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Comment content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full break-words">
          {/* Name and role */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {comment.createdByName}
            </span>
            {comment.createdByRole && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5 bg-blue-100 text-blue-700 hover:bg-blue-100"
              >
                {comment.createdByRole}
              </Badge>
            )}
          </div>

          {/* Content */}
          {renderContent()}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-1 px-3 text-xs font-semibold">
          <span className="text-gray-500">{formatTime(comment.createdAt)}</span>

          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Trả lời
            </button>
          )}

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(comment.id, comment.content)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Replies */}
        {hasReplies && (
          <div className="mt-2 space-y-2">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
