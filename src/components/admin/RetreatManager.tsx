import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Plus, Check, X, Phone,
  Trash2, Edit2, Users, Calendar,
  Globe, ShieldCheck, Loader2, Save,
  Image, ChevronRight, Clock, AlertCircle,
  CheckCircle2, XCircle, PhoneCall, FileText,
  Filter, Eye, MessageSquare
} from 'lucide-react';
import { Retreat, RetreatApplication } from '../../types';
import { supabase } from '../../supabase';
import { MediaCapture } from '../MediaCapture';

interface RetreatManagerProps {
  retreats: Retreat[];
  applications: RetreatApplication[];
  onAdd: () => void;
  onReview: (id: string, status: 'accepted' | 'declined' | 'needs_call', admin_notes?: string) => void;
  onDelete: (id: string) => void;
  onSave?: (retreat: Partial<Retreat>) => Promise<void>;
  showToast?: any;
}

const emptyRetreat = (): Partial<Retreat> => ({
  title: '',
  description: '',
  location: '',
  price: '0' as any,
  
  visibility_status: 'draft' as any,
  is_sold_out: false,
  
  start_date: '',
  end_date: '',
  cover_image: '',
});

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  needs_call: {
    label: 'Call Required',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: PhoneCall,
  },
  accepted: {
    label: 'Approved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  declined: {
    label: 'Declined',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
  },
};

export const RetreatManager = ({
  retreats, applications, onAdd, onReview, onDelete, onSave, showToast
}: RetreatManagerProps) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'retreats'>('applications');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingRetreat, setEditingRetreat] = useState<Partial<Retreat> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingApp, setReviewingApp] = useState<RetreatApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const needsCallCount = applications.filter(a => a.status === 'needs_call').length;

  const filteredApps = applications.filter(a =>
    statusFilter === 'all' ? true : a.status === statusFilter
  ).sort((a, b) => {
    // Pending first, then needs_call, then accepted/declined
    const order = { pending: 0, needs_call: 1, accepted: 2, declined: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const handleSave = async () => {
    if (!editingRetreat?.title || !editingRetreat?.location) {
      if (showToast) showToast('Title and location are required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(editingRetreat);
      } else {
        const row = {
          title: editingRetreat.title,
          description: editingRetreat.description || null,
          location: editingRetreat.location,
          price: editingRetreat.price || 0,
          capacity: (editingRetreat as any).capacity || 10,
          visibility_status: editingRetreat.visibility_status || 'draft',
          is_sold_out: editingRetreat.is_sold_out || false,
          cover_image: editingRetreat.cover_image || null,
          requirements: (editingRetreat as any).requirements || null,
          start_date: (editingRetreat as any).start_date || null,
          end_date: (editingRetreat as any).end_date || null,
          updated_at: new Date().toISOString(),
        };
        if ((editingRetreat as any).id) {
          await supabase.from('retreats').update(row).eq('id', (editingRetreat as any).id);
        } else {
          await supabase.from('retreats').insert({ ...row, created_at: new Date().toISOString() });
        }
        if (showToast) showToast('Retreat saved ✅', 'success');
      }
      setEditingRetreat(null);
    } catch (err: any) {
      if (showToast) showToast(err?.message || 'Failed to save retreat', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewAction = (status: 'accepted' | 'declined' | 'needs_call') => {
    if (!reviewingApp) return;
    onReview(reviewingApp.id, status, adminNotes || undefined);
    setReviewingApp(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-8 fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Retreat <span className="text-brand-coral">Command</span>
          </h2>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
              {retreats.length} retreats
            </span>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {pendingCount} pending review
              </span>
            )}
            {needsCallCount > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <PhoneCall size={11} />
                {needsCallCount} need a call
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditingRetreat(emptyRetreat())}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-glow-teal transition-all flex-shrink-0"
        >
          <Plus size={16} /> Create Retreat
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {([
          { id: 'applications', label: 'Applications', badge: pendingCount + needsCallCount },
          { id: 'retreats',     label: 'Retreat Listings', badge: 0 },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-brand-teal text-black shadow-glow-teal'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-black ${
                activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-amber-500 text-black'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── APPLICATIONS TAB ── */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-white/20" />
            {(['all', 'pending', 'needs_call', 'accepted', 'declined'] as const).map(s => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s];
              const count = s === 'all' ? applications.length : applications.filter(a => a.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all border ${
                    statusFilter === s
                      ? cfg
                        ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                        : 'bg-white/10 text-white border-white/20'
                      : 'bg-transparent text-white/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  {s === 'all' ? 'All' : cfg?.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Application Cards */}
          {filteredApps.length === 0 ? (
            <div className="py-24 text-center card-gradient rounded-[3rem] border-2 border-dashed border-white/5">
              <FileText size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">No applications match this filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const retreat = retreats.find(r => r.id === app.retreat_id);
                const isExpanded = expandedAppId === app.id;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border rounded-[1.5rem] overflow-hidden transition-all ${cfg.border} bg-black/30`}
                  >
                    {/* Application Row */}
                    <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}>
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-base font-black ${cfg.color}`}>
                          {app.user_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm uppercase tracking-tight truncate">{app.user_name}</p>
                        <p className="text-[10px] text-white/30 font-mono truncate">{app.user_email}</p>
                        {retreat && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin size={9} className="text-brand-coral" />
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{retreat.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                        <span className="text-[9px] text-white/20 font-mono">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        <ChevronRight size={14} className={`text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="p-6 space-y-5 bg-black/20">
                            {/* Details row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Applied For</p>
                                <p className="text-sm font-black">{retreat?.title || 'Unknown Retreat'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Location</p>
                                <p className="text-sm font-black">{retreat?.location || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Applied On</p>
                                <p className="text-sm font-black">{new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Email</p>
                                <a href={`mailto:${app.user_email}`} className="text-sm font-black text-brand-teal hover:underline truncate block">{app.user_email}</a>
                              </div>
                            </div>

                            {/* Applicant message */}
                            {app.message && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2 flex items-center gap-1.5">
                                  <MessageSquare size={10} /> Applicant Message
                                </p>
                                <p className="text-sm text-white/70 leading-relaxed">{app.message}</p>
                              </div>
                            )}

                            {/* Admin notes */}
                            {app.admin_notes && (
                              <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-4">
                                <p className="text-[9px] uppercase tracking-widest text-brand-teal font-bold mb-2">Admin Notes</p>
                                <p className="text-sm text-white/70">{app.admin_notes}</p>
                              </div>
                            )}

                            {/* Action Buttons — only show for actionable statuses */}
                            {(app.status === 'pending' || app.status === 'needs_call') && (
                              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                                <button
                                  onClick={() => { setReviewingApp(app); setAdminNotes(app.admin_notes || ''); }}
                                  className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] uppercase tracking-widest font-black text-white/60 hover:bg-white/10 hover:text-white transition-all"
                                >
                                  <Eye size={13} /> Open Full Review
                                </button>
                                <button
                                  onClick={() => onReview(app.id, 'accepted')}
                                  className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] uppercase tracking-widest font-black text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => { setReviewingApp(app); setAdminNotes(app.admin_notes || ''); }}
                                  className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] uppercase tracking-widest font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                >
                                  <Phone size={13} /> Flag for Call
                                </button>
                                <button
                                  onClick={() => onReview(app.id, 'declined')}
                                  className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] uppercase tracking-widest font-black text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                                >
                                  <X size={13} /> Decline
                                </button>
                              </div>
                            )}

                            {/* Finalized state */}
                            {(app.status === 'accepted' || app.status === 'declined') && (
                              <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                                <StatusIcon size={16} className={cfg.color} />
                                <span className={`text-[10px] uppercase tracking-widest font-black ${cfg.color}`}>
                                  Application {cfg.label} — no further action needed
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── RETREATS TAB ── */}
      {activeTab === 'retreats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {retreats.map((retreat, i) => (
            <motion.div
              key={retreat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-gradient group relative overflow-hidden flex flex-col md:flex-row border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2rem]"
            >
              <div className="md:w-44 relative h-48 md:h-auto overflow-hidden flex-shrink-0">
                {retreat.cover_image ? (
                  <img src={retreat.cover_image} alt={retreat.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Image size={32} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-brand-teal mb-1">
                    <MapPin size={11} />
                    <span className="text-[9px] uppercase tracking-widest font-black">{retreat.location}</span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">{retreat.title}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{retreat.description}</p>

                  {/* App count for this retreat */}
                  {(() => {
                    const appCount = applications.filter(a => a.retreat_id === retreat.id).length;
                    const pendingForThis = applications.filter(a => a.retreat_id === retreat.id && a.status === 'pending').length;
                    return appCount > 0 ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Users size={10} className="text-brand-coral" />
                        <span className="text-[9px] text-white/40 font-bold">
                          {appCount} applicant{appCount !== 1 ? 's' : ''}
                          {pendingForThis > 0 && <span className="text-amber-400 ml-1">· {pendingForThis} pending</span>}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex gap-4 text-xs">
                    <span className="text-brand-coral font-black">${retreat.price}</span>
                    <span className={`font-black uppercase text-[9px] px-2 py-0.5 rounded ${
                      retreat.visibility_status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{retreat.visibility_status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('applications')}
                      className="p-2 bg-white/5 hover:bg-brand-teal/10 rounded-xl text-white/40 hover:text-brand-teal transition-all" title="View Applications">
                      <Users size={13} />
                    </button>
                    <button onClick={() => setEditingRetreat(retreat as any)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeletingId(retreat.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {retreats.length === 0 && (
            <div className="col-span-full py-24 text-center card-gradient rounded-[3rem] border-2 border-dashed border-white/5">
              <Globe size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">No retreats yet — create your first one</p>
            </div>
          )}
        </div>
      )}

      {/* ── FULL REVIEW MODAL ── */}
      <AnimatePresence>
        {reviewingApp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => { setReviewingApp(null); setAdminNotes(''); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-t-3xl sm:rounded-3xl p-8 w-full sm:max-w-xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Review Application</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Make a decision or request a follow-up call</p>
                </div>
                <button onClick={() => { setReviewingApp(null); setAdminNotes(''); }} className="p-2 text-white/30 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Applicant info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal text-2xl font-black">
                    {reviewingApp.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase">{reviewingApp.user_name}</p>
                    <p className="text-[11px] text-white/40 font-mono">{reviewingApp.user_email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Applied For</p>
                    <p className="text-sm font-black">{retreats.find(r => r.id === reviewingApp.retreat_id)?.title || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Applied On</p>
                    <p className="text-sm font-black">{new Date(reviewingApp.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {reviewingApp.message && (
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Message from Applicant</p>
                    <p className="text-sm text-white/70 leading-relaxed">{reviewingApp.message}</p>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black flex items-center gap-2">
                  <MessageSquare size={10} /> Internal Notes (sent with notification)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add context for your decision, call scheduling info, etc..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none text-white placeholder-white/20"
                />
              </div>

              {/* 3 Decision Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleReviewAction('accepted')}
                  className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={16} /> Approve Application
                </button>
                <button
                  onClick={() => handleReviewAction('needs_call')}
                  className="w-full py-4 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500 text-blue-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <PhoneCall size={16} /> Requires Follow-Up Call
                </button>
                <button
                  onClick={() => handleReviewAction('declined')}
                  className="w-full py-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <XCircle size={16} /> Decline Application
                </button>
              </div>

              <button
                onClick={() => { setReviewingApp(null); setAdminNotes(''); }}
                className="w-full py-3 text-white/30 font-black uppercase text-[9px] tracking-widest hover:text-white/60 transition-all"
              >
                Cancel — Make Decision Later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CREATE / EDIT RETREAT MODAL ── */}
      <AnimatePresence>
        {editingRetreat && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingRetreat(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-t-3xl sm:rounded-3xl p-8 w-full sm:max-w-2xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {(editingRetreat as any).id ? 'Edit Retreat' : 'Create Retreat'}
                </h3>
                <button onClick={() => setEditingRetreat(null)} className="p-2 text-white/30 hover:text-white"><X size={18} /></button>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Cover Image</label>
                {editingRetreat.cover_image ? (
                  <div className="relative h-36 rounded-2xl overflow-hidden">
                    <img src={editingRetreat.cover_image} className="w-full h-full object-cover" alt="cover" />
                    <button onClick={() => setEditingRetreat({ ...editingRetreat, cover_image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/60 hover:text-white"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <MediaCapture bucket="fmf-media" folder="retreats" accept="image/*"
                      onUploadSuccess={(url: string) => setEditingRetreat({ ...editingRetreat, cover_image: url })} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Retreat Title *</label>
                  <input type="text" placeholder="e.g. Costa Rica Immersion" value={editingRetreat.title || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Location *</label>
                  <input type="text" placeholder="City, Country" value={editingRetreat.location || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Price ($)</label>
                  <input type="number" min="0" placeholder="0" value={editingRetreat.price || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Capacity</label>
                  <input type="number" min="1" placeholder="10" value={(editingRetreat as any).capacity || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, ...(editingRetreat as any), capacity: parseInt(e.target.value) || 10 } as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Start Date</label>
                  <input type="date" value={(editingRetreat as any).start_date || ''}
                    onChange={e => setEditingRetreat({ ...(editingRetreat as any), start_date: e.target.value } as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">End Date</label>
                  <input type="date" value={(editingRetreat as any).end_date || ''}
                    onChange={e => setEditingRetreat({ ...(editingRetreat as any), end_date: e.target.value } as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Status</label>
                  <select value={editingRetreat.visibility_status || 'draft'}
                    onChange={e => setEditingRetreat({ ...editingRetreat, visibility_status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                    <option value="draft">Draft</option>
                    <option value="published">Published (Active)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <input type="checkbox" id="sold_out" checked={editingRetreat.is_sold_out || false}
                    onChange={e => setEditingRetreat({ ...editingRetreat, is_sold_out: e.target.checked })}
                    className="w-4 h-4 accent-brand-coral" />
                  <label htmlFor="sold_out" className="text-xs font-black uppercase tracking-widest cursor-pointer">Mark as Sold Out</label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Description</label>
                <textarea rows={4} placeholder="Full retreat description..." value={editingRetreat.description || ''}
                  onChange={e => setEditingRetreat({ ...editingRetreat, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Requirements (optional)</label>
                <textarea rows={2} placeholder="e.g. Basic fitness level required." value={(editingRetreat as any).requirements || ''}
                  onChange={e => setEditingRetreat({ ...(editingRetreat as any), requirements: e.target.value } as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingRetreat(null)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {(editingRetreat as any).id ? 'Update Retreat' : 'Publish Retreat'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0d0d0d] border border-red-500/30 rounded-3xl p-8 w-full max-w-sm text-center space-y-5"
            >
              <p className="text-lg font-black uppercase">Delete Retreat?</p>
              <p className="text-white/40 text-xs">This cannot be undone. All applications will be orphaned.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/5 font-black uppercase text-[10px] rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={() => { onDelete(deletingId); setDeletingId(null); }}
                  className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-[10px] rounded-xl hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
