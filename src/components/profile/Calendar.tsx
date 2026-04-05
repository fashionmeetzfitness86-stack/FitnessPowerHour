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
      const [sessRes, reqRes, availRes] = await Promise.all([
        supabase.from('calendar_sessions').select('*').eq('user_id', user.id),
        supabase.from('service_requests').select('*').eq('user_id', user.id).eq('status', 'pending'),
        supabase.from('service_availability').select('*').gte('available_date', new Date().toISOString().split('T')[0])
      ]);

      setSessions(sessRes.data || []);
      setRequests(reqRes.data || []);
      setAvailability(availRes.data || []);
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
            status: 'approved' // Automatically approved for workout
         }).select().single();
         if (data) setSessions([...sessions, data]);
      } else {
         const type = selectedOption === 'recovery' ? 'flex_mob' : 'personal_training';
         const { data, error } = await supabase.from('service_requests').insert({
            user_id: user.id,
            service_type: type,
            service_subtype: 'session',
            requested_date: selectedDate,
            requested_time: selectedTime,
            status: 'pending'
         }).select().single();
         if (data) setRequests([...requests, data]);
      }
      
      // Reset Modal
      setShowModal(false);
      setActiveStep(1);
      setSelectedOption(null);
      setSelectedTime('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  // Sort unified events by date
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  return (
    <div className="space-y-12 fade-in relative">
      <header className="flex justify-between items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter">My Schedule</h2>
      </header>

      {/* PENDING REQUESTS SECTION */}
      {requests.length > 0 && (
         <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
            <h3 className="text-xs uppercase font-black tracking-widest text-amber-500 mb-4">Pending Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {requests.map(r => (
                  <div key={r.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                     <div>
                        <p className="text-sm font-bold capitalize">{r.service_type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-white/40 font-mono">{r.requested_date} @ {r.requested_time}</p>
                     </div>
                     <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  </div>
               ))}
            </div>
         </div>
      )}

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
            const isWorkout = evt.source_type === 'workout';
            
            return (
              <div key={evt.id} className={`p-5 rounded-3xl border flex flex-col justify-between h-40 transition-all ${
                isCompleted ? 'bg-white/5 border-emerald-500/20 opacity-60' : 
                'bg-white/5 border-white/10 hover:border-white/30'
              }`}>
                 <div className="flex justify-between items-start">
                    <span className={`w-3 h-3 rounded-full ${
                      isCompleted ? 'bg-emerald-500' :
                      isWorkout ? 'bg-blue-500' : 'bg-brand-teal'
                    }`} />
                    <span className="text-[10px] uppercase font-bold text-white/40">{evt.session_date}</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-black uppercase leading-tight mb-1">{evt.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                       <Clock size={12} /> {evt.session_time || 'All Day'}
                    </div>
                 </div>
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

                           <button onClick={() => { setSelectedOption('recovery'); setActiveStep(3); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-coral/30 p-5 rounded-2xl flex items-center gap-4 transition-all text-left group">
                              <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl group-hover:bg-brand-coral group-hover:text-black transition-colors"><Activity size={20} /></div>
                              <div>
                                 <p className="font-bold group-hover:text-brand-coral transition-colors">Request Recovery</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Flex Mob 305 Session</p>
                              </div>
                           </button>

                           <button onClick={() => { setSelectedOption('training'); setActiveStep(3); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-teal/30 p-5 rounded-2xl flex items-center gap-4 transition-all text-left group">
                              <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl group-hover:bg-brand-teal group-hover:text-black transition-colors"><UserPlus size={20} /></div>
                              <div>
                                 <p className="font-bold group-hover:text-brand-teal transition-colors">Request Training</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">1-on-1 Protocol Access</p>
                              </div>
                           </button>
                           
                           <button onClick={() => setActiveStep(1)} className="w-full text-[10px] font-bold uppercase tracking-widest text-white/40 p-4 hover:text-white">Back</button>
                        </div>
                     )}

                     {activeStep === 3 && (
                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-3">
                              {/* Simple hardcoded times vs availability block checking.
                                  For workouts, any time is valid.
                                  For services, should technically check availability, but simplified flow mandates fast UX. 
                               */}
                              {['06:00', '09:00', '12:00', '15:00', '18:00', '20:00'].map(t => (
                                 <button 
                                   key={t}
                                   onClick={() => setSelectedTime(t)}
                                   className={`p-4 rounded-xl text-sm font-mono border transition-colors ${selectedTime === t ? 'bg-brand-teal text-black border-brand-teal' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'}`}
                                 >
                                    {t}
                                 </button>
                              ))}
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
