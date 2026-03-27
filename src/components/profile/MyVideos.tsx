import React, { useState, useEffect } from 'react';
import { Video, Upload, AlertCircle, Play, X, Calendar as CalIcon, Camera, Weight, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';
import { UserProfile, UserVideoUpload } from '../../types';

export const MyVideos = ({ user, showToast }: { user: UserProfile, showToast: (msg: string, type?: any) => void }) => {
  const isBasic = user.tier === 'Basic';
  const uploadLimit = isBasic ? 3 : 50; 
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UserVideoUpload[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const [uploadMeta, setUploadMeta] = useState({
    title: '',
    purpose: 'Form Check',
    programId: '',
    previousWeight: '',
    currentWeight: '',
    duration: '1 day'
  });

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_video_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchUploads();
  }, [user?.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const isVideo = selectedFile.type.startsWith('video/');
    if (isBasic && isVideo) {
      showToast('Video uploads restricted. Upgrade to Elite for video support.', 'error');
      return;
    }
    if (selectedFile.size > 500 * 1024 * 1024) {
      showToast('Maximum file size is 500MB.', 'error');
      return;
    }
    if (uploads.length >= uploadLimit) {
      showToast(`Storage limit reached (${uploadLimit} items).`, 'error');
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!file || !user) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `user-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const isVideo = file.type.startsWith('video/');
      const newUpload: Partial<UserVideoUpload> = {
        user_id: user.id,
        media_type: isVideo ? 'video' : 'photo',
        file_url: publicUrl,
        thumbnail_url: publicUrl, 
        caption: uploadMeta.title || file.name,
        previous_weight: uploadMeta.previousWeight,
        current_weight: uploadMeta.currentWeight,
        media_date: new Date().toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: uploadMeta.purpose
      };

      const { error: dbError } = await supabase
        .from('user_video_uploads')
        .insert(newUpload);

      if (dbError) throw dbError;

      setUploadProgress(100);
      showToast('Transmission received. Awaiting administrative review.', 'success');
      setFile(null);
      setUploadMeta({ title: '', purpose: 'Form Check', programId: '', previousWeight: '', currentWeight: '', duration: '1 day' });
      fetchUploads();
    } catch (error: any) {
      showToast(error.message || 'Transmission failed.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const filteredUploads = uploads.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'form-checks') return u.description?.includes('Form Check');
    if (activeTab === 'progress') return u.description?.includes('Progress');
    return true;
  });

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            My <span className="text-brand-teal">Videos</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Upload progress check-ins and form audit requests.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-4 mb-4">
             <div className="flex gap-2">
                {['all', 'form-checks', 'progress'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest font-black transition-all ${activeTab === tab ? 'bg-brand-teal text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Storage Quota</span>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-teal transition-all duration-500" 
                style={{ width: `${(uploads.length / uploadLimit) * 100}%` }}
              />
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${uploads.length >= uploadLimit ? 'text-brand-coral' : 'text-brand-teal'}`}>
              {uploads.length}/{uploadLimit}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Upload Interface */}
        <div className="xl:col-span-1 space-y-6">
          <div className="card-gradient p-8 space-y-8 border-brand-teal/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal border border-brand-teal/20">
                <Upload size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Initialize Transmission</h3>
            </div>

            {!file ? (
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
                  dragActive ? 'border-brand-teal bg-brand-teal/5' : 'border-white/5 bg-white/[0.02] hover:border-brand-teal/40 cursor-pointer'
                }`}
              >
                <div className="flex justify-center gap-4 mb-6">
                  <Camera size={32} className="text-white/10" />
                  <Video size={32} className={isBasic ? "text-white/5" : "text-white/10"} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Protocol Ready</h4>
                <p className="text-[8px] uppercase tracking-widest text-white/20 mb-8 max-w-[180px] mx-auto font-bold text-center">
                  {isBasic ? 'Image sync authorized. Upgrade to Elite for video support.' : 'Authorizing media sync up to 500MB.'}
                </p>
                
                <label className="cursor-pointer block">
                  <span className="w-full py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all inline-block">
                    Search Local Media
                  </span>
                  <input type="file" accept={isBasic ? "image/*" : "image/*,video/*"} className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                  {uploadProgress > 0 && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-brand-teal transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  )}
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-brand-teal">
                    {file.type.startsWith('image/') ? <Camera size={20} /> : <Video size={20} />}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white truncate">{file.name}</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 text-white/20 hover:text-brand-coral">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Protocol Label</label>
                    <input 
                      type="text" 
                      value={uploadMeta.title}
                      onChange={e => setUploadMeta({...uploadMeta, title: e.target.value})}
                      placeholder="e.g. 30-Day Check-in" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest text-white focus:border-brand-teal outline-none transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Weight Shift</label>
                       <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Prev" 
                          value={uploadMeta.previousWeight}
                          onChange={e => setUploadMeta({...uploadMeta, previousWeight: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-center focus:border-brand-teal outline-none text-white font-mono" 
                        />
                        <input 
                          type="text" 
                          placeholder="Current" 
                          value={uploadMeta.currentWeight}
                          onChange={e => setUploadMeta({...uploadMeta, currentWeight: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-center focus:border-brand-teal outline-none text-white font-mono" 
                        />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Active Logic</label>
                      <select 
                        value={uploadMeta.purpose}
                        onChange={e => setUploadMeta({...uploadMeta, purpose: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest text-white focus:border-brand-teal outline-none appearance-none"
                      >
                        <option>Form Check</option>
                        <option>Progress</option>
                        <option>Mastery</option>
                      </select>
                    </div>
                  </div>

                  {!file.type.startsWith('image/') && (
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-2">Duration Protocol</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['1 day', '3 days', '1 wk', '1 mo'].map(d => (
                          <button 
                            key={d}
                            type="button"
                            onClick={() => setUploadMeta({...uploadMeta, duration: d})}
                            className={`py-2 text-[7px] uppercase tracking-widest font-black rounded-lg border transition-all ${
                              uploadMeta.duration === d ? 'bg-brand-teal text-black border-brand-teal' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="w-full py-5 bg-brand-teal text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-[1.5rem] shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isUploading ? 'Synchronizing Media...' : 'Authorize Upload'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="xl:col-span-2 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video bg-white/5 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : filteredUploads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredUploads.map((vid, i) => (
                  <motion.div 
                    key={vid.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-gradient overflow-hidden group border border-white/5 hover:border-brand-teal/30 transition-all rounded-[3rem] flex flex-col shadow-2xl"
                  >
                    <div className="aspect-video relative bg-brand-black flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent z-10 opacity-60" />
                      {vid.media_type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 relative">
                           <Video size={48} className="text-brand-teal/20" />
                           <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-brand-teal text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.4)] scale-90 group-hover:scale-100 transition-transform">
                              <Play fill="black" size={24} className="translate-x-1" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={vid.file_url} 
                          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" 
                          alt="thumbnail" 
                        />
                      )}
                      
                      <div className="absolute top-6 left-6 z-20 flex gap-2">
                        <span className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black rounded-full backdrop-blur-md border ${
                          vid.status === 'approved' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-500'
                        }`}>
                          {vid.status}
                        </span>
                        {vid.description?.includes('Form Check') && (
                          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-[8px] uppercase tracking-widest font-black rounded-full text-white/60">
                            Form Audit
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-8 flex-grow space-y-6 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h4 className="font-black text-sm uppercase tracking-tight text-white/90 group-hover:text-brand-teal transition-colors line-clamp-1">{vid.caption}</h4>
                          <div className="flex items-center gap-4 mt-2 text-white/20">
                            <div className="flex items-center gap-1">
                              <CalIcon size={12} />
                              <span className="text-[9px] uppercase tracking-widest font-bold font-mono">{new Date(vid.created_at).toLocaleDateString()}</span>
                            </div>
                            {vid.current_weight && (
                              <div className="flex items-center gap-1">
                                <Weight size={12} />
                                <span className="text-[9px] uppercase tracking-widest font-bold font-mono">{vid.current_weight} lbs</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-xl text-white/10 hover:text-white transition-all shrink-0"><ChevronRight size={18} /></button>
                      </div>

                      {vid.status === 'approved' ? (
                        <div className="p-5 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl space-y-3">
                          <p className="text-[10px] text-brand-teal/60 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <CheckCircle size={12} /> Coach Transmission
                          </p>
                          <p className="text-[10px] text-white/60 font-light italic leading-relaxed line-clamp-2">"Administrative audit complete. Alignment is within optimized parameters. Maintain intensity."</p>
                        </div>
                      ) : (
                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 italic opacity-40">
                          <Clock size={14} className="text-white/40" />
                          <p className="text-[10px] uppercase tracking-widest font-bold">Awaiting Clearance...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-24 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
               <Video size={48} className="mx-auto text-white/5 mb-6" />
               <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">Matrix empty. No media transmissions located.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
