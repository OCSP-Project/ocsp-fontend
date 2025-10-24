export interface CreateQuoteRequestDto {
  projectId: string;
  scope: string;
  inviteeUserIds?: string[]; // contractor userIds
}

export interface QuoteRequestDto {
  id: string;
  projectId: string;
  scope: string;
  status: string; // QuoteStatus as string (e.g., "Draft")
  inviteeUserIds: string[];
}


