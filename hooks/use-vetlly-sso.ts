"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { MouseEvent } from "react";

interface VettlySSOOptions {
  returnUrl?: string; // Where to redirect after successful SSO
  mode?: "signin" | "signup"; // SSO mode: signin or signup
}

export function useVettlySSO() {
  const router = useRouter();

  // Redirect to SSO route instead of opening popup
  // Accepts either options object or mouse event (for onClick compatibility)
  const openVettlySSO = useCallback((
    optionsOrEvent?: VettlySSOOptions | MouseEvent<HTMLButtonElement>
  ) => {
    let returnUrl = "/user";
    let ssoMode: "signin" | "signup" = "signin"; // Default to signin
    
    // Check if it's an options object (has returnUrl or mode property)
    if (optionsOrEvent && typeof optionsOrEvent === 'object' && 'returnUrl' in optionsOrEvent) {
      const options = optionsOrEvent as VettlySSOOptions;
      returnUrl = options.returnUrl || "/user";
      ssoMode = options.mode || "signin";
    }
    // Otherwise, it's a mouse event or undefined - use defaults
    
    // Redirect to SSO route with return URL and mode
    router.push(`/auth/vetlly?returnUrl=${encodeURIComponent(returnUrl)}&mode=${ssoMode}`);
  }, [router]);

  return {
    openVettlySSO,
    isPopupOpen: false, // No longer using popup
    isProcessing: false, // Processing happens on the SSO route
  };
}

