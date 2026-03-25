import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Activity, Target, Zap, ChevronRight, Play, 
  Camera, CheckCircle, Clock, Shield, Flame, 
  Calendar as CalIcon, TrendingUp, AlertCircle
} from 'lucide-react';
import { UserProfile, WorkoutLog } from '../../types';
import { supabase } from '../../supabase';

export const Progress = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audits' | 'achievements'>('overview');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
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
    fetchLogs();
  }, [user.id]);

  const streak = user.streak || 0;
  const hoursTrained = Math.floor((logs.reduce((acc, log) => acc + log.duration, 0) || 0) / 60);
  const completedSessions = logs.length;

  const milestones = [
    { title: 'First Workout', completed: completedSessions > 0 },
    { title: '7 Day Streak', completed: streak >= 7 },
    { title: 'Physiological Base', completed: completedSessions >= 10 },
    { title: 'Elite Sync Status', completed: streak >= 30 },
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
      
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `check-ins/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const newLog: Partial<WorkoutLog> = {
        user_id: user.id,
        duration: 45, // Default for check-in
        completed_at: new Date().toISOString(),
        status: 'pending', // Awaiting admin audit
        check_in_image: publicUrl
      };

      const { error: dbError } = await supabase
        .from('workout_logs')
        .insert(newLog);

      if (dbError) throw dbError;

      // Update user streak locally or via DB
      await supabase.from('users').update({ 
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

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Physiological <span className="text-brand-coral">Audit</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Authorized repository for performance tracking and EOD status protocols.
          </p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1">
          {['overview', 'audits', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 text-[8px] uppercase tracking-[0.2em] font-black rounded-lg transition-all ${
                activeTab === tab ? 'bg-brand-coral text-white shadow-glow-coral' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Stat Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Neural Streak', value: streak, unit: 'Days', icon: Flame, color: 'text-brand-coral' },
              { label: 'Active Logs', value: completedSessions, unit: 'Total', icon: Activity, color: 'text-brand-teal' },
              { label: 'Time Sink', value: hoursTrained, unit: 'Hours', icon: Clock, color: 'text-white' },
              { label: 'Audit Status', value: 'Clear', unit: 'Elite', icon: Shield, color: 'text-brand-teal' },
            ].map((stat, i) => (
              <div key={i} className="card-gradient p-8 flex flex-col items-center justify-center text-center space-y-4 border border-white/5 group hover:border-brand-coral/30 transition-all">
                <stat.icon size={24} className={`${stat.color} opacity-40 group-hover:opacity-100 transition-all`} />
                <div>
                  <div className="text-4xl font-black font-mono tracking-tighter">{stat.value}</div>
                  <div className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-black mt-2">{stat.label}</div>
                  <div className="text-[7px] uppercase tracking-[0.2em] text-white/20 font-bold mt-1">{stat.unit}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Daily Audit Trigger */}
             <div className="lg:col-span-2 card-gradient p-10 border border-brand-coral/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <TrendingUp size={160} className="text-brand-coral" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">EOD <span className="text-brand-coral">Check-in</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm">
                      Log your daily activity and submit visual verification to maintain your streak and sync status.
                    </p>
                  </div>
                  
                  {!isCheckingIn ? (
                    <button 
                      onClick={() => setIsCheckingIn(true)}
                      className="flex items-center gap-4 px-10 py-5 bg-brand-coral text-white text-[10px] uppercase tracking-[0.3em] font-black rounded-2xl shadow-glow-coral hover:scale-[1.02] transition-all"
                    >
                      <Camera size={18} /> Initialize Daily Audit
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] text-center bg-white/[0.02]">
                        {!file ? (
                          <label className="cursor-pointer space-y-4 block">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/10 group-hover:border-brand-coral transition-colors">
                              <Camera size={32} />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-white/60 font-black">Authorize Photo Capture</p>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                        ) : (
                          <div className="space-y-6">
                            <div className="w-24 h-24 rounded-2xl border-2 border-brand-coral overflow-hidden mx-auto shadow-glow-coral">
                              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex gap-4 justify-center">
                              <button 
                                onClick={submitDailyCheckIn}
                                disabled={isUploading}
                                className="px-8 py-3 bg-brand-coral text-white text-[10px] uppercase tracking-widest font-black rounded-xl disabled:opacity-50"
                              >
                                {isUploading ? 'Syncing...' : 'Authorize Audit'}
                              </button>
                              <button onClick={() => setFile(null)} className="px-8 py-3 bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-black rounded-xl">Discard</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
             </div>

             {/* Milestones */}
             <div className="card-gradient p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <Trophy size={20} className="text-brand-coral" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Achieved Milestones</h3>
                </div>
                <div className="space-y-8">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        m.completed ? 'bg-brand-coral/20 border-brand-coral/40 text-brand-coral shadow-glow-coral' : 'bg-white/5 border-white/10 text-white/10'
                      }`}>
                        {m.completed ? <CheckCircle size={16} /> : <Shield size={16} />}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-[10px] uppercase tracking-widest font-black transition-colors ${m.completed ? 'text-white' : 'text-white/20'}`}>
                          {m.title}
                        </p>
                        {m.completed && (
                          <p className="text-[8px] uppercase tracking-widest text-brand-coral font-bold font-mono">Status: Authorized</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="card-gradient p-10 space-y-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-10">
            <h3 className="text-xl font-black uppercase tracking-tighter">Audit <span className="text-brand-coral">History</span></h3>
            <div className="flex gap-4">
              <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">Sync Frequency: 24h</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)
            ) : logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="p-8 bg-white/[0.02] border border-white/5 hover:border-brand-coral/30 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 transition-all group overflow-hidden relative">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center overflow-hidden shrink-0 group-hover:border-brand-coral/50 transition-colors">
                    {log.check_in_image ? (
                      <img src={log.check_in_image} alt="Log" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black font-mono">{new Date(log.completed_at).getDate()}</span>
                        <span className="text-[8px] uppercase tracking-widest text-white/40">{new Date(log.completed_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-brand-coral transition-colors">
                      Physiological Sync #{log.id.slice(0, 4)}
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-white/20" />
                        <span className="text-[9px] uppercase tracking-widest font-black text-white/40">{log.duration} Min Session</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-black rounded-lg border ${
                        log.status === 'approved' ? 'bg-brand-teal/20 border-brand-teal/30 text-brand-teal' : 'bg-brand-coral/20 border-brand-coral/30 text-brand-coral'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto flex items-center justify-end gap-6 text-white/10 group-hover:text-brand-coral transition-colors">
                   <p className="text-[10px] uppercase tracking-widest font-black text-right hidden lg:block">Authorized @ {new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )) : (
              <div className="py-32 text-center space-y-6">
                <AlertCircle size={40} className="mx-auto text-white/5" />
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/10">No authorized logs detected.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="card-gradient p-20 text-center space-y-10 rounded-[4rem]">
          <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-white/10 relative">
             <Trophy size={60} className="text-brand-coral/20" />
             <div className="absolute inset-0 animate-spin-slow rotate-[45deg] transition-all">
                <div className="w-2 h-2 bg-brand-coral rounded-full absolute -top-1 left-1/2 -ml-1 shadow-glow-coral" />
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Neuro-Skeletal <span className="text-brand-coral">Matrix</span></h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 max-w-sm mx-auto font-black leading-relaxed">
              Maintain audit streaks to decrypt advanced achievements and unlock elite-tier physiological markers. 
            </p>
          </div>
          <button className="px-12 py-5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.4em] font-black rounded-2xl hover:border-brand-coral hover:text-white transition-all">
            Decrypt Mastery Map
          </button>
        </div>
      )}
    </div>
  );
};
