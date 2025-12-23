"use client";

import { authService, apiClient } from "@/app/api/client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';

interface User {
  id: string;
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
const logoutUtil = () => {
  Cookies.remove("auth_token");
}
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      apiClient.refreshTokenFromCookies();
      const response = await authService.getAuthMe();

      // Check if response has the expected structure { status, data: { user } }
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response as { data?: { user?: User } };
        if (responseData.data?.user) {
          setUser(responseData.data.user);
        } else {
          setUser(null);
          logoutUtil();
          router.push("/login");
        }
      } else if (response && typeof response === 'object' && 'user' in response) {
        // Fallback for alternative structure { status, user }
        const userData = (response as { user: User }).user;
        setUser(userData);
      } else {
        // If response is already the user object
        setUser(response as User);
      }
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

