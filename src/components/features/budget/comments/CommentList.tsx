'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { commentsApi } from '@/lib/api/comments';
import type { WorkItemComment, CreateCommentDto } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface CommentListProps {
  workItemId: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  projectId?: string;
}

export function CommentList({
  workItemId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  projectId,
}: CommentListProps) {
  const [comments, setComments] = useState<WorkItemComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { toast } = useToast();

  // Load comments
  useEffect(() => {
    loadComments();
  }, [workItemId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentsApi.getByWorkItemId(workItemId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải bình luận',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new comment
  const handleCreateComment = async (
    content: string,
    mentionedUserIds: string[]
  ) => {
    try {
      const dto: CreateCommentDto = {
        workItemId,
        content,
        parentCommentId: replyingTo,
        mentionedUserIds,
      };

      await commentsApi.create(dto);
      await loadComments(); // Reload to get updated list with replies

      toast({
        title: 'Thành công',
        description: 'Đã thêm bình luận',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm bình luận',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  // Handle edit
  const handleEdit = async (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
    // You can show edit modal or inline edit here
    // For simplicity, we'll just show a toast for now
    toast({
      title: 'Chỉnh sửa',
      description: 'Tính năng đang phát triển',
    });
  };

  // Handle delete
  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await commentsApi.delete(commentId);
      await loadComments();

      toast({
        title: 'Thành công',
        description: 'Đã xóa bình luận',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bình luận',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        <span>Thảo luận</span>
        <span className="text-sm font-normal text-gray-500">
          ({comments.length})
        </span>
      </div>

      <Separator />

      {/* Comment form */}
      <CommentForm
        onSubmit={handleCreateComment}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        projectId={projectId}
      />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Chưa có bình luận nào</p>
          <p className="text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
