import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Activity, Target, Clock, Play, Camera, CheckCircle, Flame, Calendar as CalendarIcon, Video, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';
import { MediaCapture } from '../MediaCapture';

export const Progress = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchSessions();
  }, [user?.id]);

  // Derived Stats
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.source_type === 'check-in');
  const streak = user.streak || 0;
  const hoursTrained = Math.floor(
     sessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) / 60
  );
  const videosWatched = sessions.filter(s => s.source_type === 'video').length;

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      {/* 1. STATS (TOP SECTION) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Workouts', value: completedSessions.length, icon: Target, color: 'text-brand-coral', bg: 'bg-brand-coral/10' },
          { label: 'Day Streak', value: streak, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Hours Trained', value: hoursTrained, icon: Clock, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
          { label: 'Videos Watched', value: videosWatched, icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 flex flex-col items-center text-center">
              <stat.icon size={24} className={`${stat.color} mb-3`} />
              <div className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-1">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2 & 3. VISUAL PROGRESS & HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        {/* Left Column: Calendar History */}
         <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight">Activity Log</h3>
                 <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Your Historical Protocol Data</p>
               </div>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-4 relative z-10">
               {sessions.length > 0 ? sessions.map((session, i) => (
                 <motion.div 
                   key={session.id}
                   initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                   className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                 >
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                      <h4 className="text-base font-black uppercase tracking-tight">{session.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-[10px] text-brand-teal uppercase tracking-widest font-bold flex items-center gap-1">
                            <Clock size={10} /> {session.duration_minutes || 0} MIN
                         </span>
                         {session.source_type === 'video' && (
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
                               <Video size={10} /> Video
                            </span>
                         )}
                         {session.source_type === 'check-in' && (
                            <span className="text-[10px] text-brand-coral uppercase tracking-widest font-bold flex items-center gap-1">
                               <Camera size={10} /> Check-In
                            </span>
                         )}
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black border ${session.status === 'completed' || session.source_type === 'check-in' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                        {session.status === 'completed' || session.source_type === 'check-in' ? 'Completed' : 'Pending'}
                     </span>
                   </div>
                 </motion.div>
               )) : (
                 <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
                    <Activity size={48} className="text-white mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold">No recorded activity yet</p>
                 </div>
               )}
            </div>
         </div>

         {/* Right Column: Check-In Action Area */}
         <div className="bg-gradient-to-b from-brand-coral/5 to-black border border-brand-coral/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-coral to-transparent opacity-50" />
            <div className="w-24 h-24 bg-brand-coral/10 rounded-full flex items-center justify-center mb-6 border border-brand-coral/30 group-hover:scale-110 transition-transform">
               <Camera size={40} className="text-brand-coral" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Daily Check-In</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-8 max-w-[200px]">
               Submit your daily physiological audit to maintain protocol alignment.
            </p>
            <button 
               onClick={() => setIsCheckingIn(true)}
               className="w-full py-4 bg-brand-coral text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:shadow-glow-coral transition-all"
            >
               File Check-In
            </button>
         </div>
      </div>

      {/* Check In Modal */}
      <AnimatePresence>
        {isCheckingIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-2xl p-12 lg:p-16 space-y-12 rounded-[4rem] border border-brand-coral/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Camera size={200} />
              </div>

              <button onClick={() => setIsCheckingIn(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors">
                <X size={28} />
              </button>

              <div className="text-center space-y-4 relative z-10">
                <h3 className="text-4xl font-black uppercase tracking-tighter">Daily <span className="text-brand-coral">Audit</span></h3>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Upload a photo to record your check-in.</p>
              </div>

              <div className="relative z-10 w-full mt-8 flex justify-center">
                <MediaCapture 
                  bucket="fmf-media"
                  folder="check-ins"
                  accept="image/*"
                  onUploadSuccess={async (url) => {
                    try {
                      // Save to Calendar Sessions instead of workout_logs
                      await supabase.from('calendar_sessions').insert({
                          user_id: user.id || '',
                          source_type: 'check-in',
                          title: 'Daily EOD Check-In',
                          session_date: new Date().toISOString().split('T')[0],
                          session_time: '12:00:00',
                          duration_minutes: 0,
                          status: 'completed',
                          check_in_image: url
                      });

                      await supabase.from('profiles').update({ 
                        streak: streak + 1,
                        last_workout_date: new Date().toISOString()
                      }).eq('id', user.id);

                      showToast('Protocol Audit Synced', 'success');
                      setIsCheckingIn(false);
                      fetchSessions();
                    } catch (error: any) {
                      showToast(error.message || 'Audit failed to sync', 'error');
                    }
                  }}
                  onUploadError={(err) => showToast(err.message, 'error')}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
