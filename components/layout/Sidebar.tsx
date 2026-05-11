"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Brain, Users, FlaskConical, BarChart3,
  FileText, Settings, Wind, LogOut, ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/context/authStore";
import { authService } from "@/services/api";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/predict", label: "AI Prediction", icon: Brain, badge: "AI" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/patients", label: "Patients", icon: Users },
      { href: "/explainability", label: "Explainability", icon: FlaskConical },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/reports", label: "Reports", icon: FileText, badge: "3" },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await authService.logout();
    logout();
    router.push("/auth/login");
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-clinical-blue to-[#0EA5E9] flex items-center justify-center shrink-0">
          <Wind className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-foreground leading-tight">PneumaAI</div>
          <div className="text-[10px] text-muted-foreground">COPD Prediction</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "nav-item",
                      isActive && "nav-item-active"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-clinical-blue rounded-r"
                      />
                    )}
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        item.badge === "3"
                          ? "bg-red-100 text-red-700"
                          : "bg-clinical-blue-light text-clinical-blue"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-clinical-blue to-[#0EA5E9] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user ? getInitials(user.name) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{user?.name ?? "User"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LogOut className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
    </aside>
  );
}
