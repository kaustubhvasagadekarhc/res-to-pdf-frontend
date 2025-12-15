"use client";

import { Button } from "@/components/ui/button";
import { authService as legacyAuthService } from "@/services/auth.services";
import { User, Bell } from "lucide-react";

import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();


  const handleLogout = () => {
    legacyAuthService.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-20 flex items-center justify-between px-10 bg-white/60 backdrop-blur-md sticky top-0 z-20 border-b border-indigo-50/50 transition-all duration-300">
      <div className="flex flex-col space-y-0.5">
        <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-xs font-medium text-slate-400">Welcome back, let&apos;s get to work.</p>
      </div>

      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
        </Button>
        {/* <div className="h-8 w-px bg-indigo-100/50 mx-1" /> */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/user/profile")}
          className="text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl px-2 py-2 font-medium transition-all group"
        >
          <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm">Profile</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-1 transition-all"
        ></Button>
      </div>
    </header>
  );
}
