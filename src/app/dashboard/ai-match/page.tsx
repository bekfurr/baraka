"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';

export default function AIMatchPage() {
  const { lang } = useLang();
  const dict = t[lang];

  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data || { role: 'freelancer' });
        if (data?.role === 'freelancer') {
            setInputData('React, Next.js, Tailwind, Supabase'); // default demo skills
        } else {
            setInputData('Need a fullstack dev for a SaaS MVP in 2 weeks'); // default demo requirements
        }
      }
    };
    fetchProfile();
  }, []);

  const handleAIMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile?.role,
          skills: profile?.role === 'freelancer' ? inputData.split(',') : [],
          requirements: profile?.role === 'client' ? inputData : '',
        }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-[var(--primary)]/20 rounded-xl border border-[var(--primary)]/30">
          <Sparkles className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{dict.aiMatchmaking}</h1>
          <p className="text-gray-400">{dict.poweredBy}</p>
        </div>
      </header>

      <div className="glass-panel p-6 max-w-3xl">
        <h2 className="text-xl font-bold text-white mb-4">
          {profile?.role === 'freelancer' ? dict.yourSkills : dict.projectReqs}
        </h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] text-white outline-none"
            placeholder={profile?.role === 'freelancer' ? dict.skillPlaceholder : dict.reqPlaceholder}
          />
          <button 
            onClick={handleAIMatch}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 text-white font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.findMatchesBtn}
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="space-y-6 max-w-3xl">
          <h3 className="text-2xl font-bold text-white">{dict.topRecs}</h3>
          {matches.map((match, i) => (
            <div key={i} className="glass-panel p-6 relative overflow-hidden group hover:border-[var(--secondary)]/50 transition-all">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-[var(--primary)]/20 to-transparent p-4 rounded-bl-3xl">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--primary)]">
                  {match.matchScore}
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2">{match.title || match.name}</h4>
              <p className="text-gray-400 mb-4">{match.description || match.skills?.join(', ')}</p>
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium border border-[var(--accent)]/20">
                  {match.budget || match.hourlyRate}
                </span>
                <button className="flex items-center gap-2 text-[var(--secondary)] hover:text-white transition-colors group-hover:translate-x-1 duration-300">
                  {dict.connect} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
