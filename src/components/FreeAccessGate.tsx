import React, { useEffect } from 'react';
import { ShieldAlert, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const FreeAccessGate = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the user holds an active membership (admin/super_admin bypass this)
  const isMember = user && (user.tier === 'Basic' || user.tier === 'Elite' || user.role === 'admin' || user.role === 'super_admin');

  // Hard-locked routes
  const lockedPaths = [
    '/profile', 
    '/program', 
    '/videos', 
    '/services', 
    '/community', 
    '/schedule', 
    '/admin', 
    '/athlete/dashboard'
  ];

  const isLockedRoute = lockedPaths.some(p => location.pathname.startsWith(p));

  if (!isLockedRoute || isMember) {
    return null; // Free to browse public paths, or user has access
  }

  // HARD LOCK SCREEN (No Close Button)
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-brand-black/95 backdrop-blur-3xl">
      <div className="w-full max-w-xl card-gradient rounded-[3rem] border border-brand-teal/30 p-12 relative overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.1)] text-center space-y-10">
        <div className="mx-auto w-20 h-20 rounded-full bg-brand-teal/20 flex items-center justify-center border border-brand-teal/30 shadow-glow-teal">
          <ShieldAlert size={40} className="text-brand-teal animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold uppercase tracking-tighter">Unlock Your <span className="text-brand-teal">Program</span> to Continue</h2>
          <p className="text-sm text-white/60 leading-relaxed font-bold">
            Full access to programs, communities, services, and dashboards requires an active membership.
          </p>
        </div>

        <button 
          onClick={() => navigate('/membership')}
          className="w-full py-6 bg-brand-teal text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all flex items-center justify-center gap-3"
        >
          Start Membership - $19.99 <Zap size={16} />
        </button>

        <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-4">
           <button onClick={() => navigate('/')} className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors underline underline-offset-4">
             Return to Homepage
           </button>
        </div>
      </div>
    </div>
  );
};
