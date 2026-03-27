import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Users, MessageSquare, Heart, Share2, 
  MoreVertical, Send, Image as ImageIcon, Trash2, 
  MapPin, Trophy, ShieldCheck, Zap, Info, Quote, Plus,
  Clock, Unlock, X
} from 'lucide-react';
import { supabase } from '../../supabase';
import { Community, CommunityPost, CommunityComment, UserProfile } from '../../types';

interface CommunityDetailProps {
  user: UserProfile | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CommunityDetail = ({ user, showToast }: CommunityDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [commRes, postsRes, reqRes, membersRes] = await Promise.all([
          supabase.from('communities').select('*').eq('id', id).single(),
          supabase.from('community_posts').select('*').eq('community_id', id).order('created_at', { ascending: false }),
          user ? supabase.from('community_requests').select('*').eq('community_id', id).eq('user_id', user.id).eq('status', 'pending').maybeSingle() : Promise.resolve({ data: null, error: null }),
          supabase.from('community_members').select('*').eq('community_id', id)
        ]);

        if (commRes.data) {
          setCommunity({
            ...commRes.data,
            members: membersRes.data?.map(m => m.user_id) || []
          });
        }
        if (postsRes.data) setPosts(postsRes.data);
        if (reqRes.data) setHasPendingRequest(true);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user || !community) return;

    try {
      const newPost = {
        community_id: community.id,
        user_id: user.id,
        user_name_snapshot: user.full_name,
        title: 'Community Update',
        content: newPostContent,
        likes: [],
        comments: [],
        tags: ['General'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('community_posts').insert(newPost).select().single();
      if (data) setPosts([data, ...posts]);
      setNewPostContent('');
      setIsPosting(false);
      showToast('Transmission shared with the collective', 'success');
    } catch (error) {
      showToast('Transmission failure', 'error');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(user.id);
    const newLikes = hasLiked 
      ? post.likes.filter(uid => uid !== user.id)
      : [...post.likes, user.id];

    try {
      await supabase.from('community_posts').update({ likes: newLikes }).eq('id', postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    } catch (error) {
      showToast('Reaction synchronization failed', 'error');
    }
  };

  const handleJoinClick = () => {
    if (!user) {
      showToast('Nexus profile required for synchronization', 'error');
      return;
    }

    if (hasPendingRequest) {
      showToast('Request still synchronizing with the matrix', 'error');
      return;
    }

    setIsRequestModalOpen(true);
  };

  const submitRequest = async () => {
    if (!user || !community) return;
    try {
      await supabase.from('community_requests').insert({
        community_id: community.id,
        user_id: user.id,
        user_name_snapshot: user.full_name,
        user_email_snapshot: user.email,
        status: 'pending',
        requested_at: new Date().toISOString()
      });
      setHasPendingRequest(true);
      setIsRequestModalOpen(false);
      showToast('Clearance request transmitted', 'success');
    } catch (error) {
      showToast('Signal transmission failure', 'error');
    }
  };

  if (loading) return (
    <div className="pt-40 pb-32 flex flex-col items-center justify-center min-h-[60vh] space-y-6 bg-brand-black">
      <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin shadow-glow-teal" />
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Establishing Node Connection...</p>
    </div>
  );

  if (!community) return (
    <div className="pt-40 pb-32 min-h-screen flex flex-col items-center justify-center bg-brand-black text-white p-6 text-center">
      <div className="w-24 h-24 rounded-[2rem] bg-brand-coral/10 flex items-center justify-center text-brand-coral mb-8 border border-brand-coral/20">
        <ShieldCheck size={48} />
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Node Not Found</h2>
      <p className="text-white/40 uppercase tracking-widest text-[10px] font-black max-w-xs mx-auto mb-10">
        The requested interaction node does not exist or has been collapsed.
      </p>
      <Link to="/community" className="px-10 py-5 bg-white text-black text-[10px] uppercase tracking-widest font-black rounded-2xl hover:bg-brand-teal transition-all">
        Return to Directory
      </Link>
    </div>
  );

  const isMember = user ? community.members?.includes(user.id) : false;

  return (
    <div className="pt-32 pb-32 min-h-screen bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hub Header */}
        <div className="relative mb-20">
          <Link to="/community" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-brand-teal transition-colors mb-12 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Ecosystem
          </Link>
          
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 ${community.access_type === 'public' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {community.access_type} Access
                </span>
                <span className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black italic italic-glow-brand-teal underline decoration-brand-teal/20 underline-offset-8">Synchronized Node</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">{community.name}</h1>
              <p className="text-white/40 text-lg font-light leading-relaxed italic italic-glow-white/10 italic-shadow-white/10">{community.description}</p>
              
              <div className="flex flex-wrap gap-8 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-glow-teal">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Members</p>
                    <p className="text-lg font-black font-mono tracking-tighter">{community.members?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral shadow-glow-coral">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Dialogue</p>
                    <p className="text-lg font-black font-mono tracking-tighter">{posts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {!isMember && (
              <div className="p-8 card-gradient border border-brand-teal/20 rounded-[2.5rem] space-y-6 w-full lg:w-96 shadow-2xl">
                <div className="flex items-center gap-4">
                  <Zap size={20} className="text-brand-teal animate-pulse" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Connection Restricted</h3>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed font-bold">
                  Administrative clearance is required to interact with this node.
                </p>
                <button 
                  onClick={handleJoinClick}
                  disabled={hasPendingRequest}
                  className={`w-full py-5 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all ${
                    hasPendingRequest 
                      ? 'bg-white/5 border-white/10 text-white/20' 
                      : 'bg-brand-teal text-black shadow-glow-teal hover:scale-105 active:scale-95'
                  }`}
                >
                  {hasPendingRequest ? 'Pending Matrix Sync' : 'Request Node Entry'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feed Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            {/* Create Post Area */}
            {isMember && (
              <div className="card-gradient p-10 border border-white/5 rounded-[2.5rem] space-y-8 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal font-black text-xl group-hover:scale-110 transition-transform shadow-glow-teal">
                    {user?.full_name[0]}
                  </div>
                  <button 
                    onClick={() => setIsPosting(true)}
                    className="flex-grow text-left px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white/30 text-[10px] uppercase tracking-[0.2em] font-black hover:bg-white/10 transition-all"
                  >
                    Share protocol update, {user?.full_name.split(' ')[0]}...
                  </button>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="space-y-8">
              {posts.map((post, i) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-gradient p-12 space-y-8 border border-white/5 hover:border-white/10 transition-all rounded-[3rem] shadow-xl group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black group-hover:text-brand-teal transition-all text-lg shadow-xl">
                        {post.user_name_snapshot[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{post.user_name_snapshot}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">
                          <Clock size={12} /> {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <p className="text-white/70 text-base leading-relaxed font-light italic italic-glow-white/10 italic-shadow-white/10 shadow-white/10 italic italic-glow-white/10">"{post.content}"</p>
                    {post.image_url && (
                      <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <img src={post.image_url} alt="Post visualization" className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center gap-10">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-3 transition-all group/btn ${post.likes.includes(user?.id || '') ? 'text-brand-coral' : 'text-white/30 hover:text-brand-coral'}`}
                    >
                      <Heart size={20} className={post.likes.includes(user?.id || '') ? 'fill-brand-coral' : ''} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{post.likes.length} Reactions</span>
                    </button>
                    <button className="flex items-center gap-3 text-white/30 hover:text-brand-teal transition-all group/btn">
                      <Quote size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{post.comments?.length || 0} Responses</span>
                    </button>
                    <button className="ml-auto p-3 bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {posts.length === 0 && (
                <div className="py-40 text-center card-gradient rounded-[4rem] border border-white/5 bg-white/[0.01]">
                  <MessageSquare size={48} className="mx-auto text-white/5 mb-8" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white/20">Awaiting Primary Transmission</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold mt-4">Be the first to stimulate this dialogue stream.</p>
                </div>
              )}
            </div>
          </div>

          {/* Hub Sidebar */}
          <div className="space-y-12">
            <div className="card-gradient p-10 border border-white/5 rounded-[3rem] space-y-10 shadow-xl">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <ShieldCheck size={22} className="text-brand-teal" /> Node Intel
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black mb-3 block">Category Designation</label>
                  <p className="text-sm font-black uppercase tracking-widest text-brand-teal">Ecosystem Hub</p>
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black mb-3 block">Access Protocol</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {community.access_type === 'public' ? <Unlock size={14} className="text-emerald-500" /> : <ShieldCheck size={14} className="text-amber-500" />}
                      <p className="text-xs font-black uppercase tracking-widest text-white/60">{community.access_type} Transmission</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap size={14} className="text-brand-teal" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal">{community.required_package} Package Required</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black mb-3 block">Primary Protocol</label>
                  <p className="text-[11px] text-white/40 leading-relaxed font-light italic italic-glow-white/10 shadow-white/10 italic italic-glow-white/10">"Maintain discipline, support the collective, and respect the iron hierarchy."</p>
                </div>
              </div>
            </div>

            <div className="card-gradient p-10 border border-white/5 rounded-[3rem] space-y-8 shadow-xl">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <Trophy size={22} className="text-brand-coral" /> Top Contributors
              </h2>
              <div className="space-y-6">
                {community.members?.slice(0, 5).map((m, idx) => (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black group-hover:text-brand-teal transition-all text-xs">
                      {m[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors">Candidate {idx + 1}</p>
                      <p className="text-[8px] text-white/20 uppercase tracking-widest font-black">Elite Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-xl w-full card-gradient p-12 space-y-10 border border-brand-teal/20 rounded-[3rem] shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Entry <span className="text-brand-teal">Protocol</span></h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-white/20 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black ml-4">Dialogue Narrative</label>
                  <textarea 
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-[10px] text-white/80 outline-none focus:border-brand-teal transition-all min-h-[200px] resize-none uppercase tracking-[0.2em] italic font-black"
                    placeholder="Provide your synchronization rationale for the collective..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={submitRequest}
                  disabled={!requestMessage.trim()}
                  className="w-full py-6 bg-brand-teal text-black rounded-3xl text-[10px] uppercase tracking-[0.4em] font-black hover:shadow-glow-teal transition-all disabled:opacity-20 shadow-2xl"
                >
                  Authorize Entry Signal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posting Modal Portal */}
      <AnimatePresence>
        {isPosting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-2xl w-full card-gradient p-12 space-y-10 border border-brand-teal/20 rounded-[4rem] shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Transmit <span className="text-brand-teal">Data</span></h3>
                <button onClick={() => setIsPosting(false)} className="text-white/20 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black ml-4">Dialogue Content</label>
                  <textarea 
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 text-sm text-white/80 outline-none focus:border-brand-teal transition-all min-h-[250px] resize-none uppercase tracking-[0.2em] italic font-black"
                    placeholder="Enter your transmission protocol..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-8">
                  <div className="flex gap-4">
                    <button type="button" className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-brand-teal hover:border-brand-teal/30 transition-all shadow-xl"><ImageIcon size={20} /></button>
                    <button type="button" className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-brand-teal hover:border-brand-teal/30 transition-all shadow-xl"><Plus size={20} /></button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="flex-grow py-6 bg-brand-teal text-black rounded-3xl text-[10px] uppercase tracking-[0.4em] font-black hover:shadow-glow-teal transition-all disabled:opacity-20 shadow-2xl"
                  >
                    Authorize Transmission
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
