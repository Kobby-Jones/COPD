"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { patientService } from "@/services/api";
import { formatDate, getSmokingLabel, cn } from "@/lib/utils";
import type { Patient } from "@/types";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const router = useRouter();

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await patientService.getAll({ search, riskLevel: riskFilter, page, pageSize: PAGE_SIZE });
    setPatients(result.patients);
    setTotal(result.total);
    setIsLoading(false);
  }, [search, riskFilter, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor all patient records and COPD risk assessments</p>
        </div>
        <Button onClick={() => router.push("/predict")} className="bg-clinical-blue hover:bg-[#1557A0] gap-2">
          <Plus className="w-4 h-4" /> New Assessment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search patients by name or ID..." className="pl-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-clinical-blue"
          value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}>
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="moderate">Moderate Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical</option>
        </select>
        <div className="ml-auto text-xs text-muted-foreground">
          {total} patient{total !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Table */}
      <div className="clinical-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              {["Patient", "Age / Sex", "Smoking Status", "Risk Level", "Score", "Last Assessment", "Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
            ) : patients.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="No patients found" description="Try adjusting your search or filters." /></td></tr>
            ) : (
              patients.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.age}y / {p.sex === "male" ? "M" : "F"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      p.smokingStatus === "never" ? "bg-green-50 text-green-700" :
                      p.smokingStatus === "current" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {getSmokingLabel(p.smokingStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><RiskBadge level={p.latestRiskLevel} /></td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-foreground">{p.latestRiskScore}%</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.lastAssessment)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => router.push(`/patients/${p.id}`)}>
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <FileText className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={page === p ? "default" : "outline"} size="sm"
                  className={cn("h-7 w-7 p-0 text-xs", page === p && "bg-clinical-blue")}
                  onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
