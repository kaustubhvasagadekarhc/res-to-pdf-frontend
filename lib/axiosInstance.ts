"use client";

import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// Add Authorization token for protected routes
API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("access_token");
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

export default API;
 