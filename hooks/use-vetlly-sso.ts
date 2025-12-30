"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { MouseEvent } from "react";

interface VettlySSOOptions {
  returnUrl?: string; // Where to redirect after successful SSO
}

export function useVettlySSO() {
  const router = useRouter();

  // Redirect to SSO route instead of opening popup
  // Accepts either options object or mouse event (for onClick compatibility)
  const openVettlySSO = useCallback((
    optionsOrEvent?: VettlySSOOptions | MouseEvent<HTMLButtonElement>
  ) => {
    let returnUrl = "/user";
    
    // Check if it's an options object (has returnUrl property)
    if (optionsOrEvent && typeof optionsOrEvent === 'object' && 'returnUrl' in optionsOrEvent) {
      returnUrl = (optionsOrEvent as VettlySSOOptions).returnUrl || "/user";
    }
    // Otherwise, it's a mouse event or undefined - use default returnUrl
    
    // Redirect to SSO route with return URL
    router.push(`/auth/vetlly?returnUrl=${encodeURIComponent(returnUrl)}`);
  }, [router]);

  return {
    openVettlySSO,
    isPopupOpen: false, // No longer using popup
    isProcessing: false, // Processing happens on the SSO route
  };
}

