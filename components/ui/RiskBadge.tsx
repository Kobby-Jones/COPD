import { cn, getRiskBadgeClass, getRiskLabel } from "@/lib/utils";
import type { RiskLevel } from "@/types";
import { AlertTriangle, CheckCircle, AlertOctagon, ShieldAlert } from "lucide-react";

const RISK_ICONS: Record<RiskLevel, React.ReactNode> = {
  low: <CheckCircle className="w-3 h-3" />,
  moderate: <AlertTriangle className="w-3 h-3" />,
  high: <AlertOctagon className="w-3 h-3" />,
  critical: <ShieldAlert className="w-3 h-3" />,
};

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RiskBadge({ level, showIcon = true, size = "md", className }: RiskBadgeProps) {
  return (
    <span className={cn(getRiskBadgeClass(level), className, size === "lg" && "px-3 py-1 text-sm")}>
      {showIcon && RISK_ICONS[level]}
      {getRiskLabel(level)}
    </span>
  );
}
