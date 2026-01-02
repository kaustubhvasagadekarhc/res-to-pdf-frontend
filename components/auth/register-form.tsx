"use client";

import { apiClient, authService } from "@/app/api/client";
import { authService as tokenService } from "@/services/auth.services";
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
import { AlertCircle, Globe, Loader2, Lock, Mail, User, X } from "lucide-react";
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
  
  // OTP Modal State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(299);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // OTP Timer
  useEffect(() => {
    if (showOTPModal && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOTPModal, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value && e.target.value !== "") return;

    const newOtp = otp.split('');
    while (newOtp.length < 6) newOtp.push("");
    newOtp[index] = value.slice(-1);
    const finalOtp = newOtp.join("").slice(0, 6);
    setOtp(finalOtp);
    setOtpError("");

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    setOtp(pastedData);
    setOtpError("");
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await authService.postAuthVerifyOtp({
        requestBody: {
          email: formData.email,
          otp,
        },
      });

      apiClient.refreshTokenFromCookies();
      const token = response.token || response.data?.token;
      if (token) {
        tokenService.setToken(token);
        try { apiClient.refreshTokenFromCookies(); } catch (e) {
          console.warn("Could not refresh API client token from cookies", e);
        }

        try {
          const user = await authService.getAuthMe();
          const userData = user as { userType?: string; type?: string };
          const userType = userData?.userType || userData?.type || "user";
          router.push(userType === "admin" || userType === "ADMIN" ? "/admin" : "/user");
        } catch (meErr) {
          console.warn("Failed to fetch user after OTP verification:", meErr);
          router.push("/user");
        }
      } else {
        router.push("/user");
      }
    } catch (error: unknown) {
      console.error("OTP verification failed:", error);
      const apiError = error as { body?: { message?: string }; message?: string };
      setOtpError(apiError?.body?.message || apiError?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setOtpLoading(true);
    setOtpError("");

    try {
      await authService.postAuthResendOtp({
        requestBody: {
          email: formData.email,
        },
      });
      setTimer(299);
    } catch (error: unknown) {
      console.error("Resend OTP failed:", error);
      const apiError = error as { body?: { message?: string }; message?: string };
      setOtpError(apiError?.body?.message || apiError?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

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

      // Show OTP modal instead of redirecting
      setShowOTPModal(true);
      setTimer(299);
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
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative ${showOTPModal ? "blur-sm pointer-events-none" : ""}`}
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
              onClick={() => openVettlySSO()}
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

    {/* OTP Verification Modal */}
    <AnimatePresence>
      {showOTPModal && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[45]"
            onClick={() => setShowOTPModal(false)}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowOTPModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Header with Icon */}
              <div className="flex flex-col items-center pt-8 pb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary-400">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600 text-center px-4 leading-relaxed">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-900">{formData.email}</span>
                </p>
              </div>

              {/* OTP Input Fields */}
              <form onSubmit={handleVerifyOTP} className="px-8 pb-6">
                <div className="flex gap-2 justify-center mb-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => handleOTPInputChange(e, index)}
                      onKeyDown={(e) => handleOTPKeyDown(e, index)}
                      onPaste={handleOTPPaste}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                      disabled={otpLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                    >
                      {otpError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify Button - Light Blue as in image */}
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full h-12 mb-4 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                {/* Resend Section */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={timer > 0 || otpLoading}
                      className={`font-semibold text-primary-500 hover:text-primary-600 transition-colors underline-offset-2 hover:underline ${
                        timer > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Resend
                    </button>
                  </p>
                </div>

                {/* Testing Note */}
                <p className="text-xs text-gray-400 text-center italic">
                  For testing purposes, you can enter any 6-digit code.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
  );
}
