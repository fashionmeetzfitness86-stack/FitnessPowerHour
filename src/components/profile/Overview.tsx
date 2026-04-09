import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Loader2, AlertCircle, ArrowRight, Dumbbell, Activity,
  Flame, Rocket, Star, Heart, CheckCircle2, ChevronRight, Zap, Play, Plus,
  Calendar as CalendarIcon, BarChart3, Clock, Video as VideoIcon, QrCode, History
} from 'lucide-react';
import { UserProfile, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user, showToast, onTabChange }: { user: UserProfile; showToast: any; onTabChange?: (tab: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streakCount, setStreakCount] = useState(user.streak_count ?? user.streak ?? 0);
  const [todaySession, setTodaySession] = useState<CalendarSession | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

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

  useEffect(() => {
    if (user.last_checkin) {
      const last = new Date(user.last_checkin);
      const now = new Date();
      const sameDay = last.toDateString() === now.toDateString();
      setHasCheckedIn(sameDay);
    }
  }, [user.last_checkin]);

  const handleCheckIn = async () => {
    const now = new Date().toISOString();
    const newStreak = streakCount + 1;
    setHasCheckedIn(true);
    setStreakCount(newStreak);

    try {
        await supabase.from('profiles').update({
          last_checkin: now,
          streak_count: newStreak
        }).eq('id', user.id);

        // Explicitly map the check in to the calendar sessions database to allow global admin tracking
        await supabase.from('calendar_sessions').insert({
            user_id: user.id,
            source_type: 'check_in',
            title: 'Daily Protocol Check-In',
            session_date: now.split('T')[0],
            session_time: now.split('T')[1].split('.')[0],
            duration_minutes: 0,
            status: 'completed'
        });
    } catch(err) {
        console.error("Check in synchronization failed", err);
    }
    
    setShowReward(true);
  };

  const fetchStats = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [todayRes, weekRes, requestsRes] = await Promise.all([
        supabase.from('calendar_sessions')
          .select('*').eq('user_id', user.id).eq('session_date', todayStr)
          .order('created_at', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('calendar_sessions')
          .select('id, duration_minutes, status').eq('user_id', user.id),
        supabase.from('service_requests')
          .select('*').eq('user_id', user.id).eq('status', 'pending')
      ]);

      const completedSessions = weekRes.data?.filter(s => s.status === 'completed') || [];
      const totalMinutes = completedSessions.reduce((a, c) => a + (c.duration_minutes || 0), 0);
      const hours = Math.floor(totalMinutes / 60);

      setTodaySession(todayRes.data ?? null);
      setPendingRequests(requestsRes.data || []);
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

  useEffect(() => { fetchStats(); }, [user.id]);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="text-brand-teal animate-spin" size={40} />
    </div>
  );

  const firstName = user.full_name?.split(' ')[0] || 'Athlete';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const lastCheckin = user.last_checkin ? new Date(user.last_checkin) : null;
  const missedYesterday = !lastCheckin || (lastCheckin.toDateString() !== yesterday.toDateString() && !hasCheckedIn);

  return (
    <div className="space-y-8 fade-in pb-20">

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
              </div>

              {hasCheckedIn ? (
                /* STATE 4 — COMPLETED TODAY */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-emerald-400 leading-none">
                    Workout Completed
                  </h2>
                  <p className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Great work today.
                  </p>
                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={() => navigate('calendar')}
                      className="w-full py-5 bg-[#111] border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <Plus size={16} /> Add Another Workout
                    </button>
                    <button
                      onClick={() => setShowReward(true)}
                      className="w-full py-5 bg-transparent text-white/40 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              ) : missedYesterday ? (
                /* STATE 2 — MISSED YESTERDAY */
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                    You missed <span className="text-brand-coral">yesterday</span>
                  </h2>
                  <p className="text-brand-coral text-sm font-bold uppercase tracking-widest mt-2">
                    Let's get back on track
                  </p>
                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={handleCheckIn}
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
                      onClick={handleCheckIn}
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
                      onClick={handleCheckIn}
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
          { label: 'Rank', value: user.role === 'admin' ? 'Elite' : 'Athlete', icon: Zap, color: 'text-brand-teal', bg: 'bg-brand-teal/5', action: () => navigate('membership') }
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
            const daySessions = sessions => sessions?.filter(s => s.session_date === dayStr) ?? [];
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

      {/* =================== QUICK ACTIONS & PENDING REQUESTS =================== */}
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

      {/* =================== REWARD MODAL =================== */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="card-gradient w-full max-w-sm p-12 text-center space-y-8 rounded-[4rem] border border-brand-teal/30 shadow-[0_0_100px_rgba(45,212,191,0.2)]"
            >
              <div className="w-24 h-24 bg-brand-teal/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-teal border border-brand-teal/20 shadow-glow-teal">
                <Rocket size={48} className="animate-bounce" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black uppercase tracking-tighter">System <span className="text-brand-teal">Locked</span></h3>
                <p className="text-xl font-bold uppercase tracking-widest">🔥 {streakCount} Day Streak!</p>
                <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold leading-relaxed px-4">
                  Your discipline is compounding. 80% of members didn't check in today. You did.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowReward(false)}
                  className="w-full py-5 bg-brand-teal text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-glow-teal"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => { setShowReward(false); navigate('progress'); }}
                  className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-all font-black"
                >
                  What's Next? View Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
