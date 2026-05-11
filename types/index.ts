// ─── Patient & Clinical Types ──────────────────────────────────────────────

export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type SmokingStatus = "never" | "former" | "current";
export type Sex = "male" | "female" | "other";
export type DyspnoeaGrade = 0 | 1 | 2 | 3 | 4;

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  bmi: number;
  smokingStatus: SmokingStatus;
  packYears: number;
  biomassExposure: boolean;
  occupationalDust: boolean;
  dyspnoeaGrade: DyspnoeaGrade;
  chronicCough: boolean;
  sputumProduction: boolean;
  wheezingHistory: boolean;
  cardiovascularDisease: boolean;
  diabetesMellitus: boolean;
  priorRespiratoryInfection: boolean;
  fev1Predicted?: number;
  latestRiskLevel: RiskLevel;
  latestRiskScore: number;
  lastAssessment: string;
  createdAt: string;
  department?: string;
  referringDoctor?: string;
  notes?: string;
}

// ─── Prediction Types ──────────────────────────────────────────────────────

export interface PredictionInput {
  patientId?: string;
  name: string;
  age: number;
  sex: Sex;
  bmi: number;
  smokingStatus: SmokingStatus;
  packYears: number;
  biomassExposure: boolean;
  occupationalDust: boolean;
  dyspnoeaGrade: DyspnoeaGrade;
  chronicCough: boolean;
  sputumProduction: boolean;
  wheezingHistory: boolean;
  cardiovascularDisease: boolean;
  diabetesMellitus: boolean;
  priorRespiratoryInfection: boolean;
  fev1Predicted?: number;
}

export interface FeatureContribution {
  feature: string;
  value: string | number;
  contribution: number;
  direction: "positive" | "negative";
  shapValue: number;
}

export interface PredictionResult {
  id: string;
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  baselineProbability: number;
  modelVersion: string;
  generatedAt: string;
  featureContributions: FeatureContribution[];
  clinicalRecommendations: ClinicalRecommendation[];
  shapExplanation: ShapExplanation;
}

export interface ClinicalRecommendation {
  id: string;
  category: string;
  priority: "immediate" | "soon" | "routine";
  title: string;
  description: string;
  icon: string;
}

export interface ShapExplanation {
  baseValue: number;
  outputValue: number;
  features: ShapFeature[];
}

export interface ShapFeature {
  name: string;
  value: string | number;
  shapValue: number;
  normalizedImpact: number;
}

// ─── Analytics Types ───────────────────────────────────────────────────────

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  specificity: number;
  falseNegativeRate: number;
  validationCases: number;
  modelVersion: string;
  lastUpdated: string;
}

export interface DashboardStats {
  totalPatients: number;
  highRiskPatients: number;
  predictionsToday: number;
  avgRiskScore: number;
  patientsThisWeek: number;
  predictionsYesterday: number;
  riskDistribution: RiskDistribution;
}

export interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

// ─── Report Types ──────────────────────────────────────────────────────────

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  type: "individual" | "population" | "followup" | "alert";
  title: string;
  riskLevel?: RiskLevel;
  generatedAt: string;
  generatedBy: string;
  status: "ready" | "pending" | "sent";
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  licenseNumber: string;
  initials: string;
  avatarColor?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Chart Data Types ──────────────────────────────────────────────────────

export interface TrendDataPoint {
  date: string;
  predictions: number;
  highRisk: number;
}

export interface AgeDistribution {
  ageGroup: string;
  count: number;
  percentage: number;
}

export interface SmokingImpact {
  status: string;
  copdPrevalence: number;
  avgRiskScore: number;
}
