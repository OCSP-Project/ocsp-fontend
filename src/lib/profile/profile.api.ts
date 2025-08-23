import apiClient from '@/lib/api/client';

export interface ProfileDto {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
  role: number;
  isEmailVerified: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
}

export interface ProfileDocumentDto {
  id: string;
  profileId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string | null;
  documentType: string;
  uploadedAt: string;
}

export const profileApi = {
  async getProfile(): Promise<ProfileDto> {
    const res = await apiClient.get('/profile');
    return res.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<ProfileDto> {
    const res = await apiClient.put('/profile', data);
    return res.data;
    },

  async listDocuments(): Promise<ProfileDocumentDto[]> {
    const res = await apiClient.get('/profile/documents');
    return res.data;
  },

  async uploadDocument(file: File, options?: { description?: string; documentType?: string; }): Promise<ProfileDocumentDto> {
    const form = new FormData();
    form.append('file', file);
    if (options?.description) form.append('description', options.description);
    if (options?.documentType) form.append('documentType', options.documentType);
    const res = await apiClient.post('/profile/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/profile/documents/${documentId}`);
  },
};
