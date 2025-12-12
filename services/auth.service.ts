import axios, { AxiosError } from "axios";
import type { LoginInput, RegisterInput, OTPInput } from "@/lib/validations/auth.schema";

// API Base URL - Update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create axios instance with default config
const apiAdmin = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Add auth token to requests
apiAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      username?: string;
      userType?: string;
    };
    token?: string;
    requiresOTP?: boolean;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      userType: string;
    };
    token: string;
  };
}

// Error handler
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const message = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message;
    throw new Error(message);
  }
  throw error;
};

// Auth Service
export const authService = {
  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        jobTitle: data.jobTitle,
        userType: data.userType,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(data: OTPInput): Promise<OTPResponse> {
    try {
      const response = await apiAdmin.post<OTPResponse>("/auth/verify-otp", data);
      
      // Store token if verification successful
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiAdmin.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.get<AuthResponse>("/auth/me");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/refresh");
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiAdmin.post<AuthResponse>("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default authService;
