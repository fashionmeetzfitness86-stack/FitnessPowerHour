import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlaySquare, CheckCircle, ArrowRight, Play, Heart, HeartOff, 
  Video as VideoIcon, Plus, Trash2, Search, Filter, Loader2, Info, ChevronRight, Bookmark, BookmarkPlus, BookmarkX, Clock
} from 'lucide-react';
import { UserProfile, Video } from '../../types';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';

export const MyPrograms = ({ user }: { user: UserProfile }) => {
  const { updateProfile } = useAuth();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('videos').select('*');
      if (error) throw error;
      setAllVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const toggleLike = async (videoId: string) => {
    try {
      const currentFavorites = user.favorites || [];
      const isLiked = currentFavorites.includes(videoId);
      let newFavorites;
      
      if (isLiked) {
        newFavorites = currentFavorites.filter(id => id !== videoId);
      } else {
        newFavorites = [...currentFavorites, videoId];
      }

      await updateProfile({ favorites: newFavorites });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const likedVideos = allVideos.filter(v => user.favorites?.includes(v.id));
  const availableVideos = allVideos.filter(v => !user.favorites?.includes(v.id));

  const filteredLiked = likedVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
         <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Syncing Program Matrix...</div>
       </div>
    );
  }

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
            My <span className="text-brand-teal">Program</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">
            Curated protocols authorized for your kinetic target.
          </p>
        </div>
        <div className="relative w-full md:w-80 group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-teal transition-colors" />
            <input 
                type="text" 
                placeholder="Search matrix..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[10px] uppercase tracking-widest text-white focus:border-brand-teal outline-none transition-all"
            />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Main Program Section (Liked Videos) */}
        <div className="xl:col-span-3 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <Bookmark size={20} className="text-brand-teal" />
                <h3 className="text-xl font-bold uppercase tracking-tight">Active Deployment</h3>
                <span className="ml-auto text-[10px] uppercase tracking-widest font-black text-brand-teal">{likedVideos.length} Modules</span>
            </div>

            {likedVideos.length === 0 ? (
                <div className="py-32 text-center card-gradient border-2 border-dashed border-white/5 rounded-[3rem] space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                        <PlaySquare size={32} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tighter text-white/40">No Protocols Anchored</h4>
                        <p className="text-[10px] tracking-widest uppercase font-bold text-white/20 max-w-xs mx-auto leading-relaxed">
                            Your personal program is empty. Initialize modules from the directory below.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredLiked.map((video) => (
                            <motion.div 
                                key={video.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="card-gradient group border border-white/5 hover:border-brand-teal/30 transition-all rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
                            >
                                <div className="aspect-video relative overflow-hidden bg-white/5">
                                    <div className="absolute inset-0 bg-brand-black opacity-0 group-hover:opacity-40 transition-opacity z-10" />
                                    <img src={video.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={video.title} />
                                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="p-4 bg-brand-teal text-black rounded-full shadow-glow-teal transform scale-90 group-hover:scale-100 transition-all">
                                            <Play size={24} fill="black" className="translate-x-1" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleLike(video.id); }}
                                        className="absolute top-4 right-4 z-30 p-2 bg-black/60 backdrop-blur-md rounded-xl text-brand-coral hover:bg-brand-coral/10 transition-all"
                                    >
                                        <BookmarkX size={16} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <span className="text-[8px] uppercase tracking-widest text-brand-teal font-black">{video.category || 'Focus'}</span>
                                        <h4 className="text-sm font-black uppercase tracking-tight mt-1 group-hover:text-brand-teal transition-colors line-clamp-1">{video.title}</h4>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-white/30 text-[9px] font-bold uppercase tracking-widest">
                                            <Clock size={10} /> {video.duration || '15:00'}
                                        </div>
                                        <button className="text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-teal transition-all flex items-center gap-2">
                                            Execute <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* Sidebar: Available Modules (NOT liked yet) */}
        <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <Plus size={20} className="text-white/20" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Available</h3>
            </div>

            <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 no-scrollbar">
                {filteredAvailable.length === 0 ? (
                    <div className="p-8 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5 opacity-40">
                        <p className="text-[10px] uppercase font-bold tracking-widest">Matrix Unified</p>
                    </div>
                ) : (
                    filteredAvailable.map(video => (
                        <div key={video.id} className="card-gradient p-4 flex gap-4 items-center group hover:border-brand-teal/30 transition-all rounded-2xl">
                            <div className="w-20 aspect-video bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={video.title} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <BookmarkPlus size={16} className="text-brand-teal" />
                                </div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <h4 className="text-[10px] font-black uppercase tracking-tight text-white/80 line-clamp-1">{video.title}</h4>
                                <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold mt-1">{video.category || 'Protocol'}</p>
                            </div>
                            <button 
                                onClick={() => toggleLike(video.id)}
                                className="p-2 border border-white/10 text-white/20 hover:border-brand-teal hover:text-brand-teal rounded-lg transition-all"
                                title="Add to Program"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-brand-teal/5 border border-brand-teal/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-brand-teal">
                    <Info size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Logic</h4>
                </div>
                <p className="text-[9px] text-white/60 leading-relaxed italic uppercase tracking-wider font-bold">
                    Adding modules to "My Program" anchors them to your active deployment dashboard for direct access.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
