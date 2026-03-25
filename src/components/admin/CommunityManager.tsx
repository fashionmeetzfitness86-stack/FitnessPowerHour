import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Plus, Trash2, Edit2, 
  Users, MessageCircle, Heart, Share2,
  TrendingUp, Activity, ShieldAlert,
  FolderOpen, Check, X, ShieldCheck,
  Lock, Unlock, Zap, MapPin, Trophy
} from 'lucide-react';
import { Community, CommunityPost, UserProfile, CommunityCategory, CommunityRequest } from '../../types';

interface CommunityManagerProps {
  communities: Community[];
  posts: CommunityPost[];
  categories: CommunityCategory[];
  joiningRequests: CommunityRequest[];
  users: UserProfile[];
  onAdd: () => void;
  onSaveCommunity: (data: Partial<Community>) => Promise<void>;
  onDeleteCommunity: (id: string) => void;
  onDeletePost: (id: string) => void;
  onManageCategories: () => void;
  onHandleRequest: (id: string, status: 'approved' | 'rejected') => void;
}

export const CommunityManager = ({ 
  communities, posts, categories, joiningRequests, users, 
  onAdd, onSaveCommunity, onDeleteCommunity, onDeletePost, onManageCategories, onHandleRequest 
}: CommunityManagerProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'hubs' | 'categories' | 'requests'>('hubs');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Community>>({
    name: '',
    description: '',
    image: '',
    category_id: categories[0]?.id || '',
    city: '',
    access_type: 'public',
    required_package: 'basic',
  });

  const handleOpenModal = (community?: Community) => {
    if (community) {
      setEditingCommunity(community);
      setFormData(community);
    } else {
      setEditingCommunity(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        category_id: categories[0]?.id || '',
        city: '',
        access_type: 'public',
        required_package: 'basic',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveCommunity(formData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving community:', error);
    }
  };

  return (
    <div className="space-y-16 fade-in">
      {/* Sub-Navigation */}
      <div className="flex gap-4 border-b border-white/5 pb-8">
        {[
          { id: 'hubs', label: 'Interaction Hubs', icon: MessageSquare },
          { id: 'categories', label: 'Ecosystem Categories', icon: FolderOpen },
          { id: 'requests', label: 'Clearance Queue', icon: ShieldCheck, count: joiningRequests.filter(r => r.status === 'pending').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${
              activeSubTab === tab.id 
                ? 'bg-brand-teal text-black shadow-glow-teal' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[8px] ${activeSubTab === tab.id ? 'bg-black text-brand-teal' : 'bg-brand-coral text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'hubs' && (
          <motion.div 
            key="hubs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Hub <span className="text-brand-teal">Management</span></h2>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold font-mono text-glow-brand-teal">Orchestrate the collective interaction spaces.</p>
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all transform hover:-translate-y-1"
              >
                <Plus size={18} /> New Hub Node
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {communities.map((community, i) => {
                const communityPosts = posts.filter(p => p.community_id === community.id);
                return (
                  <div key={community.id} className="card-gradient group relative overflow-hidden flex flex-col h-full border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2rem]">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={community.image || `https://picsum.photos/seed/${community.id}/800/600`} 
                        alt={community.name} 
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/0" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 ${community.access_type === 'public' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {community.access_type === 'public' ? <Unlock size={8} className="inline mr-1" /> : <Lock size={8} className="inline mr-1" />}
                          {community.access_type}
                        </span>
                        {community.city && (
                          <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 text-brand-teal">
                            <MapPin size={8} className="inline mr-1" /> {community.city}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(community)} className="p-3 bg-brand-black/60 backdrop-blur-md rounded-xl text-white/40 hover:text-brand-teal transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => onDeleteCommunity(community.id)} className="p-3 bg-brand-black/60 backdrop-blur-md rounded-xl text-white/40 hover:text-brand-coral transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{community.name}</h3>
                        <span className="text-[10px] text-white/20 font-bold uppercase">{categories.find(c => c.id === community.category_id)?.name || 'Nexus'}</span>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light italic">{community.description}</p>
                      
                      <div className="pt-4 flex flex-wrap gap-2 items-center">
                        <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal text-[7px] font-black uppercase tracking-widest rounded border border-brand-teal/20">
                          {community.required_package} Access
                        </span>
                      </div>

                      <div className="pt-4 mt-auto grid grid-cols-3 gap-4 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-[7px] uppercase tracking-widest text-white/20 font-black mb-1">Members</p>
                          <p className="text-xs font-mono font-black text-brand-teal">{community.members?.length || 0}</p>
                        </div>
                        <div className="text-center border-x border-white/5">
                          <p className="text-[7px] uppercase tracking-widest text-white/20 font-black mb-1">Posts</p>
                          <p className="text-xs font-mono font-black text-white/60">{communityPosts.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[7px] uppercase tracking-widest text-white/20 font-black mb-1">Activity</p>
                          <p className="text-xs font-mono font-black text-emerald-500">Peak</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeSubTab === 'categories' && (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-white/80">Ecosystem <span className="text-brand-coral">Taxonomy</span></h2>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Define the classification nodes for the community matrix.</p>
              </div>
              <button 
                onClick={onManageCategories}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-3"
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="card-gradient p-8 border border-white/5 hover:border-brand-coral/30 transition-all rounded-3xl group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral shadow-glow-coral">
                      <FolderOpen size={20} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-white/20 hover:text-white transition-colors"><Edit2 size={14} /></button>
                      <button className="text-white/20 hover:text-brand-coral transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tighter mb-2 group-hover:text-brand-coral transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono mb-4">/{cat.slug}</p>
                  <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light italic">{cat.description}</p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-widest font-black">
                    <span className="text-white/20">Channels Linked</span>
                    <span className="text-white/80 font-mono">{communities.filter(c => c.category_id === cat.id).length}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeSubTab === 'requests' && (
          <motion.div 
            key="requests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white/80">Clearance <span className="text-amber-500">Queue</span></h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Review and authorize member access to restricted interaction nodes.</p>
            </div>

            <div className="card-gradient rounded-[2.5rem] overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-white/40 font-black">Candidate Profile</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-white/40 font-black">Target Nexus</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-white/40 font-black">Decision Tracking</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-white/40 font-black text-right">Decision Port</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {joiningRequests.filter(r => r.status === 'pending').map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/40 group-hover:text-brand-teal transition-all">
                            {req.user_name_snapshot?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">{req.user_name_snapshot}</p>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1 font-mono">{req.user_email_snapshot}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal group-hover:underline">
                          {communities.find(c => c.id === req.community_id)?.name || 'Nexus Node'}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black italic">Awaiting Authorization</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          <button 
                            onClick={() => onHandleRequest(req.id, 'approved')}
                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl transition-all shadow-xl"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => onHandleRequest(req.id, 'rejected')}
                            className="p-3 bg-brand-coral/10 hover:bg-brand-coral text-brand-coral hover:text-black rounded-xl transition-all shadow-xl"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {joiningRequests.filter(r => r.status === 'pending').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-white/10">
                          <ShieldCheck size={48} className="animate-pulse" />
                          <p className="text-[10px] uppercase tracking-[0.4em] font-black">All Clearance Signals Processed</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hub Configuration Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="max-w-4xl w-full card-gradient p-12 space-y-10 border border-brand-teal/20 rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black uppercase tracking-tighter">{editingCommunity ? 'Configure' : 'Initialize'} <span className="text-brand-teal">Hub Node</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Hub Designation</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-teal transition-all"
                      placeholder="e.g. Miami Elite Squad"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Visual Matrix (Image URL)</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-brand-teal transition-all"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Protocol Rationale (Description)</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs h-32 resize-none outline-none focus:border-brand-teal transition-all italic font-light"
                      placeholder="Define the mission of this node..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Ecosystem Category</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[10px] uppercase font-black tracking-widest outline-none focus:border-brand-teal"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">City Alignment</label>
                      <input 
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-teal transition-all"
                        placeholder="e.g. Los Angeles"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Access Protocol</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[10px] uppercase font-black tracking-widest outline-none focus:border-brand-teal"
                        value={formData.access_type}
                        onChange={(e) => setFormData({...formData, access_type: e.target.value as any})}
                      >
                        <option value="public">Public Node</option>
                        <option value="private">Private Nexus</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/20 font-black ml-4">Required Package</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[10px] uppercase font-black tracking-widest outline-none focus:border-brand-teal"
                        value={formData.required_package}
                        onChange={(e) => setFormData({...formData, required_package: e.target.value as any})}
                      >
                        <option value="basic">Basic Tier</option>
                        <option value="premium">Premium Tier</option>
                        <option value="elite">Elite Tier</option>
                        <option value="custom">Custom Protocol</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 mt-4 bg-brand-teal text-black rounded-3xl text-[10px] uppercase tracking-[0.4em] font-black hover:shadow-glow-teal transition-all shadow-2xl"
                  >
                    Authorize Node Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16 border-t border-white/5">
        <div className="card-gradient p-10 space-y-8 rounded-[2rem] border border-white/5">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
            <TrendingUp size={22} className="text-brand-teal" /> Network Sync
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Active Hubs', value: communities.length, icon: Zap, color: 'text-brand-teal' },
              { label: 'Collective Members', value: users.length, icon: Users, color: 'text-brand-coral' },
              { label: 'Dialogue Streams', value: posts.length, icon: MessageCircle, color: 'text-indigo-400' }
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</span>
                </div>
                <span className="text-xl font-bold font-mono text-white/80">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Activity size={22} className="text-brand-teal" /> Transmission Feed
            </h3>
            <div className="flex gap-4">
              <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[8px] uppercase tracking-widest font-black outline-none focus:border-brand-teal">
                <option>Global Stream</option>
                <option>Moderator Focus</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.slice(0, 4).map((post) => (
              <div key={post.id} className="card-gradient p-6 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col justify-between group transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:text-brand-teal transition-all text-sm">
                    {post.user_name_snapshot?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors">{post.user_name_snapshot}</p>
                    <p className="text-[7px] text-white/20 uppercase tracking-widest mt-0.5">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 line-clamp-2 italic font-light font-mono mb-4 leading-relaxed group-hover:text-white/60 transition-colors">"{post.content}"</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex gap-4 text-white/20">
                    <div className="flex items-center gap-1.5"><Heart size={10} /><span className="text-[8px] font-mono">{post.likes.length}</span></div>
                    <div className="flex items-center gap-1.5"><MessageCircle size={10} /><span className="text-[8px] font-mono">{post.comments.length}</span></div>
                  </div>
                  <button onClick={() => onDeletePost(post.id)} className="p-2 rounded-lg bg-white/5 hover:bg-brand-coral hover:text-black transition-all text-white/20 shadow-lg"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
