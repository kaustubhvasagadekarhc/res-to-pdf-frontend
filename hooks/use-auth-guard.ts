'use client';

import { authService } from '@/services/auth.services';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';

export type UserType = 'user' | 'Admin';

/**
 * useAuthGuard verifies authentication and optionally enforces a required role.
 * - If not authenticated -> redirects to `/auth`.
 * - If requiredRole is provided and cached data exists -> redirects to the other dashboard.
 * - If no cache exists, it will call `fetchUserDashboard` once and then enforce the role.
 */
export function useAuthGuard(requiredRole?: UserType) {
    const router = useRouter();
    const { getCachedDashboardData, fetchUserDashboard } = useDashboard();

    useEffect(() => {
        let mounted = true;

        const ensure = async () => {
            if (!authService.isAuthenticated()) {
                router.replace('/');
                return;
            }

            // check cache first
            const cached = getCachedDashboardData();
            if (cached) {
                const userType = cached.userType || cached.user?.userType;
                if (requiredRole && userType && userType !== requiredRole) {
                    // redirect to the correct role's dashboard
                    if (userType === 'user') {
                        router.replace('/dashboard/user');
                    } else if (userType === 'Admin') {
                        router.replace('/dashboard/Admin');
                    }
                }
                return;
            }

            // If no cache, fetch once and enforce role
            const userId = authService.getUserId();
            if (!userId) {
                router.replace('/');
                return;
            }

            try {
                const res = await fetchUserDashboard(userId);
                if (!mounted) return;
                const userType = res?.data?.userType || res?.data?.user?.userType;
                if (requiredRole && userType && userType !== requiredRole) {
                    if (userType === 'user') {
                        router.replace('/dashboard/user');
                    } else if (userType === 'Admin') {
                        router.replace('/dashboard/Admin');
                    }
                }
            } catch (err) {
                console.error('Auth guard failed to fetch user:', err);
                // On error, push to auth to let user re-auth
                if (mounted) router.replace('/auth');
            }
        };

        ensure();

        return () => {
            mounted = false;
        };
    }, [router, requiredRole, fetchUserDashboard, getCachedDashboardData]);
}
