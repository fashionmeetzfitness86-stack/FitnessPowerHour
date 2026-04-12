import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle, 
  MapPin, Shield, Zap, Search, User, X, MessageSquare, AlertCircle, Plus
} from 'lucide-react';
import { supabase } from '../../supabase';

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  service_subtype: string;
  requested_date: string;
  requested_time: string;
  status: string;
  assigned_provider_user_id?: string;
  notes?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  fitness_level?: string;
  workout_style?: string;
  training_goals?: string;
  current_injuries?: string;
  profile_image?: string;
  tier?: string;
  streak_count?: number;
}

export const RequestsManager = ({ 
  requests, 
  users, 
  onUpdateStatus, 
  showToast,
  onRequestCreated
}: { 
  requests: ServiceRequest[], 
  users: UserProfile[],
  onUpdateStatus: (id: string, status: string) => void,
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void,
  onRequestCreated?: (req: any) => void
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingRequest, setViewingRequest] = useState<ServiceRequest | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', phone: '',
    service_type: 'Stretching', service_subtype: 'FlexMob305',
    date: '', time: '', amount: 0, notes: ''
  });

  const handleCreateSubmit = async () => {
    setCreateSubmitting(true);
    let user_id = null;
    const existing = users.find(u => u.email?.toLowerCase() === createForm.email?.toLowerCase());
    if (existing) user_id = existing.id;

    try {
      const payload = {
        user_id: user_id,
        guest_name: user_id ? null : createForm.name,
        guest_email: user_id ? null : createForm.email,
        guest_phone: user_id ? null : createForm.phone,
        service_type: createForm.service_type,
        service_subtype: createForm.service_subtype,
        amount_paid: createForm.amount,
        requested_date: createForm.date,
        requested_time: createForm.time,
        status: 'approved',
        notes: createForm.notes || 'Admin manual request'
      };
      
      const { data, error } = await supabase.from('service_requests').insert(payload).select().single();
      if (error) throw error;
      
      showToast('Request confirmed. Confirmation dispatched to ' + createForm.email + '.', 'success');
      
      if (user_id) {
        await supabase.from('notifications').insert({
             user_id: user_id,
             type: 'system',
             title: 'New Service Scheduled',
             message: `An admin booked you for ${createForm.service_subtype} on ${createForm.date} at ${createForm.time}.`,
             created_at: new Date().toISOString()
        });
      }

      if (onRequestCreated && data) {
         onRequestCreated(data);
      }
      setIsCreating(false);
      setCreateStep(1);
      setCreateForm({ name: '', email: '', phone: '', service_type: 'Stretching', service_subtype: 'FlexMob305', date: '', time: '', amount: 0, notes: '' });
    } catch (err) {
      showToast('Failed to create request', 'error');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'denied': return 'bg-brand-coral/10 text-brand-coral border-brand-coral/20';
      case 'unpaid': return 'bg-white/5 text-white/50 border-white/10';
      default: return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const u = users.find(u => u.id === req.user_id);
      const searchMatch = !search || 
        u?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        u?.email?.toLowerCase().includes(search.toLowerCase()) ||
        req.service_type?.toLowerCase().includes(search.toLowerCase());
      
      const statusMatch = filterStatus === 'All' || req.status === filterStatus.toLowerCase();
      
      return searchMatch && statusMatch;
    });
  }, [requests, users, search, filterStatus]);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    unpaid: requests.filter(r => r.status === 'unpaid').length,
    approved: requests.filter(r => r.status === 'approved' || r.status === 'completed').length
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Service <span className="text-brand-teal">Requests</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
            {stats.unpaid} unpaid · {stats.pending} pending · {stats.approved} approved
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-black text-[10px] uppercase font-black tracking-widest rounded-xl hover:scale-105 transition-all">
             <Plus size={14} /> Create Request
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search athlete or service..."
              className="pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs outline-none focus:border-brand-teal w-48 transition-all"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-teal transition-all"
          >
            {['All', 'Unpaid', 'Pending', 'Approved', 'Completed', 'Denied'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Athlete</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Service</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date & Time</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40 uppercase tracking-widest font-black text-xs">
                    No requests found matching filters.
                  </td>
                </tr>
              ) : filteredRequests.map(req => {
                const u = users.find(u => u.id === req.user_id);
                return (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal font-black text-xs">
                          {u?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-sm">{u?.full_name || 'Ghost Athlete'}</p>
                          <p className="text-[10px] text-white/30 font-mono">{u?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold uppercase">{req.service_subtype || 'Protocol'}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{req.service_type || 'General'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-white/70">
                          <CalendarIcon size={12} /> {req.requested_date}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                          <Clock size={10} /> {req.requested_time}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => onUpdateStatus(req.id, 'approved')}
                              className="p-2 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal hover:text-black rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button 
                              onClick={() => onUpdateStatus(req.id, 'denied')}
                              className="p-2 bg-brand-coral/10 text-brand-coral border border-brand-coral/20 hover:bg-brand-coral hover:text-black rounded-lg transition-all"
                              title="Deny"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && (
                           <button 
                              onClick={() => onUpdateStatus(req.id, 'completed')}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                           >
                             Mark Complete
                           </button>
                        )}
                        <button 
                          onClick={() => setViewingRequest(req)}
                          className="p-2 bg-white/5 hover:bg-white/20 text-white/40 hover:text-white border border-white/5 rounded-lg transition-all"
                          title="View Details"
                        >
                          <User size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Popup matching Calendar/CheckIn style */}
      {viewingRequest && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
           onClick={() => setViewingRequest(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button onClick={() => setViewingRequest(null)} className="absolute top-6 right-6 p-2 text-white/30 hover:text-brand-coral transition-colors rounded-full bg-white/5">
              <X size={18} />
            </button>
            
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
               <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex flex-col items-center justify-center text-brand-teal relative overflow-hidden">
                 {users.find(u => u.id === viewingRequest.user_id)?.profile_image ? (
                   <img src={users.find(u => u.id === viewingRequest.user_id)?.profile_image} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   <User size={24} />
                 )}
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {users.find(u => u.id === viewingRequest.user_id)?.full_name || 'Ghost Athlete'}
                  </h3>
                  <p className="text-xs text-brand-teal font-mono tracking-wider">{users.find(u => u.id === viewingRequest.user_id)?.email || '—'}</p>
               </div>
            </div>

            {/* Request Detail */}
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-2"><Zap size={10} /> Service</p>
                   <p className="font-bold text-sm text-brand-teal">{viewingRequest.service_subtype}</p>
                   <p className="text-xs text-white/40 mt-1 capitalize">{viewingRequest.service_type}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-2"><Clock size={10} /> Schedule window</p>
                   <p className="font-bold text-sm text-white">{viewingRequest.requested_date}</p>
                   <p className="text-xs text-white/40 mt-1">{viewingRequest.requested_time}</p>
                 </div>
               </div>

               {/* Athlete Meta */}
               <div>
                 <h4 className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-3 border-b border-white/5 pb-2">Athlete Intel</h4>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                   <div>
                     <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Phone</p>
                     <p className="text-xs font-mono text-white/70">{users.find(u => u.id === viewingRequest.user_id)?.phone || 'Not provided'}</p>
                   </div>
                   <div>
                     <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">City</p>
                     <p className="text-xs font-bold text-white/70 capitalize">{users.find(u => u.id === viewingRequest.user_id)?.city || 'Not provided'}</p>
                   </div>
                   <div>
                     <p className="text-[8px] text-brand-teal font-bold uppercase tracking-widest">Fitness Level</p>
                     <p className="text-xs font-black text-white capitalize">{users.find(u => u.id === viewingRequest.user_id)?.fitness_level || '—'}</p>
                   </div>
                   <div>
                     <p className="text-[8px] text-brand-teal font-bold uppercase tracking-widest">Workout Style</p>
                     <p className="text-xs font-black text-white capitalize">{users.find(u => u.id === viewingRequest.user_id)?.workout_style || '—'}</p>
                   </div>
                   <div className="col-span-2">
                     <p className="text-[8px] text-brand-coral font-bold uppercase tracking-widest">Current Injuries / Limitations</p>
                     <p className="text-xs font-bold text-white/80 bg-brand-coral/10 border border-brand-coral/20 p-2 rounded-lg mt-1">
                       {users.find(u => u.id === viewingRequest.user_id)?.current_injuries || 'None reported.'}
                     </p>
                   </div>
                   <div className="col-span-2">
                     <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Training Goals</p>
                     <p className="text-xs font-bold text-white/60 capitalize mt-1">
                       {users.find(u => u.id === viewingRequest.user_id)?.training_goals?.replace('_', ' ') || '—'}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Notes attached to the request */}
               {viewingRequest.notes && (
                 <div className="p-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5">
                   <h4 className="text-[9px] uppercase tracking-widest font-black text-brand-teal mb-2 flex items-center gap-2"><MessageSquare size={10} /> Request Notes</h4>
                   <p className="text-sm text-white/80 leading-relaxed font-light">{viewingRequest.notes}</p>
                 </div>
               )}
            </div>
            
            {/* Quick Actions at bottom */}
            <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
               {viewingRequest.status === 'pending' ? (
                 <>
                  <button 
                    onClick={() => { onUpdateStatus(viewingRequest.id, 'approved'); setViewingRequest(null); }}
                    className="flex-1 py-3 bg-brand-teal text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-glow-teal transition-all"
                  >
                    Approve Sync
                  </button>
                  <button 
                    onClick={() => { onUpdateStatus(viewingRequest.id, 'denied'); setViewingRequest(null); }}
                    className="flex-1 py-3 bg-brand-coral/10 text-brand-coral border border-brand-coral/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-coral hover:text-black transition-all"
                  >
                    Deny
                  </button>
                 </>
               ) : (
                 <button className="flex-1 py-3 bg-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-not-allowed border border-white/5">
                    Locked ({viewingRequest.status})
                 </button>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Create Request Wizard */}
      {isCreating && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 p-2 text-white/30 hover:text-brand-coral transition-colors rounded-full bg-white/5">
              <X size={18} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Create <span className="text-brand-teal">Request</span></h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-8">Step {createStep} of 3</p>

            {createStep === 1 && (
               <div className="space-y-4 fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                    <input autoFocus type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                    <input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Phone Number</label>
                    <input type="tel" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none" required />
                  </div>
                  <button disabled={!createForm.name || !createForm.email || !createForm.phone} onClick={() => setCreateStep(2)} className="w-full mt-4 bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-teal transition-all disabled:opacity-50">Next Step</button>
               </div>
            )}

            {createStep === 2 && (
               <div className="space-y-4 fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Service Category</label>
                    <select value={createForm.service_type} onChange={e => setCreateForm({...createForm, service_type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none">
                      <option value="Stretching">Stretching</option>
                      <option value="Massage">Massage</option>
                      <option value="Recovery">Recovery</option>
                      <option value="PersonalTraining">Personal Training</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Service Program</label>
                    <select value={createForm.service_subtype} onChange={e => setCreateForm({...createForm, service_subtype: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none">
                      <option value="FlexMob305">FlexMob 305</option>
                      <option value="1-on-1 Session">1-on-1 Session</option>
                      <option value="Group Class">Group Class</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount Pre-Paid / Cost ($)</label>
                    <input type="number" value={createForm.amount} onChange={e => setCreateForm({...createForm, amount: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none" />
                  </div>
                  <div className="flex gap-3 mt-4">
                     <button onClick={() => setCreateStep(1)} className="flex-1 bg-white/5 text-white/40 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Back</button>
                     <button onClick={() => setCreateStep(3)} className="flex-[2] bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-teal transition-all">Next Step</button>
                  </div>
               </div>
            )}

            {createStep === 3 && (
               <div className="space-y-4 fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Date</label>
                    <input type="date" value={createForm.date} onChange={e => setCreateForm({...createForm, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Time</label>
                    <input type="time" value={createForm.time} onChange={e => setCreateForm({...createForm, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Admin Notes (Optional)</label>
                    <input type="text" value={createForm.notes} onChange={e => setCreateForm({...createForm, notes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none" placeholder="e.g. VIP guest, requested specific trainer" />
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                     <button onClick={() => setCreateStep(2)} className="w-[100px] bg-white/5 text-white/40 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Back</button>
                     <button onClick={handleCreateSubmit} disabled={!createForm.date || !createForm.time || createSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-brand-teal text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-glow-teal disabled:opacity-50">
                        {createSubmitting ? 'Transmitting...' : 'Confirm Request'}
                     </button>
                  </div>
               </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
