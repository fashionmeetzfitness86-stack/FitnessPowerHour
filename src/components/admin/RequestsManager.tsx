import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Calendar, CheckCircle, XCircle, Clock, ArrowRight, User } from 'lucide-react';

export const RequestsManager = ({ 
  requests, 
  onUpdateStatus, 
  onSchedule,
  showToast 
}: { 
  requests: any[], 
  onUpdateStatus: (id: string, status: string) => void,
  onSchedule: (req: any) => void,
  showToast: any 
}) => {
  const [filter, setFilter] = useState('All');

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'contacted': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status.toLowerCase()) {
       case 'pending': return 'Pending';
       case 'contacted': return 'Contacted';
       case 'scheduled': return 'Scheduled';
       case 'completed': return 'Completed';
       case 'cancelled': return 'Cancelled';
       default: return status.toUpperCase();
    }
  }

  const parseNotes = (notes: string) => {
    if (!notes) return { name: 'Unknown', email: '', phone: '', message: '' };
    return {
      name: notes.match(/Name:\s([^|]+)/)?.[1]?.trim() || 'Unknown',
      email: notes.match(/Email:\s([^|]+)/)?.[1]?.trim() || '',
      phone: notes.match(/Phone:\s([^|]+)/)?.[1]?.trim() || '',
      message: notes.match(/Msg:\s(.+)/)?.[1]?.trim() || notes
    };
  };

  const sortedRequests = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filteredRequests = filter === 'All' ? sortedRequests : sortedRequests.filter(r => r.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Requests Control Center</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
             Action requests in under 30 seconds. Click to contact or schedule.
          </p>
        </div>
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl">
           {['All', 'Pending', 'Scheduled', 'Completed'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredRequests.map((req) => {
          const details = parseNotes(req.notes);
          // Highlight priority if the user is asking intensely
          const isHighPriority = details.message.toLowerCase().includes('asap') || details.message.toLowerCase().includes('urgent');

          return (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 border border-white/10 hover:border-white/30 rounded-3xl overflow-hidden flex flex-col transition-all relative"
            >
              {isHighPriority && (
                 <div className="absolute top-0 left-0 w-full bg-brand-coral/20 border-b border-brand-coral/50 py-1 text-center">
                    <span className="text-[8px] uppercase tracking-[0.2em] font-black text-brand-coral">🔥 High Priority Match</span>
                 </div>
              )}
              
              <div className={`p-6 border-b border-white/5 ${isHighPriority ? 'pt-8' : ''}`}>
                 <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${getStatusColor(req.status)}`}>
                       {getStatusLabel(req.status)}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                 </div>

                 <h3 className="text-xl font-black uppercase tracking-tight">{details.name}</h3>
                 <p className="text-[11px] text-brand-teal font-bold uppercase tracking-widest mt-1">
                    {req.service_subtype === 'recovery' ? 'Flex Mob 305 Recovery' : '1-on-1 Training'}
                 </p>
              </div>

              <div className="p-6 space-y-4 flex-grow bg-white/[0.02]">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white/40 shrink-0"><User size={14} /></div>
                    <div className="text-[11px]">
                       <p className="text-white/40 uppercase tracking-widest font-bold text-[9px] mb-1">Contact Info</p>
                       <p className="font-mono">{details.phone || 'No phone provided'}</p>
                       <p className="font-mono text-white/60">{details.email}</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white/40 shrink-0"><Clock size={14} /></div>
                    <div className="text-[11px]">
                       <p className="text-white/40 uppercase tracking-widest font-bold text-[9px] mb-1">Preferred Time</p>
                       <p className="font-bold">{req.requested_date || 'No Date'} @ {req.requested_time || 'Any'}</p>
                    </div>
                 </div>

                 <div className="p-4 bg-black/40 rounded-xl border border-white/5 mt-4">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white/40 mb-2">Message</p>
                    <p className="text-sm italic text-white/80 leading-relaxed">"{details.message}"</p>
                 </div>
              </div>

              <div className="p-4 border-t border-white/5 grid grid-cols-2 gap-2 bg-black/80">
                 {/* Top row actions depending on status */}
                 <a 
                   href={details.phone ? `https://wa.me/${details.phone.replace(/[^0-9]/g, '')}` : `mailto:${details.email}`}
                   target="_blank" rel="noreferrer"
                   className="py-3 px-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors text-white"
                   onClick={() => onUpdateStatus(req.id, 'contacted')}
                 >
                    <Phone size={12} /> Contact
                 </a>

                 {req.status === 'pending' || req.status === 'contacted' ? (
                   <button 
                     onClick={() => onSchedule(req)}
                     className="py-3 px-2 bg-brand-teal text-black rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:scale-[1.02] transition-transform"
                   >
                      <Calendar size={12} /> Schedule
                   </button>
                 ) : req.status === 'scheduled' ? (
                   <button 
                     onClick={() => onUpdateStatus(req.id, 'completed')}
                     className="py-3 px-2 bg-emerald-500 text-black rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-transform"
                   >
                     <CheckCircle size={12} /> Complete
                   </button>
                 ) : (
                    <div className="py-3 px-2 flex items-center justify-center">
                       <span className="text-[10px] uppercase font-bold text-white/40 opacity-50">&mdash; Done &mdash;</span>
                    </div>
                 )}

                 {req.status !== 'cancelled' && req.status !== 'completed' && (
                    <button 
                      onClick={() => onUpdateStatus(req.id, 'cancelled')}
                      className="col-span-2 py-2 mt-1 text-[9px] uppercase font-bold tracking-widest text-white/20 hover:text-red-400 transition-colors"
                    >
                      Cancel Request
                    </button>
                 )}
              </div>
            </motion.div>
          );
        })}

        {filteredRequests.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <CheckCircle size={32} className="mx-auto text-white/10 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-white/40">Zero Pending Requests</p>
              <p className="text-xs text-white/20 mt-1">You are completely caught up.</p>
           </div>
        )}
      </div>
    </div>
  );
};
