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
// import { useState } from "react";
import { UserProvider, useUser } from "@/contexts/UserContext";

// Admin Sidebar Items
const adminItems: SidebarItem[] = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  { label: "Activity Logs", href: "/admin/logs", icon: Activity },
];

// User Sidebar Items
const userItems: SidebarItem[] = [
  { label: "My Resume", href: "/user", icon: FileText },
  { label: "My Resumes", href: "/user/resumes", icon: FileText },
  { label: "Edit Resume", href: "/user/edit", icon: Settings },
  { label: "Results", href: "/user/result", icon: BookDown },
  { label: "Profile", href: "/user/profile", icon: User },
];

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  
  const items = user?.userType === "ADMIN" ? adminItems : userItems;
  

  if (loading) {
    return null; // Or a loading skeleton
  }

  return (
    <DashboardShell>
     {user?.userType === "ADMIN" && <Sidebar items={items} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto   bg-[#ccccff]  ">
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
