'use client';

import {
  authService,
  LoginDTO,
  RegisterDTO,
  VerifyOtpDTO,
  APIResponse,
} from '@/services/auth.services';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useApi } from '@/hooks/use-api';

export function useAuth() {
  const router = useRouter();
  const { execute, isLoading, error } = useApi<APIResponse>();

  const login = async (data: LoginDTO) => {
    const response = await execute(() => authService.login(data));
    if (response?.data?.user?.userType === 'user') {
      router.push('/dashboard/user');
    } else if (response?.data?.user?.userType === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (data: RegisterDTO) => {
    await execute(() => authService.register(data));
    try {
      sessionStorage.setItem('otpEmail', data.email);
    } catch (err) {
      console.error('Failed to persist otpEmail in sessionStorage', err);
    }
    router.push('/auth/otp');
  };

  const verifyOtp = async (data: VerifyOtpDTO) => {
    const response = await execute(() => authService.verifyOtp(data));
    if (response?.data?.user?.userType === 'user') {
      router.push('/dashboard/user');
    } else if (response?.data?.user?.userType === 'admin') {
      router.push('/dashboard/Admin');
    } else {
      router.push('/dashboard');
    }
  };

  const resendOtp = async (email: string) => {
    await execute(() => authService.resendOtp(email));
  };

  const logout = async () => {
    try {
      await authService.logout();
      router.push('/auth?view=login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkAuth = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return {
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    checkAuth,
    isLoading,
    error,
  };
}
