'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.services';

export function useAuthGuard(requiredRole?: 'Admin' | 'User') {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    if (requiredRole) {
      const cached = localStorage.getItem('dashboardData');
      if (cached) {
        const data = JSON.parse(cached);
        const userType = data.userType || data.user?.userType;
        if (requiredRole === 'Admin' && userType !== 'admin') {
          router.replace('/dashboard/user');
        }
      }
    }
  }, [router, requiredRole]);
}
