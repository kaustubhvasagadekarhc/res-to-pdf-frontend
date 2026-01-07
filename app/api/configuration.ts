/**
 * API Configuration - Custom configuration for service-based API clients
 *
 * This file provides a centralized configuration object for API clients
 * that use service-based (functional) APIs instead of class-based ones.
 */

import type { AxiosInstance } from "axios";
import axiosInstance from "@/lib/axiosInstance";

export interface ApiConfiguration {
  baseURL: string;
  axios: AxiosInstance;
  timeout?: number;
  headers?: Record<string, string>;
}

// Get base URL from environment
const getBaseURL = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

// Create default configuration
export const createApiConfiguration = (
  overrides?: Partial<ApiConfiguration>
): ApiConfiguration => {
  return {
    baseURL: getBaseURL(),
    axios: axiosInstance,
    timeout: 30000, // 30 seconds default
    headers: {
      "Content-Type": "application/json",
    },
    ...overrides,
  };
};

// Default configuration instance
export const defaultApiConfiguration = createApiConfiguration();

// Export configuration for direct use
export const apiConfig: ApiConfiguration = defaultApiConfiguration;
 