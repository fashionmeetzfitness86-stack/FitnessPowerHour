import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, UserPlus, Edit2, 
  Trash2, Star, Activity, Link
} from 'lucide-react';
import { Athlete, Program, Video } from '../../types';

interface AthleteManagerProps {
  athletes: Athlete[];
  programs: Program[];
  videos: Video[];
  onAdd: () => void;
  onEdit: (athlete: Athlete) => void;
  onDelete: (id: string) => void;
}

export const AthleteManager = ({ 
  athletes, programs, videos, 
  onAdd, onEdit, onDelete 
}: AthleteManagerProps) => {
  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Athlete <span className="text-brand-coral">Roster</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage coaches, pro athletes, and brand ambassadors.</p>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all transform hover:-translate-y-1"
        >
          <UserPlus size={18} /> Recruit Athlete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {athletes.map((athlete, i) => (
          <motion.div 
            key={athlete.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient group relative overflow-hidden flex flex-col h-full border border-white/5 hover:border-brand-teal/30 transition-all rounded-3xl"
          >
            {/* Dynamic Card Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-teal/20 transition-all duration-700" />
            
            <div className="p-8 space-y-6 flex-grow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 p-1 border border-white/10 group-hover:border-brand-teal/50 transition-all duration-500 overflow-hidden shadow-2xl relative">
                    {athlete.image_url ? (
                      <img src={athlete.image_url} alt={athlete.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-teal font-black text-2xl uppercase">
                        {athlete.name[0]}
                      </div>
                    )}
                    {!athlete.is_active && (
                      <div className="absolute inset-0 bg-brand-black/80 flex items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-brand-coral border border-brand-coral/50 px-2 py-1 rounded rotate-12">Inactive</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{athlete.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5 line-clamp-1">
                      {athlete.specialties.map((s, idx) => (
                        <span key={idx} className="text-[8px] uppercase tracking-widest text-white/30 font-bold underline underline-offset-4 decoration-white/10">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 scale-90 -mr-2">
                  <button onClick={() => onEdit(athlete)} className="p-2.5 bg-white/5 hover:bg-brand-teal hover:text-black rounded-xl text-white/40 transition-all shadow-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(athlete.id)} className="p-2.5 bg-white/5 hover:bg-brand-coral hover:text-black rounded-xl text-white/40 transition-all shadow-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                <div className="text-center space-y-1">
                  <p className="text-lg font-mono font-bold text-white tracking-tighter">{programs.filter(p => p.athlete_id === athlete.id).length}</p>
                  <p className="text-[7px] uppercase tracking-widest text-white/40 font-bold">Programs</p>
                </div>
                <div className="text-center space-y-1 border-x border-white/5">
                  <p className="text-lg font-mono font-bold text-brand-teal tracking-tighter">{videos.filter(v => v.athlete_id === athlete.id).length}</p>
                  <p className="text-[7px] uppercase tracking-widest text-white/40 font-bold">Videos</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-mono font-bold text-white tracking-tighter">{athlete.is_active ? 'LIVE' : 'OFF'}</p>
                  <p className="text-[7px] uppercase tracking-widest text-white/40 font-bold">Status</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-brand-teal" />
                  <p className="text-[10px] uppercase font-bold tracking-tight text-white/80">Bio & Performance</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-3 font-light italic">"{athlete.bio || 'Professional FMF coach and brand ambassador focusing on functional movement and peak performance.'}"</p>
              </div>
            </div>

            <div className="px-8 pb-8 pt-2 flex gap-3 mt-auto">
              <button className="flex-1 py-3 bg-white/5 group-hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all border border-transparent hover:border-brand-teal/20 flex items-center justify-center gap-2">
                <Star size={12} className="text-brand-teal" /> Pro Stats
              </button>
              <button className="flex-1 py-3 bg-white/5 group-hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all border border-transparent hover:border-brand-teal/20 flex items-center justify-center gap-2">
                <Link size={12} className="text-brand-teal" /> Socials
              </button>
            </div>
          </motion.div>
        ))}
        {athletes.length === 0 && (
          <div className="col-span-full py-32 text-center card-gradient border-dashed border-2 border-white/5 rounded-[3rem]">
            <Trophy size={64} className="mx-auto text-white/5 mb-6 animate-pulse" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">No Athletes Found</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2">Begin building your roster by recruiting your first athlete.</p>
          </div>
        )}
      </div>
    </div>
  );
};
