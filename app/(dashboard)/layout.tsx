"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import { Activity, Home, Settings, Users } from "lucide-react";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Admin Sidebar Items
const adminItems: SidebarItem[] = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Activity Logs", href: "/admin/activities", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user?.userType === "ADMIN") {
      if (pathname === "/user") {
        router.push("/admin");
      }
    } else if (user?.userType === "USER") {
      if (pathname === "/admin") {
        router.push("/user");
      }
    }
  }, [user?.userType, pathname, router]);

  if (loading) {
    return null; // Or a loading skeleton
  }

  return (
    <DashboardShell className="flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative">
        {user?.userType === "ADMIN" && (
          <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <Sidebar
              items={adminItems}
              className={cn(
                "fixed inset-y-0 left-0 z-40 lg:static lg:block transition-transform duration-300 ease-in-out",
                isSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              )}
            />
          </>
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>
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
