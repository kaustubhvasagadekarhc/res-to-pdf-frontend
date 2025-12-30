"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService as tokenService } from "@/services/auth.services";
import { apiClient } from "@/app/api/client";

function VettlyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the authorization code from URL
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      // Redirect to login with error
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      // Exchange code for token via backend
      handleSSOCallback(code, state);
    }
  }, [searchParams, router]);

  const handleSSOCallback = async (code: string, state: string | null) => {
    try {
      // Verify state if stored
      if (typeof window !== "undefined") {
        const storedState = sessionStorage.getItem("vetlly_sso_state");
        if (storedState && state && storedState !== state) {
          throw new Error("Invalid state parameter. Possible CSRF attack.");
        }
        sessionStorage.removeItem("vetlly_sso_state");
      }

      // Call backend to exchange code for token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(
        `${apiUrl}/auth/vetlly/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`,
        {
          method: "GET",
          credentials: "include", // Include cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to exchange code for token" }));
        throw new Error(errorData.message || "Failed to exchange code for token");
      }

      const data = await response.json();

      // Extract token and user from response
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (!token) {
        throw new Error("No token received from SSO callback");
      }

      // Set token in cookie
      tokenService.setToken(token);
      apiClient.refreshTokenFromCookies();

      // Get return URL from sessionStorage or default to /user
      const returnUrl = typeof window !== "undefined" 
        ? sessionStorage.getItem("vetlly_sso_return_url") || "/user"
        : "/user";

      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vetlly_sso_return_url");
      }

      // Redirect based on user type or return URL
      const userType = user?.userType || user?.type || "user";
      if (userType === "admin" || userType === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(returnUrl);
      }
    } catch (error) {
      console.error("SSO callback error:", error);
      
      // Redirect to login with error
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function VettlyCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VettlyCallbackContent />
    </Suspense>
  );
}

