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
        showToast(data.error || 'Stripe node connection failed. Direct sync required.', 'error');
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

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/.netlify/functions/create-customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          returnUrl: window.location.href
        })
      });

      const data = await res.json();
      if (data.url) {
         window.location.href = data.url;
      } else {
         showToast(data.error || 'Failed to connect to billing portal.', 'error');
      }
    } catch (err) {
      showToast('Error redirecting to portal.', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-12 fade-in">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Membership <span className="text-brand-teal">Management</span>
          </h2>
          <button 
            className="py-4 px-8 bg-white text-black hover:bg-brand-teal transition-all text-xs uppercase font-black tracking-widest rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] flex items-center justify-center gap-2"
            onClick={handleManageSubscription}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Manage Subscription'}
          </button>
        </div>
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
              <div className="space-y-10">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
