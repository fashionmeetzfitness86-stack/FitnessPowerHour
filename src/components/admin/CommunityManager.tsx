import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Plus, Trash2, Edit2, 
  Users, MessageCircle, Heart, Share2,
  TrendingUp, Activity, ShieldAlert
} from 'lucide-react';
import { Community, CommunityPost, UserProfile } from '../../types';

interface CommunityManagerProps {
  communities: Community[];
  posts: CommunityPost[];
  users: UserProfile[];
  onAdd: () => void;
  onDeleteCommunity: (id: string) => void;
  onDeletePost: (id: string) => void;
}

export const CommunityManager = ({ 
  communities, posts, users, 
  onAdd, onDeleteCommunity, onDeletePost 
}: CommunityManagerProps) => {
  return (
    <div className="space-y-16 fade-in">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Hub <span className="text-brand-teal">Management</span></h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold font-mono text-glow-brand-teal">Manage interaction spaces, social circles, and athlete forums.</p>
          </div>
          <button 
            onClick={onAdd}
            className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all transform hover:-translate-y-1 shadow-2xl"
          >
            <Plus size={18} /> Deploy Space
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {communities.map((community, i) => (
            <motion.div 
              key={community.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="card-gradient group relative overflow-hidden flex flex-col h-full border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2rem]"
            >
              <div className="aspect-[16/9] relative overflow-hidden">
                <img 
                  src={community.image_url || `https://picsum.photos/seed/${community.id}/800/600`} 
                  alt={community.name} 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/0" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-brand-black/60 backdrop-blur-md rounded-xl text-white/40 hover:text-brand-teal transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteCommunity(community.id)}
                    className="p-3 bg-brand-black/60 backdrop-blur-md rounded-xl text-white/40 hover:text-brand-coral transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{community.name}</h3>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-brand-teal" />
                    <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">
                      {community.members?.length || 0}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light italic italic-glow-white/10 italic-shadow-white/10">
                  {community.description || "A premium space for collective growth, interaction, and performance excellence."}
                </p>
                <div className="pt-4 flex items-center gap-3">
                  <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-1 rounded bg-white/5 border border-white/10 ${community.status === 'active' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                    Status: {community.status || 'Active'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {communities.length === 0 && (
            <div className="col-span-full py-24 text-center card-gradient rounded-[3rem] border-dashed border-2 border-white/5">
              <MessageCircle size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-bold italic font-black uppercase italic italic-glow-brand-teal underline decoration-brand-teal/20 underline-offset-8 decoration-2 italic italic-shadow-brand-teal">Collective silence in the void...</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="card-gradient p-10 space-y-8 h-fit border border-white/5 rounded-[2rem]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp size={22} className="text-brand-teal" /> Hub Statistics
            </h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Network Population', value: users.length, icon: Users, color: 'text-brand-teal' },
              { label: 'Active Dialogue', value: posts.length, icon: MessageSquare, color: 'text-brand-coral' },
              { label: 'Daily Interactions', value: Math.floor(posts.length * 0.4), icon: Activity, color: 'text-indigo-400' },
              { label: 'Moderation Queue', value: 0, icon: ShieldAlert, color: 'text-emerald-500' }
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-black uppercase">{stat.label}</span>
                </div>
                <span className="text-xl font-bold font-mono tracking-tighter text-white/80">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Activity size={22} className="text-brand-teal" /> Social Transmission
            </h3>
            <button className="text-[10px] uppercase tracking-widest text-brand-teal hover:underline font-black">Archive Posts</button>
          </div>
          <div className="space-y-4">
            {posts.slice(0, 8).map((post) => (
              <div key={post.id} className="card-gradient p-6 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black group-hover:text-brand-teal transition-all text-sm">
                    {post.user_name_snapshot?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors">
                        {post.user_name_snapshot || 'Member'}
                      </p>
                      <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-1 italic font-light italic italic-glow-white/10 italic-shadow-white/10 italic italic-glow-white/10">
                      {post.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="flex items-center gap-2 text-white/20">
                    <Heart size={12} />
                    <span className="text-[9px] font-mono">{Math.floor(Math.random() * 20)}</span>
                  </div>
                  <button 
                    onClick={() => onDeletePost(post.id)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-coral hover:text-white transition-all text-white/20 shadow-xl"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="py-20 text-center card-gradient rounded-3xl border border-white/5 border-dashed bg-white/[0.01]">
                <Share2 size={32} className="mx-auto text-white/5 mb-4" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-bold italic font-black uppercase italic italic-glow-brand-teal underline decoration-brand-teal/20 underline-offset-8 decoration-2 italic italic-shadow-brand-teal">Broadcast signal lost...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
