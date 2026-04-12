import { useState, useEffect } from 'react';
import { Bell, CreditCard, Shield, Camera, Package, Save, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

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

  // Try to load heavily nested auth data asynchronously to ensure latest prefs sync
  useEffect(() => {
    const fetchPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.notification_preferences) {
         setPrefs(p => ({ ...p, ...user.user_metadata.notification_preferences }));
      }
    };
    fetchPrefs();
  }, []);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Save directly to the auth metadata to securely persist without requiring schema modifications
      const { data, error } = await supabase.auth.updateUser({
        data: {
          notification_preferences: prefs
        }
      });

      if (error) throw error;
      showToast('Neural notification matrix updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Synchronization failed.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 fade-in">
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
