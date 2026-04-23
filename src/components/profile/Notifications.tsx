import { useState, useEffect } from 'react';
import { Bell, CreditCard, Shield, Camera, Package, Save, Loader2, Mail, Megaphone, Clock, CheckCircle2, AlertCircle, Info, Inbox } from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  source: 'personal' | 'broadcast';
}

export const Notifications = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [prefs, setPrefs] = useState({
    billing_reminders: true,
    payment_confirmations: true,
    membership_renewals: true,
    workout_reminders: false,
    retreat_confirmations: true,
    program_updates: true,
    order_updates: true,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'personal' | 'broadcast'>('all');

  useEffect(() => {
    const fetchPrefs = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.notification_preferences) {
        setPrefs(p => ({ ...p, ...authUser.user_metadata.notification_preferences }));
      }
    };
    fetchPrefs();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        // Fetch personal notifications for this user
        const { data: personal } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        // Fetch general broadcast notifications (no user_id or user_id is null)
        const { data: broadcast } = await supabase
          .from('notifications')
          .select('*')
          .is('user_id', null)
          .order('created_at', { ascending: false })
          .limit(100);

        const personalMapped: NotificationItem[] = (personal || []).map((n: any) => ({ ...n, source: 'personal' as const }));
        const broadcastMapped: NotificationItem[] = (broadcast || []).map((n: any) => ({ ...n, source: 'broadcast' as const }));

        // Merge and sort by date descending
        const merged = [...personalMapped, ...broadcastMapped].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(merged);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setNotifLoading(false);
      }
    };

    if (user?.id) fetchNotifications();
  }, [user?.id]);

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: { notification_preferences: prefs }
      });
      if (error) throw error;
      showToast('Neural notification matrix updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Synchronization failed.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = notifications.filter(n => filter === 'all' ? true : n.source === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'retreat': return <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />;
      case 'service': return <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />;
      case 'broadcast': return <Megaphone size={14} className="text-brand-teal flex-shrink-0 mt-0.5" />;
      default: return <Info size={14} className="text-white/40 flex-shrink-0 mt-0.5" />;
    }
  };

  const getTypeBadge = (n: NotificationItem) => {
    if (n.source === 'broadcast') return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
    switch (n.type) {
      case 'retreat': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'service': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-12 fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Notification <span className="text-brand-teal">Preferences</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Control what messages and alerts you receive from FMF.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Synchronizing...' : 'Update Settings'}
        </button>
      </header>

      {/* Preference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-gradient p-8 space-y-6 border border-white/5 rounded-3xl">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <CreditCard size={20} className="text-brand-teal" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Billing & Membership</h3>
          </div>
          <div className="space-y-6">
            <ToggleRow label="Billing Reminders" checked={prefs.billing_reminders} onChange={() => handleToggle('billing_reminders')} />
            <ToggleRow label="Payment Confirmations" checked={prefs.payment_confirmations} onChange={() => handleToggle('payment_confirmations')} />
            <ToggleRow label="Membership Renewals" checked={prefs.membership_renewals} onChange={() => handleToggle('membership_renewals')} />
          </div>
        </div>

        <div className="card-gradient p-8 space-y-6 border border-white/5 rounded-3xl">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <Camera size={20} className="text-brand-coral" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Training & Content</h3>
          </div>
          <div className="space-y-6">
            <ToggleRow label="Workout Reminders" checked={prefs.workout_reminders} onChange={() => handleToggle('workout_reminders')} />
            <ToggleRow label="Program Updates & New Videos" checked={prefs.program_updates} onChange={() => handleToggle('program_updates')} />
          </div>
        </div>

        <div className="card-gradient p-8 space-y-6 border border-white/5 rounded-3xl md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <Package size={20} className="text-white/60" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Store & Travel</h3>
          </div>
          <div className="space-y-6">
            <ToggleRow label="Order Status Updates" checked={prefs.order_updates} onChange={() => handleToggle('order_updates')} />
            <ToggleRow label="Retreat Confirmations & Info" checked={prefs.retreat_confirmations} onChange={() => handleToggle('retreat_confirmations')} />
          </div>
        </div>

        <div className="card-gradient p-8 flex items-center gap-6 border border-brand-teal/20 bg-brand-teal/5 rounded-3xl md:col-span-2 lg:col-span-1">
          <Shield size={32} className="text-brand-teal flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm uppercase tracking-tight mb-2">Important Notice</h4>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold leading-relaxed">
              We highly recommend keeping billing and payment confirmations enabled to avoid disruptions to your training access.
            </p>
          </div>
        </div>
      </div>

      {/* ── Notification History ── */}
      <section className="space-y-6 pt-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <Inbox size={22} className="text-brand-teal" />
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Notification <span className="text-brand-teal">History</span>
              </h3>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-0.5">
                Your personal alerts &amp; platform-wide announcements
              </p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            {(['all', 'personal', 'broadcast'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all border ${
                  filter === f
                    ? 'bg-brand-teal text-black border-brand-teal'
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-brand-teal/30 hover:text-white/60'
                }`}
              >
                {f === 'all' ? 'All' : f === 'personal' ? (
                  <span className="flex items-center gap-1"><Mail size={10} />Personal</span>
                ) : (
                  <span className="flex items-center gap-1"><Megaphone size={10} />Broadcast</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: notifications.length, color: 'text-white' },
            { label: 'Personal', value: notifications.filter(n => n.source === 'personal').length, color: 'text-brand-teal' },
            { label: 'Broadcasts', value: notifications.filter(n => n.source === 'broadcast').length, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="card-gradient border border-white/5 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {notifLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-brand-teal" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">Loading history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center card-gradient rounded-3xl border-2 border-dashed border-white/5">
            <Bell size={40} className="mx-auto text-white/5 mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n, i) => (
              <div
                key={n.id}
                style={{ animationDelay: `${i * 0.03}s` }}
                className="card-gradient border border-white/5 hover:border-white/10 rounded-2xl p-5 flex items-start gap-4 transition-all fade-in"
              >
                {/* Source badge icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.source === 'broadcast' ? 'bg-brand-teal/10' : 'bg-white/5'
                }`}>
                  {n.source === 'broadcast'
                    ? <Megaphone size={15} className="text-brand-teal" />
                    : <Mail size={15} className="text-white/40" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-black uppercase tracking-tight truncate">{n.title}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${getTypeBadge(n)}`}>
                      {n.source === 'broadcast' ? 'Broadcast' : n.type || 'System'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{n.message}</p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getTypeIcon(n.type)}
                  <div className="flex items-center gap-1 text-white/20">
                    <Clock size={9} />
                    <span className="text-[9px] font-mono whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ToggleRow = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between group">
    <span className="text-xs uppercase tracking-widest text-white/80 font-bold group-hover:text-brand-teal transition-colors">{label}</span>
    <button onClick={onChange} className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-brand-teal' : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-black rounded-full shadow transition-all ${checked ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);
