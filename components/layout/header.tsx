"use client";

import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.services";
import { LogOut, User } from "lucide-react"; // simple icons
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    authService.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="font-semibold text-lg text-foreground">Dashboard</div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/user/profile")}
        >
          <User className="h-5 w-5 text-foreground" />
        </Button>
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
