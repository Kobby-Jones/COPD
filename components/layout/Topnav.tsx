"use client";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/predict": { label: "AI Prediction" },
  "/patients": { label: "Patients" },
  "/patients/new": { label: "New Patient", parent: "Patients" },
  "/explainability": { label: "AI Explainability" },
  "/analytics": { label: "Analytics" },
  "/reports": { label: "Reports" },
  "/settings": { label: "Settings" },
};

export function Topnav() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { label: "Page" };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Clinical</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        {page.parent && (
          <>
            <span className="text-muted-foreground">{page.parent}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </>
        )}
        <span className="font-medium text-foreground">{page.label}</span>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI Status */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
        <div>
          <div className="text-xs font-medium text-green-700">AI Model Online</div>
          <div className="text-[10px] text-green-600">v2.4.1 — 97.3% accuracy</div>
        </div>
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>
    </header>
  );
}
