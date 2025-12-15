"use client";

import { authService, apiClient } from "@/app/api/client";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  name?: string;
  email?: string;
  userType?: "USER" | "ADMIN";
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      apiClient.refreshTokenFromCookies();
      const userData = await authService.getAuthMe();
      setUser(userData);
    } catch (error: unknown) {
      console.error("Failed to fetch user data:", error);
      
      // Handle specific API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number; body?: unknown };
        if (apiError.status === 400) {
          console.warn("Bad request to /me endpoint - user may not be fully authenticated");
        } else if (apiError.status === 401) {
          console.warn("Unauthorized - clearing token and redirecting to login");
          // Clear invalid token
          if (typeof window !== 'undefined') {
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        }
      }
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

