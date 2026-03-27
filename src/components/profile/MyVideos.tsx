import { useState } from 'react';
import { Video, Upload, AlertCircle, Play, X, Calendar as CalIcon } from 'lucide-react';
import { UserProfile } from '../../types';

export const MyVideos = ({ user }: { user: UserProfile }) => {
  const uploadLimit = user.tier === 'Basic' ? 3 : 50; 
  const uploadsUsed = 12; // Static mock for demo
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const mockVideos = [
    { id: '1', title: 'Week 2 Check-in (Hollow Body)', date: '2026-08-14', status: 'approved' },
    { id: '2', title: 'Week 1 Flow Audit', date: '2026-08-07', status: 'approved' },
    { id: '3', title: 'Form check: Front Lever', date: '2026-08-20', status: 'pending' }
  ];

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
      if (uploadsUsed >= uploadLimit) {
        alert('Upload limit reached. Please upgrade your package.');
        return;
      }
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (uploadsUsed >= uploadLimit) {
        alert('Upload limit reached.');
        return;
      }
      setFile(e.target.files[0]);
    }
  };

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
          <button 
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all mb-4"
          >
            <Upload size={14} /> {isUploading ? 'Cancel Upload' : 'Upload Video'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Storage Quota</span>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-teal" 
                style={{ width: `${(uploadsUsed / uploadLimit) * 100}%` }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold {uploadsUsed >= uploadLimit ? 'text-brand-coral' : 'text-brand-teal'}">
              {uploadsUsed}/{uploadLimit}
            </span>
          </div>
        </div>
      </header>

      {isUploading && (
        <div className="card-gradient p-10 border border-brand-teal/30 mb-12">
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
                dragActive ? 'border-brand-teal bg-brand-teal/5' : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              <Video size={48} className="mx-auto text-brand-teal mb-6 opacity-50" />
              <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">Drag & Drop Video</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-8 font-bold">MP4, MOV up to 500MB</p>
              
              <label className="cursor-pointer px-8 py-3 border border-brand-teal text-brand-teal text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-brand-teal/10 transition-all inline-block">
                Browse Files
                <input type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Video size={24} className="text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-tight">{file.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Video Title</label>
                  <input type="text" placeholder="e.g. Daily Check-in Phase 1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Attach to Program (Optional)</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors appearance-none">
                      <option>None</option>
                      <option>30-Day Core Blast</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Purpose</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors appearance-none">
                      <option>Form Check</option>
                      <option>Progress/Transformation</option>
                      <option>General Support</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:bg-white transition-all">Submit Video</button>
                  <button onClick={() => {setFile(null); setIsUploading(false)}} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all border border-white/10">Discard</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Videos Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockVideos.map(vid => (
          <div key={vid.id} className="card-gradient overflow-hidden group cursor-pointer border border-transparent hover:border-brand-teal/30 transition-all rounded-2xl flex flex-col">
            <div className="aspect-video relative bg-brand-black flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent z-10" />
              <img src={`https://picsum.photos/seed/${vid.id}/800/450`} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="thumbnail" />
              <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-brand-teal/80 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                  <Play fill="white" size={20} className="translate-x-0.5 text-white" />
                </div>
              </div>
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-2 py-1 text-[8px] uppercase tracking-widest font-bold rounded ${
                  vid.status === 'approved' ? 'bg-brand-teal/80 text-black' : 'bg-brand-coral/80 text-white'
                }`}>
                  {vid.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-tight line-clamp-2">{vid.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-white/40">
                  <CalIcon size={12} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{new Date(vid.date).toLocaleDateString()}</span>
                </div>
              </div>
              {vid.status === 'approved' && (
                <div className="p-3 bg-brand-teal/10 border border-brand-teal/20 rounded-lg">
                  <p className="text-[10px] text-brand-teal font-light uppercase tracking-widest italic line-clamp-2">"Form looks solid! Keep the tension in your core on descent." - Coach M.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {user.tier === 'Basic' && (
        <div className="p-6 bg-brand-coral/10 border border-brand-coral/30 rounded-xl flex items-center gap-4 mt-8">
          <AlertCircle size={24} className="text-brand-coral shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-coral">Upgrade Required</h4>
            <p className="text-[10px] text-brand-coral/80 uppercase tracking-widest font-bold mt-1">Basic members are limited to {uploadLimit} uploads total. Upgrade to Elite to store up to 50 training videos and form checks.</p>
          </div>
        </div>
      )}
    </div>
  );
};
