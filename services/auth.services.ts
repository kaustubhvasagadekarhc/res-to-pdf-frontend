import Cookies from "js-cookie";

export const authService = {
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!Cookies.get("auth-token");
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return Cookies.get("auth-token") || null;
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    
    // Check if token already exists in cookie
    const existingToken = Cookies.get("auth-token");
    
    // Only update if token is different or doesn't exist
    if (!existingToken || existingToken !== token) {
      // Set cookie with secure options
      Cookies.set("auth-token", token, { 
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }
  },

  clearToken(): void {
    if (typeof window === "undefined") return;
    Cookies.remove("auth-token", { path: "/" });
  },
};
