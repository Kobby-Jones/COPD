"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Wind, Activity, Heart, Brain, CheckCircle,
  AlertTriangle, AlertOctagon, ShieldAlert, RefreshCw,
  Stethoscope, Ban, Calendar, BarChart2, Printer, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getRiskColor, getRiskClassificationLabel, classifyRisk } from "@/lib/utils";
import { predictionService } from "@/services/api";
import type { PredictionResult, Sex, DyspnoeaGrade, SmokingStatus } from "@/types";

// ─── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Name required"),
  age: z.coerce.number().min(18).max(110),
  sex: z.enum(["male", "female", "other"] as const),
  bmi: z.coerce.number().min(10).max(80),
  smokingStatus: z.enum(["never", "former", "current"] as const),
  packYears: z.coerce.number().min(0).max(200),
  biomassExposure: z.boolean(),
  occupationalDust: z.boolean(),
  dyspnoeaGrade: z.coerce.number().min(0).max(4) as z.ZodType<DyspnoeaGrade>,
  chronicCough: z.boolean(),
  sputumProduction: z.boolean(),
  wheezingHistory: z.boolean(),
  cardiovascularDisease: z.boolean(),
  diabetesMellitus: z.boolean(),
  priorRespiratoryInfection: z.boolean(),
  fev1Predicted: z.coerce.number().min(0).max(200).optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Toggle Button ─────────────────────────────────────────────────────────
function ToggleBtn({ value, selected, onClick, children }: { value: string; selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("px-3.5 py-2 border rounded-lg text-xs font-medium transition-all",
        selected ? "bg-clinical-blue-light border-blue-300 text-clinical-blue" : "bg-white border-border text-muted-foreground hover:bg-secondary")}>
      {children}
    </button>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
      <div className="w-7 h-7 rounded-lg bg-clinical-blue-light flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-clinical-blue" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  { text: "Analyzing clinical data...", sub: "Processing patient parameters" },
  { text: "Running ensemble model...", sub: "GradientBoost v2.4.1 inference" },
  { text: "Computing SHAP values...", sub: "Calculating feature contributions" },
  { text: "Generating recommendations...", sub: "Applying clinical decision rules" },
];

export default function PredictPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Robert Chen", age: 62, sex: "male", bmi: 27.4,
      smokingStatus: "current", packYears: 35,
      biomassExposure: true, occupationalDust: true,
      dyspnoeaGrade: 2, chronicCough: true, sputumProduction: false, wheezingHistory: true,
      cardiovascularDisease: true, diabetesMellitus: false, priorRespiratoryInfection: true,
      fev1Predicted: 68,
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((s) => {
        if (s >= LOADING_STEPS.length - 1) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 700);

    try {
      const res = await predictionService.predict(data);
      setResult(res);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  }

  const riskColor = result ? getRiskColor(result.riskLevel) : "#1B6CA8";
  const RiskIcon = result ? { low: CheckCircle, moderate: AlertTriangle, high: AlertOctagon, critical: ShieldAlert }[result.riskLevel] : Brain;

  const RECO_ICONS: Record<string, any> = {
    Stethoscope, Ban, Calendar, Activity,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-20 h-20">
          <div className="w-20 h-20 rounded-full border-4 border-clinical-blue-light border-t-clinical-blue animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-7 h-7 text-clinical-blue" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={loadingStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center">
            <p className="text-base font-semibold text-foreground">{LOADING_STEPS[loadingStep]?.text}</p>
            <p className="text-sm text-muted-foreground mt-1">{LOADING_STEPS[loadingStep]?.sub}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          {LOADING_STEPS.map((_, i) => (
            <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i <= loadingStep ? "bg-clinical-blue" : "bg-muted")} />
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">COPD Risk Assessment</h1>
            <p className="text-sm text-muted-foreground mt-1">{result.patientName} · Generated {new Date(result.generatedAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setResult(null)}><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Assessment</Button>
            <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF</Button>
            <Button variant="outline" size="sm"><Printer className="w-3.5 h-3.5 mr-1.5" /> Print</Button>
          </div>
        </div>

        {/* Result Hero */}
        <div className="rounded-xl overflow-hidden prediction-gradient text-white mb-5">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-200 font-semibold uppercase tracking-widest mb-3">COPD RISK ASSESSMENT RESULT</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold">{result.riskScore}%</span>
                  <span className="text-blue-200 text-lg font-medium">Risk Score</span>
                </div>
                <p className="text-blue-100 mt-2 font-medium">{getRiskClassificationLabel(result.riskScore)}</p>
                <div className="flex gap-4 mt-3 text-xs text-blue-200">
                  <span>Confidence: <strong className="text-white">{result.confidence.toFixed(1)}%</strong></span>
                  <span>Model: <strong className="text-white">{result.modelVersion}</strong></span>
                  <span>Baseline: <strong className="text-white">{result.baselineProbability}%</strong></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}>
                  <RiskIcon className="w-4 h-4" />
                  {result.riskLevel.toUpperCase()} RISK
                </div>
              </div>
            </div>
            {/* Risk meter */}
            <div className="mt-5">
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.riskScore}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#22C55E,#F59E0B,#E53935)" }} />
              </div>
              <div className="flex justify-between text-[10px] text-blue-200 mt-1">
                <span>Low</span><span>Moderate</span><span>High</span><span>Critical</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Key Factors */}
          <div className="clinical-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-clinical-blue" /> Key Contributing Factors
            </h3>
            <div className="space-y-0">
              {result.featureContributions.map((fc, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground w-36 shrink-0 truncate">{fc.feature}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${fc.contribution}%` }} transition={{ duration: 0.7, delay: i * 0.05 }}
                      className="h-full rounded-full" style={{ background: fc.direction === "positive" ? "#E53935" : "#16A34A" }} />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right" style={{ color: fc.direction === "positive" ? "#E53935" : "#16A34A" }}>
                    {fc.direction === "positive" ? "+" : "−"}{fc.contribution}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="clinical-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-clinical-blue" /> Clinical Recommendations
            </h3>
            <div className="space-y-2.5">
              {result.clinicalRecommendations.map((rec) => {
                const Icon = RECO_ICONS[rec.icon] ?? Activity;
                return (
                  <div key={rec.id} className={cn("rounded-lg p-3 border", rec.priority === "immediate" ? "bg-red-50 border-red-100" : rec.priority === "soon" ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100")}>
                    <div className={cn("flex items-center gap-1.5 text-xs font-semibold mb-1", rec.priority === "immediate" ? "text-red-700" : rec.priority === "soon" ? "text-amber-700" : "text-blue-700")}>
                      <Icon className="w-3.5 h-3.5" />{rec.title}
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold" style={{ background: rec.priority === "immediate" ? "#FEE2E2" : rec.priority === "soon" ? "#FEF3C7" : "#DBEAFE" }}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className={cn("text-xs leading-relaxed", rec.priority === "immediate" ? "text-red-800" : rec.priority === "soon" ? "text-amber-800" : "text-blue-800")}>
                      {rec.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI COPD Risk Prediction</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter patient clinical data to generate an AI-powered COPD risk assessment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Section A */}
        <div className="form-section">
          <SectionHeader icon={User} title="Section A — Patient Information" subtitle="Core demographic and physiological data" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></Label>
              <Input {...register("name")} placeholder="e.g. John Watson" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Patient ID</Label>
              <Input value="PT-2026-XXXX (auto-generated)" readOnly className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Age (years) <span className="text-red-500">*</span></Label>
              <Input type="number" {...register("age")} placeholder="18–110" />
              {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sex <span className="text-red-500">*</span></Label>
              <Controller name="sex" control={control} render={({ field }) => (
                <div className="flex gap-2">
                  {(["male", "female", "other"] as Sex[]).map((v) => (
                    <ToggleBtn key={v} value={v} selected={field.value === v} onClick={() => field.onChange(v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </ToggleBtn>
                  ))}
                </div>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">BMI (kg/m²) <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.1" {...register("bmi")} placeholder="e.g. 24.5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">FEV1% Predicted</Label>
              <Input type="number" {...register("fev1Predicted")} placeholder="% (optional)" />
            </div>
          </div>
        </div>

        {/* Section B */}
        <div className="form-section">
          <SectionHeader icon={Wind} title="Section B — Exposure History" subtitle="Tobacco and environmental exposures" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Smoking Status <span className="text-red-500">*</span></Label>
              <Controller name="smokingStatus" control={control} render={({ field }) => (
                <div className="flex gap-2">
                  {[{ v: "never" as SmokingStatus, l: "Never" }, { v: "former" as SmokingStatus, l: "Former" }, { v: "current" as SmokingStatus, l: "Current" }].map(({ v, l }) => (
                    <ToggleBtn key={v} value={v} selected={field.value === v} onClick={() => field.onChange(v)}>{l}</ToggleBtn>
                  ))}
                </div>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pack-Year Exposure</Label>
              <Input type="number" {...register("packYears")} placeholder="Pack-years smoked" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Biomass Fuel Exposure</Label>
              <Controller name="biomassExposure" control={control} render={({ field }) => (
                <div className="flex gap-2">
                  <ToggleBtn value="yes" selected={field.value === true} onClick={() => field.onChange(true)}>Yes</ToggleBtn>
                  <ToggleBtn value="no" selected={field.value === false} onClick={() => field.onChange(false)}>No</ToggleBtn>
                </div>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Occupational Dust Exposure</Label>
              <Controller name="occupationalDust" control={control} render={({ field }) => (
                <div className="flex gap-2">
                  <ToggleBtn value="yes" selected={field.value === true} onClick={() => field.onChange(true)}>Yes</ToggleBtn>
                  <ToggleBtn value="no" selected={field.value === false} onClick={() => field.onChange(false)}>No</ToggleBtn>
                </div>
              )} />
            </div>
          </div>
        </div>

        {/* Section C */}
        <div className="form-section">
          <SectionHeader icon={Activity} title="Section C — Symptoms" subtitle="Current and historical symptom burden" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Dyspnoea Grade (mMRC Scale)</Label>
              <Controller name="dyspnoeaGrade" control={control} render={({ field }) => (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: 0, l: "Grade 0" },
                    { v: 1, l: "Grade 1" },
                    { v: 2, l: "Grade 2" },
                    { v: 3, l: "Grade 3" },
                    { v: 4, l: "Grade 4" },
                  ].map(({ v, l }) => (
                    <ToggleBtn key={v} value={String(v)} selected={field.value === v} onClick={() => field.onChange(v as DyspnoeaGrade)}>
                      {l}
                    </ToggleBtn>
                  ))}
                </div>
              )} />
              <p className="text-xs text-muted-foreground">0 = Breathless only with strenuous exercise · 4 = Too breathless to leave house</p>
            </div>
            {[
              { name: "chronicCough" as const, label: "Chronic Cough (≥3 months)" },
              { name: "sputumProduction" as const, label: "Chronic Sputum Production" },
              { name: "wheezingHistory" as const, label: "Wheezing History" },
            ].map(({ name, label }) => (
              <div key={name} className="space-y-1.5">
                <Label className="text-xs font-medium">{label}</Label>
                <Controller name={name} control={control} render={({ field }) => (
                  <div className="flex gap-2">
                    <ToggleBtn value="yes" selected={field.value === true} onClick={() => field.onChange(true)}>Yes</ToggleBtn>
                    <ToggleBtn value="no" selected={field.value === false} onClick={() => field.onChange(false)}>No</ToggleBtn>
                  </div>
                )} />
              </div>
            ))}
          </div>
        </div>

        {/* Section D */}
        <div className="form-section">
          <SectionHeader icon={Heart} title="Section D — Comorbidities" subtitle="Concurrent medical conditions" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "cardiovascularDisease" as const, label: "Cardiovascular Disease" },
              { name: "diabetesMellitus" as const, label: "Diabetes Mellitus" },
              { name: "priorRespiratoryInfection" as const, label: "Prior Respiratory Infections" },
            ].map(({ name, label }) => (
              <div key={name} className="space-y-1.5">
                <Label className="text-xs font-medium">{label}</Label>
                <Controller name={name} control={control} render={({ field }) => (
                  <div className="flex gap-2">
                    <ToggleBtn value="yes" selected={field.value === true} onClick={() => field.onChange(true)}>Yes</ToggleBtn>
                    <ToggleBtn value="no" selected={field.value === false} onClick={() => field.onChange(false)}>No</ToggleBtn>
                  </div>
                )} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit"
          className="w-full h-14 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-clinical-blue/25 active:translate-y-0"
          style={{ background: "linear-gradient(135deg, #1B6CA8 0%, #0EA5E9 100%)" }}>
          <Brain className="w-5 h-5" />
          Generate COPD Risk Prediction
        </button>
      </form>
    </div>
  );
}
