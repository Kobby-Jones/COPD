"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download, Printer, Eye, FileText, BarChart3, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DonutChart } from "@/components/charts";
import { reportService, patientService } from "@/services/api";
import { formatDateTime, cn } from "@/lib/utils";
import type { Report, Patient } from "@/types";

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
  const [showGenerate, setShowGenerate] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedType, setSelectedType] = useState<Report["type"]>("individual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  function loadReports() {
    setIsLoading(true);
    reportService.getAll().then((r) => {
      setReports(r);
      setIsLoading(false);
    });
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function openGeneratePanel() {
    setGenerateError(null);
    setShowGenerate(true);
    if (patients.length === 0) {
      const { patients: p } = await patientService.getAll({ pageSize: 100 });
      setPatients(p);
      if (p[0]) setSelectedPatientId(p[0].id);
    }
  }

  async function handleGenerate() {
    if (!selectedPatientId) {
      setGenerateError("Select a patient first.");
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await reportService.generate(selectedPatientId, selectedType);
      setShowGenerate(false);
      loadReports();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      await reportService.download(id);
    } catch {
      // Silently ignored — the PDF may not have finished generating yet.
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinical Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate, export, and manage patient prediction reports</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-clinical-blue hover:bg-[#1557A0] gap-2" onClick={openGeneratePanel}><Plus className="w-4 h-4" /> New Report</Button>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Bulk Export</Button>
          <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Print Preview</Button>
        </div>
      </div>

      {showGenerate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="clinical-card p-5 mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Generate New Report</h3>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Patient</label>
              <select
                className="h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-clinical-blue min-w-[220px]"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">Select a patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} · {p.id}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Report Type</label>
              <select
                className="h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as Report["type"])}
              >
                <option value="individual">Individual Assessment</option>
                <option value="followup">Follow-up</option>
                <option value="alert">Alert</option>
                <option value="population">Population Summary</option>
              </select>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-clinical-blue hover:bg-[#1557A0] gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate
            </Button>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
          </div>
          {generateError && <p className="text-xs text-red-500 mt-2">{generateError}</p>}
        </motion.div>
      )}

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
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={downloadingId === report.id} onClick={() => handleDownload(report.id)}>
                        {downloadingId === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      </Button>
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
