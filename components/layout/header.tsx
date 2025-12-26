"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { authService as legacyAuthService } from "@/services/auth.services";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header() {
  const router = useRouter();
  const { user } = useUser();

  console.log("Header User:", user?.name);
  const handleLogout = () => {
    legacyAuthService.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-15 flex items-center justify-between px-4 md:px-10 bg-white/70 backdrop-blur-xl sticky top-0 z-20 border-b border-[var(--border)] transition-all duration-300 shadow-sm">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => {
          if (user?.userType === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        }}
      >
        <div className="flex item-start justify-start">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={550}
            height={550}
            className="hidden md:block w-auto h-10"
          />
          <Image
            src="/cloud-logo.jpg"
            alt="Logo"
            width={90}
            height={90}
            className="md:hidden block w-12 h-12 object-contain"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* <Button
          variant="ghost"
          size="icon"
          className="text-[var(--primary)] hover:text-[var(--primary-700)] hover:bg-[var(--primary-50)] rounded-md transition-all"
        >
          <Bell className="h-5 w-5" />
        </Button>
 */}
        <div className="h-6 w-px bg-[var(--border)] mx-2" />

        <div className="h-8 w-8 rounded-md bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
          <User className="h-5 w-5" />
        </div>
        <span className="hidden md:inline-block">{user?.name || "User"}</span>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-500 hover:text-[var(--danger-800)] hover:bg-[var(--danger-100)] rounded-md px-3 py-2 font-medium transition-all gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline-block">Logout</span>
        </Button>
      </div>
    </header>
  );
}
