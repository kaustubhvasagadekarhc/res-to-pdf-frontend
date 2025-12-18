"use client";

import { apiClient, authService } from "@/app/api/client";
import { authService as tokenService } from "@/services/auth.services";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function OTPVerificationContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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

      console.log("OTP verification successful:", response);
      
      apiClient.refreshTokenFromCookies();

      const token = response.token || response.data?.token;
      if (token) {
        tokenService.setToken(token);
        try {
          apiClient.refreshTokenFromCookies();
        } catch (e) {
          console.warn("Could not refresh API client token from cookies", e);
        }

        try {
          const user = await authService.getAuthMe();
          const userData = user as { userType?: string; type?: string };
          const userType = userData?.userType || userData?.type || "user";
          if (userType === "admin" || userType === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        } catch (meErr) {
          console.warn("Failed to fetch user after OTP verification:", meErr);
          router.push("/user");
        }
      } else {
        router.push("/user");
      }
    } catch (error: unknown) {
      console.error("OTP verification failed:", error);
      setError(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = otp.split('');
    // Ensure array is at least 6 long with empty strings if needed
    while (newOtp.length < 6) newOtp.push("");
    
    newOtp[index] = value.slice(-1); // Take last character
    const finalOtp = newOtp.join("").slice(0, 6);
    setOtp(finalOtp);

    // Toggle focus
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    setOtp(pastedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-white/50">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 w-full" />
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-violet-700">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Enter the 6-digit code sent to <span className="font-bold text-indigo-600">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl flex items-center justify-center gap-2 border border-rose-100 font-medium"
                >
                   <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                   {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-center gap-2 sm:gap-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-200 rounded-xl transition-all duration-200 px-0"
                  disabled={loading}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 mt-2 py-6 bg-slate-50/50">
           <Button 
             variant="link" 
             onClick={() => router.push("/login")}
             className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
             type="button"
           >
             ← Back to Login
           </Button>
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
