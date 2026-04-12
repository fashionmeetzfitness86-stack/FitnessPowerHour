import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Calendar, CheckCircle, Shield, Loader2, ArrowRight, AlertCircle, RefreshCw, ExternalLink, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, UserMembership } from '../../types';
import { supabase } from '../../supabase';

// ─── Card Brand Icon ────────────────────────────────────────────────────────
const CardBrandDisplay = ({ brand, last4, expMonth, expYear }: {
  brand?: string; last4?: string; expMonth?: number; expYear?: number;
}) => {
  const brandLabel = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Card';
  const expStr = expMonth && expYear ? `${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}` : null;

  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
        {brand === 'visa' ? (
          <span className="text-blue-300 font-black text-xs tracking-widest">VISA</span>
        ) : brand === 'mastercard' ? (
          <div className="flex -space-x-1.5">
            <div className="w-4 h-4 bg-red-500 rounded-full opacity-90" />
            <div className="w-4 h-4 bg-amber-400 rounded-full opacity-90" />
          </div>
        ) : brand === 'amex' ? (
          <span className="text-teal-300 font-black text-[9px] tracking-widest">AMEX</span>
        ) : (
          <CreditCard size={16} className="text-white/40" />
        )}
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest">
          {brandLabel} •••• {last4 || '––––'}
        </p>
        {expStr && <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">Expires {expStr}</p>}
      </div>
    </div>
  );
};

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active:    { label: 'Active',     cls: 'text-emerald-400', icon: <CheckCircle size={13} /> },
    trialing:  { label: 'Trial',      cls: 'text-brand-teal',   icon: <CheckCircle size={13} /> },
    past_due:  { label: 'Past Due',   cls: 'text-amber-400',   icon: <AlertCircle size={13} /> },
    canceled:  { label: 'Cancelled',  cls: 'text-brand-coral', icon: <XCircle size={13} /> },
    canceling: { label: 'Canceling',  cls: 'text-amber-400',   icon: <AlertCircle size={13} /> },
    unpaid:    { label: 'Unpaid',     cls: 'text-brand-coral', icon: <AlertCircle size={13} /> },
    inactive:  { label: 'Inactive',   cls: 'text-white/30',    icon: <XCircle size={13} /> },
  };
  const cfg = map[status?.toLowerCase() || ''] || { label: 'Inactive', cls: 'text-white/30', icon: <XCircle size={13} /> };
  return (
    <div className={`flex items-center gap-1.5 ${cfg.cls}`}>
      {cfg.icon}
      <span className="text-xs font-black uppercase tracking-widest">{cfg.label}</span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const Billing = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchMembership = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setMembership(data);
    } catch (err) {
      console.error('Error fetching membership:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembership(); }, [user.id]);

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
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
        showToast(data.message || data.error || 'Failed to open billing portal.', 'error');
      }
    } catch (err) {
      showToast('Error redirecting to Stripe portal.', 'error');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleStartMembership = async () => {
    try {
      setPortalLoading(true);
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'membership',
          tier: 'Basic',
          userId: user.id,
          userEmail: user.email,
          successUrl: window.location.href.split('#')[0] + '#/profile?payment=success&tier=Basic',
          cancelUrl: window.location.href
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.message || data.error || 'Failed to initialize checkout.', 'error');
      }
    } catch (err) {
      showToast('Error redirecting to Stripe checkout.', 'error');
    } finally {
      setPortalLoading(false);
    }
  };

  // Determine display values — prefer membership table, fall back to profile
  const effectiveStatus = membership?.status || (user.membership_status as string) || 'inactive';
  const isActive = effectiveStatus === 'active' || effectiveStatus === 'trialing';
  const nextDate = membership?.renews_at
    ? new Date(membership.renews_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  // Payment method: prefer membership table fields → fall back to profile fields
  const pmBrand = membership?.payment_method_brand || user.payment_method_brand;
  const pmLast4 = membership?.payment_method_last4 || user.payment_method_last4;
  const pmExpMonth = membership?.payment_method_exp_month;
  const pmExpYear = membership?.payment_method_exp_year;
  const hasPaymentMethod = !!(pmBrand && pmLast4);

  const currentTier = user.tier || 'Basic';

  return (
    <div className="space-y-10 fade-in">
      {/* ── HEADER ── */}
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Billing <span className="text-brand-teal">&amp; Payments</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Stripe is the single source of truth for your billing.
          </p>
        </div>
        <button
          onClick={fetchMembership}
          disabled={loading}
          className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/30 hover:text-brand-teal transition-colors font-black"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="text-brand-teal animate-spin" size={40} />
        </div>
      ) : (
        <>
          {/* ── PAST DUE ALERT ── */}
          {effectiveStatus === 'past_due' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4"
            >
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-1">Payment Past Due</h4>
                <p className="text-[11px] text-amber-400/80 uppercase tracking-widest font-bold leading-relaxed">
                  Your last payment failed. Update your payment method to keep your access active.
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="ml-auto flex-shrink-0 px-5 py-2.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all"
              >
                Update Now
              </button>
            </motion.div>
          )}

          {/* ── MAIN BILLING CARDS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Current Plan */}
            <div className="card-gradient p-8 space-y-6 border border-white/5 rounded-3xl">
              <div className="flex items-center gap-4">
                <Shield size={22} className="text-brand-teal" />
                <h3 className="text-lg font-black uppercase tracking-tight">Active Plan</h3>
              </div>

              <div className={`p-6 rounded-2xl border flex items-center justify-between ${
                isActive ? 'bg-brand-teal/10 border-brand-teal/20' : 'bg-white/5 border-white/10'
              }`}>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-white">{currentTier} Tier</p>
                  <p className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${isActive ? 'text-brand-teal' : 'text-white/30'}`}>
                    {isActive ? 'Monthly Subscription' : 'No active subscription'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${isActive ? 'text-brand-teal' : 'text-white/20'}`}>
                    {isActive ? '$19.99' : '—'}
                  </p>
                  {isActive && <p className="text-[8px] uppercase tracking-widest text-white/40 font-bold">USD / mo</p>}
                </div>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Status</span>
                  <StatusBadge status={effectiveStatus} />
                </div>

                {/* Next billing date */}
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-white/30" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Next Billing Date</span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    {nextDate || (isActive ? 'Checking…' : 'N/A')}
                  </span>
                </div>

                {/* Auto-pay — controlled via Stripe portal */}
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Auto-Pay</span>
                  <div className={`flex items-center gap-2 ${membership?.auto_pay_enabled ? 'text-brand-teal' : 'text-white/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${membership?.auto_pay_enabled ? 'bg-brand-teal animate-pulse' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {membership?.auto_pay_enabled != null
                        ? (membership.auto_pay_enabled ? 'On' : 'Off')
                        : (isActive ? 'On' : 'Off')}
                    </span>
                  </div>
                </div>

                {/* Subscription ID (for support) */}
                {membership?.stripe_subscription_id && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">Sub ID</span>
                    <span className="text-[9px] font-mono text-white/20 truncate max-w-[200px]">{membership.stripe_subscription_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card-gradient p-8 space-y-6 border border-white/5 rounded-3xl">
              <div className="flex items-center gap-4">
                <CreditCard size={22} className="text-white/60" />
                <h3 className="text-lg font-black uppercase tracking-tight">Payment Method</h3>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                {hasPaymentMethod ? (
                  <CardBrandDisplay
                    brand={pmBrand}
                    last4={pmLast4}
                    expMonth={pmExpMonth}
                    expYear={pmExpYear}
                  />
                ) : (
                  <div className="flex items-center gap-4 text-white/30">
                    <CreditCard size={20} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">No card on file</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5 text-white/20">
                        {isActive ? 'Payment method syncing from Stripe...' : 'Subscribe to add a payment method'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <Shield size={14} className="text-white/20 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold leading-relaxed">
                  Card data is encrypted and stored securely by Stripe. FMF never stores full card numbers.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                {isActive ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full py-5 bg-white text-black hover:bg-brand-teal transition-all text-xs uppercase font-black tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] disabled:opacity-50"
                  >
                    {portalLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Opening Portal...</>
                      : <><ExternalLink size={16} /> Manage Subscription</>
                    }
                  </button>
                ) : (
                  <button
                    onClick={handleStartMembership}
                    disabled={portalLoading}
                    className="w-full py-5 bg-brand-teal text-black hover:shadow-glow-teal transition-all text-xs uppercase font-black tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Starting...</>
                    ) : (
                      <>Start Membership <ArrowRight size={16} /></>
                    )}
                  </button>
                )}

                {isActive && (
                  <p className="text-center text-[9px] text-white/20 uppercase tracking-widest font-bold">
                    Manage subscription, update card, or cancel via Stripe →
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── BILLING HISTORY ── */}
          <div className="card-gradient rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-white/40" />
                <h3 className="text-lg font-black uppercase tracking-tight">Billing History</h3>
              </div>
              {isActive && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="text-[9px] uppercase tracking-widest text-brand-teal hover:text-white transition-colors font-black flex items-center gap-1.5"
                >
                  <ExternalLink size={10} /> View All Invoices in Stripe
                </button>
              )}
            </div>

            {isActive ? (
              <div className="p-8">
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-16 h-16 bg-brand-teal/5 rounded-2xl flex items-center justify-center border border-brand-teal/20">
                    <FileText size={24} className="text-brand-teal/40" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-white/60">
                      Invoice History in Stripe
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-2 max-w-xs mx-auto leading-relaxed">
                      Full invoice history, PDF receipts, and payment records are available in the Stripe billing portal.
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="mt-2 px-8 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-brand-teal hover:border-brand-teal/30 text-[9px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {portalLoading ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                    Open Billing Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center gap-4 text-center">
                <FileText size={32} className="text-white/10" />
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">
                  No billing history. Subscribe to get started.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
