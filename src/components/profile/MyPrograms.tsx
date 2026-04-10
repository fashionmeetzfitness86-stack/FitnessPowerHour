import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlaySquare, Play, Plus, BookmarkX, BookmarkPlus, 
  Video as VideoIcon, Loader2, ChevronRight, Clock, Search, Shuffle,
  CheckCircle, Star, X, Camera, MessageSquare, AlertTriangle, Bookmark, Heart
} from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';

// ── Workout Confirmation Dialog ──────────────────────────────────────────────
const WorkoutConfirmDialog = ({
  video,
  onConfirm,
  onCancel
}: {
  video: any;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-[#0a0a0a] border border-brand-teal/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center border border-brand-teal/20">
          <Play size={20} className="text-brand-teal translate-x-0.5" fill="currentColor" />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black">Start Workout</p>
          <h3 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">Ready to go?</h3>
        </div>
      </div>

      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-6">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Session</p>
        <p className="text-sm font-black text-white">{video?.title || 'Workout'}</p>
        {video?.duration && (
          <div className="flex items-center gap-1.5 mt-2 text-white/30">
            <Clock size={11} />
            <span className="text-[9px] uppercase tracking-widest font-bold">{video.duration}</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-6 leading-relaxed">
        This will count toward your daily streak. You can start multiple workouts, but only <span className="text-brand-teal">1 counts per day</span>.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
        >
          <Play size={14} fill="black" /> Confirm Start
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Post-Workout Check-in Dialog ─────────────────────────────────────────────
const CheckInDialog = ({
  onSubmit,
  onSkip
}: {
  onSubmit: (data: { rating: number; comment: string; imageFile?: File }) => void;
  onSkip: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#0a0a0a] border border-brand-teal/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-coral/10 rounded-2xl flex items-center justify-center border border-brand-coral/20">
              <CheckCircle size={20} className="text-brand-coral" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-brand-coral font-black">Post-Workout</p>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">How was it?</h3>
            </div>
          </div>
          <button onClick={onSkip} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-3">Rate your session</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="flex-1 py-2 transition-all"
              >
                <Star
                  size={24}
                  className={`mx-auto transition-colors ${n <= rating ? 'text-amber-400' : 'text-white/10'}`}
                  fill={n <= rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-2">Leave a comment (optional)</p>
          <textarea
            rows={2}
            placeholder="How did you feel? Any notes..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-brand-teal transition-colors placeholder-white/20"
          />
        </div>

        {/* Photo */}
        <div className="mb-6">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-2">Upload a photo (optional)</p>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full h-24 object-cover rounded-xl" />
              <button onClick={() => { setImageFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => imageRef.current?.click()}
              className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[9px] uppercase tracking-widest text-white/30 font-black hover:border-brand-teal/40 hover:text-brand-teal transition-all flex items-center justify-center gap-2"
            >
              <Camera size={14} /> Add Photo
            </button>
          )}
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
          >
            Skip
          </button>
          <button
            onClick={() => onSubmit({ rating, comment, imageFile: imageFile || undefined })}
            disabled={rating === 0}
            className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <CheckCircle size={14} /> Save Check-in
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export const MyPrograms = ({ user, showToast }: { user: UserProfile; showToast?: any }) => {
  const { updateProfile, toggleBookmark, toggleFavorite } = useAuth();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Workout flow state
  const [confirmVideo, setConfirmVideo] = useState<any | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [savingCheckIn, setSavingCheckIn] = useState(false);

  useEffect(() => {
    supabase.from('videos').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setAllVideos(data || []);
      setLoading(false);
    });
  }, []);

  // After 1 hour from workout start, prompt check-in
  useEffect(() => {
    if (!workoutStartTime) return;
    const delay = 60 * 60 * 1000; // 1 hour in ms — change to 5000 ms for testing
    const timer = setTimeout(() => {
      setShowCheckIn(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [workoutStartTime]);

  const handleToggleBookmark = async (videoId: string) => {
    const { success, message } = await toggleBookmark(videoId);
    if (showToast) showToast(message, success ? 'success' : 'error');
  };

  const handleToggleLike = async (videoId: string) => {
    const { success, message } = await toggleFavorite(videoId);
    if (showToast) showToast(message, success ? 'success' : 'error');
  };

  const handleStartWorkout = (video: any) => {
    setConfirmVideo(video);
  };

  const handleConfirmWorkout = () => {
    const now = Date.now();
    setWorkoutStartTime(now);
    setConfirmVideo(null);

    // Record check-in for streak (only counts once per day)
    const todayKey = new Date().toISOString().split('T')[0];
    const lastCheckin = user.last_checkin?.split('T')[0];
    if (lastCheckin !== todayKey) {
      supabase
        .from('profiles')
        .update({
          last_checkin: new Date().toISOString(),
          streak_count: (user.streak_count || 0) + 1
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (!error && showToast) {
            showToast(`🔥 Streak: ${(user.streak_count || 0) + 1} days! Workout started.`, 'success');
          }
        });
    } else {
      if (showToast) showToast('Workout started! Good luck 💪', 'success');
    }

    // Open video
    if (confirmVideo?.video_url) window.open(confirmVideo.video_url, '_blank');
  };

  const handleCheckInSubmit = async ({ rating, comment, imageFile }: { rating: number; comment: string; imageFile?: File }) => {
    setSavingCheckIn(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `checkins/${user.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('fmf-media').upload(path, imageFile);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('fmf-media').getPublicUrl(path);
          imageUrl = publicUrl;
        }
      }

      await supabase.from('workout_logs').insert({
        user_id: user.id,
        logged_at: new Date().toISOString(),
        rating,
        notes: comment || null,
        media_url: imageUrl,
        source: 'my_program'
      });

      setShowCheckIn(false);
      setWorkoutStartTime(null);
      if (showToast) showToast('Check-in saved! Great work 🏆', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to save check-in.', 'error');
    } finally {
      setSavingCheckIn(false);
    }
  };

  const bookmarkedVideos = allVideos.filter(v => user.bookmarks?.includes(v.id));
  const likedVideos = allVideos.filter(v => user.favorites?.includes(v.id));
  const availableVideos = allVideos.filter(v => !user.bookmarks?.includes(v.id));

  const filteredBookmarked = bookmarkedVideos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLiked = likedVideos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableVideos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const shuffleAndStart = () => {
    const pool = bookmarkedVideos.length > 0 ? bookmarkedVideos : likedVideos;
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    handleStartWorkout(random);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Loading Videos...</span>
    </div>
  );

  return (
    <div className="space-y-10 fade-in">

      {/* Workout Confirm Dialog */}
      <AnimatePresence>
        {confirmVideo && (
          <WorkoutConfirmDialog
            video={confirmVideo}
            onConfirm={handleConfirmWorkout}
            onCancel={() => setConfirmVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* Check-in Dialog */}
      <AnimatePresence>
        {showCheckIn && (
          <CheckInDialog
            onSubmit={handleCheckInSubmit}
            onSkip={() => { setShowCheckIn(false); setWorkoutStartTime(null); }}
          />
        )}
      </AnimatePresence>

      {/* Active workout banner */}
      <AnimatePresence>
        {workoutStartTime && !showCheckIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-brand-teal/10 border border-brand-teal/30 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-black text-brand-teal">Workout In Progress</span>
            </div>
            <button
              onClick={() => setShowCheckIn(true)}
              className="text-[9px] uppercase tracking-widest font-black text-white/40 hover:text-brand-teal transition-colors flex items-center gap-1.5"
            >
              <MessageSquare size={11} /> Log Check-in
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/5 pb-8">
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
          My <span className="text-brand-teal">Program</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">
          Your active protocol. Build your routine from your bookmarked workouts.
        </p>
      </header>

      {/* QUICK START CARD */}
      {(bookmarkedVideos.length > 0 || likedVideos.length > 0) && (
        <div className="relative">
          <div className="absolute -inset-px rounded-[2.5rem] bg-brand-teal opacity-10 blur" />
          <div className="relative card-gradient rounded-[2.5rem] border border-brand-teal/20 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-teal">Quick Start</span>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {bookmarkedVideos.length > 0 ? bookmarkedVideos.length : likedVideos.length} Workout{((bookmarkedVideos.length > 0 ? bookmarkedVideos.length : likedVideos.length) !== 1) ? 's' : ''} Ready
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

      {/* MY PROGRAM (BOOKMARKED & LIKED VIDEOS) */}
      <div className="space-y-8">
        {(bookmarkedVideos.length === 0 && likedVideos.length === 0) && (
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 card-gradient border border-white/5 rounded-[2.5rem] shadow-xl">
            <div className="w-16 h-16 bg-brand-teal/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border border-brand-teal/20">
              <PlaySquare size={24} className="text-brand-teal" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h4 className="text-lg font-black uppercase tracking-tight text-white">Start your program</h4>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest leading-relaxed">
                Browse the library and tap the bookmark icon to prioritize up to 5 workouts for your daily routine.
              </p>
            </div>
            <button
              onClick={() => { window.location.hash = '#/videos'; }}
              className="px-8 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <VideoIcon size={14} /> Browse Videos
            </button>
          </div>
        )}

        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-teal/20 rounded-xl flex items-center justify-center">
                <Bookmark size={14} className="text-brand-teal" />
              </div>
              Bookmarked Priority
              <span className="text-[10px] font-black text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-lg border border-brand-teal/20">
                {bookmarkedVideos.length} / 5
              </span>
            </h3>
          </div>

          {filteredBookmarked.length === 0 ? (
            <div className="py-16 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center">
              <Bookmark size={32} className="text-white/10 mb-4" />
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">No bookmarked workouts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filteredBookmarked.map(video => (
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
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleStartWorkout(video)}
                        className="p-4 bg-brand-teal text-black rounded-full shadow-glow-teal hover:scale-110 transition-transform"
                      >
                        <Play size={20} fill="black" className="translate-x-0.5" />
                      </button>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleToggleBookmark(video.id); }}
                      className="absolute top-3 right-3 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-xl text-brand-teal hover:bg-brand-coral/20 hover:text-brand-coral transition-all"
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
                        onClick={() => handleStartWorkout(video)}
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

        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-coral/20 rounded-xl flex items-center justify-center">
                <Heart size={14} className="text-brand-coral" fill="currentColor" />
              </div>
              Liked Videos
              <span className="text-[10px] font-black text-brand-coral bg-brand-coral/10 px-3 py-1 rounded-lg border border-brand-coral/20">
                {likedVideos.length}
              </span>
            </h3>
          </div>

          {filteredLiked.length === 0 ? (
            <div className="py-16 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center">
              <Heart size={32} className="text-white/10 mb-4" />
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">No liked videos yet</p>
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
                        className="card-gradient group border border-white/5 hover:border-brand-coral/30 transition-all rounded-[2rem] overflow-hidden shadow-xl"
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
                              onClick={() => handleStartWorkout(video)}
                              className="p-4 bg-brand-teal text-black rounded-full shadow-glow-teal hover:scale-110 transition-transform"
                            >
                              <Play size={20} fill="black" className="translate-x-0.5" />
                            </button>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleLike(video.id); }}
                            className="absolute top-3 right-3 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-xl text-brand-coral hover:bg-white/10 transition-all"
                            title="Unlike video"
                          >
                            <Heart size={15} fill="currentColor" />
                          </button>
                        </div>
                        <div className="p-5 space-y-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-brand-coral font-black">{video.category || 'Workout'}</span>
                            <h4 className="text-sm font-black uppercase tracking-tight mt-0.5 line-clamp-1">{video.title}</h4>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-white/30 text-[9px] font-bold uppercase tracking-widest">
                              <Clock size={10} /> {video.duration || '—'}
                            </div>
                            <button
                              onClick={() => handleStartWorkout(video)}
                              className="text-[9px] uppercase tracking-widest text-white/30 hover:text-brand-coral transition-all flex items-center gap-1.5 font-black"
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
      </div>      {/* SUGGESTED VIDEOS */}
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
                  onClick={() => handleToggleBookmark(video.id)}
                  className="flex-shrink-0 p-2.5 border border-white/10 text-white/20 hover:border-brand-teal hover:text-brand-teal rounded-xl transition-all"
                  title="Bookmark Video"
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
