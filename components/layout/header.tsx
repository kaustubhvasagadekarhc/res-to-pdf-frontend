"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { authService as legacyAuthService } from "@/services/auth.services";
import { Bell, FileCheck, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";


export function Header() {
  const router = useRouter();
  const { user } = useUser();

  console.log("Header User:", user?.name);
  const handleLogout = () => {
    legacyAuthService.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-20 flex items-center justify-between px-10 bg-white/70 backdrop-blur-xl sticky top-0 z-20 border-b border-indigo-100/50 transition-all duration-300 shadow-sm">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/user")}
      >
        <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <FileCheck className="h-6 w-6" />
        </div>
       
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-6 w-px bg-indigo-100 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          // onClick={() => router.push("/user/profile")}
          className="text-indigo-900 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl px-3 py-2 font-medium transition-all group gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm">{user?.name || "Profile"}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-3 py-2 font-medium transition-all gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
}
