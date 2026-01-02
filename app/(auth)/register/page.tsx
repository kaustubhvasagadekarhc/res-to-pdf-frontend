import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register - ResToPDF",
  description: "Create your ResToPDF account to start building professional resumes and convert them to PDF format",
};

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">      
      <Suspense fallback={<div />}>
        <RegisterForm />
      </Suspense>    
    </div>
  );
}
