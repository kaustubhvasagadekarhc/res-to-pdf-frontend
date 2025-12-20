import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ResToPDF",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <LoginForm />
    </div>
  );
}
