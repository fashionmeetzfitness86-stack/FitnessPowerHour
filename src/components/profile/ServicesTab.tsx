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

  const [formData, setFormData] = useState({
    fullName: user.full_name || '',
    email: user.email || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!formData.message) {
      if (showToast) showToast('Message is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Fallbacks to meet legacy DB constraints if they exist
      const reqDate = formData.preferredDate || new Date().toISOString().split('T')[0];
      const reqTime = formData.preferredTime ? (formData.preferredTime + ':00') : '12:00:00';

      const serviceType = selectedOption === 'recovery' ? 'flex_mob' : 'personal_training';
      const serviceSubtype = selectedOption === 'recovery' ? 'recovery' : 'training_session';

      const { error } = await supabase.from('service_requests').insert({
        user_id: user.id,
        service_type: serviceType,
        service_subtype: serviceSubtype,
        requested_date: reqDate,
        requested_time: reqTime,
        status: 'pending',
        notes: `Name: ${formData.fullName} | Email: ${formData.email} | Phone: ${formData.phone} | Msg: ${formData.message}`
      });

      if (error) throw error;
      
      setIsSuccess(true);
      if (showToast) showToast('Request Sent Successfully', 'success');
      fetchCalendarData();
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to send request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    setTimeout(() => {
      setActiveStep(1);
      setSelectedOption(null);
      setIsSuccess(false);
      setFormData(prev => ({ ...prev, message: '', phone: '', preferredDate: '', preferredTime: '' }));
    }, 300);
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
           onClick={() => { setActiveStep(1); setIsSuccess(false); setShowModal(true); }}
           className="h-40 border-2 border-dashed border-white/10 hover:border-brand-teal/50 rounded-3xl flex flex-col items-center justify-center gap-3 transition-colors text-white/40 hover:text-white"
         >
            <Plus size={32} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Request Training</span>
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
                  
                  <button onClick={closeAndReset} className="absolute top-6 right-6 text-white/40 hover:text-white z-20 bg-black/50 p-2 rounded-full backdrop-blur-md"><X size={18} /></button>

                  <div className="p-8 pb-4 relative overflow-hidden">
                     {!isSuccess && (
                       <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">
                          Step {activeStep} of 2
                       </span>
                     )}
                     <h3 className="text-2xl font-black mt-2">
                        {isSuccess ? 'Request Sent' : activeStep === 1 ? 'What do you need?' : `Request ${selectedOption === 'recovery' ? 'Recovery' : '1-on-1 Training'}`}
                     </h3>
                  </div>

                  <div className="p-8 pt-4 space-y-6">
                     
                     {isSuccess ? (
                        <div className="text-center space-y-4 py-8">
                           <div className="w-16 h-16 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-teal/20">
                             <CheckCircle2 size={32} />
                           </div>
                           <h4 className="text-lg font-black uppercase tracking-tight text-white/80">We will contact you within 24 hours</h4>
                           <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6">Humans handle the scheduling. Your request is in our system.</p>
                           <button onClick={closeAndReset} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-200 transition-colors mt-6">Continue</button>
                        </div>
                     ) : activeStep === 1 ? (
                        <div className="space-y-3">
                           <button onClick={() => { setSelectedOption('recovery'); setActiveStep(2); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-coral/30 p-5 rounded-2xl flex items-center gap-4 transition-all text-left group">
                              <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl group-hover:bg-brand-coral group-hover:text-black transition-colors"><Activity size={20} /></div>
                              <div>
                                 <p className="font-bold group-hover:text-brand-coral transition-colors">Request Recovery</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Flex Mob 305 Session</p>
                              </div>
                           </button>

                           <button onClick={() => { setSelectedOption('training'); setActiveStep(2); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-teal/30 p-5 rounded-2xl flex items-center gap-4 transition-all text-left group">
                              <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl group-hover:bg-brand-teal group-hover:text-black transition-colors"><UserPlus size={20} /></div>
                              <div>
                                 <p className="font-bold group-hover:text-brand-teal transition-colors">Request 1-on-1 Training</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Private Protocol Access</p>
                              </div>
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-4">Tell us when you'd like to train</p>
                           
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[8px] uppercase tracking-widest font-black text-white/30 block mb-1">Preferred Date (Optional)</label>
                                 <input type="date" value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-teal transition-colors" />
                              </div>
                              <div>
                                 <label className="text-[8px] uppercase tracking-widest font-black text-white/30 block mb-1">Preferred Time (Optional)</label>
                                 <input type="time" value={formData.preferredTime} onChange={e => setFormData({...formData, preferredTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-teal transition-colors" />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[8px] uppercase tracking-widest font-black text-white/30 block mb-1">Name</label>
                                 <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-teal transition-colors" />
                              </div>
                              <div>
                                 <label className="text-[8px] uppercase tracking-widest font-black text-white/30 block mb-1">Phone Number</label>
                                 <input type="tel" placeholder="(Optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-teal transition-colors" />
                              </div>
                           </div>
                           
                           <div>
                              <label className="text-[8px] uppercase tracking-widest font-black text-brand-teal block mb-1">Message (Required)</label>
                              <textarea rows={3} placeholder="What are we focusing on? Any injuries?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-teal transition-colors resize-none" />
                           </div>

                           <button 
                             disabled={!formData.message || isSubmitting}
                             onClick={handleConfirm} 
                             className={`w-full py-5 font-black uppercase text-xs tracking-widest rounded-2xl transition-all mt-2 flex items-center justify-center gap-2 ${(!formData.message || isSubmitting) ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-brand-teal text-black shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:scale-[1.02]'}`}
                           >
                              {isSubmitting ? 'Sending Request...' : 'Send Request'}
                           </button>
                           <button onClick={() => setActiveStep(1)} className="w-full text-[10px] font-bold uppercase tracking-widest text-white/40 p-3 hover:text-white">Back to Options</button>
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
