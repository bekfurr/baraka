"use client";

import Link from 'next/link';
import { Sparkles, Briefcase, Users, Zap, Shield, Globe } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';

export default function Home() {
  const { lang } = useLang();
  const dict = t[lang];

  return (
    <main className="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
      <LanguageSwitcher />
      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto text-center pt-10 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-[var(--primary)]/30 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          <span className="text-sm font-medium bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            {dict.heroBadge}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          {dict.heroTitle1} <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-[var(--primary)] via-fuchsia-400 to-[var(--secondary)] bg-clip-text text-transparent drop-shadow-lg">
            {dict.heroTitle2}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {dict.heroDesc}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register?role=freelancer" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 text-white font-bold hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all duration-300 hover:-translate-y-1">
            {dict.findWork}
          </Link>
          <Link href="/auth/register?role=client" className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold hover:bg-white/10 transition-all duration-300 border-[var(--glass-border)] hover:-translate-y-1 hover:border-[var(--secondary)]/50">
            {dict.hireTalent}
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-[var(--accent)]" />}
          title={dict.feat1Title}
          description={dict.feat1Desc}
        />
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-[var(--secondary)]" />}
          title={dict.feat2Title}
          description={dict.feat2Desc}
        />
        <FeatureCard 
          icon={<Globe className="w-8 h-8 text-[var(--primary)]" />}
          title={dict.feat3Title}
          description={dict.feat3Desc}
        />
      </div>

    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 hover:bg-white/5 transition-colors duration-300 group cursor-default">
      <div className="mb-4 p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

