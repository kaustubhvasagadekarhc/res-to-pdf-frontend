'use client';

import { useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { DashboardUserResponse, ResumeParseResponse, ResumeUploadResponse } from '@/services/dashboard.types';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboard() {
  const {
    execute: executeUpload,
    isLoading: isUploading,
    error: uploadError,
  } = useApi<ResumeUploadResponse>();
  const {
    execute: executeParse,
    isLoading: isParsing,
    error: parseError,
  } = useApi<ResumeParseResponse>();
  const {
    execute: executeDashboard,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useApi<DashboardUserResponse>();



  const uploadAndParseResume = async (file: File, username: string) => {
    try {
      // 1. Upload Resume
      const uploadResponse = await executeUpload(() =>
        dashboardService.uploadResume(file, username)
      );

      if (!uploadResponse?.data) {
        throw new Error('Upload failed: No data returned');
      }

      const { fileUrl, resumeId } = uploadResponse.data;

      // 2. Parse Resume
      const parseResponse = await executeParse(() =>
        dashboardService.parseResume(fileUrl, resumeId)
      );

      return {
        upload: uploadResponse,
        parse: parseResponse,
      };
    } catch (error) {
      console.error('Upload and parse failed:', error);
      throw error;
    }
  };

  const fetchUserDashboard = useCallback(
    async (userId: string) => {
      try {
        // If dashboard data already cached, return cached value and avoid API call
        const cached = localStorage.getItem('dashboardData');
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            status: 'cached',
            message: 'from cache',
            data: parsed,
          } as DashboardUserResponse;
        }

        const response = await executeDashboard(() =>
          dashboardService.getUserDashboard(userId)
        );
        if (response?.data) {
          // store only the data payload so components can read it directly
          localStorage.setItem('dashboardData', JSON.stringify(response.data));
        }
        return response as DashboardUserResponse;
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        throw error;
      }
    },
    [executeDashboard]
  );

  return {
    uploadAndParseResume,
    fetchUserDashboard,
    // Return parsed dashboard data from localStorage without triggering network calls
    getCachedDashboardData: () => {
      try {
        const cached = localStorage.getItem('dashboardData');
        return cached ? JSON.parse(cached) : null;
      } catch (err) {
        console.error('Failed to read dashboard cache:', err);
        return null;
      }
    },
    // Clear dashboard cache (useful on logout)
    clearDashboardCache: () => {
      try {
        localStorage.removeItem('dashboardData');
      } catch (err) {
        console.error('Failed to clear dashboard cache:', err);
      }
    },
    isUploading,
    isParsing,
    isLoadingDashboard,
    uploadError,
    parseError,
    dashboardError,
  };
}
