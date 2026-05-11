"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Calendar, FileText, User, Wind, Activity, Heart, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { patientService } from "@/services/api";
import { formatDate, formatDateTime, getSmokingLabel, cn } from "@/lib/utils";
import type { Patient } from "@/types";

function InfoRow({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : (value ?? "—");
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{String(display)}</span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("flex items-center gap-1 text-xs font-medium", value ? "text-red-600" : "text-green-600")}>
        {value ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
        {value ? "Present" : "Absent"}
      </span>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    patientService.getById(id).then((p) => {
      setPatient(p);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) return (
    <div className="grid grid-cols-3 gap-5">
      <CardSkeleton height="h-40" />
      <CardSkeleton height="h-40" />
      <CardSkeleton height="h-40" />
    </div>
  );

  if (!patient) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Patient not found</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/patients")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients
      </Button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/patients")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Patients
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">{patient.id} · {patient.department}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/predict")}>
            <Brain className="w-3.5 h-3.5 mr-1.5" /> New Prediction
          </Button>
          <Button variant="outline" size="sm"><FileText className="w-3.5 h-3.5 mr-1.5" /> Report</Button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="prediction-gradient rounded-xl p-5 text-white mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{patient.name}</div>
            <div className="text-blue-200 text-sm">{patient.age} years · {patient.sex} · BMI {patient.bmi}</div>
            <div className="text-blue-300 text-xs mt-0.5">Referred by {patient.referringDoctor} · {patient.department}</div>
          </div>
          <div className="text-right">
            <RiskBadge level={patient.latestRiskLevel} size="lg" />
            <div className="text-3xl font-bold mt-2">{patient.latestRiskScore}%</div>
            <div className="text-blue-200 text-xs">Latest risk score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Demographics */}
        <div className="clinical-card p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <User className="w-4 h-4 text-clinical-blue" />
            <h3 className="text-sm font-semibold">Demographics</h3>
          </div>
          <InfoRow label="Full Name" value={patient.name} />
          <InfoRow label="Age" value={`${patient.age} years`} />
          <InfoRow label="Sex" value={patient.sex} />
          <InfoRow label="BMI" value={`${patient.bmi} kg/m²`} />
          <InfoRow label="FEV1% Predicted" value={patient.fev1Predicted ? `${patient.fev1Predicted}%` : "Not recorded"} />
          <InfoRow label="Patient ID" value={patient.id} />
          <InfoRow label="Enrolled" value={formatDate(patient.createdAt)} />
        </div>

        {/* Exposure & Symptoms */}
        <div className="clinical-card p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <Wind className="w-4 h-4 text-clinical-blue" />
            <h3 className="text-sm font-semibold">Exposure & Symptoms</h3>
          </div>
          <InfoRow label="Smoking Status" value={getSmokingLabel(patient.smokingStatus)} />
          <InfoRow label="Pack-Years" value={patient.packYears} />
          <BoolRow label="Biomass Exposure" value={patient.biomassExposure} />
          <BoolRow label="Occupational Dust" value={patient.occupationalDust} />
          <InfoRow label="Dyspnea Grade" value={`mMRC Grade ${patient.dyspnoeaGrade}`} />
          <BoolRow label="Chronic Cough" value={patient.chronicCough} />
          <BoolRow label="Sputum Production" value={patient.sputumProduction} />
          <BoolRow label="Wheezing" value={patient.wheezingHistory} />
        </div>

        {/* Comorbidities & Assessment */}
        <div className="space-y-4">
          <div className="clinical-card p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Heart className="w-4 h-4 text-clinical-blue" />
              <h3 className="text-sm font-semibold">Comorbidities</h3>
            </div>
            <BoolRow label="Cardiovascular Disease" value={patient.cardiovascularDisease} />
            <BoolRow label="Diabetes Mellitus" value={patient.diabetesMellitus} />
            <BoolRow label="Prior Resp. Infection" value={patient.priorRespiratoryInfection} />
          </div>
          <div className="clinical-card p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Activity className="w-4 h-4 text-clinical-blue" />
              <h3 className="text-sm font-semibold">Assessment History</h3>
            </div>
            <InfoRow label="Latest Risk Level" value={patient.latestRiskLevel.toUpperCase()} />
            <InfoRow label="Latest Score" value={`${patient.latestRiskScore}%`} />
            <InfoRow label="Last Assessment" value={formatDate(patient.lastAssessment)} />
            <InfoRow label="Referring Doctor" value={patient.referringDoctor ?? "—"} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
