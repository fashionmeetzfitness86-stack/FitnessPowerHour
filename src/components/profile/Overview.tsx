import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle, Loader2, AlertCircle, ArrowRight, User
} from 'lucide-react';
import { UserProfile, UserVideoUpload, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

export const Overview = ({ user }: { user: UserProfile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: null as CalendarSession | null,
    latestMedia: null as UserVideoUpload | null,
    sessionsThisWeek: 0,
    activeProgram: 'FMF Protocol'
  });

  const fetchStats = async () => {
    try {
      const now = new Date().toISOString();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString();

      const [upcomingRes, mediaRes, weekRes, programRes] = await Promise.all([
        supabase.from('calendar_sessions').select('*').eq('user_id', user.id).gte('date', now.split('T')[0]).order('date', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('user_video_uploads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('calendar_sessions').select('id').eq('user_id', user.id).eq('status', 'completed').gte('date', lastWeekStr.split('T')[0]),
        supabase.from('user_program_assignments').select(`*, program:programs(*)`).eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
      ]);

      setStats({
        upcoming: upcomingRes.data,
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

  // Calculate completion percentage based on filled fields
  const profileFields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'profile_image', label: 'Profile Photo' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
    { key: 'workout_style', label: 'Workout Style' },
    { key: 'training_goals', label: 'Training Goals' },
    { key: 'bio', label: 'Personal Bio' }
  ];
  
  const missingFields = profileFields.filter(f => !(user as any)[f.key]);
  const completionPercentage = Math.round(((profileFields.length - missingFields.length) / profileFields.length) * 100);

  const streak = user.streak || 0;
  const sessionsThisWeek = stats.sessionsThisWeek;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Dashboard <span className="text-brand-teal">Overview</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Welcome back, {user.full_name?.split(' ')[0] || 'Athlete'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-coral/30 min-w-[100px]">
            <span className="text-brand-coral text-2xl font-bold">{streak}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40">Day Streak</span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-teal/30 min-w-[100px]">
            <span className="text-brand-teal text-2xl font-bold">{sessionsThisWeek}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40">This Week</span>
          </div>
        </div>
      </div>

      {/* Completion ProgressBar */}
      <div className="card-gradient p-10 border-white/5 space-y-8 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <User size={120} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Profile <span className="text-brand-teal">Completion</span></h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Optimize your neural identity for maximum integration.</p>
          </div>
          <div className="text-right">
             <span className="text-5xl font-black text-brand-teal tracking-tighter">{completionPercentage}%</span>
             <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black mt-1">Status: {completionPercentage === 100 ? 'OPTIMIZED' : 'INCOMPLETE'}</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${completionPercentage}%` }} 
              className="h-full bg-brand-teal shadow-glow-teal"
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          {missingFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-coral">
                <AlertCircle size={14} />
                <span className="text-[10px] uppercase tracking-widest font-black">Missing Neural Markers:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {missingFields.map(f => (
                  <span key={f.key} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-white/40 font-bold hover:border-brand-teal hover:text-white transition-all cursor-default">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
           <Loader2 className="text-brand-teal animate-spin" size={40} />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Membership & Billing summary */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-brand-teal">
            <Shield size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Membership</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Current Plan</p>
              <p className="text-xl font-bold tracking-tight uppercase">{user.tier || 'Basic'} Tier</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest">Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Summary */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-brand-coral">
            <Calendar size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Training</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Active Program</p>
              <p className="text-lg font-bold tracking-tight uppercase line-clamp-1">{stats.activeProgram}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Upcoming Workout</p>
              {stats.upcoming ? (
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-brand-coral" />
                  <p className="text-xs font-bold opacity-80">{new Date(stats.upcoming.date).toLocaleDateString()} - {stats.upcoming.title}</p>
                </div>
              ) : (
                <p className="text-xs font-bold opacity-40">No Sessions Scheduled</p>
              )}
            </div>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-white">
            <Video size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Media Audit</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Latest Submission</p>
              {stats.latestMedia ? (
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg mt-2 cursor-pointer border border-transparent hover:border-brand-teal/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-teal/20 rounded flex items-center justify-center text-brand-teal">
                      <Video size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">{stats.latestMedia.caption || 'Neural Check-in'}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">{new Date(stats.latestMedia.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] uppercase font-bold ${stats.latestMedia.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stats.latestMedia.status}
                  </span>
                </div>
              ) : (
                <p className="text-xs font-bold opacity-40 mt-2">No Media Uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Retreats & Store */}
        <div className="card-gradient p-8 space-y-6 md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="space-y-4 md:pr-8">
              <div className="flex items-center gap-4 mb-6">
                <MapPin size={20} className="text-brand-teal" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Immersion Status</h3>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Upcoming Itinerary</p>
              <div className="p-6 bg-white/5 rounded-xl text-center border-dashed border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Awaiting Confirmed Retreats</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-8 md:pt-0 md:pl-8">
              <div className="flex items-center gap-4 mb-6">
                <ShoppingBag size={20} className="text-brand-coral" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Active Orders</h3>
              </div>
              <div className="p-6 bg-white/5 rounded-xl text-center border-dashed border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40">No recent orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
