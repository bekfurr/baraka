"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import { Search, MapPin, Briefcase, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const { lang } = useLang();
  const dict = t[lang];
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);
      
      if (profileData?.role === 'client') {
        // Clients see all services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*, profiles(full_name, location, skills)')
          .order('created_at', { ascending: false });
        setServices(servicesData || []);
      } else {
        // Freelancers might see client requests in a real app, but for now we'll show their services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*, profiles(full_name, location, skills)')
          .eq('freelancer_id', session.user.id)
          .order('created_at', { ascending: false });
        setServices(servicesData || []);
      }
    }
    setLoading(false);
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startChat = async (freelancerId: string) => {
    router.push(`/dashboard/chat?user=${freelancerId}`);
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">{profile?.role === 'client' ? dict.findJobs : dict.myServices}</h1>
      </header>

      {profile?.role === 'client' && (
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.searchServices}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-white outline-none transition-all shadow-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.length === 0 ? (
          <p className="text-gray-400">{dict.noServices}</p>
        ) : (
          filteredServices.map(service => (
            <div key={service.id} className="glass-panel p-6 flex flex-col justify-between group hover:border-[var(--secondary)]/50 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[var(--secondary)] transition-colors">{service.title}</h3>
                  <span className="bg-[var(--accent)] text-black font-bold px-3 py-1 rounded-full text-sm">${service.price}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{service.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {service.category}</span>
                  {service.profiles?.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {service.profiles.location}</span>
                  )}
                </div>
              </div>

              {profile?.role === 'client' && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm text-gray-300 font-medium">By {service.profiles?.full_name}</div>
                  <button 
                    onClick={() => startChat(service.freelancer_id)}
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-white/5 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] rounded-lg transition-all"
                  >
                    <MessageSquare className="w-4 h-4" /> {dict.startChat}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
