import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'en' | 'uz' | 'ru';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'baraka-lang',
    }
  )
);
