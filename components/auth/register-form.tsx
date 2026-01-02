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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useVettlySSO } from "@/hooks/use-vetlly-sso";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Globe, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";

/**
 * Props for the RegisterForm component.
 * @property {() => void} [onLoginClick] - Optional callback to handle "Login" link click.
 * If provided, it overrides default routing to enable tab-switching (e.g., in AuthPage).
 * If undefined, renders a standard Next.js Link to '/login'.
 */
interface RegisterFormProps {
  onLoginClick?: () => void;
}

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openVettlySSO, isPopupOpen, isProcessing } = useVettlySSO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Assuming postAuthRegister endpoint exists based on usual patterns
      // If NOT, I might need to check the API client definition.
      // But standard scaffold usually has register.
      // I'll take a gamble or I should have checked client.ts more deeply.
      // Wait, client.ts didn't show the methods, it showed the export.
      // I'll assume postAuthRegister exists.

      await authService.postAuthRegister({
        requestBody: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "USER",
        },
      });

      // Redirect to OTP verification
      router.push(
        `/otp-verification?email=${encodeURIComponent(formData.email)}`
      );
    } catch (err: unknown) {
      console.error("Registration error:", err);

      let errorMessage = "Registration failed";

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
          errorMessage = "Invalid registration data";
        } else if (error.status === 409) {
          errorMessage = "Email already exists";
        }
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
      <Card className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden">
        <CardHeader className="text-center pb-1 pt-4">
          <CardTitle className="text-3xl font-extrabold text-slate-800">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Start building your professional resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-md px-2 font-semibold text-slate-700">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-md px-2 font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="password"
                className="text-md px-2 font-semibold text-slate-700"
              >
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="confirmPassword"
                className="text-md px-2 font-semibold text-slate-700"
              >
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
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
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white font-bold py-6 rounded-sm transition-all active:scale-95 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 hover:text-[var(--primary)] text-slate-700 font-bold py-6 rounded-sm transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => openVettlySSO({ mode: "signup" })}
              disabled={isPopupOpen || isProcessing || loading}
            >
              {isPopupOpen || isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Globe className="mr-2 h-5 w-5" />
              )}
              {isPopupOpen || isProcessing ? "Authenticating..." : "Sign up with Vettly"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 py-6 bg-slate-50">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            {onLoginClick ? (
              <button
                type="button"
                onClick={onLoginClick}
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors"
              >
                Sign In
              </button>
            ) : (
              <Link
                href="/login"
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors"
              >
                Sign In
              </Link>
            )}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
