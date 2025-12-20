"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  Activity,
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
  { label: "Activity Logs", href: "/admin/activities", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// User Sidebar Items


function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();



  if (loading) {
    return null; // Or a loading skeleton
  }

  return (
    <DashboardShell className="flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {user?.userType === "ADMIN" && <Sidebar items={adminItems} />}
        <main className="flex-1 overflow-y-auto">
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
