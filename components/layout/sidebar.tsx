"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <nav
      className={cn(
        "w-64 border-r bg-card h-screen overflow-y-auto",
        className
      )}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">ResToPDF</h2>
      </div>
      <div className="px-4 py-2 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : ""
                )}
              >
                <item.icon className="w-5 h-5 text-muted" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
