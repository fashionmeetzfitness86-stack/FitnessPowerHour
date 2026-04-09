import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, Calendar as CalendarIcon, CheckCircle, Clock, Edit2, Plus, X, User } from 'lucide-react';

export const RequestsManager = ({ 
  requests, 
  users = [],
  onUpdateStatus, 
  onSchedule,
  onSaveRequest,
  showToast 
}: { 
  requests: any[], 
  users?: any[],
  onUpdateStatus: (id: string, status: string) => void,
  onSchedule: (req: any) => void,
  onSaveRequest: (req: any) => void,
  showToast: any 
}) => {
  const [filter, setFilter] = useState('All');
  const [editingRequest, setEditingRequest] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'contacted': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status?.toLowerCase()) {
       case 'pending': return 'Pending';
       case 'contacted': return 'Contacted';
       case 'scheduled': return 'Scheduled';
       case 'completed': return 'Completed';
       case 'cancelled': return 'Cancelled';
       default: return (status || 'UNKNOWN').toUpperCase();
    }
  }

  const parseNotes = (notes: string) => {
    if (!notes) return { name: 'Unknown', email: '', phone: '', message: '' };
    return {
      name: notes.match(/Name:\s([^|]+)/)?.[1]?.trim() || 'Admin Manual Entry',
      email: notes.match(/Email:\s([^|]+)/)?.[1]?.trim() || '',
      phone: notes.match(/Phone:\s([^|]+)/)?.[1]?.trim() || '',
      message: notes.match(/Message:\s(.+)/)?.[1]?.trim() || notes.match(/Msg:\s(.+)/)?.[1]?.trim() || notes
    };
  };

  const sortedRequests = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filteredRequests = filter === 'All' ? sortedRequests : sortedRequests.filter(r => r.status?.toLowerCase() === filter.toLowerCase());

  const handleSaveEdit = () => {
    onSaveRequest(editingRequest);
    setEditingRequest(null);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Requests Control Center</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
             Manage, Schedule, and Manually Book Service Requests
          </p>
        </div>
        
        <div className="flex gap-4">
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

          <button 
            onClick={() => setEditingRequest({ service_type: 'Personal Training', status: 'pending' })}
            className="px-6 py-2 bg-brand-teal text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-glow-teal"
          >
            <Plus size={14} /> Add Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {filteredRequests.map((req) => {
          const details = parseNotes(req.notes);
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
              
              <div className={`p-6 border-b border-white/5 ${isHighPriority ? 'pt-8' : ''} relative`}>
                 <button onClick={() => setEditingRequest(req)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"><Edit2 size={14} /></button>

                 <div className="flex justify-between items-start mb-4">
                    <select
                        value={req.status}
                        onChange={(e) => onUpdateStatus(req.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${getStatusColor(req.status)} appearance-none outline-none cursor-pointer pr-4`}
                    >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                 </div>

                 <h3 className="text-xl font-black uppercase tracking-tight pr-8">{details.name}</h3>
                 <p className="text-[11px] text-brand-teal font-bold uppercase tracking-widest mt-1">
                    {req.service_type || 'Training'}
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
                       <p className="text-white/40 uppercase tracking-widest font-bold text-[9px] mb-1">Booking Window</p>
                       <p className="font-bold">{req.requested_date || 'No Date'} @ {req.requested_time || 'Any'}</p>
                    </div>
                 </div>

                 <div className="p-4 bg-black/40 rounded-xl border border-white/5 mt-4">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white/40 mb-2">Message</p>
                    <p className="text-sm italic text-white/80 leading-relaxed">"{details.message}"</p>
                 </div>
              </div>

              <div className="p-4 border-t border-white/5 grid grid-cols-2 gap-2 bg-black/80">
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
                      <CalendarIcon size={12} /> Confirm & Schedule
                   </button>
                 ) : (
                    <div className="py-3 px-2 flex items-center justify-center">
                       <span className={`text-[10px] uppercase font-bold text-white/20 ${req.status === 'completed' ? 'text-emerald-500/50' : ''}`}>
                          {req.status === 'completed' ? 'Done' : 'Scheduled'}
                       </span>
                    </div>
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

      {/* Editor Modal */}
      <AnimatePresence>
        {editingRequest && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0a0a0a] border border-brand-teal/20 p-8 rounded-3xl w-full max-w-xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
               <button onClick={() => setEditingRequest(null)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
               </button>
               
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 text-brand-teal">
                  {editingRequest.id ? 'Edit Request' : 'Manual Booking'}
               </h3>

               <div className="space-y-6">
                  {!editingRequest.id && (
                     <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Select User</label>
                        <select 
                           value={editingRequest.user_id || ''} 
                           onChange={e => setEditingRequest({...editingRequest, user_id: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none"
                        >
                           <option value="">-- Choose Assigned User --</option>
                           {users?.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                        </select>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Service Type</label>
                        <select 
                           value={editingRequest.service_type || 'Personal Training'} 
                           onChange={e => setEditingRequest({...editingRequest, service_type: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none"
                        >
                           <option value="Personal Training">Personal Training</option>
                           <option value="Assisted Stretching">Assisted Stretching</option>
                           <option value="Recovery Session">Recovery Session</option>
                           <option value="Nutrition Consultation">Nutrition Consultation</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Status</label>
                        <select 
                           value={editingRequest.status || 'pending'} 
                           onChange={e => setEditingRequest({...editingRequest, status: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none"
                        >
                           <option value="pending">Pending</option>
                           <option value="scheduled">Scheduled</option>
                           <option value="completed">Completed</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Target Date</label>
                        <input type="date" value={editingRequest.requested_date || ''} onChange={e => setEditingRequest({...editingRequest, requested_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none" />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Fixed Time</label>
                        <select value={editingRequest.requested_time || '12:00:00'} onChange={e => setEditingRequest({...editingRequest, requested_time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none">
                           <option value="09:00:00">9:00 AM</option>
                           <option value="11:00:00">11:00 AM</option>
                           <option value="13:00:00">1:00 PM</option>
                           <option value="15:00:00">3:00 PM</option>
                           <option value="17:00:00">5:00 PM</option>
                           <option value="19:00:00">7:00 PM</option>
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Admin Notes / Overrides</label>
                     <textarea rows={3} value={editingRequest.notes || ''} onChange={e => setEditingRequest({...editingRequest, notes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none" />
                  </div>

                  <button 
                     onClick={handleSaveEdit}
                     disabled={!editingRequest.id && !editingRequest.user_id}
                     className="w-full py-4 bg-brand-teal text-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:shadow-glow-teal transition-all disabled:opacity-50"
                  >
                     Save Request
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
