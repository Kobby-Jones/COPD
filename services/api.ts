import type {
  Patient,
  PredictionInput,
  PredictionResult,
  DashboardStats,
  ModelMetrics,
  Report,
} from "@/types";
import {
  MOCK_PATIENTS,
  MOCK_DASHBOARD_STATS,
  MOCK_MODEL_METRICS,
  MOCK_REPORTS,
  MOCK_TREND_DATA,
  MOCK_PREDICTION_RESULT,
  GLOBAL_FEATURE_IMPORTANCE,
} from "@/data/mockData";
import { classifyRisk, getRiskClassificationLabel } from "@/lib/utils";

// ─── Simulate async delay ──────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    await delay(800);
    if (!email || !password) throw new Error("Invalid credentials");
    return {
      id: "USR-001",
      name: "Dr. Sarah Mitchell",
      email,
      role: "Pulmonologist",
      department: "Respiratory Medicine",
      licenseNumber: "MD-2019-04821",
      initials: "SM",
    };
  },
  async logout() {
    await delay(200);
    return true;
  },
  async forgotPassword(email: string) {
    await delay(600);
    if (!email) throw new Error("Email required");
    return { message: "Reset link sent to " + email };
  },
};

// ─── Patients ──────────────────────────────────────────────────────────────

export const patientService = {
  async getAll(filters?: {
    search?: string;
    riskLevel?: string;
    sex?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ patients: Patient[]; total: number }> {
    await delay(300);
    let result = [...MOCK_PATIENTS];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.department?.toLowerCase().includes(q)
      );
    }
    if (filters?.riskLevel && filters.riskLevel !== "all") {
      result = result.filter((p) => p.latestRiskLevel === filters.riskLevel);
    }
    if (filters?.sex && filters.sex !== "all") {
      result = result.filter((p) => p.sex === filters.sex);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const total = result.length;
    return { patients: result.slice(start, start + pageSize), total };
  },

  async getById(id: string): Promise<Patient | null> {
    await delay(200);
    return MOCK_PATIENTS.find((p) => p.id === id) ?? null;
  },

  async create(data: Partial<Patient>): Promise<Patient> {
    await delay(500);
    const newPatient: Patient = {
      ...data,
      id: `PT-${Date.now()}`,
      latestRiskLevel: "low",
      latestRiskScore: 0,
      lastAssessment: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } as Patient;
    return newPatient;
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    await delay(400);
    const existing = MOCK_PATIENTS.find((p) => p.id === id);
    if (!existing) throw new Error("Patient not found");
    return { ...existing, ...data };
  },
};

// ─── Predictions ───────────────────────────────────────────────────────────

export const predictionService = {
  async predict(input: PredictionInput): Promise<PredictionResult> {
    // Multi-step loading simulation
    await delay(2800);

    // Simple heuristic scoring for demo
    let score = 20;
    if (input.smokingStatus === "current") score += 28;
    else if (input.smokingStatus === "former") score += 12;
    if (input.packYears > 30) score += 15;
    else if (input.packYears > 15) score += 8;
    if (input.age > 65) score += 12;
    else if (input.age > 50) score += 6;
    if (input.dyspnoeaGrade >= 2) score += 10;
    else if (input.dyspnoeaGrade === 1) score += 4;
    if (input.chronicCough) score += 5;
    if (input.wheezingHistory) score += 5;
    if (input.occupationalDust) score += 7;
    if (input.biomassExposure) score += 5;
    if (input.cardiovascularDisease) score += 4;
    if (input.diabetesMellitus) score -= 2;
    if (input.fev1Predicted && input.fev1Predicted < 70) score += 8;
    if (input.bmi && input.bmi > 30) score -= 3;
    if (input.bmi && input.bmi < 20) score += 4;

    score = Math.max(5, Math.min(97, score));
    const riskLevel = classifyRisk(score);

    const result: PredictionResult = {
      ...MOCK_PREDICTION_RESULT,
      id: `PRED-${Date.now()}`,
      patientName: input.name,
      riskScore: score,
      riskLevel,
      confidence: 88 + Math.random() * 8,
      generatedAt: new Date().toISOString(),
    };

    return result;
  },

  async getHistory(patientId: string): Promise<PredictionResult[]> {
    await delay(300);
    return [MOCK_PREDICTION_RESULT];
  },
};

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await delay(200);
    return MOCK_DASHBOARD_STATS;
  },

  async getTrends() {
    await delay(200);
    return MOCK_TREND_DATA;
  },

  async getRecentPredictions() {
    await delay(200);
    return MOCK_PATIENTS.slice(0, 5);
  },
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export const analyticsService = {
  async getModelMetrics(): Promise<ModelMetrics> {
    await delay(200);
    return MOCK_MODEL_METRICS;
  },

  async getFeatureImportance() {
    await delay(200);
    return GLOBAL_FEATURE_IMPORTANCE;
  },

  async getAgeDistribution() {
    await delay(200);
    return [
      { ageGroup: "40–49", percentage: 8 },
      { ageGroup: "50–59", percentage: 24 },
      { ageGroup: "60–69", percentage: 38 },
      { ageGroup: "70–79", percentage: 22 },
      { ageGroup: "80+", percentage: 8 },
    ];
  },

  async getSmokingImpact() {
    await delay(200);
    return [
      { status: "Never", copdPrevalence: 4, avgRiskScore: 15 },
      { status: "Former", copdPrevalence: 28, avgRiskScore: 48 },
      { status: "Current", copdPrevalence: 68, avgRiskScore: 74 },
    ];
  },

  async getGenderDistribution() {
    await delay(200);
    return [
      { gender: "Male", percentage: 58 },
      { gender: "Female", percentage: 42 },
    ];
  },
};

// ─── Reports ───────────────────────────────────────────────────────────────

export const reportService = {
  async getAll(): Promise<Report[]> {
    await delay(300);
    return MOCK_REPORTS;
  },

  async generate(patientId: string, type: Report["type"]): Promise<Report> {
    await delay(600);
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    return {
      id: `RPT-${Date.now()}`,
      patientId,
      patientName: patient?.name ?? "Unknown",
      type,
      title: `${patient?.name} — ${type === "individual" ? "COPD Assessment" : "Follow-up Report"}`,
      riskLevel: patient?.latestRiskLevel,
      generatedAt: new Date().toISOString(),
      generatedBy: "Dr. Sarah Mitchell",
      status: "ready",
    };
  },
};
