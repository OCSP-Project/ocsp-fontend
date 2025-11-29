'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MentionTextarea } from './MentionTextarea';

interface CommentFormProps {
  onSubmit: (content: string, mentionedUserIds: string[]) => Promise<void>;
  placeholder?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  autoFocus?: boolean;
  projectId?: string;
}

export function CommentForm({
  onSubmit,
  placeholder = 'Viết bình luận...',
  currentUserName = 'User',
  currentUserAvatar,
  replyingTo,
  onCancelReply,
  autoFocus = false,
  projectId,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, mentionedUserIds);
      setContent('');
      setMentionedUserIds([]);
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-start">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUserAvatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
            {getInitials(currentUserName)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Input area */}
      <div className="flex-1 relative">
        {replyingTo && (
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <span>Đang trả lời {replyingTo}</span>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="relative">
          <MentionTextarea
            value={content}
            onChange={setContent}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] pr-12 resize-none rounded-2xl bg-gray-100 border-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            projectId={projectId}
            onMentionSelect={setMentionedUserIds}
          />

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-1 text-xs text-gray-500">
          Nhấn Ctrl+Enter để gửi
        </div>
      </div>
    </div>
  );
}
