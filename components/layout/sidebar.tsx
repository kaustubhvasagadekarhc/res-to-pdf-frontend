"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { authService } from "@/services/auth.services";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside
      className={cn(
        "w-60 bg-white/90 backdrop-blur-xl border-r border-[var(--border)] h-full overflow-y-auto flex  flex-col transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      {/* <div className="p-2  flex items-center space-x-3">
       
      </div> */}

      <div className="px-4 py-10 space-y-2 flex-1 pt-20">
        {items.map((item) => {
          // Exact match for root paths (/admin, /user) to prevent them from staying active on sub-routes
          const isRootPath = item.href === "/admin" || item.href === "/user";
          const isActive = isRootPath
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="block group ">
              <div className="relative ">
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-50 rounded-md"
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
                    "w-full justify-start  gap-3 relative z-10 h-11 transition-all duration-200 rounded-md overflow-hidden",
                    isActive
                      ? "text-blue-600 font-semibold hover:bg-transparent"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      isActive
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-700"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[15px] tracking-tight">
                    {item.label}
                  </span>
                </Button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* <div className="p-4 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3.5 text-slate-500 hover:text-[var(--danger-800)] hover:bg-[var(--danger-100)] h-12 rounded-md transition-all duration-200 group"
        >
          <LogOut className="w-[1.35rem] h-[1.35rem] group-hover:scale-110 transition-transform" />
          <span className="text-[15px] font-medium">Logout</span>
        </Button>
      </div> */}
    </aside>
  );
}
