import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskBadgeClass(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "risk-badge-low",
    moderate: "risk-badge-moderate",
    high: "risk-badge-high",
    critical: "risk-badge-critical",
  };
  return map[level];
}

export function getRiskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
    critical: "Critical Risk",
  };
  return map[level];
}

export function getRiskColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "#16A34A",
    moderate: "#F59E0B",
    high: "#E53935",
    critical: "#7C3AED",
  };
  return map[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "#DCFCE7",
    moderate: "#FEF9C3",
    high: "#FEE2E2",
    critical: "#EDE9FE",
  };
  return map[level];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getSmokingLabel(status: string): string {
  const map: Record<string, string> = {
    never: "Never Smoked",
    former: "Former Smoker",
    current: "Current Smoker",
  };
  return map[status] || status;
}

export function classifyRisk(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "high";
  return "critical";
}

export function getRiskClassificationLabel(score: number): string {
  if (score < 25) return "Low Risk — COPD Unlikely";
  if (score < 50) return "Moderate Risk — Further Assessment Recommended";
  if (score < 75) return "High Risk — COPD Highly Probable";
  return "Critical Risk — Immediate Clinical Attention Required";
}
