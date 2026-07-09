"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { analyticsService, dashboardService, predictionService } from "@/services/api";
import { ShapBarChart, FeatureRadarChart } from "@/components/charts";
import type { PredictionResult } from "@/types";

const TABS = ["Global Feature Importance", "Patient Explanation", "SHAP Waterfall", "Reasoning Cards"];

const REASONING_CARDS = [
  { icon: "🚬", title: "Smoking Status — Primary Driver", category: "Primary Driver", bg: "bg-red-50 border-red-100", titleColor: "text-red-800", text: "Current smoking is the strongest predictor in the model. Active smokers have a substantially higher probability of COPD compared to never-smokers. Pack-year history compounds this effect non-linearly beyond 20 pack-years." },
  { icon: "📅", title: "Age — High Impact", category: "Demographic", bg: "bg-orange-50 border-orange-100", titleColor: "text-orange-800", text: "COPD risk increases significantly after age 40, with steeper increases post-60. The model captures the non-linear age-risk relationship through its scoring function." },
  { icon: "🏭", title: "Occupational Exposure — Moderate Impact", category: "Environmental", bg: "bg-amber-50 border-amber-100", titleColor: "text-amber-800", text: "Workplace dust and chemical exposure is a well-documented contributor to COPD cases. Combined with smoking, the interaction effect can amplify risk further." },
  { icon: "🫁", title: "FEV1% Predicted — Moderate Impact", category: "Pulmonary Function", bg: "bg-blue-50 border-blue-100", titleColor: "text-blue-800", text: "Reduced FEV1 is both a symptom and predictor. Values below 70% predicted indicate early airflow limitation consistent with pre-COPD or early GOLD Stage I–II." },
  { icon: "😮‍💨", title: "Dyspnea Grade — Moderate Impact", category: "Symptom Burden", bg: "bg-green-50 border-green-100", titleColor: "text-green-800", text: "mMRC Grade ≥2 is associated with significantly worse outcomes and higher diagnostic certainty in the model." },
  { icon: "⚖️", title: "BMI — Low–Moderate Impact", category: "Metabolic", bg: "bg-purple-50 border-purple-100", titleColor: "text-purple-800", text: "Both underweight and obesity have distinct effects on risk. Very low BMI in COPD patients correlates with cachexia and poor prognosis." },
];

export default function ExplainabilityPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [featureImportance, setFeatureImportance] = useState<{ feature: string; importance: number; color: string }[]>([]);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fi = await analyticsService.getFeatureImportance();
      if (cancelled) return;
      setFeatureImportance(fi);

      // Surface the most recent prediction available (most recently assessed
      // patient's latest history entry) so the explanation views reflect
      // real backend output rather than placeholder data.
      try {
        const recentPatients = await dashboardService.getRecentPredictions();
        for (const p of recentPatients) {
          const history = await predictionService.getHistory(p.id);
          if (history.length > 0) {
            if (!cancelled) setResult(history[0]);
            break;
          }
        }
      } catch {
        // No predictions yet — explanation tabs that need a specific
        // patient will show an empty state below.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const radarData = featureImportance.slice(0, 6).map((f) => ({ subject: f.feature, value: f.importance }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI Explainability</h1>
        <p className="text-sm text-muted-foreground mt-1">SHAP-based explanations of how the COPD prediction model makes decisions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 gap-1">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === i ? "border-clinical-blue text-clinical-blue" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0: Global Feature Importance */}
      {activeTab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
          <div className="clinical-card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Global Feature Importance</h3>
              <p className="text-xs text-muted-foreground">Mean |SHAP value| across validation cases</p>
            </div>
            <ShapBarChart data={featureImportance} height={300} />
          </div>
          <div className="clinical-card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Feature Weight Radar</h3>
              <p className="text-xs text-muted-foreground">Relative contribution by clinical domain</p>
            </div>
            <FeatureRadarChart data={radarData} height={280} />
          </div>
          <div className="col-span-2 clinical-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Feature Importance Summary</h3>
            <div className="grid grid-cols-5 gap-3">
              {featureImportance.slice(0, 5).map((f, i) => (
                <div key={f.feature} className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{i + 1}</div>
                  <div className="text-xs font-medium text-foreground mt-1">{f.feature}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.importance.toFixed(2)} SHAP</div>
                  <div className="h-1 rounded-full mt-2 w-full" style={{ background: f.color, opacity: 0.6 + i * 0.08 }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 1: Patient Explanation */}
      {activeTab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {isLoading ? (
            <div className="clinical-card p-8 text-center text-sm text-muted-foreground">Loading latest assessment…</div>
          ) : !result ? (
            <div className="clinical-card p-8 text-center text-sm text-muted-foreground">
              No predictions have been generated yet. Run an assessment from the AI Prediction page to see a patient-level explanation here.
            </div>
          ) : (
            <>
              <div className="prediction-gradient rounded-xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                    {result.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{result.patientName} — SHAP Explanation</div>
                    <div className="text-blue-200 text-sm">{result.patientId ?? "Unlinked"} · Risk Score: {result.riskScore}% · {result.riskLevel.toUpperCase()} RISK</div>
                  </div>
                </div>
              </div>
              <div className="clinical-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Individual SHAP Value Breakdown</h3>
                <div className="space-y-1">
                  {result.shapExplanation.features.map((f, i) => (
                    <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground w-36 shrink-0">{f.name}</span>
                      <span className="text-xs text-muted-foreground w-16 shrink-0 text-right font-mono">{String(f.value)}</span>
                      <div className="flex-1 flex items-center justify-center h-5 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                        {f.shapValue >= 0 ? (
                          <div className="absolute left-1/2 top-1 bottom-1 rounded-r"
                            style={{ width: `${Math.abs(f.normalizedImpact) / 2}%`, background: "#E53935" }} />
                        ) : (
                          <div className="absolute right-1/2 top-1 bottom-1 rounded-l"
                            style={{ width: `${Math.abs(f.normalizedImpact) / 2}%`, background: "#16A34A" }} />
                        )}
                      </div>
                      <span className="text-xs font-bold w-14 text-right font-mono" style={{ color: f.shapValue >= 0 ? "#E53935" : "#16A34A" }}>
                        {f.shapValue >= 0 ? "+" : ""}{f.shapValue.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                  <strong>Interpretation:</strong> Bars extending right (red) increase COPD probability. Bars extending left (green) decrease probability. Baseline: {result.baselineProbability}% → Final prediction: {result.riskScore}%.
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Tab 2: SHAP Waterfall */}
      {activeTab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!result ? (
            <div className="clinical-card p-8 text-center text-sm text-muted-foreground">
              No predictions have been generated yet.
            </div>
          ) : (
            <div className="clinical-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">SHAP Waterfall Plot — {result.patientName}</h3>
                <p className="text-xs text-muted-foreground">Cumulative SHAP value contributions from baseline to final prediction</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-2 bg-blue-50 border border-blue-100 rounded-lg px-3">
                  <span className="text-xs font-semibold text-blue-700 w-32">Baseline E[f(x)]</span>
                  <div className="flex-1 h-6 bg-blue-100 rounded relative overflow-hidden">
                    <div className="h-full bg-clinical-blue/30 rounded" style={{ width: `${result.baselineProbability}%` }} />
                  </div>
                  <span className="text-xs font-bold text-blue-700 w-10 text-right">{result.baselineProbability}%</span>
                </div>
                {result.shapExplanation.features.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-3 py-1.5 px-3">
                    <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">{f.name}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-5 bg-muted rounded relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(f.normalizedImpact) * 0.8}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className="absolute top-1 bottom-1 rounded"
                          style={{ left: "50%", background: f.shapValue >= 0 ? "#E53935" : "#16A34A", marginLeft: f.shapValue < 0 ? `-${Math.abs(f.normalizedImpact) * 0.8}%` : "0" }} />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold w-14 text-right" style={{ color: f.shapValue >= 0 ? "#E53935" : "#16A34A" }}>
                      {f.shapValue >= 0 ? "+" : ""}{f.shapValue.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3 py-2 bg-red-50 border border-red-100 rounded-lg px-3">
                  <span className="text-xs font-semibold text-red-700 w-32">Final f(x)</span>
                  <div className="flex-1 h-6 bg-red-100 rounded relative overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${result.riskScore}%`, background: "linear-gradient(90deg,#22C55E,#F59E0B,#E53935)" }} />
                  </div>
                  <span className="text-xs font-bold text-red-700 w-10 text-right">{result.riskScore}%</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Reasoning Cards */}
      {activeTab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
          {REASONING_CARDS.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={cn("rounded-xl border p-4", card.bg)}>
              <div className={cn("text-xs font-bold mb-2 flex items-center gap-2", card.titleColor)}>
                <span className="text-lg">{card.icon}</span>
                <span>{card.title}</span>
              </div>
              <p className={cn("text-xs leading-relaxed", card.titleColor, "opacity-80")}>{card.text}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
