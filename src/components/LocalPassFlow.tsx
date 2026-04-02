import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, CheckCircle, CreditCard, User, Mail, Phone, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';

interface PassFlowProps {
  pass: any;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const LocalPassFlow = ({ pass, onClose, showToast }: PassFlowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    reason_for_visit: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.reason_for_visit) {
        showToast('Please fill out all required fields', 'error');
        return;
      }
      setStep(2);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'local_pass',
          passName: pass.name,
          priceAmount: pass.price,
          firstName: formData.first_name,
          lastName: formData.last_name,
          userEmail: formData.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment initialization failed');

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      setIsProcessing(false);
      showToast(error.message || 'Payment failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl overflow-y-auto pt-24 pb-12">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-brand-black w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-12 space-y-8">
          <div className="flex gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-all duration-500 line-clamp-1 ${s <= step ? 'bg-brand-teal' : 'bg-white/10'}`} />
                <div className={`text-[8px] uppercase tracking-widest mt-2 font-bold ${s <= step ? 'text-brand-teal' : 'text-white/20'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Access'}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Guest <span className="text-brand-coral">Details</span></h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Secure your {pass.name} ({pass.price})</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-2"><User size={12}/> First Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-teal transition-all" 
                      value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-2"><User size={12}/> Last Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-teal transition-all" 
                      value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-2"><Mail size={12}/> Email Address</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-teal transition-all" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-2"><Phone size={12}/> Phone Number (Optional)</label>
                    <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-teal transition-all" 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-2"><MessageSquare size={12}/> Reason for Visit</label>
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-teal transition-all appearance-none"
                      value={formData.reason_for_visit} onChange={e => setFormData({...formData, reason_for_visit: e.target.value})}>
                      <option value="">Select an option</option>
                      <option value="Just passing through">Just passing through (Travel)</option>
                      <option value="Checking out the gym">Checking out the facility</option>
                      <option value="Want to try a class">Want to try a class/session</option>
                      <option value="Training with a friend">Training with a member</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleNext} className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl hover:bg-brand-teal transition-all flex items-center justify-center gap-2">
                  Proceed to Payment <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Stripe <span className="text-blue-400">Checkout</span></h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total: {pass.price} USD</p>
                </div>
                
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-6">
                   <CreditCard size={48} className="text-white/20" />
                   <p className="text-[12px] uppercase tracking-[0.2em] text-white/40 text-center leading-relaxed">
                     This is a simulated secure payment gateway. <br/> Your transaction will be processed instantly.
                   </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="px-8 py-4 bg-white/5 text-white/60 text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button onClick={handlePayment} disabled={isProcessing} className="flex-1 py-4 bg-blue-500 text-white text-[10px] uppercase tracking-[0.2em] font-black rounded-xl hover:bg-blue-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Pay Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto border border-brand-teal/30">
                  <CheckCircle size={40} className="text-brand-teal" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Access <span className="text-brand-teal">Granted</span></h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your {pass.name} is ready.</p>
                </div>

                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] inline-block mx-auto mt-8">
                  <img src={qrCode} alt="Access QR Code" className="w-48 h-48 mx-auto rounded-xl" />
                  <p className="mt-6 text-[9px] uppercase tracking-widest text-white/60 font-black flex items-center justify-center gap-2">
                     <ShieldCheck size={14} className="text-brand-teal" /> Valid at front desk
                  </p>
                </div>

                <div className="pt-8 flex flex-col gap-4">
                  <button onClick={onClose} className="w-full py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl transition-all hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
