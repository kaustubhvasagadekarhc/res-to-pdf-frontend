"use client";

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
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ResetPasswordFormProps {
  email: string;
}

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(599); // 10 minutes
  const [success, setSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value && e.target.value !== "") return;

    const newOtp = otp.split("");
    while (newOtp.length < 6) newOtp.push("");
    newOtp[index] = value.slice(-1);
    const finalOtp = newOtp.join("").slice(0, 6);
    setOtp(finalOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    setOtp(pastedData);
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setTimer(599);
      setError("");
    } catch (err: unknown) {
      console.error("Resend OTP failed:", err);
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (response.data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden">
        <CardHeader className="pt-8 px-6 text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-800">
            Password Reset Successful
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Your password has been reset successfully. Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center border-t border-slate-100 py-6 bg-slate-50 mt-4">
          <Link
            href="/login"
            className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors"
          >
            Go to Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden">
        <CardHeader className="pt-8 px-6 text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-800">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Enter the code sent to <span className="font-bold text-[var(--primary)]">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label className="text-md px-2 font-semibold text-slate-700">
                Enter 6-Digit Code
              </Label>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-full aspect-square text-center text-xl font-bold border border-slate-200 rounded-md focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-50)] outline-none transition-all bg-slate-50/30 focus:bg-white"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>
                  Code expires in <span className="font-bold text-slate-700">{formatTime(timer)}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={timer > 0 || loading}
                  className={`text-[var(--primary)] hover:underline font-medium ${
                    timer > 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Resend Code
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-md px-2 font-semibold text-slate-700">
                New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
              </div>
            </div>

            {/* Confirm Password */}
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
                  type="password"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white font-bold py-6 rounded-sm transition-all active:scale-95 flex items-center justify-center"
              disabled={loading || otp.length !== 6 || newPassword.length < 6}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 py-6 bg-slate-50">
          <Link
            href="/login"
            className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors"
          >
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}


