'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export function useAuthGuard(requiredRole?: 'Admin' | 'User') {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Don't check on auth pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/otp-verification')) {
      hasCheckedRef.current = false; // Reset when on auth pages
      return;
    }

    // Wait for user data to load - don't redirect while loading
    if (loading) {
      return;
    }

    // If user exists, check role and mark as checked
    if (user) {
      // Check role if required
      if (requiredRole) {
        const userType = user.userType;
        
        if (requiredRole === 'Admin' && userType !== 'ADMIN') {
          hasCheckedRef.current = true;
          router.replace('/user');
          return;
        }
        
        if (requiredRole === 'User' && userType !== 'USER') {
          // Allow ADMIN to access user routes, but redirect USER away from admin routes
          // This is handled above for Admin role
        }
      }

      // If we get here, authentication is valid
      hasCheckedRef.current = true;
      return;
    }

    // No user and not loading - redirect to login
    // Only redirect once to prevent loops
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      router.replace('/login');
    }
  }, [router, requiredRole, user, loading, pathname]);
}
