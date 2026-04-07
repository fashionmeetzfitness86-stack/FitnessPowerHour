import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Tag, ArrowRight, Play, CheckCircle2, X, Activity, 
  UserPlus, Dumbbell, ChevronLeft, ChevronRight, BarChart3, Shield, Info, PlusCircle
} from 'lucide-react';
import { UserProfile, CalendarSession, ServiceRequest, ServiceAvailability } from '../../types';
import { supabase } from '../../supabase';

type ViewType = 'month' | 'day' | 'year';

export const Calendar = ({ user, showToast }: { user: UserProfile, showToast?: any }) => {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCalendarData = async () => {
    try {
      const [sessRes, bookRes] = await Promise.all([
        supabase.from('calendar_sessions').select('*').eq('user_id', user.id),
        supabase.from('bookings').select('*').eq('user_id', user.id)
      ]);

      setSessions(sessRes.data || []);
      setRequests(bookRes.data || []);
    } catch (err) {
      console.error('Failed to sync calendar matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user.id]);

  const handleAddWorkout = async () => {
    if (!selectedTime) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('calendar_sessions').insert({
          user_id: user.id,
          source_type: 'workout',
          title: 'Direct Session',
          session_date: selectedDateStr,
          session_time: selectedTime,
          status: 'approved'
      }).select().single();
      
      if (error) throw error;
      
      if (data) {
        setSessions([...sessions, data]);
        if (showToast) showToast('Session provisioned.', 'success');
      }
      setShowModal(false);
      setSelectedTime('');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to sync session.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // Padding for first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getEventsForDay = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.session_date === dStr);
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-12 fade-in relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8 relative z-10">
        <div>
          <h2 className="text-3xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
            Review <span className="text-brand-teal">Calendar</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-4 font-bold flex items-center gap-2">
            Temporal Hub • Central Authorization Matrix
          </p>
        </div>
        
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
            {(['month', 'day', 'year'] as ViewType[]).map(v => (
                <button 
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 md:flex-none px-6 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${view === v ? 'bg-brand-teal text-black shadow-lg shadow-brand-teal/20' : 'text-white/40 hover:text-white'}`}
                >
                    {v}
                </button>
            ))}
        </div>
      </header>

      {/* MATRIX GRID (MONTH VIEW) */}
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all">
                    <ChevronLeft size={18} />
                </button>
                <h3 className="text-2xl font-black uppercase tracking-tighter min-w-[200px] text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
            <button 
                onClick={() => { setSelectedDateStr(new Date().toISOString().split('T')[0]); setShowModal(true); }}
                className="hidden md:flex items-center gap-2 px-8 py-4 bg-white text-black text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-brand-teal transition-all shadow-xl"
            >
                <Plus size={14} /> Add Protocol Session
            </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-4 text-center text-white/20 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                    {d}
                </div>
            ))}
            {days.map((date, idx) => {
                if (!date) return <div key={idx} className="h-24 md:h-40 bg-white/[0.01] rounded-2xl" />;
                
                const events = getEventsForDay(date);
                const hasCheckin = user.last_checkin && user.last_checkin.startsWith(date.toISOString().split('T')[0]);
                const isToday = isSameDay(date, new Date());
                const isPast = date < new Date() && !isToday;
                const isEmptyPast = isPast && events.length === 0 && !hasCheckin;
                
                return (
                    <div 
                        key={idx} 
                        onClick={() => { setSelectedDateStr(date.toISOString().split('T')[0]); setShowModal(true); }}
                        className={`min-h-[100px] md:h-40 p-4 border rounded-2xl flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden ${
                            isToday ? 'bg-brand-teal/5 border-brand-teal/40 shadow-[0_0_30px_rgba(45,212,191,0.1)]' : 
                            isEmptyPast ? 'bg-brand-coral/5 border-brand-coral/10 grayscale opacity-40 hover:opacity-100 hover:grayscale-0' :
                            'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                    >
                        {(isToday || isEmptyPast) && <div className="absolute top-0 right-0 p-2 opacity-50"><Info size={12} className={isToday ? 'text-brand-teal' : 'text-brand-coral'} /></div>}
                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-black font-mono transition-colors ${isToday ? 'text-brand-teal' : isEmptyPast ? 'text-brand-coral/40' : 'text-white/40 group-hover:text-white'}`}>
                                {date.getDate()}
                            </span>
                            {hasCheckin && <div className="w-2 h-2 bg-brand-coral rounded-full shadow-[0_0_10px_rgba(251,113,133,0.5)]" />}
                        </div>
                        
                        <div className="space-y-1">
                            {events.map((e, eidx) => (
                                <div key={eidx} className="flex items-center gap-1">
                                    <div className="w-1 h-3 bg-brand-teal rounded-full" />
                                    <span className="text-[8px] uppercase tracking-tight font-black text-white/60 truncate">{e.title}</span>
                                </div>
                            ))}
                            {events.length > 2 && <span className="text-[7px] text-white/30 uppercase font-bold">+ {events.length - 2} more</span>}
                        </div>

                        {events.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                <span className="bg-brand-teal text-black text-[7px] font-black px-1 rounded uppercase">{events.length} WORKOUT</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* QUICK LOG MODAL */}
      <AnimatePresence>
         {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card-gradient border border-brand-teal/20 rounded-[3rem] w-full max-w-md overflow-hidden relative shadow-2xl p-10 space-y-8">
                  
                  <div className="flex justify-between items-center">
                    <div className="p-4 bg-brand-teal/10 text-brand-teal rounded-2xl">
                        <PlusCircle size={32} />
                    </div>
                    <button onClick={() => setShowModal(false)} className="p-2 text-white/20 hover:text-white"><X size={32} /></button>
                  </div>

                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Initialize <span className="text-brand-teal">Session</span></h3>
                     <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-2">{selectedDateStr}</p>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-3 gap-3">
                        {['06:00', '09:00', '12:00', '15:00', '18:00', '20:00'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`py-4 rounded-xl text-xs font-mono font-bold border transition-all ${selectedTime === t ? 'bg-brand-teal text-black border-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'}`}
                            >
                                {t}
                            </button>
                        ))}
                     </div>

                     <button 
                        disabled={!selectedTime || isSubmitting}
                        onClick={handleAddWorkout}
                        className="w-full py-6 bg-brand-teal text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:shadow-glow-teal transition-all disabled:opacity-30"
                     >
                        {isSubmitting ? 'Transmitting...' : 'Confirm Sync'}
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};
