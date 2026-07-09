"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/context/authStore";
import { authService } from "@/services/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topnav } from "@/components/layout/Topnav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      // A persisted `user` plus isAuthenticated only means the last known
      // client state was logged-in — the JWT itself may have expired since.
      // Confirm against /users/me so a stale session doesn't render the
      // dashboard shell only to fail on the first data fetch.
      if (!isAuthenticated || !authService.isAuthenticated()) {
        if (!cancelled) {
          logout();
          router.push("/auth/login");
        }
        return;
      }
      try {
        const freshUser = await authService.me();
        if (!cancelled) setUser(freshUser);
      } catch {
        if (!cancelled) {
          logout();
          router.push("/auth/login");
        }
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isChecking || !isAuthenticated || !user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-[220px]">
        <Topnav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
