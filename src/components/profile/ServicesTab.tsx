import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Plus, Tag, ArrowRight, Play, CheckCircle2, X, Activity, UserPlus, Dumbbell } from 'lucide-react';
import { UserProfile, CalendarSession, ServiceRequest, ServiceAvailability } from '../../types';
import { supabase } from '../../supabase';

export const ServicesTab = ({ user, showToast }: { user: UserProfile, showToast?: any }) => {
  const [bookings, setBookings] = useState<any[]>([]);
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
      const [bookRes, availRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('user_id', user.id),
        supabase.from('service_availability').select('*').gte('available_date', new Date().toISOString().split('T')[0])
      ]);

      setBookings(bookRes.data || []);
      setRequests((bookRes.data || []).filter((b: any) => b.status === 'pending'));
      setAvailability(availRes.data || []);
    } catch (err) {
      console.error('Failed to sync calendar matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
      setRequests(prev => prev.filter(b => b.id !== id));
      if (showToast) showToast('Booking cancelled successfully', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to cancel booking', 'error');
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user.id]);

  const handleConfirm = async () => {
    if (!selectedTime || !selectedOption) return;

    try {
      if (selectedOption === 'workout') {
          return;
      } else {
         const serviceName = selectedOption === 'recovery' ? 'Flex Mob 305 Session' : '1-on-1 Training';
         const priceAmount = selectedOption === 'recovery' ? 120 : 150;
         
         const res = await fetch('/.netlify/functions/create-checkout', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             type: 'service',
             serviceName,
             priceAmount,
             selectedDate,
             selectedTime,
             userId: user.id,
             userEmail: user.email
           })
         });
         const checkoutData = await res.json();
         if (checkoutData.url) {
            window.location.href = checkoutData.url;
         } else {
            console.error('Failed to init payment', checkoutData);
         }
      }
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
  const sortedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'completed').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-12 fade-in relative">
      <header className="flex justify-between items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter">My Services</h2>
      </header>

      {/* PENDING REQUESTS SECTION */}
      {requests.length > 0 && (
         <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
            <h3 className="text-xs uppercase font-black tracking-widest text-amber-500 mb-4">Pending Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {requests.map(r => (
                  <div key={r.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                     <div>
                        <p className="text-sm font-bold capitalize">{r.service_name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{r.date} @ {r.time}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                        <button 
                           onClick={() => handleDeleteBooking(r.id)} 
                           className="p-2 bg-white/5 hover:bg-brand-coral/20 text-white/40 hover:text-brand-coral rounded-full transition-colors"
                           title="Cancel Request"
                        >
                           <X size={14} />
                        </button>
                     </div>
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

         {/* BOOKINGS */}
         {sortedBookings.map((evt) => {
            const isCompleted = evt.status === 'completed';
            
            return (
              <div key={evt.id} className={`p-5 rounded-3xl border flex flex-col justify-between h-40 transition-all relative group ${
                isCompleted ? 'bg-white/5 border-emerald-500/20 opacity-60' : 
                'bg-white/5 border-white/10 hover:border-white/30'
              }`}>
                 <div className="flex justify-between items-start">
                    <span className={`w-3 h-3 rounded-full ${
                      isCompleted ? 'bg-emerald-500' : 'bg-brand-teal'
                    }`} />
                    <span className="text-[10px] uppercase font-bold text-white/40">{evt.date}</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-black uppercase leading-tight mb-1">{evt.service_name}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                       <Clock size={12} /> {evt.time}
                    </div>
                 </div>
                 {!isCompleted && (
                   <button 
                     onClick={() => handleDeleteBooking(evt.id)}
                     className="absolute top-4 right-4 p-2 bg-black/50 text-white/40 hover:text-brand-coral hover:bg-brand-coral/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                     title="Cancel Booking"
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
                        <div className="space-y-3">                           <button onClick={() => { setSelectedOption('recovery'); setActiveStep(3); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-coral/30 p-5 rounded-2xl flex items-center gap-4 transition-all text-left group">
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
                              {(() => {
                                let availableSlots = ['06:00', '09:00', '12:00', '15:00', '18:00', '20:00'];
                                if (selectedOption !== 'workout') {
                                  const dayAvail = availability.filter(a => a.available_date === selectedDate && (!a.status || a.status === 'open'));
                                  if (dayAvail.length > 0) {
                                    availableSlots = dayAvail.map(a => a.start_time.substring(0, 5));
                                  } else {
                                     availableSlots = [];
                                  }
                                }
                                
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
