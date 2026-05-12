"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Login() {
  const router = useRouter();
  const { lang } = useLang();
  const dict = t[lang];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 relative">
      <LanguageSwitcher />
      <div className="text-center mb-8 mt-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">{dict.welcomeBack}</h2>
        <p className="text-gray-400 mt-2">{dict.loginText}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.email}</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-white outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.password}</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-white outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 text-white font-bold hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? dict.loggingIn : dict.loginBtn}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          {dict.dontHave} <Link href="/auth/register" className="text-[var(--secondary)] hover:underline">{dict.signUp}</Link>
        </p>
      </div>
    </div>
  );
}
