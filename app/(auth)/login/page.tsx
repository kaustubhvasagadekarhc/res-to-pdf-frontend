import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ResToPDF",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome back !
        </h1>
        <p className="text-sm text-muted mt-2">
          Enter to get unlimited access to data &amp; information.
        </p>
      </header>

      <LoginForm />

      {/* <footer className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account ?{" "}
        <a href="/register" className="text-primary hover:underline">
          Register here
        </a>
      </footer> */}
    </div>
  );
}
