import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Loader2, AlertCircle, ArrowRight, Dumbbell, Activity,
  Flame, Rocket, Star, Heart, CheckCircle2, ChevronRight, Zap, Play, Plus,
  Calendar as CalendarIcon, BarChart3, Clock, Video as VideoIcon, QrCode, History,
  Camera, Timer, X, Image, Upload
} from 'lucide-react';
import { UserProfile, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user, showToast, onTabChange }: { user: UserProfile; showToast: any; onTabChange?: (tab: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [todayCheckInCount, setTodayCheckInCount] = useState(0);
  const [streakCount, setStreakCount] = useState(user.streak_count ?? user.streak ?? 0);
  const [todaySession, setTodaySession] = useState<CalendarSession | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<any[]>([]);

  // ── Second workout confirmation modal ───────────────────────────────────────
  const [showSecondWorkoutModal, setShowSecondWorkoutModal] = useState(false);

  // ── Check-in photo modal ────────────────────────────────────────────────────
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInPhotoUrl, setCheckInPhotoUrl] = useState<string | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 1-hour workout timer ────────────────────────────────────────────────────
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0); // counts up
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOUR_SECONDS = 3600;

  const [stats, setStats] = useState({
    sessionsThisWeek: 0,
    trainingTime: '0h',
    likedVideos: 0,
    activeProgramTitle: '',
  });

  const navigate = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      window.location.hash = `#/profile#${tab}`;
    }
  };

  // ── Timer logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev >= HOUR_SECONDS) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            showToast('1 Hour Workout Complete! 🔥 Log your check-in.', 'success');
            return HOUR_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = Math.min((timerSeconds / HOUR_SECONDS) * 100, 100);

  // ── Load today's check-in count on mount ────────────────────────────────────
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    supabase
      .from('calendar_sessions')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', user.id)
      .eq('session_date', todayStr)
      .eq('source_type', 'check_in')
      .then(({ data }) => {
        const count = data?.length ?? 0;
        setTodayCheckInCount(count);
        setHasCheckedIn(count > 0);
      });
  }, [user.id]);

  // ── Check-in handler — enforces 1st/2nd logic ───────────────────────────────
  const initiateCheckIn = () => {
    if (todayCheckInCount >= 1) {
      // Second workout today — show confirmation popup
      setShowSecondWorkoutModal(true);
    } else {
      setShowCheckInModal(true);
    }
  };

  const confirmSecondWorkout = () => {
    setShowSecondWorkoutModal(false);
    setShowCheckInModal(true);
  };

  // ── Photo upload helper ─────────────────────────────────────────────────────
  const handlePhotoFile = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `check-ins/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('fmf-media').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('fmf-media').getPublicUrl(path);
      setCheckInPhotoUrl(urlData.publicUrl);
    } catch (err: any) {
      showToast(err?.message || 'Photo upload failed', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ── Submit check-in ─────────────────────────────────────────────────────────
  const submitCheckIn = async () => {
    if (!checkInPhotoUrl) {
      showToast('Please upload your check-in photo first', 'error');
      return;
    }
    setIsSubmittingCheckIn(true);
    const now = new Date();
    const newStreak = streakCount + 1;

    try {
      await supabase.from('calendar_sessions').insert({
        user_id: user.id,
        source_type: 'check_in',
        title: todayCheckInCount >= 1 ? 'Second Workout Check-In 💪' : 'Daily Protocol Check-In',
        session_date: now.toISOString().split('T')[0],
        session_time: now.toISOString().split('T')[1].split('.')[0],
        duration_minutes: timerActive || timerSeconds > 0 ? Math.floor(timerSeconds / 60) : 60,
        status: 'completed',
        check_in_image: checkInPhotoUrl,
      });

      // Only bump streak on FIRST check-in of the day
      if (todayCheckInCount === 0) {
        await supabase.from('profiles').update({
          last_checkin: now.toISOString(),
          streak_count: newStreak,
        }).eq('id', user.id);
        setStreakCount(newStreak);
      }

      const newCount = todayCheckInCount + 1;
      setTodayCheckInCount(newCount);
      setHasCheckedIn(true);
      setShowCheckInModal(false);
      setCheckInPhotoUrl(null);
      setTimerActive(false);
      setTimerSeconds(0);
      setShowReward(true);
    } catch (err: any) {
      showToast(err?.message || 'Check-in failed', 'error');
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const fetchStats = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [todayRes, weekRes, requestsRes, bookmarksRes] = await Promise.all([
        supabase.from('calendar_sessions')
          .select('*').eq('user_id', user.id).eq('session_date', todayStr)
          .order('created_at', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('calendar_sessions')
          .select('id, duration_minutes, status').eq('user_id', user.id),
        supabase.from('service_requests')
          .select('*').eq('user_id', user.id).eq('status', 'pending'),
        user.bookmarks?.length ? supabase.from('videos').select('*').in('id', user.bookmarks) : Promise.resolve({ data: [] })
      ]);

      const completedSessions = weekRes.data?.filter(s => s.status === 'completed') || [];
      const totalMinutes = completedSessions.reduce((a, c) => a + (c.duration_minutes || 0), 0);
      const hours = Math.floor(totalMinutes / 60);

      setTodaySession(todayRes.data ?? null);
      setPendingRequests(requestsRes.data || []);
      setBookmarkedVideos(bookmarksRes.data || []);
      setStats({
        sessionsThisWeek: completedSessions.length,
        trainingTime: `${hours}h ${totalMinutes % 60}m`,
        likedVideos: user.favorites?.length ?? 0,
        activeProgramTitle: completedSessions.length > 0 ? 'Active' : 'Not Started',
      });
    } catch (err) {
      console.error('Error fetching overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [user.id, user.bookmarks?.length]);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="text-brand-teal animate-spin" size={40} />
    </div>
  );

  const firstName = user.full_name?.split(' ')[0] || 'Athlete';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const lastCheckin = user.last_checkin ? new Date(user.last_checkin) : null;
  const isProfileIncomplete = !user.full_name || !user.phone || !user.email || !user.height || !user.weight || !user.city || !user.address || !user.short_bio;
  const missedYesterday = !lastCheckin || (lastCheckin.toDateString() !== yesterday.toDateString() && !hasCheckedIn);

  return (
    <div className="space-y-8 fade-in pb-20">
      
      {isProfileIncomplete && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="flex items-start md:items-center gap-4">
            <AlertCircle size={28} className="text-amber-500 shrink-0 mt-1 md:mt-0" />
            <div>
              <h4 className="text-amber-500 font-black uppercase tracking-tight text-lg mb-1">Complete Your Athletic Intel</h4>
              <p className="text-[10px] text-white/60 uppercase tracking-widest leading-relaxed">
                Your profile is missing vital physiological or contact parameters. This will delay physical product shipments and 1-on-1 training approvals.
              </p>
            </div>
          </div>
          <button onClick={() => navigate('settings')} className="px-8 py-4 bg-amber-500 text-black text-[10px] uppercase font-black tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap shadow-xl">
            Update Matrix
          </button>
        </div>
      )}

      {/* =================== TIMER BAR — shows when active =================== */}
      <AnimatePresence>
        {(timerActive || timerSeconds > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-4 z-40"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-brand-teal/30 rounded-[2rem] px-6 py-4 flex items-center gap-6 shadow-[0_0_40px_rgba(45,212,191,0.15)]">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${timerActive ? 'bg-brand-teal animate-pulse' : 'bg-white/20'}`} />
                <span className="text-[10px] uppercase tracking-widest font-black text-white/40">
                  {timerActive ? 'Workout In Progress' : 'Timer Paused'}
                </span>
              </div>
              <div className="flex-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-teal rounded-full"
                    style={{ width: `${timerProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter text-brand-teal tabular-nums">
                {formatTimer(timerSeconds)}
              </span>
              <button
                onClick={() => setTimerActive(a => !a)}
                className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all ${
                  timerActive
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black'
                    : 'bg-brand-teal/10 border border-brand-teal/30 text-brand-teal hover:bg-brand-teal hover:text-black'
                }`}
              >
                {timerActive ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => setShowCheckInModal(true)}
                className="px-4 py-2 rounded-xl text-[9px] uppercase font-black tracking-widest bg-brand-coral text-black hover:bg-brand-coral/80 transition-all"
              >
                Log Check-In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== TODAY SYSTEM =================== */}
      <section>
        <div className="relative">
          <div className={`absolute -inset-px rounded-[2.5rem] opacity-30 blur transition-all duration-700 ${hasCheckedIn ? 'bg-emerald-500' : 'bg-brand-coral'}`} />
          <div className="relative card-gradient rounded-[2.5rem] border border-white/5 p-8 md:p-10 overflow-hidden">

            {/* Background Watermark */}
            <div className={`absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none ${hasCheckedIn ? 'text-emerald-500' : 'text-brand-coral'}`}>
              {hasCheckedIn ? <CheckCircle size={220} /> : <Zap size={220} />}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${hasCheckedIn ? 'bg-emerald-400' : 'bg-brand-coral'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Today</span>
                {todayCheckInCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[8px] font-black uppercase tracking-widest rounded-lg">
                    {todayCheckInCount}× Today
                  </span>
                )}
              </div>

              {hasCheckedIn ? (
                /* STATE 4 — COMPLETED TODAY */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-emerald-400 leading-none">
                    Workout Completed
                  </h2>
                  <p className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Great work today. {todayCheckInCount > 1 && `(${todayCheckInCount} sessions)`}
                  </p>
                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={initiateCheckIn}
                      className="w-full py-5 bg-[#111] border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <Plus size={16} /> Add Second Workout
                    </button>
                    <button
                      onClick={() => navigate('progress')}
                      className="w-full py-5 bg-transparent text-white/40 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              ) : missedYesterday ? (
                /* STATE 2 — MISSED YESTERDAY → "OWN YOUR POWER" */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                    Own your <span className="text-brand-coral">Power</span>
                  </h2>
                  <p className="text-brand-coral text-sm font-bold uppercase tracking-widest mt-2">
                    Today is your comeback. Don't let it slip.
                  </p>
                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={initiateCheckIn}
                      className="w-full py-6 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(232,116,97,0.3)]"
                    >
                      <Play size={18} fill="currentColor" /> Start Workout
                    </button>
                  </div>
                </div>
              ) : streakCount > 0 ? (
                /* STATE 3 — ACTIVE STREAK */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white flex items-center justify-center gap-3">
                    <Flame className="text-brand-coral" size={40} /> {streakCount} Day Streak
                  </h2>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-2">
                    Keep it alive today
                  </p>
                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={initiateCheckIn}
                      className="w-full py-6 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(232,116,97,0.3)]"
                    >
                      <Play size={18} fill="currentColor" /> Start Workout
                    </button>
                    <button
                      onClick={() => navigate('programs')}
                      className="w-full py-5 bg-transparent border border-transparent text-white/50 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <VideoIcon size={16} /> Continue Program
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE 1 — DID NOTHING TODAY (0 STREAK) */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                    You haven't <span className="text-brand-coral">trained today</span>
                  </h2>
                  <div className="flex flex-col gap-3 pt-8">
                    <button
                      onClick={initiateCheckIn}
                      className="w-full py-6 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(232,116,97,0.3)]"
                    >
                      <Play size={18} fill="currentColor" /> Start Workout
                    </button>
                    <button
                      onClick={() => navigate('programs')}
                      className="w-full py-5 bg-transparent text-white/40 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                    >
                      Continue Program
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================== QUICK STATS =================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: stats.sessionsThisWeek, icon: CheckCircle, color: 'text-brand-teal', bg: 'bg-brand-teal/5', action: () => navigate('calendar') },
          { label: 'Scheduled', value: pendingRequests.length, icon: CalendarIcon, color: 'text-brand-teal', bg: 'bg-white/5', action: () => navigate('calendar') },
          { label: 'Current Streak', value: `${streakCount}d`, icon: Flame, color: 'text-brand-coral', bg: 'bg-brand-coral/5', action: () => showToast('Streak matrix mapping incoming.', 'info') },
          { label: 'Rank', value: user.role === 'admin' ? 'Elite' : 'Athlete', icon: Zap, color: 'text-brand-teal', bg: 'bg-brand-teal/5', action: () => showToast('Athlete ranking system coming soon!', 'info') }
        ].map((s, idx) => (
          <motion.button
            key={idx}
            whileHover={{ y: -4 }}
            onClick={s.action}
            className={`card-gradient p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group transition-all ${s.bg} cursor-pointer w-full`}
          >
            <div className={`p-3 rounded-xl ${s.bg} mb-3 group-hover:scale-110 transition-transform`}>
              <s.icon size={22} className={s.color} />
            </div>
            <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">{s.value}</span>
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-1">{s.label}</span>
          </motion.button>
        ))}
      </div>

      {/* =================== WEEK CALENDAR STRIP =================== */}
      <div className="card-gradient rounded-[2.5rem] border border-white/5 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">This Week</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-1">Don't break the chain.</p>
          </div>
          <button
            onClick={() => navigate('calendar')}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-brand-teal hover:border-brand-teal/30 text-[9px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-2"
          >
            Full Calendar <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - d.getDay() + i);
            const dayStr = d.toISOString().split('T')[0];
            const isToday = d.toDateString() === new Date().toDateString();
            const isPast = d < new Date() && !isToday;
            const wasCheckin = user.last_checkin?.startsWith(dayStr);
            const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

            return (
              <button
                key={i}
                onClick={() => navigate('calendar')}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all group ${
                  isToday ? 'border-brand-teal bg-brand-teal/10 shadow-glow-teal' :
                  wasCheckin ? 'border-emerald-500/30 bg-emerald-500/10' :
                  isPast ? 'border-brand-coral/10 bg-brand-coral/5 opacity-50' :
                  'border-white/5 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <span className={`text-[9px] uppercase font-black tracking-widest ${
                  isToday ? 'text-brand-teal' : wasCheckin ? 'text-emerald-400' : 'text-white/20'
                }`}>
                  {dayLabels[i]}
                </span>
                {wasCheckin && <CheckCircle2 size={12} className="text-emerald-400" />}
                {isToday && !wasCheckin && <div className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-pulse" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-black text-white/30">
          <Flame size={11} className="text-brand-coral" /> {streakCount} Day streak — keep it going
        </div>
      </div>

      {/* =================== BOOKMARKED VIDEOS =================== */}
      {bookmarkedVideos.length > 0 && (
        <section className="space-y-5 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <VideoIcon className="text-brand-teal" size={20} /> My Program
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Your bookmarked protocols are ready to execute.</p>
            </div>
            <button
              onClick={() => navigate('programs')}
              className="px-4 py-3 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-brand-teal hover:text-black transition-all"
            >
              Manage / Play
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarkedVideos.map(video => (
              <motion.div
                key={video.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate('programs')}
                className="card-gradient group border border-brand-teal/10 hover:border-brand-teal/40 transition-all rounded-[2rem] overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all z-10" />
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon size={40} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                    <div className="p-4 bg-brand-teal text-black rounded-full shadow-glow-teal hover:scale-110 transition-transform">
                      <Play size={20} fill="black" className="translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-30 p-2 bg-brand-teal/10 backdrop-blur-md rounded-xl text-brand-teal border border-brand-teal/20">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-brand-teal font-black block mb-1">{video.category || 'Workout'}</span>
                    <h4 className="text-sm font-black uppercase tracking-tight leading-snug line-clamp-2">{video.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/30 text-[9px] font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                    <Clock size={10} /> {video.duration || '—'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* =================== QUICK ACTIONS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'My Schedule',
            desc: 'View, add, and edit your workouts',
            icon: CalendarIcon,
            color: 'text-brand-teal',
            bg: 'bg-brand-teal/5',
            border: 'border-brand-teal/20',
            action: () => navigate('calendar')
          },
          {
            title: 'My Program',
            desc: 'Your saved video workouts',
            icon: VideoIcon,
            color: 'text-blue-400',
            bg: 'bg-blue-500/5',
            border: 'border-blue-500/20',
            action: () => navigate('programs')
          },
          ...((user?.tier === 'Basic' || user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'athlete') ? [{
            title: 'Request Services',
            desc: 'Book a 1-on-1 session',
            icon: Heart,
            color: 'text-brand-coral',
            bg: 'bg-brand-coral/5',
            border: 'border-brand-coral/20',
            action: () => navigate('calendar')
          }] : []),
        ].map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -3 }}
            onClick={item.action}
            className={`card-gradient p-6 rounded-[2rem] border ${item.border} ${item.bg} text-left group transition-all w-full`}
          >
            <div className={`p-3 rounded-xl ${item.bg} inline-flex mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon size={22} className={item.color} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-tight">{item.title}</h4>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-1">{item.desc}</p>
            <div className="flex items-center gap-1.5 mt-4 text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
              Open <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>

      {pendingRequests.length > 0 && (
        <section className="space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-tighter text-amber-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Pending Requests
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req, i) => (
              <div key={i} className="card-gradient p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <Activity size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-amber-400">{req.service_type || 'Private Session'}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                  <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded mt-2">
                    Awaiting Schedule Confirmation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================== WEEKLY SUMMARY =================== */}
      <section className="card-gradient p-8 md:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 text-white/[0.03] -rotate-12 pointer-events-none">
          <History size={180} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Weekly <span className="text-brand-coral">Summary</span></h3>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-1">Your performance audit for this cycle.</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-brand-coral leading-none">{stats.sessionsThisWeek}</span>
              <p className="text-[8px] uppercase tracking-widest text-white/30 font-black">Sessions Done</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Star, color: 'text-amber-400', label: 'Consistency Hit', text: stats.sessionsThisWeek > 0 ? 'You\'re in the top tier this week.' : 'First session unlocks your streak.' },
              { icon: Rocket, color: 'text-brand-teal', label: 'Focus Area', text: user.workout_style ? `Training focus: ${user.workout_style}` : 'Set your training focus in Edit Profile.' },
              { icon: Heart, color: 'text-brand-coral', label: 'Identity', text: `Building discipline, ${firstName}. Every rep counts.` },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-white/[0.03] rounded-[1.5rem] border border-white/5 space-y-3">
                <item.icon className={item.color} size={22} />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">{item.label}</p>
                  <p className="text-xs font-bold uppercase tracking-tight">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('programs')}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal hover:text-white transition-all group mx-auto"
          >
            Continue Protocol <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* =================== SECOND WORKOUT CONFIRMATION MODAL =================== */}
      <AnimatePresence>
        {showSecondWorkoutModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/85 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="card-gradient w-full max-w-sm p-10 text-center space-y-7 rounded-[3.5rem] border border-brand-coral/40 shadow-[0_0_80px_rgba(232,116,97,0.25)]"
            >
              <div className="w-20 h-20 bg-brand-coral/10 rounded-[2rem] flex items-center justify-center mx-auto text-brand-coral border border-brand-coral/20">
                <Flame size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  Second Workout <span className="text-brand-coral">Today?</span>
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold leading-relaxed px-4">
                  This will be workout <span className="text-brand-coral font-black">#{todayCheckInCount + 1}</span> today. You already completed {todayCheckInCount} session{todayCheckInCount > 1 ? 's' : ''} today.
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                  Confirm to start your next session.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={confirmSecondWorkout}
                  className="w-full py-5 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(232,116,97,0.3)]"
                >
                  Yes, I'm Ready — Let's Go 🔥
                </button>
                <button
                  onClick={() => setShowSecondWorkoutModal(false)}
                  className="w-full py-3 text-white/30 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== CHECK-IN PHOTO MODAL =================== */}
      <AnimatePresence>
        {showCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="card-gradient w-full sm:max-w-lg p-8 md:p-10 space-y-7 rounded-t-[3rem] sm:rounded-[3rem] border border-brand-coral/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-brand-coral">
                <Camera size={160} />
              </div>
              <button onClick={() => { setShowCheckInModal(false); setCheckInPhotoUrl(null); }} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10">
                <X size={22} />
              </button>

              {/* Header */}
              <div className="text-center space-y-2 relative z-10">
                <div className="w-16 h-16 bg-brand-coral/10 rounded-[1.5rem] flex items-center justify-center mx-auto text-brand-coral border border-brand-coral/20 mb-4">
                  <Camera size={30} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {todayCheckInCount >= 1 ? `Workout #${todayCheckInCount + 1}` : 'Checkout'} <span className="text-brand-coral">Photo</span>
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Take your photo to confirm this session</p>
              </div>

              {/* Timer section */}
              <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-brand-teal" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-white/40">1 Hour Workout Timer</span>
                  </div>
                  <span className={`text-xl font-black tabular-nums tracking-tighter ${timerActive ? 'text-brand-teal' : timerSeconds > 0 ? 'text-amber-400' : 'text-white/20'}`}>
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-coral to-brand-teal rounded-full"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (timerActive) {
                        // Stop and reset
                        setTimerActive(false);
                        setTimerSeconds(0);
                      } else {
                        setTimerActive(true);
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all border ${
                      timerActive
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black'
                        : 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal hover:bg-brand-teal hover:text-black'
                    }`}
                  >
                    {timerActive ? '⏹ Stop' : '▶ Start Timer'}
                  </button>
                </div>
              </div>

              {/* Photo upload */}
              <div className="relative z-10 space-y-3">
                {checkInPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-brand-teal/30">
                    <img src={checkInPhotoUrl} alt="Check-in" className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-brand-teal" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-brand-teal">Photo Ready</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCheckInPhotoUrl(null)}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full h-40 border-2 border-dashed border-brand-coral/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-brand-coral/60 hover:bg-brand-coral/5 transition-all group"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 size={28} className="animate-spin text-brand-coral" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-brand-coral/10 rounded-xl flex items-center justify-center text-brand-coral group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest font-black text-white/60">Tap to take photo</p>
                          <p className="text-[9px] text-white/30 mt-1">Camera Only</p>
                        </div>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoFile(file);
                  }}
                />
              </div>

              {/* Submit */}
              <div className="relative z-10 space-y-3">
                <button
                  onClick={submitCheckIn}
                  disabled={isSubmittingCheckIn || !checkInPhotoUrl}
                  className="w-full py-5 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(232,116,97,0.3)] flex items-center justify-center gap-3 disabled:opacity-40 disabled:scale-100"
                >
                  {isSubmittingCheckIn ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Confirm Checkout
                </button>
                <p className="text-center text-[9px] text-white/20 uppercase tracking-widest font-bold">
                  Photo required to seal your checkout
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};
