/**
 * API Client - Custom implementation that wraps generated code
 */

import axiosInstance from "@/lib/axiosInstance";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { AuthService, OpenAPI, PdfService,ResumeService,DashboardService } from "./generated";

// ============================================
// Core API Client
// ============================================

export class ApiClient {
  protected axios: AxiosInstance; // FIX: was private
  protected baseURL: string; // FIX: was private
  protected defaultHeaders: Record<string, string>; // FIX: was private

  constructor(
    axios: AxiosInstance,
    baseURL?: string,
    headers?: Record<string, string>
  ) {
    this.axios = axios;
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Set token from cookies if available
    const token = Cookies.get("auth-token");
    if (token) {
      this.setAuthToken(token);
    }
  }

  async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    const fullConfig: AxiosRequestConfig = {
      ...config,
      baseURL: this.baseURL,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    };

    const response = await this.axios.request<T>(fullConfig);
    return response.data;
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  setAuthToken(token: string): void {
    this.setHeader("Authorization", `Bearer ${token}`);
    OpenAPI.TOKEN = token; // ensure OpenAPI client also uses it
  }

  clearAuthToken(): void {
    this.removeHeader("Authorization");
    OpenAPI.TOKEN = undefined;
  }

  refreshTokenFromCookies(): void {
    const token = Cookies.get("auth-token");
    if (token) {
      this.setAuthToken(token);
      OpenAPI.TOKEN = token; // Ensure OpenAPI client is updated
    } else {
      this.clearAuthToken();
      OpenAPI.TOKEN = undefined;
    }
  }

  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}

// ============================================
// Extended API Client with Services
// ============================================

export class ApiClientWithServices extends ApiClient {
  public auth = AuthService; // Static service
  public pdf = PdfService;
  public resume = ResumeService;
  public dashboard = DashboardService;

  constructor(
    axios: AxiosInstance,
    baseURL?: string,
    headers?: Record<string, string>
  ) {
    super(axios, baseURL, headers);

    // Configure global OpenAPI client
    OpenAPI.BASE = this.baseURL;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = "include";

    // Set token from cookies for OpenAPI client
    const token = Cookies.get("auth-token");
    if (token) {
      OpenAPI.TOKEN = token;
    }
  }
}

// ============================================
// Default Client
// ============================================

export const apiClient = new ApiClientWithServices(axiosInstance);
export const authService = apiClient.auth;
export const pdfService = apiClient.pdf;
export const resumeService = apiClient.resume;
export const dashboardService = apiClient.dashboard;


// ============================================
// Final usage example
// ============================================

// const res = await authService.postAuthLogin({
//   requestBody: { email, password },
// });
