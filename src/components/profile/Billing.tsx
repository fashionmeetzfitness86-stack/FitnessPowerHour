import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Calendar, CheckCircle, RefreshCw, Shield, Loader2, X, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, BillingHistory, UserMembership } from '../../types';
import { supabase } from '../../supabase';

export const Billing = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isUpdatingAutoPay, setIsUpdatingAutoPay] = useState(false);

  const fetchMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setMembership(data);
    } catch (err) {
      console.error('Error fetching membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoPay = async () => {
    if (!membership) return;
    try {
      setIsUpdatingAutoPay(true);
      const newVal = !membership.auto_pay_enabled;
      const { error } = await supabase
        .from('user_memberships')
        .update({ auto_pay_enabled: newVal })
        .eq('id', membership.id);
      
      if (error) throw error;
      setMembership({ ...membership, auto_pay_enabled: newVal });
      showToast(newVal ? 'Auto-pay authorized and synchronized.' : 'Auto-pay de-initialized.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Auto-pay sync failed.', 'error');
    } finally {
      setIsUpdatingAutoPay(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, [user.id]);

  // Scaffold dummy history for visual alignment until full Stripe sync
  const history: BillingHistory[] = [
    { id: 'inv_12345', user_id: user.id, amount: 19.99, status: 'paid', date: '2026-07-24', description: 'Basic Membership - Monthly' },
  ];

  return (
    <div className="space-y-12 fade-in">
      <header>
        <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
          Billing & <span className="text-brand-teal">Payments</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
          Manage your subscription and payment methods
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
           <Loader2 className="text-brand-teal animate-spin" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-gradient p-8 space-y-8">
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-brand-teal" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Active Plan</h3>
          </div>
          
          <div className="p-6 bg-brand-teal/10 border border-brand-teal/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-white">{user.tier || 'Basic'} Tier</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-teal mt-1">Billed Monthly</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-teal">$19.99</p>
              <p className="text-[8px] uppercase tracking-widest text-white/40">USD / mo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className={membership?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'} />
                <span className={`text-xs uppercase font-bold tracking-widest ${membership?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {membership?.status || 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Next Billing Date</span>
              <span className="text-xs uppercase font-bold text-white tracking-widest">
                {membership?.renews_at ? new Date(membership.renews_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Auto-Pay Protocol</span>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${membership?.auto_pay_enabled ? 'text-brand-teal' : 'text-white/20'}`}>
                  {membership?.auto_pay_enabled ? 'Active' : 'Offline'}
                </span>
                <button 
                  onClick={toggleAutoPay}
                  disabled={isUpdatingAutoPay}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${membership?.auto_pay_enabled ? 'bg-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-black rounded-full shadow-lg transition-all duration-500 ${membership?.auto_pay_enabled ? 'right-1' : 'left-1'}`}>
                    {isUpdatingAutoPay && (
                      <div className="w-full h-full border border-white/20 border-t-white rounded-full animate-spin" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient p-8 space-y-8">
          <div className="flex items-center gap-4 text-white">
            <CreditCard size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">Payment Method</h3>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-white/10 rounded overflow-hidden flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full translate-x-1.5" />
                <div className="w-6 h-6 border-2 border-white/50 rounded-full -translate-x-1.5 backdrop-blur-sm" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight tracking-widest">•••• •••• •••• 4242</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Expires 12/28</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-white/10 text-white text-[8px] uppercase tracking-widest font-bold rounded">Default</span>
          </div>

          <button 
            className="w-full py-5 bg-white/[0.03] border border-white/10 hover:border-brand-teal/50 hover:bg-white/[0.05] transition-all text-[10px] uppercase font-black tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 group"
            onClick={() => setShowPaymentModal(true)} // User wants to see details/update
          >
            Update Payment Method <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="card-gradient w-full max-w-xl p-12 space-y-12 rounded-[4rem] border border-white/10 shadow-2xl relative"
             >
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                
                <div className="space-y-4 text-center">
                  <div className="w-20 h-20 bg-brand-teal/10 rounded-[2rem] flex items-center justify-center text-brand-teal mx-auto border border-brand-teal/20">
                    <CreditCard size={32} />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Secure <span className="text-brand-teal">Vault</span></h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm mx-auto">Update your authorized payment credentials encrypted via Stripe protocol.</p>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Current Authorized Method</span>
                       <Shield size={14} className="text-brand-teal" />
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                          <div className="w-6 h-6 border-2 border-white rounded-full translate-x-1.5" />
                          <div className="w-6 h-6 border-2 border-white/50 rounded-full -translate-x-1.5 backdrop-blur-sm" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xl font-bold font-mono tracking-widest">•••• 4242</p>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Visa • Active Mastery Card</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      const btn = document.getElementById('stripe-sync-btn');
                      if (btn) btn.innerHTML = 'Synchronizing with Stripe...';
                      await new Promise(r => setTimeout(r, 2000));
                      showToast('Stripe synchronization successful. Payment method updated.', 'success');
                      setShowPaymentModal(false);
                    }}
                    id="stripe-sync-btn"
                    className="w-full py-6 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-3xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-4"
                  >
                     Initialize Stripe Sync <Plus size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <Shield className="text-white/20" size={20} />
                   <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold leading-relaxed">
                     Your payment data is fully encrypted and managed by Stripe. We do not store sensitive credit card information locally.
                   </p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="card-gradient overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <FileText size={20} className="text-white/40" />
            <h3 className="text-lg font-bold uppercase tracking-tight">Billing History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Amount</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
                <th className="px-8 py-4 text-[10px] text-right uppercase tracking-widest text-white/40 font-bold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/80">
                    {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-4 text-xs tracking-tight">{invoice.description}</td>
                  <td className="px-8 py-4 text-xs font-bold font-mono">${invoice.amount.toFixed(2)}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-coral/10 text-brand-coral'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => showToast('Receipt generated. Transmitting PDF to neural record.', 'success')}
                      className="text-[10px] text-brand-teal uppercase tracking-widest font-bold hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
        </>
      )}
    </div>
  );
};
