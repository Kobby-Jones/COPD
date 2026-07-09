import { tokenStore } from "./tokenStore";

// ─── Config ─────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// ─── Error type ─────────────────────────────────────────────────────────────
// Mirrors the shape produced by the backend's AllExceptionsFilter:
// { statusCode, path, timestamp, message, code?, detail? }

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  detail?: string;
  path?: string;

  constructor(payload: {
    statusCode: number;
    message: string | string[];
    code?: string;
    detail?: string;
    path?: string;
  }) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;
    super(message || "Request failed");
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.detail = payload.detail;
    this.path = payload.path;
  }

  get isModelNotReady() {
    return this.code === "MODEL_NOT_READY" || this.statusCode === 503;
  }

  get isAuthError() {
    return this.statusCode === 401;
  }
}

// ─── Refresh handling ───────────────────────────────────────────────────────
// Only one refresh request should ever be in flight; concurrent 401s all
// await the same promise instead of each firing their own /auth/refresh call.

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        if (!data?.accessToken || !data?.refreshToken) return false;
        tokenStore.setTokens(data.accessToken, data.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// ─── Core request ───────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // plain object (JSON) or FormData (multipart)
  auth?: boolean; // defaults to true — attach Authorization header
  skipRefreshOnAuthError?: boolean; // used internally to avoid infinite loops
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const { body, auth = true, skipRefreshOnAuthError, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = tokenStore.getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !skipRefreshOnAuthError) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return rawRequest(path, { ...options, skipRefreshOnAuthError: true });
    }
    tokenStore.clear();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("copd-auth-expired"));
    }
  }

  return res;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError({
      statusCode: res.status,
      message: payload?.message || res.statusText || "Request failed",
      code: payload?.code,
      detail: payload?.detail,
      path: payload?.path,
    });
  }

  return payload as T;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await rawRequest(path, options);
  return parseResponse<T>(res);
}

export const api = {
  get: <T = unknown>(path: string, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T = unknown>(path: string, body?: unknown, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(path: string, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};

/** Builds a fully-qualified, auth-free download URL (e.g. report PDFs). Since
 * plain <a> downloads can't attach an Authorization header, the caller must
 * open these via a helper that fetches with auth and triggers a blob download
 * — see reportService.download() in services/api.ts. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
