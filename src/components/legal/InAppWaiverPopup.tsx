import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';
import { Link } from 'react-router-dom';

interface InAppWaiverPopupProps {
  user: UserProfile;
  onAccept: () => void;
  onCancel: () => void;
}

export const InAppWaiverPopup = ({ user, onAccept, onCancel }: InAppWaiverPopupProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!isChecked) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ waiver_accepted: true })
        .eq('id', user.id);

      if (error) throw error;
      onAccept();
    } catch (err) {
      console.error('Failed to accept waiver:', err);
      // Even if it fails on backend momentarily, we let them pass for UX, or we can block them.
      // Better to let them pass for now if DB fails.
      onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onCancel}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-black border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Before You Start</h2>
            </div>
            <button onClick={onCancel} className="p-2 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-white/80">
              By continuing, you confirm that you understand:
            </p>
            <ul className="space-y-2">
              {[
                "Physical activity involves risk of injury",
                "You are responsible for your health and fitness level",
                "You will stop if you feel pain or discomfort",
                "This platform does not provide medical advice"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-coral mt-1.5 shrink-0" />
                  <span className="text-xs text-white/60 leading-relaxed font-semibold">{item}</span>
                </li>
              ))}
            </ul>
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl mt-4">
              <p className="text-red-400 text-xs font-black uppercase tracking-widest text-center">
                You agree to participate at your own risk.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-white/5">
            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-brand-coral border-brand-coral text-black' : 'border-white/20 group-hover:border-white/40 text-transparent'}`}>
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs text-white/80 font-bold select-none pt-0.5">
              I understand and accept the risks and agree to the Liability Waiver.
            </span>
          </label>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              onClick={handleAccept}
              disabled={!isChecked || isSubmitting}
              className="w-full py-3.5 bg-brand-coral text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_15px_rgba(255,107,107,0.3)] transition-all disabled:opacity-40 disabled:hover:shadow-none"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-3 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="text-center pt-2">
            <Link to="/liability" className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-brand-coral transition-colors" target="_blank">
               👉 View Full Liability Waiver
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
