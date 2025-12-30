"use client";

import { authService, apiClient, dashboardService } from "@/app/api/client";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  name?: string;
  email?: string;
  userType?: "USER" | "ADMIN";
}

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  jobTitle?: string;
  status: "Generated" | "Draft";
  content?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  resumes: Resume[];
  loadingResumes: boolean;
  refreshResumes: (force?: boolean) => Promise<void>;
  removeResume: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const logoutUtil = () => {
  Cookies.remove("auth-token", { path: "/" });
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Resume State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const resumesFetchedRef = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      // Don't check cookie - backend sets httpOnly cookie which JS can't read
      // Just make the API call - if cookie exists, it will be sent automatically
      apiClient.refreshTokenFromCookies();
      console.log("UserContext: Fetching user data...");
      const response = await authService.getAuthMe();
      console.log("UserContext: Response:", response);

      // Check if response has the expected structure { status, data: { user } }
      if (response && typeof response === "object" && "data" in response) {
        const responseData = response as { data?: { user?: User } };
        if (responseData.data?.user) {
          console.log("UserContext: User found in response.data.user");
          setUser(responseData.data.user);
        } else {
          console.warn("UserContext: No user in response.data.user", responseData);
          setUser(null);
          // Don't redirect here - let auth guard handle it
        }
      } else if (
        response &&
        typeof response === "object" &&
        "user" in response
      ) {
        // Fallback for alternative structure { status, user }
        console.log("UserContext: User found in response.user");
        const userData = (response as { user: User }).user;
        setUser(userData);
      } else if (response && typeof response === "object") {
        // If response is already the user object
        console.log("UserContext: Response is user object");
        setUser(response as User);
      } else {
        console.warn("UserContext: Unexpected response structure", response);
        setUser(null);
      }
    } catch (error: unknown) {
      console.error("UserContext: Failed to fetch user data:", error);

      // Handle specific API errors
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; body?: unknown };
        if (apiError.status === 400) {
          console.warn(
            "UserContext: Bad request to /me endpoint - user may not be fully authenticated"
          );
        } else if (apiError.status === 401) {
          console.warn(
            "UserContext: Unauthorized (401) - user not authenticated"
          );
          // Clear invalid token (if it exists as a readable cookie)
          if (typeof window !== "undefined") {
            Cookies.remove("auth-token", { path: "/" });
          }
          // Don't redirect here - let auth guard handle it
        } else {
          console.warn("UserContext: API error:", apiError.status);
        }
      } else {
        console.error("UserContext: Unknown error:", error);
      }

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshResumes = useCallback(async (force = false) => {
    if (!user?.id) return;

    // If already fetched and not forced, skip
    if (resumesFetchedRef.current && !force) return;

    try {
      if (!resumesFetchedRef.current || force) {
        setLoadingResumes(true);
      }

      apiClient.refreshTokenFromCookies();
      const response = await dashboardService.postDashboardResumes({
        requestBody: { userId: user.id },
      });

      if (response && Array.isArray(response.data)) {
        const mappedResumes = response.data.map(
          (item: Record<string, unknown>) => {
            const fileUrl =
              (item.resumeurl as string) || (item.fileUrl as string) || "";
            return {
              id: (item.id as string) || "",
              fileName: item.jobTitle
                ? `${(item.jobTitle as string) || "Resume"}.pdf`
                : "Resume.pdf",
              fileUrl: fileUrl,
              createdAt: (item.createdAt as string) || new Date().toISOString(),
              updatedAt: (item.updatedAt as string) || new Date().toISOString(),
              version: (item.version as number) || 1,
              jobTitle: (item.jobTitle as string) || "",
              content: item.content as string,
              status: fileUrl ? ("Generated" as const) : ("Draft" as const),
            };
          }
        );
        setResumes(mappedResumes);
        resumesFetchedRef.current = true;
      } else {
        setResumes([]);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      // We can choose to not clear resumes on error to show stale data, 
      // but here we might want to keep existing state if it fails?
      // For now, let's just log it.
    } finally {
      setLoadingResumes(false);
    }
  }, [user?.id]);

  const removeResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Optionally trigger resume fetch when user loads, or let pages trigger it.
  // Letting pages trigger it via `refreshResumes()` is safer to avoid fetching if not needed.

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, resumes, loadingResumes, refreshResumes, removeResume }}>
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

