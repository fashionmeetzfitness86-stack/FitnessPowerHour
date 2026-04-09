import React, { useState, useMemo } from 'react';
import { PlayCircle, Upload, Trash2, X, Save, CheckCircle2, Search, Filter, Eye, Edit2, CheckSquare, Square, ChevronRight, AlertTriangle, Play } from 'lucide-react';
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
  
  // New Control Center State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk Actions State
  const [bulkTopBar, setBulkTopBar] = useState<'default' | 'category' | 'visibility'>('default');

  const simpleCategories = [
    'Phase 1', 'Phase 2', 'Phase 3', 'Recovery', 'Mobility', 'Full Body', 'Strength', 'General'
  ];
  
  const quickFilterChips = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MOBILITY', 'FULL BODY', 'RECOVERY'];

  // Memoized Search & Filter
  const filteredVideos = useMemo(() => {
    let result = videos;

    if (quickFilter !== 'ALL') {
      const lowerFilter = quickFilter.toLowerCase();
      result = result.filter(v => 
        (v.level?.toLowerCase() === lowerFilter) || 
        (v.category?.toLowerCase() === lowerFilter)
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title?.toLowerCase().includes(q) || 
        v.category?.toLowerCase().includes(q) || 
        v.level?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
        // Mock reverse to simulate newest first assuming they come sorted chronologically
      result = [...result];
    }

    return result;
  }, [videos, quickFilter, searchQuery, sortBy]);

  const handleSave = () => {
    if (editingVideo) {
      onEdit({
        ...editingVideo,
        visibility_status: 'published'
      } as Video);
      setEditingVideo(null);
      setShowAdvanced(false);
      setUploadMode('upload');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedVideos(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };
  
  const handleBulkDelete = () => {
      selectedVideos.forEach(id => onDelete(id));
      setSelectedVideos([]);
      setBulkTopBar('default');
  };

  const handleBulkCategory = (category: string) => {
      selectedVideos.forEach(id => {
          const v = videos.find(vid => vid.id === id);
          if (v) onEdit({ ...v, category });
      });
      setSelectedVideos([]);
      setBulkTopBar('default');
  };

  const handleBulkVisibility = (is_premium: boolean) => {
      selectedVideos.forEach(id => {
          const v = videos.find(vid => vid.id === id);
          if (v) onEdit({ ...v, is_premium });
      });
      setSelectedVideos([]);
      setBulkTopBar('default');
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      
      {/* 🟢 1. HEADER (CONTROL BAR) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Content <span className="text-brand-teal">Library</span></h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">Total Assets: {videos.length}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full lg:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-brand-teal text-white transition-all"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/80 outline-none w-full md:w-auto appearance-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>

          <button 
            onClick={() => setEditingVideo({ title: '', category: 'General', is_premium: false, level: 'Beginner', visibility_status: 'draft' })}
            className="w-full md:w-auto px-8 py-3 bg-brand-teal text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-105 transition-all whitespace-nowrap shadow-md"
          >
            <Upload size={16} /> Add Video
          </button>
        </div>
      </div>

      {/* 🟡 2. QUICK FILTER CHIPS */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
        {quickFilterChips.map(chip => (
          <button 
            key={chip}
            onClick={() => setQuickFilter(chip)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border ${
              quickFilter === chip 
              ? 'bg-brand-teal text-black border-transparent shadow-brand-teal/20' 
              : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 🔥 BULK ACTIONS TOP BAR */}
      {selectedVideos.length > 0 && (
        <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-2xl p-4 flex items-center justify-between text-brand-coral animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <CheckSquare size={18} />
            <span className="text-sm font-black uppercase tracking-widest">{selectedVideos.length} Selected</span>
          </div>
          
          <div className="flex items-center gap-3">
             {bulkTopBar === 'default' && (
                 <>
                    <button onClick={() => setBulkTopBar('category')} className="px-4 py-2 bg-black/50 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 border border-white/10">Change Category</button>
                    <button onClick={() => setBulkTopBar('visibility')} className="px-4 py-2 bg-black/50 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 border border-white/10">Change Visibility</button>
                    <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 border border-red-500/20">Delete All</button>
                 </>
             )}
             {bulkTopBar === 'category' && (
                 <div className="flex gap-2">
                     <select onChange={e => handleBulkCategory(e.target.value)} className="bg-black text-white text-xs px-3 py-1 outline-none border border-white/10 rounded">
                         <option value="">Select Category...</option>
                         {simpleCategories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <button onClick={() => setBulkTopBar('default')} className="text-white/50 hover:text-white px-2"><X size={16}/></button>
                 </div>
             )}
             {bulkTopBar === 'visibility' && (
                 <div className="flex gap-2">
                     <button onClick={() => handleBulkVisibility(false)} className="bg-black border border-white/10 text-white px-3 py-1 text-xs rounded hover:border-brand-teal">Set General</button>
                     <button onClick={() => handleBulkVisibility(true)} className="bg-black border border-white/10 text-brand-teal px-3 py-1 text-xs rounded hover:border-brand-teal">Set Members</button>
                     <button onClick={() => setBulkTopBar('default')} className="text-white/50 hover:text-white px-2"><X size={16}/></button>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* 🔵 3. VIDEO GRID */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20">
          <PlayCircle size={48} className="text-white/20 mb-6" />
          <h3 className="text-2xl font-black uppercase tracking-tight">No videos found</h3>
          <p className="text-white/40 text-sm mt-2 max-w-md">Get started by uploading your first training protocol or adjust your filters.</p>
          <button 
            onClick={() => setEditingVideo({ title: '', category: 'General', is_premium: false, level: 'Beginner', visibility_status: 'draft' })}
            className="mt-6 px-8 py-4 bg-white/5 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
             Add First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => {
            const isSelected = selectedVideos.includes(video.id);

            return (
            <div key={video.id} className={`relative overflow-hidden rounded-[2rem] border transition-all flex flex-col justify-between group bg-[#111] ${isSelected ? 'border-brand-coral shadow-[0_0_20px_rgba(232,116,97,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
              
              {/* Select Overlay Header */}
              <div className="absolute top-3 left-3 z-20 flex gap-2">
                 <button onClick={() => toggleSelect(video.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md shadow-md border transition-all ${isSelected ? 'bg-brand-coral text-black border-brand-coral' : 'bg-black/50 text-white/40 border-white/10 hover:text-white hover:bg-black'}`}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                 </button>
              </div>

              {/* Status Visibility Overlay */}
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                 <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-md backdrop-blur-md shadow-lg ${video.is_premium ? 'bg-brand-teal text-black' : 'bg-white/10 text-white'}`}>
                    {video.is_premium ? 'Member Area' : 'General'}
                 </span>
              </div>

              {/* Delete Affirm Overlay */}
              {deletingId === video.id && (
                  <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                      <AlertTriangle size={32} className="text-red-500 mb-4" />
                      <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Are you sure?</h4>
                      <div className="flex gap-4 w-full">
                          <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl">Cancel</button>
                          <button onClick={() => { onDelete(video.id); setDeletingId(null); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase rounded-xl shadow-lg">Delete</button>
                      </div>
                  </div>
              )}

              {/* Thumbnail Area */}
              <div className="aspect-video bg-black relative rounded-t-[2rem] overflow-hidden group">
                <video 
                  src={video.video_url} 
                  className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'opacity-30' : 'opacity-80 group-hover:scale-105 group-hover:opacity-100'}`} 
                  poster={video.thumbnail_url} 
                  preload="none"
                />
                
                {/* Center Hover Action */}
                {!isSelected && (
                    <button onClick={() => window.open(video.video_url, '_blank')} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 text-brand-teal hover:scale-110">
                        <PlayCircle size={48} fill="currentColor" className="text-black drop-shadow-2xl" />
                    </button>
                )}
              </div>
              
              {/* Content Area */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-lg uppercase tracking-tight line-clamp-2 leading-tight mb-3">{video.title || 'Untitled'}</h3>
                
                <div className="flex flex-wrap gap-2 mt-auto mb-5">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest rounded">{video.duration || '0 MIN'}</span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-brand-coral text-[9px] font-bold uppercase tracking-widest rounded">{video.level || 'Beginner'}</span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-brand-teal text-[9px] font-bold uppercase tracking-widest rounded">{video.category || 'General'}</span>
                </div>

                {/* Direct Card Actions */}
                <div className="grid grid-cols-2 gap-2 mt-auto border-t border-white/5 pt-4">
                    <button 
                        onClick={() => setEditingVideo(video)} 
                        className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        <Edit2 size={14} /> Edit
                    </button>
                    <button 
                        onClick={() => setDeletingId(video.id)} 
                        className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
              </div>

            </div>
          )})}
        </div>
      )}
      
      {/* 🧠 FAST EDIT PANEL (SIDEBAR) */}
      {editingVideo && (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingVideo(null)} />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 z-[210] w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Edit Video</h3>
                    <button onClick={() => setEditingVideo(null)} className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Scroll Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    
                    {/* Media Preview */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/10 group">
                        {editingVideo.video_url ? (
                            <>
                                <video src={editingVideo.video_url} className="w-full h-full object-cover opacity-80" poster={editingVideo.thumbnail_url} />
                                <button className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all text-transparent hover:text-brand-teal">
                                    <Edit2 size={32} />
                                </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                <Upload size={32} className="mb-2" />
                            </div>
                        )}
                        
                        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex justify-between items-center z-20">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Change Asset</span>
                            <div className="flex gap-2">
                                <button onClick={() => setUploadMode('upload')} className={`text-[10px] px-2 py-1 rounded ${uploadMode==='upload' ? 'bg-brand-teal text-black' : 'text-white'}`}>File</button>
                                <button onClick={() => setUploadMode('link')} className={`text-[10px] px-2 py-1 rounded ${uploadMode==='link' ? 'bg-brand-teal text-black' : 'text-white'}`}>URL</button>
                            </div>
                        </div>
                    </div>

                    {uploadMode === 'upload' ? (
                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                            <MediaCapture bucket="fmf-media" folder="videos" accept="video/*" onUploadSuccess={(url) => setEditingVideo({ ...editingVideo, video_url: url, thumbnail_url: url })} />
                        </div>
                    ) : (
                        <input type="url" placeholder="Paste Video URL..." value={editingVideo.video_url || ''} onChange={e => setEditingVideo({ ...editingVideo, video_url: e.target.value, thumbnail_url: editingVideo.thumbnail_url || e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white transition-all"/>
                    )}

                    {/* Fast Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Video Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Upper Body Burnout"
                                value={editingVideo.title || ''} 
                                onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                className="w-full bg-transparent border-b-2 border-white/10 px-0 py-3 text-2xl font-black uppercase tracking-tight outline-none focus:border-brand-teal text-white transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Category</label>
                                <select
                                    value={editingVideo.category || 'General'}
                                    onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-brand-teal text-white/80 transition-all appearance-none uppercase tracking-widest font-bold"
                                >
                                    {simpleCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Visibility</label>
                                <select
                                    value={editingVideo.is_premium ? 'members' : 'general'}
                                    onChange={e => setEditingVideo({ ...editingVideo, is_premium: e.target.value === 'members' })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-brand-teal text-brand-coral transition-all appearance-none uppercase tracking-widest font-bold"
                                >
                                    <option value="general">General Access</option>
                                    <option value="members">Members Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Difficulty Level</label>
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setEditingVideo({ ...editingVideo, level: lvl as any })}
                                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    editingVideo.level === lvl 
                                        ? 'bg-white text-black shadow-sm' 
                                        : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    {lvl}
                                </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Duration</label>
                            <input 
                                type="text" 
                                placeholder="eg: 45 MIN"
                                value={editingVideo.duration || ''} 
                                onChange={e => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white uppercase tracking-widest font-bold placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description / Notes</label>
                            <textarea 
                                rows={4}
                                value={editingVideo.description || ''} 
                                onChange={e => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal text-white resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-[#050505] flex gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={!editingVideo.title || !editingVideo.video_url}
                        className="flex-1 py-5 bg-brand-teal text-black text-xs uppercase tracking-[0.2em] font-black rounded-2xl hover:scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};
