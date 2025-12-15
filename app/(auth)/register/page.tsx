import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register - ResToPDF",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted mt-2">
          Start building a professional resume in minutes.
        </p>
      </header>

      <Suspense fallback={<div />}>
        <RegisterForm />
      </Suspense>

      {/* <footer className="mt-6 text-center text-sm text-muted">
        Already have an account ?{" "}
        <a href="/login" className="text-primary hover:underline">
          Login here
        </a>
      </footer> */}
    </div>
  );
}
