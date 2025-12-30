"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function VetllyCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the authorization code from URL
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "VETLLY_SSO_ERROR",
            error: error,
          },
          window.location.origin
        );
      }
      window.close();
      return;
    }

    if (code) {
      // Exchange code for token via backend
      handleSSOCallback(code, state);
    }
  }, [searchParams]);

  const handleSSOCallback = async (code: string, state: string | null) => {
    try {
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

      // Send success message to parent window
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "VETLLY_SSO_SUCCESS",
            token: token,
            user: user,
          },
          window.location.origin
        );
      }

      // Small delay before closing to ensure message is sent
      setTimeout(() => {
        window.close();
      }, 100);
    } catch (error) {
      console.error("SSO callback error:", error);
      
      // Send error to parent window
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "VETLLY_SSO_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          window.location.origin
        );
      }
      
      // Close popup after a delay
      setTimeout(() => {
        window.close();
      }, 100);
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

export default function VetllyCallbackPage() {
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
      <VetllyCallbackContent />
    </Suspense>
  );
}

