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
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Profile Form
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Job Form (For Clients)
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: '', category: '' });
  const [addingJob, setAddingJob] = useState(false);

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
        
        if (profileData.role === 'client') {
          const { data: jobData } = await supabase.from('jobs').select('*').eq('client_id', session.user.id).order('created_at', { ascending: false });
          setJobs(jobData || []);
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

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setAddingJob(true);
    await supabase.from('jobs').insert([{
      client_id: profile.id,
      title: newJob.title,
      description: newJob.description,
      budget: parseFloat(newJob.budget) || 0,
      category: newJob.category
    }]);
    setNewJob({ title: '', description: '', budget: '', category: '' });
    setShowAddJob(false);
    setAddingJob(false);
    fetchData();
  };

  const handleDeleteJob = async (id: string) => {
    await supabase.from('jobs').delete().eq('id', id);
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

      {/* Jobs Section (Only for Clients) */}
      {profile?.role === 'client' && (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{dict.myJobs}</h2>
            <button onClick={() => setShowAddJob(!showAddJob)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] text-white font-bold hover:bg-[var(--secondary-hover)] transition-all">
              <Plus className="w-4 h-4" /> {dict.addJob}
            </button>
          </div>

          {showAddJob && (
            <form onSubmit={handleAddJob} className="glass-panel p-6 mb-6 space-y-4 border-[var(--secondary)]/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">{dict.jobTitle}</label>
                  <input required type="text" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">{dict.jobDesc}</label>
                  <textarea required value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none resize-none" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">{dict.budget} ($)</label>
                  <input required type="number" value={newJob.budget} onChange={(e) => setNewJob({...newJob, budget: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">{dict.category}</label>
                  <input required type="text" value={newJob.category} onChange={(e) => setNewJob({...newJob, category: e.target.value})} className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 text-white outline-none" placeholder="e.g. Web Dev" />
                </div>
              </div>
              <button type="submit" disabled={addingJob} className="px-6 py-2 rounded bg-[var(--secondary)] text-white font-bold mt-4">{addingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.add}</button>
            </form>
          )}

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-gray-400">{dict.noJobs}</p>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="glass-panel p-5 flex justify-between items-start group">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{job.description}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded">{job.category}</span>
                      <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">${job.budget}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteJob(job.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded">
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
