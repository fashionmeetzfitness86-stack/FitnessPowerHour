import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, AlertTriangle, CheckCircle, Trash2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

export const Calendar = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '30',
    title: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user.id]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const durationNeeded = parseInt(formData.duration);
    
    // Verify 1 hour max limit for a specific day
    const daySessions = sessions.filter(s => s.date === formData.date);
    const totalScheduledDuration = daySessions.reduce((acc, curr) => acc + curr.duration, 0);

    if (totalScheduledDuration + durationNeeded > 60) {
      setErrorMsg(`Daily load limit exceeded. Max 60 mins/day. Current: ${totalScheduledDuration} mins.`);
      return;
    }

    try {
      const newSession: Partial<CalendarSession> = {
        user_id: user.id,
        title: formData.title || 'Mastery Session',
        date: formData.date,
        duration: durationNeeded,
        type: 'custom',
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('calendar_sessions')
        .insert(newSession);

      if (error) throw error;

      showToast('Neural track scheduled successfully.', 'success');
      setIsAdding(false);
      setFormData({ ...formData, title: '' });
      fetchSessions();
    } catch (error: any) {
      showToast(error.message || 'Scheduling failed.', 'error');
    }
  };

  const completeSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_sessions')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      showToast('Session status synchronized to Mastery.', 'success');
      fetchSessions();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Session redacted from neural record.', 'success');
      fetchSessions();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Neural <span className="text-brand-teal">Schedule</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-black">
            Mastery block programming. 60-minute daily load limit strictly enforced.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-4 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl shadow-glow-teal hover:scale-105 transition-all"
        >
          {isAdding ? 'De-initialize' : <><Plus size={16} /> Schedule Session</>}
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card-gradient p-10 border border-brand-teal/30 mb-12 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8 text-brand-teal border-b border-white/5 pb-6">
                <CalendarIcon size={20} />
                <h3 className="text-sm font-black uppercase tracking-[0.3em]">Configure Appointment</h3>
              </div>
              
              <form onSubmit={handleAddSession} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Temporal Marker</label>
                    <input 
                      type="date" 
                      value={formData.date} 
                      required
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Logic Label</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      required
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="e.g. Upper Body Mastery"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Load Duration</label>
                    <select 
                      value={formData.duration} 
                      onChange={e => setFormData({...formData, duration: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-all appearance-none text-white"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="flex items-center gap-4 text-brand-coral bg-brand-coral/5 p-4 rounded-2xl border border-brand-coral/20">
                    <AlertTriangle size={18} />
                    <span className="text-[9px] uppercase font-black tracking-widest">{errorMsg}</span>
                  </div>
                )}

                <button type="submit" className="w-full md:w-auto px-12 py-5 bg-brand-teal text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-2xl shadow-glow-teal hover:scale-105 active:scale-95 transition-all">
                  Synchronize Appointment
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter border-b border-white/5 pb-6 text-white/60">Programmed Blocks</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 hover:border-brand-teal/30 transition-all group relative overflow-hidden">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex flex-col items-center justify-center border transition-all ${
                    session.status === 'completed' ? 'bg-brand-teal/20 border-brand-teal/40 text-brand-teal shadow-glow-teal' : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    <span className="text-xl font-black font-mono leading-none">{new Date(session.date).getDate() + 1}</span>
                    <span className="text-[8px] uppercase tracking-widest font-black mt-1">{new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="text-left space-y-2">
                    <h4 className="font-black text-lg uppercase tracking-tight text-white group-hover:text-brand-teal transition-colors">{session.title}</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white/20">
                        <Clock size={12} /> {session.duration}M Block
                      </div>
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black">
                        <span className={session.status === 'completed' ? 'text-brand-teal' : 'text-amber-500'}>
                          {session.status === 'completed' ? 'Sync Complete' : 'Awaiting Load'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {session.status === 'scheduled' && (
                    <button 
                      onClick={() => completeSession(session.id)}
                      className="flex-grow md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-brand-teal/10 border border-brand-teal/30 text-brand-teal hover:bg-brand-teal hover:text-black transition-all text-[10px] uppercase tracking-widest font-black rounded-2xl"
                    >
                      <CheckCircle size={14} /> Synchronize
                    </button>
                  )}
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="p-4 bg-white/5 border border-white/10 text-white/20 hover:text-brand-coral hover:border-brand-coral/50 transition-all rounded-2xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center card-gradient rounded-[4rem] border border-white/10 flex flex-col items-center justify-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 border border-white/10">
              <CalendarIcon size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white/20">No Programmed Blocks</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-black mt-4">Initialize your temporal markers to optimize your neural journey.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 group">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
          <Shield size={32} />
        </div>
        <div className="text-left space-y-2">
          <h4 className="text-lg font-black uppercase tracking-tight text-white/60">Safety Protocol Buffer</h4>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black leading-relaxed max-w-2xl">
            To prevent neural overload and skeletal fatigue, the system enforces a strict 60-minute daily load limit. Overtraining beyond authorized parameters will result in sync failure.
          </p>
        </div>
      </div>
    </div>
  );
};
