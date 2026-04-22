import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';
import {
  CheckCircle, XCircle, Clock, Eye, X, Instagram, Youtube,
  Globe, Mail, Phone, MapPin, Award, Dumbbell, User, RefreshCw,
  ChevronDown
} from 'lucide-react';

interface AthleteApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  specialty: string;
  years_experience: number;
  certifications: string | null;
  short_bio: string;
  training_philosophy: string | null;
  workout_style: string | null;
  why_fmf: string;
  instagram: string | null;
  youtube: string | null;
  website: string | null;
  profile_photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
}

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AthleteApplicationsManager = ({ showToast }: Props) => {
  const [applications, setApplications] = useState<AthleteApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AthleteApplication | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('athlete_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Athlete fetch error:', error);
      showToast(`Failed to load applications: ${error.message}`, 'error');
    } else {
      setApplications(data as AthleteApplication[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const statusCounts = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    const { error } = await supabase
      .from('athlete_applications')
      .update({ status, admin_notes: adminNotes || null })
      .eq('id', id);

    if (error) {
      showToast('Failed to update application', 'error');
    } else {
      // Send decision email
      try {
        await fetch('/.netlify/functions/athlete-application-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selected?.full_name,
            email: selected?.email,
            decision: status,
            notes: adminNotes || null,
          }),
        });
      } catch (e) { console.warn('Email failed:', e); }

      showToast(`Application ${status}!`, 'success');
      setSelected(null);
      setAdminNotes('');
      fetchApplications();
    }
    setProcessing(false);
  };

  const statusStyle = (s: string) => {
    if (s === 'approved') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (s === 'rejected') return 'bg-red-500/15 text-red-400 border-red-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Athlete <span className="text-brand-teal">Applications</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">
            Review & Approve Incoming Athlete Submissions
          </p>
        </div>
        <button onClick={fetchApplications} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-5 rounded-2xl border text-center transition-all ${filter === s ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10 bg-white/5 hover:border-white/25'}`}
          >
            <div className="text-3xl font-black">{statusCounts[s]}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold capitalize">{s}</div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === f ? 'bg-brand-teal text-black border-transparent' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-white/30 uppercase tracking-widest text-xs">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
          <Clock size={32} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/30 uppercase tracking-widest text-xs">No {filter} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <motion.div
              key={app.id}
              layout
              className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/8 rounded-2xl hover:border-white/20 transition-all cursor-pointer group"
              onClick={() => { setSelected(app); setAdminNotes(app.admin_notes || ''); }}
            >
              {/* Photo */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
                {app.profile_photo_url
                  ? <img src={app.profile_photo_url} alt={app.full_name} className="w-full h-full object-cover" />
                  : <User size={20} className="text-white/20" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm uppercase tracking-tight">{app.full_name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">{app.specialty} · {app.years_experience}yr exp</div>
              </div>

              {/* Location */}
              {app.city && (
                <div className="hidden md:flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-widest">
                  <MapPin size={10} /> {app.city}{app.country ? `, ${app.country}` : ''}
                </div>
              )}

              {/* Date */}
              <div className="hidden lg:block text-[10px] text-white/30 uppercase tracking-widest">
                {new Date(app.created_at).toLocaleDateString()}
              </div>

              {/* Status */}
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle(app.status)}`}>
                {app.status}
              </span>

              <Eye size={16} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Detail Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[210] w-full max-w-xl bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tighter">{selected.full_name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 text-white/30 hover:text-white bg-white/5 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-8 flex-1">
                {/* Photo + basics */}
                <div className="flex gap-5 items-start">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
                    {selected.profile_photo_url
                      ? <img src={selected.profile_photo_url} alt={selected.full_name} className="w-full h-full object-cover" />
                      : <User size={28} className="text-white/20" />
                    }
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{selected.full_name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-brand-teal font-bold uppercase tracking-widest">
                      <Dumbbell size={10} /> {selected.specialty}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
                      <Award size={10} /> {selected.years_experience} year(s) experience
                    </div>
                    {(selected.city || selected.country) && (
                      <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
                        <MapPin size={10} /> {[selected.city, selected.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <Section title="Contact">
                  <InfoRow icon={<Mail size={12} />} label="Email" value={selected.email} />
                  {selected.phone && <InfoRow icon={<Phone size={12} />} label="Phone" value={selected.phone} />}
                  {selected.instagram && <InfoRow icon={<Instagram size={12} />} label="Instagram" value={selected.instagram} />}
                  {selected.youtube && <InfoRow icon={<Youtube size={12} />} label="YouTube" value={selected.youtube} link={selected.youtube} />}
                  {selected.website && <InfoRow icon={<Globe size={12} />} label="Website" value={selected.website} link={selected.website} />}
                </Section>

                {/* Certifications */}
                {selected.certifications && (
                  <Section title="Certifications">
                    <p className="text-sm text-white/70 leading-relaxed">{selected.certifications}</p>
                  </Section>
                )}

                {/* Bio */}
                <Section title="Short Bio">
                  <p className="text-sm text-white/70 leading-relaxed">{selected.short_bio}</p>
                </Section>

                {/* Philosophy */}
                {selected.training_philosophy && (
                  <Section title="Training Philosophy">
                    <p className="text-sm text-white/70 leading-relaxed italic">"{selected.training_philosophy}"</p>
                  </Section>
                )}

                {/* Why FMF */}
                <Section title="Why FMF">
                  <p className="text-sm text-white/70 leading-relaxed">{selected.why_fmf}</p>
                </Section>

                {/* Workout style */}
                {selected.workout_style && (
                  <Section title="Workout Style">
                    <p className="text-sm text-white/70">{selected.workout_style}</p>
                  </Section>
                )}

                {/* Admin notes */}
                <Section title="Admin Notes (optional)">
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes or a message to include in the decision email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-brand-teal resize-none transition-colors"
                  />
                </Section>
              </div>

              {/* Decision buttons — only show for pending */}
              {selected.status === 'pending' && (
                <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-3 sticky bottom-0 bg-[#0a0a0a]">
                  <button
                    onClick={() => updateStatus(selected.id, 'rejected')}
                    disabled={processing}
                    className="py-4 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> {processing ? '...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={processing}
                    className="py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> {processing ? '...' : 'Approve'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 border-b border-white/5 pb-2">{title}</p>
    {children}
  </div>
);

const InfoRow = ({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: string }) => (
  <div className="flex items-center gap-2 text-sm py-1">
    <span className="text-white/30">{icon}</span>
    <span className="text-white/40 text-[10px] uppercase tracking-widest w-20 shrink-0">{label}</span>
    {link
      ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline truncate">{value}</a>
      : <span className="text-white/80 truncate">{value}</span>
    }
  </div>
);
