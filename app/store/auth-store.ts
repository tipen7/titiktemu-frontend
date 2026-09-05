import { create } from "zustand";

export type UserRole = "admin" | "government" | "business" | "consumer";

type AuthState = {
  sessionId: string | null;
  role: UserRole | null;
  setSession: (sessionId: string, role: UserRole) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  sessionId: null,
  role: null,
  setSession: (sessionId, role) => set({ sessionId, role }),
  clearSession: () => set({ sessionId: null, role: null }),
}));
