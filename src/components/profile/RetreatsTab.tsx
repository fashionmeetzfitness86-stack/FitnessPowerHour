import React, { useState, useEffect } from 'react';
import { Map, MapPin, Calendar, Users, ExternalLink, CheckCircle, Loader2, ArrowRight, Plane, ShieldCheck, Compass, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile, Retreat, RetreatApplication } from '../../types';
import { supabase } from '../../supabase';

export const RetreatsTab = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'requests'>('upcoming');
  const [retreats, setRetreats] = useState<(Retreat & { status?: string, amount_paid?: number, request_id?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: allRetreats, error: rError } = await supabase.from('retreats').select('*').eq('visibility_status', 'published');
      if (rError) throw rError;

      const { data: requests, error: qError } = await supabase.from('retreat_applications').select('*').eq('user_id', user.id);
      if (qError) throw qError;

      const mapped = (allRetreats || []).map(r => {
        const req = (requests || []).find(q => q.retreat_id === r.id);
        return { ...r, status: req?.status || 'none', request_id: req?.id, amount_paid: req?.amount_paid };
      });

      setRetreats(mapped);
    } catch (err) {
      console.error('Error fetching retreats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleDepositPayment = async (retreat: any) => {
    try {
      showToast('Initiating secure gateway...', 'info');
      const amount = retreat.price ? parseFloat(retreat.price) * 0.5 : 1000;
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'retreat_deposit',
          userId: user.id,
          userEmail: user.email,
          retreatId: retreat.id,
          requestId: retreat.request_id,
          retreatName: retreat.title,
          depositAmount: amount
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      showToast('Payment system failed to initialize.', 'error');
    }
  };

  const upcoming = retreats.filter(r => r.status === 'confirmed' && new Date(r.start_date) > new Date());
  const past = retreats.filter(r => r.status === 'confirmed' && new Date(r.start_date) <= new Date());
  const pending = retreats.filter(r => ['requested', 'approved_pending_deposit', 'deposit_paid'].includes(r.status));

  const filtered = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : pending;

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
            Operational <span className="text-brand-teal">Retreats</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Travel, train, and synchronize with the FMF community globally.
          </p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 w-full md:w-auto overflow-x-auto">
          {['upcoming', 'requests', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`flex-1 md:flex-none px-8 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${
                activeTab === tab ? 'bg-brand-teal text-black shadow-lg shadow-brand-teal/20' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="text-brand-teal animate-spin" size={40} />
        </div>
      ) : (
        <div className="space-y-12">
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {filtered.map(retreat => (
                    <div key={retreat.id} className="card-gradient rounded-[3rem] overflow-hidden group border border-white/5 hover:border-brand-teal/30 transition-all flex flex-col shadow-2xl">
                    <div className="aspect-video relative bg-brand-black overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all" />
                        <img src={retreat.cover_image} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={retreat.title} />
                        <div className="absolute top-6 right-6 z-20">
                        <span className={`px-4 py-2 text-[9px] uppercase tracking-widest font-black rounded-full backdrop-blur-md border ${
                            retreat.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                            retreat.status === 'approved_pending_deposit' ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' :
                            retreat.status === 'requested' ? 'bg-white/10 text-white/80 border-white/20 shadow-lg' :
                            'bg-brand-teal/20 text-brand-teal border-brand-teal/50'
                        }`}>
                            {retreat.status === 'requested' ? <span className="flex items-center gap-1"><Clock size={10} /> Awaiting Auth</span> : retreat.status.replace(/_/g, ' ')}
                        </span>
                        </div>
                        <div className="absolute bottom-6 left-6 z-20">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-brand-teal text-black px-3 py-1 rounded shadow-lg">RETREAT ID: {retreat.id.substring(0, 8)}</span>
                        </div>
                    </div>
                    
                    <div className="p-10 flex-grow flex flex-col justify-between space-y-8">
                        <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-brand-teal transition-colors leading-none">{retreat.title}</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-white/40">
                            <MapPin size={16} className="text-brand-coral" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">{retreat.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/40">
                            <Calendar size={16} className="text-brand-teal" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">
                                {new Date(retreat.start_date).toLocaleDateString()}
                            </span>
                            </div>
                        </div>
                        </div>
                        
                        <div className="pt-8 border-t border-white/5 flex gap-4">
                        {retreat.status === 'approved_pending_deposit' ? (
                            <button onClick={() => handleDepositPayment(retreat)} className="flex-1 py-4 bg-brand-coral text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl hover:shadow-glow-coral transition-all flex items-center justify-center gap-2">
                            Pay 50% Deposit
                            </button>
                        ) : retreat.status === 'requested' ? (
                            <div className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-bold rounded-xl flex items-center justify-center gap-3">
                            <ShieldCheck size={16} className="text-brand-teal animate-pulse" /> Final Verification Pending
                            </div>
                        ) : (
                            <button className="flex-1 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl shadow-glow-teal hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            <CheckCircle size={16} /> Access Logistics
                            </button>
                        )}
                        <button className="w-14 h-14 bg-white/5 hover:bg-brand-teal hover:text-black flex items-center justify-center text-white rounded-xl transition-all border border-white/10 group-hover:border-brand-teal/50">
                            <ArrowRight size={18} />
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="p-10 space-y-12">
                   <div className="max-w-xl mx-auto text-center space-y-6">
                      <div className="w-24 h-24 bg-brand-teal/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-teal border border-brand-teal/20">
                        <Compass size={48} className="animate-pulse" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black uppercase tracking-tighter">No {activeTab} Records</h3>
                        <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold leading-relaxed">Your retreat log is currently empty. Explore the global directory to initialize your next deployment.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Link 
                            to="/retreats" 
                            className="group card-gradient p-10 rounded-[3rem] border border-white/5 hover:border-brand-teal/30 transition-all flex flex-col items-center justify-center text-center space-y-6"
                        >
                           <Plane size={40} className="text-brand-teal group-hover:-translate-y-2 transition-transform" />
                           <div className="space-y-2">
                               <h4 className="text-xl font-bold uppercase tracking-tight">Browse Opportunities</h4>
                               <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-mono">Protocol Gallery Initialized</p>
                           </div>
                           <div className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl group-hover:bg-brand-teal transition-all">
                               Explore Directory
                           </div>
                       </Link>

                       <div className="card-gradient p-10 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                           <Map size={40} className="text-white/20" />
                           <div className="space-y-2">
                               <h4 className="text-xl font-bold uppercase tracking-tight text-white/40">Request Custom Hub</h4>
                               <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-mono">Direct Admin Request Layer</p>
                           </div>
                           <div className="px-8 py-4 bg-white/10 text-white/20 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                               Locked
                           </div>
                       </div>
                   </div>
                </div>
            )}

            {user.tier === 'Basic' && (
                <div className="card-gradient p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-8 bg-brand-coral/5 border-brand-coral/20">
                <div className="w-20 h-20 bg-brand-coral/10 rounded-[2rem] flex items-center justify-center flex-shrink-0 text-brand-coral shadow-[0_0_30px_rgba(251,113,133,0.1)]">
                    <ShieldCheck size={40} />
                </div>
                <div className="text-center md:text-left space-y-2">
                    <h4 className="font-black text-lg uppercase tracking-tighter text-brand-coral">Member Priority Clearance</h4>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest leading-relaxed font-bold max-w-2xl italic">
                    As a verified FMF Member, you receive 48-hour priority access and discount weighting on all global retreat bookings. Final authorization requires active subscription status.
                    </p>
                </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
