import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, UserCircle, Camera, Upload, Activity, AlertCircle, Shield, Key, Mail, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';
import { MediaCapture } from '../MediaCapture';
export const EditProfile = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || '',
    city: user?.city || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
    age: user?.age || undefined,
    height: user?.height || '',
    weight: user?.weight || '',
    workout_style: user?.workout_style || '',
    training_goals: user?.training_goals || '',
    fitness_level: user?.fitness_level || 'Intermediate',
    limitations_or_injuries: user?.limitations_or_injuries || '',
    short_bio: user?.short_bio || '',
    motivation: user?.motivation || '',
    profile_images: user?.profile_images || []
  });

  const [securityData, setSecurityData] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    
    const remainingSlots = 10 - (formData.profile_images?.length || 0);
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      return showToast('Maximum limit of 10 profile images reached.', 'error');
    }

    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (const file of filesToUpload as any) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        newUrls.push(publicUrl);
      }

      setFormData(prev => ({ 
        ...prev, 
        profile_images: [...(prev.profile_images || []), ...newUrls],
        profile_image: prev.profile_image || newUrls[0] // Set first as main if none
      }));
      showToast(`${filesToUpload.length} image(s) uploaded!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Error uploading image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData(prev => ({ 
      ...prev, 
      profile_images: prev.profile_images?.filter(u => u !== url),
      profile_image: prev.profile_image === url ? (prev.profile_images?.find(u => u !== url) || '') : prev.profile_image
    }));
    showToast('Image removed.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSecurity = async (type: 'email' | 'password') => {
    try {
      const updates: any = {};
      if (type === 'email') {
        if (!securityData.newEmail) return showToast('Enter new email', 'error');
        updates.email = securityData.newEmail;
      } else {
        if (!securityData.newPassword) return showToast('Enter new password', 'error');
        if (securityData.newPassword !== securityData.confirmPassword) {
          return showToast('Passwords do not match', 'error');
        }
        updates.password = securityData.newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      if (type === 'email') {
        await supabase.from('profiles').update({ email: securityData.newEmail }).eq('id', user.id);
      }

      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} update initiated! Check your inbox.`, 'success');
      setSecurityData({ newEmail: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Error updating security settings', 'error');
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Profile <span className="text-brand-teal">Settings</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Manage your personal data and fitness tracking markers.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all disabled:opacity-50"
        >
          {isSaving ? 'Processing...' : <><Save size={14} /> Save Changes</>}
        </button>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Basic Information */}
        <div className="xl:col-span-2 space-y-8">
          <div className="card-gradient p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <UserCircle size={24} className="text-brand-teal" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Basic Information</h3>
            </div>

            <div className="flex flex-col gap-6">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Identity Asset Protocol (Max 10 Images)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(formData.profile_images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/5 group">
                    <img src={img} alt={`Profile ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    {formData.profile_image === img && (
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-brand-teal text-black text-[8px] font-black uppercase tracking-widest text-center">
                        Main
                      </div>
                    )}
                    {formData.profile_image !== img && (
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, profile_image: img})}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white text-black px-2 py-1 rounded">Set Main</span>
                      </button>
                    )}
                  </div>
                ))}
                {(formData.profile_images?.length || 0) < 10 && (
                  <div className="col-span-2 md:col-span-5 mt-4">
                    <MediaCapture 
                      bucket="avatars"
                      folder={`profiles/${user.id}`}
                      isAvatar={false}
                      onUploadSuccess={(url) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          profile_images: [...(prev.profile_images || []), url],
                          profile_image: prev.profile_image || url
                        }));
                        showToast('Image uploaded successfully!', 'success');
                      }}
                      onUploadError={(err) => showToast(err.message, 'error')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name</label>
                <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors opacity-70 cursor-not-allowed" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Workout Style</label>
                <input type="text" name="workout_style" value={formData.workout_style} onChange={handleChange} placeholder="e.g. Strength, Yoga, HIIT" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Short Bio / Mantra</label>
              <textarea name="short_bio" value={formData.short_bio} onChange={handleChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors resize-none" placeholder="What drives you?" />
            </div>
          </div>
        </div>

        {/* Fitness Information */}
        <div className="space-y-8">
          <div className="card-gradient p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Activity size={24} className="text-brand-coral" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Fitness Data</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Height</label>
                <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 5'10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center focus:border-brand-coral outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Weight</label>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 175 lbs" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center focus:border-brand-coral outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fitness Level</label>
              <select name="fitness_level" value={formData.fitness_level} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors appearance-none outline-none">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced - Elite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Training Goals</label>
              <input type="text" name="training_goals" value={formData.training_goals} onChange={handleChange} placeholder="e.g. Hypertrophy, Mobility" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-coral flex items-center gap-2 font-bold mb-2">
                <AlertCircle size={14} /> Limitations / Injuries
              </label>
              <textarea name="limitations_or_injuries" value={formData.limitations_or_injuries} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors resize-none" placeholder="Describe any current injuries..." />
            </div>
          </div>

          <div className="card-gradient p-10 space-y-8 border-brand-coral/20">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Shield size={24} className="text-brand-coral" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Security Protocol</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">
                  <Mail size={12} /> Email Rotation
                </div>
                <button 
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-3 px-8 py-4 border border-white/10 hover:border-brand-coral/50 bg-white/5 rounded-2xl text-[10px] uppercase tracking-widest font-bold text-white transition-all w-full"
                >
                  <Mail size={16} className="text-brand-coral" /> Request Email Change Sync
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">
                  <Key size={12} /> Access Credentials
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="newPassword"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      placeholder="New Password" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors pr-12 text-white" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="Confirm New Password" 
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors text-white ${
                      securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword ? 'border-brand-coral' : 'border-white/10'
                    }`} 
                  />
                </div>
                {securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword && (
                  <p className="text-[10px] uppercase tracking-widest text-brand-coral font-bold mt-2">Credentials mismatch: Verification required.</p>
                )}
                <button 
                  type="button"
                  disabled={!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword}
                  onClick={() => handleUpdateSecurity('password')}
                  className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-brand-teal transition-all disabled:opacity-50"
                >
                  Authorize Password Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Email Change Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-lg p-12 space-y-10 rounded-[3rem] border border-brand-coral/20 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowEmailModal(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-coral/10 rounded-2xl flex items-center justify-center text-brand-coral mx-auto">
                  <Mail size={32} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-center">Email <span className="text-brand-coral">Rotation</span></h3>
                <p className="text-center text-[10px] uppercase tracking-widest text-white/40 font-bold">Initiate a secure transfer for your primary login credential.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Authorized New Email</label>
                  <input 
                    type="email"
                    name="newEmail"
                    value={securityData.newEmail}
                    onChange={handleSecurityChange}
                    placeholder="Enter new email address"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-coral outline-none transition-colors text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    handleUpdateSecurity('email');
                    setShowEmailModal(false);
                  }}
                  className="flex-1 py-5 bg-brand-coral text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:scale-105 transition-all shadow-glow-coral"
                >
                  Authorize Change
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 py-5 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
