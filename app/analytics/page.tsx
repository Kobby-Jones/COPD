"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Calculator, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { VBarChart, DonutChart, MetricBar, CHART_COLORS } from "@/components/charts";
import { analyticsService } from "@/services/api";
import type { ModelMetrics } from "@/types";
import { MOCK_MODEL_METRICS } from "@/data/mockData";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ModelMetrics>(MOCK_MODEL_METRICS);
  const [ageData, setAgeData] = useState<{ label: string; value: number }[]>([]);
  const [smokingData, setSmokingData] = useState<{ label: string; value: number }[]>([]);
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    Promise.all([
      analyticsService.getAgeDistribution(),
      analyticsService.getSmokingImpact(),
      analyticsService.getGenderDistribution(),
      analyticsService.getModelMetrics(),
    ]).then(([age, smoke, gender, m]) => {
      setAgeData(age.map(a => ({ label: a.ageGroup, value: a.percentage })));
      setSmokingData(smoke.map(s => ({ label: s.status, value: s.copdPrevalence })));
      setGenderData(gender.map(g => ({ name: g.gender, value: g.percentage })));
      setMetrics(m);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Population-level COPD prevalence analysis and model performance metrics</p>
      </div>

      {/* Model Metric Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard label="Model Accuracy" value={`${metrics.accuracy}%`} change={`✓ Validated on ${metrics.validationCases.toLocaleString()} cases`} changeType="up" icon={Target} accentColor="blue" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard label="AUC-ROC Score" value={metrics.aucRoc.toFixed(3)} change="↑ Class-leading performance" changeType="up" icon={TrendingUp} accentColor="green" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard label="F1-Score" value={metrics.f1Score / 100} change="↑ Balanced precision/recall" changeType="up" icon={Calculator} accentColor="purple" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard label="False Negative Rate" value={`${metrics.falseNegativeRate}%`} change="Minimized for safety" changeType="neutral" icon={AlertCircle} accentColor="red" />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Age Distribution */}
        <div className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Age Distribution of COPD Patients</h3>
            <p className="text-xs text-muted-foreground">Proportion by age decade — current patient cohort</p>
          </div>
          <VBarChart data={ageData} height={210} unit="%" />
        </div>

        {/* Smoking Impact */}
        <div className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Smoking Impact on COPD Prevalence</h3>
            <p className="text-xs text-muted-foreground">COPD prevalence (%) by smoking history</p>
          </div>
          <VBarChart data={smokingData} height={210} unit="%" color={CHART_COLORS.red} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Gender Distribution */}
        <div className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Gender Distribution</h3>
            <p className="text-xs text-muted-foreground">COPD prevalence by biological sex</p>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart data={genderData} colors={[CHART_COLORS.blue, "#EC4899"]} height={160} />
            <div className="space-y-3">
              {genderData.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: i === 0 ? CHART_COLORS.blue : "#EC4899" }} />
                  <span className="text-sm font-medium text-foreground">{g.name}</span>
                  <span className="text-sm font-bold text-foreground ml-auto">{g.value}%</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                Historically male-predominant; closing rapidly in recent cohorts
              </div>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="clinical-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Detailed Model Performance</h3>
            <p className="text-xs text-muted-foreground">{metrics.modelVersion} · Trained {metrics.lastUpdated}</p>
          </div>
          <MetricBar label="Accuracy" value={metrics.accuracy} color={CHART_COLORS.blue} />
          <MetricBar label="Precision" value={metrics.precision} color={CHART_COLORS.purple} />
          <MetricBar label="Recall (Sensitivity)" value={metrics.recall} color={CHART_COLORS.teal} />
          <MetricBar label="Specificity" value={metrics.specificity} color={CHART_COLORS.green} />
          <MetricBar label="F1-Score" value={metrics.f1Score} color={CHART_COLORS.amber} />
          <MetricBar label="AUC-ROC" value={metrics.aucRoc * 100} color={CHART_COLORS.red} />
        </div>
      </div>
    </div>
  );
}
