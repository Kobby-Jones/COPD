import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accentColor?: "blue" | "red" | "green" | "purple" | "amber";
  className?: string;
}

const ACCENT_STYLES = {
  blue: {
    bar: "from-clinical-blue to-[#0EA5E9]",
    icon: "bg-clinical-blue-light text-clinical-blue",
  },
  red: {
    bar: "from-clinical-red to-orange-400",
    icon: "bg-clinical-red-light text-clinical-red",
  },
  green: {
    bar: "from-clinical-green to-emerald-400",
    icon: "bg-clinical-green-light text-clinical-green",
  },
  purple: {
    bar: "from-clinical-purple to-violet-400",
    icon: "bg-clinical-purple-light text-clinical-purple",
  },
  amber: {
    bar: "from-clinical-amber to-yellow-400",
    icon: "bg-clinical-amber-light text-clinical-amber",
  },
};

export function StatCard({
  label, value, change, changeType = "neutral", icon: Icon, accentColor = "blue", className,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accentColor];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn("stat-card", className)}
    >
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r", styles.bar)} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-3xl font-bold text-foreground leading-none mb-1.5">{value}</p>
          {change && (
            <p className={cn(
              "text-xs flex items-center gap-1 font-medium",
              changeType === "up" && "text-clinical-green",
              changeType === "down" && "text-clinical-red",
              changeType === "neutral" && "text-muted-foreground",
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", styles.icon)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </motion.div>
  );
}
