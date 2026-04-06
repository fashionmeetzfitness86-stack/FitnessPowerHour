import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar as CalendarIcon, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle, Loader2, AlertCircle, ArrowRight, User, Dumbbell, Activity, UserPlus, PlaySquare, LineChart
} from 'lucide-react';
import { UserProfile, UserVideoUpload, CalendarSession, ServiceRequest } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user }: { user: UserProfile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: null as CalendarSession | null,
    pendingAuths: [] as any[],
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
                
        supabase.from('bookings')
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
      <>
        {/* Header / Intro */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-brand-teal/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            {user.profile_image ? (
              <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-black flex items-center justify-center text-3xl font-black text-brand-teal">
                {user.full_name?.[0] || 'M'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
              Welcome, <span className="text-brand-teal">{user.full_name?.split(' ')[0] || 'Athlete'}</span>
            </h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 bg-white/5 inline-block px-3 py-1 rounded">
              {user.tier || 'Basic'} Membership Active
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <button onClick={() => window.location.hash = '#/profile#programs'} className="p-6 bg-brand-teal text-black rounded-3xl hover:scale-105 transition-all text-center flex flex-col items-center gap-3">
              <PlaySquare size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Start Program</span>
           </button>
           <button onClick={() => window.location.hash = '#/profile#progress'} className="p-6 bg-brand-coral text-black rounded-3xl hover:scale-105 transition-all text-center flex flex-col items-center gap-3">
              <LineChart size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Log Progress</span>
           </button>
           <button onClick={() => window.location.hash = '#/profile#calendar'} className="p-6 bg-white/5 text-white border border-white/10 rounded-3xl hover:bg-brand-teal/10 hover:border-brand-teal/50 hover:text-brand-teal transition-all text-center flex flex-col items-center gap-3">
              <CalendarIcon size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Book Service</span>
           </button>
           <a href="#/shop" className="p-6 bg-white/5 text-white border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-center flex flex-col items-center gap-3">
              <ShoppingBag size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Visit Store</span>
           </a>
        </div>

        {/* Next Session & Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-gradient p-8 space-y-6 flex flex-col justify-between rounded-[2rem]">
            <div className="flex items-center gap-4 text-brand-teal">
              <CalendarIcon size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest">Next Session</h3>
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
                 <p className="text-sm font-bold uppercase tracking-tight text-white/40 italic">Nothing scheduled yet.</p>
              )}
            </div>
            <button onClick={() => window.location.hash = '#/profile#calendar'} className="w-full py-4 bg-white/5 text-white text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-white/10 mt-auto">
              View Calendar
            </button>
          </div>

          <div className="card-gradient p-8 space-y-6 flex flex-col justify-between rounded-[2rem]">
            <div className="flex items-center gap-4 text-brand-coral">
              <Activity size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest">Progress Summary</h3>
            </div>
            <div className="flex justify-around items-center py-4">
               <div className="text-center space-y-1">
                  <p className="text-4xl font-black text-white">{streakCount}</p>
                  <p className="text-[8px] uppercase tracking-widest text-brand-coral font-bold">Day Streak</p>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="text-center space-y-1">
                  <p className="text-4xl font-black text-white">{stats.sessionsThisWeek}</p>
                  <p className="text-[8px] uppercase tracking-widest text-brand-teal font-bold">Sessions This Week</p>
               </div>
            </div>
            {!hasCheckedInToday ? (
              <button onClick={handleDailyCheckIn} className="w-full py-4 bg-brand-coral text-black text-[10px] uppercase font-black tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(251,113,133,0.4)] mt-auto flex justify-center gap-2 items-center">
                 <CheckCircle size={14} /> Check In Today
              </button>
            ) : (
              <div className="w-full py-4 text-brand-teal text-[10px] uppercase font-black tracking-widest rounded-xl bg-brand-teal/10 flex justify-center items-center gap-2 mt-auto">
                 <CheckCircle size={14} /> Checked in for today
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests Section */}
        {stats.pendingAuths.length > 0 && (
           <div className="card-gradient p-8 rounded-[2rem] space-y-6 mt-8">
             <div className="flex items-center gap-4 text-amber-500">
               <Shield size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">Pending Requests</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {stats.pendingAuths.map((req, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <div>
                     <p className="text-sm font-bold uppercase tracking-tight">{req.service_name}</p>
                     <p className="text-[10px] text-white/40 font-mono mt-1">{req.date} @ {req.time}</p>
                   </div>
                   <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                 </div>
               ))}
             </div>
           </div>
        )}
      </>
      )}
    </div>
  );
};
