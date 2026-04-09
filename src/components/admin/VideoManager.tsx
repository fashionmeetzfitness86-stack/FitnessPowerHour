import React, { useState } from 'react';
import { PlayCircle, Upload, Trash2, X, Save, CheckCircle2 } from 'lucide-react';
import { Video, VideoCategory } from '../../types';
import { MediaCapture } from '../MediaCapture';

interface VideoManagerProps {
  videos: Video[];
  categories: VideoCategory[];
  onUpload: () => void;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
}

export const VideoManager = ({ videos, categories, onEdit, onDelete }: VideoManagerProps) => {
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'link'>('upload');

  const handleSave = () => {
    if (editingVideo) {
      onEdit({
        ...editingVideo,
        visibility_status: 'published'
      } as Video);
      setEditingVideo(null);
      setShowAdvanced(false);
      setUploadMode('upload');
      // showToast ('Video published successfully') would be nice but we assume AdminDashboard triggers the toast via onEdit
    }
  };

  const simpleCategories = [
    'Phase 1', 'Phase 2', 'Phase 3', 'Recovery', 'Mobility', 'Full Body', 'Strength', 'General'
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Content <span className="text-brand-teal">Library</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage your published videos.</p>
        </div>
        <button 
          onClick={() => setEditingVideo({ title: '', category: 'General', is_premium: false, level: 'Beginner', visibility_status: 'draft' })}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
        >
          <Upload size={18} /> Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="relative overflow-hidden rounded-2xl border border-white/10 group">
            <div className="aspect-video bg-black relative">
              <video 
                src={video.video_url} 
                className="w-full h-full object-cover opacity-60" 
                poster={video.thumbnail_url} 
                preload="none"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <PlayCircle size={48} className="text-brand-teal" />
              </div>
            </div>
            <div className="p-4 bg-white/5">
              <h3 className="font-bold uppercase tracking-tight line-clamp-1">{video.title || 'Untitled'}</h3>
              <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold mt-1 shadow-sm">
                {video.category || 'Unassigned'} • {video.is_premium ? 'Members Only' : 'General Access'}
              </p>
            </div>
            
            <button 
              onClick={() => onDelete(video.id)}
              className="absolute top-2 right-2 p-2 bg-brand-coral/90 hover:bg-brand-coral rounded-lg text-black opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {editingVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-brand-black border border-white/10 p-8 rounded-[2rem] space-y-8 relative my-8">
            <button onClick={() => setEditingVideo(null)} className="absolute top-6 right-6 text-white/40 hover:text-white p-2">
              <X size={24} />
            </button>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Post Video</h3>
            
            {/* ESSENTIAL FIELDS (ALWAYS VISIBLE) */}
            <div className="space-y-6">
              
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Video Title</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Upper Body Burnout"
                  value={editingVideo.title || ''} 
                  onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white transition-all"
                />
              </div>

              {/* Grid for Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Category</label>
                  <select
                    value={editingVideo.category || 'General'}
                    onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white/80 transition-all appearance-none"
                  >
                    {simpleCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Visibility</label>
                  <select
                    value={editingVideo.is_premium ? 'members' : 'general'}
                    onChange={e => setEditingVideo({ ...editingVideo, is_premium: e.target.value === 'members' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white/80 transition-all appearance-none"
                  >
                    <option value="general">General Access</option>
                    <option value="members">Members Only</option>
                  </select>
                </div>
              </div>

              {/* Video Media Input */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <button 
                    onClick={() => setUploadMode('upload')}
                    className={`text-xs uppercase tracking-widest font-bold transition-all ${uploadMode === 'upload' ? 'text-brand-teal' : 'text-white/40 hover:text-white'}`}
                  >
                    Upload File
                  </button>
                  <button 
                    onClick={() => setUploadMode('link')}
                    className={`text-xs uppercase tracking-widest font-bold transition-all ${uploadMode === 'link' ? 'text-brand-teal' : 'text-white/40 hover:text-white'}`}
                  >
                    Paste Link
                  </button>
                </div>
                
                <div className="pt-2">
                  {uploadMode === 'upload' ? (
                    <MediaCapture 
                      bucket="fmf-media" 
                      folder="videos" 
                      accept="video/*"
                      onUploadSuccess={(url) => setEditingVideo({ ...editingVideo, video_url: url, thumbnail_url: url })}
                    />
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://vimeo.com/..."
                      value={editingVideo.video_url || ''} 
                      onChange={e => setEditingVideo({ ...editingVideo, video_url: e.target.value, thumbnail_url: editingVideo.thumbnail_url || e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white transition-all"
                    />
                  )}
                  {editingVideo.video_url && <p className="text-[10px] text-brand-teal uppercase font-bold tracking-widest mt-3 flex items-center gap-1"><CheckCircle2 size={12} /> Video Attached</p>}
                </div>
              </div>

            </div>

            {/* ADVANCED FIELDS TOGGLE */}
            <div className="pt-2 border-t border-white/10">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-all flex items-center gap-2"
              >
                {showAdvanced ? 'Hide Additional Options' : 'More Options'}
              </button>
              
              {showAdvanced && (
                <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Difficulty Level</label>
                    <div className="flex gap-3">
                      {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setEditingVideo({ ...editingVideo, level: lvl as any })}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
                            editingVideo.level === lvl 
                              ? 'bg-brand-coral/20 border-brand-coral text-brand-coral' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Duration (e.g. 45 min)</label>
                      <input 
                        type="text" 
                        value={editingVideo.duration || ''} 
                        onChange={e => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Description / Notes</label>
                    <textarea 
                      rows={3}
                      value={editingVideo.description || ''} 
                      onChange={e => setEditingVideo({ ...editingVideo, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PUBLISH ACTION */}
            <div className="pt-4">
              <button 
                onClick={handleSave}
                disabled={!editingVideo.title || !editingVideo.video_url}
                className="w-full py-5 bg-brand-teal text-black text-xs uppercase tracking-[0.2em] font-black rounded-xl hover:scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Publish Video
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
