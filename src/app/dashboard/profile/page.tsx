"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { lang } = useLang();
  const dict = t[lang];
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Profile Form
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Service Form
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '', price: '', category: '' });
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);
      if (profileData) {
        setLocation(profileData.location || '');
        setBio(profileData.bio || '');
        
        if (profileData.role === 'freelancer') {
          const { data: serviceData } = await supabase.from('services').select('*').eq('freelancer_id', session.user.id).order('created_at', { ascending: false });
          setServices(serviceData || []);
        }
      }
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({ location, bio }).eq('id', profile.id);
    setSavingProfile(false);
    fetchData();
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setAddingService(true);
    await supabase.from('services').insert([{
      freelancer_id: profile.id,
      title: newService.title,
      description: newService.description,
      price: parseFloat(newService.price) || 0,
      category: newService.category
    }]);
    setNewService({ title: '', description: '', price: '', category: '' });
    setShowAddService(false);
    setAddingService(false);
    fetchData();
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">{dict.profile}</h1>
      </header>

      {/* Edit Profile Form */}
      <form onSubmit={handleUpdateProfile} className="glass-panel p-6 max-w-3xl space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">{dict.editProfile} ({profile?.role})</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.location}</label>
          <input 
            type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] text-white outline-none"
            placeholder="e.g. Tashkent, Uzbekistan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{dict.bio}</label>
          <textarea 
            value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--primary)] text-white outline-none resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
        <button type="submit" disabled={savingProfile} className="px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-bold disabled:opacity-50 transition-all hover:bg-[var(--primary-hover)]">
          {savingProfile ? dict.saving : dict.saveChanges}
        </button>
      </form>

      {/* Services Section (Only for Freelancers) */}
      {profile?.role === 'freelancer' && (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{dict.myServices}</h2>
            <button onClick={() => setShowAddService(!showAddService)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] text-white font-bold hover:bg-[var(--secondary-hover)] transition-all">
              <Plus className="w-4 h-4" /> {dict.addService}
            </button>
          </div>

          {showAddService && (
            <form onSubmit={handleAddService} className="glass-panel p-6 mb-6 space-y-4 border-[var(--secondary)]/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">{dict.serviceTitle}</label>
                  <input required type="text" value={newService.title} onChange={(e) => setNewService({...newService, title: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">{dict.serviceDesc}</label>
                  <textarea required value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none resize-none" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">{dict.price} ($)</label>
                  <input required type="number" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">{dict.category}</label>
                  <input required type="text" value={newService.category} onChange={(e) => setNewService({...newService, category: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" placeholder="e.g. Web Dev" />
                </div>
              </div>
              <button type="submit" disabled={addingService} className="px-6 py-2 rounded bg-[var(--secondary)] text-white font-bold mt-4">{addingService ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.add}</button>
            </form>
          )}

          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-gray-400">{dict.noServices}</p>
            ) : (
              services.map(service => (
                <div key={service.id} className="glass-panel p-5 flex justify-between items-start group">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{service.description}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded">{service.category}</span>
                      <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">${service.price}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteService(service.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
