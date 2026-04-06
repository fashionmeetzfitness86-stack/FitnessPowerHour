import React, { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, Check, ArrowRight,
  Shield, Globe, MessageSquare, Instagram, Image as ImageIcon, Video as VideoIcon
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { MediaCapture } from './MediaCapture';

export const AthleteApplication = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'calisthenics',
    bio: '',
    experience: '',
    instagram: '',
    tiktok: '',
    images: [] as string[],
    videos: [] as string[]
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="pt-40 pb-32 px-6 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center space-y-8 card-gradient p-12">
          <Shield size={48} className="mx-auto text-brand-coral" />
          <h2 className="text-3xl font-bold uppercase tracking-tighter">Access <span className="text-brand-coral">Restricted</span></h2>
          <p className="text-white/40 uppercase tracking-widest text-[10px] leading-relaxed">
            You must be logged in to apply as an FMF Athlete. Please sign in or create an account to proceed.
          </p>
          <button onClick={() => navigate('/auth')} className="btn-primary w-full">Sign In</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.experience || !formData.bio || !formData.instagram) {
      showToast('Please complete all required fields.', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const social_links = {
        instagram: formData.instagram.replace('@', ''),
        tiktok: formData.tiktok ? formData.tiktok.replace('@', '') : undefined
      };

      const { error } = await supabase.from('athlete_applications').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        category: formData.category,
        bio: formData.bio,
        experience: formData.experience,
        social_links,
        images: formData.images,
        videos: formData.videos,
        status: 'pending'
      });

      if (error) throw error;

      setIsSuccess(true);
      showToast('Application submitted successfully!', 'success');
    } catch (err: any) {
      console.error('Application error:', err);
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    if (formData.images.length >= 5) {
      showToast('Maximum 5 photos allowed', 'warning');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
  };

  const handleVideoUpload = (url: string) => {
    if (formData.videos.length >= 3) {
      showToast('Maximum 3 videos allowed', 'warning');
      return;
    }
    setFormData(prev => ({ ...prev, videos: [...prev.videos, url] }));
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-32 px-6 flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 card-gradient p-12"
        >
          <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto text-brand-teal">
            <Check size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Your application has been submitted</h2>
            <p className="text-white/40 uppercase tracking-widest text-[10px] leading-relaxed">
              Thank you for your interest in joining the FMF Athletes. Our Super Admin team will review your credentials. If approved, you will automatically be elevated to Athlete status.
            </p>
            <button onClick={() => window.location.href = '#/'} className="btn-primary w-full max-w-xs py-4">Return Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 space-y-6 text-center">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Join the Athletes</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Apply to Become an <span className="text-brand-coral">Athlete</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
            Become an FMF Athlete and lead the movement. Elevate your status, create programs, and help users master their discipline.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-12">
            <form onSubmit={handleSubmit} className="card-gradient p-10 md:p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      readOnly
                      type="email"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none text-white/40 cursor-not-allowed"
                      value={formData.email}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Fitness Category</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="calisthenics">Calisthenics</option>
                      <option value="yoga">Yoga</option>
                      <option value="recovery">Recovery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Instagram Handle</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">TikTok Handle <span className="text-white/20 lowercase">(optional)</span></label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white"
                    placeholder="@username"
                    value={formData.tiktok}
                    onChange={e => setFormData({...formData, tiktok: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Experience Description</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none text-white"
                    placeholder="Detail your coaching or athletic experience and certifications..."
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Short Bio</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none text-white"
                    placeholder="Tell us about your motivation, vision, and training philosophy..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex justify-between">
                      <span className="ml-2">Upload Photos (Max 5)</span>
                      <span className="text-brand-teal">{formData.images.length}/5</span>
                    </label>
                    <MediaCapture 
                      bucket="fmf-media" 
                      folder={`applications/${user?.id}/images`}
                      accept="image/*"
                      onUploadSuccess={handleImageUpload}
                    />
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.images.map((img, i) => (
                           <div key={i} className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                              <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                              <div onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <span className="text-[8px] text-brand-coral uppercase font-black">DEL</span>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex justify-between">
                      <span className="ml-2">Upload Videos (Max 3)</span>
                      <span className="text-brand-coral">{formData.videos.length}/3</span>
                    </label>
                    <MediaCapture 
                      bucket="fmf-media" 
                      folder={`applications/${user?.id}/videos`}
                      accept="video/*"
                      onUploadSuccess={handleVideoUpload}
                    />
                    {formData.videos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.videos.map((vid, i) => (
                           <div key={i} className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center text-white/20">
                              <VideoIcon size={20} />
                              <div onClick={() => setFormData(p => ({ ...p, videos: p.videos.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <span className="text-[8px] text-brand-coral uppercase font-black">DEL</span>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 mt-8 bg-brand-teal text-black rounded-2xl text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all shadow-[0_20px_40px_rgba(45,212,191,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Processing Application...</>
                ) : (
                  <>
                    Submit Application <ArrowRight size={18} />
                  </>
                )}
              </button>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
