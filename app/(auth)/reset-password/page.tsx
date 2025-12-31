"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Loader2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center p-4 bg-slate-50/30">
        <div className="w-full max-w-md mx-auto border border-slate-50 bg-white rounded-sm overflow-hidden p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Email Required</h2>
          <p className="text-slate-500 mb-6">
            Please request a password reset from the forgot password page.
          </p>
          <a
            href="/forgot-password"
            className="text-[var(--primary)] hover:underline font-bold"
          >
            Go to Forgot Password
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-4 bg-slate-50/30">
      <ResetPasswordForm email={email} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}


