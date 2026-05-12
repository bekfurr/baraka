"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Home, Briefcase, User, Sparkles, MessageSquare } from 'lucide-react';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const { lang } = useLang();
  const dict = t[lang];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      setProfile(profileData || { role: 'freelancer', full_name: 'User' });
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading your workspace...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent relative">
      <LanguageSwitcher />
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel m-4 md:mr-0 md:h-[calc(100vh-2rem)] flex flex-col z-10">
        <div className="p-6 border-b border-[var(--glass-border)]">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">Baraka</h2>
          <p className="text-xs text-gray-400 mt-1 capitalize">{profile?.role} Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            <Home className="w-5 h-5 text-[var(--secondary)]" /> {dict.overview}
          </Link>
          <Link href="/dashboard/jobs" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            <Briefcase className="w-5 h-5 text-[var(--accent)]" /> {profile?.role === 'client' ? dict.myPostings : dict.findJobs}
          </Link>
          <Link href="/dashboard/chat" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            <MessageSquare className="w-5 h-5 text-green-400" /> {dict.chatMenu}
          </Link>
          <Link href="/dashboard/ai-match" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-[var(--primary)]/10 transition-all border border-transparent hover:border-[var(--primary)]/30">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" /> {dict.aiMatchMenu}
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            <User className="w-5 h-5 text-gray-400" /> {dict.profile}
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> {dict.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-12 md:mt-0">
        <div className="max-w-6xl mx-auto pt-8 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
