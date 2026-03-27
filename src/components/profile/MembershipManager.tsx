import { useState } from 'react';
import { Shield, Check, Lock, Info, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';

export const MembershipManager = ({ user, updateTier, showToast }: { user: UserProfile, updateTier: any, showToast: any }) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        showToast(data.error || 'Failed to start checkout', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Failed to connect to payment service', 'error');
    } finally {
      setLoading(false);
    }
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
                className={`w-full py-4 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all ${
                  isCurrent ? 'bg-brand-teal/10 text-brand-teal cursor-not-allowed' :
                  !canChange ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed' :
                  isSelected ? 'bg-brand-coral text-brand-black shadow-lg shadow-brand-coral/20' :
                  'bg-white text-black hover:bg-brand-teal'
                }`}
              >
                {isCurrent ? 'Active Plan' : isSelected ? 'Confirm Selection' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {selectedTier && canChange && (
        <div className="p-8 border border-brand-teal/30 bg-brand-teal/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Info className="text-brand-teal" size={24} />
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-white">Ready to switch to {selectedTier}?</p>
              <p className="text-[10px] uppercase tracking-widest text-white/60 mt-1">You'll be redirected to Stripe for secure payment.</p>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Pay & Upgrade'}
          </button>
        </div>
      )}
    </div>
  );
};
