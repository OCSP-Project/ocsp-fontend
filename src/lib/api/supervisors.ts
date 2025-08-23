import apiClient from "./client";

export interface SupervisorListItemDto {
  id: string;
  username: string;
  email: string;
  department?: string;
  position?: string;
  district?: string;
  rating?: number;
  reviewsCount?: number;
  minRate?: number;
  maxRate?: number;
  availableNow?: boolean;
}

export interface SupervisorDetailsDto extends SupervisorListItemDto {
  phone?: string;
  bio?: string;
  yearsExperience?: number;
}

export interface SupervisorFilterRequest {
  district?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  availableNow?: boolean;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}


// 1. Filter + phân trang
export async function filterSupervisors(
  req: SupervisorFilterRequest
): Promise<PagedResult<SupervisorListItemDto>> {
  const res = await apiClient.post<PagedResult<SupervisorListItemDto>>(
    "/Supervisor/filter",
    req
  );
  return res.data;
}

// 2. Lấy tất cả supervisors
export async function getAllSupervisors(): Promise<SupervisorListItemDto[]> {
  const res = await apiClient.get<SupervisorListItemDto[]>("/Supervisor/all");
  return res.data;
}

// 3. Lấy chi tiết 1 supervisor
export async function getSupervisorById(
  id: string
): Promise<SupervisorDetailsDto> {
  const res = await apiClient.get<SupervisorDetailsDto>(`/Supervisor/${id}`);
  return res.data;
}
