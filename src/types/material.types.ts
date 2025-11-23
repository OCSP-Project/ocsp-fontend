// Material Request Status
export enum MaterialRequestStatus {
  Pending = 0,
  PartiallyApproved = 1,
  Approved = 2,
  Rejected = 3,
}

// Approver Role
export enum ApproverRole {
  Homeowner = 0,
  Supervisor = 1,
}

// Material Request DTOs
export interface MaterialRequestDto {
  id: string;
  projectId: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  requestDate: string;
  status: MaterialRequestStatus | string; // Can be enum number or string from backend
  approvedByHomeowner: boolean;  // Match backend field name
  approvedBySupervisor: boolean;  // Match backend field name
  approvedByHomeownerAt?: string; // Timestamp when homeowner approved
  approvedBySupervisorAt?: string; // Timestamp when supervisor approved
  rejectedAt?: string; // Timestamp when rejected
  projectDelegatesApprovalToSupervisor?: boolean; // Project has delegation enabled
  rejectionReason?: string;
  createdAt: string;
  materialCount: number;
}

export interface MaterialRequestDetailDto extends MaterialRequestDto {
  materials: MaterialDto[];
  approvalHistory: MaterialApprovalHistoryDto[];
}

export interface CreateMaterialRequestDto {
  projectId: string;
}

export interface ApproveMaterialRequestDto {
  approved: boolean;
  notes?: string;
}

export interface RejectMaterialRequestDto {
  reason: string;
}

// Material DTOs
export interface MaterialDto {
  id: string;
  materialRequestId: string; // Backend returns this field name
  projectId: string;
  code: string;
  name: string;
  unit: string;
  unitPrice: number;
  contractQuantity: number;
  contractAmount: number;
  estimatedQuantity?: number;
  estimatedAmount?: number;
  actualQuantity?: number;
  actualAmount?: number;
  variance?: number; // Chênh lệch %
  varianceAmount?: number;
}

export interface MaterialDetailDto extends MaterialDto {
  payments: MaterialPaymentDto[];
  updateHistory: MaterialUpdateHistoryDto[];
}

export interface UpdateMaterialDto {
  code?: string;
  name?: string;
  unit?: string;
  unitPrice?: number;
  contractQuantity?: number;
  estimatedQuantity?: number;
}

export interface UpdateActualQuantityDto {
  actualQuantity: number;
  notes?: string;
}

// Material Payment DTOs
export interface MaterialPaymentDto {
  id: string;
  materialId: string;
  projectId: string;
  amount: number;
  paidQuantity: number;
  paidAmount: number;
  remainingQuantity: number;
  remainingAmount: number;
  paymentDate: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateMaterialPaymentDto {
  materialId: string;
  amount: number;
  notes?: string;
}

// Material Approval History DTOs
export interface MaterialApprovalHistoryDto {
  id: string;
  requestId: string;
  approverRole: ApproverRole;
  approverId: string;
  approverName: string;
  approved: boolean;
  notes?: string;
  approvedAt: string;
}

// Update History (for tracking actual quantity changes)
export interface MaterialUpdateHistoryDto {
  id: string;
  materialId: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  notes?: string;
}

// Helper functions
export function parseStatusFromBackend(status: string | MaterialRequestStatus): MaterialRequestStatus {
  if (typeof status === 'number') return status;

  // Convert string to enum
  switch (status) {
    case 'Pending':
      return MaterialRequestStatus.Pending;
    case 'PartiallyApproved':
      return MaterialRequestStatus.PartiallyApproved;
    case 'Approved':
      return MaterialRequestStatus.Approved;
    case 'Rejected':
      return MaterialRequestStatus.Rejected;
    default:
      return MaterialRequestStatus.Pending;
  }
}

export function getMaterialRequestStatusLabel(status: MaterialRequestStatus | string): string {
  const enumStatus = parseStatusFromBackend(status);

  switch (enumStatus) {
    case MaterialRequestStatus.Pending:
      return 'Chờ duyệt';
    case MaterialRequestStatus.PartiallyApproved:
      return 'Đã duyệt 1/2';
    case MaterialRequestStatus.Approved:
      return 'Đã duyệt';
    case MaterialRequestStatus.Rejected:
      return 'Từ chối';
    default:
      return 'Không xác định';
  }
}

export function getMaterialRequestStatusColor(status: MaterialRequestStatus | string): string {
  const enumStatus = parseStatusFromBackend(status);

  switch (enumStatus) {
    case MaterialRequestStatus.Pending:
      return 'bg-yellow-100 text-yellow-800';
    case MaterialRequestStatus.PartiallyApproved:
      return 'bg-blue-100 text-blue-800';
    case MaterialRequestStatus.Approved:
      return 'bg-green-100 text-green-800';
    case MaterialRequestStatus.Rejected:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateVariance(contractQty: number, actualQty?: number): number | undefined {
  if (actualQty === undefined || actualQty === null) return undefined;
  if (contractQty === 0) return 0;
  return ((actualQty - contractQty) / contractQty) * 100;
}

export function getVarianceColor(variance?: number): string {
  if (variance === undefined) return 'text-gray-500';
  if (variance > 0) return 'text-red-600'; // Vượt dự toán
  if (variance < 0) return 'text-green-600'; // Tiết kiệm
  return 'text-gray-600';
}
