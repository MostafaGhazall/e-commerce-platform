import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: {
    email: string;
  } | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (storedUsers[email] === password) {
          set({ user: { email } });
          return true;
        }
        return false;
      },
      register: (email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (storedUsers[email]) return false;
        storedUsers[email] = password;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        set({ user: { email } });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);


