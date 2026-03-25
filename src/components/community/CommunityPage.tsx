import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Lock, Unlock, 
  ChevronRight, ArrowRight, MessageCircle, MapPin, 
  Trophy, Activity, Zap, Star, ShieldCheck, 
  Plus, CheckCircle, Info, LogOut, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Community, CommunityCategory, CommunityRequest, UserProfile } from '../../types';

interface CommunityPageProps {
  user: UserProfile | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CommunityPage = ({ user, showToast }: CommunityPageProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestModal, setRequestModal] = useState<Community | null>(null);
  const [userRequests, setUserRequests] = useState<CommunityRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [commRes, catRes, reqRes, membersRes] = await Promise.all([
          supabase.from('communities').select('*').eq('status', 'active'),
          supabase.from('community_categories').select('*'),
          user ? supabase.from('community_requests').select('*').eq('user_id', user.id).eq('status', 'pending') : Promise.resolve({ data: [] }),
          supabase.from('community_members').select('*')
        ]);

        if (commRes.data) {
          // Enrich with members array aid from junction table
          const enriched = commRes.data.map(c => ({
            ...c,
            members: membersRes.data?.filter(m => m.community_id === c.id).map(m => m.user_id) || []
          }));
          setCommunities(enriched);
        }
        if (catRes.data) setCategories(catRes.data);
        if (reqRes.data) setUserRequests(reqRes.data);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      const matchesCategory = activeCategory === 'All' || categories.find(cat => cat.name === activeCategory)?.id === c.category_id;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [communities, categories, activeCategory, searchQuery]);

  const featuredCommunities = useMemo(() => {
    return communities.slice(0, 3); // In a real app, this could be a 'is_featured' flag
  }, [communities]);

  const handleJoinLeave = async (community: Community) => {
    if (!user) {
      showToast('Join the collective to participate', 'error');
      return;
    }

    const isMember = community.members?.includes(user.id);
    const hasPendingRequest = userRequests.find(r => r.community_id === community.id);

    if (isMember) {
      // Leave logic
      try {
        await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', user.id);
        setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, members: c.members?.filter(uid => uid !== user.id) } : c));
        showToast('Left the collective successfully', 'success');
      } catch (error) {
        showToast('System synchronization error', 'error');
      }
    } else if (hasPendingRequest) {
      // Cancel request logic
      try {
        await supabase.from('community_requests').delete().eq('id', hasPendingRequest.id);
        setUserRequests(prev => prev.filter(r => r.id !== hasPendingRequest.id));
        showToast('Join request cancelled', 'success');
      } catch (error) {
        showToast('Cancellation failed', 'error');
      }
    } else {
      // EVERYONE must request to join
      setRequestModal(community);
    }
  };

  const handleSendRequest = async (community: Community, message: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('community_requests').insert({
        community_id: community.id,
        user_id: user.id,
        user_name_snapshot: user.full_name,
        user_email_snapshot: user.email,
        status: 'pending',
        requested_at: new Date().toISOString()
      }).select().single();

      if (data) setUserRequests(prev => [...prev, data]);
      showToast('Transmission received. Awaiting admin clearance.', 'success');
      setRequestModal(null);
    } catch (error) {
      showToast('Signal deployment failed', 'error');
    }
  };

  if (loading) return (
    <div className="pt-40 pb-32 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
      <div className="text-center space-y-2">
        <p className="text-[12px] uppercase tracking-[0.4em] text-white/40 font-black animate-pulse">Establishing Nexus...</p>
        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold italic font-black uppercase italic italic-glow-brand-teal">Connecting to the global network</p>
      </div>
    </div>
  );

  return (
    <div className="pt-40 pb-32 min-h-screen bg-brand-black text-white selection:bg-brand-teal selection:text-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header System */}
        <header className="mb-24 space-y-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vh] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="text-center relative z-10 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <div className="h-[2px] w-12 bg-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
              <span className="text-brand-teal text-[10px] uppercase tracking-[0.6em] font-black">Collective Ecosystem</span>
              <div className="h-[2px] w-12 bg-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-white selection:bg-white selection:text-black"
            >
              FMF <br/>
              <span className="text-brand-coral italic underline decoration-white/10 underline-offset-8">Community</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 uppercase tracking-[0.3em] text-xs max-w-2xl mx-auto leading-relaxed font-bold selection:bg-brand-teal selection:text-black"
            >
              The global matrix of discipline, strength, and collective evolution. <br/> Join a nexus, share your protocol, and rise together.
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-brand-teal transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search the Nexus..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-xs uppercase tracking-widest font-bold outline-none focus:border-brand-teal transition-all focus:bg-white/[0.08] shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link 
              to="#explore" 
              className="px-10 py-6 bg-brand-teal text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-2xl border border-brand-teal hover:bg-black hover:text-brand-teal transition-all shadow-2xl shadow-brand-teal/20 active:scale-95"
            >
              Explore Hubs
            </Link>
          </div>
        </header>

        {/* Categories Navigator */}
        <div className="mb-24">
          <div className="flex flex-wrap justify-center gap-4">
            {['All', ...categories.map(c => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-5 rounded-2xl text-[9px] uppercase tracking-[0.3em] font-black transition-all border shadow-lg ${
                  activeCategory === cat 
                    ? 'bg-brand-teal border-brand-teal text-black shadow-[0_0_30px_rgba(45,212,191,0.3)] scale-[1.05]' 
                    : 'border-white/5 text-white/20 hover:border-white/20 hover:text-white bg-white/[0.02]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Communities System */}
        {featuredCommunities.length > 0 && activeCategory === 'All' && (
          <section className="mb-32 space-y-12">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-4 h-4 rounded-full bg-brand-coral shadow-[0_0_15px_rgba(251,113,133,0.5)]" />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Priority <span className="text-brand-coral/50">Nexus Channels</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredCommunities.map((c, i) => {
                const isMember = user ? c.members?.includes(user.id) : false;
                const hasPending = userRequests.find(r => r.community_id === c.id);
                return (
                  <FeaturedCommunityCard 
                    key={c.id} 
                    community={c} 
                    user={user}
                    i={i} 
                    onJoin={() => handleJoinLeave(c)} 
                    isMember={isMember}
                    hasPendingRequest={!!hasPending}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Unified Community Grid */}
        <section id="explore" className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
            <div className="space-y-3">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Collective <span className="text-brand-teal">Directory</span></h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black italic font-black uppercase italic italic-glow-brand-teal underline decoration-brand-teal/20 underline-offset-8 decoration-2 italic italic-shadow-brand-teal">Synchronizing all active interaction nodes</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/40 font-bold bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              <Filter size={16} className="text-brand-teal" />
              <span>Nodes Active: {filteredCommunities.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredCommunities.map((c, i) => {
                const isMember = user ? c.members?.includes(user.id) : false;
                const hasPending = userRequests.find(r => r.community_id === c.id);
                return (
                  <CommunityCard 
                    key={c.id} 
                    community={c} 
                    user={user}
                    category={categories.find(cat => cat.id === c.category_id)?.name || 'Nexus'}
                    i={i} 
                    onAction={() => handleJoinLeave(c)}
                    isMember={isMember}
                    hasPendingRequest={!!hasPending}
                  />
                );
              })}
          </div>

          {filteredCommunities.length === 0 && (
            <div className="py-40 text-center card-gradient rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-10 text-white/10 animate-pulse">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white/40 mb-4">No Nodes Detected</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Try recalibrating your search parameters or category filter.</p>
            </div>
          )}
        </section>
      </div>

      {/* Request Access Modal */}
      <AnimatePresence>
        {requestModal && (
          <RequestModal 
            community={requestModal} 
            onClose={() => setRequestModal(null)} 
            onSubmit={(msg) => handleSendRequest(requestModal, msg)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FeaturedCommunityCard = ({ community, user, i, onJoin, isMember, hasPendingRequest }: { community: Community, user: UserProfile | null, i: number, onJoin: () => void | Promise<void>, isMember: boolean, hasPendingRequest: boolean, key?: any }) => {
  const packageHierarchy: Record<string, number> = { 'basic': 1, 'premium': 2, 'elite': 3, 'custom': 4 };
  const userTier = (user?.tier || 'basic').toLowerCase();
  const requiredTier = community.required_package.toLowerCase();
  const meetsRequirement = (packageHierarchy[userTier] || 0) >= (packageHierarchy[requiredTier] || 0);

  return (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
    className="card-gradient group relative overflow-hidden flex flex-col h-[600px] border border-white/5 hover:border-brand-coral/30 transition-all rounded-[3rem] shadow-2xl"
  >
    <div className="absolute inset-0 z-0">
      <img 
        src={community.image || `https://picsum.photos/seed/${community.id}/800/1200`} 
        alt={community.name} 
        className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
    </div>

    <div className="relative z-10 p-12 flex flex-col h-full justify-end space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-brand-coral text-black text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">Featured</span>
          <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/60 font-black">
            <Users size={12} className="text-brand-teal" /> {community.members?.length || 0} Members
          </div>
        </div>
        <h3 className="text-5xl font-black uppercase tracking-tighter leading-none group-hover:text-brand-coral transition-colors">{community.name}</h3>
        <p className="text-xs text-white/60 line-clamp-3 leading-relaxed font-light italic italic-glow-white/10 italic-shadow-white/10">{community.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onJoin}
          disabled={!meetsRequirement && !isMember}
          className={`flex-grow py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black border transition-all ${
            isMember 
              ? 'bg-white/5 border-white/10 text-white/40 hover:bg-brand-coral hover:text-black hover:border-brand-coral' 
              : hasPendingRequest
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                : !meetsRequirement
                  ? 'bg-white/5 border-white/10 text-white/20'
                  : 'bg-white text-black border-white hover:bg-brand-teal hover:border-brand-teal hover:text-black shadow-xl'
          }`}
        >
          {isMember ? 'Leave Protocol' : hasPendingRequest ? 'Awaiting Clearance' : !meetsRequirement ? `Upgrade for ${community.required_package}` : 'Request Entry'}
        </button>
        <Link to={`/community/${community.id}`} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  </motion.div>
  );
};

const CommunityCard = ({ community, user, category, i, onAction, isMember, hasPendingRequest }: { community: Community, user: UserProfile | null, category: string, i: number, onAction: () => void | Promise<void>, isMember: boolean, hasPendingRequest: boolean, key?: any }) => {
  const packageHierarchy: Record<string, number> = { 'basic': 1, 'premium': 2, 'elite': 3, 'custom': 4 };
  const userTier = (user?.tier || 'basic').toLowerCase();
  const requiredTier = community.required_package.toLowerCase();
  const meetsRequirement = (packageHierarchy[userTier] || 0) >= (packageHierarchy[requiredTier] || 0);

  return (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: (i % 6) * 0.05 }}
    className="card-gradient group relative flex flex-col h-full border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2.5rem] overflow-hidden shadow-xl"
  >
    <div className="h-48 relative overflow-hidden">
      <img 
        src={community.image || `https://picsum.photos/seed/${community.id}/800/600`} 
        alt={community.name} 
        className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent" />
      <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] uppercase tracking-widest font-black text-brand-teal border border-brand-teal/20 shadow-xl">
        {category}
      </div>
    </div>

    <div className="p-8 space-y-6 flex-grow flex flex-col">
      <div className="space-y-3">
        <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors flex items-center justify-between">
          {community.name}
          {community.access_type === 'private' ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-emerald-500" />}
        </h3>
        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light italic italic-glow-white/10 italic-shadow-white/10-shadow-white/10 italic italic-glow-white/10">{community.description}</p>
      </div>

      <div className="flex items-center gap-6 py-4 border-y border-white/5">
        <div className="flex flex-col gap-1">
          <span className="text-[7px] uppercase tracking-widest text-white/20 font-black">Members</span>
          <span className="text-xs font-mono font-bold text-white/80">{community.members?.length || 0}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
          <span className="text-[7px] uppercase tracking-widest text-white/20 font-black">Access</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${community.access_type === 'public' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {community.access_type}
          </span>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <button 
          onClick={onAction}
          disabled={!meetsRequirement && !isMember}
          className={`w-full py-4 rounded-xl text-[9px] uppercase tracking-[0.3em] font-black border transition-all flex items-center justify-center gap-3 ${
            isMember 
              ? 'bg-transparent border-white/10 text-white/30 hover:bg-brand-coral hover:text-black hover:border-brand-coral' 
              : hasPendingRequest
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : !meetsRequirement
                  ? 'bg-white/5 border-white/10 text-white/20'
                  : 'bg-white/5 border-white/10 text-white hover:bg-brand-teal hover:text-black hover:border-brand-teal'
          }`}
        >
          {isMember ? <LogOut size={14} /> : hasPendingRequest ? <Clock size={14} /> : !meetsRequirement ? <ShieldCheck size={14} /> : <Plus size={14} />}
          {isMember ? 'Disconnect Node' : hasPendingRequest ? 'Pending Clearance' : !meetsRequirement ? `Upgrade for ${community.required_package}` : 'Request Clearance'}
        </button>
      </div>
    </div>
  </motion.div>
  );
};

const RequestModal = ({ community, onClose, onSubmit }: { community: Community, onClose: () => void, onSubmit: (msg: string) => void }) => {
  const [message, setMessage] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-brand-black/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="max-w-xl w-full card-gradient p-12 space-y-10 border border-brand-teal/20 rounded-[3rem] shadow-[0_0_100px_rgba(45,212,191,0.1)]"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-[1.5rem] bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center mx-auto text-brand-teal mb-6 shadow-glow-teal">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Clearance <span className="text-brand-teal">Required</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 leading-relaxed max-w-sm mx-auto font-bold">
            {community.name} is a restricted hub. Submit your credentials for administrative review.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black ml-4">Access Rationale</label>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white/80 outline-none focus:border-brand-teal transition-all min-h-[150px] resize-none uppercase tracking-widest italic italic-glow-white/10 font-black"
              placeholder="Why do you wish to join this collective? (e.g., Performance goals, community contribution)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <Info size={16} className="text-amber-500 flex-shrink-0" />
            <p className="text-[8px] uppercase tracking-widest text-amber-500/80 font-black leading-relaxed">
              Your membership tier and profile integrity will be verified during the clearance process.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black text-white/20 hover:text-white transition-colors border border-transparent hover:border-white/5"
          >
            Cancel Signal
          </button>
          <button 
            onClick={() => onSubmit(message)}
            disabled={!message.trim()}
            className="flex-grow py-5 bg-brand-teal text-black rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          >
            Transmit Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
