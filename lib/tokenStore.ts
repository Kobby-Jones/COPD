// ─── Token Storage ──────────────────────────────────────────────────────────
// Plain (non-React) module for persisting JWT access/refresh tokens. Kept
// separate from the zustand authStore (which only holds user/profile data)
// so that services/api.ts — a plain module, not a React hook — can read and
// write tokens without depending on React context.

const ACCESS_TOKEN_KEY = "copd-access-token";
const REFRESH_TOKEN_KEY = "copd-refresh-token";

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStore = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  setAccessToken(accessToken: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  hasSession(): boolean {
    return !!this.getRefreshToken();
  },
};
