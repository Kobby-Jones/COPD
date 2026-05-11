"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download, Printer, Eye, FileText, BarChart3, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DonutChart } from "@/components/charts";
import { reportService } from "@/services/api";
import { formatDateTime, cn } from "@/lib/utils";
import type { Report } from "@/types";

const REPORT_ICONS: Record<Report["type"], any> = {
  individual: FileText,
  population: BarChart3,
  followup: Calendar,
  alert: AlertCircle,
};

const REPORT_COLORS: Record<Report["type"], string> = {
  individual: "bg-blue-50 text-clinical-blue",
  population: "bg-purple-50 text-clinical-purple",
  followup: "bg-amber-50 text-clinical-amber",
  alert: "bg-red-50 text-clinical-red",
};

const STATUS_BADGE: Record<Report["status"], string> = {
  ready: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
};

const REPORT_TYPE_DATA = [
  { name: "Individual Assessment", value: 52 },
  { name: "Population Analysis", value: 28 },
  { name: "Follow-up", value: 20 },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportService.getAll().then((r) => {
      setReports(r);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinical Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate, export, and manage patient prediction reports</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-clinical-blue hover:bg-[#1557A0] gap-2"><Plus className="w-4 h-4" /> New Report</Button>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Bulk Export</Button>
          <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Print Preview</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Summary Cards */}
        <div className="clinical-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Report Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Generated Today", value: 48, color: "text-clinical-blue" },
              { label: "Total This Month", value: 312, color: "text-green-600" },
              { label: "Pending Review", value: 24, color: "text-amber-600" },
              { label: "Sent to Specialists", value: 8, color: "text-purple-600" },
            ].map(item => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Types */}
        <div className="clinical-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Report Types</h3>
          <div className="flex items-center gap-5">
            <DonutChart data={REPORT_TYPE_DATA} colors={["#1B6CA8", "#7C3AED", "#0D9488"]} height={150} />
            <div className="space-y-2.5">
              {REPORT_TYPE_DATA.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: ["#1B6CA8", "#7C3AED", "#0D9488"][i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold text-foreground ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="clinical-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Report History</h3>
          <span className="text-xs text-muted-foreground">{reports.length} reports</span>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading reports...</div>
          ) : (
            reports.map((report, i) => {
              const Icon = REPORT_ICONS[report.type];
              const iconClass = REPORT_COLORS[report.type];
              return (
                <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{report.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report · {formatDateTime(report.generatedAt)} · by {report.generatedBy}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {report.riskLevel && <RiskBadge level={report.riskLevel} showIcon={false} />}
                    <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full border capitalize", STATUS_BADGE[report.status])}>
                      {report.status}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Printer className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
