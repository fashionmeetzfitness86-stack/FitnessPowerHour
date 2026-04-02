import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ShieldCheck, Download, Home } from 'lucide-react';
import { supabase } from '../supabase';

export const PassSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const passId = searchParams.get('passId') || `PASS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    // Generate QR code based on passId
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${passId}`);
    
    // Attempt to notify admins
    supabase.from('notifications').insert({
      user_id: '1', // General admin notification channel or leave it
      title: 'New Local Pass Ready',
      message: `Pass ID: ${passId} was successfully purchased and generated.`,
      type: 'purchase',
      created_at: new Date().toISOString()
    }).then(() => console.log('Notification dispatched'));

  }, [passId]);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full mx-auto space-y-8 text-center"
      >
        <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto border border-brand-teal/30">
          <CheckCircle size={40} className="text-brand-teal" />
        </div>
        
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Access <span className="text-brand-teal">Granted</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Local Pass is active and uniquely linked.</p>
        </div>

        <div className="p-12 card-gradient border border-white/10 rounded-[3rem] inline-block mx-auto mt-8 relative group overflow-hidden">
          <div className="absolute inset-0 bg-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <img src={qrCode} alt="Access QR Code" className="w-48 h-48 mx-auto rounded-xl relative z-10" />
          
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2 relative z-10">
            <p className="text-[12px] font-mono font-bold text-white tracking-wider">{passId}</p>
            <p className="text-[9px] uppercase tracking-widest text-white/60 font-black flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-brand-teal" /> Valid at front desk entry
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
          <button className="flex-1 py-4 bg-white/5 text-white text-[10px] uppercase tracking-[0.2em] font-black rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
             <Download size={14} /> Save Pass
          </button>
          <button onClick={() => navigate('/')} className="flex-1 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl transition-all hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] flex items-center justify-center gap-2">
            <Home size={14} /> Back to Hub
          </button>
        </div>
      </motion.div>
    </div>
  );
};
