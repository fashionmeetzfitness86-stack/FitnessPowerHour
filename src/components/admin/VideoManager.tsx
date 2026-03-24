import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  PlayCircle, Upload, Search, Filter, 
  Trash2, Edit2, Clock, Eye, 
  CheckCircle, Video as VideoIcon
} from 'lucide-react';
import { Video, VideoCategory, Athlete } from '../../types';

interface VideoManagerProps {
  videos: Video[];
  categories: VideoCategory[];
  athletes: Athlete[];
  onUpload: () => void;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
}

export const VideoManager = ({ 
  videos, categories, athletes, 
  onUpload, onEdit, onDelete 
}: VideoManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (v.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, categoryFilter]);

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Ecosystem <span className="text-brand-teal">Content</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Upload and manage training videos, check-ins, and elite content.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-brand-teal transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-grow lg:flex-none bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer appearance-none hover:bg-white/10 transition-all text-white/60"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={onUpload}
            className="flex-grow lg:flex-none px-8 py-3 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
          >
            <Upload size={18} /> Publish New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredVideos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient group relative overflow-hidden rounded-3xl border border-white/5 hover:border-brand-teal/30 transition-all flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/800/600`} 
                alt={video.title} 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent flex items-end p-6">
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-brand-teal text-black text-[8px] font-black uppercase tracking-widest rounded shadow-lg">
                    {video.category || 'General'}
                  </span>
                  {video.is_premium && (
                    <span className="px-2.5 py-1 bg-brand-black/80 backdrop-blur-md text-brand-teal text-[8px] font-black uppercase tracking-widest rounded border border-brand-teal/50 shadow-lg">
                      Elite Only
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="p-3 bg-brand-black/60 backdrop-blur-md rounded-full text-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <PlayCircle size={14} />
                </div>
              </div>
            </div>

            <div className="p-8 flex-grow space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors line-clamp-1">{video.title}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                <Clock size={12} /> {video.duration || '0:00'} MINUTES • LAST UPDATED {new Date(video.updated_at || video.created_at).toLocaleDateString()}
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 border border-white/10 group-hover:border-brand-teal/30 transition-all">
                  <VideoIcon size={14} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Presenter</p>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-brand-teal">
                    {athletes.find(a => a.id === video.athlete_id)?.name || 'FMF Collective'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8 flex gap-3 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
              <button 
                onClick={() => onEdit(video)}
                className="flex-grow py-3 bg-white/5 hover:bg-brand-teal hover:text-black rounded-xl text-[9px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={12} /> Edit Metadata
              </button>
              <button 
                onClick={() => onDelete(video.id)}
                className="p-3 bg-white/5 hover:bg-brand-coral hover:text-white rounded-xl text-white/40 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
        
        {videos.length === 0 && (
          <div className="col-span-full py-32 text-center card-gradient border-dashed border-2 border-white/5 rounded-[3rem]">
            <PlayCircle size={64} className="mx-auto text-white/5 mb-6 opacity-20" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">Vault Empty</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2">No videos matching your filters were found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
