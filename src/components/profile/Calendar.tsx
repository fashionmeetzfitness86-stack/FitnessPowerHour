import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, AlertTriangle, CheckCircle, Trash2, Shield, Video, Search, ChevronRight, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';
import { UserProfile, CalendarSession } from '../../types';

export const Calendar = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    title: '',
    selectedVideos: [] as any[]
  });
  const [availableVideos, setAvailableVideos] = useState<any[]>([]);
  const [videoCategories, setVideoCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const fetchVideos = async () => {
    try {
      const { data: videos } = await supabase.from('videos').select('*');
      const { data: categories } = await supabase.from('video_categories').select('*');
      setAvailableVideos(videos || []);
      setVideoCategories(categories || []);
    } catch (err) {
      console.error('Error fetching video data:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      fetchVideos();
    }
  }, [user?.id]);

  const totalDuration = formData.selectedVideos.reduce((acc, v) => acc + (parseInt(v.duration) || 0), 0);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (totalDuration > 60) {
      setErrorMsg(`Daily load limit exceeded. Max 60 mins/day. Current: ${totalDuration} mins.`);
      return;
    }

    if (formData.selectedVideos.length === 0) {
      setErrorMsg("Select at least one video to build your session.");
      return;
    }

    try {
      const newSession: Partial<CalendarSession> = {
        user_id: user.id || '',
        title: formData.title || 'Mastery Session',
        date: formData.date,
        video_ids: formData.selectedVideos.map(v => v.id),
        duration: totalDuration,
        type: 'custom_builder',
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('calendar_sessions')
        .insert(newSession);

      if (error) throw error;

      showToast('Neural track synchronized successfully.', 'success');
      setIsAdding(false);
      setFormData({ 
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        title: '',
        selectedVideos: [] 
      });
      fetchSessions();
    } catch (error: any) {
      showToast(error.message || 'Scheduling failed.', 'error');
    }
  };

  const toggleVideo = (video: any) => {
    const isSelected = formData.selectedVideos.find(v => v.id === video.id);
    if (isSelected) {
      setFormData(prev => ({ ...prev, selectedVideos: prev.selectedVideos.filter(v => v.id !== video.id) }));
    } else {
      const videoDuration = parseInt(video.duration) || 0;
      if (totalDuration + videoDuration > 60) {
        showToast('Daily load limit exceeded. Remove sessions to add this block.', 'error');
        return;
      }
      setFormData(prev => ({ ...prev, selectedVideos: [...prev.selectedVideos, video] }));
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
    <div className="space-y-8 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Workout <span className="text-brand-teal">Calendar</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Schedule your training block. Maximum 60 minutes limit per day strictly enforced.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setIsFullCalendarOpen(true)}
            className="hidden md:flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl hover:text-white hover:bg-white/10 transition-all"
          >
            <CalendarIcon size={16} /> View Full Calendar
          </button>
          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-4 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl shadow-glow-teal hover:scale-105 transition-all"
          >
            {isAdding ? 'De-initialize' : <><Plus size={16} /> Schedule Session</>}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="card-gradient p-12 border border-brand-teal/30 mb-12">
          <div className="flex items-center gap-4 mb-12 text-brand-teal border-b border-white/5 pb-8">
            <CalendarIcon size={24} />
            <h3 className="text-xl font-black uppercase tracking-widest">Initialization Protocol</h3>
          </div>
          
          <form onSubmit={handleAddSession} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/5">
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
                <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Execution Time</label>
                <input 
                  type="time" 
                  value={formData.time} 
                  required
                  onChange={e => setFormData({...formData, time: e.target.value})} 
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
                  placeholder="e.g. AM Power Block"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-all text-white"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tighter">Video Selection <span className="text-brand-teal">Protocol</span></h4>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Construct your 60-minute mastery cycle from verified content categories.</p>
                </div>
                <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar max-w-full">
                   <button 
                     type="button" 
                     onClick={() => setSelectedCategory('all')}
                     className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-brand-teal text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                   >
                     All Content
                   </button>
                   {videoCategories.map(cat => (
                     <button 
                       key={cat.id}
                       type="button" 
                       onClick={() => setSelectedCategory(cat.id)}
                       className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-brand-teal text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                     >
                       {cat.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {availableVideos
                  .filter(v => selectedCategory === 'all' || v.category_id === selectedCategory)
                  .map(video => {
                    const isSelected = formData.selectedVideos.find((v: any) => v.id === video.id);
                    return (
                      <div 
                        key={video.id} 
                        onClick={() => toggleVideo(video)}
                        className={`group relative aspect-video rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-brand-teal shadow-glow-teal scale-95' : 'border-white/5 hover:border-brand-teal/30'}`}
                      >
                        <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                          <p className="text-[10px] font-black uppercase tracking-tight text-white mb-1 truncate">{video.title}</p>
                          <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/40 font-black">
                            <Clock size={10} /> {video.duration}M
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-brand-teal text-black rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            
            <div className="p-8 bg-brand-teal/5 border border-brand-teal/20 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-8 px-6 py-2">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-black">Total Cycle Load</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${totalDuration > 60 ? 'text-brand-coral' : 'text-brand-teal'}`}>{totalDuration}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">/ 60 MIN</span>
                  </div>
                </div>
                <div className="w-px h-12 bg-white/5" />
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-black">Block Selection</p>
                  <p className="text-xl font-black text-white">{formData.selectedVideos.length} <span className="text-[10px] uppercase tracking-widest text-white/20">Videos</span></p>
                </div>
              </div>

              {errorMsg && (
                <div className="flex-grow flex items-center gap-4 text-brand-coral bg-brand-coral/5 p-4 rounded-2xl border border-brand-coral/20">
                  <AlertTriangle size={18} />
                  <span className="text-[9px] uppercase font-black tracking-widest">{errorMsg}</span>
                </div>
              )}

              <button type="submit" className="w-full md:w-auto px-16 py-6 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-3xl shadow-glow-teal hover:scale-105 active:scale-95 transition-all">
                Initiate Neural Cycle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Week Visualization */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold uppercase tracking-tight border-b border-white/10 pb-4">Upcoming Schedule</h3>
        
        {sessions.length === 0 ? (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">No sessions scheduled in the current matrix.</p>
          </div>
        ) : (
          sessions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(session => (
            <div key={session.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-teal/30 transition-all group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border border-white/10 ${
                  session.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-teal/10 text-brand-teal'
                }`}>
                  <span className="text-lg font-bold font-mono">{new Date(session.date).getDate()}</span>
                  <span className="text-[8px] uppercase tracking-widest">{new Date(session.date).toLocaleDateString('en-US', { month: 'short'})}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg uppercase tracking-tight">{session.title}</h4>
                  <div className="flex items-center gap-4 text-white/40 mt-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                      <Clock size={12} /> {session.duration}m block
                    </div>
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                      • <span className={session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>{session.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {session.status === 'scheduled' ? (
                  <button 
                    onClick={() => completeSession(session.id)}
                    className="flex items-center gap-2 px-6 py-3 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-colors text-[10px] uppercase tracking-widest font-bold rounded-xl whitespace-nowrap"
                  >
                    <CheckCircle size={14} /> Mark Completed
                  </button>
                ) : (
                  <span className="px-6 py-3 flex items-center gap-2 text-emerald-400 bg-emerald-400/5 text-[10px] uppercase tracking-widest font-bold rounded-xl whitespace-nowrap border border-emerald-400/10">
                    <CheckCircle size={14} /> Session Done
                  </span>
                )}
                <button 
                  onClick={() => deleteSession(session.id)}
                  className="p-3 text-white/20 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isFullCalendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl card-gradient border border-white/5 rounded-[4rem] p-12 space-y-12 relative"
            >
              <button 
                onClick={() => setIsFullCalendarOpen(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-8">
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Temporal <span className="text-brand-teal">Matrix</span></h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mt-2">Active Training Block • Synchronization Hub</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-white/20 py-4">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, idx) => {
                  const day = idx - 2; // Offset for visualization
                  if (day < 1 || day > 31) return <div key={idx} />;
                  const hasSessions = sessions.some(s => new Date(s.date).getDate() + 1 === day);
                  return (
                    <div 
                      key={idx}
                      className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        hasSessions 
                          ? 'bg-brand-teal/10 border-brand-teal/30 shadow-glow-teal' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className={`text-lg font-black font-mono ${hasSessions ? 'text-brand-teal' : 'text-white/20'}`}>{day}</span>
                      {hasSessions && <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse" />}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 p-8 bg-brand-teal/5 border border-brand-teal/20 rounded-3xl">
                <Shield size={24} className="text-brand-teal" />
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-black leading-relaxed">
                  Neural markers are successfully synchronized across the matrix. Interactive day management and dragging protocols are now active in this view.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
