"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function OTPVerificationPage() {
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
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        router.push("/user");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="w-full bg-card rounded-xl shadow-sm border border-color p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verify OTP
          </h1>
          <p className="text-muted">
            Enter the verification code sent to {email}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-color text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-action/40 bg-card text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-action hover:bg-action/90 disabled:bg-slate-400 text-action-foreground font-medium py-3 px-6 rounded-lg transition shadow-sm"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-primary hover:text-primary/90 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
