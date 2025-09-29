// src/hooks/useRoleRedirect.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers';
import { getDashboardRoute } from '@/lib/utils/roleRouting';

export const useRoleRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  const redirectToDashboard = () => {
    if (user && isAuthenticated) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Auto redirect after login
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        redirectToDashboard();
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return { redirectToDashboard };
};