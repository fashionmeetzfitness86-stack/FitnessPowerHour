import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlaySquare, Play, Plus, BookmarkX, BookmarkPlus, 
  Video as VideoIcon, Loader2, ChevronRight, Clock, Search, Shuffle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';

export const MyPrograms = ({ user, showToast }: { user: UserProfile; showToast?: any }) => {
  const { updateProfile } = useAuth();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.from('videos').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setAllVideos(data || []);
      setLoading(false);
    });
  }, []);

  const toggleLike = async (videoId: string) => {
    const current = user.favorites || [];
    const isLiked = current.includes(videoId);
    const updated = isLiked ? current.filter(id => id !== videoId) : [...current, videoId];
    try {
      await updateProfile({ favorites: updated });
      if (showToast) showToast(isLiked ? 'Removed from program.' : 'Added to your program! ✅', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to update program.', 'error');
    }
  };

  const likedVideos = allVideos.filter(v => user.favorites?.includes(v.id));
  const availableVideos = allVideos.filter(v => !user.favorites?.includes(v.id));

  const filteredLiked = likedVideos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableVideos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6); // Show 6 suggestions max

  const shuffleAndStart = () => {
    if (likedVideos.length === 0) return;
    const random = likedVideos[Math.floor(Math.random() * likedVideos.length)];
    if (random?.video_url) {
      window.open(random.video_url, '_blank');
    } else if (showToast) {
      showToast(`Starting: ${random.title}`, 'success');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Loading Videos...</span>
    </div>
  );

  return (
    <div className="space-y-10 fade-in">

      {/* Header */}
      <header className="border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
          My <span className="text-brand-teal">Program</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">
          Like a video to add it to your program. Start anytime.
        </p>
      </header>

      {/* QUICK START CARD — only shows if user has liked videos */}
      {likedVideos.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-px rounded-[2.5rem] bg-brand-teal opacity-10 blur" />
          <div className="relative card-gradient rounded-[2.5rem] border border-brand-teal/20 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-teal">Quick Start</span>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {likedVideos.length} Workout{likedVideos.length !== 1 ? 's' : ''} Ready
              </h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Your saved video protocols are ready to execute.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={shuffleAndStart}
                className="flex-1 sm:flex-none px-8 py-5 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
              >
                <Play size={14} fill="black" /> Start Workout
              </button>
              <button
                onClick={shuffleAndStart}
                className="px-6 py-5 bg-white/5 border border-white/10 text-white/50 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                title="Shuffle"
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:border-brand-teal outline-none transition-all placeholder-white/20"
        />
      </div>

      {/* MY PROGRAM (LIKED VIDEOS) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-6 h-6 bg-brand-teal/20 rounded-lg flex items-center justify-center">
              <VideoIcon size={12} className="text-brand-teal" />
            </div>
            My Workouts
            <span className="text-[10px] font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-lg">
              {likedVideos.length}
            </span>
          </h3>
        </div>

        {filteredLiked.length === 0 ? (
          <div className="py-20 text-center card-gradient border border-white/5 rounded-[2.5rem] space-y-6">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-[1.5rem] flex items-center justify-center mx-auto border border-brand-teal/20">
              <PlaySquare size={36} className="text-brand-teal" />
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-black uppercase tracking-tighter">
                Start your <span className="text-brand-teal">program</span>
              </h4>
              <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-white/30 max-w-xs mx-auto leading-relaxed">
                Browse the video library and tap the bookmark icon to add workouts to your program.
              </p>
            </div>
            <div className="flex gap-4 justify-center px-8 flex-wrap">
              <button
                onClick={() => { window.location.hash = '#/videos'; }}
                className="px-8 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center gap-2"
              >
                <VideoIcon size={14} /> Browse Videos
              </button>
              {allVideos.length > 0 && (
                <button
                  onClick={() => toggleLike(allVideos[0].id)}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add First Workout
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredLiked.map(video => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-gradient group border border-white/5 hover:border-brand-teal/30 transition-all rounded-[2rem] overflow-hidden shadow-xl"
                >
                  <div className="aspect-video relative overflow-hidden bg-white/5">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all z-10" />
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon size={40} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                        className="p-4 bg-brand-teal text-black rounded-full shadow-glow-teal hover:scale-110 transition-transform"
                      >
                        <Play size={20} fill="black" className="translate-x-0.5" />
                      </button>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleLike(video.id); }}
                      className="absolute top-3 right-3 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-xl text-brand-coral hover:bg-brand-coral/20 transition-all"
                      title="Remove from program"
                    >
                      <BookmarkX size={15} />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-brand-teal font-black">{video.category || 'Workout'}</span>
                      <h4 className="text-sm font-black uppercase tracking-tight mt-0.5 line-clamp-1">{video.title}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-white/30 text-[9px] font-bold uppercase tracking-widest">
                        <Clock size={10} /> {video.duration || '—'}
                      </div>
                      <button
                        onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                        className="text-[9px] uppercase tracking-widest text-white/30 hover:text-brand-teal transition-all flex items-center gap-1.5 font-black"
                      >
                        Start <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SUGGESTED VIDEOS (to add) */}
      {filteredAvailable.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black uppercase tracking-tight text-white/40">Suggested for You</h3>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAvailable.map(video => (
              <div
                key={video.id}
                className="card-gradient p-4 flex gap-4 items-center group hover:border-brand-teal/30 border border-white/5 transition-all rounded-2xl"
              >
                <div className="w-20 aspect-video bg-white/5 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={video.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon size={18} className="text-white/10" />
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-[10px] font-black uppercase tracking-tight text-white/70 line-clamp-1">{video.title}</h4>
                  <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold mt-0.5">{video.category || 'Workout'}</p>
                </div>
                <button
                  onClick={() => toggleLike(video.id)}
                  className="flex-shrink-0 p-2.5 border border-white/10 text-white/20 hover:border-brand-teal hover:text-brand-teal rounded-xl transition-all"
                  title="Add to My Program"
                >
                  <BookmarkPlus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
