import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";


export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

// Register
export const registerUser = async (name: string, email: string, password: string): Promise<AuthUser> => {
  const { data } = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return data.user;
};

// Login
export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data.user;
};

// Get Current User
export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthResponse>("/auth/me");
  return data.user;
};

// Logout
export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};


interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: async (email, password) => {
        try {
          const user = await loginUser(email, password);
          set({ user });
          return { success: true };
        } catch (err: any) {
          return { success: false, message: err.response?.data?.message || "Login failed" };
        }
      },

      register: async (name, email, password) => {
        try {
          const user = await registerUser(name, email, password);
          set({ user });
          return { success: true };
        } catch (err: any) {
          return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
      },

      logout: async () => {
        await logoutUser();
        set({ user: null });
      },

      fetchCurrentUser: async () => {
        try {
          const user = await getCurrentUser();
          set({ user });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
