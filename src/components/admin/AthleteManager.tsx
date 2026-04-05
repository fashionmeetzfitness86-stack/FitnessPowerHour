import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, UserPlus, Edit2, Check, X,
  Trash2, Star, Activity, Link, ShieldCheck, UserMinus, Search, Filter
} from 'lucide-react';
import { Athlete, AthleteApplication, Program, Video } from '../../types';

interface AthleteManagerProps {
  athletes: Athlete[];
  applications: AthleteApplication[];
  programs: Program[];
  videos: Video[];
  onReviewApplication: (application: AthleteApplication, status: 'approved' | 'rejected') => void;
  onEditAthlete: (athlete: Athlete) => void;
  onRemoveRole: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export const AthleteManager = ({ 
  athletes, applications, programs, videos, 
  onReviewApplication, onEditAthlete, onRemoveRole, onDeactivate 
}: AthleteManagerProps) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'applications'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const pendingApps = applications.filter(a => a.status === 'pending');
  
  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [athletes, searchQuery, filterCategory]);

  return (
    <div className="space-y-8 fade-in">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Athlete <span className="text-brand-coral">Management</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Control athlete privileges and review incoming applications.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'applications' ? 'bg-brand-coral text-black shadow-[0_0_20px_rgba(251,113,133,0.3)]' : 'text-white/40 hover:text-white'}`}
          >
            Applications {pendingApps.length > 0 && <span className="w-5 h-5 rounded-full bg-black text-brand-coral flex items-center justify-center border border-brand-coral">{pendingApps.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center ${activeTab === 'roster' ? 'bg-brand-teal text-black shadow-glow-teal' : 'text-white/40 hover:text-white'}`}
          >
            Live Roster
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SUBSECTION: APPLICATIONS */}
        {activeTab === 'applications' && (
          <motion.div 
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {pendingApps.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl space-y-4">
                <ShieldCheck size={48} className="mx-auto text-brand-teal opacity-50" />
                <h3 className="text-xl font-bold uppercase tracking-tighter">No Pending Applications</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40">The applicant pool is currently clear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingApps.map(app => (
                  <div key={app.id} className="card-gradient rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-white mb-1">{app.name}</h4>
                          <a href={`mailto:${app.email}`} className="text-[10px] text-white/40 uppercase tracking-widest font-bold tracking-widest hover:text-brand-coral transition-colors">{app.email}</a>
                        </div>
                        <span className="text-[8px] bg-brand-coral/10 text-brand-coral px-3 py-1 rounded font-black uppercase tracking-widest border border-brand-coral/20">
                          {app.category}
                        </span>
                      </div>
                      
                      <div className="space-y-2 py-4 border-y border-white/5">
                         <div className="text-xs text-white/60 italic leading-relaxed line-clamp-3">
                           "{app.bio}"
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            {app.social_links?.instagram && <a href={`https://instagram.com/${app.social_links.instagram}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-teal hover:underline tracking-widest uppercase font-bold">IG: @{app.social_links.instagram}</a>}
                            <span className="text-[10px] text-white/20">|</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{app.experience}</span>
                         </div>
                      </div>

                      <div className="flex gap-2">
                        {app.images?.length > 0 && (
                          <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-widest font-bold font-mono border border-white/10">📷 {app.images.length} Images</div>
                        )}
                        {app.videos?.length > 0 && (
                          <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-widest font-bold font-mono border border-white/10">🎥 {app.videos.length} Videos</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-4">
                      <button 
                        onClick={() => onReviewApplication(app, 'approved')}
                        className="flex-1 py-3 bg-brand-teal text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
                      >
                         <Check size={14} /> Approve Role
                      </button>
                      <button 
                        onClick={() => onReviewApplication(app, 'rejected')}
                        className="py-3 px-4 bg-white/5 text-white/40 hover:bg-brand-coral hover:text-black hover:border-transparent rounded-xl transition-all border border-white/10"
                      >
                         <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {applications.filter(a => a.status !== 'pending').length > 0 && (
               <div className="pt-12">
                  <h4 className="text-xs uppercase tracking-[0.2em] font-black text-white/20 mb-6 border-b border-white/5 pb-4">Application History</h4>
                  <div className="space-y-2">
                     {applications.filter(a => a.status !== 'pending').slice(0, 5).map(app => (
                        <div key={app.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                           <div className="flex items-center gap-4">
                              <span className={`w-2 h-2 rounded-full ${app.status === 'approved' ? 'bg-brand-teal' : 'bg-brand-coral'}`} />
                              <span className="text-sm font-bold tracking-tight">{app.name}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest">{app.category}</span>
                           </div>
                           <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </motion.div>
        )}

        {/* SUBSECTION: ROSTER */}
        {activeTab === 'roster' && (
          <motion.div 
            key="roster"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search roster..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors text-white"
                 />
              </div>
              <select 
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white outline-none cursor-pointer"
              >
                 <option value="All">All Categories</option>
                 <option value="calisthenics">Calisthenics</option>
                 <option value="yoga">Yoga</option>
                 <option value="recovery">Recovery</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAthletes.map((athlete, i) => (
                <div key={athlete.id} className="card-gradient group relative overflow-hidden flex flex-col h-full border border-white/5 hover:border-brand-teal/30 transition-all rounded-3xl p-6">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-teal/20 transition-all duration-700 pointer-events-none" />
                   
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                            {athlete.images?.[0] ? 
                              <img src={athlete.images[0]} alt={athlete.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> :
                              <div className="w-full h-full bg-white/5 flex items-center justify-center text-brand-teal text-xl font-black">{athlete.name[0]}</div>
                            }
                         </div>
                         <div>
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none group-hover:text-brand-teal transition-colors break-words">{athlete.name}</h3>
                            <span className="text-[9px] uppercase tracking-widest text-brand-coral font-bold mt-1 inline-block">{athlete.category}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => onEditAthlete(athlete)} className="text-white/20 hover:text-brand-teal transition-colors">
                           <Edit2 size={16} />
                         </button>
                      </div>
                   </div>

                   <div className="space-y-4 mb-6 flex-grow">
                      <p className="text-xs text-white/40 leading-relaxed italic line-clamp-2">"{athlete.bio}"</p>
                      <div className="grid grid-cols-2 gap-2 border-y border-white/5 py-4">
                        <div className="text-center">
                          <p className="text-xl font-black font-mono tracking-tighter">{programs.filter(p => p.athlete_id === athlete.id).length}</p>
                          <p className="text-[7px] uppercase font-bold tracking-widest text-white/40">Programs</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                          <p className="text-xl font-black font-mono tracking-tighter text-brand-teal">{athlete.status === 'active' ? 'ON' : 'OFF'}</p>
                          <p className="text-[7px] uppercase font-bold tracking-widest text-white/40">Status</p>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-3 mt-auto">
                     <button 
                       onClick={() => onDeactivate(athlete.id)}
                       className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${athlete.status === 'active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                     >
                       {athlete.status === 'active' ? 'Deactivate' : 'Activate'}
                     </button>
                     <button 
                       onClick={() => onRemoveRole(athlete.user_id)}
                       className="py-2.5 px-4 rounded-xl text-brand-coral bg-brand-coral/10 hover:bg-brand-coral hover:text-black transition-all border border-brand-coral/20 flex items-center justify-center"
                       title="Revoke Athlete Role"
                     >
                        <UserMinus size={14} />
                     </button>
                   </div>
                </div>
              ))}
            </div>
            
            {filteredAthletes.length === 0 && (
               <div className="py-24 text-center border-dashed border border-white/10 rounded-3xl">
                  <UserPlus size={48} className="mx-auto text-white/10 mb-4" />
                  <h3 className="text-xl font-bold uppercase tracking-tighter">No Athletes Found</h3>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
