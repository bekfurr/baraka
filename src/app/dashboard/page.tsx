"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Briefcase, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';

export default function DashboardOverview() {
  const { lang } = useLang();
  const dict = t[lang];

  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    aiMatches: 0
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        activeJobs: Math.floor(Math.random() * 5) + 1,
        completedJobs: Math.floor(Math.random() * 20),
        totalEarnings: Math.floor(Math.random() * 5000) + 500,
        aiMatches: Math.floor(Math.random() * 10) + 2
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">{dict.overview}</h1>
        <p className="text-gray-400">{dict.welcomeDash}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={dict.activeProjects} 
          value={stats.activeJobs} 
          icon={<Briefcase className="w-6 h-6 text-[var(--secondary)]" />} 
          trend="+2"
        />
        <StatCard 
          title={dict.completed} 
          value={stats.completedJobs} 
          icon={<CheckCircle className="w-6 h-6 text-green-400" />} 
          trend="Top 10%"
        />
        <StatCard 
          title={dict.earnings} 
          value={`$${stats.totalEarnings}`} 
          icon={<TrendingUp className="w-6 h-6 text-[var(--accent)]" />} 
          trend="+15%"
        />
        <StatCard 
          title={dict.newAIMatches} 
          value={stats.aiMatches} 
          icon={<Clock className="w-6 h-6 text-[var(--primary)]" />} 
          trend="New"
        />
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold text-white mb-6">{dict.recentActivity}</h2>
        <div className="space-y-4">
          <ActivityItem 
            title="AI Match Found: Frontend Development for SaaS" 
            time="2 hours ago"
            type="match"
          />
          <ActivityItem 
            title="Profile updated successfully" 
            time="5 hours ago"
            type="system"
          />
          <ActivityItem 
            title="Payment processed for Project Alpha" 
            time="1 day ago"
            type="finance"
          />
        </div>
        <div className="mt-6">
           <Link href="/dashboard/ai-match" className="text-[var(--primary)] hover:underline text-sm font-medium">
             {dict.viewAllAI} &rarr;
           </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="glass-panel p-6 hover:border-[var(--glass-border)] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-[var(--secondary)]">{trend}</p>
    </div>
  );
}

function ActivityItem({ title, time, type }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${type === 'match' ? 'bg-[var(--primary)]' : type === 'finance' ? 'bg-[var(--accent)]' : 'bg-gray-500'}`} />
        <span className="text-white text-sm">{title}</span>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
