import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ar';

interface PreferenceState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      language: 'en',

      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'preference-storage',
    }
  )
);
