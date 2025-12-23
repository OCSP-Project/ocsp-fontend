import apiClient from '../api/client';

const BASE = '/building-elements';

export const buildingElementsApi = {
  getByModel: async (modelId: string) => {
    const res = await apiClient.get(`${BASE}/models/${modelId}/elements`);
    return (res.data as any[]).map((e: any) => ({
      ...e,
      meshIndices: safeParseJsonArray(e.meshIndicesJson),
      trackingStatus: mapTrackingStatus(e.trackingStatus),
    }));
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`${BASE}/${id}`);
    const d = res.data;
    return {
      ...d,
      meshIndices: safeParseJsonArray(d.meshIndicesJson),
      trackingStatus: mapTrackingStatus(d.trackingStatus),
    };
  },

  getDetail: async (id: string) => {
    const res = await apiClient.get(`${BASE}/${id}/detail`);
    const d = res.data;
    return {
      ...d,
      meshIndices: safeParseJsonArray(d.meshIndicesJson),
      trackingStatus: mapTrackingStatus(d.trackingStatus),
    };
  },

  create: async (req: {
    modelId: string;
    name: string;
    elementType: number;
    floorLevel: number;
    meshIndices: number[];
  }) => {
    const res = await apiClient.post(BASE, req);
    return res.data;
  },

  update: async (
    id: string,
    req: Partial<{
      name: string;
      elementType: number;
      floorLevel: number;
      meshIndices: number[];
    }>
  ) => {
    const res = await apiClient.put(`${BASE}/${id}`, req);
    return res.data;
  },

  addTracking: async (
    elementId: string,
    req: {
      newStatus: number;
      newPercentage: number;
      plannedQuantity?: number;
      actualQuantity?: number;
      cementUsed?: number;
      sandUsed?: number;
      aggregateUsed?: number;
      notes?: string;
    }
  ) => {
    const res = await apiClient.post(`${BASE}/${elementId}/tracking`, req);
    return res.data;
  },

  getHistory: async (elementId: string) => {
    const res = await apiClient.get(`${BASE}/${elementId}/tracking/history`);
    return res.data;
  },

  addPhoto: async (historyId: string, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('photo', file); // ← Match backend param name
    formData.append('caption', caption || '');
    const res = await apiClient.post(
      `${BASE}/tracking/${historyId}/photos/upload`, // ← Fixed endpoint
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  getPhotos: async (historyId: string) => {
    const res = await apiClient.get(`${BASE}/tracking/${historyId}/photos`);
    return res.data;
  },

  deletePhoto: async (photoId: string) => {
    await apiClient.delete(`${BASE}/photos/${photoId}`);
  },

  getModelSummary: async (modelId: string) => {
    const res = await apiClient.get(`${BASE}/models/${modelId}/summary`);
    return res.data;
  },
};

function safeParseJsonArray(jsonLike: any): number[] {
  try {
    if (Array.isArray(jsonLike)) return jsonLike as number[];
    if (typeof jsonLike === 'string') return JSON.parse(jsonLike || '[]');
    return [];
  } catch {
    return [];
  }
}

function mapTrackingStatus(
  status: number
): 'not_started' | 'in_progress' | 'completed' | 'on_hold' {
  const map: Record<number, any> = {
    0: 'not_started',
    1: 'in_progress',
    2: 'completed',
    3: 'on_hold',
  };
  return map[status] || 'not_started';
}


