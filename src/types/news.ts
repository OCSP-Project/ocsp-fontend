export interface News {
  id: string;
  title: string;
  author: string;
  dateStart?: string;
  imageLinks: string[];
  contentNews: string;
  originalLink?: string;
  scheduledPublishAt?: string;
  isPublished: boolean;
  publishedAt?: string;
  isFeatured: boolean;
  viewCount: number;
  category?: string;
  tags?: string;
  n8nWorkflowId?: string;
  crawledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsDto {
  title: string;
  author: string;
  dateStart?: string;
  imageLinks: string[];
  contentNews: string;
  originalLink?: string;
  scheduledPublishAt?: string;
  publishImmediately: boolean;
  isFeatured: boolean;
  category?: string;
  tags?: string;
}

export interface UpdateNewsDto {
  title?: string;
  author?: string;
  dateStart?: string;
  imageLinks?: string[];
  contentNews?: string;
  originalLink?: string;
  isFeatured?: boolean;
  category?: string;
  tags?: string;
}

export interface ScheduleNewsDto {
  scheduledPublishAt: string;
}
