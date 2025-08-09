'use client';
import useSWR from 'swr';
import { api } from '@/lib/api/client';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export const useProjects = () => {
  const { data, error, mutate } = useSWR(`/projects`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
  });

  return {
    projects: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
