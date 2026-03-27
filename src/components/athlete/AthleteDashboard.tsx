import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, PlayCircle, ClipboardList, TrendingUp, 
  MessageSquare, Plus, Search, Calendar,
  ArrowRight, MoreVertical, CheckCircle, Clock,
  ChevronRight, Star, Activity, User
} from 'lucide-react';
import { supabase } from '../../supabase';
import { Program, UserProfile, Video } from '../../types';

interface AthleteDashboardProps {
  athleteUser: UserProfile;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AthleteDashboard = ({ athleteUser, showToast }: AthleteDashboardProps) => {
  const [activeTab, setActiveTab] = useState('users');
  const [assignedUsers, setAssignedUsers] = useState<UserProfile[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAthleteData();
  }, [athleteUser.id]);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
      // 1. Get programs where I am the author
      const { data: progData } = await supabase.from('programs').select('*').eq('created_by', athleteUser.id);
      setPrograms(progData || []);

      // 2. Get users assigned to these programs
      const { data: assignments } = await supabase.from('program_assignments').select('user_id');
      const userIds = Array.from(new Set(assignments?.map(a => a.user_id) || []));
      
      if (userIds.length > 0) {
        const { data: uData } = await supabase.from('profiles').select('*').in('id', userIds);
        setAssignedUsers(uData || []);
      }

      // 3. Get my videos
      const { data: vData } = await supabase.from('videos').select('*').eq('created_by', athleteUser.id);
      setVideos(vData || []);

    } catch (err) {
      showToast('Synchronization Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = assignedUsers.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 lg:p-12 space-y-12">
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-brand-coral/10 rounded-2xl border border-brand-coral/20 text-brand-coral border-glow-brand-coral-subtle rotate-3">
                <Star size={24} fill="currentColor" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Athlete Command</h1>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mt-2 font-black">Authorized: Anderson Djeemo</p>
             </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
          {[
            { id: 'users', label: 'Assigned Nodes', icon: Users },
            { id: 'programs', label: 'Protocols', icon: PlayCircle },
            { id: 'metrics', label: 'Yield Analytics', icon: Activity },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[9px] uppercase tracking-[0.3em] font-black transition-all ${
                activeTab === t.id ? 'bg-brand-coral text-black shadow-glow-coral' : 'text-white/30 hover:text-white'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      {loading ? (
        <div className="py-20 text-center animate-pulse">
           <div className="w-16 h-16 border-2 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-glow-coral" />
           <p className="text-[10px] uppercase tracking-[0.5em] text-brand-coral font-black">Decrypting Dashboard State...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
               <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/5">
                 <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search managed nodes..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand-coral/50 transition-all text-xs font-black uppercase tracking-widest"
                    />
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-brand-coral/10 px-6 py-4 rounded-2xl border border-brand-coral/20 text-center">
                       <p className="text-2xl font-black tracking-tighter leading-none">{assignedUsers.length}</p>
                       <p className="text-[7px] uppercase tracking-widest text-brand-coral font-black mt-1">Managed Assets</p>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                   <div key={u.id} className="card-gradient p-8 border border-white/5 group hover:border-brand-coral/30 transition-all rounded-[2.5rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-coral/5 blur-3xl -mr-12 -mt-12 group-hover:bg-brand-coral/20 transition-all" />
                      
                      <div className="flex items-center gap-5 justify-between mb-8">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-lg overflow-hidden relative">
                               {u.profile_image ? <img src={u.profile_image} className="w-full h-full object-cover" /> : <User size={24} />}
                            </div>
                            <div>
                               <h3 className="text-lg font-black uppercase tracking-tighter leading-none">{u.full_name}</h3>
                               <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold mt-1.5">{u.tier || 'Free Access'}</p>
                            </div>
                         </div>
                         <button className="p-3 bg-white/5 rounded-2xl hover:bg-brand-coral hover:text-black transition-all">
                            <MoreVertical size={16} />
                         </button>
                      </div>

                      <div className="space-y-5">
                         <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-[7px] uppercase tracking-widest font-black text-white/20">
                               <span>Matrix Signal</span>
                               <span className="text-brand-coral">84% Synced</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-coral w-[84%] shadow-glow-coral" />
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <button className="flex-1 py-3 bg-brand-coral/10 text-brand-coral rounded-xl text-[8px] uppercase tracking-[0.2em] font-black border border-brand-coral/20 hover:bg-brand-coral hover:text-black transition-all">Training Log</button>
                            <button className="flex-1 py-3 bg-white/5 text-white/40 rounded-xl text-[8px] uppercase tracking-[0.2em] font-black border border-white/10 hover:border-white/20 transition-all">Notes</button>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="col-span-full py-20 text-center card-gradient border-dashed border border-white/5 rounded-[3rem]">
                      <Users size={48} className="mx-auto text-white/5 mb-6 animate-pulse" />
                      <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black">No managed nodes detected in your scope.</p>
                   </div>
                 )}
               </div>
            </motion.div>
          ) : activeTab === 'programs' ? (
            <motion.div 
              key="programs" 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Your Active Protocols</h2>
                  <button className="flex items-center gap-3 px-8 py-4 bg-brand-coral text-black rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black shadow-glow-coral hover:scale-105 transition-all">
                     <Plus size={18} /> Initialize New Protocol
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {programs.map((p, i) => (
                   <div key={p.id} className="card-gradient p-10 border border-white/5 rounded-[3rem] hover:border-brand-coral/30 transition-all group cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-brand-coral opacity-20 group-hover:opacity-100 transition-all" />
                      
                      <div className="flex justify-between items-start mb-10">
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                               <span className={`px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.status === 'published' ? 'text-brand-coral border border-brand-coral/20' : 'text-white/20'}`}>
                                  {p.status}
                               </span>
                               <span className="text-[8px] uppercase font-bold text-white/20 tracking-[0.3em]">{p.difficulty}</span>
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-brand-coral transition-colors">{p.title}</h3>
                         </div>
                         <div className="p-3 bg-white/5 rounded-2xl text-white/20 group-hover:text-brand-coral transition-colors">
                            <PlayCircle size={24} />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-10 pt-8 border-t border-white/5">
                         <div>
                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Total Transmissions</p>
                            <p className="text-xl font-black tracking-tighter mt-1">{p.video_ids?.length || 0} Modules</p>
                         </div>
                         <div>
                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Temporal Length</p>
                            <p className="text-xl font-black tracking-tighter mt-1">{p.duration_weeks || 4} Cycles</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between text-brand-coral">
                         <span className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            View Protocol Intel <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                         </span>
                         <CheckCircle size={18} className="opacity-20 group-hover:animate-pulse group-hover:opacity-100 transition-all" />
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          ) : (
             <motion.div 
               key="metrics" 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="flex flex-col items-center justify-center py-40 card-gradient border-dashed border border-white/5 rounded-[4rem] text-center space-y-8"
             >
                <div className="w-24 h-24 rounded-full bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral border-glow-brand-coral shadow-glow-coral animate-bounce">
                   <TrendingUp size={48} />
                </div>
                <div className="space-y-4">
                   <h2 className="text-4xl font-black uppercase tracking-tighter">Yield Protocol Phase 2</h2>
                   <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black max-w-sm mx-auto leading-relaxed italic italic-glow-brand-coral">
                      Operational metrics are currently undergoing high-level encryption. Authorized analytics will be available in the next deployment cycle.
                   </p>
                </div>
                <button className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.6em] font-black text-white/20 hover:text-white hover:bg-white/10 transition-all">Scan Network</button>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
