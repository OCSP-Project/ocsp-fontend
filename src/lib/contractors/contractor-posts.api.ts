// src/lib/contractors/contractor-posts.api.ts
import { apiClient } from '@/lib/api/client';
import { ContractorPost, ContractorPostsQuery } from './contractor-posts.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ✅ Helper function để handle image URLs
export function getImageUrl(imagePath: string): string {
  // Nếu đã có full URL thì return luôn
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Nếu chỉ có path thì thêm domain (KHÔNG có /api)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  // Loại bỏ /api nếu có trong baseUrl
  const cleanBaseUrl = baseUrl.replace('/api', '');
  return `${cleanBaseUrl}${imagePath}`;
}

// ✅ NEW: Get current user's contractor profile
export async function getMyContractorProfile(): Promise<{ id: string; [key: string]: any }> {
  const response = await apiClient.get('/Contractor/me');
  return response.data;
}

export async function createContractorPost(
  title: string,
  description?: string,
  files?: File[]
): Promise<ContractorPost> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    // If has files, use multipart
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE}/Contractor/posts/multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    }
    
    // No files, use JSON
    const response = await fetch(`${API_BASE}/Contractor/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        imageUrls: []
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating contractor post:', error);
    throw error;
  }
}

export async function getContractorPosts(
  contractorId: string,
  query?: ContractorPostsQuery
): Promise<ContractorPost[]> {
  try {
    console.log('Fetching posts for contractor:', contractorId);
    console.log('Query params:', query);
    
    // Try using fetch directly instead of apiClient
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    
    const url = `${API_BASE}/Contractor/${contractorId}/posts`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Fetched posts data:', data);
    console.log('Data type:', typeof data);
    console.log('Data length:', data?.length);
    
    // Debug each post's images
    if (Array.isArray(data)) {
      data.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post.id,
          title: post.title,
          images: post.images,
          imagesLength: post.images?.length || 0,
          imagesType: typeof post.images
        });
      });
    }
    
    return data as ContractorPost[];
  } catch (error: any) {
    console.error('Error fetching contractor posts:', error);
    
    // Return empty array for now to prevent crashes
    return [];
  }
}

export async function deleteContractorPost(contractorId: string, postId: string): Promise<void> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    
    const url = `${API_BASE}/Contractor/${contractorId}/posts/${postId}`;
    console.log('Deleting post URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    console.log('Post deleted successfully');
  } catch (error) {
    console.error('Error deleting contractor post:', error);
    throw error;
  }
}


