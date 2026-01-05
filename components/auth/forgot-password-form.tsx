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
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });

      if (response.data.status === "success") {
        setSubmitted(true);
      } else {
        setError(response.data.message || "Failed to send reset code");
      }
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to send reset code. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden">
        <CardHeader className="pt-8 px-6 text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-800">
            Check your email 
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            We have sent a password reset code to <span className="font-bold text-[var(--primary)]">{email}</span>
          </CardDescription>
          <CardDescription className="text-slate-500 text-sm mt-4">
            Please check your email and enter the 6-digit code on the reset password page.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 border-t border-slate-100 py-6 bg-slate-50 mt-4">
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="font-bold text-[var(--primary)] hover:text-[var(--primary-700)] transition-colors"
          >
            Enter Reset Code
          </Link>
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden">
      <CardHeader className="pt-8 px-6 text-center">
        <CardTitle className="text-3xl font-extrabold text-slate-800">Forgot Password</CardTitle>
        <CardDescription className="text-slate-500 font-medium mt-2">
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-md px-2 font-semibold text-slate-700">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border rounded-sm border-slate-50 pl-11 pr-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 h-12"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white font-bold py-6 rounded-sm transition-all active:scale-95 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Send Reset Code"
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
  );
}
