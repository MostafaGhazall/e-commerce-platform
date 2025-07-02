import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";
import type { RegisterInput, LoginInput } from "../../../shared/userValidators";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  fetchCurrentUser: () => Promise<void>;
  login: (data: LoginInput) => Promise<{ ok: boolean; msg?: string }>;
  register: (data: RegisterInput) => Promise<{ ok: boolean; msg?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      fetchCurrentUser: async () => {
        try {
          const { data } = await api.get("/auth/me", { withCredentials: true });
          set({ user: data.user });
        } catch (err: any) {
          set({ user: null });
          if (err?.response?.status === 401) {
            console.warn("Session expired, logging out...");
            await get().logout();
          }
        }
      },

      login: async (data) => {
        try {
          await api.post(
            "/auth/login",
            { email: data.email, password: data.password },
            { withCredentials: true }
          );
          await get().fetchCurrentUser();
          return { ok: true };
        } catch (err: any) {
          const msg =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Login failed";
          return { ok: false, msg };
        }
      },

      register: async (data) => {
        try {
          await api.post(
            "/auth/register",
            {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              confirmPassword: data.confirmPassword,
              agreeTerms: data.agreeTerms,
            },
            { withCredentials: true }
          );
          await get().fetchCurrentUser();
          return { ok: true };
        } catch (err: any) {
          const msg = err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(", ")
            : err.response?.data?.error ||
              err.response?.data?.message ||
              "Registration failed";
          return { ok: false, msg };
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout", {}, { withCredentials: true });
        } catch {
          // ignore
        }
        set({ user: null });
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.fetchCurrentUser();
        }
      },
    }
  )
);
