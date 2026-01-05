/**
 * Authentication utility for managing JWT tokens
 * Uses sessionStorage for better security (tokens cleared when tab closes)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const TOKEN_KEY = "auth_token";

/**
 * Get or fetch authentication token
 * Checks sessionStorage first, then fetches from API if not found
 * @returns Promise<string | null> - The token or null if fetch failed
 */
export const getAuthToken = async (): Promise<string | null> => {
  // Check sessionStorage first
  if (typeof window !== "undefined") {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }
  }

  // Fetch new token from API
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token`);
    if (response.ok) {
      const data = await response.json();
      if (data.token && typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.error("Failed to fetch token:", err);
  }
  return null;
};

/**
 * Clear the stored authentication token
 */
export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Check if a token exists in sessionStorage
 * @returns boolean - True if token exists
 */
export const hasAuthToken = (): boolean => {
  if (typeof window !== "undefined") {
    return !!sessionStorage.getItem(TOKEN_KEY);
  }
  return false;
};

/**
 * Get the API base URL
 * @returns string - The API base URL
 */
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

