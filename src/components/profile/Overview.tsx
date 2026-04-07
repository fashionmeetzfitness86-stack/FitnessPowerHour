import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar as CalendarIcon, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle, Loader2, AlertCircle, ArrowRight, User, Dumbbell, Activity, UserPlus, QrCode, Scan
} from 'lucide-react';
import { UserProfile, UserVideoUpload, CalendarSession, ServiceRequest } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user, setShowOnboarding }: { user: UserProfile, setShowOnboarding?: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: null as CalendarSession | null,
    pendingAuths: [] as any[],
    trainerRequests: [] as any[],
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

      const [upcomingRes, pendingRes, mediaRes, weekRes, programRes, trainerRequestsRes] = await Promise.all([
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
                
        supabase.from('user_program_assignments').select(`*, program:programs(*)`).eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle(),
        
        supabase.from('trainer_requests').select('*, athlete:users!athlete_id(full_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2)
      ]);

      setStats({
        upcoming: upcomingRes.data,
        pendingAuths: pendingRes.data || [],
        latestMedia: mediaRes.data,
        sessionsThisWeek: weekRes.data?.length || 0,
        activeProgram: (programRes.data as any)?.program?.title || 'System Protocol',
        trainerRequests: trainerRequestsRes.data || []
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
      {!hasCheckedInToday && (
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

      {/* COMPULSORY ONBOARDING TRIGGER (INTENT DRIVEN) */}
      {!user.onboarding_completed && setShowOnboarding && (
         <div className="bg-brand-teal/10 border border-brand-teal/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
            <div>
               <h3 className="text-xl font-black uppercase text-brand-teal tracking-tighter">Protocol Uninitialized</h3>
               <p className="text-xs font-bold text-white/60 tracking-widest uppercase mt-1">Initialize your kinetic target to tailor the FMF platform to your goals.</p>
            </div>
            <button onClick={() => setShowOnboarding(true)} className="w-full md:w-auto px-8 py-4 bg-brand-teal text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all flex items-center justify-center gap-2">
               <Shield size={16} /> Initialize Protocol
            </button>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SYSTEM IDENTITY GATE (QR MATRIX) */}
        <div className="card-gradient p-8 flex flex-col items-center justify-center text-center space-y-6 border-brand-teal/20 relative overflow-hidden group rounded-[3rem]">
           <div className="absolute inset-0 bg-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
           <div className="w-40 h-40 bg-white p-3 rounded-2xl relative shadow-[0_0_50px_rgba(45,212,191,0.2)]">
              {/* Simulated QR Code via Lucide + Pattern */}
              <div className="w-full h-full border-4 border-black flex items-center justify-center relative bg-white">
                 <QrCode size={100} className="text-black" />
                 <div className="absolute top-0 right-0 w-4 h-4 bg-black" />
                 <div className="absolute bottom-0 left-0 w-4 h-4 bg-black" />
              </div>
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal mb-2">Member ID Authenticator</p>
              <h4 className="text-sm font-bold uppercase tracking-widest">{user.full_name || 'Protocol Member'}</h4>
              <p className="text-white/40 text-[8px] uppercase tracking-widest mt-1 font-mono">{user.id.substring(0, 12).toUpperCase()}</p>
           </div>
           <p className="text-white/40 text-[10px] uppercase font-bold px-4 leading-relaxed tracking-wider">Present this matrix at any FMF outpost or for personal training verification.</p>
        </div>

        {/* Next Session + Quick Actions Combined */}
        <div className="lg:col-span-2 space-y-8">
            <div className="card-gradient p-8 border-white/10 hover:border-brand-teal/30 transition-all cursor-pointer group rounded-[3rem]" onClick={() => window.location.hash = '#/profile#calendar'}>
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand-teal/20 text-brand-teal rounded-xl group-hover:bg-brand-teal group-hover:text-black transition-all">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                         <h3 className="text-xs font-black uppercase tracking-widest">Protocol Schedule</h3>
                         <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Synchronization points are tracked below.</p>
                      </div>
                   </div>
                   <ArrowRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                </div>
                
                {stats.upcoming ? (
                   <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                         <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">{stats.upcoming.title}</h4>
                         <div className="flex items-center justify-center md:justify-start gap-4 text-white/60 text-[10px] font-mono tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Clock size={12} className="text-brand-teal" /> {stats.upcoming.session_date}</span>
                            <span className="flex items-center gap-2"><Activity size={12} className="text-brand-coral" /> {stats.upcoming.session_time || 'Check-in'}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-brand-teal text-black rounded-full">Approved</span>
                         <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <Scan size={16} />
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 border-dashed text-center">
                      <p className="text-sm font-bold uppercase tracking-tight text-white/20 italic">No Sessions Initialized</p>
                      <button onClick={(e) => { e.stopPropagation(); window.location.hash = '#/profile#calendar'; }} className="mt-4 text-brand-teal text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Request Session Access</button>
                   </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => window.location.hash = '#/profile#calendar'} className="bg-brand-coral/10 hover:bg-brand-coral hover:text-black border border-brand-coral/30 p-6 rounded-[2rem] flex items-center gap-6 transition-all text-left group">
                  <Activity size={24} className="text-brand-coral group-hover:text-black" />
                  <div>
                      <p className="font-black text-sm uppercase tracking-tight">Request Recovery</p>
                      <p className="text-[8px] uppercase tracking-widest opacity-60">Flex Mob 305 Access</p>
                  </div>
               </button>
               <button onClick={() => window.location.hash = '#/profile#calendar'} className="bg-brand-teal/10 hover:bg-brand-teal hover:text-black border border-brand-teal/30 p-6 rounded-[2rem] flex items-center gap-6 transition-all text-left group">
                  <UserPlus size={24} className="text-brand-teal group-hover:text-black" />
                  <div>
                      <p className="font-black text-sm uppercase tracking-tight">Personal Training</p>
                      <p className="text-[8px] uppercase tracking-widest opacity-60">1-on-1 Protocol Launch</p>
                  </div>
               </button>
            </div>
        </div>

        {/* Pending Requests */}
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer rounded-[3rem]" onClick={() => window.location.hash = '#/profile#calendar'}>
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
                        <span className="text-[10px] font-bold uppercase text-white/80">{r.service_subtype?.replace('_', ' ') || r.service_name}</span>
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
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer rounded-[3rem]" onClick={() => window.location.hash = '#/profile#programs'}>
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

        {/* Trainer Requests */}
        <div className="card-gradient p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all md:col-span-2 lg:col-span-1 cursor-pointer rounded-[3rem]" onClick={() => window.location.hash = '#/athletes'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-brand-teal">
              <User size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Trainer Protocol</h3>
            </div>
          </div>
          <div>
            {stats.trainerRequests.length > 0 ? (
               <div className="space-y-4">
                  {stats.trainerRequests.map((r: any) => (
                     <div key={r.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-white/80">Athlete: {r.athlete?.full_name}</span>
                        <span className={`text-[8px] tracking-widest font-mono self-start px-2 py-0.5 rounded uppercase ${
                           r.status === 'approved' ? 'text-brand-teal border border-brand-teal/20 bg-brand-teal/10' :
                           r.status === 'rejected' ? 'text-brand-coral border border-brand-coral/20 bg-brand-coral/10' :
                           'text-amber-500 border border-amber-500/20 bg-amber-500/10'
                        }`}>
                           {r.status}
                        </span>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-sm font-bold uppercase tracking-tight text-white/40 italic">No Active Trainers</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
