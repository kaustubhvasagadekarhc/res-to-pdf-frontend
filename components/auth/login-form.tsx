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
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

      const token = extractTokenFromResponse(response);
      const user = extractUserFromResponse(response);
      const message = extractMessageFromResponse(response) ?? "";

      if (token) {
        tokenService.setToken(token);
        apiClient.refreshTokenFromCookies(); // Refresh API client with new token

        if (user) {
          const userType =
            (user.type as string) || (user.userType as string) || "user";

          if (userType === "admin" || userType === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        } else {
          router.push("/user");
        }
      } else {
        setError(message || "Login failed. No token received.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      let errorMessage = "Login failed";

      // Extract error message from different possible structures
      if (err && typeof err === "object") {
        const error = err as {
          body?: { message?: string; error?: string };
          message?: string;
          status?: number;
        };
        if (error.body?.message) {
          errorMessage = error.body.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.body?.error) {
          errorMessage = error.body.error;
        } else if (error.status === 400) {
          errorMessage = "Invalid email or password";
        } else if (error.status === 401) {
          errorMessage = "Invalid credentials";
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
    >
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-white/50">
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-1.5 w-full" />
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[var(--primary-700)] focus:ring-[var(--primary-700)] rounded-xl transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-semibold"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-700)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[var(--primary-700)] focus:ring-[var(--primary-700)] rounded-xl transition-all duration-200"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-[var(--danger-800)] bg-[var(--danger-100)] p-3 rounded-xl flex items-center gap-2 border border-[#fecaca] font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger-800)] shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[var(--primary-700)] hover:to-[var(--accent-700)] text-[var(--primary-foreground)] font-bold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 mt-2 py-6 bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
            {onRegisterClick ? (
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] hover:underline transition-colors"
              >
                Create Account
              </button>
            ) : (
              <Link
                href="/register"
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] hover:underline transition-colors"
              >
                Create Account
              </Link>
            )}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
