import type {
  Patient,
  PredictionInput,
  PredictionResult,
  DashboardStats,
  ModelMetrics,
  Report,
  User,
  TrendDataPoint,
  AgeDistribution,
  SmokingImpact,
} from "@/types";
import { api, apiUrl, ApiError } from "@/lib/apiClient";
import { tokenStore } from "@/lib/tokenStore";

// ─── Auth ──────────────────────────────────────────────────────────────────

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await api.post<AuthResponse>("/auth/login", { email, password }, { auth: false });
    tokenStore.setTokens(res.accessToken, res.refreshToken);
    return res.user;
  },

  async register(input: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    licenseNumber?: string;
  }): Promise<User> {
    const res = await api.post<AuthResponse>("/auth/register", input, { auth: false });
    tokenStore.setTokens(res.accessToken, res.refreshToken);
    return res.user;
  },

  async logout(): Promise<boolean> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Best-effort — always clear local tokens regardless of network state.
    } finally {
      tokenStore.clear();
    }
    return true;
  },

  async forgotPassword(email: string): Promise<{ message: string; devToken?: string }> {
    return api.post("/auth/forgot-password", { email }, { auth: false });
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    return api.post("/auth/reset-password", { email, token, newPassword }, { auth: false });
  },

  async me(): Promise<User> {
    return api.get<User>("/users/me");
  },

  isAuthenticated(): boolean {
    return tokenStore.hasSession();
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
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.riskLevel) params.set("riskLevel", filters.riskLevel);
    if (filters?.sex) params.set("sex", filters.sex);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.pageSize) params.set("pageSize", String(filters.pageSize));
    const qs = params.toString();
    return api.get(`/patients${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      return await api.get<Patient>(`/patients/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },

  async create(data: Partial<Patient>): Promise<Patient> {
    return api.post("/patients", data);
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    return api.patch(`/patients/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};

// ─── Respiratory Audio (ICBHI breathing-sound recordings) ─────────────────

export interface AudioRecording {
  id: string;
  patientId?: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  status: "uploaded" | "analyzing" | "completed" | "failed";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const audioService = {
  /** Upload a recorded/selected audio blob. Returns the created recording
   * record (status "uploaded") — pass its id as `audioRecordingId` to
   * predictionService.predict() with mode "audio" to run inference. */
  async upload(file: Blob, filename: string, patientId?: string): Promise<AudioRecording> {
    const form = new FormData();
    form.append("file", file, filename);
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";
    return api.post(`/respiratory-audio/upload${qs}`, form);
  },

  async getAll(patientId?: string): Promise<AudioRecording[]> {
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";
    return api.get(`/respiratory-audio${qs}`);
  },

  async getById(id: string): Promise<AudioRecording> {
    return api.get(`/respiratory-audio/${id}`);
  },

  /** Runs inference directly (normally unnecessary — predictionService.predict
   * with mode "audio" triggers this server-side — but exposed for a
   * "re-analyze" affordance). Throws ApiError with isModelNotReady === true
   * until the ICBHI model is trained and AUDIO_MODEL_SERVICE_URL is set. */
  async analyze(id: string): Promise<unknown> {
    return api.post(`/respiratory-audio/${id}/analyze`);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/respiratory-audio/${id}`);
  },
};

// ─── Predictions ───────────────────────────────────────────────────────────

export const predictionService = {
  async predict(
    input: PredictionInput & { mode?: "clinical" | "audio"; audioRecordingId?: string },
  ): Promise<PredictionResult> {
    return api.post("/predictions", input);
  },

  async getHistory(patientId: string): Promise<PredictionResult[]> {
    return api.get(`/predictions/history/${patientId}`);
  },

  async getById(id: string): Promise<PredictionResult> {
    return api.get(`/predictions/${id}`);
  },
};

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return api.get("/dashboard/stats");
  },

  async getTrends(): Promise<TrendDataPoint[]> {
    return api.get("/dashboard/trends");
  },

  async getRecentPredictions(): Promise<Patient[]> {
    return api.get("/dashboard/recent-predictions");
  },
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export const analyticsService = {
  async getModelMetrics(): Promise<ModelMetrics> {
    return api.get("/analytics/model-metrics");
  },

  async getFeatureImportance(): Promise<{ feature: string; importance: number; color: string }[]> {
    return api.get("/analytics/feature-importance");
  },

  async getAgeDistribution(): Promise<AgeDistribution[]> {
    return api.get("/analytics/age-distribution");
  },

  async getSmokingImpact(): Promise<SmokingImpact[]> {
    return api.get("/analytics/smoking-impact");
  },

  async getGenderDistribution(): Promise<{ gender: string; percentage: number }[]> {
    return api.get("/analytics/gender-distribution");
  },
};

// ─── Reports ───────────────────────────────────────────────────────────────

export const reportService = {
  async getAll(): Promise<Report[]> {
    return api.get("/reports");
  },

  async getById(id: string): Promise<Report> {
    return api.get(`/reports/${id}`);
  },

  async generate(patientId: string, type: Report["type"]): Promise<Report> {
    return api.post("/reports", { patientId, type });
  },

  /** Downloads the generated PDF as a blob (fetch is required, not a plain
   * <a href>, so the Authorization header can be attached) and triggers a
   * browser save-as via a temporary object URL. */
  async download(id: string): Promise<void> {
    const token = tokenStore.getAccessToken();
    const res = await fetch(apiUrl(`/reports/${id}/download`), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Failed to download report");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
