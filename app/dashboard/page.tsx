"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, Brain, TrendingUp, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { TrendLineChart, RiskPieChart, HBarChart } from "@/components/charts";
import { dashboardService } from "@/services/api";
import { MOCK_PATIENTS, MOCK_TREND_DATA, RISK_FACTOR_PREVALENCE } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const RISK_PIE_DATA = [
  { name: "Low", value: 45 },
  { name: "Moderate", value: 28 },
  { name: "High", value: 18 },
  { name: "Critical", value: 9 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then((s) => {
      setStats(s);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clinical Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of COPD risk prediction activity — Today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={item}>
              <StatCard label="Total Patients" value={stats!.totalPatients.toLocaleString()} change={`↑ +${stats!.patientsThisWeek} this week`} changeType="up" icon={Users} accentColor="blue" />
            </motion.div>
            <motion.div variants={item}>
              <StatCard label="High-Risk Patients" value={stats!.highRiskPatients} change={`⚠ ${((stats!.highRiskPatients / stats!.totalPatients) * 100).toFixed(1)}% of total`} changeType="down" icon={AlertTriangle} accentColor="red" />
            </motion.div>
            <motion.div variants={item}>
              <StatCard label="Predictions Today" value={stats!.predictionsToday} change={`↑ +${stats!.predictionsToday - stats!.predictionsYesterday} vs yesterday`} changeType="up" icon={Brain} accentColor="green" />
            </motion.div>
            <motion.div variants={item}>
              <StatCard label="Avg Risk Score" value={`${stats!.avgRiskScore}%`} change="↓ -2.1% this month" changeType="up" icon={TrendingUp} accentColor="purple" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-2 clinical-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Prediction Trend</h3>
              <p className="text-xs text-muted-foreground">Daily predictions — last 30 days</p>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Download className="w-3 h-3" /> Export
            </Button>
          </div>
          <TrendLineChart data={MOCK_TREND_DATA} height={230} />
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-0.5 bg-clinical-blue rounded" />Predictions
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-0.5 bg-clinical-red rounded" />High Risk
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Risk Distribution</h3>
            <p className="text-xs text-muted-foreground">Current patient cohort</p>
          </div>
          <RiskPieChart data={RISK_PIE_DATA} height={170} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: "Low", pct: 45, color: "#22C55E" },
              { label: "Moderate", pct: 28, color: "#F59E0B" },
              { label: "High", pct: 18, color: "#E53935" },
              { label: "Critical", pct: 9, color: "#7C3AED" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium ml-auto">{r.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Risk Factors</h3>
            <p className="text-xs text-muted-foreground">Prevalence in high-risk cohort</p>
          </div>
          <HBarChart data={RISK_FACTOR_PREVALENCE} height={190} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="clinical-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Predictions</h3>
              <p className="text-xs text-muted-foreground">Last 5 clinical assessments</p>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {["Patient", "Risk", "Score", "Time"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 px-1">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PATIENTS.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-2.5 px-1">
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </td>
                  <td className="py-2.5 px-1">
                    <RiskBadge level={p.latestRiskLevel} showIcon={false} />
                  </td>
                  <td className="py-2.5 px-1">
                    <span className="text-sm font-semibold text-foreground">{p.latestRiskScore}%</span>
                  </td>
                  <td className="py-2.5 px-1">
                    <span className="text-xs text-muted-foreground">{formatDate(p.lastAssessment)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
