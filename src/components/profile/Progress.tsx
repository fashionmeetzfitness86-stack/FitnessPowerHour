import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Activity, Target, Zap, ChevronRight, Play, Camera, Upload, CheckCircle, Clock, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile, WorkoutLog } from '../../types';
import { MediaCapture } from '../MediaCapture';


export const Progress = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'metrics'>('overview');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const streak = user.streak || 0;
  const hoursTrained = Math.floor((logs.reduce((acc, log) => acc + log.duration, 0) || 0) / 60);
  const completedSessions = logs.length || 0;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchLogs();
  }, [user?.id]);

  const milestones = [
    { title: 'First Workout', completed: completedSessions > 0 },
    { title: '7 Day Streak', completed: streak >= 7 },
    { title: '14 Day Streak', completed: streak >= 14 },
    { title: '10 Hours Trained', completed: hoursTrained >= 10 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submitDailyCheckIn = async () => {
    if (!file || !user) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `check-ins/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const newLog: Partial<WorkoutLog> = {
        user_id: user.id || '',
        duration: 45, // Default for check-in
        completed_at: new Date().toISOString(),
        status: 'pending', // Awaiting admin audit
        check_in_image: publicUrl
      };

      const { error: dbError } = await supabase
        .from('workout_logs')
        .insert(newLog);

      if (dbError) throw dbError;

      // Update user streak
      await supabase.from('profiles').update({ 
        streak: streak + 1,
        last_workout_date: new Date().toISOString()
      }).eq('id', user.id);

      showToast('EOD Physiological Audit Received. Syncing status...', 'success');
      setIsCheckingIn(false);
      setFile(null);
      fetchLogs();
    } catch (error: any) {
      showToast(error.message || 'Audit failed to sync.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapture = (capturedFile: File) => {
    setFile(capturedFile);
    setUseCamera(false);
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Progress <span className="text-brand-teal">Tracker</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Monitor your markers, performance, and milestones.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end gap-6 w-full md:w-auto">
          <div className="flex bg-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar w-full md:w-auto">
            {['overview', 'logs', 'metrics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'logs' | 'metrics')}
                className={`px-8 py-3 text-[9px] uppercase tracking-widest font-black rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-brand-teal text-black shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsCheckingIn(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-brand-coral text-black text-[10px] uppercase tracking-widest font-black rounded-xl shadow-glow-coral hover:scale-105 active:scale-95 transition-all"
          >
            <Camera size={14} /> EOD Check-in
          </button>
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stat Block */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Current Streak', value: streak, unit: 'Days', icon: Zap, color: 'text-brand-teal' },
              { label: 'Sessions', value: completedSessions, unit: 'Total', icon: Activity, color: 'text-brand-coral' },
              { label: 'Time Trained', value: hoursTrained, unit: 'Hours', icon: Target, color: 'text-blue-400' },
              { label: 'Intensity Ratio', value: '4.8', unit: 'Factor', icon: Play, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="card-gradient p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 border border-white/5 hover:border-brand-teal/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <stat.icon size={80} />
                </div>
                <stat.icon size={24} className={`${stat.color} mb-2 transition-colors`} />
                <span className="text-5xl font-black font-mono tracking-tighter">{stat.value}</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-black leading-relaxed">{stat.label} <br/> ({stat.unit})</span>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="card-gradient p-10 space-y-10 lg:col-span-1 border-white/10 rounded-[3rem]">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Trophy size={20} className="text-brand-teal" />
              <h3 className="text-lg font-black uppercase tracking-tight">Milestone Matrix</h3>
            </div>
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-6 relative">
                  {i !== milestones.length - 1 && (
                    <div className={`absolute top-8 left-[13px] w-px h-12 bg-white/5`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all z-10 flex-shrink-0 ${
                    m.completed ? 'border-brand-teal bg-brand-teal/20 text-brand-teal shadow-glow-teal' : 'border-white/10 bg-white/5 text-white/20'
                  }`}>
                    {m.completed ? <CheckCircle size={14} /> : <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-black ${m.completed ? 'text-white' : 'text-white/20'}`}>
                      {m.title}
                    </span>
                    <p className="text-[8px] uppercase tracking-widest text-white/10 mt-1">{m.completed ? 'Condition Synchronized' : 'In Progress'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Summary Chart Placeholder */}
          <div className="card-gradient p-10 space-y-10 lg:col-span-2 flex flex-col border-white/10 rounded-[3rem]">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Physiological Load <span className="text-brand-teal">Chart</span></h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-2 h-2 bg-brand-teal rounded-full" />
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-widest">Mastery</span>
                 </div>
              </div>
            </div>
            
            <div className="flex-grow flex items-end justify-between gap-4 pt-12 relative border-b border-white/5 pb-8 px-4">
              {/* Decorative Chart Lines */}
              <div className="absolute top-[20%] w-full border-b border-dashed border-white/5 z-0" />
              <div className="absolute top-[40%] w-full border-b border-dashed border-white/5 z-0" />
              <div className="absolute top-[60%] w-full border-b border-dashed border-white/5 z-0" />
              <div className="absolute top-[80%] w-full border-b border-dashed border-white/5 z-0" />
              
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const height = i === 1 || i === 4 ? 80 : i === 2 ? 60 : i === 5 ? 40 : 20;
                const active = day === new Date().toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={day} className="flex flex-col items-center gap-6 w-full group cursor-pointer z-10">
                    <div className="relative w-full max-w-[40px] flex flex-col items-center">
                       {active && (
                         <div className="absolute -top-8 bg-brand-teal text-black text-[8px] font-black px-2 py-1 rounded shadow-lg animate-bounce">
                            NOW
                         </div>
                       )}
                       <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1.5, type: 'spring', delay: i * 0.1 }}
                        className={`w-full rounded-t-xl transition-all shadow-lg ${
                          active ? 'bg-brand-teal shadow-glow-teal' : 'bg-white/5 group-hover:bg-white/20'
                        }`}
                      />
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${active ? 'text-brand-teal' : 'text-white/40'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-12 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2 font-black">Monthly Target</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-white">16</span>
                   <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">Sessions</span>
                </div>
              </div>
              <div className="p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/20">
                <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2 font-black">Yield Ratio</p>
                 <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-brand-teal">94%</span>
                   <span className="text-[10px] uppercase tracking-widest text-brand-teal/20 font-black">Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card-gradient p-12 rounded-[3.5rem] border-white/10">
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
            <h3 className="text-xl font-black uppercase tracking-tight">Audit <span className="text-brand-teal">Logs</span></h3>
            <div className="flex gap-4">
               <button className="px-8 py-3 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-black rounded-xl hover:text-white hover:bg-white/10 transition-all">Export CSV</button>
            </div>
          </div>
          
          <div className="space-y-4">
            {logs.length > 0 ? logs.map((log, i) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center hover:border-brand-teal/30 hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-8 w-full">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                    <span className="text-lg font-black font-mono">{new Date(log.completed_at).getDate()}</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">{new Date(log.completed_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-black uppercase tracking-tight text-white/90 group-hover:text-brand-teal transition-colors">Training Session Log</h4>
                    <div className="flex items-center gap-6 mt-1 text-white/40">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black">
                        <Clock size={12} className="text-brand-teal" /> {log.duration} MIN BLOCK
                      </div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black">
                        <Zap size={12} className="text-brand-coral" /> {(log as any).intensity || 'HIGH'} INTENSITY
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <span className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                       log.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-500'
                     }`}>
                       {log.status === 'completed' ? 'Synchronized' : 'In Audit'}
                     </span>
                     <ChevronRight size={20} className="text-white/10 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-24 text-center space-y-4">
                 <Activity size={48} className="mx-auto text-white/5" />
                 <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">No logs detected in the current matrix.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="card-gradient p-12 text-center py-32 rounded-[4rem] border-white/10">
          <div className="scale-125 mb-12">
             <Target size={64} className="mx-auto text-brand-coral opacity-20" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Physiological <span className="text-brand-coral">Metrics</span></h3>
          
          {['Elite', 'Local Collective'].includes(user.tier || '') ? (
             <>
               <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 max-w-sm mx-auto font-black leading-relaxed">
                 Metric visualization active. Maintain your 30-day baseline of EOD check-in data to calibrate the matrix.
               </p>
               <div className="mt-12 flex justify-center gap-4">
                  <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] uppercase font-black text-brand-coral tracking-widest shadow-glow-coral relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                     <span className="relative z-10">Baseline: {Math.min(completedSessions, 30)}/30 Days</span>
                  </div>
               </div>
             </>
          ) : (
             <>
               <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 max-w-sm mx-auto font-black leading-relaxed">
                 Advanced physiological metric tracking requires an upgraded protocol access tier. 
               </p>
               <div className="mt-12 flex justify-center gap-4">
                  <button onClick={() => window.location.hash = '#/profile#membership'} className="px-8 py-4 bg-brand-coral text-black rounded-2xl text-[10px] uppercase tracking-widest font-black shadow-glow-coral hover:scale-105 transition-transform">
                     Unlock Advanced Tracking
                  </button>
               </div>
             </>
          )}
        </div>
      )}

      {/* EOD Check-in Modal */}
      <AnimatePresence>
        {isCheckingIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-2xl p-16 space-y-12 rounded-[4rem] border border-brand-coral/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Camera size={200} />
              </div>

              <button 
                onClick={() => setIsCheckingIn(false)}
                className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>

              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 bg-brand-coral/10 rounded-3xl flex items-center justify-center text-brand-coral mx-auto border border-brand-coral/20">
                  <Camera size={40} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter">Daily <span className="text-brand-coral">Check-in</span></h3>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Physiological Alignment Protocol</p>
              </div>

              <div className="relative z-10 w-full mt-8">
                <MediaCapture 
                  bucket="media"
                  folder="check-ins"
                  accept="image/*"
                  onUploadSuccess={async (url) => {
                    const newLog: Partial<WorkoutLog> = {
                      user_id: user.id || '',
                      duration: 45, // Default for check-in
                      completed_at: new Date().toISOString(),
                      status: 'pending', // Awaiting admin audit
                      check_in_image: url
                    };

                    try {
                      const { error: dbError } = await supabase
                        .from('workout_logs')
                        .insert(newLog);

                      if (dbError) throw dbError;

                      // Update user streak
                      await supabase.from('profiles').update({ 
                        streak: streak + 1,
                        last_workout_date: new Date().toISOString()
                      }).eq('id', user.id);

                      showToast('EOD Physiological Audit Received. Syncing status...', 'success');
                      setIsCheckingIn(false);
                      fetchLogs();
                    } catch (error: any) {
                      showToast(error.message || 'Audit failed to sync.', 'error');
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
