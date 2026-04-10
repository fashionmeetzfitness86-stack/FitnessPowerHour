import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../supabase';

interface MediaCaptureProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: Error) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  isAvatar?: boolean;
  children?: React.ReactNode;
}

export const MediaCapture: React.FC<MediaCaptureProps> = ({ 
  onUploadSuccess, 
  onUploadError, 
  bucket = 'fmf-media', 
  folder = 'general',
  accept = 'image/*,video/*',
  isAvatar = false,
  children
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Mock progress
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      clearInterval(interval);
      setProgress(100);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUploadSuccess(publicUrl);
      clearPreview();
    } catch (err: any) {
      console.error('Upload Error:', err);
      if (onUploadError) onUploadError(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <div className={`relative ${isAvatar ? 'w-32 h-32 rounded-full overflow-hidden' : 'w-full aspect-video rounded-xl overflow-hidden'} bg-black/50 border border-white/10 mx-auto`}>
          {file?.type.startsWith('video/') ? (
            <video src={preview} className="w-full h-full object-cover" controls playsInline />
          ) : (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          )}
          {uploading && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">{progress}%</div>
                <div className="w-2/3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-teal transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
             </div>
          )}
        </div>
        {!uploading && (
          <div className="flex gap-2 justify-center">
            <button onClick={(e) => { e.preventDefault(); clearPreview(); }} className="p-2 bg-white/5 hover:bg-brand-coral/20 hover:text-brand-coral rounded-lg transition-colors border border-white/10">
              <X size={16} />
            </button>
            <button onClick={(e) => { e.preventDefault(); handleUpload(); }} className="px-6 py-2 bg-brand-teal text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-brand-teal/80 transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> Confirm
            </button>
          </div>
        )}
        {children && !uploading && <div>{children}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        accept={accept} 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={(e) => { e.preventDefault(); cameraInputRef.current?.click() }}
          className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-teal/10 hover:border-brand-teal/50 transition-all text-white/60 hover:text-brand-teal group w-full"
        >
          <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Take Photo</span>
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
          className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-coral/10 hover:border-brand-coral/50 transition-all text-white/60 hover:text-brand-coral group w-full"
        >
          <Upload size={24} className="mb-2 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[9px] uppercase tracking-widest font-black text-white/20">OR URL</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="url" 
            placeholder="Paste image/video URL..." 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-xs outline-none focus:border-brand-teal"
          />
        </div>
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            if (urlInput.trim()) {
              onUploadSuccess(urlInput.trim()); 
              setUrlInput(''); 
            }
          }}
          disabled={!urlInput.trim()}
          className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-teal/20 hover:border-brand-teal/40 hover:text-brand-teal transition-all text-white/60 text-[10px] uppercase tracking-widest font-black disabled:opacity-30 disabled:pointer-events-none"
        >
          Add
        </button>
      </div>
    </div>
  );
};
