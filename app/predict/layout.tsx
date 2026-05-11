"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/context/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topnav } from "@/components/layout/Topnav";

function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
