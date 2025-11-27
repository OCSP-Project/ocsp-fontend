export interface MentionedUser {
  userId: string;
  username: string;
  fullName: string;
}

export interface WorkItemComment {
  id: string;
  workItemId: string;
  createdById: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  content: string;
  parentCommentId?: string | null;
  replies?: WorkItemComment[];
  mentionedUsers: MentionedUser[];
  attachments?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  workItemId: string;
  content: string;
  parentCommentId?: string | null;
  mentionedUserIds?: string[];
  attachments?: string | null;
}

export interface UpdateCommentDto {
  content: string;
  mentionedUserIds?: string[];
  attachments?: string | null;
}
