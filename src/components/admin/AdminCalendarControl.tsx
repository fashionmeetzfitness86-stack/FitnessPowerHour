import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, CheckCircle2, XCircle, Search, Edit2, Users } from 'lucide-react';
import { CalendarSession, ServiceRequest, ServiceAvailability, UserProfile } from '../../types';

interface AdminCalendarControlProps {
  sessions: CalendarSession[];
  requests: ServiceRequest[];
  availability: ServiceAvailability[];
  users: UserProfile[];
  onApproveRequest: (id: string, providerId?: string) => void;
  onRejectRequest: (id: string) => void;
  onAddAvailability: (data: Partial<ServiceAvailability>) => void;
  onUpdateSessionStatus: (id: string, status: CalendarSession['status']) => void;
}

export const AdminCalendarControl = ({
  sessions, requests, availability, users,
  onApproveRequest, onRejectRequest, onAddAvailability, onUpdateSessionStatus
}: AdminCalendarControlProps) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'availability'>('requests');
  const [search, setSearch] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter">Operational <span className="text-brand-coral">Calendar</span></h2>
           <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage requests. Construct availability matrices. Log execution.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          <button onClick={() => setActiveTab('requests')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'requests' ? 'bg-brand-coral text-black shadow-[0_0_20px_rgba(251,113,133,0.3)]' : 'text-white/40 hover:text-white'}`}>Pending Requests ({pendingRequests.length})</button>
          <button onClick={() => setActiveTab('calendar')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'calendar' ? 'bg-brand-teal text-black shadow-glow-teal' : 'text-white/40 hover:text-white'}`}>All Bookings</button>
          <button onClick={() => setActiveTab('availability')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'availability' ? 'bg-white text-black shadow-glow-white' : 'text-white/40 hover:text-white'}`}>Set Availability</button>
        </div>
      </div>

      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {pendingRequests.map(req => {
               const u = users.find(user => user.id === req.user_id);
               return (
                 <div key={req.id} className="card-gradient rounded-3xl p-6 border border-brand-coral/20 hover:border-brand-coral/50 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[8px] bg-brand-coral/10 text-brand-coral px-2 py-0.5 rounded uppercase tracking-widest font-bold border border-brand-coral/20">Pending Authorization</span>
                       <span className="text-[10px] font-mono tracking-widest text-white/40">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">{req.service_subtype.replace('_', ' ')}</h3>
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-4 tracking-widest">{req.service_type.replace('_', ' ')}</p>
                    
                    <div className="bg-white/5 rounded-xl p-4 space-y-3 mb-6">
                       <div className="flex items-center gap-3">
                          <Users size={14} className="text-white/20" />
                          <span className="text-xs font-bold">{u?.full_name || u?.email}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-white/20" />
                          <span className="text-xs font-mono">{req.requested_date}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Clock size={14} className="text-white/20" />
                          <span className="text-xs font-mono">{req.requested_time}</span>
                       </div>
                    </div>

                    <div className="mt-auto flex gap-3">
                       <button onClick={() => onApproveRequest(req.id)} className="flex-1 py-3 bg-brand-teal text-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all flex justify-center items-center gap-2">
                          <CheckCircle2 size={14} /> Approve
                       </button>
                       <button onClick={() => onRejectRequest(req.id)} className="p-3 bg-white/5 text-brand-coral rounded-xl hover:bg-brand-coral hover:text-black transition-all">
                          <XCircle size={18} />
                       </button>
                    </div>
                 </div>
               )
             })}
           </div>
           {pendingRequests.length === 0 && (
              <div className="py-24 text-center border-dashed border border-white/10 rounded-3xl text-white/20">
                 <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50 text-brand-teal" />
                 <p className="text-[10px] uppercase tracking-[0.2em] font-black">All requests have been authorized or purged.</p>
              </div>
           )}
        </motion.div>
      )}

      {activeTab === 'calendar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input type="text" placeholder="Search operational ledger by title..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors text-white max-w-md" />
           </div>
           
           <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                       <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Node</th>
                       <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Event Type</th>
                       <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Time Vector</th>
                       <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredSessions.map(sess => {
                       const u = users.find(user => user.id === sess.user_id);
                       return (
                          <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="px-6 py-4">
                                <p className="text-sm font-bold tracking-tight">{u?.full_name}</p>
                                <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">{u?.email}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-sm font-bold uppercase tracking-tighter text-brand-teal">{sess.title}</p>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{sess.source_type}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-[10px] font-mono tracking-widest text-white/60">{sess.session_date}</p>
                                <p className="text-[10px] font-mono tracking-widest text-white/40">{sess.session_time || 'ALL DAY'} | {sess.duration_minutes}m</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <select 
                                  value={sess.status}
                                  onChange={e => onUpdateSessionStatus(sess.id, e.target.value as any)}
                                  className={`text-[8px] px-3 py-1.5 rounded font-black uppercase tracking-widest border outline-none cursor-pointer appearance-none ${
                                    sess.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                    sess.status === 'approved' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' : 
                                    sess.status === 'cancelled' ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/20' : 
                                    'bg-white/10 text-white/60 border-white/20'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="missed">Missed</option>
                                </select>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </motion.div>
      )}

      {activeTab === 'availability' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-x-6 flex">
           {/* Form for new availability */}
           <div className="w-1/3 card-gradient p-6 border border-white/5 rounded-3xl h-fit">
              <h3 className="text-lg font-black uppercase tracking-tight mb-1">Set Availability</h3>
              <p className="text-[10px] tracking-widest text-white/40 mb-6 uppercase">Define operational boundaries.</p>
              
              <form onSubmit={e => { e.preventDefault(); /* construct and trigger onAddAvailability */ }} className="space-y-4 flex flex-col">
                 <input required type="date" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-brand-teal font-mono" />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="time" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-brand-teal font-mono" />
                    <input required type="time" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-brand-teal font-mono" />
                 </div>
                 <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-brand-teal uppercase text-[10px] font-black tracking-widest appearance-none">
                    <option value="global">Global Space</option>
                    <option value="flex_mob">Flex Mob 305</option>
                    <option value="personal_training">1-on-1 Protocol</option>
                 </select>
                 <button type="submit" className="w-full py-4 mt-2 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-brand-teal transition-all">
                    Register Availability
                 </button>
              </form>
           </div>
           
           <div className="w-2/3 space-y-4">
              {availability.map(avail => (
                 <div key={avail.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                          <Clock size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight">{avail.service_type === 'global' ? 'Global Block' : avail.service_type}</p>
                          <p className="text-[10px] font-mono tracking-widest text-white/40">{avail.available_date} | {avail.start_time} - {avail.end_time}</p>
                       </div>
                    </div>
                    <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-1 rounded font-black uppercase tracking-widest border border-brand-teal/20">{avail.status}</span>
                 </div>
              ))}
           </div>
        </motion.div>
      )}
    </div>
  );
};
