import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Activity, Target, Clock, Play, Camera,
  CheckCircle, Flame, Calendar as CalendarIcon, Video,
  X, ChevronRight, Trash2, AlertTriangle, Star,
  Edit2, Search, Filter, Zap, BarChart2, Eye,
  Check, Loader2, FileText, Image
} from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';
import { MediaCapture } from '../MediaCapture';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  user_id: string;
  title: string;
  session_date: string;
  session_time?: string;
  duration_minutes?: number;
  source_type?: string;
  status?: string;
  notes?: string;
  check_in_image?: string;
  rating?: number;
  created_at?: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  pending:   { label: 'Pending',   color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',      dot: 'bg-amber-400'   },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',         dot: 'bg-blue-400'    },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/30',            dot: 'bg-red-400'     },
  rejected:  { label: 'Rejected',  color: 'bg-red-500/10 text-red-400 border-red-500/30',            dot: 'bg-red-400'     },
};

const resolveStatus = (s: Session) => {
  if (s.source_type === 'check-in' || s.source_type === 'check_in') return 'completed';
  return s.status || 'pending';
};

const resolveSourceLabel = (s: Session) => {
  switch (s.source_type) {
    case 'video':      return { label: 'Video Workout', icon: Video };
    case 'check-in':   return { label: 'Check-In',      icon: Camera };
    case 'check_in':   return { label: 'Check-In',      icon: Camera };
    case 'my_program': return { label: 'My Program',    icon: Zap };
    case 'manual':     return { label: 'Manual Entry',  icon: FileText };
    default:           return { label: 'Session',       icon: Activity };
  }
};

// ── 3-Step Delete State ─────────────────────────────────────────────────────
type DeleteStep = 0 | 1 | 2 | 3; // 0=idle, 1=first confirm, 2=second confirm, 3=deleted

// ── Main Component ────────────────────────────────────────────────────────────
export const Progress = ({ user, showToast }: { user: UserProfile; showToast: (msg: string, type?: any) => void }) => {
  const [sessions, setSessions]           = useState<Session[]>([]);
  const [loading, setLoading]             = useState(true);
  const [isCheckingIn, setIsCheckingIn]   = useState(false);
  const [selectedItem, setSelectedItem]   = useState<Session | null>(null);
  const [deleteStep, setDeleteStep]       = useState<DeleteStep>(0);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [isUpdating, setIsUpdating]       = useState(false);
  const [editStatus, setEditStatus]       = useState('');
  const [editNotes, setEditNotes]         = useState('');
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [activeView, setActiveView]       = useState<'log' | 'gallery'>('log');
  const [galleryPhoto, setGalleryPhoto]   = useState<Session | null>(null);

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch calendar_sessions
      const { data: calData } = await supabase
        .from('calendar_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      // Fetch workout_logs and normalise shape
      const { data: logData } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      const normalisedLogs = (logData || []).map((l: any) => ({
        id:               l.id,
        user_id:          l.user_id,
        title:            l.video_title || l.title || 'Workout Session',
        session_date:     l.logged_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        session_time:     l.logged_at ? new Date(l.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        duration_minutes: l.duration_minutes || 0,
        source_type:      l.source || 'my_program',
        status:           'completed',
        notes:            l.comments || '',
        rating:           l.rating,
        created_at:       l.logged_at,
        _table:           'workout_logs',
      }));

      const normalisedSessions = (calData || []).map((s: any) => ({ ...s, _table: 'calendar_sessions' }));
      const merged = [...normalisedSessions, ...normalisedLogs]
        .sort((a, b) => new Date(b.session_date || b.created_at || '').getTime() - new Date(a.session_date || a.created_at || '').getTime());

      setSessions(merged);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { if (user?.id) fetchSessions(); }, [fetchSessions]);

  // ── Derived Stats ────────────────────────────────────────────────────────────
  const completedSessions = sessions.filter(s => resolveStatus(s) === 'completed');
  const streak = user.streak_count || user.streak || 0;
  const hoursTrained = Math.floor(sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60);
  const videosWatched = sessions.filter(s => s.source_type === 'video').length;

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || (s.title || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || s.source_type === typeFilter ||
      (typeFilter === 'check_in' && (s.source_type === 'check-in' || s.source_type === 'check_in'));
    return matchSearch && matchType;
  });

  // ── Open detail modal ────────────────────────────────────────────────────────
  const openItem = (session: Session) => {
    setSelectedItem(session);
    setDeleteStep(0);
    setEditStatus(resolveStatus(session));
    setEditNotes(session.notes || '');
  };

  // ── Update status ────────────────────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
      const table = (selectedItem as any)._table || 'calendar_sessions';
      const updates: any = { status: editStatus, updated_at: new Date().toISOString() };
      if (editNotes !== selectedItem.notes) updates.notes = editNotes;

      const { error } = await supabase.from(table).update(updates).eq('id', selectedItem.id);
      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === selectedItem.id ? { ...s, ...updates } : s));
      setSelectedItem({ ...selectedItem, ...updates });
      showToast('Activity updated ✅', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Update failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── 3-Step Delete ────────────────────────────────────────────────────────────
  const handleDeleteStep = async () => {
    if (deleteStep === 0) { setDeleteStep(1); return; }
    if (deleteStep === 1) { setDeleteStep(2); return; }
    if (deleteStep === 2) {
      // Final delete
      if (!selectedItem) return;
      setIsDeleting(true);
      try {
        const table = (selectedItem as any)._table || 'calendar_sessions';
        const { error } = await supabase.from(table).delete().eq('id', selectedItem.id);
        if (error) throw error;
        setSessions(prev => prev.filter(s => s.id !== selectedItem.id));
        setDeleteStep(3);
        showToast('Activity removed ✅', 'success');
        setTimeout(() => setSelectedItem(null), 900);
      } catch (err: any) {
        showToast(err?.message || 'Delete failed', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // ── Derived Gallery items (sessions with check-in photos) ──────────────────
  const galleryItems = sessions
    .filter(s => s.check_in_image)
    .sort((a, b) => new Date(b.session_date || b.created_at || '').getTime() - new Date(a.session_date || a.created_at || '').getTime());

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in">

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Workouts', value: completedSessions.length, icon: Target,   color: 'text-brand-coral',  bg: 'bg-brand-coral/10' },
          { label: 'Day Streak', value: streak,                 icon: Flame,    color: 'text-amber-400',    bg: 'bg-amber-500/10'   },
          { label: 'Hrs Trained', value: hoursTrained,          icon: Clock,    color: 'text-brand-teal',   bg: 'bg-brand-teal/10'  },
          { label: 'Videos',     value: videosWatched,          icon: Video,    color: 'text-indigo-400',   bg: 'bg-indigo-500/10'  },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden group"
          >
            <div className={`absolute -right-3 -top-3 w-20 h-20 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 flex flex-col items-center text-center">
              <stat.icon size={22} className={`${stat.color} mb-2`} />
              <div className="text-3xl font-black tracking-tighter mb-0.5">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {([{ id: 'log', label: 'Activity Log' }, { id: 'gallery', label: `Photo Gallery${galleryItems.length > 0 ? ` (${galleryItems.length})` : ''}` }] as const).map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${
              activeView === v.id ? 'bg-brand-teal text-black shadow-glow-teal' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* PHOTO GALLERY VIEW */}
      {activeView === 'gallery' && (
        <div className="space-y-6">
          {galleryItems.length === 0 ? (
            <div className="py-32 text-center card-gradient rounded-[3rem] border-2 border-dashed border-white/5">
              <Image size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-black mb-2">No check-in photos yet</p>
              <p className="text-[9px] text-white/10 uppercase tracking-widest">Photos you take during check-ins will appear here to track your progress</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Camera size={20} className="text-brand-coral" /> Visual Progress
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-1">
                    {galleryItems.length} check-in photo{galleryItems.length !== 1 ? 's' : ''} — your transformation timeline
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setGalleryPhoto(item)}
                    className="group relative rounded-[1.5rem] overflow-hidden border border-white/10 hover:border-brand-teal/40 transition-all aspect-square"
                  >
                    <img
                      src={item.check_in_image!}
                      alt={`Check-in ${item.session_date}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white">
                        {item.session_date ? new Date(item.session_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </p>
                      <p className="text-[8px] text-white/50 uppercase tracking-widest">{item.title || 'Check-In'}</p>
                    </div>
                    {/* Position badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                      <span className="text-[8px] font-black text-white/60">#{galleryItems.length - i}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ACTIVITY LOG + CHECK-IN */}
      {activeView === 'log' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Log (left 2/3) */}
        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col min-h-[480px]">

          {/* header + filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Activity Log</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-0.5">
                {filteredSessions.length} entries · click any item to review
              </p>
            </div>
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-brand-teal w-32"
                />
              </div>
              {/* Type filter */}
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] uppercase font-black outline-none focus:border-brand-teal">
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="check_in">Check-In</option>
                <option value="my_program">Program</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          {/* Entries */}
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-white/30">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-white/30">
                <Activity size={36} className="mb-3 opacity-40" />
                <p className="text-xs uppercase tracking-widest font-black">No activity recorded yet</p>
              </div>
            ) : filteredSessions.map((session, i) => {
              const status     = resolveStatus(session);
              const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              const srcInfo    = resolveSourceLabel(session);
              const SrcIcon    = srcInfo.icon;

              return (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => openItem(session)}
                  className="w-full text-left bg-white/5 border border-white/5 hover:border-brand-teal/30 hover:bg-white/[0.08] rounded-2xl p-4 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Source icon */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-brand-teal/30 transition-all">
                      <SrcIcon size={16} className="text-white/40 group-hover:text-brand-teal transition-colors" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-black uppercase tracking-tight text-sm truncate">{session.title || 'Untitled Session'}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-white/40 font-mono">
                          {session.session_date ? new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{srcInfo.label}</span>
                        {(session.duration_minutes || 0) > 0 && (
                          <span className="text-[9px] text-brand-teal uppercase tracking-widest font-bold flex items-center gap-0.5">
                            <Clock size={8} /> {session.duration_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Rating stars */}
                    {session.rating && session.rating > 0 && (
                      <div className="hidden sm:flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={10} className={n <= session.rating! ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                        ))}
                      </div>
                    )}
                    {/* Status badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-widest font-black border ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                    {/* Chevron */}
                    <ChevronRight size={14} className="text-white/20 group-hover:text-brand-teal transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Check-In Panel (right 1/3) */}
        <div className="bg-gradient-to-b from-brand-coral/5 to-black border border-brand-coral/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-coral to-transparent opacity-50" />
          <div className="w-20 h-20 bg-brand-coral/10 rounded-full flex items-center justify-center mb-5 border border-brand-coral/30 group-hover:scale-110 transition-transform">
            <Camera size={34} className="text-brand-coral" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Daily Check-In</h3>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6 max-w-[180px]">
            Submit your daily audit to stay on protocol.
          </p>
          {streak > 0 && (
            <div className="mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
              <Flame size={14} className="text-amber-400" />
              <span className="text-xs font-black text-amber-400">{streak} day streak 🔥</span>
            </div>
          )}
          <button
            onClick={() => setIsCheckingIn(true)}
            className="w-full py-4 bg-brand-coral text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:shadow-glow-coral transition-all"
          >
            File Check-In
          </button>
        </div>
      </div>
      )}

      {/* ── GALLERY LIGHTBOX ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {galleryPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setGalleryPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full"
            >
              <button
                onClick={() => setGalleryPhoto(null)}
                className="absolute -top-12 right-0 p-2 text-white/40 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src={galleryPhoto.check_in_image!} alt="Check-in" className="w-full max-h-[70vh] object-contain bg-black" />
              </div>
              <div className="mt-4 text-center space-y-1">
                <p className="font-black text-lg uppercase tracking-tighter">{galleryPhoto.title || 'Check-In'}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                  {galleryPhoto.session_date ? new Date(galleryPhoto.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DETAIL MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => { setSelectedItem(null); setDeleteStep(0); }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Modal top bar */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const SrcIcon = resolveSourceLabel(selectedItem).icon;
                    return <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><SrcIcon size={16} className="text-brand-teal" /></div>;
                  })()}
                  <div>
                    <p className="font-black uppercase tracking-tight text-base">{selectedItem.title || 'Activity Detail'}</p>
                    <p className="text-[10px] text-white/30 font-mono">{resolveSourceLabel(selectedItem).label}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedItem(null); setDeleteStep(0); }}
                  className="p-2 text-white/30 hover:text-white transition-all"><X size={18} /></button>
              </div>

              {/* Detail Body */}
              <div className="p-6 space-y-5">

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Date',     value: selectedItem.session_date ? new Date(selectedItem.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
                    { label: 'Time',     value: selectedItem.session_time || (selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') },
                    { label: 'Duration', value: selectedItem.duration_minutes ? `${selectedItem.duration_minutes} min` : '—' },
                    { label: 'Type',     value: resolveSourceLabel(selectedItem).label },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-0.5">{item.label}</p>
                      <p className="text-sm font-black truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Rating */}
                {(selectedItem.rating || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-black">Rating</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14} className={n <= (selectedItem.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Check-in photo */}
                {selectedItem.check_in_image && (
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <img src={selectedItem.check_in_image} alt="Check-in" className="w-full h-36 object-cover" />
                  </div>
                )}

                {/* Status editor */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 font-black">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                      <button
                        key={key}
                        onClick={() => setEditStatus(key)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          editStatus === key ? conf.color + ' scale-105' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'
                        }`}
                      >
                        {conf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes editor */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 font-black">Notes</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Add notes about this session..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none text-white/80"
                  />
                </div>

                {/* Action buttons */}
                {deleteStep === 0 && (
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="flex-1 py-3 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setDeleteStep(1)}
                      className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* ── 3-STEP DELETE ───────────────────────────────────────── */}
                {deleteStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                      <p className="font-black text-sm uppercase tracking-tight">Remove this activity?</p>
                    </div>
                    <p className="text-xs text-white/40">This will permanently delete this log entry. This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteStep(0)}
                        className="flex-1 py-2.5 bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                      <button onClick={() => setDeleteStep(2)}
                        className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/30 transition-all">
                        Yes, Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {deleteStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-500/10 border border-red-500/40 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-red-500 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight text-red-400">Final Confirmation</p>
                        <p className="text-[10px] text-white/40 mt-0.5">This is your last chance to cancel.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteStep(0)}
                        className="flex-1 py-2.5 bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                      <button onClick={handleDeleteStep} disabled={isDeleting}
                        className="flex-1 py-2.5 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Confirm Delete
                      </button>
                    </div>
                  </motion.div>
                )}

                {deleteStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <CheckCircle size={20} className="text-emerald-400" />
                    <p className="font-black text-sm uppercase tracking-tight text-emerald-400">Activity Removed</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHECK-IN MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCheckingIn && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-xl p-10 space-y-8 rounded-[3rem] border border-brand-coral/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Camera size={160} /></div>
              <button onClick={() => setIsCheckingIn(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
              <div className="text-center space-y-3 relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Daily <span className="text-brand-coral">Check-In</span></h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Upload a photo to record your check-in</p>
              </div>
              <div className="relative z-10">
                <MediaCapture
                  bucket="fmf-media"
                  folder="check-ins"
                  accept="image/*"
                  onUploadSuccess={async (url: string) => {
                    try {
                      await supabase.from('calendar_sessions').insert({
                        user_id:          user.id || '',
                        source_type:      'check-in',
                        title:            'Daily Check-In',
                        session_date:     new Date().toISOString().split('T')[0],
                        session_time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        duration_minutes: 0,
                        status:           'completed',
                        check_in_image:   url,
                      });
                      await supabase.from('profiles').update({
                        streak_count: (user.streak_count || 0) + 1,
                        last_workout_date: new Date().toISOString(),
                      }).eq('id', user.id);
                      showToast('Check-in recorded ✅', 'success');
                      setIsCheckingIn(false);
                      fetchSessions();
                    } catch (error: any) {
                      showToast(error.message || 'Check-in failed', 'error');
                    }
                  }}
                  onUploadError={(err: any) => showToast(err.message, 'error')}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
