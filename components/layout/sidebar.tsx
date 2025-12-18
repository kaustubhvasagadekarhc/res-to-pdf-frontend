"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.services";
import { motion } from "framer-motion";
import { LogOut, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
        "w-72 bg-white/90 backdrop-blur-xl border-r border-[var(--border)] h-screen overflow-y-auto flex flex-col transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="p-8 pb-6 flex items-center space-x-3">
        <div className="h-9 w-9 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-[var(--primary-50)]">
          R
        </div>
        <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-900)] to-[var(--accent-700)] tracking-tight">
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
                    className="absolute inset-0 bg-[var(--primary-50)] rounded-xl border border-[var(--border)]"
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
                    "w-full justify-start gap-3.5 relative z-10 h-12 transition-all duration-200 rounded-xl border-[2px] border-[var(--border)] overflow-hidden",
                    isActive
                      ? "text-[var(--accent)] font-semibold hover:bg-transparent"
                      : "text-slate-500 hover:text-[var(--accent)] hover:bg-[var(--accent-50)]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[1.35rem] h-[1.35rem] transition-colors duration-200",
                      isActive
                        ? "text-[var(--primary)]"
                        : "text-[var(--accent)] group-hover:text-[var(--accent)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[15px]  tracking-tight">
                    {item.label}
                  </span>
                  {/* {isActive && (
                    <div className="absolute right-3 w-2 h-2 rounded-full bg-[var(--primary)] shadow-md ring-2 ring-white" />
                  )} */}
                </Button>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3.5 text-slate-500 hover:text-[var(--danger-800)] hover:bg-[var(--danger-100)] h-12 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-[1.35rem] h-[1.35rem] group-hover:scale-110 transition-transform" />
          <span className="text-[15px] font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
