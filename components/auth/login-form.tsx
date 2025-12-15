"use client";

import { authService } from "@/app/api/client";
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
import { Loader2 } from "lucide-react";
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

        if (user) {
          const userType =
            (user.type as string) || (user.userType as string) || "user";
          localStorage.setItem(
            "dashboardData",
            JSON.stringify({ user, userType })
          );

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

      // If user not verified, redirect to OTP verification
      if (
        errorMessage.includes("not verified") ||
        errorMessage.includes("verify") ||
        errorMessage.includes("verification")
      ) {
        router.push(
          `/otp-verification?email=${encodeURIComponent(formData.email)}`
        );
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your email to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
              />
              <span className="text-sm text-muted">Remember me</span>
            </label>
            <div />
          </div> */}

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          {onRegisterClick ? (
            <button
              type="button"
              onClick={onRegisterClick}
              className="font-medium text-action hover:underline"
            >
              Register
            </button>
          ) : (
            <Link
              href="/register"
              className="font-medium text-action hover:underline"
            >
              Register
            </Link>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
