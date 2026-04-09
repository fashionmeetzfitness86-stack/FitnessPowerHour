import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';

export const CommunityAccessTab = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [user.id]);

  const checkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('community_requests')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching community status:', error);
    }
  };

  const requestAccess = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('community_requests').insert({
        user_id: user.id,
        status: 'pending'
      });

      if (error) throw error;
      
      setStatus('pending');
      showToast('Early access request submitted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to request access', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="border-b border-white/5 pb-8 relative z-10">
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
          Tribe <span className="text-brand-teal">Network</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold max-w-md">
          The future of FMF collective intelligence.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center p-16 text-center card-gradient rounded-[3rem] border border-brand-teal/20 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-teal/5 blur-3xl rounded-full" />
        
        <Shield size={64} className="text-brand-teal animate-pulse relative z-10" />
        
        <div className="relative z-10 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold uppercase tracking-tighter">
                Community <span className="text-brand-teal">Coming Soon</span>
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
                We are building a highly curated, private network for athletes. The community will launch globally once we hit our subscriber milestone to ensure a highly active roster.
            </p>
        </div>

        <div className="relative z-10 p-8 bg-black/40 border border-white/10 rounded-[2rem] w-full max-w-md">
            {!status && (
                <div className="space-y-6">
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Reserving a spot guarantees first-wave entry upon launch.</p>
                    <button 
                        onClick={requestAccess}
                        disabled={isSubmitting}
                        className="w-full px-8 py-5 bg-brand-teal text-black font-black uppercase tracking-[0.2em] text-[12px] rounded-2xl hover:scale-105 transition-all shadow-glow-teal disabled:opacity-50"
                    >
                        {isSubmitting ? 'Transmitting...' : 'Request Early Access'}
                    </button>
                </div>
            )}

            {status === 'pending' && (
                <div className="flex flex-col items-center gap-4">
                    <Clock size={32} className="text-brand-coral" />
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-brand-coral mb-1">Status: Pending</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Your intel is under review.</p>
                    </div>
                </div>
            )}

            {status === 'approved' && (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle size={32} className="text-brand-teal" />
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-brand-teal mb-1">Status: Approved</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">You will be notified on launch day.</p>
                    </div>
                </div>
            )}

            {status === 'rejected' && (
                <div className="flex flex-col items-center gap-4">
                    <XCircle size={32} className="text-red-500" />
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-red-500 mb-1">Status: Waitlisted</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Entry is currently capped.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
