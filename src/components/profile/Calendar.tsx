import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, Activity, UserPlus, ChevronLeft, ChevronRight, 
  PlusCircle, CheckCircle2, Flame, Loader2, Dumbbell, Calendar as CalendarIcon, Trash2
} from 'lucide-react';
import { UserProfile, CalendarSession } from '../../types';
import { supabase } from '../../supabase';

type DayPanelMode = 'view' | 'add';

export const Calendar = ({ user, showToast }: { user: UserProfile; showToast?: any }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Day panel state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<DayPanelMode>('view');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [sessRes, reqRes] = await Promise.all([
        supabase.from('calendar_sessions').select('*').eq('user_id', user.id),
        supabase.from('service_requests').select('*').eq('user_id', user.id)
      ]);
      setSessions(sessRes.data || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Calendar sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendarData(); }, [user.id]);

  const handleAddWorkout = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
      const title = workoutTitle.trim() || 'Workout Session';
      const { data, error } = await supabase.from('calendar_sessions').insert({
        user_id: user.id,
        source_type: 'workout',
        title,
        session_date: selectedDay,
        session_time: selectedTime || null,
        status: 'approved',
        duration_minutes: 30
      }).select().single();

      if (error) throw error;
      if (data) setSessions(prev => [...prev, data]);
      if (showToast) showToast(`"${title}" added to your schedule.`, 'success');
      setWorkoutTitle('');
      setSelectedTime('');
      setPanelMode('view');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to add workout.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from('calendar_sessions').delete().eq('id', sessionId);
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (showToast) showToast('Workout removed.', 'success');
    } catch (err: any) {
      if (showToast) showToast('Failed to remove workout.', 'error');
    }
  };

  const handleMarkComplete = async (sessionId: string) => {
    try {
      const { error } = await supabase.from('calendar_sessions').update({ status: 'completed' }).eq('id', sessionId);
      if (error) throw error;
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
      if (showToast) showToast('Workout marked complete! 🔥', 'success');
    } catch (err: any) {
      if (showToast) showToast('Failed to update status.', 'error');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getSessionsForDay = (dayStr: string) => sessions.filter(s => s.session_date === dayStr);
  const getRequestsForDay = (dayStr: string) => requests.filter(r => r.requested_date === dayStr);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = getDaysInMonth(currentDate);

  const selectedDaySessions = selectedDay ? getSessionsForDay(selectedDay) : [];
  const selectedDayRequests = selectedDay ? getRequestsForDay(selectedDay) : [];
  const selectedDayCheckin = selectedDay && user.last_checkin?.startsWith(selectedDay);

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="text-brand-teal animate-spin" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <header className="border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
          My <span className="text-brand-teal">Schedule</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">
          Click any day to view, add, or edit your workouts.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CALENDAR GRID */}
        <div className="xl:col-span-2 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter">{monthLabel}</h3>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-white/20 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                {d}
              </div>
            ))}

            {/* Day Cells */}
            {days.map((date, idx) => {
              if (!date) return <div key={idx} className="h-20 md:h-28 rounded-xl" />;

              const dayStr = date.toISOString().split('T')[0];
              const daySessions = getSessionsForDay(dayStr);
              const dayRequests = getRequestsForDay(dayStr);
              const hasCheckin = user.last_checkin?.startsWith(dayStr);
              const isToday = isSameDay(date, today);
              const isPast = date < today && !isToday;
              const isSelected = selectedDay === dayStr;
              const isEmptyPast = isPast && daySessions.length === 0 && !hasCheckin;
              const completedCount = daySessions.filter(s => s.status === 'completed').length;
              const totalActivity = daySessions.length + dayRequests.length;

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedDay(dayStr); setPanelMode('view'); }}
                  className={`h-20 md:h-28 p-2 md:p-3 border rounded-xl flex flex-col cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-brand-teal/10 border-brand-teal shadow-[0_0_20px_rgba(45,212,191,0.15)]'
                      : isToday
                      ? 'bg-brand-teal/5 border-brand-teal/40'
                      : isEmptyPast
                      ? 'bg-brand-coral/5 border-brand-coral/10 opacity-50 hover:opacity-80'
                      : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black font-mono ${
                      isSelected ? 'text-brand-teal' : isToday ? 'text-brand-teal' : isEmptyPast ? 'text-white/20' : 'text-white/50'
                    }`}>
                      {date.getDate()}
                    </span>
                    {hasCheckin && <div className="w-1.5 h-1.5 bg-brand-coral rounded-full" />}
                  </div>

                  <div className="mt-auto space-y-0.5">
                    {daySessions.slice(0, 2).map((s, i) => (
                      <div key={i} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter truncate ${
                        s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-teal/20 text-brand-teal'
                      }`}>
                        <div className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                        <span className="truncate hidden md:block">{s.title}</span>
                      </div>
                    ))}
                    {totalActivity > 2 && (
                      <span className="text-[7px] text-white/20 font-black">+{totalActivity - 2}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DAY PANEL */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay + panelMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card-gradient rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
              >
                {/* Panel Header */}
                <div className={`p-6 border-b border-white/5 ${selectedDay === todayStr ? 'bg-brand-teal/5' : 'bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/30">
                        {selectedDay === todayStr ? '⚡ Today' : 'Selected Day'}
                      </p>
                      <h4 className="text-xl font-black uppercase tracking-tighter mt-1">
                        {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {panelMode === 'view' ? (
                  <div className="p-6 space-y-6">
                    {/* Today's Activity */}
                    {(selectedDaySessions.length > 0 || selectedDayRequests.length > 0 || selectedDayCheckin) ? (
                      <div className="space-y-3">
                        {selectedDayCheckin && (
                          <div className="flex items-center gap-3 p-3 bg-brand-coral/10 border border-brand-coral/20 rounded-xl">
                            <Flame size={14} className="text-brand-coral" />
                            <span className="text-xs font-black uppercase tracking-widest text-brand-coral">Checked In</span>
                          </div>
                        )}
                        {selectedDaySessions.map((s, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight">{s.title}</p>
                                {s.session_time && (
                                  <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">{s.session_time}</p>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                s.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-brand-teal/20 text-brand-teal'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {s.status !== 'completed' && (
                                <button
                                  onClick={() => handleMarkComplete(s.id)}
                                  className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 size={12} /> Mark Done
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSession(s.id)}
                                className="p-2 bg-white/5 border border-white/10 text-white/30 hover:text-brand-coral hover:border-brand-coral/30 rounded-lg transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedDayRequests.map((r: any, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <UserPlus size={14} className="text-amber-400" />
                            <div>
                              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                                {r.service_type || 'Training'} Request
                              </span>
                              <p className="text-[9px] text-white/30 font-bold uppercase">Pending approval</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <CalendarIcon size={32} className="text-white/10 mx-auto" />
                        <p className="text-[10px] uppercase tracking-widest font-black text-white/20">Nothing scheduled</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setPanelMode('add')}
                        className="w-full py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Workout
                      </button>
                      <button
                        onClick={() => window.location.hash = '#/profile#services'}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={14} /> Request Training
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ADD WORKOUT PANEL */
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <h5 className="text-lg font-black uppercase tracking-tighter">Add <span className="text-brand-teal">Workout</span></h5>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                        {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Workout Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Upper Body, HIIT, Yoga..."
                          value={workoutTitle}
                          onChange={e => setWorkoutTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-brand-teal outline-none transition-all placeholder-white/20"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Time (Optional)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['06:00', '09:00', '12:00', '15:00', '18:00', '20:00'].map(t => (
                            <button
                              key={t}
                              onClick={() => setSelectedTime(t === selectedTime ? '' : t)}
                              className={`py-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                                selectedTime === t
                                  ? 'bg-brand-teal text-black border-brand-teal'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/50'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setPanelMode('view')}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[9px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleAddWorkout}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[9px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><PlusCircle size={14} /> Save</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-gradient rounded-[2.5rem] border border-dashed border-white/10 p-10 text-center space-y-6"
              >
                <CalendarIcon size={40} className="text-white/10 mx-auto" />
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white/30">Select a Day</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2 leading-relaxed">
                    Click any day on the calendar to view, add, or edit your workouts.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedDay(todayStr); setPanelMode('view'); }}
                  className="mx-auto px-8 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
                >
                  <Activity size={14} /> Open Today
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
