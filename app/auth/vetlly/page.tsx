"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function VettlySSOContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get return URL and mode from query params (where to redirect after SSO)
    const returnUrl = searchParams.get("returnUrl") || "/user";
    const mode = searchParams.get("mode") || "signin"; // Default to signin
    
    // Generate state for CSRF protection (browser-compatible)
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store state and return URL in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vetlly_sso_state", state);
      sessionStorage.setItem("vetlly_sso_return_url", returnUrl);
    }

    // Build Vettly SSO URL based on mode (signin or signup)
    const vettlyBaseUrl = process.env.NEXT_PUBLIC_VETLLY_BASE_URL;
    const authPath = mode === "signup" ? "/en/auth/signin/candidate" : "/en/auth/signin/candidate";
    const vettlyAuthUrl = `${vettlyBaseUrl}${authPath}`;
    const redirectUri = `${window.location.origin}/auth/vetlly/callback`;
    
    // Generate SSO user secret (browser-compatible)
    const sso_user_secret = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store sso_user_secret in sessionStorage for callback retrieval
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vetlly_sso_secret", sso_user_secret);
    }
    
    
    // Build SSO URL with parameters
    const params = new URLSearchParams({
      sso_user_secret: sso_user_secret,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: state,
    });
    
    // Add SECRET_KEY to URL if provided
  

    const ssoUrl = `${vettlyAuthUrl}?${params.toString()}`;

    // Redirect to Vettly for authentication
    window.location.href = ssoUrl;
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Redirecting to Vettly for authentication...</p>
      </div>
    </div>
  );
}

export default function VettlySSOPage() {
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
      <VettlySSOContent />
    </Suspense>
  );
}

