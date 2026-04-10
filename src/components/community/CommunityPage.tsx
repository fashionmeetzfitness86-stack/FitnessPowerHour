import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MapPin, Activity, Bell, Lock } from 'lucide-react';
import { UserProfile } from '../../types';
import { AnimatePresence } from 'motion/react';
import { X, Mail, User } from 'lucide-react';

export const CommunityPage = ({ user, showToast }: { user: UserProfile | null, showToast: any }) => {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [joinedEarlyAccess, setJoinedEarlyAccess] = useState(() => {
    return localStorage.getItem(`fmf_whitelist_${user?.id || 'guest'}`) === 'true';
  });

  const hubs = [
    { name: 'Miami Core', location: 'Miami, FL', active: 142, icon: MapPin },
    { name: 'New York Division', location: 'New York, NY', active: 89, icon: MapPin },
    { name: 'California Protocol', location: 'Los Angeles, CA', active: 215, icon: MapPin },
    { name: 'Europe Hub', location: 'London / Paris', active: 304, icon: MapPin },
  ];

  const handleEarlyAccess = () => {
     if (!user) {
        setShowGuestModal(true);
     } else {
        finalizeEarlyAccess();
     }
  };

  const finalizeEarlyAccess = (e?: React.FormEvent) => {
     if (e) e.preventDefault();
     setJoinedEarlyAccess(true);
     localStorage.setItem(`fmf_whitelist_${user?.id || guestEmail || 'guest'}`, 'true');
     showToast('You are on the Early Access List.', 'success');
     setShowGuestModal(false);
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-white fade-in relative min-h-screen">
      
      <header className="mb-16 text-center space-y-4 relative z-10">
         <span className="text-brand-coral uppercase tracking-widest font-black text-[10px] bg-brand-coral/10 px-3 py-1 rounded-full border border-brand-coral/20">Phase 4 Directive</span>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          Global <span className="text-brand-teal">Network</span>
        </h1>
        <p className="text-white/40 uppercase tracking-widest font-bold max-w-xl mx-auto">
          Connection multiplies accountability. The global FMF network is activating soon.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
         <div className="card-gradient p-8 rounded-3xl border border-brand-teal/20 text-center">
            <Activity className="mx-auto text-brand-teal mb-4" size={32} />
            <h3 className="text-3xl font-black">1.2M</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Workouts Completed</p>
         </div>
         <div className="card-gradient p-8 rounded-3xl border border-white/10 text-center">
            <Users className="mx-auto text-white mb-4" size={32} />
            <h3 className="text-3xl font-black">750+</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Active Nodes</p>
         </div>
         <div className="card-gradient p-8 rounded-3xl border border-brand-coral/20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-coral/5 blur-xl pointer-events-none group-hover:bg-brand-coral/10 transition-all" />
            <Lock className="mx-auto text-brand-coral mb-4 relative z-10" size={32} />
            {joinedEarlyAccess ? (
               <div className="relative z-10">
                  <h3 className="text-2xl font-black text-brand-teal mt-2">Whitelist Approved</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Awaiting Node Activation</p>
               </div>
            ) : (
               <button onClick={handleEarlyAccess} className="relative z-10 px-8 py-3 bg-brand-coral text-black text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] transition-all">
                  Join Early Access
               </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
         <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest">Regional Hubs</h3>
            <div className="space-y-4">
               {hubs.map(hub => (
                  <div key={hub.name} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-center opacity-50 grayscale cursor-not-allowed">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl"><hub.icon size={20} className="text-white/40" /></div>
                        <div>
                           <h4 className="font-bold uppercase tracking-tight">{hub.name}</h4>
                           <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{hub.location}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-xl font-black">{hub.active}</span>
                        <p className="text-[8px] uppercase tracking-widest text-white/40 mt-1">Active</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center justify-between">
               Live Feed <span className="text-[8px] bg-brand-teal/10 text-brand-teal px-2 py-1 rounded border border-brand-teal/20">Preview</span>
            </h3>
            <div className="p-8 card-gradient border border-white/5 rounded-3xl relative overflow-hidden h-[400px]">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
               <div className="space-y-6 opacity-40 blur-[1px]">
                  {/* Mock logic feed */}
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Athlete 004</span>
                     </div>
                     <div className="h-16 bg-white/5 rounded-xl w-3/4" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Athlete 092</span>
                     </div>
                     <div className="h-24 bg-white/5 rounded-xl w-full" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Athlete 118</span>
                     </div>
                     <div className="h-16 bg-white/5 rounded-xl w-5/6" />
                  </div>
               </div>
               
               {/* Center Lock */}
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                  <Lock size={48} className="text-white/20 mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-teal mb-2">Community Launching Soon</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">The network is currently establishing secure nodes.</p>
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showGuestModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-sm rounded-[3rem] p-10 border border-brand-teal/20 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowGuestModal(false)}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-2 mb-8">
                <Lock className="mx-auto text-brand-teal mb-4" size={32} />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Guest Verification</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Please identify yourself to establish a network node.</p>
              </div>

              <form onSubmit={finalizeEarlyAccess} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black flex items-center gap-2">
                    <User size={12} /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal text-white transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full mt-4 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all"
                >
                  Submit & Confirm
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
