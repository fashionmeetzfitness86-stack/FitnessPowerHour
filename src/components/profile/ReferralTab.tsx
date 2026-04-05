import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';
import { Users, Copy, CheckCircle2, Gift } from 'lucide-react';

export const ReferralTab = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
     total: 0,
     converted: 0,
     rewards: 0
  });

  const referralLink = `${window.location.origin}/#/signup?ref=${user.referral_code || ''}`;

  useEffect(() => {
     fetchReferrals();
  }, [user.id]);

  const fetchReferrals = async () => {
     try {
       const { data, error } = await supabase.from('referrals').select('*, referred:profiles!referred_user_id(full_name, email, tier)').eq('referrer_user_id', user.id);
       
       if (data) {
          setReferrals(data);
          setStats({
             total: data.length,
             converted: data.filter(d => d.status === 'converted').length,
             rewards: data.filter(d => d.reward_given).length,
          });
       }
     } catch (err) {
       console.error(err);
     }
  };

  const copyLink = () => {
     navigator.clipboard.writeText(referralLink);
     showToast('Referral link copied to clipboard', 'success');
  };

  return (
     <div className="space-y-8 fade-in">
        <header className="border-b border-white/5 pb-8">
           <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
             Invite & <span className="text-brand-coral">Earn</span>
           </h2>
           <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold max-w-lg">
             Bring new members into the ecosystem. Earn systemic rewards. Grow the network.
           </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="card-gradient p-8 rounded-3xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Total Invites</span>
              <span className="text-4xl font-black text-white">{stats.total}</span>
           </div>
           <div className="card-gradient p-8 rounded-3xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Converted</span>
              <span className="text-4xl font-black text-brand-teal">{stats.converted}</span>
           </div>
           <div className="bg-brand-coral/10 p-8 rounded-3xl border border-brand-coral/20">
              <span className="text-[10px] uppercase tracking-widest text-brand-coral font-bold block mb-2">Rewards Earned</span>
              <span className="text-4xl font-black text-brand-coral">{stats.rewards} <span className="text-sm">Months Free</span></span>
           </div>
        </div>

        <div className="card-gradient p-8 rounded-3xl border border-brand-coral/20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-brand-coral/5 blur-3xl pointer-events-none group-hover:bg-brand-coral/10 transition-all" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-grow w-full">
                 <h3 className="text-xl font-black uppercase tracking-tight mb-2">Your Direct Link</h3>
                 <div className="flex gap-4">
                    <input readOnly value={referralLink} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-mono text-white/60 focus:outline-none" />
                 </div>
              </div>
              <button onClick={copyLink} className="w-full md:w-auto px-10 py-5 bg-brand-coral text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] transition-all flex items-center justify-center gap-3">
                 <Copy size={16} /> Copy URL
              </button>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest">Referred Network</h3>
           {referrals.length === 0 ? (
              <div className="p-12 text-center border-dashed border border-white/10 rounded-3xl">
                 <Users size={32} className="mx-auto text-white/20 mb-4" />
                 <p className="text-[10px] tracking-widest text-white/40 font-bold uppercase">No nodes connected yet.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {referrals.map(r => (
                    <div key={r.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold capitalize">{r.referred?.full_name || 'Pending User'}</p>
                          <p className="text-[10px] text-white/40 font-mono mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                       </div>
                       {r.status === 'converted' ? (
                          <span className="flex items-center gap-2 text-[10px] uppercase font-black text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full"><Gift size={12}/> Reward Granted</span>
                       ) : (
                          <span className="text-[10px] uppercase font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">Pending Subs.</span>
                       )}
                    </div>
                 ))}
              </div>
           )}
        </div>
     </div>
  );
};
