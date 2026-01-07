"use client";

import { apiClient, authService } from "@/app/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService as tokenService } from "@/services/auth.services";
import { useVettlySSO } from "@/hooks/use-vetlly-sso";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

/**
 * Props for the LoginForm component.
 * @property {() => void} [onRegisterClick] - Optional callback to handle "Register" link click.
 * If provided, it overrides default routing to enable tab-switching (e.g., in AuthPage).
 * If undefined, renders a standard Next.js Link to '/register'.
 */
interface LoginFormProps {
  onRegisterClick?: () => void;
}

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const router = useRouter();
  const { openVettlySSO, isPopupOpen, isProcessing } = useVettlySSO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  function extractTokenFromResponse(resp: unknown): string | undefined {
    if (!resp || typeof resp !== "object") return undefined;
    const obj = resp as Record<string, unknown>;
    if (typeof obj.token === "string") return obj.token;
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (typeof d.token === "string") return d.token;
      if (d.data && typeof d.data === "object") {
        const dd = d.data as Record<string, unknown>;
        if (typeof dd.token === "string") return dd.token;
      }
    }
    if (obj.body && typeof obj.body === "object") {
      const b = obj.body as Record<string, unknown>;
      if (typeof b.token === "string") return b.token;
    }
    return undefined;
  }

  function extractUserFromResponse(
    resp: unknown
  ): Record<string, unknown> | undefined {
    if (!resp || typeof resp !== "object") return undefined;
    const obj = resp as Record<string, unknown>;
    if (obj.user && typeof obj.user === "object")
      return obj.user as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (d.user && typeof d.user === "object")
        return d.user as Record<string, unknown>;
      if (d.data && typeof d.data === "object") {
        const dd = d.data as Record<string, unknown>;
        if (dd.user && typeof dd.user === "object")
          return dd.user as Record<string, unknown>;
      }
    }
    if (obj.body && typeof obj.body === "object") {
      const b = obj.body as Record<string, unknown>;
      if (b.user && typeof b.user === "object")
        return b.user as Record<string, unknown>;
    }
    return undefined;
  }

  function extractMessageFromResponse(resp: unknown): string | undefined {
    if (!resp || typeof resp !== "object") return undefined;
    const obj = resp as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
    }
    return undefined;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.postAuthLogin({
        requestBody: formData,
      });
      console.log("Login response:", response);

      const token = extractTokenFromResponse(response);
      const user = extractUserFromResponse(response);
      const message = extractMessageFromResponse(response) ?? "";
      console.log("Extracted token:", token ? "Found" : "Not found");
      console.log("Extracted user:", user);

      if (token) {
        // Set token in cookie (backend also sets httpOnly cookie, but we set a readable one too)
        tokenService.setToken(token);
        apiClient.refreshTokenFromCookies(); // Refresh API client with new token

        // Determine redirect path based on user type
        let redirectPath = "/user";
        if (user) {
          const userType =
            (user.type as string) || (user.userType as string) || "user";
          console.log("User type:", userType);
          if (userType === "admin" || userType === "ADMIN") {
            redirectPath = "/admin";
          }
        }
        router.replace(redirectPath);
      } else {
        console.error("No token in response:", response);
        setError(message || "Login failed. No token received.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      let errorMessage = "Login failed";

      // Check for network errors first
      if (err && typeof err === "object") {
        const error = err as {
          body?: { message?: string; error?: string };
          message?: string;
          status?: number;
          code?: string;
          request?: unknown;
        };

        // Network error detection
        if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
          errorMessage = "Cannot connect to server.";
        } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
          errorMessage = "Connection timeout. Please check your internet connection.";
        } else if (error.message?.includes("Network Error") || error.message?.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection";
        } else if (error.status === 404) {
          errorMessage = "Login endpoint not found.";
        } else if (error.status === 0) {
          errorMessage = "Cannot reach server.";
        } else if (error.body?.message) {
          errorMessage = error.body.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.body?.error) {
          errorMessage = error.body.error;
        } else if (error.status === 400) {
          errorMessage = "Invalid email or password";
        } else if (error.status === 401) {
          errorMessage = "Invalid credentials";
        } else if (error.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      // If user doesn't exist, redirect to register
      if (
        errorMessage.includes("User not found") ||
        errorMessage.includes("not exist") ||
        errorMessage.includes("does not exist")
      ) {
        router.push(`/register?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      // If user not verified, show an informative error but do NOT redirect here.
      if (
        errorMessage.includes("not verified") ||
        errorMessage.includes("verify") ||
        errorMessage.includes("verification")
      ) {
        setError(
          "Email not verified. Please check your inbox for the verification email or register again."
        );
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Language Selector */}
      {/* <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <Languages className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">العربية</span>
        </button>
      </div> */}

      {/* Welcome Tag */}
      {/* <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: '#f0f9ff' }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
        <span className="text-sm font-medium" style={{ color: '#0284c7' }}>Welcome Back</span>
      </div>   */}

      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardHeader className="text-left pb-2 pt-0 px-0">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Sign In to Your Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Enter your credentials to access your resume builder and download PDF resumes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#0ea5e9]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-base hover:border-gray-300 transition-all duration-200 focus:outline-none placeholder:text-gray-400 h-14 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold transition-colors"
                  style={{ color: '#0ea5e9' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#0ea5e9]" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl pl-11 pr-14 py-3.5 text-base hover:border-gray-300 transition-all duration-200 focus:outline-none placeholder:text-gray-400 h-14 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-[var(--danger-800)] bg-[var(--danger-100)] p-4 rounded-sm flex items-center gap-2 border border-rose-200 font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow-md h-14 text-base"
              style={{ backgroundColor: loading ? '#9ca3af' : '#38bdf8' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0ea5e9'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#38bdf8'; }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-2 border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md  font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-14 text-base"
              onClick={() => openVettlySSO({ mode: "signin" })}
              disabled={isPopupOpen || isProcessing || loading}
            >
              {isPopupOpen || isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Image
                    src="/favicon.png"
                    alt="Vettly Logo"
                    className="w-5 h-5"
                    width={20}
                    height={20}
                  />
                  Sign in with Vettly
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t-0  px-0">
          <p className="text-sm text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            {onRegisterClick ? (
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-semibold transition-colors"
                style={{ color: '#0ea5e9' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
              >
                Sign up
              </button>
            ) : (
              <Link
                href="/register"
                className="font-semibold transition-colors"
                style={{ color: '#0ea5e9' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
              >
                Sign up
              </Link>
            )}
          </p>
          {/* <p className="text-sm text-gray-600 text-center">
            Are you an employer?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Sign in as employer
            </Link>
          </p> */}
          {/* <p className="text-xs text-gray-400 text-center ">
            © 2026 Vettly. All rights reserved.
          </p> */}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
