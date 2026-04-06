import React, { useState } from 'react';
import { Trash2, MessageSquare, Plus, Users } from 'lucide-react';
import { CommunityPost, Community } from '../../types';

interface CommunityManagerProps {
  posts: CommunityPost[];
  onDeletePost: (id: string) => void;
  communities?: Community[];
  users?: any;
  onAdd?: (data: Partial<Community>) => Promise<void>;
  onDeleteCommunity?: (id: string) => Promise<void>;
}

export const CommunityManager = ({ posts, onDeletePost, communities, onAdd, onDeleteCommunity }: CommunityManagerProps) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !onAdd) return;
    onAdd({
      name: newGroupName,
      description: newGroupDesc || 'A space for connected athletes.',
      access_type: 'public'
    });
    setNewGroupName('');
    setNewGroupDesc('');
  };
  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Community <span className="text-brand-teal">Moderation</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Review and moderate user generated content.</p>
        </div>
        <div className="flex-1 bg-brand-teal/5 border border-brand-teal/20 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Create Group</h3>
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Group Name" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-brand-teal"
            />
            <button 
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="w-full py-2 bg-brand-teal text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-teal/80 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Create Space
            </button>
          </div>
        </div>
      </div>

      {communities && communities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/5 pb-8 mb-8">
          {communities.map(c => (
             <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between group">
                 <div>
                   <h4 className="font-bold text-sm uppercase">{c.name}</h4>
                   <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{c.access_type}</p>
                </div>
                <button 
                   onClick={() => onDeleteCommunity && onDeleteCommunity(c.id)}
                   className="mt-4 self-end p-2 bg-brand-coral/10 text-brand-coral rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                   <Trash2 size={12} />
                </button>
             </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/40">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-teal mb-1.5">{post.user_name_snapshot || 'Unknown User'}</p>
                <p className="text-sm text-white/80">{post.content}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-3">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onDeletePost(post.id)}
              className="p-4 bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="py-20 text-center rounded-3xl border border-white/5 border-dashed">
             <MessageSquare size={48} className="mx-auto text-white/10 mb-4" />
             <p className="text-sm text-white/40">No posts in the community yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
