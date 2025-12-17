"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[var(--primary)] animate-spin" />
        <div className="text-[var(--primary)] font-medium animate-pulse">
          Redirecting to login...
        </div>
      </div>
    </div>
  );
}
