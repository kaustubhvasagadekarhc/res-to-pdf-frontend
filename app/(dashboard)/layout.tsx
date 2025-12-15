"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  Activity,
  BarChart3,
  BookDown,
  FileText,
  Home,
  Settings,
  User,
  Users,
} from "lucide-react";
// import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Admin Sidebar Items
const adminItems: SidebarItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: Home },
  { label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  {
    label: "System Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
  { label: "Activity Logs", href: "/dashboard/admin/logs", icon: Activity },
];

// User Sidebar Items
const userItems: SidebarItem[] = [
  { label: "My Resume", href: "/dashboard/user", icon: FileText },
  { label: "Edit Resume", href: "/dashboard/user/edit", icon: Settings },
  { label: "Results", href: "/dashboard/user/result", icon: BookDown },
  { label: "Profile", href: "/dashboard/user/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialItems = (() => {
    const dashboardData =
      typeof window !== "undefined"
        ? localStorage.getItem("dashboardData")
        : null;
    let userType = "user";

    if (dashboardData) {
      try {
        const parsed = JSON.parse(dashboardData as string);
        userType = parsed.userType || parsed.user?.userType || "user";
      } catch (e) {
        console.error("Failed to parse dashboard data", e);
      }
    }

    return userType === "admin" ? adminItems : userItems;
  })();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, setItems] = useState<SidebarItem[]>(initialItems);
  const [loading] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();

  if (loading) {
    return null; // Or a loading skeleton
  }

  return (
    <DashboardShell>
      <Sidebar items={items} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6  bg-[#ccccff]  ">
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}
