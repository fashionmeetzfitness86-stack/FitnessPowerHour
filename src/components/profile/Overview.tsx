import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar as CalendarIcon, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle, Loader2, AlertCircle, ArrowRight, User, Dumbbell, Activity, UserPlus
} from 'lucide-react';
import { UserProfile, UserVideoUpload, CalendarSession, ServiceRequest } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user }: { user: UserProfile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: null as CalendarSession | null,
    pendingAuths: [] as ServiceRequest[],
    latestMedia: null as UserVideoUpload | null,
    sessionsThisWeek: 0,
    activeProgram: 'FMF Protocol'
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streakCount, setStreakCount] = useState(user.streak_count || 0);

  useEffect(() => {
     const today = new Date().toISOString().split('T')[0];
     if (user.last_checkin && user.last_checkin.startsWith(today)) {
        setHasCheckedInToday(true);
     }
  }, [user.last_checkin]);

  const handleDailyCheckIn = async () => {
      const today = new Date().toISOString();
      const newStreak = streakCount + 1;
      
      setHasCheckedInToday(true);
      setStreakCount(newStreak);

      await supabase.from('profiles').update({
         last_checkin: today,
         streak_count: newStreak
      }).eq('id', user.id);
  };

  const fetchStats = async () => {
    try {
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString();

      const [upcomingRes, pendingRes, mediaRes, weekRes, programRes] = await Promise.all([
        supabase.from('calendar_sessions')
                .select('*')
                .eq('user_id', user.id)
                .gte('session_date', todayStr)
                .order('session_date', { ascending: true })
                .limit(1).maybeSingle(),
                
        supabase.from('service_requests')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'pending'),

        supabase.from('user_video_uploads')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1).maybeSingle(),
                
        supabase.from('calendar_sessions')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .gte('session_date', lastWeekStr.split('T')[0]),
                
        supabase.from('user_program_assignments').select(`*, program:programs(*)`).eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
      ]);

      setStats({
        upcoming: upcomingRes.data,
        pendingAuths: pendingRes.data || [],
        latestMedia: mediaRes.data,
        sessionsThisWeek: weekRes.data?.length || 0,
        activeProgram: (programRes.data as any)?.program?.title || 'System Protocol'
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

  const profileFields = [
    { key: 'full_name', label: 'Full Name' }, { key: 'phone', label: 'Phone Number' }, { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' }, { key: 'profile_image', label: 'Profile Photo' }, { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' }, { key: 'workout_style', label: 'Workout Style' }, { key: 'training_goals', label: 'Goals' }
  ];
  
  const missingFields = profileFields.filter(f => !(user as any)[f.key]);
  const completionPercentage = Math.round(((profileFields.length - missingFields.length) / profileFields.length) * 100);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
            System <span className="text-brand-teal">Overview</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Welcome back, {user.full_name?.split(' ')[0] || 'Athlete'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-coral/30 min-w-[100px] hover:border-brand-coral/50 transition-all rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-coral/5 blur-xl pointer-events-none group-hover:bg-brand-coral/10 transition-all" />
            <span className="text-brand-coral text-2xl font-black relative z-10">{streakCount}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold relative z-10">Day Streak</span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-teal/30 min-w-[100px] hover:border-brand-teal/50 transition-all rounded-3xl">
            <span className="text-brand-teal text-2xl font-black">{stats.sessionsThisWeek}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">This Week</span>
          </div>
        </div>
      </div>
      
      {/* DAILY CHECK-IN LOOP */}
      {!hasCheckedInToday && !loading && (
         <div className="bg-brand-coral/10 border border-brand-coral/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(251,113,133,0.1)]">
            <div>
               <h3 className="text-xl font-black uppercase text-brand-coral tracking-tighter">Did you train today?</h3>
               <p className="text-xs font-bold text-white/60 tracking-widest uppercase mt-1">Don't break your {streakCount}-day streak. Log your activity.</p>
            </div>
            <button onClick={handleDailyCheckIn} className="w-full md:w-auto px-8 py-4 bg-brand-coral text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(251,113,133,0.4)] transition-all flex items-center justify-center gap-2">
               <CheckCircle size={16} /> Check In Now
            </button>
         </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-40">
           <Loader2 className="text-brand-teal animate-spin" size={40} />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions (Dashboard Integration) */}
        <div className="card-gradient p-8 space-y-6 md:col-span-2 lg:col-span-3 border border-brand-teal/10 relative overflow-hidden rounded-[3rem]">
           <div className="absolute inset-0 bg-brand-teal/5 blur-3xl pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Quick Actions</h3>
                 <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm mt-1">Execute systemic scheduling vectors instantly.</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                 <button onClick={() => window.location.hash = '#/profile#calendar'} className="flex items-center gap-3 px-6 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all flex-1 md:flex-none">
                    <Dumbbell size={14} /> Add Workout
                 </button>
                 <button onClick={() => window.location.hash = '#/profile#calendar'} className="flex items-center gap-3 px-6 py-4 bg-brand-coral text-black text-[10px] uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] transition-all flex-1 md:flex-none">
                    <Activity size={14} /> Book Recovery
                 </button>
                 <button onClick={() => window.location.hash = '#/profile#calendar'} className="flex items-center gap-3 px-6 py-4 bg-white/10 text-white text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-white/20 transition-all flex-1 md:flex-none drop-shadow-xl border border-white/10">
                    <UserPlus size={14} /> Book Training
                 </button>
              </div>
           </div>
        </div>

        {/* Next Session */}
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer" onClick={() => window.location.hash = '#/profile#calendar'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-brand-teal">
              <CalendarIcon size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Next Session</h3>
            </div>
            <ArrowRight size={14} className="text-white/20" />
          </div>
          <div>
            {stats.upcoming ? (
               <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">{stats.upcoming.title}</h4>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                     <Clock size={12} className="text-brand-teal" /> {stats.upcoming.session_date} @ {stats.upcoming.session_time || 'ALL DAY'}
                  </div>
               </div>
            ) : (
               <p className="text-sm font-bold uppercase tracking-tight text-white/40 italic">No Sessions Booked</p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer" onClick={() => window.location.hash = '#/profile#calendar'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-amber-500">
              <Clock size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Pending Requests</h3>
            </div>
            {stats.pendingAuths.length > 0 && <span className="bg-amber-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full drop-shadow-lg">{stats.pendingAuths.length}</span>}
          </div>
          <div>
            {stats.pendingAuths.length > 0 ? (
               <div className="space-y-4">
                  {stats.pendingAuths.slice(0, 2).map(r => (
                     <div key={r.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-white/80">{r.service_subtype.replace('_', ' ')}</span>
                        <span className="text-[8px] tracking-widest font-mono text-amber-500/70 border border-amber-500/10 self-start px-2 py-0.5 rounded uppercase">Awaiting Auth</span>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-sm font-bold uppercase tracking-tight text-white/40 italic">All Cleared</p>
            )}
          </div>
        </div>

        {/* Active Program */}
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer" onClick={() => window.location.hash = '#/profile#programs'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-brand-coral">
              <Activity size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Active Program</h3>
            </div>
            <ArrowRight size={14} className="text-white/20" />
          </div>
          <div>
             <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-2">{stats.activeProgram}</h4>
             <p className="text-[10px] tracking-widest uppercase text-brand-coral font-bold bg-brand-coral/10 inline-block px-2 py-1 rounded">System Protocol Active</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
