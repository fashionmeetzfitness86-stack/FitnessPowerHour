import React from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import { CommunityPost } from '../../types';

interface CommunityManagerProps {
  posts: CommunityPost[];
  onDeletePost: (id: string) => void;
  // Included unused props to keep compatibility with AdminDashboard without changing it
  communities?: any;
  users?: any;
  onAdd?: any;
  onDeleteCommunity?: any;
}

export const CommunityManager = ({ posts, onDeletePost }: CommunityManagerProps) => {
  return (
    <div className="space-y-8 fade-in">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Community <span className="text-brand-teal">Moderation</span></h2>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Review and moderate all community posts.</p>
      </div>

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
