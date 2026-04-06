import React, { useState } from 'react';
import { PlayCircle, Upload, Trash2, X, Save } from 'lucide-react';
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

  const handleSave = () => {
    if (editingVideo) {
      onEdit({
        ...editingVideo,
        visibility_status: 'published'
      } as Video);
      setEditingVideo(null);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Content <span className="text-brand-teal">Library</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage your published videos.</p>
        </div>
        <button 
          onClick={() => setEditingVideo({ title: '', visibility_status: 'draft', level: 'Beginner' })}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
        >
          <Upload size={18} /> Upload Video
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
              <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold mt-1">
                {video.category || 'Unassigned'}
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-brand-black border border-white/10 p-8 rounded-[2rem] space-y-6 relative">
            <button onClick={() => setEditingVideo(null)} className="absolute top-6 right-6 text-white/40 hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Upload Content</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Video Title</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Full Body HIIT Protocol"
                  value={editingVideo.title || ''} 
                  onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Assign to Program (Optional)</label>
                <select
                  value={editingVideo.category || ''}
                  onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white/80"
                >
                  <option value="">No Program</option>
                  <option value="Strength Foundations">Strength Foundations</option>
                  <option value="Mobility Series">Mobility Series</option>
                  <option value="Endurance Protocol">Endurance Protocol</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pb-4">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Video Upload</label>
                <MediaCapture 
                  bucket="fmf-media" 
                  folder="videos" 
                  accept="video/*"
                  onUploadSuccess={(url) => setEditingVideo({ ...editingVideo, video_url: url, thumbnail_url: url })}
                />
                {editingVideo.video_url && <p className="text-[10px] text-brand-teal uppercase font-bold tracking-widest mt-2">{'\u2713'} Video Uploaded</p>}
              </div>

              <button 
                onClick={handleSave}
                disabled={!editingVideo.title || !editingVideo.video_url}
                className="w-full py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
