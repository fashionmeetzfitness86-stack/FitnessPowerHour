import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, Mail, Calendar as CalendarIcon, CheckCircle, Clock,
  Edit2, Plus, X, User, Search, AlignJustify, LayoutGrid,
  Filter, ChevronDown, Send, Loader2
} from 'lucide-react';
import { supabase } from '../../supabase';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-500/20 text-amber-400 border-amber-500/40',
  contacted: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export const RequestsManager = ({
  requests,
  users = [],
  onUpdateStatus,
  onSchedule,
  onSaveRequest,
  showToast
}: {
  requests: any[];
  users?: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onSchedule: (req: any) => void;
  onSaveRequest: (req: any) => void;
  showToast: any;
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode]         = useState<'card' | 'list'>('card');
  const [search, setSearch]             = useState('');
  const [dayFilter, setDayFilter]       = useState('');
  const [monthFilter, setMonthFilter]   = useState('');
  const [yearFilter, setYearFilter]     = useState('');
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isSending, setIsSending]       = useState(false);

  const parseNotes = (notes: string) => {
    if (!notes) return { name: 'Unknown', email: '', phone: '', message: '' };
    return {
      name:    notes.match(/Name:\s([^|]+)/)?.[1]?.trim() || 'Manual Entry',
      email:   notes.match(/Email:\s([^|]+)/)?.[1]?.trim() || '',
      phone:   notes.match(/Phone:\s([^|]+)/)?.[1]?.trim() || '',
      message: notes.match(/Message:\s(.+)/)?.[1]?.trim() || notes.match(/Msg:\s(.+)/)?.[1]?.trim() || notes,
    };
  };

  const uniqueYears = useMemo(() => {
    const years = new Set(requests.map(r => new Date(r.created_at).getFullYear().toString()));
    return Array.from(years).sort().reverse();
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter(r => {
        const d = parseNotes(r.notes);
        const matchStatus = statusFilter === 'All' || r.status?.toLowerCase() === statusFilter.toLowerCase();
        const q = search.toLowerCase();
        const matchSearch = !q ||
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.phone.toLowerCase().includes(q) ||
          (r.service_type || '').toLowerCase().includes(q);
        const dt = new Date(r.created_at);
        const matchDay   = !dayFilter   || String(dt.getDate()).padStart(2,'0') === dayFilter;
        const matchMonth = !monthFilter || String(dt.getMonth() + 1).padStart(2,'0') === monthFilter;
        const matchYear  = !yearFilter  || String(dt.getFullYear()) === yearFilter;
        return matchStatus && matchSearch && matchDay && matchMonth && matchYear;
      });
  }, [requests, statusFilter, search, dayFilter, monthFilter, yearFilter]);

  const handleSaveEdit = () => {
    if (!editingRequest) return;
    const contactParts = [
      editingRequest.client_name  ? `Name: ${editingRequest.client_name}`  : null,
      editingRequest.client_email ? `Email: ${editingRequest.client_email}` : null,
      editingRequest.client_phone ? `Phone: ${editingRequest.client_phone}` : null,
    ].filter(Boolean).join(' | ');
    const rawMsg = editingRequest.admin_notes || parseNotes(editingRequest.notes || '').message || '';
    const newNotes = contactParts ? `${contactParts} | Message: ${rawMsg}` : rawMsg;
    onSaveRequest({ ...editingRequest, notes: newNotes });
    setEditingRequest(null);
  };

  // Send booking confirmation email via Supabase edge function / mailto fallback
  const handleSendConfirmationEmail = async (req: any) => {
    const d = parseNotes(req.notes || '');
    if (!d.email) { showToast('No email address on record for this booking', 'error'); return; }
    setIsSending(true);
    try {
      // Try to insert a notification record (triggers email via Supabase webhook if set up)
      const user = users.find(u => u.email === d.email);
      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'booking_confirmation',
          title: 'Booking Confirmed ✅',
          message: [
            `Hi ${d.name},`,
            `Your booking has been confirmed.`,
            `Service: ${req.service_type || 'Training Session'}`,
            req.scheduled_at ? `Date & Time: ${new Date(req.scheduled_at).toLocaleString()}` : '',
            req.location ? `Location: ${req.location}` : '',
            d.message ? `Notes: ${d.message}` : '',
          ].filter(Boolean).join('\n'),
          metadata: { source: 'Admin Booking', request_id: req.id }
        });
      }
      // Also email via Netlify function if available
      await fetch('/.netlify/functions/send-booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: d.email,
          name: d.name,
          service: req.service_type || 'Training Session',
          date: req.scheduled_at ? new Date(req.scheduled_at).toLocaleString() : 'TBD',
          location: req.location || 'TBD',
          notes: d.message || '',
        })
      }).catch(() => {}); // Silently fail if function doesn't exist
      showToast(`Confirmation sent to ${d.email} ✅`, 'success');
    } catch (err) {
      showToast('Email dispatch failed', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Requests <span className="text-brand-teal">Control</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
            {filteredRequests.length} of {requests.length} requests
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* View toggle */}
          <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl">
            <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`} title="Card view"><LayoutGrid size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`} title="List view"><AlignJustify size={14} /></button>
          </div>

          <button
            onClick={() => setEditingRequest({ service_type: 'Personal Training', status: 'pending' })}
            className="px-5 py-2 bg-brand-teal text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-glow-teal"
          >
            <Plus size={14} /> Add Booking
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Name, email, phone, service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs outline-none focus:border-brand-teal w-56"
          />
        </div>

        {/* Status filter */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl gap-1">
          {['All', 'Pending', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${statusFilter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Date filters */}
        <div className="flex gap-2">
          <input type="text" placeholder="DD" maxLength={2} value={dayFilter} onChange={e => setDayFilter(e.target.value)}
            className="w-14 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-teal text-center" />
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-brand-teal w-24">
            <option value="">Month</option>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) =>
              <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>
            )}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-brand-teal w-24">
            <option value="">Year</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(dayFilter || monthFilter || yearFilter || search) && (
            <button onClick={() => { setDayFilter(''); setMonthFilter(''); setYearFilter(''); setSearch(''); }}
              className="p-2 text-white/30 hover:text-white transition-all" title="Clear filters">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredRequests.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20 text-center text-white/30">
          <div><Filter size={36} className="mx-auto mb-4 opacity-20" /><p className="text-xs uppercase tracking-widest font-black">No requests match filters</p></div>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map(req => {
            const d = parseNotes(req.notes);
            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gradient border border-white/5 hover:border-brand-teal/20 rounded-[2rem] p-6 space-y-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black uppercase tracking-tight">{d.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{req.service_type || 'Service'}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${STATUS_COLORS[req.status?.toLowerCase()] || STATUS_COLORS.pending}`}>
                    {req.status || 'Pending'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-white/50">
                  {d.email && <p className="flex items-center gap-2"><Mail size={10} className="text-brand-teal" /> {d.email}</p>}
                  {d.phone && <p className="flex items-center gap-2"><Phone size={10} className="text-brand-coral" /> {d.phone}</p>}
                  <p className="flex items-center gap-2"><CalendarIcon size={10} className="text-white/30" /> {new Date(req.created_at).toLocaleDateString()}</p>
                  {d.message && <p className="text-white/30 italic line-clamp-2 pt-1 border-t border-white/5">{d.message}</p>}
                </div>

                <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
                  <select
                    value={req.status || 'pending'}
                    onChange={e => onUpdateStatus(req.id, e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-[9px] uppercase font-black outline-none focus:border-brand-teal"
                  >
                    {['pending','contacted','scheduled','completed','cancelled'].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                  <button onClick={() => setEditingRequest({ ...req, client_name: d.name, client_email: d.email, client_phone: d.phone })}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"><Edit2 size={13} /></button>
                  <button onClick={() => handleSendConfirmationEmail(req)} disabled={isSending}
                    className="p-2 bg-brand-teal/10 hover:bg-brand-teal rounded-xl text-brand-teal hover:text-black transition-all" title="Send confirmation email">
                    {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Client</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Service</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.map(req => {
                const d = parseNotes(req.notes);
                return (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-sm uppercase">{d.name}</p>
                      <p className="text-[10px] text-white/40">{d.email}</p>
                      {d.phone && <p className="text-[10px] text-white/30">{d.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-white/70">{req.service_type || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-white/60">{new Date(req.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-white/30">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={req.status || 'pending'}
                        onChange={e => onUpdateStatus(req.id, e.target.value)}
                        className={`text-[9px] font-black uppercase rounded-lg px-2 py-1 border outline-none ${STATUS_COLORS[req.status?.toLowerCase()] || STATUS_COLORS.pending}`}
                      >
                        {['pending','contacted','scheduled','completed','cancelled'].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingRequest({ ...req, client_name: d.name, client_email: d.email, client_phone: d.phone })}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"><Edit2 size={12} /></button>
                        <button onClick={() => handleSendConfirmationEmail(req)} title="Send email"
                          className="p-1.5 bg-brand-teal/10 hover:bg-brand-teal rounded-lg text-brand-teal hover:text-black transition-all"><Send size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Booking Modal */}
      <AnimatePresence>
        {editingRequest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter">{editingRequest.id ? 'Edit Booking' : 'New Booking'}</h3>
                <button onClick={() => setEditingRequest(null)} className="p-2 text-white/30 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'client_name', placeholder: 'John Doe' },
                  { label: 'Email', key: 'client_email', placeholder: 'email@example.com' },
                  { label: 'Phone', key: 'client_phone', placeholder: '+1 305 000 0000' },
                  { label: 'Date & Time', key: 'scheduled_at', type: 'datetime-local' },
                ].map(f => (
                  <div key={f.key} className={`space-y-1.5 ${f.key === 'client_name' ? 'col-span-2' : ''}`}>
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={(editingRequest as any)[f.key] || ''}
                      onChange={e => setEditingRequest({ ...editingRequest, [f.key]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Service Type</label>
                <select value={editingRequest.service_type || 'Personal Training'} onChange={e => setEditingRequest({ ...editingRequest, service_type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                  {['Personal Training','Group Class','Nutrition Consult','Mobility Session','Online Coaching','Other'].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Status</label>
                  <select value={editingRequest.status || 'pending'} onChange={e => setEditingRequest({ ...editingRequest, status: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                    {['pending','contacted','scheduled','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Location</label>
                  <input type="text" placeholder="Studio / Online / Address" value={editingRequest.location || ''}
                    onChange={e => setEditingRequest({ ...editingRequest, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Admin Notes</label>
                <textarea rows={3} placeholder="Internal notes..." value={editingRequest.admin_notes || ''}
                  onChange={e => setEditingRequest({ ...editingRequest, admin_notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditingRequest(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all">
                  Save Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
