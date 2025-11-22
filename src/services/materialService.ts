import {
  MaterialRequestDto,
  MaterialRequestDetailDto,
  CreateMaterialRequestDto,
  ApproveMaterialRequestDto,
  RejectMaterialRequestDto,
  MaterialDto,
  MaterialDetailDto,
  UpdateMaterialDto,
  UpdateActualQuantityDto,
  MaterialPaymentDto,
  CreateMaterialPaymentDto,
} from '@/types/material.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Helper function to create headers
const getHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// Material Request APIs
export const materialService = {
  // ==================== Material Requests ====================

  async createRequest(dto: CreateMaterialRequestDto): Promise<MaterialRequestDetailDto> {
    const response = await fetch(`${API_BASE_URL}/Material/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create material request');
    }

    return response.json();
  },

  async getRequestsByProject(projectId: string): Promise<MaterialRequestDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/project/${projectId}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch material requests');
    }

    return response.json();
  },

  async getRequestById(id: string): Promise<MaterialRequestDetailDto> {
    const response = await fetch(`${API_BASE_URL}/Material/requests/${id}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch material request');
    }

    return response.json();
  },

  async importMaterials(requestId: string, file: File): Promise<MaterialRequestDetailDto> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}/import`,
      {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to import materials');
    }

    return response.json();
  },

  // ==================== Approvals ====================

  async approveByHomeowner(
    requestId: string,
    dto: ApproveMaterialRequestDto
  ): Promise<MaterialRequestDetailDto> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}/approve/homeowner`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve as homeowner');
    }

    return response.json();
  },

  async approveBySupervisor(
    requestId: string,
    dto: ApproveMaterialRequestDto
  ): Promise<MaterialRequestDetailDto> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}/approve/supervisor`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve as supervisor');
    }

    return response.json();
  },

  async rejectRequest(
    requestId: string,
    dto: RejectMaterialRequestDto
  ): Promise<MaterialRequestDetailDto> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}/reject`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject request');
    }

    return response.json();
  },

  async deleteRequest(requestId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete request');
    }
  },

  async clearImportedMaterials(requestId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/Material/requests/${requestId}/materials`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clear imported materials');
    }
  },

  // ==================== Materials ====================

  async getMaterialsByProject(projectId: string): Promise<MaterialDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/Material/project/${projectId}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    return response.json();
  },

  async getMaterialById(id: string): Promise<MaterialDetailDto> {
    const response = await fetch(`${API_BASE_URL}/Material/${id}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch material');
    }

    return response.json();
  },

  async updateMaterial(id: string, dto: UpdateMaterialDto): Promise<MaterialDto> {
    const response = await fetch(`${API_BASE_URL}/Material/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update material');
    }

    return response.json();
  },

  async updateActualQuantity(
    id: string,
    dto: UpdateActualQuantityDto
  ): Promise<MaterialDto> {
    const response = await fetch(
      `${API_BASE_URL}/Material/${id}/actual-quantity`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update actual quantity');
    }

    return response.json();
  },

  // ==================== Payments ====================

  async createPayment(dto: CreateMaterialPaymentDto): Promise<MaterialPaymentDto> {
    const response = await fetch(`${API_BASE_URL}/Material/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment');
    }

    return response.json();
  },

  async getPaymentsByMaterial(materialId: string): Promise<MaterialPaymentDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/Material/${materialId}/payments`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  },

  async getPaymentsByProject(projectId: string): Promise<MaterialPaymentDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/Material/payments/project/${projectId}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  },
};
