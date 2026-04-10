import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Link as LinkIcon, Crop } from 'lucide-react';
import { supabase } from '../supabase';
import Cropper from 'react-easy-crop';

// --- Canvas Helper for Image Cropping ---
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return Promise.reject(new Error('No 2d context'))

  const rotRad = getRadianAngle(rotation)
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height)
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(data, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      const file = new File([blob], 'cropped.jpeg', { type: 'image/jpeg' });
      resolve(file)
    }, 'image/jpeg', 0.9)
  })
}
// ----------------------------------------

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
  
  // Cropping States
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
      
      // If it's an image, trigger cropper
      if (selectedFile.type.startsWith('image/')) {
        setIsCropping(true);
      }
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setIsCropping(false);
  };

  const handleCropCompleteConfirm = async () => {
    if (!preview || !croppedAreaPixels) return;
    try {
      const croppedImageFile = await getCroppedImg(preview, croppedAreaPixels);
      setFile(croppedImageFile);
      setPreview(URL.createObjectURL(croppedImageFile));
      setIsCropping(false);
    } catch (e) {
      console.error('Crop Error:', e);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    try {
      const fileExt = file.name.split('.').pop() || 'jpeg';
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
    if (isCropping) {
      const aspect = isAvatar ? 1 : (folder === 'checkins' ? 3 / 4 : 16 / 9);
      
      return (
        <div className="space-y-4">
          <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden bg-black/80 border border-white/10 mx-auto">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={(cap, capPixels) => setCroppedAreaPixels(capPixels)}
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={(e) => { e.preventDefault(); clearPreview(); }} className="p-2 bg-white/5 hover:bg-brand-coral/20 hover:text-brand-coral rounded-lg transition-colors border border-white/10">
              <X size={16} />
            </button>
            <button onClick={(e) => { e.preventDefault(); handleCropCompleteConfirm(); }} className="px-6 py-2 bg-brand-teal text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-brand-teal/80 transition-colors flex items-center justify-center gap-2">
              <Crop size={16} /> Confirm Crop
            </button>
          </div>
        </div>
      );
    }

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
            <button onClick={(e) => { e.preventDefault(); setIsCropping(true); }} className="p-2 bg-white/5 hover:bg-white/20 text-white/50 hover:text-white rounded-lg transition-colors border border-white/10">
              <Crop size={16} />
            </button>
            <button onClick={(e) => { e.preventDefault(); handleUpload(); }} className="px-6 py-2 bg-brand-teal text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-brand-teal/80 transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> Upload Now
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
