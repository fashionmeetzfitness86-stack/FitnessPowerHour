import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Calendar as CalendarIcon, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle, Loader2, AlertCircle, ArrowRight, User as UserIcon, Dumbbell, Activity, UserPlus, QrCode, Scan, Settings, PlayCircle, BarChart3, PlusCircle, Flame, Rocket, Star, Heart, CheckCircle2, ChevronRight, LayoutDashboard, History, Zap, Play
} from 'lucide-react';
import { UserProfile, UserVideoUpload, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [loading, setLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState<'streak' | 'workout' | 'checkin'>('checkin');
  
  const [stats, setStats] = useState({
    upcoming: null as CalendarSession | null,
    pendingAuths: [] as any[],
    latestMedia: null as UserVideoUpload | null,
    sessionsThisWeek: 0,
    totalWorkouts: 0,
    trainingTime: '0h',
    videosWatched: 0,
    activeProgramTitle: 'FMF System Protocol',
    activePhase: 'Base'
  });

  const [hasCheckedInRecently, setHasCheckedInRecently] = useState(false);
  const [streakCount, setStreakCount] = useState(user.streak_count || 0);

  useEffect(() => {
     if (user.last_checkin) {
        const lastCheckin = new Date(user.last_checkin);
        const diff = Date.now() - lastCheckin.getTime();
        const sixHours = 6 * 60 * 60 * 1000;
        if (diff < sixHours) {
            setHasCheckedInRecently(true);
        }
     }
  }, [user.last_checkin]);

  const handleDailyCheckIn = async () => {
      const today = new Date().toISOString();
      const newStreak = streakCount + 1;
      
      setHasCheckedInRecently(true);
      setStreakCount(newStreak);
      setRewardType('checkin');
      setShowReward(true);

      await supabase.from('profiles').update({
         last_checkin: today,
         streak_count: newStreak
      }).eq('id', user.id);
  };

  const fetchStats = async () => {
    try {
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];

      const [upcomingRes, moviesRes, weekRes, programRes] = await Promise.all([
        supabase.from('calendar_sessions').select('*').eq('user_id', user.id).gte('session_date', todayStr).order('session_date', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('video_views').select('*').eq('user_id', user.id),
        supabase.from('calendar_sessions').select('id, duration_minutes, status').eq('user_id', user.id),
        supabase.from('user_program_assignments').select(`*, program:program_templates(*)`).eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
      ]);

      const completedWeek = weekRes.data?.filter(s => s.status === 'completed') || [];
      const totalMinutes = completedWeek.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
      const hours = Math.floor(totalMinutes / 60);

      setStats({
        upcoming: upcomingRes.data,
        pendingAuths: [],
        latestMedia: null,
        sessionsThisWeek: completedWeek.length,
        totalWorkouts: completedWeek.length,
        trainingTime: `${hours}h ${totalMinutes % 60}m`,
        videosWatched: moviesRes.data?.length || 0,
        activeProgramTitle: (programRes.data as any)?.program?.title || 'FMF Protocol',
        activePhase: (programRes.data as any)?.program?.phase || 'Alpha'
      });
    } catch (err) {
      console.error('Error fetching overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="text-brand-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12 fade-in pb-20">
      
      {/* TRIGGER: TODAY'S SESSION (STEP 1) */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal to-brand-coral rounded-[3rem] blur opacity-20" />
        <div className="relative card-gradient p-10 rounded-[3rem] border-brand-teal/20 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-brand-teal">
                    <Zap size={18} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Today's Session</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    {stats.upcoming?.title || `${user.workout_style || 'Athletic'} Protocol`}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/50 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={16} /> {stats.upcoming?.duration_minutes || 25} MIN</span>
                    <span className="flex items-center gap-2"><Trophy size={16} /> PHASE: {stats.activePhase}</span>
                    <span className="flex items-center gap-2 text-brand-coral"><Flame size={16} /> STATUS: NOT COMPLETED</span>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                    onClick={() => {
                        window.location.hash = '#/profile#calendar';
                        if (showToast) showToast('Session Initialized. Clock Starting.', 'success');
                    }}
                    className="flex-1 sm:flex-none px-12 py-6 bg-brand-teal text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:shadow-glow-teal hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                    <Play size={18} fill="black" /> Start workout
                </button>
                {!hasCheckedInRecently && (
                    <button 
                        onClick={handleDailyCheckIn}
                        className="flex-1 sm:flex-none px-12 py-6 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                        <CheckCircle size={18} /> Check-In
                    </button>
                )}
            </div>
        </div>
      </section>

      {/* PROGRESS MATRIX (STEP 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Workouts This Week', value: stats.sessionsThisWeek, icon: Activity, color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
            { label: 'Current Streak', value: `${streakCount} Days`, icon: Flame, color: 'text-brand-coral', bg: 'bg-brand-coral/5' },
            { label: 'Time Trained', value: stats.trainingTime, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'System Progress', value: '42%', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/5' }
        ].map((s, idx) => (
            <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className={`card-gradient p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center text-center group transition-all ${s.bg}`}
            >
                <div className={`p-4 rounded-2xl ${s.bg} mb-4 group-hover:scale-110 transition-transform`}>
                    <s.icon size={24} className={s.color} fill={s.color === 'text-brand-teal' ? 'currentColor' : 'none'} fillOpacity={0.2} />
                </div>
                <span className="text-3xl font-black uppercase tracking-tighter text-white">{s.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-2">{s.label}</span>
            </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MATRIX CALENDAR PREVIEW (STEP 6) */}
        <div className="lg:col-span-2 card-gradient p-10 rounded-[3rem] border-white/10 flex flex-col space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Consistency Matrix</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Don't break the chain.</p>
                </div>
                <button onClick={() => window.location.hash = '#/profile#calendar'} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-brand-teal hover:bg-white/10 transition-all">
                    <ArrowRight size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, i) => {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const dayName = days[i];
                    const isToday = i === new Date().getDay();
                    const isCompleted = i < new Date().getDay(); // Placeholder logic
                    
                    return (
                        <div key={i} className="space-y-3 text-center">
                            <span className={`text-[9px] uppercase font-black tracking-widest ${isToday ? 'text-brand-teal' : 'text-white/20'}`}>{dayName}</span>
                            <div className={`aspect-square rounded-2xl border flex items-center justify-center transition-all ${
                                isToday ? 'border-brand-teal bg-brand-teal/10 shadow-glow-teal' : 
                                isCompleted ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 
                                'border-white/5 bg-white/[0.02] text-white/10'
                            }`}>
                                {isCompleted ? <CheckCircle2 size={16} /> : isToday ? <Activity size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 text-[9px] uppercase tracking-widest text-white/40 font-black justify-center">
                <Flame size={12} className="text-brand-coral" /> {streakCount} Day streak active. Maintain frequency.
            </div>
        </div>

        {/* IDENTITY QR (STEP 9) */}
        <div className="card-gradient p-8 flex flex-col items-center justify-center text-center space-y-6 border-brand-teal/20 relative overflow-hidden group rounded-[3rem]">
           <div className="absolute inset-0 bg-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
           <div className="w-44 h-44 bg-white p-4 rounded-3xl relative shadow-[0_0_50px_rgba(45,212,191,0.2)] group-hover:rotate-1 transition-transform">
              <div className="w-full h-full border-4 border-black flex items-center justify-center relative bg-white">
                 <QrCode size={110} className="text-black" />
              </div>
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal mb-2">Athlete Verification</p>
              <h4 className="text-lg font-black uppercase tracking-widest">{user.full_name || 'Protocol Athlete'}</h4>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-white/40 border border-white/10">{stats.activePhase} Tier</span>
                <span className="px-3 py-1 bg-brand-teal/10 rounded-full text-[8px] font-black uppercase tracking-widest text-brand-teal border border-brand-teal/20">Verified</span>
              </div>
           </div>
        </div>
      </div>

      {/* WEEKLY RESET LOOP (STEP 8) */}
      <section className="card-gradient p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 text-white/5 -rotate-12 translate-x-10 -translate-y-10">
            <History size={180} />
        </div>
        <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Weekly <span className="text-brand-coral">Summary</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Performance audit for the current cycle.</p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-brand-coral leading-none">{stats.sessionsThisWeek}</span>
                    <p className="text-[8px] uppercase tracking-widest text-white/40 font-black">Total Actions</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                    <Star className="text-amber-500" size={24} fill="currentColor" fillOpacity={0.2} />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Consistency Hit</p>
                        <p className="text-sm font-bold uppercase tracking-tight">You trained more than 80% of users this week</p>
                    </div>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                    <Rocket className="text-brand-teal" size={24} fill="currentColor" fillOpacity={0.2} />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Velocity Meter</p>
                        <p className="text-sm font-bold uppercase tracking-tight">Focusing on {user.workout_style || 'Athletic'} performance</p>
                    </div>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                    <Heart className="text-brand-coral" size={24} fill="currentColor" fillOpacity={0.2} />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Identity Lock</p>
                        <p className="text-sm font-bold uppercase tracking-tight">You are building discipline, {user.full_name?.split(' ')[0]}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center pt-4">
                <button 
                  onClick={() => window.location.hash = '#/profile#programs'}
                  className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal hover:text-white transition-all group"
                >
                    Continue System Protocol <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
      </section>

      {/* REWARD MODAL (STEP 4) */}
      <AnimatePresence>
        {showReward && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className="card-gradient w-full max-w-sm p-12 text-center space-y-8 rounded-[4rem] border-brand-teal/50 shadow-[0_0_100px_rgba(45,212,191,0.2)]"
                >
                    <div className="w-24 h-24 bg-brand-teal/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-teal border border-brand-teal/20 shadow-glow-teal">
                        <Rocket size={48} className="animate-bounce" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black uppercase tracking-tighter">System <span className="text-brand-teal">Locked</span></h3>
                        <p className="text-xl font-bold text-white tracking-widest uppercase">
                            {rewardType === 'checkin' ? `🔥 ${streakCount} DAY STREAK!` : '🚀 WORKOUT COMPLETED!'}
                        </p>
                        <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold leading-relaxed px-4">
                            Your discipline is building momentum. 80% of members failed to check-in today. You are the outlier.
                        </p>
                    </div>
                    <div className="space-y-4 pt-4">
                        <button 
                            onClick={() => setShowReward(false)}
                            className="w-full py-6 bg-brand-teal text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-glow-teal"
                        >
                            Next Target
                        </button>
                        <button 
                            onClick={() => { setShowReward(false); window.location.hash = '#/profile#programs'; }}
                            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all font-black"
                        >
                            Continue Routine
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
