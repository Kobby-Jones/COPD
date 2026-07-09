"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { tokenStore } from "@/lib/tokenStore";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        tokenStore.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: "copd-auth" }
  )
);

// If the API client ever fails to refresh an expired session, it dispatches
// this event so the UI can drop back to a logged-out state without waiting
// for the next manual action to discover the 401.
if (typeof window !== "undefined") {
  window.addEventListener("copd-auth-expired", () => {
    useAuthStore.getState().logout();
    if (!window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
  });
}
