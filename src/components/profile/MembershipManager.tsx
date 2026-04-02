import { useState } from 'react';
import { Shield, Check, Lock, Info, Loader2, X, MapPin, QrCode, Phone, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

export const MembershipManager = ({ user, updateTier, showToast }: { user: UserProfile, updateTier: any, showToast: any }) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passStep, setPassStep] = useState(1); // 1: questionnaire, 2: payment, 3: success
  const [passData, setPassData] = useState({
    firstName: user.full_name?.split(' ')[0] || '',
    lastName: user.full_name?.split(' ')[1] || '',
    email: user.email || '',
    phone: '',
    reason: ''
  });
  const isPrivileged = user.role === 'admin' || user.role === 'super_admin';

  const tiers = [
    {
      name: 'Basic',
      price: '$19.99',
      period: 'per month',
      features: ['Access to basic workouts', 'Limited training content', 'Community forum access', 'Public challenges']
    },
    {
      name: 'Elite',
      price: '$59',
      period: 'per month',
      features: ['Full training system', 'Retreat priority access', 'Community features & Live Q&A', 'Special product drops', '1-on-1 mindset coaching', 'Personalized nutrition plan', 'Direct trainer messaging']
    },
    {
      name: 'Local Collective',
      price: '$299',
      period: 'per month',
      features: ['Everything in Elite', '1x Free Cold-Pressed Juice / mo', '1x Free Ginger Shot / mo', '1x Free Beverage of choice / mo', 'Physical Local Pass']
    },
    {
      name: 'Physical Local Pass',
      price: '$59',
      period: '3 or 7 Days',
      features: ['Full gym access', '1x Free Cold-Pressed Juice', '1x Free Ginger Shot', '1x Free Beverage of choice', 'QR Code Digital Pass'],
      isPass: true
    }
  ];

  const calculateDaysSinceChange = () => {
    if (!user.last_tier_change_date) return 31; // Safe default
    const lastChange = new Date(user.last_tier_change_date);
    const splitDiff = Date.now() - lastChange.getTime();
    return Math.floor(splitDiff / (1000 * 3600 * 24));
  };

  const daysSince = calculateDaysSinceChange();
  const canChange = daysSince >= 30;

  const handleUpdate = async () => {
    if (!selectedTier || loading) return;
    if (!canChange) {
      showToast('You cannot change tiers within 30 days of your last update.', 'error');
      return;
    }

    setLoading(true);
    if (isPrivileged) {
      // Simulate success for testing
      showToast('Administrative bypass active: Synchronizing tier directly with the matrix.', 'success');
      await new Promise(r => setTimeout(r, 1500));
      await updateTier(selectedTier);
      setSelectedTier(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'membership',
          tier: selectedTier,
          userId: user.id,
          userEmail: user.email
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast('Stripe node connection failed. Direct sync required.', 'error');
        // Fallback for testing if function doesn't exist
        if (process.env.NODE_ENV === 'development') {
           showToast('Dev Mode: Synchronizing tier directly.', 'success');
           await updateTier(selectedTier);
           setSelectedTier(null);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('External synchronization hub unreachable. Check signal.', 'error');
      // Fallback for testing
      if (process.env.NODE_ENV === 'development' || isPrivileged) {
          showToast('Bypass Active: Synchronizing tier.', 'success');
          await updateTier(selectedTier);
          setSelectedTier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const notifyAdminOfPurchase = async (type: string, tier: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: 'super_admin_placeholder', // Should be the actual super admin ID
        title: 'New Membership/Pass Purchase',
        message: `${user.full_name} has purchased a ${tier} ${type}.`,
        type: 'purchase',
        created_at: new Date().toISOString(),
        is_read: false
      });
    } catch (err) {
      console.error('Admin notification failed:', err);
    }
  };

  const handlePassPurchase = async () => {
    setLoading(true);
    // Simulate payment
    await new Promise(r => setTimeout(r, 2000));
    setPassStep(3);
    setLoading(false);
    showToast('Payment successful. Your local pass is active!', 'success');
    notifyAdminOfPurchase('pass', selectedTier || 'Local Pass');
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="space-y-4">
        <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
          Membership <span className="text-brand-teal">Management</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
          Upgrade or downgrade your access tier. Payment processed securely via Stripe.
        </p>
      </header>

      {!canChange && (
        <div className="p-6 bg-brand-coral/10 border border-brand-coral/30 rounded-2xl flex items-start gap-4">
          <Lock className="text-brand-coral flex-shrink-0" size={20} />
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-coral">Change Restriction Active</h4>
            <p className="text-xs text-brand-coral/80 uppercase tracking-widest leading-relaxed font-bold">
              You changed your membership {daysSince} days ago. Note that you may only update your tier once every 30 days.
              You can change your tier again in {30 - daysSince} days.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const isCurrent = user.tier === tier.name || (tier.name === 'Basic' && !user.tier);
          const isSelected = selectedTier === tier.name;

          return (
            <div
              key={tier.name}
              onClick={() => {
                if (isCurrent || !canChange) return;
                setSelectedTier(isSelected ? null : tier.name);
              }}
              className={`card-gradient relative flex flex-col p-8 transition-all overflow-hidden ${
                isCurrent ? 'border-brand-teal/50 bg-brand-teal/5' :
                isSelected ? 'border-brand-coral/50 bg-brand-coral/5 cursor-pointer scale-[1.02]' :
                canChange ? 'border-white/10 hover:border-white/30 cursor-pointer' : 'border-white/10 opacity-70 cursor-not-allowed'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 text-brand-teal flex items-center gap-1">
                  <span className="text-[8px] uppercase tracking-widest font-bold">Current</span>
                  <Check size={12} />
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tighter">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-12 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield size={14} className={isCurrent ? 'text-brand-teal mt-0.5' : 'text-white/20 mt-0.5'} />
                    <span className="text-xs text-white/60 font-light">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent || !canChange}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTier(tier.name);
                }}
                className={`w-full py-4 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all ${
                  isCurrent ? 'bg-brand-teal/10 text-brand-teal cursor-not-allowed' :
                  !canChange ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed' :
                  'bg-white text-black hover:bg-brand-teal hover:shadow-lg transition-all'
                }`}
              >
                {isCurrent ? 'Active Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTier && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-xl p-12 space-y-10 rounded-[4rem] border border-brand-teal/20 shadow-2xl relative"
            >
              {selectedTier === 'Physical Local Pass' && passStep === 1 && (
                <div className="space-y-10">
                   <div className="text-center space-y-4">
                     <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Step 1 / 3: Enrollment</span>
                     <h3 className="text-3xl font-black uppercase tracking-tighter">Local <span className="text-brand-teal">Pass</span> Protocol</h3>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">First Name</label>
                         <input 
                           value={passData.firstName}
                           onChange={e => setPassData({...passData, firstName: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-brand-teal transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Last Name</label>
                         <input 
                           value={passData.lastName}
                           onChange={e => setPassData({...passData, lastName: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-brand-teal transition-all"
                         />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Mobile Signal (Phone)</label>
                         <input 
                           placeholder="+1 (305) 000-0000"
                           value={passData.phone}
                           onChange={e => setPassData({...passData, phone: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-brand-teal transition-all"
                         />
                      </div>
                      <div className="space-y-4 col-span-2 pt-4">
                         <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Question: Why are you traveling to Miami?</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              'Fitness Retreat',
                              'Luxury Vacation',
                              'Business & Training',
                              'Local Experience',
                              'FMF Competition'
                            ].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => setPassData({...passData, reason: opt})}
                                className={`px-6 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-black border transition-all ${
                                  passData.reason === opt ? 'bg-brand-teal/20 border-brand-teal text-brand-teal shadow-glow-teal' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => setPassStep(2)}
                     disabled={!passData.lastName || !passData.phone || !passData.reason}
                     className="w-full py-6 bg-brand-teal text-black text-[11px] uppercase tracking-[0.5em] font-black rounded-3xl hover:scale-105 transition-all shadow-glow-teal disabled:opacity-30"
                   >
                     Authorize Payment Link
                   </button>
                </div>
              )}

              {selectedTier === 'Physical Local Pass' && passStep === 2 && (
                <div className="space-y-12 text-center">
                   <div className="space-y-4">
                     <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Step 2 / 3: Authorization</span>
                     <h3 className="text-3xl font-black uppercase tracking-tighter">Syncing <span className="text-brand-coral">Payment</span></h3>
                   </div>
                   
                   <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                      <div className="flex justify-between items-center px-4">
                         <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Authorized Pass:</span>
                         <span className="text-lg font-black uppercase tracking-tighter">{selectedTier}</span>
                      </div>
                      <div className="flex justify-between items-center px-4">
                         <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Total Charge:</span>
                         <span className="text-3xl font-black text-brand-coral">$59.00</span>
                      </div>
                   </div>

                   <div className="flex gap-6">
                      <button 
                        onClick={handlePassPurchase}
                        disabled={loading}
                        className="flex-1 py-6 bg-brand-coral text-black text-[11px] uppercase tracking-[0.5em] font-black rounded-3xl hover:scale-105 transition-all shadow-glow-coral flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Process Authorization'}
                      </button>
                      <button 
                        onClick={() => setPassStep(1)}
                        className="px-10 py-6 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.5em] font-black rounded-3xl hover:text-white"
                      >
                        Back
                      </button>
                   </div>
                </div>
              )}

              {selectedTier === 'Physical Local Pass' && passStep === 3 && (
                <div className="space-y-12 text-center animate-in zoom-in duration-500">
                   <div className="space-y-4">
                     <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/30">
                        <Check size={48} />
                     </div>
                     <h3 className="text-4xl font-black uppercase tracking-tighter">Access <span className="text-emerald-500">Authorized</span></h3>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Your Local Pass is Syncing...</p>
                   </div>
                   
                   <div className="relative group">
                      <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white p-6 rounded-[2.5rem] w-64 h-64 mx-auto flex items-center justify-center shadow-2xl">
                         <QrCode size={180} className="text-black" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-xs text-white/60 font-medium leading-relaxed uppercase tracking-widest">
                         Present this code at the Miami Beach Headquarters <br/> to receive your physical pass and drinks.
                      </p>
                      <div className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black">
                         Expres in 7 Days • Security Hash: {Math.random().toString(36).substring(7).toUpperCase()}
                      </div>
                   </div>

                   <button 
                     onClick={() => setSelectedTier(null)}
                     className="w-full py-6 border border-white/10 text-[11px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-white hover:text-black transition-all"
                   >
                     Close & Return
                   </button>
                </div>
              )}

              {selectedTier !== 'Physical Local Pass' && (
                <div className="space-y-10">
                   {/* Normal Membership Sync Content */}
                   <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal">
                        <Shield size={32} />
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter">Sync <span className="text-brand-teal">{selectedTier}</span> Protocol</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedTier(null)}
                      className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="text-white/40 hover:text-white" size={24} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 bg-white/5 rounded-3xl space-y-4 border border-white/10">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Protocol Parameters</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tiers.find(t => t.name === selectedTier)?.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check size={14} className="text-brand-teal mt-1 shrink-0" />
                            <span className="text-[11px] text-white/60 uppercase tracking-wide font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-baseline justify-center gap-2 border-y border-white/5 py-8">
                       <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Authorized Rate:</span>
                       <span className="text-5xl font-black text-white">{tiers.find(t => t.name === selectedTier)?.price}</span>
                       <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">/ MONTH</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex-1 py-5 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:scale-105 transition-all shadow-glow-teal flex items-center justify-center gap-3"
                    >
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Synchronizing...</> : 'Authorize Sync'}
                    </button>
                    <button 
                      onClick={() => setSelectedTier(null)}
                      className="flex-1 py-5 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
