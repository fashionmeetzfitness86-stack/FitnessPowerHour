import { useState, useEffect } from 'react';
import { Shield, Check, Lock, Loader2, X, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

export const MembershipManager = ({ user, updateTier, showToast }: { user: UserProfile, updateTier: any, showToast: any }) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isPrivileged = user.role === 'admin' || user.role === 'super_admin';

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      accent: 'teal',
      icon: Zap,
      features: [
        'Access to public workouts',
        'Community timeline access',
        'Basic progress tracking',
        'Limited video library'
      ]
    },
    {
      name: 'Basic',
      price: '$19.99',
      period: 'per month',
      accent: 'coral',
      icon: Shield,
      features: [
        'Everything in Free',
        'Full training content library',
        'Workout calendar & scheduling',
        'Community forum access',
        'Public challenges & streaks'
      ]
    },
    {
      name: 'Pro',
      price: '$39.99',
      period: 'per month',
      accent: 'gold',
      icon: Crown,
      features: [
        'Everything in Basic',
        '1-on-1 training sessions',
        'Priority service requests',
        'Retreat early access',
        'Athlete directory listing',
        'Exclusive Pro content'
      ]
    }
  ];

  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const { data } = await supabase
          .from('user_memberships')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) setMembership(data);
      } catch {}
    };
    fetchMembership();
  }, [user.id]);

  const hasActiveSubscription = membership?.status === 'active';

  const calculateDaysSinceChange = () => {
    if (!user.last_tier_change_date) return 31;
    const lastChange = new Date(user.last_tier_change_date);
    return Math.floor((Date.now() - lastChange.getTime()) / (1000 * 3600 * 24));
  };

  const daysSince = calculateDaysSinceChange();
  const canChange = daysSince >= 30;

  // Map tier to a canonical name — default to Free
  const rawTier = (user.tier || '').toLowerCase().trim();
  const currentTierName = (() => {
    if (rawTier === 'pro') return 'Pro';
    if (rawTier === 'basic') return 'Basic';
    return 'Free';
  })();

  type AccentKey = 'teal' | 'coral' | 'gold';
  const ACCENTS: Record<AccentKey, { border: string; bg: string; text: string; btn: string; dot: string }> = {
    teal:  { border: 'border-brand-teal/50',  bg: 'bg-brand-teal/10',  text: 'text-brand-teal',  btn: 'bg-brand-teal text-black hover:opacity-90',              dot: 'bg-brand-teal' },
    coral: { border: 'border-brand-coral/50', bg: 'bg-brand-coral/10', text: 'text-brand-coral', btn: 'bg-brand-coral text-black hover:opacity-90',             dot: 'bg-brand-coral' },
    gold:  { border: 'border-amber-400/50',   bg: 'bg-amber-400/10',   text: 'text-amber-400',   btn: 'bg-amber-400 text-black hover:opacity-90',              dot: 'bg-amber-400' },
  };

  const a = (accent: string) => ACCENTS[accent as AccentKey] || ACCENTS.teal;

  const handleUpdate = async () => {
    if (!selectedTier || loading) return;
    if (!canChange) {
      showToast('You cannot change tiers within 30 days of your last update.', 'error');
      return;
    }

    setLoading(true);

    // Free — no Stripe needed
    if (selectedTier === 'Free') {
      try {
        await updateTier('Free');
        showToast('Downgraded to Free plan. Access updated.', 'success');
        setSelectedTier(null);
      } catch {
        showToast('Failed to update tier.', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Admin bypass
    if (isPrivileged) {
      await new Promise(r => setTimeout(r, 800));
      await updateTier(selectedTier);
      showToast('Admin bypass: tier updated.', 'success');
      setSelectedTier(null);
      setLoading(false);
      return;
    }

    // Stripe checkout
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'membership', tier: selectedTier, userId: user.id, userEmail: user.email })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast(data.error || 'Stripe checkout unavailable.', 'error');
    } catch {
      showToast('Could not reach checkout. Check connection.', 'error');
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
        body: JSON.stringify({ userEmail: user.email, returnUrl: window.location.href })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast(data.error || 'Failed to connect to billing portal.', 'error');
    } catch {
      showToast('Error redirecting to portal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedTierObj = tiers.find(t => t.name === selectedTier);

  return (
    <div className="space-y-10 fade-in">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
              Membership <span className="text-brand-teal">Management</span>
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">
              Upgrade or downgrade your access tier anytime.
            </p>
          </div>
          {hasActiveSubscription && (
            <button
              className="py-3 px-6 bg-white/5 border border-white/10 text-white hover:bg-brand-teal hover:text-black hover:border-brand-teal transition-all text-[10px] uppercase font-black tracking-widest rounded-xl flex items-center gap-2"
              onClick={handleManageSubscription}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Manage Billing
            </button>
          )}
        </div>

        {/* Active plan indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 border border-brand-teal/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-black text-brand-teal">
            Current Plan: {currentTierName}
          </span>
        </div>
      </header>

      {!canChange && (
        <div className="p-5 bg-brand-coral/10 border border-brand-coral/30 rounded-2xl flex items-center gap-4">
          <Lock className="text-brand-coral flex-shrink-0" size={16} />
          <p className="text-[10px] text-brand-coral/80 uppercase tracking-widest font-bold">
            Tier changed {daysSince} days ago. You can change again in {30 - daysSince} days.
          </p>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent = currentTierName === tier.name;
          const isSelected = selectedTier === tier.name;
          const ac = a(tier.accent);
          const Icon = tier.icon;

          return (
            <motion.div
              key={tier.name}
              whileHover={!isCurrent && canChange ? { scale: 1.02, y: -4 } : {}}
              onClick={() => {
                if (isCurrent || !canChange) return;
                setSelectedTier(isSelected ? null : tier.name);
              }}
              className={`relative flex flex-col p-7 rounded-[2rem] border transition-all duration-300 ${
                isCurrent
                  ? `${ac.border} ${ac.bg}`
                  : isSelected
                  ? `${ac.border} bg-white/5 cursor-pointer`
                  : canChange
                  ? 'border-white/10 bg-white/[0.02] hover:border-white/25 cursor-pointer'
                  : 'border-white/5 bg-black/20 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Active badge */}
              {isCurrent && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-black border ${ac.border} ${ac.text}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${ac.dot} animate-pulse`} />
                  Active Plan
                </div>
              )}
              {isSelected && !isCurrent && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black border ${ac.border} ${ac.text}`}>
                  Selected ↓
                </div>
              )}

              {/* Icon + Name/Price */}
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrent || isSelected ? ac.bg : 'bg-white/5'} border ${isCurrent || isSelected ? ac.border : 'border-white/10'}`}>
                  <Icon size={18} className={isCurrent || isSelected ? ac.text : 'text-white/30'} />
                </div>
                <div>
                  <h3 className={`text-base font-black uppercase tracking-tighter ${isCurrent || isSelected ? ac.text : 'text-white'}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{tier.price}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{tier.period}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check size={12} className={isCurrent || isSelected ? ac.text : 'text-white/20'} />
                    <span className="text-[11px] text-white/55 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                disabled={isCurrent || !canChange}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCurrent && canChange) setSelectedTier(tier.name);
                }}
                className={`w-full py-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all ${
                  isCurrent
                    ? `${ac.bg} ${ac.text} border ${ac.border} cursor-default`
                    : !canChange
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : `${ac.btn} shadow-lg`
                }`}
              >
                {isCurrent
                  ? '✓ Your Current Plan'
                  : tier.name === 'Free'
                  ? 'Downgrade to Free'
                  : `Switch to ${tier.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedTier && selectedTierObj && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card-gradient w-full max-w-lg p-10 space-y-8 rounded-[3rem] border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a(selectedTierObj.accent).bg} border ${a(selectedTierObj.accent).border}`}>
                    <selectedTierObj.icon size={26} className={a(selectedTierObj.accent).text} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Switching to</p>
                    <h3 className={`text-4xl font-black uppercase tracking-tighter ${a(selectedTierObj.accent).text}`}>{selectedTier}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedTier(null)} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X className="text-white/40" size={20} />
                </button>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-3">What's included</p>
                {selectedTierObj.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={12} className={a(selectedTierObj.accent).text} />
                    <span className="text-[11px] text-white/60 uppercase tracking-wide">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-baseline justify-center gap-2 py-4 border-y border-white/5">
                <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Rate:</span>
                <span className="text-5xl font-black text-white">{selectedTierObj.price}</span>
                <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">/ {selectedTierObj.period}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`flex-1 py-4 text-[11px] uppercase tracking-[0.3em] font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${a(selectedTierObj.accent).btn}`}
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : selectedTier === 'Free'
                    ? 'Confirm Downgrade'
                    : 'Proceed to Checkout →'}
                </button>
                <button
                  onClick={() => setSelectedTier(null)}
                  className="flex-1 py-4 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.3em] font-black rounded-2xl hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
