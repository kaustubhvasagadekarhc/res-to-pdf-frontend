import api from "@/lib/api";


export interface LoginDTO {
  email: string;
  password?: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  jobTitle: string;
  userType: 'user' | 'Admin';
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'user' | 'admin';
}

export interface APIResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
    user?: User;
    userId?: string;
    email?: string;
  };
}

export const authService = {
  async login(data: LoginDTO): Promise<APIResponse> {
    const response = await api.post<APIResponse>('/auth/login', data);
    // Token is now stored in httpOnly cookie by the backend
    // Store user data in localStorage for Admin-side access
    if (response.data.data?.user) {
      this.setUser(response.data.data.user);
    }
    return response.data;
  },

  async register(data: RegisterDTO): Promise<APIResponse> {
    const response = await api.post<APIResponse>('/auth/register', data);
    return response.data;
  },

  async verifyOtp(data: VerifyOtpDTO): Promise<APIResponse> {
    const response = await api.post<APIResponse>('/auth/verify-otp', data);
    // Token is now stored in httpOnly cookie by the backend
    // Store user data in localStorage for Admin-side access
    if (response.data.data?.user) {
      this.setUser(response.data.data.user);
    }
    return response.data;
  },

  async resendOtp(email: string): Promise<APIResponse> {
    const response = await api.post<APIResponse>('/auth/resend-otp', { email });
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<APIResponse>('/auth/me');
      if (response.data.data?.user) {
        this.setUser(response.data.data.user);
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all authentication-related data
      this.removeUser();
      sessionStorage.clear();
      try {
        localStorage.removeItem('dashboardData');
      } catch (err) {
        console.error('Failed to clear dashboard cache on logout:', err);
      }
    }
  },

  // User data management (stored in localStorage for Admin-side access)
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  // Legacy methods for backward compatibility
  setToken(token: string) {
    // Deprecated: Tokens are now stored in httpOnly cookies
    console.warn('setToken is deprecated. Tokens are now stored in httpOnly cookies.');
  },

  getToken(): string | null {
    // Deprecated: Tokens are now stored in httpOnly cookies
    // Return null to indicate no token in localStorage
    return null;
  },

  removeToken() {
    // Deprecated: Tokens are now stored in httpOnly cookies
    localStorage.removeItem('token'); // Clean up any old tokens
  },

  setUserId(userId: string) {
    // Deprecated: Use setUser instead
    console.warn('setUserId is deprecated. Use setUser instead.');
  },

  getUserId(): string | null {
    const user = this.getUser();
    return user?.id || null;
  },

  removeUserId() {
    // Deprecated: Use removeUser instead
    localStorage.removeItem('userId'); // Clean up any old user IDs
  },

  isAuthenticated(): boolean {
    // Check if user data exists in localStorage
    // The actual authentication is verified by the backend via httpOnly cookie
    return !!this.getUser();
  },
};
