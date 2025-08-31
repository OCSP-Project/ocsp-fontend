export interface SupervisorListItemDto {
  id: string;
  username: string;
  email: string;
  district?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface SupervisorDetailsDto {
  id: string;
  username: string;
  email: string;
  phone?: string;
  district?: string;
  department?: string;
  position?: string;
  yearsExperience?: number;
  rating?: number;
  reviewsCount?: number;
  availableNow?: boolean; // Changed from boolean to boolean | undefined
  minRate?: number;
  maxRate?: number;
  bio?: string;
}
