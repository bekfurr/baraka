"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'client' ? 'client' : 'freelancer';

  const { lang } = useLang();
  const dict = t[lang];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              full_name: fullName, 
              role,
              email,
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
            console.error('Profile creation warning:', profileError);
        }

        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 relative">
      <LanguageSwitcher />
      <div className="text-center mb-8 mt-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">{dict.join}</h2>
        <p className="text-gray-400 mt-2">{dict.createAccountText}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.fullName}</label>
          <input 
            type="text" 
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-white outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.iWantTo}</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`py-3 rounded-lg border transition-all ${role === 'freelancer' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
            >
              {dict.workRole}
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`py-3 rounded-lg border transition-all ${role === 'client' ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
            >
              {dict.hireRole}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 text-white font-bold hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? dict.creating : dict.createAccountBtn}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          {dict.alreadyHave} <Link href="/auth/login" className="text-[var(--secondary)] hover:underline">{dict.login}</Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="text-white text-center py-10">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
