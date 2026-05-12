"use client";

import { useLang } from '@/store/useLang';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="absolute top-6 right-6 z-50 flex gap-2">
      {(['en', 'uz', 'ru'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`uppercase text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
            lang === l 
            ? 'bg-[var(--primary)] text-white shadow-[0_0_10px_rgba(217,70,239,0.5)]' 
            : 'glass-panel text-gray-400 hover:text-white border-[var(--glass-border)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
