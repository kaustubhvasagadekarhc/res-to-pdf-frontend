"use client";

import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true, // ensure cookies (httpOnly or not) are sent for auth
});

// Add Authorization token for protected routes (read same cookie name used by authService)
API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    // Read cookie set by authService.setToken (name: 'auth-token')
    const token = Cookies.get("auth-token") || Cookies.get("access_token");
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

export default API;
 