import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Users, Send, Shield, Bell, X, Camera, Upload, Image as ImageIcon, Heart, MessageCircle, Share2, MoreHorizontal, Tag } from 'lucide-react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';

export const InternalFeed = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [category, setCategory] = useState('General');
  const [isPosting, setIsPosting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const categories = ['Announcement', 'Athlete Message', 'Admin Message', 'General'];

  useEffect(() => {
    fetchPosts();
    
    // Realtime subscription
    const channel = supabase
      .channel('internal_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        fetchPosts(); // Refetch to get author profile
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(full_name, avatar_url, role)
        `)
        .eq('is_internal', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching internal feed:', err);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !file) return;

    try {
      setIsPosting(true);
      let imageUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `internal-feed/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        content: newPost,
        image_url: imageUrl,
        is_internal: true,
        category: category,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      showToast('Post synchronized with internal frequency.', 'success');
      setNewPost('');
      setCategory('General');
      setFile(null);
      setIsSharing(false);
      fetchPosts();
    } catch (err: any) {
      showToast(err.message || 'Post failed to sync.', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-teal/20 rounded-lg flex items-center justify-center text-brand-teal border border-brand-teal/20">
                <Shield size={16} />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tighter">Internal <span className="text-brand-teal">Feed</span></h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Secure Member Layer</p>
        </div>
        <button 
          onClick={() => setIsSharing(true)}
          className="px-8 py-3 bg-brand-teal text-black text-[10px] uppercase tracking-[0.4em] font-black rounded-xl hover:scale-105 transition-all shadow-glow-teal"
        >
          Dispatch Communication
        </button>
      </header>

      {/* Composer Modal */}
      <AnimatePresence>
        {isSharing && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-gradient w-full max-w-xl p-10 space-y-8 rounded-[3rem] border border-brand-teal/30 shadow-2xl relative"
            >
              <button onClick={() => setIsSharing(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
              
              <div className="space-y-2">
                 <h3 className="text-2xl font-black uppercase tracking-tight">New <span className="text-brand-teal">Communication</span></h3>
                 <p className="text-[9px] uppercase tracking-widest text-white/20 font-black">Select category for targeted audience</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                    <button 
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-4 py-2 rounded-xl text-[8px] uppercase tracking-widest font-black border transition-all ${category === c ? 'bg-brand-teal text-black border-brand-teal' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}`}
                    >
                        {c}
                    </button>
                ))}
              </div>

              <textarea 
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Broadcast your signal..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white placeholder:text-white/20 outline-none focus:border-brand-teal transition-all resize-none"
              />

              <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                    <label className="p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:border-brand-teal transition-all text-white/40 hover:text-brand-teal">
                       <ImageIcon size={20} />
                       <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                    {file && <span className="text-[10px] uppercase tracking-widest text-brand-teal font-black self-center">Attached</span>}
                 </div>
                 <button 
                   onClick={handlePost}
                   disabled={isPosting || (!newPost.trim() && !file)}
                   className="px-10 py-5 bg-brand-teal text-black text-[10px] uppercase tracking-[0.5em] font-black rounded-2xl hover:scale-105 transition-all shadow-glow-teal disabled:opacity-30"
                 >
                   {isPosting ? 'Broadcasting...' : 'Authenticate & Send'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {posts.map((post, i) => (
          <motion.article 
            key={post.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-gradient p-10 rounded-[3rem] border-white/5 hover:border-brand-teal/20 transition-all space-y-8 group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                   <img src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}&background=1a1a1a&color=2dd4a8`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black uppercase tracking-tight">{post.author?.full_name}</h4>
                    {post.author?.role === 'admin' && <Shield size={14} className="text-brand-teal" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-black">{new Date(post.created_at).toLocaleDateString()} • SIGNAL VERIFIED</p>
                    <span className="text-[8px] uppercase tracking-widest font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Tag size={8} /> {post.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-3 text-white/10 hover:text-white transition-colors">
                 <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="space-y-6">
               <p className="text-white/80 leading-relaxed font-light text-lg">
                 {post.content}
               </p>
               {post.image_url && (
                 <div className="aspect-video rounded-[2rem] overflow-hidden border border-white/5">
                    <img src={post.image_url} className="w-full h-full object-cover" />
                 </div>
               )}
            </div>

            <div className="flex items-center gap-12 pt-6 border-t border-white/5">
               <button className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-coral transition-colors font-black">
                  <Heart size={16} /> Likes
               </button>
               <button className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-teal transition-colors font-black">
                  <MessageCircle size={16} /> Responses
               </button>
               <button className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors font-black">
                  <Share2 size={16} /> Signal Boost
               </button>
            </div>
          </motion.article>
        ))}

        {posts.length === 0 && (
          <div className="py-24 text-center space-y-6 card-gradient rounded-[3rem] border-white/5">
             <Bell size={48} className="mx-auto text-white/5" />
             <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">No signals detected in the internal frequency.</p>
          </div>
        )}
      </div>
    </div>
  );
};
