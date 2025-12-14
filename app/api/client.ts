/**
 * API Client - Custom implementation that wraps generated code
 */

import axiosInstance from "@/lib/axiosInstance";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { AuthService, OpenAPI, PdfService } from "./generated";

// ============================================
// Core API Client
// ============================================

export class ApiClient {
  protected axios: AxiosInstance;                    // FIX: was private
  protected baseURL: string;                         // FIX: was private
  protected defaultHeaders: Record<string, string>;  // FIX: was private

  constructor(
    axios: AxiosInstance,
    baseURL?: string,
    headers?: Record<string, string>
  ) {
    this.axios = axios;
    this.baseURL =
      baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api/v1";

    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
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

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
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
  

  constructor(
    axios: AxiosInstance,
    baseURL?: string,
    headers?: Record<string, string>
  ) {
    super(axios, baseURL, headers);

    // Configure global OpenAPI client using protected property
    OpenAPI.BASE = this.baseURL;
  }
}

// ============================================
// Default Client
// ============================================

export const apiClient = new ApiClientWithServices(axiosInstance);
export const authService = apiClient.auth;
export const pdfService = apiClient.pdf;

// ============================================
// Final usage example
// ============================================

// const res = await authService.postAuthLogin({
//   requestBody: { email, password },
// });
