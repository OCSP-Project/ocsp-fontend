// src/lib/contractors/contractor-posts.types.ts

export interface ContractorPostImage {
  id: string;
  url: string;
  caption?: string;
}

export interface ContractorPost {
  id: string;
  title: string;
  description?: string;
  images: ContractorPostImage[];
  createdAt: string; // ISO string
}

export interface ContractorPostsQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
}


