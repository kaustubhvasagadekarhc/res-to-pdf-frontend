import Cookies from "js-cookie";

export const authService = {
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!(localStorage.getItem("auth_token") || Cookies.get("auth-token"));
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return Cookies.get("auth-token") || localStorage.getItem("auth_token");
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
    // Keep a cookie in sync for API client which reads cookie 'auth-token'
    Cookies.set("auth-token", token, { path: "/" });
  },

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("dashboardData");
    Cookies.remove("auth-token", { path: "/" });
  },
};
