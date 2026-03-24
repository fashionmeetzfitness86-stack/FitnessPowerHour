import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Plus, Check, X, 
  Trash2, Edit2, Users, Calendar,
  Globe, ShieldCheck, Mail
} from 'lucide-react';
import { Retreat, RetreatApplication } from '../../types';

interface RetreatManagerProps {
  retreats: Retreat[];
  applications: RetreatApplication[];
  onAdd: () => void;
  onReview: (id: string, status: 'accepted' | 'declined') => void;
  onDelete: (id: string) => void;
}

export const RetreatManager = ({ 
  retreats, applications, onAdd, onReview, onDelete 
}: RetreatManagerProps) => {
  return (
    <div className="space-y-16 fade-in">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Venture <span className="text-brand-coral">Management</span></h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage global retreats, Miami events, and applications flow.</p>
          </div>
          <button 
            onClick={onAdd}
            className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all transform hover:-translate-y-1"
          >
            <Plus size={18} /> Initialize Retreat
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {retreats.map((retreat, i) => (
            <motion.div 
              key={retreat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-gradient group relative overflow-hidden flex flex-col md:flex-row border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2rem]"
            >
              <div className="md:w-56 relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={retreat.cover_image} 
                  alt={retreat.title} 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-black/0 to-brand-black/20" />
              </div>
              <div className="flex-1 p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-brand-teal mb-2">
                        <MapPin size={12} />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">{retreat.location}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">
                        {retreat.title}
                      </h3>
                    </div>
                    <span className="text-xl font-bold font-mono text-white/80">${retreat.price}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-light line-clamp-2">
                    {retreat.description || "An elite fitness experience meticulously designed for peak performance and total recovery."}
                  </p>
                </div>
                
                      <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold mb-0.5">Visibility</span>
                      <span className={`text-[9px] uppercase tracking-widest font-black ${retreat.visibility_status === 'published' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {retreat.visibility_status}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-4">
                      <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold mb-0.5">Availability</span>
                      <span className={`text-[9px] uppercase tracking-widest font-black ${retreat.is_sold_out ? 'text-brand-coral' : 'text-emerald-500'}`}>
                        {retreat.is_sold_out ? 'Sold Out' : 'Slots Open'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(retreat.id)}
                      className="p-3 bg-white/5 hover:bg-brand-coral/20 rounded-xl text-white/40 hover:text-brand-coral transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {retreats.length === 0 && (
            <div className="col-span-full py-24 text-center card-gradient rounded-[3rem] border-dashed border-2 border-white/5">
              <Globe size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Waiting for new expeditions...</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <ShieldCheck size={24} className="text-brand-teal" />
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Applicant <span className="text-brand-teal">Queue</span></h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold font-mono">Pending verification for elite membership experiences.</p>
          </div>
        </div>

        <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Applicant Information</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Retreat Destination</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Decision Status</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal font-black text-xs">
                          {app.user_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors">{app.user_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail size={10} className="text-white/20" />
                            <p className="text-[10px] text-white/20 font-mono italic">{app.user_email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                          {retreats.find(r => r.id === app.retreat_id)?.title || 'UNKNOWN'}
                        </span>
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold mt-0.5 leading-none italic">
                          Target Booking
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[8px] tracking-[0.2em] font-black uppercase px-3 py-1.5 rounded-lg border ${
                        app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                        app.status === 'declined' ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {app.status === 'pending' ? (
                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => onReview(app.id, 'accepted')}
                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
                            title="Accept Applicant"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => onReview(app.id, 'declined')}
                            className="p-2.5 rounded-xl bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black transition-all shadow-xl"
                            title="Decline Applicant"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[8px] uppercase tracking-widest text-white/10 font-bold italic">Decision Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <Users size={32} className="mx-auto text-white/5 mb-4" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-black italic">Queue Clear: No pending applications</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
