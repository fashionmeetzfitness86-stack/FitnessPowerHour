import React, { useState, useEffect } from 'react';
import { Map, MapPin, Calendar, Users, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
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
      // Fetch all published retreats
      const { data: allRetreats, error: rError } = await supabase
        .from('retreats')
        .select('*')
        .eq('visibility_status', 'published');

      if (rError) throw rError;

      // Fetch user requests 
      const { data: requests, error: qError } = await supabase
        .from('retreat_applications')
        .select('*')
        .eq('user_id', user.id);

      if (qError) throw qError;

      // Map requests to retreats
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
      // Assume retreat payload has a property price, say 2500 -> 50% = 1250
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
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Global <span className="text-brand-teal">Retreats</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Travel, train, and connect with the FMF community globally.
          </p>
        </div>
        <div className="flex bg-white/5 rounded-full p-1 overflow-x-auto no-scrollbar">
          {['upcoming', 'requests', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all ${
                activeTab === tab ? 'bg-brand-teal text-black shadow-lg' : 'text-white/40 hover:text-white'
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
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {filtered.map(retreat => (
            <div key={retreat.id} className="card-gradient rounded-3xl overflow-hidden group border border-transparent hover:border-brand-teal/30 transition-all flex flex-col">
              <div className="aspect-video relative bg-brand-black">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all" />
                <img src={retreat.cover_image} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 transition-all duration-700" alt={retreat.title} />
                <div className="absolute top-4 right-4 z-20">
                  <span className={`px-4 py-2 text-[8px] uppercase tracking-widest font-bold rounded-full ${
                    retreat.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                    retreat.status === 'approved_pending_deposit' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                    retreat.status === 'requested' ? 'bg-white/10 text-white/80 border border-white/20' :
                    'bg-brand-teal/20 text-brand-teal border border-brand-teal/50'
                  }`}>
                    {retreat.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:text-brand-teal transition-colors">{retreat.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/60">
                      <MapPin size={16} className="text-brand-coral" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">{retreat.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <Calendar size={16} className="text-brand-teal" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        {new Date(retreat.start_date).toLocaleDateString()} - {new Date(retreat.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                  {retreat.status === 'approved_pending_deposit' ? (
                     <button onClick={() => handleDepositPayment(retreat)} className="flex-1 py-3 bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black border border-brand-coral/20 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                       Pay 50% Deposit
                     </button>
                  ) : retreat.status === 'requested' ? (
                     <button disabled className="flex-1 py-3 bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold rounded-xl flex items-center justify-center gap-2">
                       <Loader2 size={14} className="animate-spin" /> Under Admin Review
                     </button>
                  ) : (
                     <button className="flex-1 py-3 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all flex items-center justify-center gap-2">
                       <CheckCircle size={14} /> View Itinerary
                     </button>
                  )}
                  <button className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white rounded-xl transition-all border border-white/10">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-gradient p-16 text-center rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-4">
          <Map size={48} className="text-brand-teal opacity-50 mb-2" />
          <h3 className="text-xl font-bold uppercase tracking-tighter">No {activeTab} Retreats</h3>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm">Join the mailing list to get priority access to our upcoming global events.</p>
          <Link to="/retreats" className="mt-4 px-8 py-4 border border-brand-teal hover:bg-brand-teal hover:text-black text-brand-teal transition-all text-[10px] uppercase font-bold tracking-widest rounded-xl">
            Browse Opportunities
          </Link>
        </div>
      )}

      {user.tier === 'Basic' && (
        <div className="card-gradient p-8 flex items-center gap-6 mt-12 bg-brand-coral/5 border-brand-coral/20">
          <div className="w-16 h-16 bg-brand-coral/10 rounded-full flex items-center justify-center flex-shrink-0 text-brand-coral">
            <Users size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-tight text-brand-coral mb-2">Priority Selection</h4>
            <p className="text-[10px] text-brand-coral/60 uppercase tracking-widest leading-relaxed font-bold max-w-2xl">
              Basic & Local Collective members receive 48-hour priority access and a 15% discount on all global retreat bookings before they open to the public. Upgrade your membership to secure your spot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
