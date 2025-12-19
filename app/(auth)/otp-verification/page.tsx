"use client";

import { apiClient, authService } from "@/app/api/client";
import { authService as tokenService } from "@/services/auth.services";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function OTPVerificationContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(599);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // Simple countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.postAuthVerifyOtp({
        requestBody: {
          email: email!,
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
      setError(apiError?.body?.message || apiError?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value && e.target.value !== "") return;

    const newOtp = otp.split('');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full items-center justify-center p-4 bg-slate-50/30"
    >
      <Card className="w-full max-w-md border border-slate-100 bg-white rounded-xl overflow-hidden text-center p-2 pb-6">
        <CardHeader className="flex flex-col items-center pt-8 pb-4">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 relative z-10">
              <Mail className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <div className="absolute top-1 right-1 bg-emerald-400 rounded-full p-1 border-4 border-white z-20">
              <Check className="w-3 h-3 text-white stroke-[4px]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-3 leading-relaxed px-4">
            An 6-digit code has been sent to <br />
            <span className="font-bold text-slate-700">{email}</span>
            <button onClick={() => router.push('/register')} className="ml-2 text-[var(--primary)] hover:underline font-medium">Change</button>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-8">
          <form onSubmit={handleVerifyOTP} className="space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-rose-500 font-medium bg-rose-50/50 p-3 rounded-lg border border-rose-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between gap-2 sm:gap-3">
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
                  className="w-full aspect-square text-center text-xl font-bold border border-slate-200 rounded-lg focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-50)] outline-none transition-all duration-200 bg-slate-50/30 focus:bg-white"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="space-y-2 text-left text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>The OTP will be expired in <span className="text-slate-800 font-bold">{formatTime(timer)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Didn&apos;t receive the code? <button type="button" className="text-[var(--primary)] hover:underline">Resend</button> or <button type="button" className="text-[var(--primary)] hover:underline">Send to Mobile</button></span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white font-bold py-7 rounded-lg transition-all active:scale-95 text-lg"
              disabled={loading || otp.length !== 6}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center px-8 pb-4">
          <div className="flex items-center gap-3 w-full justify-start text-sm text-slate-500 font-medium mt-4">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
            <span>Remember this device. <button className="text-[var(--primary)] hover:underline font-bold">Learn More</button></span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OTPVerificationContent />
    </Suspense>
  );
}
