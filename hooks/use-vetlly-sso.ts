"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService as tokenService } from "@/services/auth.services";
import { apiClient } from "@/app/api/client";

interface VetllySSOConfig {
  vetllyAuthUrl?: string; // Vetlly SSO authorization URL
  redirectUri?: string; // Callback URL after SSO
  clientId?: string; // Vetlly client ID
}

export function useVetllySSO(config?: VetllySSOConfig) {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Default Vetlly SSO configuration
  const vetllyAuthUrl = config?.vetllyAuthUrl || process.env.NEXT_PUBLIC_VETLLY_AUTH_URL || "https://auth.vetlly.com/oauth/authorize";
  const redirectUri = config?.redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/auth/vetlly/callback` : "/auth/vetlly/callback");
  const clientId = config?.clientId || process.env.NEXT_PUBLIC_VETLLY_CLIENT_ID || "";

  // Freeze the main window by adding overlay
  const freezeWindow = useCallback(() => {
    if (typeof window === "undefined") return;

    // Create overlay to freeze the window
    const overlay = document.createElement("div");
    overlay.id = "vetlly-sso-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      cursor: wait;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Add loading spinner
    const spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Add CSS animation if not exists
    if (!document.getElementById("vetlly-spinner-style")) {
      const style = document.createElement("style");
      style.id = "vetlly-spinner-style";
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden"; // Prevent scrolling
    overlayRef.current = overlay;
  }, []);

  // Unfreeze the main window
  const unfreezeWindow = useCallback(() => {
    if (typeof window === "undefined") return;

    const overlay = document.getElementById("vetlly-sso-overlay");
    if (overlay) {
      overlay.remove();
    }
    document.body.style.overflow = ""; // Restore scrolling
    overlayRef.current = null;
  }, []);

  // Handle SSO callback from popup
  const handleSSOCallback = useCallback(
    async (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigins = [
        window.location.origin,
        vetllyAuthUrl.split("/").slice(0, 3).join("/"), // Vetlly domain
      ];

      if (!allowedOrigins.some((origin) => event.origin.startsWith(origin))) {
        console.warn("SSO callback from unauthorized origin:", event.origin);
        return;
      }

      if (event.data.type === "VETLLY_SSO_SUCCESS") {
        setIsProcessing(true);
        try {
          const { token, user } = event.data;

          if (token) {
            // Set token in cookie
            tokenService.setToken(token);
            apiClient.refreshTokenFromCookies();

            // Close popup
            if (popupRef.current) {
              popupRef.current.close();
              popupRef.current = null;
            }

            // Unfreeze window
            unfreezeWindow();
            setIsPopupOpen(false);

            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            // Remove message listener
            window.removeEventListener("message", handleSSOCallback);

            // Redirect based on user type
            const userType = user?.userType || user?.type || "user";
            if (userType === "admin" || userType === "ADMIN") {
              router.replace("/admin");
            } else {
              router.replace("/user");
            }
          }
        } catch (error) {
          console.error("SSO callback error:", error);
          unfreezeWindow();
          setIsPopupOpen(false);
        } finally {
          setIsProcessing(false);
        }
      } else if (event.data.type === "VETLLY_SSO_ERROR") {
        console.error("SSO error:", event.data.error);
        unfreezeWindow();
        setIsPopupOpen(false);
        if (popupRef.current) {
          popupRef.current.close();
          popupRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        window.removeEventListener("message", handleSSOCallback);
      }
    },
    [router, vetllyAuthUrl, unfreezeWindow]
  );

  // Open Vetlly SSO popup
  const openVetllySSO = useCallback(() => {
    if (isPopupOpen || isProcessing) return;

    // Build SSO URL with parameters
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: Math.random().toString(36).substring(7), // Random state for security
    });

    const ssoUrl = `${vetllyAuthUrl}?${params.toString()}`;

    // Freeze the main window
    freezeWindow();

    // Open popup window
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      ssoUrl,
      "Vetlly SSO",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.error("Failed to open popup window. Please allow popups for this site.");
      unfreezeWindow();
      return;
    }

    popupRef.current = popup;
    setIsPopupOpen(true);

    // Listen for messages from popup
    window.addEventListener("message", handleSSOCallback);

    // Check if popup is closed manually
    intervalRef.current = setInterval(() => {
      if (popup.closed) {
        // Popup was closed
        unfreezeWindow();
        setIsPopupOpen(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        window.removeEventListener("message", handleSSOCallback);
        popupRef.current = null;
      }
    }, 500);
  }, [
    isPopupOpen,
    isProcessing,
    clientId,
    redirectUri,
    vetllyAuthUrl,
    freezeWindow,
    unfreezeWindow,
    handleSSOCallback,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("message", handleSSOCallback);
      unfreezeWindow();
    };
  }, [handleSSOCallback, unfreezeWindow]);

  return {
    openVetllySSO,
    isPopupOpen,
    isProcessing,
  };
}

