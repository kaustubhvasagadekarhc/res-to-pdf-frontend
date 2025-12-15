"use client";

import { Button } from "@/components/ui/button";
import { authService as legacyAuthService } from "@/services/auth.services";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export function Header() {
  const router = useRouter();
  const { user: userData } = useUser();

  const handleLogout = () => {
    legacyAuthService.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="font-semibold text-lg text-foreground">Dashboard</div>
      <div className="flex items-center gap-4">
        {userData && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User className="h-4 w-4" />
            <span>{userData.name || userData.email}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
