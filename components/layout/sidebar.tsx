"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authService } from "@/services/auth.services";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.clearToken();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "w-72 bg-white/90 backdrop-blur-xl border-r border-indigo-50 h-screen overflow-y-auto flex flex-col transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="p-8 pb-6 flex items-center space-x-3">
        <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-[#6600ff] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50">
          R
        </div>
        <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-violet-900 tracking-tight">
          ResToPDF
        </h2>
      </div>

      <div className="px-4 py-6 space-y-2 flex-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50/80 rounded-xl border border-indigo-100/50"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3.5 relative z-10 h-12 transition-all duration-200 rounded-xl border-[2px] border-indigo-300/80 overflow-hidden",
                    isActive
                      ? "text-violet-600 font-semibold hover:bg-transparent"
                      : "text-slate-500 hover:text-violet-600 hover:bg-violet-50/20"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[1.35rem] h-[1.35rem] transition-colors duration-200",
                      isActive ? "text-indigo-600" : "text-violet-600 group-hover:text-violet-600"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[15px]  tracking-tight">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 rounded-full bg-indigo-500 shadow-md ring-2 ring-white" />
                  )}
                </Button>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-indigo-50/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-12 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-[1.35rem] h-[1.35rem] group-hover:scale-110 transition-transform" />
          <span className="text-[15px] font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
