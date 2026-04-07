import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Plus, Tag, ArrowRight, Play, CheckCircle2, X, Activity, UserPlus, Dumbbell } from 'lucide-react';
import { UserProfile, CalendarSession, ServiceRequest, ServiceAvailability } from '../../types';
import { supabase } from '../../supabase';

export const Calendar = ({ user, showToast }: { user: UserProfile, showToast?: any }) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedOption, setSelectedOption] = useState<'workout' | 'recovery' | 'training' | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

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

  const handleConfirm = async () => {
    if (!selectedTime || !selectedOption) return;

    try {
      if (selectedOption === 'workout') {
         const { data, error } = await supabase.from('calendar_sessions').insert({
            user_id: user.id,
            source_type: 'workout',
            title: 'Personal Session',
            session_date: selectedDate,
            session_time: selectedTime,
            status: 'approved'
         }).select().single();
         
         if (error) throw error;
         
         if (data) {
           setSessions([...sessions, data]);
           if (showToast) showToast('Workout scheduled successfully', 'success');
         }
         // Reset Modal
         setShowModal(false);
         setActiveStep(1);
         setSelectedOption(null);
         setSelectedTime('');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to schedule workout', 'error');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const { error } = await supabase.from('calendar_sessions').delete().eq('id', id);
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
      if (showToast) showToast('Session cancelled', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to cancel session', 'error');
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  // Unify sessions and bookings for timeline display
  const unifiedEvents = [
    ...sessions.map(s => ({
      id: s.id, type: 'session', date: s.session_date, time: s.session_time, title: s.title,
      status: s.status, source: s.source_type, canDelete: true
    })),
    ...requests.map(b => ({
      id: b.id, type: 'booking', date: b.date, time: b.time, title: b.service_name,
      status: b.status, source: 'service', canDelete: false
    }))
  ];

  // Sort unified events by date
  const sortedSessions = unifiedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-12 fade-in relative">
      <header className="flex justify-between items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter">My Schedule</h2>
      </header>



      {/* MAIN CALENDAR RENDER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
         
         {/* ADD BUTTON CARD */}
         <button 
           onClick={() => { setSelectedDate(new Date().toISOString().split('T')[0]); setActiveStep(1); setShowModal(true); }}
           className="h-40 border-2 border-dashed border-white/10 hover:border-brand-teal/50 rounded-3xl flex flex-col items-center justify-center gap-3 transition-colors text-white/40 hover:text-white"
         >
            <Plus size={32} />
            <span className="text-[10px] uppercase tracking-widest font-bold">New Booking</span>
         </button>

          {/* SESSIONS */}
         {sortedSessions.map((evt) => {
            const isCompleted = evt.status === 'completed';
            const isWorkout = evt.source === 'workout';
            const isPending = evt.status === 'pending';
            
            return (
               <div key={`${evt.type}-${evt.id}`} className={`p-5 rounded-3xl border flex flex-col justify-between h-40 transition-all relative group ${
                isCompleted ? 'bg-white/5 border-emerald-500/20 opacity-60' : 
                isPending ? 'bg-amber-500/5 border-amber-500/30 border-dashed' :
                'bg-white/5 border-white/10 hover:border-white/30'
              }`}>
                 <div className="flex justify-between items-start">
                    <span className={`w-3 h-3 rounded-full shadow-lg ${
                      isCompleted ? 'bg-emerald-500 shadow-emerald-500/50' :
                      isPending ? 'bg-amber-500 shadow-amber-500/50' :
                      isWorkout ? 'bg-blue-500 shadow-blue-500/50' : 'bg-brand-teal shadow-brand-teal/50'
                    }`} />
                    <span className="text-[10px] uppercase font-bold text-white/40">{evt.date}</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-black uppercase leading-tight mb-1">{evt.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                       <Clock size={12} /> {evt.time || 'All Day'}
                    </div>
                 </div>
                 {evt.canDelete && !isCompleted && (
                   <button 
                     onClick={() => handleDeleteSession(evt.id)}
                     className="absolute top-4 right-4 p-2 bg-black/50 text-white/40 hover:text-brand-coral hover:bg-brand-coral/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                     title="Cancel Session"
                   >
                     <X size={14} />
                   </button>
                 )}
              </div>
            );
         })}
      </div>

      {/* CLEAN MODAL */}
      <AnimatePresence>
         {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden relative shadow-2xl">
                  
                  <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white z-20 bg-black/50 p-2 rounded-full backdrop-blur-md"><X size={18} /></button>

                  <div className="p-8 pb-4 relative overflow-hidden">
                     <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">
                        Step {activeStep} of 3
                     </span>
                     <h3 className="text-2xl font-black mt-2">
                        {activeStep === 1 ? 'Select Date' : activeStep === 2 ? 'What do you need?' : 'Pick a time'}
                     </h3>
                  </div>

                  <div className="p-8 pt-4 space-y-6">
                     
                     {activeStep === 1 && (
                        <div className="space-y-4">
                           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg font-mono text-white outline-none focus:border-brand-teal transition-colors" />
                           <button onClick={() => setActiveStep(2)} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-200 transition-colors mt-6">Continue</button>
                        </div>
                     )}

                     {activeStep === 2 && (
                        <div className="space-y-3">
                           <button onClick={() => { setSelectedOption('workout'); setActiveStep(3); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all text-left">
                              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Dumbbell size={20} /></div>
                              <div>
                                 <p className="font-bold">Add Workout</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Schedule personal training day</p>
                              </div>
                           </button>
                           
                           <button onClick={() => setActiveStep(1)} className="w-full text-[10px] font-bold uppercase tracking-widest text-white/40 p-4 hover:text-white">Back</button>
                        </div>
                     )}

                     {activeStep === 3 && (
                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-3">
                              {(() => {
                                let availableSlots = ['06:00', '09:00', '12:00', '15:00', '18:00', '20:00'];
                                
                                if (availableSlots.length === 0) {
                                   return <p className="col-span-2 text-brand-coral text-xs text-center p-4">No slots available. Check another date.</p>;
                                }

                                return availableSlots.map(t => (
                                   <button 
                                     key={t}
                                     onClick={() => setSelectedTime(t)}
                                     className={`p-4 rounded-xl text-sm font-mono border transition-colors ${selectedTime === t ? 'bg-brand-teal text-black border-brand-teal' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'}`}
                                   >
                                      {t}
                                   </button>
                                ));
                              })()}
                           </div>

                           <button 
                             disabled={!selectedTime}
                             onClick={handleConfirm} 
                             className={`w-full py-5 font-black uppercase text-xs tracking-widest rounded-2xl transition-all mt-4 ${!selectedTime ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 shadow-xl'}`}
                           >
                              Confirm {selectedOption}
                           </button>
                           <button onClick={() => setActiveStep(2)} className="w-full text-[10px] font-bold uppercase tracking-widest text-white/40 p-4 hover:text-white">Back</button>
                        </div>
                     )}

                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};
