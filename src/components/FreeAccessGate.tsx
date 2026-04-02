import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, X, ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const FreeAccessGate = ({ user }: { user: any }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show for 'Free Access' tier users who aren't admins/athletes
    if (!user || user.tier !== 'Free Access' || ['admin', 'super_admin', 'athlete'].includes(user.role)) return;

    // Show modal every 15 seconds
    const interval = setInterval(() => {
      setShow(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user || user.tier !== 'Free Access' || ['admin', 'super_admin', 'athlete'].includes(user.role)) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="w-full max-w-xl card-gradient rounded-[3rem] border border-brand-teal/30 p-12 relative overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.1)] text-center space-y-10"
          >
            <button 
              onClick={() => setShow(false)}
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mx-auto w-20 h-20 rounded-full bg-brand-teal/20 flex items-center justify-center border border-brand-teal/30 shadow-glow-teal">
              <ShieldAlert size={40} className="text-brand-teal" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Choose Your <span className="text-brand-teal">Access</span></h2>
              <p className="text-[10px] uppercase tracking-widest text-white/60 leading-relaxed font-bold">
                You are currently on the Free Access tier. Unlock the full system to reach your physical peak.
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => { setShow(false); navigate('/membership'); }}
                className="w-full py-5 bg-brand-teal text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all flex items-center justify-center gap-3"
              >
                View Memberships <Zap size={16} />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => { setShow(false); navigate('/membership'); }}
                   className="py-4 border border-brand-coral/30 text-brand-coral hover:bg-brand-coral/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                 >
                   3-Day Pass
                 </button>
                 <button 
                   onClick={() => { setShow(false); navigate('/membership'); }}
                   className="py-4 border border-brand-coral/30 text-brand-coral hover:bg-brand-coral/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                 >
                   7-Day Pass
                 </button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
               <button onClick={() => { setShow(false); navigate('/shop'); }} className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white flex items-center justify-center gap-2 transition-colors">
                 <ShoppingBag size={14} /> Just here to shop
               </button>
               <button onClick={() => setShow(false)} className="text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-white flex items-center justify-center gap-2 transition-colors">
                 <Eye size={14} /> Just visiting the site
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
