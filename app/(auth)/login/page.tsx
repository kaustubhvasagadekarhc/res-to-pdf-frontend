import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ResToPDF",
  description: "Sign in to your ResToPDF account to access your resume builder and download professional PDF resumes",
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <LoginForm />
    </div>
  );
}
